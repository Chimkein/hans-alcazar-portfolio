"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Pause, Play } from "@/components/Icons";
import type { Shot } from "@/lib/content";

const INTERVAL = 4500;

/** Live, without setState in an effect body. */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

/**
 * The component's captured screens, seated on a gold pad.
 *
 * Slides cross-fade rather than translate: every screenshot is normalised to the
 * same 2:1 frame, so the pad never resizes mid-rotation and the surrounding copy
 * never reflows.
 *
 * Rotation stops on hover, on keyboard focus, and whenever the visitor prefers
 * reduced motion. The pause control is not decoration — WCAG 2.2.2 wants a real
 * mechanism to stop anything that moves on its own for more than five seconds.
 */
export function Shots({
  shots,
  name,
  frame = "wide",
}: {
  shots: Shot[];
  name: string;
  frame?: "wide" | "device";
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const reduced = usePrefersReducedMotion();

  const running = shots.length > 1 && !paused && !held && !reduced;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % shots.length),
      INTERVAL
    );
    return () => clearInterval(id);
  }, [running, shots.length]);

  const current = shots[index];

  return (
    <figure
      className="mt-7"
      aria-roledescription="carousel"
      aria-label={`${name} — captured screens`}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
    >
      <div
        className={`themed relative w-full overflow-hidden border border-gold bg-panel-2 ${
          frame === "device" ? "aspect-[7/5]" : "aspect-[2/1]"
        }`}
      >
        {/* pin-1, so the plate reads as a seated part like every other pad */}
        <span
          aria-hidden="true"
          className="absolute left-2.5 top-2.5 z-10 h-[7px] w-[7px] rounded-full border border-gold bg-paper"
        />
        {shots.map((shot, i) => (
          <div
            key={shot.src}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={shot.src}
              alt={shot.alt}
              fill
              sizes="(min-width: 1024px) 58rem, 92vw"
              // a portrait screen letterboxed in a wide plate needs far fewer
              // horizontal pixels than a full-bleed desktop capture
              quality={95}
              className={
                frame === "device"
                  ? "object-contain p-4"
                  : "object-cover object-top"
              }
            />
          </div>
        ))}
      </div>

      <figcaption className="mt-3 flex items-center gap-4">
        {shots.length > 1 ? (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={
              paused ? "Resume the slideshow" : "Pause the slideshow"
            }
            className="flex h-7 w-7 shrink-0 items-center justify-center border border-gold/50 text-ink-3 transition-colors hover:border-gold hover:bg-[var(--hover)] hover:text-ink"
          >
            {paused || reduced ? (
              <Play className="h-3 w-3" />
            ) : (
              <Pause className="h-3 w-3" />
            )}
          </button>
        ) : null}

        <span className="legend text-[0.5625rem] text-ink-2">
          {current.label}
        </span>

        <span className="legend -mr-1 ml-auto flex items-center gap-0.5">
          {shots.map((shot, i) => (
            <button
              key={shot.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${shot.label}`}
              aria-current={i === index ? "true" : undefined}
              className="group flex h-7 w-7 items-center justify-center"
            >
              <span
                aria-hidden="true"
                className={`h-[9px] w-[9px] rounded-full border-2 transition-colors ${
                  i === index
                    ? "border-gold bg-gold"
                    : "border-gold-dim bg-transparent group-hover:border-gold"
                }`}
              />
            </button>
          ))}
        </span>
      </figcaption>
    </figure>
  );
}
