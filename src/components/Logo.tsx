/**
 * Hans's H monogram, rebuilt from the supplied SVG geometry.
 *
 * Two-tone by design: the bars and front slash take the sheet's ink, the offset
 * back slash takes `--paper` — white on the drawing, near-black on the board.
 * That is the relationship in the source files, where the offset slash was the
 * ground colour cutting a notch rather than a third colour added on top.
 *
 * Because it re-inks from tokens, one component covers both themes instead of
 * shipping two flat files, one of which would be invisible on its own ground.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Hans Stephen G. Alcazar monogram"
    >
      <rect x="16.43" y="24.35" width="26.09" height="71.26" fill="currentColor" />
      <rect x="77.48" y="24.35" width="26.09" height="71.26" fill="currentColor" />
      <path
        d="M84.17 73.95 L103.57 43.03 L74.97 43.03 L55.57 73.95 Z"
        fill="var(--paper)"
      />
      <path
        d="M71.12 73.75 L90.52 43.03 L61.93 43.03 L42.52 73.75 Z"
        fill="currentColor"
      />
    </svg>
  );
}
