/**
 * Drawn in the sheet's own grammar: 1.5 stroke, square caps, no fill.
 * The page ships no Unicode glyphs standing in for icons.
 */
type IconProps = { className?: string };

const base = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "square" as const,
  strokeLinejoin: "miter" as const,
  "aria-hidden": true,
  focusable: false,
};

export function ArrowUpRight({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 11 11 5" />
      <path d="M6.25 5H11v4.75" />
    </svg>
  );
}

export function ArrowDown({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M8 3v9.5" />
      <path d="M4.25 8.75 8 12.5l3.75-3.75" />
    </svg>
  );
}

export function ArrowUp({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M8 13V3.5" />
      <path d="M4.25 7.25 8 3.5l3.75 3.75" />
    </svg>
  );
}

export function Pause({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 4v8" />
      <path d="M10 4v8" />
    </svg>
  );
}

export function Play({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5.5 3.75 12 8l-6.5 4.25z" />
    </svg>
  );
}
