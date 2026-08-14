import { formatDuration } from "@/lib/mortgage";

/**
 * Interest saved, climbing until it covers the closing costs.
 *
 * The picture of a break-even: a rising brass area against a flat dashed line
 * at the cost of the refinance, and a marker where they cross. The reader can
 * see how much of the recovery is already behind them and how steep the climb
 * is, which a single "17 months" figure cannot show.
 *
 * DESIGN GUIDE COMPLIANCE, the parts that were easy to get wrong:
 *
 * 1. The viewBox is a constant and the data is scaled into it (§5.1). A
 *    viewBox tracking the data changes the rendered height mid-keystroke.
 *
 * 2. The x-domain is STEPPED, not continuous. Choosing "months to show" from a
 *    fixed ladder means the axis does not slide under the reader's fingers as
 *    they type a rate. Same reasoning as the donut's stepped center figure.
 *
 * 3. The filled area is `--brass-soft`, which is 1.10:1 against `--surface`
 *    and therefore cannot be the only signal (§1.8, and the precedent of the
 *    two elements deleted on August 12 for exactly this). The meaning is
 *    carried by the `--brass` stroke along its top edge at 4.68:1, with the
 *    fill as reinforcement. That is the same "draw the frontier" fix the
 *    loan-life strip uses where two fills meet.
 *
 * 4. Brass here means "money you do not pay", which is the interest the
 *    refinance saves. One meaning, consistent with §1.3.
 *
 * 5. No text inside the SVG at all (§5.1), so there is no clipped caption and
 *    nothing sized below the legibility floor. Everything readable is HTML.
 *
 * 6. Colors are CSS variables only — no hex in a component (§11 item 18).
 */

const VW = 720; // viewBox width, constant
const VH = 180; // viewBox height, constant
const PAD_B = 10; // room so the baseline stroke is not clipped
const PAD_T = 12; // room so the peak stroke is not clipped

/** Stepped x-domain, so the axis does not slide while the reader types. */
const LADDER = [36, 60, 120, 240, 360, 480] as const;

function domainMonths(
  seriesLength: number,
  breakEvenMonth: number | null,
): number {
  const needed = breakEvenMonth === null ? 60 : Math.ceil(breakEvenMonth * 1.4);
  const step = LADDER.find((m) => m >= needed) ?? LADDER[LADDER.length - 1];
  return Math.max(2, Math.min(step, seriesLength - 1));
}

export default function RecoveryChart({
  saved,
  costs,
  breakEvenMonth,
}: {
  /** Cumulative interest saved by month. Index 0 is 0. */
  saved: number[];
  costs: number;
  breakEvenMonth: number | null;
}) {
  const months = domainMonths(saved.length, breakEvenMonth);
  if (months < 2) return null;

  const peak = Math.max(costs, saved[months] ?? 0, 1);
  const top = peak * 1.08; // headroom so the line never touches the edge

  // A new rate above the old one SAVES NOTHING and costs something, so the
  // series runs negative. Rasterized at 345px on August 14, 2026, that ran the
  // stroke straight off the bottom of the viewBox. Clamping it to zero was the
  // obvious fix and the wrong one: it would draw "you are losing money" and
  // "you are saving nothing" identically. The floor moves instead.
  const floor = Math.min(0, ...saved.slice(0, months + 1));
  const span = top - floor;

  const x = (m: number) => (m / months) * VW;
  const y = (v: number) =>
    VH - PAD_B - ((v - floor) / span) * (VH - PAD_B - PAD_T);

  // One path for the top edge, reused as the outline of the filled area.
  const edge: string[] = [];
  for (let m = 0; m <= months; m++) {
    edge.push(`${m === 0 ? "M" : "L"}${x(m).toFixed(2)} ${y(saved[m]).toFixed(2)}`);
  }
  // The area closes on the zero line, not the bottom of the box, so a series
  // that dips below zero fills downward from it rather than upward from the
  // floor. Where nothing is negative the two are the same line.
  const zeroY = y(0);
  const area = `${edge.join("")}L${VW} ${zeroY.toFixed(2)}L0 ${zeroY.toFixed(2)}Z`;

  const costY = y(costs);
  const markerX = breakEvenMonth !== null ? x(breakEvenMonth) : null;

  return (
    <figure className="mt-3 min-h-[9rem]">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={
          breakEvenMonth === null
            ? "Interest saved by the refinance never rises above what it cost, so the two never meet."
            : `Interest saved by the refinance climbs past what it cost after ${formatDuration(
                breakEvenMonth,
              )}, and keeps climbing after that.`
        }
        style={{
          // Browsers drop background and stroke colors when printing unless
          // told otherwise, and design guide §9 expects the print view to
          // carry the figures. Without this the whole chart prints blank.
          printColorAdjust: "exact",
          WebkitPrintColorAdjust: "exact",
        }}
      >
        {/* Zero: the line the saving is measured from. */}
        <line
          x1="0"
          y1={zeroY}
          x2={VW}
          y2={zeroY}
          stroke="var(--line-strong)"
          strokeWidth="1"
        />

        {/* Interest saved. Fill reinforces; the stroke carries the meaning. */}
        <path d={area} fill="var(--brass-soft)" />
        <path
          d={edge.join("")}
          fill="none"
          stroke="var(--brass)"
          strokeWidth="2.5"
          strokeLinecap="square"
        />

        {/* What the refinance cost. */}
        <line
          x1="0"
          y1={costY}
          x2={VW}
          y2={costY}
          stroke="var(--ink-2)"
          strokeWidth="2"
          strokeDasharray="7 5"
        />

        {/* Where they cross. */}
        {markerX !== null && (
          <>
            <line
              x1={markerX}
              y1={PAD_T - 6}
              x2={markerX}
              y2={VH - PAD_B}
              stroke="var(--accent)"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
            <rect
              x={markerX - 4}
              y={costY - 4}
              width="8"
              height="8"
              fill="var(--accent)"
            />
          </>
        )}
      </svg>
    </figure>
  );
}
