"use client";

import { useEffect, useState } from "react";
import { SHEET } from "@/lib/content";

/**
 * The net trace: one continuous gold conductor running the whole sheet.
 * The run above your position is energised, the run below stays hairline, and
 * each section's via lights as you reach it. It is the page's only persistent
 * position indicator — the reason the sheet never needs a sticky header.
 */
export function NetTrace() {
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

  return (
    <>
      {/* mobile / tablet: the trace runs across the top edge */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-px bg-gold-dim min-[1560px]:hidden"
      >
        <div
          className="h-full bg-gold transition-[width] duration-200 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* desktop: the trace runs down the left margin, vias on each section */}
      <nav
        aria-label="Sheet index"
        className="fixed left-0 top-1/2 z-50 hidden -translate-y-1/2 pl-6 min-[1560px]:block"
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
