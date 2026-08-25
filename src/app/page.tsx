import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Portrait } from "@/components/Portrait";
import { NetTrace, SheetIndex } from "@/components/NetTrace";
import { ArrowUpRight, ArrowDown, ArrowUp } from "@/components/Icons";
import { BrandIcon } from "@/components/BrandIcons";
import { Shots } from "@/components/Shots";
import { BoardField } from "@/components/BoardField";
import { TestPoint } from "@/components/TestPoint";
import { Reveal } from "@/components/Reveal";
import {
  PROFILE,
  BOM,
  PROJECTS,
  NOTES,
  CONNECTORS,
  type Project,
} from "@/lib/content";

/* ── the sheet's own legend row ─────────────────────────────────────── */
/**
 * The heading is the plain section name — Skills, About, Projects, Contact —
 * because that is what a visitor scans for, and it is what the net trace calls
 * the same section.
 *
 * The right-hand annotation used to expand the designator, which meant it spent
 * itself saying nothing: BOM sat opposite "Bill of materials", and NOTES opposite
 * "Fabrication notes · 6 notes", which lands the same word three times in one
 * line. The designator already carries the drawing's vocabulary. So the right
 * side now carries only what the left cannot — how much of the thing there is,
 * or where it stands.
 */
function Rule({
  code: designator,
  title,
  note,
}: {
  code: string;
  title: string;
  note: string;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b border-gold/45 pb-3">
      {/* fixed column: designators run 23-35px wide, so letting the title
          follow them naturally staggered every heading on the sheet by up to
          12px. A drawing lines its designators up. */}
      <span className="legend w-12 shrink-0 text-[0.625rem] text-gold-ink">
        {designator}
      </span>
      <h2 className="legend text-[1rem] text-ink">{title}</h2>
      <span className="legend ml-auto shrink-0 text-[0.5625rem] text-ink-3">
        {note}
      </span>
    </div>
  );
}

function Section({
  id,
  children,
  className = "",
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      data-reveal=""
      className={`mx-auto w-full max-w-[76rem] scroll-mt-20 px-6 py-14 md:px-10 md:py-20 ${className}`}
    >
      {children}
    </section>
  );
}

/* ── a BOM reference chip, cross-linked back to the skills table ────── */
function Ref({ code }: { code: string }) {
  const item = BOM.find((b) => b.ref === code);
  return (
    <a
      href="#skills"
      title={item ? `${code} — ${item.part}` : code}
      className="data inline-flex items-center gap-2 border border-gold/45 px-2.5 py-1.5 text-[0.6875rem] text-ink-2 transition-colors hover:border-gold hover:bg-[var(--hover)] hover:text-ink"
    >
      {item ? (
        <BrandIcon part={item.part} className="h-3.5 w-3.5 text-gold-ink" />
      ) : null}
      <span className="text-gold-ink">{code}</span>
      <span>{item?.part ?? ""}</span>
    </a>
  );
}

/* ── one project, drawn as a component footprint ────────────────────── */
function Footprint({ project }: { project: Project }) {
  return (
    <article className="themed relative border border-rule bg-panel/45">
      {/* leads down the outer edge */}
      <div
        aria-hidden="true"
        className="absolute -left-[7px] top-8 bottom-8 hidden flex-col justify-between sm:flex"
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className="block h-[3px] w-[13px] bg-gold/70" />
        ))}
      </div>

      {/* pin-1 */}
      <span
        aria-hidden="true"
        className="absolute left-4 top-4 h-2 w-2 rounded-full border border-gold bg-paper"
      />

      <div className="grid gap-8 p-6 pt-14 sm:p-9 sm:pt-14 lg:grid-cols-[10rem_1fr] lg:gap-12 lg:p-12">
        {/* designator rail */}
        <div className="flex flex-row items-baseline gap-4 lg:flex-col lg:items-start lg:gap-3">
          <span className="display text-[2.5rem] leading-none text-gold-ink lg:text-[3.5rem]">
            {project.ref}
          </span>
          <div className="flex flex-col gap-1">
            <span className="legend text-[0.5625rem] text-ink-3">
              {project.year}
            </span>
            <span className="legend text-[0.5625rem] leading-relaxed text-ink-2">
              {project.kind}
            </span>
          </div>
        </div>

        <div>
          <h3 className="display text-[1.75rem] leading-[1.05] text-ink sm:text-[2.25rem]">
            {project.name}
          </h3>
          <p className="prose-board mt-4 text-[1.0625rem] text-ink-2">
            {project.summary}
          </p>

          {project.shots ? (
            <Shots
              shots={project.shots}
              name={project.name}
              frame={project.shotFrame}
            />
          ) : null}

          <ul className="mt-7 space-y-3.5">
            {project.detail.map((d, i) => (
              <li key={i} className="flex gap-3.5">
                <span
                  aria-hidden="true"
                  className="mt-[0.6rem] h-px w-4 shrink-0 bg-gold"
                />
                <span className="prose-board text-[0.9375rem] text-ink-2">
                  {d}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-1.5">
            {project.uses.map((u) => (
              <Ref key={u} code={u} />
            ))}
          </div>

          {project.links.length > 0 ? (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {project.links.map((l) =>
                l.pending ? (
                  <span
                    key={l.label}
                    className="legend inline-flex items-center gap-2 border border-dashed border-ink-3/60 px-4 py-2.5 text-[0.6875rem] text-ink-3"
                    title="Not deployed yet — add the URL in src/lib/content.ts"
                  >
                    {l.label}
                    <span className="data text-[0.625rem]">[pending]</span>
                  </span>
                ) : (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn"
                  >
                    {l.label}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )
              )}
            </div>
          ) : null}

          {project.linkNote ? (
            <p className="mt-8 max-w-[52ch] border-l border-gold pl-4 text-[0.875rem] leading-relaxed text-ink-2">
              {project.linkNote}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/* ── page ───────────────────────────────────────────────────────────── */
export default function Home() {
  const classes = ["LANGUAGE", "FRAMEWORK", "INFRASTRUCTURE"] as const;

  return (
    <div className="board themed min-h-screen">
      <BoardField />
      <NetTrace />
      <Reveal />
      <SheetIndex />
      <TestPoint />

      {/* ── sheet header ─────────────────────────────────────────── */}
      <header className="mx-auto flex w-full max-w-[76rem] items-center justify-between gap-6 px-6 py-7 md:px-10">
        <div className="flex items-center gap-3.5">
          <Logo className="h-9 w-9 text-ink" />
          <div className="flex flex-col leading-none">
            <span className="legend text-[0.6875rem] text-ink">
              {PROFILE.name}
            </span>
            <span className="legend mt-1.5 hidden text-[0.5625rem] text-ink-3 sm:inline">
              {PROFILE.degreeShort} · {PROFILE.batch}
            </span>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main>
      {/* ── U1 · OVERVIEW ────────────────────────────────────────── */}
      <Section id="overview" className="!pt-6 md:!pt-10">
        <div className="grid items-center gap-12 md:grid-cols-[1fr_14rem] md:gap-12 lg:grid-cols-[1fr_20rem] lg:gap-20">
          <div className="plot-in">
            <h1 className="display text-[clamp(2.75rem,9.5vw,6rem)] text-ink">
              Fullstack
              <br />
              &amp; AI Engineer
            </h1>

            <div className="mt-6 flex items-center gap-3.5">
              <span aria-hidden="true" className="h-px w-12 bg-gold" />
              <span className="legend text-[0.625rem] text-gold-ink">
                {PROFILE.roleNote} · CpE {PROFILE.batch}
              </span>
            </div>

            <p className="prose-board mt-9 text-[1.125rem] leading-relaxed text-ink-2 sm:text-[1.1875rem]">
              {PROFILE.statement}
            </p>

            <div className="mt-11 flex flex-wrap items-center gap-4">
              <a href="#projects" className="btn btn-primary">
                View work
              </a>
              <a
                href={PROFILE.resume}
                download
                className="btn"
                aria-label="Download résumé as PDF"
              >
                Résumé
                <ArrowDown className="h-3.5 w-3.5" />
              </a>
            </div>

          </div>

          <div className="plot-in">
            <Portrait />
          </div>
        </div>

        {/* the dimension row — spans the whole sheet under both columns */}
        <dl className="mt-12 grid grid-cols-2 gap-x-10 gap-y-7 border-t border-rule pt-8 md:mt-14 md:grid-cols-4">
          {[
            ["Based in", PROFILE.location],
            ["Degree", PROFILE.degree],
            ["University", PROFILE.school],
            ["Focus", "Web · Embedded · AI"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="legend text-[0.5625rem] text-ink-3">{k}</dt>
              <dd className="mt-2 text-[0.8125rem] leading-snug text-ink-2">
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* ── BOM · SKILLS ─────────────────────────────────────────── */}
      <Section id="skills">
        <Rule
          code="BOM"
          title="Skills"
          note={`${BOM.length} items`}
        />

        <div className="space-y-11">
          {classes.map((klass) => {
            const items = BOM.filter((b) => b.klass === klass);
            return (
              <div key={klass}>
                <div className="mb-5 flex items-baseline gap-4">
                  <span className="legend text-[0.5625rem] text-ink-3">
                    {klass}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-rule"
                  />
                  <span className="data text-[0.625rem] text-ink-3">
                    {String(items.length).padStart(2, "0")}
                  </span>
                </div>

                <ul>
                  {items.map((item) => (
                    <li
                      key={item.ref}
                      className="group grid grid-cols-[2.25rem_2.25rem_1fr] items-center gap-x-4 gap-y-2 border-b border-rule py-4 transition-colors last:border-b-0 hover:bg-[var(--hover)] sm:grid-cols-[2.25rem_2.25rem_10rem_1fr] sm:gap-x-6"
                    >
                      <span className="data text-[0.75rem] text-gold-ink">
                        {item.ref}
                      </span>
                      {/* the part symbol, seated on its own pad */}
                      <span className="flex h-9 w-9 items-center justify-center border border-gold/40 transition-colors group-hover:border-gold">
                        <BrandIcon
                          part={item.part}
                          className="h-[1.125rem] w-[1.125rem] text-ink-2 transition-colors group-hover:text-gold-ink"
                        />
                      </span>
                      <span className="legend-mixed text-[0.9375rem] text-ink">
                        {item.part}
                      </span>
                      <span className="col-span-3 text-[0.875rem] leading-snug text-ink-2 sm:col-span-1">
                        {item.note}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── NOTES · ABOUT ────────────────────────────────────────── */}
      <Section id="about">
        <Rule
          code="NOTES"
          title="About"
          note={`${NOTES.length} entries`}
        />

        <ol className="grid gap-x-16 gap-y-9 lg:grid-cols-2">
          {NOTES.map((note) => (
            <li key={note.n} className="flex gap-5">
              <span className="data mt-[0.2rem] shrink-0 text-[0.75rem] text-gold-ink">
                {String(note.n).padStart(2, "0")}
              </span>
              <p className="prose-board text-[0.9375rem] text-ink-2">
                {note.text}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── U2–U4 · PROJECTS ─────────────────────────────────────── */}
      <Section id="projects">
        <Rule
          code="U2–U4"
          title="Projects"
          note={`${PROJECTS.length} footprints`}
        />

        <div className="space-y-8">
          {PROJECTS.map((p) => (
            <Footprint key={p.ref} project={p} />
          ))}
        </div>
      </Section>

      {/* ── J1–J5 · CONTACT ──────────────────────────────────────── */}
      <Section id="contact">
        <Rule
          code="J1–J5"
          title="Contact"
          note="Open for work"
        />

        <div className="grid gap-14 lg:grid-cols-[1fr_28rem] lg:gap-20">
          <div>
            <p className="display text-[clamp(1.75rem,4.5vw,2.75rem)] leading-[1.05] text-ink">
              Looking for a junior
              <br />
              fullstack or AI role
            </p>
            <p className="prose-board mt-6 text-[1rem] text-ink-2">
              Open to junior developer, internship and freelance work — remote,
              or on-site around Cebu. The fastest way to reach me is email.
            </p>

            <a
              href={`mailto:${PROFILE.email}`}
              className="data mt-9 inline-block break-all border-b border-gold pb-1 text-[1.0625rem] text-gold-ink transition-colors hover:border-gold-ink hover:text-ink sm:text-[1.25rem]"
            >
              {PROFILE.email}
            </a>

            <dl className="mt-10 flex flex-wrap gap-x-14 gap-y-6">
              <div>
                <dt className="legend text-[0.5625rem] text-ink-3">Phone</dt>
                <dd className="data mt-2 text-[0.875rem] text-ink-2">
                  {PROFILE.phone}
                </dd>
              </div>
              <div>
                <dt className="legend text-[0.5625rem] text-ink-3">Location</dt>
                <dd className="mt-2 text-[0.875rem] text-ink-2">
                  {PROFILE.location}
                </dd>
              </div>
            </dl>
          </div>

          <ul className="themed divide-y divide-rule border border-rule bg-panel/45">
            {CONNECTORS.map((c) =>
              c.pending ? (
                <li
                  key={c.ref}
                  className="flex items-center gap-3 px-5 py-5 sm:gap-4 sm:px-6"
                  title="Add this URL in src/lib/content.ts"
                >
                  <span className="data w-7 shrink-0 text-[0.75rem] text-ink-3">
                    {c.ref}
                  </span>
                  <BrandIcon
                    part={c.label}
                    className="hidden h-4 w-4 shrink-0 text-ink-3 sm:block"
                  />
                  <span className="legend text-[0.75rem] text-ink-3">
                    {c.label}
                  </span>
                  <span className="data ml-auto text-[0.625rem] text-ink-3">
                    [pending]
                  </span>
                </li>
              ) : (
                <li key={c.ref}>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-center gap-3 px-5 py-5 transition-colors hover:bg-[var(--hover)] sm:gap-4 sm:px-6"
                  >
                    <span className="data w-7 shrink-0 text-[0.75rem] text-gold-ink">
                      {c.ref}
                    </span>
                    <BrandIcon
                      part={c.label}
                      className="hidden h-4 w-4 shrink-0 text-ink-3 transition-colors group-hover:text-gold-ink sm:block"
                    />
                    <span className="legend text-[0.75rem] text-ink">
                      {c.label}
                    </span>
                    <span className="data ml-auto text-[0.75rem] text-ink-2">
                      {c.handle}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-gold-ink transition-transform group-hover:translate-x-0.5" />
                  </a>
                </li>
              )
            )}
          </ul>
        </div>
      </Section>

      </main>

      {/* ── title block ──────────────────────────────────────────── */}
      <footer className="mx-auto w-full max-w-[76rem] px-6 pb-14 md:px-10">
        <div className="themed grid grid-cols-2 border border-gold/60 sm:grid-cols-4">
          {[
            ["Drawn by", PROFILE.name],
            ["Title", "Personal portfolio"],
            ["Sheet", "1 of 1"],
            ["Rev", "1.0"],
          ].map(([k, v], i) => (
            <div
              key={k}
              className={`border-rule p-5 ${
                i < 2 ? "border-b sm:border-b-0" : ""
              } ${i % 2 === 0 ? "border-r" : ""} sm:border-r sm:last:border-r-0`}
            >
              <div className="legend text-[0.5625rem] text-ink-3">{k}</div>
              <div className="legend mt-2 text-[0.6875rem] leading-snug text-ink">
                {v}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <span className="legend text-[0.5625rem] text-ink-3">
            Built with Next.js, TypeScript and Tailwind — the sheet is the sample
          </span>
          <Link
            href="#overview"
            className="legend -my-2 inline-flex items-center gap-2 py-2 text-[0.5625rem] text-ink-3 transition-colors hover:text-gold-ink"
          >
            Back to top
            <ArrowUp className="h-3 w-3" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
