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

## Status

**Live: https://hans-alcazar.vercel.app** — Vercel project `chimkein/hans-alcazar`,
deployed from this repository.

All five environment variables are set, for Production and Preview:

| Variable | What it drives |
|---|---|
| `GROQ_API_KEY` | Cookie's primary model |
| `GEMINI_API_KEY` | Cookie's fallback |
| `SUPABASE_URL` | Chat history — `https://zdvjqnqhfumnbqrnorvx.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | Chat history — can insert, cannot read back |
| `NEXT_PUBLIC_SITE_URL` | `https://hans-alcazar.vercel.app` |

`NEXT_PUBLIC_SITE_URL` is the one that matters for search: it drives the
canonical link, the sitemap, robots.txt, Open Graph and the JSON-LD. It is baked
in at build time, so changing it takes a redeploy, not just a settings edit.

## Cookie's knowledge

All twelve `PERSONAL` fields are answered, compiled from
[KNOWLEDGE-INTERVIEW.md](KNOWLEDGE-INTERVIEW.md).

Several of the answers were directives rather than facts — never quote a salary
figure, offer the résumé on hiring interest, deflect personal questions politely,
never give an address more precise than the general area. Those live in the
prompt rules in [src/lib/knowledge.ts](src/lib/knowledge.ts) rather than in the
data blob, because a rule the model is told to follow holds better than a fact it
is invited to paraphrase.

The salary range Hans gave is deliberately not in the prompt at all. The only
reliable way to stop a model quoting a number is for it never to see one.

The avocado capstone answers come from the research paper itself — the real
title (Evergreen), the team, the 43% postharvest-loss figure that motivates it,
and the measured results — so the assistant can go deeper than the page does.

## Still to do

### Housekeeping

- Delete the test rows from `portfolio_conversations` (`wiring-check`, `e2e-…`,
  `verify-…`, `prod-…`). The table has no SELECT policy by design, so this has to
  happen in the Supabase SQL editor.
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

**Capstone screenshots.** The four avocado captures come from sources only
370–415px wide, so they are soft on a retina display. Recapturing them at native
resolution is the one remaining quality win on the page.

**Résumé.** `public/Hans-Alcazar-Resume.pdf` is generated, not hand-placed. Edit
the content in [tools/resume.py](tools/resume.py) and run `python tools/resume.py`
to rebuild it — it needs `reportlab`, and it writes straight into `public/`. The
filename is referenced in `PROFILE.resume`, so keep it as it is.

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
