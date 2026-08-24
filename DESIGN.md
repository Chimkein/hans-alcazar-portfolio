# Design — The Board Fab Drawing

Written from the built sheet, not ahead of it. Seed `a31e1295`.

## The idea

The page is a **PCB fabrication drawing**. Not a portfolio decorated with circuit
motifs — the drawing's actual grammar carries the content, and every section maps
to a real artifact on a fab sheet:

| Heading  | Ref     | Fab-drawing artifact    | Why it fits                                                           |
| -------- | ------- | ----------------------- | --------------------------------------------------------------------- |
| Overview | `U1`    | Component + silkscreen  | The part the board is built around                                     |
| Skills   | `BOM`   | **Bill of materials**   | A parts table with designators — better than a grid of pills           |
| About    | `NOTES` | **Fabrication notes**   | Numbered notes are how a drawing says what prose can't dimension       |
| Projects | `U2–U4` | **Component footprints** | Three modules on one board, each with leads, a pin-1 dot and a ref     |
| Contact  | `J1–J4` | **Connectors**          | Social profiles are literally ports off the board                      |
| Footer   | —       | **Title block**         | Drawn by / title / sheet / rev — how every drawing closes              |

It refuses the arrangement this category ships: dark hero, oversized name,
three-card project grid, tech-stack pills, "Get in touch" footer.

### Labelling — the conceit annotates, it never replaces

The `<h2>` is always the plain section name (**Skills**, **About**, **Projects**,
**Contact**). The drawing's own term rides on the right of the legend rule as the
annotation: `BOM · Skills · … · Bill of materials · 13 items`.

This is deliberate and was corrected once. Shipping "Bill of materials" and
"Component footprints" *as* the headings cost more than it bought:

- A recruiter scanning for Skills and Projects could not find them.
- The net trace already called those sections Skills and Projects, so the same
  section carried two different names depending on where you looked.
- The heading text is what screen readers, the document outline and search
  engines see.

Same principle governs `SW1`: the switch positions read LIGHT / DARK, not
DRAWING / BOARD. **Designators and drawing vocabulary are annotation. Anything a
visitor must read to navigate or operate the page says the ordinary word.**

Designators are unique across the sheet — `U1` is the portrait, so the projects
run `U2`–`U4`. A drawing that reuses a reference has stopped being a reference.

## Two states of one board

Light and dark are not a palette swap, they are the same object at two stages.

- **Light — THE DRAWING.** Plotted on white paper. Graphite legend type,
  hairline gold traces, a plot grid.
- **Dark — THE BOARD.** The manufactured article. Solder-mask ground, ENIG gold
  pads and traces, silkscreen-white type.

The switch is labelled `SW1 · LIGHT / DARK`, and the portrait changes with it
— barong on the drawing, suit on the board — because the sheet is one thing in
two states, so everything on it moves together.

Light is the default. The use scene decides it: a recruiter opens this on a phone
in daylight, or at a bright desk, with the résumé PDF already open in the next tab.

## Tokens

Defined in [src/app/globals.css](src/app/globals.css); never hardcode these values.

| Token        | Light (drawing) | Dark (board) | Use                                              |
| ------------ | --------------- | ------------ | ------------------------------------------------ |
| `--paper`    | `#ffffff`       | `#0a0d0c`    | Page ground                                      |
| `--panel`    | `#faf9f5`       | `#101413`    | Seated surfaces — pads, footprints               |
| `--ink`      | `#14171a`       | `#e8ebe7`    | Primary type                                     |
| `--ink-2`    | `#3f464d`       | `#9aa39d`    | Body copy — 9.6:1 light, well over the AA floor  |
| `--ink-3`    | `#5a6068`       | `#858d87`    | Small labels — 6.4:1 light, 5.7:1 dark           |
| `--gold`     | `#c9a227`       | `#c9a227`    | **Non-text only.** Traces, pads, outlines        |
| `--gold-ink` | `#7a5d0a`       | `#e3be63`    | Gold **as type** — 6.2:1 light, 11:1 dark        |
| `--gold-deep`| `#6b5109`       | `#a8871d`    | Control hover — `--paper` text reads 7.5:1 / 5.7:1|
| `--hover`    | `#14171a13`     | `#0000008c`  | Hover wash — darkens whatever sits behind it     |
| `--rule`     | `#e4e1d7`       | `#232927`    | Hairline rules and dividers                      |

**The gold rule that matters:** `#c9a227` measures 2.4:1 on white — it fails even
large-text contrast. So gold-the-material (borders, traces, pads, the switch
throw) and gold-the-type (`--gold-ink`) are two different tokens. Never set text
in `--gold` on the light sheet.

## Type

One superfamily plus a mono. Archivo is a grotesque drawn for legibility at text
sizes — tall x-height, open apertures — which is what holds up over the plot grid.

- **Archivo Narrow** — the silkscreen voice. Section legends, designators,
  display headlines, buttons. Uppercase, `0.14em` tracking. `.legend` / `.display`.
- **Archivo** — body copy. `.prose-board` caps the measure at 68ch.
- **Spline Sans Mono** — data only: reference designators, values, handles,
  counts. Tabular numerals on. `.data`. Monospace is for measurement here, never
  for "technical" atmosphere.

`.legend-mixed` exists for one reason: brand names in the BOM keep their real
capitalisation. Silkscreen is uppercase, but "N8N" and "NEXT.JS" are wrong.

### Never alias a font through `@theme`

The semantic names `--font-legend` / `--font-body` / `--font-data` are declared in
a plain `body { … }` rule, **not** in `@theme`. This is load-bearing and cost a
whole build to find:

`@theme inline` substitutes a value into the utilities Tailwind generates and
**never emits the custom property**. So `var(--font-body)` resolved to nothing,
which made the entire `font-family` declaration invalid at computed-value time —
and an invalid `var()` makes the property inherit rather than error. Every
element silently fell back to the system sans stack. The page rendered in Segoe
UI for the whole first phase of the build while claiming a three-family system.

The colour tokens escaped this only because they are declared in `:root` first
and *aliased* in `@theme` second.

They sit on `body` rather than `:root` because that is where `next/font` puts
`--font-archivo` and friends; on `:root` those are undefined.

**Verify fonts by computed style, never by screenshot** — a fallback stack at
display size with heavy tracking looks close enough to the intended face to pass
a visual check:

```js
getComputedStyle(document.querySelector("h1")).fontFamily; // must start with "Archivo Narrow"
```

## The ground

Corner fiducials — the registration targets a board is aligned by — over a very
quiet plot grid ([src/components/BoardField.tsx](src/components/BoardField.tsx)).

The ground was chosen from ten candidates (routed copper, plot grid, drafting
dots, copper pour, drill map, sheet frame, fine pitch, solder resist,
routed-over-pour, clear field) shown on a scratch `/backgrounds` route and judged
against real body copy rather than as empty swatches. That route is deleted; the
full variant set is archived outside the repo, since this project is not under
version control and there is no history to recover it from.

The clear field won, then the grid was asked back — **tuned, not restored**:

| Token          | Light                      | Dark                          |
| -------------- | -------------------------- | ----------------------------- |
| `--grid-major` | `rgba(201,162,39,0.11)`    | `rgba(201,162,39,0.10)`       |
| `--grid-fine`  | `rgba(20,23,26,0.028)`     | `rgba(232,235,231,0.025)`     |

96px major lattice over a 16px fine field, at roughly **1.1:1** against paper —
far under the lightest text on the page, which sits at 6.4:1. That ratio is the
whole point. Every earlier attempt failed because the grid was pitched near the
weight of a hairline rule, which put it in competition with the copy; the first
fix reached for a `--veil` wash over the texture, which was treating the symptom.

If it ever reads heavy again, lower `--grid-major` — do not add a veil, and do
not weaken the type.

### Why four SVGs and not one

The corner marks are four fixed-size SVGs, not a single viewBox stretched to the
viewport. A full-page SVG scaled to fit either crops the marks away
(`preserveAspectRatio="slice"`) or squashes the circles into ovals (`none`).

`.board` still carries `isolation: isolate`. That is load-bearing: it gives the
fixed `-z-10` field a stacking context so it paints above the page background and
beneath every piece of content. `isolation` is chosen over `transform` / `filter`
/ `will-change`, which would also create the context but would additionally make
`.board` the containing block for the fixed net trace and the fixed field.

Never reach for `.board > * { position: relative; z-index: 1 }` to solve a
layering problem here — it overrides `position: fixed` on the net trace and the
mobile progress bar, dropping both into normal flow. That shipped once: the rail
went full-bleed and pushed the header ~290px down the page, and it only shows
above `xl` where the rail is visible.

## Board hardware

- `.pad` — gold-outlined seated surface.
- `.via` — the 13px plated hole that anchors each section in the net trace.
- `.btn` — gold outline with a lead pad bleeding off each side. Primary fills gold
  with ink-coloured leads. Elevation is declared **once**, as a border. No shadows
  on outlined elements.
- Radii stay at 1–2px. This world is rectilinear; the 12–16px card radius does not
  belong to it, and neither do cards.

### Hover goes darker, in both themes

Hover is a *darkening*, never a lightening — the row reads as pressed into the
board rather than lifted off it. Two tokens carry it:

- **`--hover`** is a translucent wash applied with `hover:bg-[var(--hover)]`, so
  it darkens the plot grid underneath instead of covering it with a flat panel.
  Used on BOM rows, connector rows and the cross-reference chips.
- **`--gold-deep`** is the control hover: `.btn` and `.btn-primary` both fill with
  it and flip their label to `--paper`. It is darker than `--gold` in *both*
  themes, which `--gold-ink` is not — that token goes brighter on the board.

Write the wash as `hover:bg-[var(--hover)]`, not as a theme colour. `hover` is a
variant namespace in Tailwind, so `--color-hover` invites a `bg-hover` utility
that reads as a collision; the arbitrary value is unambiguous and always emits.

## Signature interaction — the net trace

One continuous gold conductor runs the entire sheet
([src/components/NetTrace.tsx](src/components/NetTrace.tsx)). The run above your
position is energised gold, the run below stays hairline, and each section's via
lights as you reach it. On desktop it lives in the left margin as the sheet index;
below `xl` it collapses to a hairline progress trace across the top edge.

It is the page's only persistent position indicator, which is why there is no
sticky header.

## Motion

One authored moment: the **theme transition**. 520ms cubic-bezier(0.16, 1, 0.3, 1)
across background, border and colour, with the two portraits cross-fading on the
same curve. Everything else is functional — the trace energising, hover states.
`prefers-reduced-motion` collapses all of it.

The portrait swap is pure CSS on the `.dark` class. No JavaScript, so it cannot
flash the wrong portrait during hydration.

## Icons

Two systems, deliberately separate:

- **Interface arrows** — authored SVG, 1.5 stroke, square caps
  ([src/components/Icons.tsx](src/components/Icons.tsx)). No Unicode glyphs: `↗`
  fell back to a tofu box in Saira Condensed, which is exactly why the rule exists.
- **Part symbols** — real brand geometry baked in from `simple-icons` (a
  devDependency, so it never ships)
  ([src/components/BrandIcons.tsx](src/components/BrandIcons.tsx)). Rendered
  monochrome in ink, gold on hover. A row of vendor colours would break the
  two-colour system. SQL has no vendor mark, so its symbol is authored in the
  same filled 24×24 grammar.

## Content rules

All facts live in [src/lib/content.ts](src/lib/content.ts). Nothing is written
into markup.

- Every claim traces to something real — the résumé, or source read from the repos.
- Unknowns carry `pending: true` and render as a visible `[pending]` state rather
  than a dead link. **Never replace a pending value with a plausible guess.**
- BOM designators (`L1`, `F2`, `N3`) are cross-referenced by the project
  footprints. That is what keeps them functional rather than decorative numbering
  — if the cross-reference ever goes away, the designators should too.

## What this design will not do

- No cards as page structure, and no nested cards.
- No kicker or eyebrow above a heading.
- No gradient text, no glass, no decorative blur.
- No hero-metric template — the honest numbers here are "10+ clients" and "3
  projects", and neither deserves a stat row.
- No invented screenshots, demos, testimonials or metrics.
