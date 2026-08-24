"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

/** false during SSR, true once hydrated — without setState in an effect. */
const subscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}

/**
 * SW1 — the sheet's two-position switch.
 *
 * The positions read LIGHT / DARK, not DRAWING / BOARD. A theme switch is a
 * familiar affordance and renaming it makes the visitor decode the conceit
 * before they can use the control; the world keeps its voice in the SW1
 * designator beside it, and in the two themes themselves.
 *
 * The throw and the labels are driven by the `.dark` class in CSS, exactly like
 * the portrait — so the switch renders in the right position on first paint and
 * never flashes through the wrong one during hydration.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();

  return (
    <div className="flex items-center gap-2.5">
      <span className="legend hidden text-[0.5625rem] text-ink-3 sm:inline">
        SW1
      </span>
      <button
        type="button"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        aria-label={
          hydrated
            ? resolvedTheme === "dark"
              ? "Switch to the light theme"
              : "Switch to the dark theme"
            : "Switch between the light and dark theme"
        }
        className="group relative flex h-8 items-center rounded-[2px] border border-gold/70 bg-panel transition-colors hover:border-gold"
      >
        {/* the throw — a gold pad that slides between positions */}
        <span
          aria-hidden="true"
          className="absolute top-[3px] bottom-[3px] left-[3px] w-[calc(50%-3px)] translate-x-0 rounded-[1px] bg-gold transition-transform duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] dark:translate-x-full"
        />
        <span className="legend relative z-10 w-[3.75rem] text-center text-[0.5625rem] text-[#14171a] transition-colors duration-300 dark:text-ink-3">
          Light
        </span>
        <span className="legend relative z-10 w-[3.75rem] text-center text-[0.5625rem] text-ink-3 transition-colors duration-300 dark:text-[#14171a]">
          Dark
        </span>
      </button>
    </div>
  );
}
