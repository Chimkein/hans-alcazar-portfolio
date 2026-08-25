"use client";

import { ArrowUp } from "@/components/Icons";

/**
 * Back to top.
 *
 * It stays an anchor to a real section, so with no JavaScript it is still a
 * working link rather than a dead control. The handler is what makes it
 * repeatable.
 *
 * As a plain link it fired exactly once per visit. Clicking it puts #overview in
 * the address bar; clicking it again is a navigation to the hash the page is
 * already on, which the browser treats as nothing to do — no navigation, no
 * scroll, no event. So the second press and every press after it did nothing at
 * all, which is precisely when someone reaches for this control.
 *
 * It also now goes to the top. The anchor landed on #overview, and that section
 * carries scroll-mt-20, so the old behaviour stopped 40px short of the actual
 * top of the sheet with the header half cut off.
 *
 * scrollTo is called without a behavior so the scrolling element's CSS decides,
 * which means the reduced-motion rule in globals.css still switches this to an
 * instant jump instead of being overridden here.
 */
export function BackToTop() {
  return (
    <a
      href="#overview"
      onClick={(e) => {
        e.preventDefault();
        window.scrollTo(0, 0);
      }}
      className="legend -my-2 inline-flex items-center gap-2 py-2 text-[0.5625rem] text-ink-3 transition-colors hover:text-gold-ink"
    >
      Back to top
      <ArrowUp className="h-3 w-3" />
    </a>
  );
}
