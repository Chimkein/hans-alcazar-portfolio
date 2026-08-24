/**
 * The ground: corner fiducials over a very quiet plot grid.
 *
 * Chosen from ten candidates. The clear field won first, then the grid came
 * back by request — but tuned this time rather than restored: `--grid-major`
 * and `--grid-fine` sit far below the contrast of the lightest text on the
 * page, so the lattice reads as drafting stock and not as a texture the copy
 * has to fight. Earlier attempts failed because the grid was pitched at
 * roughly the weight of a hairline rule.
 *
 * Over it sits the one mark a board cannot do without: the fiducials it is
 * aligned by, one at each corner of the viewport.
 *
 * They are four fixed-size SVGs rather than one stretched viewBox — a full-page
 * SVG scaled to the viewport would either crop the marks (`slice`) or squash the
 * circles into ovals (`none`).
 */

const CORNERS = [
  "left-5 top-5 md:left-7 md:top-7",
  "right-5 top-5 md:right-7 md:top-7",
  "left-5 bottom-5 md:left-7 md:bottom-7",
  "right-5 bottom-5 md:right-7 md:bottom-7",
];

export function BoardField() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* the lattice, full width */}
      <div className="plot-field absolute inset-0" />
      {/* a little substance under the reading column */}
      <div className="column-wash absolute inset-y-0 left-1/2 w-[80rem] max-w-full -translate-x-1/2" />

      {CORNERS.map((pos) => (
        <svg
          key={pos}
          className={`absolute ${pos} h-9 w-9`}
          viewBox="0 0 40 40"
          fill="none"
          stroke="var(--gold)"
          strokeWidth={1.4}
          strokeOpacity="var(--field-via)"
          focusable="false"
        >
          <circle cx={20} cy={20} r={8.5} />
          <path d="M0 20 H11 M29 20 H40" />
          <path d="M20 0 V11 M20 29 V40" />
        </svg>
      ))}
    </div>
  );
}
