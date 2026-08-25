import Image from "next/image";
import { PROFILE } from "@/lib/content";

const PINS = Array.from({ length: 9 });

/**
 * U1 — the part this whole board is built around.
 * Both portraits ship stacked and swap on the theme class alone, so the
 * cross-fade costs no JavaScript and cannot flash the wrong one on hydration.
 */
export function Portrait() {
  return (
    <figure className="relative mx-auto w-full max-w-[15rem] sm:max-w-[17rem] md:max-w-none">
      {/* pin rows — the component's leads */}
      <div
        aria-hidden="true"
        className="absolute -left-[7px] top-[9%] bottom-[9%] flex flex-col justify-between"
      >
        {PINS.map((_, i) => (
          <span key={i} className="block h-[3px] w-[13px] bg-gold/75" />
        ))}
      </div>
      <div
        aria-hidden="true"
        className="absolute -right-[7px] top-[9%] bottom-[9%] flex flex-col justify-between"
      >
        {PINS.map((_, i) => (
          <span key={i} className="block h-[3px] w-[13px] bg-gold/75" />
        ))}
      </div>

      <div className="themed relative border border-gold bg-panel p-[7px]">
        {/* pin-1 indicator */}
        <span
          aria-hidden="true"
          className="absolute left-[13px] top-[13px] z-20 h-[9px] w-[9px] rounded-full border border-gold bg-paper"
        />

        <div className="relative aspect-3/4 w-full overflow-hidden bg-panel-2">
          <Image
            src="/portrait-light.webp"
            alt={`${PROFILE.name}, in barong tagalog`}
            fill
            priority
            quality={95}
            sizes="(max-width: 768px) 60vw, (max-width: 1024px) 14rem, 20rem"
            className="object-cover opacity-100 transition-opacity duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] dark:opacity-0"
          />
          <Image
            src="/portrait-dark.webp"
            alt=""
            aria-hidden="true"
            fill
            quality={95}
            sizes="(max-width: 768px) 60vw, (max-width: 1024px) 14rem, 20rem"
            className="object-cover opacity-0 transition-opacity duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] dark:opacity-100"
          />
        </div>
      </div>

      {/* One data row, read left to right: designator, part, batch — the same
          grammar the section headings use, so the portrait is captioned like
          every other footprint on the sheet rather than in its own format.

          Set centred under the frame rather than spread to its edges. The three
          elements are wildly uneven in width — 12px against 133 against 56 — so
          pinning the outer two to the margins left a lopsided gap in the middle
          and read as a mistake rather than as a measure.

          The name is never truncated. It is the widest element here and the
          column narrows to 14rem at md, where the row needs 225px of the 224 it
          is given — hence the tighter gap below lg, which buys the 7px that
          keeps all three on one line. If a font ever pushes it over anyway the
          row wraps and the batch drops beneath, rather than the name losing
          letters. */}
      <figcaption className="legend mt-3 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-center text-[0.5625rem] text-ink-2 lg:gap-x-3">
        <span className="shrink-0 text-gold-ink">U1</span>
        <span className="text-ink">{PROFILE.name}</span>
        <span className="shrink-0 whitespace-nowrap text-ink-3">
          BSCPE {PROFILE.batch}
        </span>
      </figcaption>
    </figure>
  );
}
