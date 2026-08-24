# Portfolio — Hans Stephen G. Alcazar

A single-page portfolio built as a PCB fabrication drawing. Next.js (App Router),
TypeScript, Tailwind CSS v4. Light and dark are the same board at two stages —
the plotted drawing, and the manufactured article.

See [DESIGN.md](DESIGN.md) for the visual system and [PRODUCT.md](PRODUCT.md) for
the product record.

## Run it

```bash
npm run dev
```

Then open http://localhost:3000.

```bash
npm run build
```

## Before you publish

### 1. Put this under version control — do this first

There is **no git repository here**. No history, no branches, no way to undo a
bad edit, and no backup if the folder is lost. `.gitignore` is already written
and covers `.env*.local`, so the API keys will not be committed.

```bash
git init && git add -A && git commit -m "Portfolio: board fab drawing"
```

### 2. Set the environment variables in Vercel

Settings → Environment Variables. All five, for Production and Preview:

| Variable | Where it comes from |
|---|---|
| `GROQ_API_KEY` | Cookie's primary model |
| `GEMINI_API_KEY` | Cookie's fallback |
| `SUPABASE_URL` | Chat history — `https://zdvjqnqhfumnbqrnorvx.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | Chat history — the anon key |
| `NEXT_PUBLIC_SITE_URL` | **Your real domain, no trailing slash** |

`NEXT_PUBLIC_SITE_URL` is the one that matters for search: it drives the
canonical link, the sitemap, robots.txt, Open Graph and the JSON-LD. The
fallback in [src/lib/content.ts](src/lib/content.ts) is a guess, and if it is
wrong Google will canonicalise your page to a host that does not exist.

Everything in `.env.local` already works locally — this step is only for the
deployed site.

### 3. Answer the interview

[KNOWLEDGE-INTERVIEW.md](KNOWLEDGE-INTERVIEW.md) — currently **0 of 12** fields
filled, so Cookie only knows what is printed on the page. Ask it "is he
available for work?" today and it correctly says it does not know. That is the
honest behaviour working, but the interview is what makes the assistant worth
having.

### 4. Make the two repos public

The Source buttons point at `github.com/Chimkein/ai-content-generator` and
`github.com/Chimkein/lifeflow`. If those are private they 404 for visitors.

### 5. Housekeeping

- Delete my test rows from `portfolio_conversations` (`wiring-check`, `e2e-…`, `verify-…`).
- `incoming/` holds the four raw capstone screenshots. It is gitignored and can go.

## Cookie — the assistant

TP1, bottom right. A test point is the pad you probe to ask a board what it is
doing, which is what this is.

- **Route:** [src/app/api/ask/route.ts](src/app/api/ask/route.ts). Groq
  `openai/gpt-oss-120b` first, Gemini `gemini-2.5-flash` on failure. Streaming.
  Keys are server-side only and never prefixed `NEXT_PUBLIC_`.
- **`reasoning_effort: "low"` is load-bearing.** Both Groq chat models are
  reasoning models; without the cap, gpt-oss spends its whole token budget in the
  reasoning channel and returns empty content.
- **Knowledge:** [src/lib/knowledge.ts](src/lib/knowledge.ts). No vector store —
  the corpus is a couple of thousand tokens and goes straight into the system
  prompt, which is cheaper and far more reliable at this size. It answers only
  from `content.ts` plus the interview, and says so when it cannot.
- **Résumé:** the model emits a token the client swaps for a real download
  control, so the link cannot be hallucinated.
- **Guardrails:** 500-char input, 500-token replies, 10 messages, 20 requests per
  IP per 10 minutes. Verified to refuse prompt injection, off-topic requests, and
  to decline inventing experience it does not have.
- **Chat history:** append-only into Supabase. The key can INSERT and cannot
  SELECT — verified. If you ever unset `SUPABASE_URL`, remove the "conversations
  are saved" line from `TestPoint.tsx` too; a privacy notice that is not true is
  worse than none.

## SEO

Handled: canonical URL, description, keywords, Open Graph + Twitter card with a
1200×630 preview (`public/og.png`, composed in the board's own vocabulary),
`sitemap.xml`, `robots.txt`, and **Person structured data** built from the same
`content.ts` the page renders — job title, both schools, all thirteen skills as
`knowsAbout`, and every social profile as `sameAs`, so a search for your name can
resolve to a rich result rather than a bare link.

Also load-bearing for ranking and already in place: one `<h1>`, correct heading
order, `main`/`nav`/`header`/`footer` landmarks, real `alt` text on every image,
and a static page with no client-side data fetching.

## Optional, but worth it

**Screenshots.** There are none on disk for any of the three projects, so the
project footprints are typographic by design. If you capture a few, the footprint
component has room for a media slot beside the detail list — that would lift the
projects section more than any other single change.

**Résumé.** `public/Hans-Alcazar-Resume.pdf` is a copy of
`Hans_Alcazar_Resume.pdf` as of the build date. Replace the file when you update
the résumé; the filename is referenced in `PROFILE.resume`.

## Where things live

```
src/
  app/
    page.tsx        all five sections
    layout.tsx      fonts, metadata, direction contract
    globals.css     the whole design system — tokens, board hardware, motion
  components/
    NetTrace.tsx    the gold conductor + scroll position
    Portrait.tsx    U1 — the barong/suit cross-fade
    ThemeToggle.tsx SW1 — drawing/board switch
    BrandIcons.tsx  part symbols (generated, see DESIGN.md)
    Icons.tsx       authored interface arrows
    Logo.tsx        the H monogram, re-inked per theme
  lib/
    content.ts      every fact on the page
```

## A note on the logo

You sent `1.svg` and `2.svg` in the order dark-then-light, but they are the other
way round: `1.svg` is the black H (needs a light ground) and `2.svg` is the white
H (needs a dark ground). Shipping them as sent would have made the logo invisible
in both themes.

Rather than pick one, the monogram is rebuilt from your geometry in `Logo.tsx`
and re-inks itself from tokens: the bars and front slash take the sheet's ink,
the offset back slash takes `--paper` — white on the drawing, near-black on the
board. That is the same relationship your two files had, so the notch reads
correctly in both themes from a single component.
