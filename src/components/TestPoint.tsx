"use client";

import { useEffect, useRef, useState } from "react";
import { PROFILE, RESUME_TOKEN } from "@/lib/content";
import { ArrowDown, ArrowUpRight } from "@/components/Icons";

type Turn = { role: "user" | "assistant"; content: string; resume?: boolean };

const GREETING =
  "Hi — I'm Cookie, Hans's assistant. I can tell you about his projects, what he works with, or what he's looking for next. How can I help?";

const SEEN_KEY = "cookie-seen";
const SESSION_KEY = "cookie-session";

/**
 * sessionStorage is not merely empty when a browser blocks storage — Safari
 * with "Block All Cookies", some private modes, and sandboxed frames throw on
 * access. One of those reads happens in an effect, and an effect that throws
 * with no error boundary above it takes the whole page down, not just the chat.
 *
 * Losing the session id costs a grouped transcript. It must never cost the page.
 */
function readStore(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStore(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* storage blocked or full — not worth a crash */
  }
}

/**
 * crypto.randomUUID exists only in a secure context, so it is missing over
 * plain http — which is exactly how you'd open the dev server from a phone on
 * the same wifi — and on Safari before 15.4. The fallback is not
 * cryptographically strong, and does not need to be: it groups one visitor's
 * turns in a log, nothing more.
 */
function uuid(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `s-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/** Groups one visitor's turns into a single logged conversation. */
function sessionId(): string {
  let id = readStore(SESSION_KEY);
  if (!id) {
    id = uuid();
    writeStore(SESSION_KEY, id);
  }
  return id;
}

const STARTERS = [
  "What has he actually built?",
  "How did the capstone work?",
  "Is he available for work?",
  "Can I see his résumé?",
];

/**
 * TP1 — the sheet's test point.
 *
 * On a board a test point is the exposed pad you put a probe on to ask the
 * circuit what it is doing, which is exactly what this is. It reads as board
 * hardware rather than a bolted-on chat bubble: a plated via that opens into a
 * plate with the same silkscreen header, hairline rules and pin-1 dot as every
 * footprint on the page.
 *
 * The assistant is labelled as an assistant. Visitors are told, in the header,
 * that they are not talking to Hans.
 */
export function TestPoint() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [unseen, setUnseen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);

  // Cookie's greeting lands a beat after load, so the dot reads as a new
  // message arriving rather than as decoration that was always there.
  // setState inside the timeout is async, so it never fires during the effect.
  useEffect(() => {
    if (readStore(SEEN_KEY)) return;
    const id = setTimeout(() => setUnseen(true), 1400);
    return () => clearTimeout(id);
  }, []);

  function reveal() {
    setOpen(true);
    setUnseen(false);
    writeStore(SEEN_KEY, "1");
  }

  // Escape closes; focus moves into the field on open
  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // keep the newest turn in view as it streams
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [turns]);

  async function send(text: string) {
    const question = text.trim().slice(0, 500);
    if (!question || busy) return;

    const next: Turn[] = [...turns, { role: "user", content: question }];
    setTurns([...next, { role: "assistant", content: "" }]);
    setDraft("");
    setBusy(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId(),
          messages: next.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok || !res.body) {
        const why = await res.text();
        setTurns([
          ...next,
          { role: "assistant", content: why || "Something went wrong." },
        ]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const wantsResume = acc.includes(RESUME_TOKEN);
        setTurns([
          ...next,
          {
            role: "assistant",
            content: acc.replaceAll(RESUME_TOKEN, "").trim(),
            resume: wantsResume,
          },
        ]);
      }
    } catch {
      setTurns([
        ...next,
        {
          role: "assistant",
          content: `The assistant could not be reached. ${PROFILE.email} always works.`,
        },
      ]);
    } finally {
      setBusy(false);
      input.current?.focus();
    }
  }

  return (
    <>
      {/* TP1 — the probe pad */}
      <button
        type="button"
        onClick={reveal}
        aria-expanded={open}
        aria-label={
          unseen ? "Cookie has a message — open the assistant" : "Ask Cookie about Hans"
        }
        className={`group fixed bottom-5 right-5 z-[60] flex items-center gap-2.5 border border-gold bg-panel px-3.5 py-3 transition-colors hover:bg-[var(--hover)] md:bottom-7 md:right-7 ${
          open ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <span
          aria-hidden="true"
          className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-gold"
        >
          <span className="h-1 w-1 rounded-full bg-gold" />
        </span>
        <span className="legend text-[0.5625rem] text-ink">TP1 · Cookie</span>
        {unseen ? (
          <span
            aria-hidden="true"
            className="absolute -right-1.5 -top-1.5 flex h-3 w-3 items-center justify-center"
          >
            <span className="absolute h-3 w-3 animate-ping rounded-full bg-gold opacity-60 motion-reduce:animate-none" />
            <span className="relative h-2.5 w-2.5 rounded-full border border-paper bg-gold" />
          </span>
        ) : null}
      </button>

      {/* the plate */}
      {open ? (
        <div
          ref={panel}
          role="dialog"
          aria-modal="false"
          aria-label="Cookie — Hans's assistant"
          className="themed plot-in fixed bottom-5 right-5 z-[60] flex max-h-[min(34rem,calc(100vh-2.5rem))] w-[min(23rem,calc(100vw-2.5rem))] flex-col border border-gold bg-paper md:bottom-7 md:right-7"
        >
          <span
            aria-hidden="true"
            className="absolute left-3 top-3 h-2 w-2 rounded-full border border-gold bg-paper"
          />

          <header className="flex items-baseline gap-3 border-b border-gold/45 py-3 pl-9 pr-3">
            <span className="legend shrink-0 text-[0.5625rem] text-gold-ink">
              TP1
            </span>
            <h2 className="legend text-[0.6875rem] text-ink">Cookie</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close the assistant"
              className="legend ml-auto -my-1 shrink-0 px-2 py-1 text-[0.5625rem] text-ink-3 transition-colors hover:text-ink"
            >
              Close
            </button>
          </header>

          <p className="border-b border-rule px-4 py-2.5 text-[0.6875rem] leading-relaxed text-ink-3">
            Cookie is an AI assistant, not Hans. It answers from his own notes,
            and says so when it doesn&apos;t know. Conversations are saved so
            Hans can see what people ask.
          </p>

          <div
            ref={log}
            className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
            aria-live="polite"
            aria-atomic="false"
          >
            {turns.map((t, i) => (
              <div key={i}>
                <div className="legend mb-1.5 text-[0.5rem] text-ink-3">
                  {t.role === "user" ? "You" : "Cookie"}
                </div>
                {/* One paragraph per line break. The reply arrived as a single
                    <p>, and HTML collapses newlines to spaces, so a long answer
                    landed as one unbroken slab no matter how the model set it
                    out. Splitting on any run of newlines rather than on blank
                    lines only means a break appears whether the model separates
                    with one newline or two. */}
                <div
                  className={
                    t.role === "user" ? "border-l border-gold pl-3" : undefined
                  }
                >
                  {(t.content ? t.content.split(/\n+/) : []).map((para, p) => (
                    <p
                      key={p}
                      className={`text-[0.875rem] leading-relaxed ${
                        p > 0 ? "mt-3" : ""
                      } ${t.role === "user" ? "text-ink" : "text-ink-2"}`}
                    >
                      {para}
                    </p>
                  ))}
                  {!t.content && busy && i === turns.length - 1 ? (
                    <p className="text-[0.875rem] leading-relaxed text-ink-2">…</p>
                  ) : null}
                </div>

                {t.resume ? (
                  <a
                    href={PROFILE.resume}
                    download
                    className="btn mt-3 !py-2 !text-[0.6875rem]"
                  >
                    Résumé
                    <ArrowDown className="h-3 w-3" />
                  </a>
                ) : null}
              </div>
            ))}

            {turns.length === 1 ? (
              <div className="space-y-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="block w-full border border-gold/40 px-3 py-2.5 text-left text-[0.8125rem] text-ink-2 transition-colors hover:border-gold hover:bg-[var(--hover)] hover:text-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
            className="flex items-center gap-2 border-t border-rule p-3"
          >
            <input
              ref={input}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={500}
              disabled={busy}
              placeholder="Ask anything about his work…"
              aria-label="Your question"
              className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-[0.875rem] text-ink placeholder:text-ink-3 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={busy || !draft.trim()}
              aria-label="Send question"
              className="flex h-8 w-8 shrink-0 items-center justify-center border border-gold text-gold-ink transition-colors hover:bg-[var(--hover)] disabled:opacity-35"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
