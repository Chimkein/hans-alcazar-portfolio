import { after } from "next/server";
import { systemPrompt } from "@/lib/knowledge";

export const runtime = "nodejs";

/**
 * The assistant endpoint.
 *
 * Groq first, Gemini if Groq fails — the same fallback shape Hans built into AI
 * Content Generator, for the same reason: a free tier that rate-limits should
 * degrade, not go down.
 *
 * Model choice is not arbitrary. Both Groq chat models are reasoning models:
 * gpt-oss spends its token budget in a separate `reasoning` channel and returns
 * empty content unless `reasoning_effort` is capped, and qwen emits raw <think>
 * blocks inline. `reasoning_effort: "low"` is what makes gpt-oss usable here.
 *
 * The key lives only on the server. It is never prefixed NEXT_PUBLIC_.
 */

const MAX_MESSAGES = 10;
const MAX_CHARS = 500;
const MAX_TOKENS = 500;

/** Per-IP throttle. In-memory, so it resets on cold start — the hard caps above
 *  are the real ceiling. Swap for Upstash if this ever gets genuinely abused. */
const WINDOW_MS = 10 * 60 * 1000;
/** 20 was low enough that an engaged recruiter working through the record hit
 *  the wall — which is precisely the visitor this exists for. The ceiling is
 *  meant to stop abuse, not curiosity. */
const MAX_PER_WINDOW = 40;
const hits = new Map<string, number[]>();

function throttled(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

type Msg = { role: "user" | "assistant"; content: string };

/**
 * Write the exchange to Supabase so Hans can read what people ask.
 *
 * The table is INSERT-only by design: no SELECT policy exists, so this key can
 * write a conversation and can never read one back. Verified — a select with
 * this key returns 200 and zero rows while the row is plainly in the table.
 *
 * That is also why it appends rather than upserts. PostgREST needs SELECT to
 * resolve ON CONFLICT, and granting it would let anyone holding the publishable
 * key dump every visitor's conversation. Each exchange writes its own row
 * carrying the whole transcript, so the newest row per session is complete.
 *
 * If SUPABASE_URL is ever unset, logging silently stops — and the "conversations
 * are saved" line in TestPoint.tsx must come out with it.
 *
 * Messages and timestamps only — no IP, no device, no location. That is the
 * whole point of the RLS policy on the table too: the site can insert and
 * update, and cannot read a single row back. The publishable key is effectively
 * public, so a select policy would let anyone dump every visitor's conversation.
 *
 * Fire and forget. A logging failure must never cost the visitor their answer.
 */
async function logConversation(sessionId: string, messages: Msg[]) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || !sessionId) return;
  try {
    await fetch(`${url}/rest/v1/portfolio_conversations`, {
      method: "POST",
      headers: {
        apikey: key,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ session_id: sessionId, messages }),
    });
  } catch {
    /* logging is best-effort */
  }
}

/**
 * SSE frames do not respect network chunk boundaries. One frame can arrive
 * split mid-JSON, so the parser has to hold the trailing fragment until the
 * read that completes it. Without that, JSON.parse throws on both halves and
 * every word in that frame silently vanishes from the answer — which is what
 * shipped, and what only surfaced once Vercel's chunking replaced localhost's.
 *
 * Stateful for exactly that reason: one parser per response, never shared.
 */
function makeSSEParser(pick: (o: unknown) => string | undefined) {
  let buffer = "";

  return function feed(chunk: string): string {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? ""; // incomplete tail — wait for the next read
    let out = "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        out += pick(JSON.parse(payload)) ?? "";
      } catch {
        /* genuinely malformed frame — skip it */
      }
    }
    return out;
  };
}

/** Carries the upstream status, so the caller can tell "rate limited" — which
 *  clears on its own in seconds — apart from "actually broken". */
function upstreamError(name: string, status: number) {
  return Object.assign(new Error(`${name} ${status}`), { status });
}

function statusOf(e: unknown): number {
  return typeof e === "object" && e !== null && "status" in e
    ? Number((e as { status: unknown }).status) || 0
    : 0;
}

async function groq(messages: Msg[]) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      reasoning_effort: "low",
      max_tokens: MAX_TOKENS,
      temperature: 0.4,
      stream: true,
      messages: [{ role: "system", content: systemPrompt() }, ...messages],
    }),
  });
  if (!res.ok || !res.body) throw upstreamError("groq", res.status);
  return { body: res.body, pick: (o: unknown) =>
      (o as { choices?: { delta?: { content?: string } }[] }).choices?.[0]?.delta?.content };
}

async function gemini(messages: Msg[]) {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=" +
    process.env.GEMINI_API_KEY;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt() }] },
      generationConfig: { maxOutputTokens: MAX_TOKENS, temperature: 0.4 },
      contents: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    }),
  });
  if (!res.ok || !res.body) throw upstreamError("gemini", res.status);
  return { body: res.body, pick: (o: unknown) =>
      (o as { candidates?: { content?: { parts?: { text?: string }[] } }[] })
        .candidates?.[0]?.content?.parts?.[0]?.text };
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "local";

  if (throttled(ip)) {
    return new Response("You've hit the limit for now — email hans.s.alcazar@gmail.com and he'll answer directly.", { status: 429 });
  }

  let messages: Msg[];
  let sessionId = "";
  try {
    const body = (await req.json()) as { messages?: Msg[]; sessionId?: string };
    sessionId = String(body.sessionId ?? "").slice(0, 64);
    messages = (body.messages ?? [])
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-MAX_MESSAGES)
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return new Response("Bad request", { status: 400 });
  }
  if (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY) {
    return new Response("The assistant isn't configured yet.", { status: 503 });
  }

  let source: Awaited<ReturnType<typeof groq>>;
  try {
    source = await groq(messages);
  } catch (first) {
    try {
      source = await gemini(messages);
    } catch (second) {
      // Both free tiers rate-limit, and both recover within seconds. Telling a
      // visitor the assistant is "unavailable" when it is merely busy reads as
      // broken, and they do not come back to check.
      const busy = statusOf(first) === 429 || statusOf(second) === 429;
      return new Response(
        busy
          ? "Cookie is getting a lot of questions at the moment. Give it a few seconds and ask again."
          : "The assistant is unavailable right now. Hans can be reached at hans.s.alcazar@gmail.com.",
        { status: busy ? 503 : 502, headers: busy ? { "Retry-After": "10" } : undefined }
      );
    }
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = source.body.getReader();

  /**
   * Pump eagerly in `start` rather than reactively in `pull`.
   *
   * With `pull`, a chunk that decodes to no text (SSE keep-alives, the opening
   * role delta, a frame split mid-JSON) enqueues nothing, and the stream sits
   * waiting to be pulled again instead of reading the next chunk — the response
   * hangs open until the client times out. Draining the upstream in a loop has
   * no such stall.
   */
  /**
   * The answer accumulates out here rather than inside `start`, because two
   * other things need to read it: `cancel`, when the visitor closes the tab
   * mid-sentence, and the logging pass below.
   */
  let answer = "";
  let settle: () => void = () => {};
  const finished = new Promise<void>((resolve) => {
    settle = resolve;
  });

  /**
   * Log with `after`, not with a bare fetch in `finally`.
   *
   * The response is over the moment the stream closes, and the platform is free
   * to freeze the invocation at that point — a fetch started on the way out can
   * be killed in flight, and the conversation disappears with no error anywhere.
   * `after` is the supported way to hold work open past the response.
   *
   * The race is a backstop: if the stream somehow never settles, log what we
   * have rather than hanging until the function times out.
   */
  after(async () => {
    await Promise.race([
      finished,
      new Promise((r) => setTimeout(r, 30_000)),
    ]);
    await logConversation(sessionId, [
      ...messages,
      { role: "assistant", content: answer },
    ]);
  });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const feed = makeSSEParser(source.pick);

      const emit = (text: string) => {
        if (!text) return;
        answer += text;
        controller.enqueue(encoder.encode(text));
      };

      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          emit(feed(decoder.decode(value, { stream: true })));
        }
        // A last frame can arrive without its terminating newline.
        emit(feed("\n"));
      } catch {
        /* upstream cut out mid-answer — close with what we have */
      } finally {
        controller.close();
        settle();
      }
    },
    cancel() {
      reader.cancel();
      settle();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
