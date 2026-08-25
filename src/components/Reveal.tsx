"use client";

import { useEffect } from "react";

/**
 * Sections resolve as you reach them: they arrive blurred and low, then settle
 * into focus. On a sheet that reads as a plot developing rather than as content
 * sliding around, which is why the blur matters more than the travel.
 *
 * It replays. Leaving a section clears its state, so scrolling back finds it
 * unresolved again — the request was that this happen every time you enter a
 * section, not once per page load.
 *
 * One observer for the whole page rather than a client boundary per section:
 * page.tsx stays a server component and the sections stay plain markup carrying
 * nothing but a data attribute.
 *
 * The class goes on <html>, not on the sections, and every hidden state in the
 * stylesheet is scoped under it. That ordering matters: the server sends markup
 * with no class at all, so a visitor whose JavaScript never runs — blocked,
 * failed, disabled — gets the whole sheet at full opacity instead of a page of
 * invisible sections. Hiding first and revealing later would put the entire
 * portfolio behind a script that might not arrive.
 */
export function Reveal() {
  useEffect(() => {
    const targets = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    if (!targets.length) return;

    const root = document.documentElement;

    // Honour the OS setting rather than the media query alone: if motion is
    // reduced we never arm the effect, so the sections are never hidden and
    // there is nothing to transition.
    const calm = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (calm?.matches) return;

    // Armed only now, one frame before the observer can act, so the gap between
    // paint and reveal is never long enough to read as a flash of empty sheet.
    root.classList.add("reveal-armed");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          el.dataset.shown = entry.isIntersecting ? "true" : "false";
        }
      },
      // The middle 80% of the viewport. A section resolves once it is properly
      // in front of the reader, not when its first pixel clips the bottom edge.
      { rootMargin: "-10% 0px -10% 0px", threshold: 0 }
    );

    targets.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      root.classList.remove("reveal-armed");
      targets.forEach((el) => delete el.dataset.shown);
    };
  }, []);

  return null;
}
