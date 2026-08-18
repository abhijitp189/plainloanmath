/**
 * Where the headline saving actually comes from.
 *
 * Two bars on one shared scale. The upper bar is the interest the shorter
 * loan's lower rate saves. The lower bar is the interest saved by paying the
 * larger amount every month, which is available on either loan. On any
 * realistic spread the second bar is several times the first, and that
 * disproportion is the whole finding — a figure cannot show it and two bars
 * can.
 *
 * DESIGN GUIDE COMPLIANCE, the parts that were easy to get wrong:
 *
 * 1. The viewBox is a constant and the data is scaled into it (§5.1). Bar
 *    lengths move with the reader's typing; the box does not.
 *
 * 2. Brass, both bars, one meaning. Brass means "money you do not pay" and
 *    both bars are exactly that (§1.3). The bars are not two different things
 *    that happen to be adjacent, they are two parts of one number, which is
 *    the same "three views of one figure" case the payoff page's donut, strip
 *    and headline make.
 *
 * 3. The two bars are told apart by FILL PATTERN, not by hue, so no second
 *    color is spent and color is not the only signal (§7). Solid brass is
 *    what the loan causes; the 45 degree brass hatch on `--brass-soft` is what
 *    the borrower causes. That hatch is not invented here — it is the same
 *    idiom the loan-life strip already uses for months erased by extra
 *    payments, which is the same idea: interest avoided by paying more.
 *
 * 4. `--brass-soft` is 1.15:1 against `--surface` and cannot carry meaning on
 *    its own (§1.8). Every bar is closed with a `--brass` stroke at 4.68:1, so
 *    the length reads from the stroke and the fill is reinforcement.
 *
 * 5. No text inside the SVG at all (§5.1). Every label is HTML above and
 *    beside the chart, so nothing is clipped and nothing sits below the
 *    legibility floor at phone width.
 *
 * 6. Colors are CSS variables only, no hex (§11 item 21).
 *
 * 7. `print-color-adjust: exact` on the fills and the hatch, or the bars print
 *    as two empty outlines and the comparison is lost (§9).
 *
 * THE NEGATIVE CASE. The shorter loan is not always quoted at the lower rate.
 * When it is not, the rate "saving" is a cost and the upper bar runs the other
 * way. It is drawn to the left of the zero line rather than clamped to
 * nothing, because "this costs you money" and "this saves you nothing" are
 * different answers and must not be drawn identically. Same decision, and the
 * same reason, as the recovery chart's y-domain on the refinance page.
 */

const VW = 720; // viewBox width, constant
const VH = 150; // viewBox height, constant
const BAR_H = 34;
const GAP = 26;
const PAD_X = 3; // room so an end stroke is never clipped
const TOP = 14;

export default function SavingSplitBars({
  rateEffect,
  behaviorEffect,
}: {
  /** Interest saved by the shorter loan's rate. May be negative. */
  rateEffect: number;
  /** Interest saved by paying the larger amount. */
  behaviorEffect: number;
}) {
  // ONE scale for both sides of the zero line, always. The obvious
  // construction — scale the positive side to the remaining width after the
  // negative side has taken what it needs — silently gives the two sides
  // different scales, so a bar left of zero and a bar right of zero would not
  // be comparable even though the whole point of the chart is comparing them.
  // It also collapses to nothing when both values are negative: rasterized on
  // August 18, 2026 that drew two hairlines against the right edge. Neither
  // problem is visible in any computed check.
  //
  // Instead: the axis spans the largest positive plus the largest negative,
  // and every bar is drawn at the same pixels-per-dollar.
  const posMax = Math.max(0, rateEffect, behaviorEffect);
  const negMax = Math.max(0, -rateEffect, -behaviorEffect);
  const total = Math.max(posMax + negMax, 1);
  const usable = VW - PAD_X * 2;
  const scale = usable / total;
  const zeroX = PAD_X + negMax * scale;

  const bar = (value: number, y: number) => {
    const w = Math.abs(value) * scale;
    const x = value >= 0 ? zeroX : zeroX - w;
    // Never let a bar vanish completely: a hairline still reads as "almost
    // nothing", an absent rectangle reads as a rendering fault.
    return { x, y, w: Math.max(w, 1.5), h: BAR_H };
  };

  const top = bar(rateEffect, TOP);
  const bottom = bar(behaviorEffect, TOP + BAR_H + GAP);

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={
        rateEffect >= 0
          ? "Two bars on the same scale. The shorter loan's lower rate accounts for a small part of the total interest saved. Paying the larger amount each month accounts for the rest."
          : "Two bars on the same scale. The shorter loan is quoted at the higher rate, so it costs interest rather than saving it, and its bar runs the other way. Paying the larger amount each month is what saves interest here."
      }
      className="block"
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
    >
      <defs>
        <pattern
          id="split-hatch"
          width="9"
          height="9"
          patternTransform="rotate(45)"
          patternUnits="userSpaceOnUse"
        >
          <rect width="9" height="9" fill="var(--brass-soft)" />
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="9"
            stroke="var(--brass)"
            strokeWidth="2.6"
          />
        </pattern>
      </defs>

      {/* Caused by the loan: solid. */}
      <rect
        x={top.x}
        y={top.y}
        width={top.w}
        height={top.h}
        fill="var(--brass)"
        stroke="var(--brass)"
        strokeWidth="1"
      />

      {/* Caused by the borrower: hatched, closed with a brass stroke so the
          length reads even where the fill does not. */}
      <rect
        x={bottom.x}
        y={bottom.y}
        width={bottom.w}
        height={bottom.h}
        fill="url(#split-hatch)"
        stroke="var(--brass)"
        strokeWidth="2"
      />

      {/* The zero line, drawn last so it sits over both bars. */}
      <line
        x1={zeroX}
        y1={TOP - 8}
        x2={zeroX}
        y2={TOP + BAR_H * 2 + GAP + 8}
        stroke="var(--line-strong)"
        strokeWidth="2"
      />
    </svg>
  );
}
