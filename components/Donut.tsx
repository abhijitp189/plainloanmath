/**
 * The donut — design guide §5.3. Hand-written SVG, no charting library, ever.
 *
 * r=68, stroke-width 26, stacked circles rotated -90°, each segment shortened
 * by a 3px gap so a separator falls between them. Every calculator that splits
 * one figure into parts uses this: the payment calculator splits a monthly
 * payment, the payoff calculator splits the lifetime cost of the loan.
 *
 * Extracted August 12, 2026, after a second copy appeared in the payoff
 * calculator. The two had already drifted — one scaled its center figure to
 * the length of the number and one did not, so a large loan printed a total
 * straight over the ring. The scaling lives here now and both get it.
 *
 * `segments` are drawn in order from 12 o'clock. Pass them in the order the
 * legend above the chart lists them, because §5.1 puts the legend in HTML and
 * a reader will match them by position.
 */

export type DonutSegment = {
  key: string;
  /** Used only in the fallback aria-label; the visible legend is HTML. */
  label: string;
  value: number;
  /** A CSS variable, never a hex — design guide §1.1. */
  color: string;
};

export default function Donut({
  segments,
  total,
  centerLabel,
  formatValue,
  ariaLabel,
}: {
  segments: DonutSegment[];
  /** The denominator. Segments need not sum to it; the track shows the rest. */
  total: number;
  /** The small line under the center figure, e.g. "per month". */
  centerLabel: string;
  formatValue: (n: number) => string;
  /** Describes the FINDING, not the chart type — design guide §5.1. */
  ariaLabel: string;
}) {
  const R = 68;
  const CIRC = 2 * Math.PI * R;
  const GAP = 3;

  const text = formatValue(total);

  // The hole is 110 user units across (2 × (68 − 13)). A mono digit runs about
  // 0.6em, so 21px only clears 8 characters, and "$1,284,120" on a large loan
  // would print over the ring. Stepped rather than continuous, so the figure
  // does not resize on every keystroke.
  const fontSize =
    text.length > 10 ? 14 : text.length > 9 ? 15 : text.length > 8 ? 17 : 21;

  let offset = 0;

  return (
    <svg
      viewBox="0 0 180 180"
      width="100%"
      style={{ maxWidth: 210 }}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={ariaLabel}
    >
      <g transform="rotate(-90 90 90)">
        <circle
          cx="90"
          cy="90"
          r={R}
          fill="none"
          stroke="var(--paper-2)"
          strokeWidth="26"
        />
        {total > 0 &&
          segments.map((s) => {
            const len = Math.max((s.value / total) * CIRC - GAP, 0);
            const el = (
              <circle
                key={s.key}
                cx="90"
                cy="90"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth="26"
                strokeDasharray={`${len} ${CIRC - len}`}
                strokeDashoffset={-offset}
                style={{
                  // Browsers drop color when printing unless told otherwise,
                  // and design guide §9 expects the print view to carry the
                  // figures. A donut that prints as one gray ring is worse
                  // than no donut.
                  printColorAdjust: "exact",
                  WebkitPrintColorAdjust: "exact",
                }}
              />
            );
            offset += (s.value / total) * CIRC;
            return el;
          })}
      </g>

      <text
        x="90"
        y="86"
        textAnchor="middle"
        className="num"
        fontSize={fontSize}
        fontWeight="700"
        fill="var(--ink)"
      >
        {text}
      </text>
      <text x="90" y="104" textAnchor="middle" fontSize="13" fill="var(--muted)">
        {centerLabel}
      </text>
    </svg>
  );
}

/**
 * The ruled legend that sits above a donut — design guide §5.1, legends live
 * in HTML and never inside the SVG, where they collide with labels and do not
 * scale with the page.
 *
 * Ruled rows rather than a bulleted list: this is a statement of account and
 * it should read like one.
 */
export function DonutLegend({
  segments,
  formatValue,
}: {
  segments: DonutSegment[];
  formatValue: (n: number) => string;
}) {
  return (
    <ul className="border-t border-line">
      {segments.map((s) => (
        <li
          key={s.key}
          className="flex items-baseline gap-2.5 border-b border-line py-2.5 text-[0.9rem]"
        >
          <span
            aria-hidden="true"
            className="mt-[0.35rem] h-2.5 w-2.5 shrink-0"
            style={{
              background: s.color,
              printColorAdjust: "exact",
              WebkitPrintColorAdjust: "exact",
            }}
          />
          <span className="flex-1 text-ink-2">{s.label}</span>
          <span className="num font-semibold text-ink">
            {formatValue(s.value)}
          </span>
        </li>
      ))}
    </ul>
  );
}
