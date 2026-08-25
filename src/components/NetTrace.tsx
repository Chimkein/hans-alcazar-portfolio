"use client";

import { useEffect, useState } from "react";
import { SHEET } from "@/lib/content";

/**
 * Where the reader is on the sheet: which section holds them, and how far the
 * whole run has gone. Two consumers need this — the left rail and the header
 * index — and only one of them is ever on screen, so each keeps its own
 * observer rather than paying for a context that exists to serve one reader.
 */
function useSheetPosition() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sections = SHEET.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const i = sections.indexOf(entry.target as HTMLElement);
            if (i >= 0) setActive(i);
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return { active, progress };
}

/**
 * The rail appears at min-[1530px] and nowhere narrower. The number is
 * geometry, not taste: the rail measures 106px and the content column is a fixed
 * 76rem centred, so the left margin only clears the column from ~1470px up — but
 * clearing it and looking right are different thresholds. At the clearing width
 * the gap is 21px against the 81px the design gets at 1600, which reads as
 * crowding. 1530 is the narrowest sheet that still leaves the rail ~49px.
 *
 * It was 1560, which missed 1920 screens at Windows' 125% scaling by 24px — they
 * report a 1536 viewport — and there was nothing underneath to catch them, so
 * every laptop-class sheet had no index at all. Below 1530 the header index now
 * takes over; see SheetIndex at the bottom of this file.
 *
 * The breakpoint is written out literally at all three use sites rather than
 * held in a constant. Tailwind finds class names by scanning source text, so a
 * breakpoint composed by string interpolation compiles to nothing at all — no
 * class is generated and the rail silently never renders, which is exactly the
 * failure this comment exists to stop someone reintroducing.
 */

/**
 * The net trace: one continuous gold conductor running the whole sheet.
 * The run above your position is energised, the run below stays hairline, and
 * each section's via lights as you reach it. It is the page's only persistent
 * position indicator — the reason the sheet never needs a sticky header.
 */
export function NetTrace() {
  const { active, progress } = useSheetPosition();

  return (
    <>
      {/* narrow sheets: the trace runs across the top edge */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-px bg-gold-dim min-[1530px]:hidden"
      >
        <div
          className="h-full bg-gold transition-[width] duration-200 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* wide sheets: the trace runs down the left margin, vias on each section */}
      <nav
        aria-label="Sheet index"
        className="fixed left-0 top-1/2 z-50 hidden -translate-y-1/2 pl-6 min-[1530px]:block"
      >
        <div className="relative">
          {/* the conductor */}
          <span
            aria-hidden="true"
            className="absolute left-[6px] top-1 bottom-1 w-px bg-gold-dim"
          />
          <span
            aria-hidden="true"
            className="absolute left-[6px] top-1 w-px bg-gold transition-[height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              height: `calc(${(active / Math.max(1, SHEET.length - 1)) * 100}% - 0.25rem)`,
            }}
          />

          <ul className="relative flex flex-col gap-11">
            {SHEET.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="group -my-1 flex items-center gap-3.5 py-1"
                  aria-current={i === active ? "true" : undefined}
                >
                  <span
                    aria-hidden="true"
                    className="via shrink-0"
                    data-live={i <= active ? "true" : "false"}
                  />
                  <span className="flex flex-col leading-none">
                    <span
                      className={`legend text-[0.5625rem] transition-colors ${
                        i === active ? "text-gold-ink" : "text-ink-3"
                      }`}
                    >
                      {s.ref}
                    </span>
                    <span
                      className={`legend mt-1 text-[0.625rem] transition-colors group-hover:text-ink ${
                        i === active ? "text-ink" : "text-ink-3"
                      }`}
                    >
                      {s.label}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}

/**
 * The same index, routed horizontally for sheets too narrow to carry the rail.
 *
 * Fixed, not part of the header. At these widths it is the only index there is,
 * so letting it scroll away would leave the reader with nothing but the progress
 * conductor for the length of the sheet — which is the gap it exists to close.
 *
 * It carries no ground and no outline: the parts sit directly on the drawing,
 * the same way the rail does on wide sheets. That keeps it reading as part of
 * the board rather than as a panel laid over it, at the cost of contrast where
 * it happens to cross dense content.
 *
 * Below lg the header has no room left once the monogram and the switch are
 * placed, so it steps aside there.
 */
export function SheetIndex() {
  const { active } = useSheetPosition();
  const last = Math.max(1, SHEET.length - 1);

  return (
    <nav
      aria-label="Sheet index"
      className="fixed left-1/2 top-[23px] z-50 hidden -translate-x-1/2 lg:max-[1530px]:flex"
    >
      <div className="relative">
        {/* the conductor, run horizontally. Equal columns put the vias at 10%,
            30%, 50%, 70% and 90%, so the trace spans first centre to last. */}
        <span
          aria-hidden="true"
          className="absolute left-[10%] right-[10%] top-[6px] h-px bg-gold-dim"
        />
        <span
          aria-hidden="true"
          className="absolute left-[10%] top-[6px] h-px bg-gold transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: `${(active / last) * 80}%` }}
        />

        {/* grid, not flex: equal columns are what make the via positions
            predictable enough to hang the conductor off percentages, and the
            grid still sizes itself to the widest designator. */}
        <ul className="relative grid grid-cols-5">
          {SHEET.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="group flex flex-col items-center gap-2.5 px-3"
                aria-current={i === active ? "true" : undefined}
              >
                <span
                  aria-hidden="true"
                  className="via shrink-0"
                  data-live={i <= active ? "true" : "false"}
                />
                <span className="flex flex-col items-center leading-none">
                  <span
                    className={`legend text-[0.5625rem] transition-colors ${
                      i === active ? "text-gold-ink" : "text-ink-3"
                    }`}
                  >
                    {s.ref}
                  </span>
                  <span
                    className={`legend mt-1 whitespace-nowrap text-[0.625rem] transition-colors group-hover:text-ink ${
                      i === active ? "text-ink" : "text-ink-3"
                    }`}
                  >
                    {s.label}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
