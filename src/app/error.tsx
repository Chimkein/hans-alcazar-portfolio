"use client";

import { useEffect } from "react";
import { PROFILE } from "@/lib/content";

/**
 * The page's error boundary.
 *
 * Without one, a single uncaught client error — a browser that throws on
 * sessionStorage access, a missing API in an older engine — unmounts the whole
 * tree and a visitor gets a blank white page with no way back. On a portfolio
 * that is the worst possible failure: it reads as "this person ships broken
 * work", which is the exact opposite of what the site is for.
 *
 * So the board fails like a board: it says which stage failed, and it keeps the
 * one thing that actually matters reachable — his email.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[portfolio] render fault:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="relative w-full max-w-lg border border-gold bg-paper p-8 sm:p-10">
        <span
          aria-hidden="true"
          className="absolute left-4 top-4 h-2 w-2 rounded-full border border-gold bg-paper"
        />

        <p className="legend text-[0.5625rem] text-gold-ink">FAULT · E1</p>

        <h1 className="display mt-4 text-[1.75rem] leading-[1.05] text-ink sm:text-[2.25rem]">
          This panel failed to render
        </h1>

        <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-2">
          Something on the page threw an error the site could not recover from
          on its own. Reloading usually clears it.
        </p>

        {error.digest ? (
          <p className="legend mt-4 text-[0.5625rem] text-ink-3">
            REF {error.digest}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button type="button" onClick={reset} className="btn">
            Try again
          </button>
          {/* Deliberately a plain anchor, not next/link. A client-side
              navigation would re-enter the same React tree that just threw;
              only a real document load rebuilds it from scratch. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="btn">
            Reload the sheet
          </a>
        </div>

        <p className="mt-8 border-t border-rule pt-5 text-[0.8125rem] leading-relaxed text-ink-3">
          If it keeps happening, {PROFILE.name.split(" ")[0]} can be reached
          directly at{" "}
          <a className="text-ink-2 underline" href={`mailto:${PROFILE.email}`}>
            {PROFILE.email}
          </a>
          .
        </p>
      </div>
    </main>
  );
}
