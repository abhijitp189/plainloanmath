/**
 * What the calendar costs: two extra payments a year, landing in each of the
 * twelve months of the loan year.
 *
 * One horizontal bar per landing month. Bar length is the interest GIVEN UP
 * against landing in month 1, which is the earliest the money can arrive and
 * therefore the best any of the twelve can do. The right-hand label on each row
 * is what the loan is paid off in.
 *
 * ── Four decisions worth reading before editing ─────────────────────────────
 *
 * 1. HORIZONTAL BARS, NOT COLUMNS. Twelve columns in a 700-wide viewBox give a
 *    34px column, which renders about 17px at 345px with a 6px tick label under
 *    it. That is smaller than anything else on the site and it was rejected on
 *    sight. Twelve rows cost vertical space, which a phone has, and the labels
 *    stay horizontal text at a readable size. Same reasoning as PmiWindowChart.
 *
 * 2. THE QUANTITY HAS A TRUE ZERO, AND THAT IS WHY IT IS THIS QUANTITY.
 *    Plotting interest SAVED would put twelve near-identical bars side by side,
 *    because all twelve save between $164,000 and $176,000: the chart would say
 *    nothing and would have to be truncated to say anything, which is the
 *    misleading-axis trap. Interest given up against the best case starts at a
 *    real zero. Month 1 draws no bar because month 1 gives up nothing, which is
 *    the honest rendering rather than a gap.
 *
 * 3. `xMax` IS A PROP, DERIVED ON THE PAGE AND ROUNDED UP. A hard-coded
 *    maximum is the convention elsewhere (PrepaymentDecayChart's Y_MAX = 6),
 *    and it is right when the scale is a fixed unit like dollars-per-dollar.
 *    Here the range depends on the rate, so a constant would silently clip the
 *    longest bar if the example loan were ever re-rated. Derived and rounded to
 *    the next $2,000 it cannot clip, and it is still constant within a render,
 *    so the gridlines stay round numbers.
 *
 * 4. THE BARS CARRY THE BRASS, INVERTED IN MEANING, AND THE COMMENT SAYS SO.
 *    Brass means money the reader does not pay everywhere else on the site.
 *    Here it is money the reader DOES pay by waiting, so it would be the one
 *    inconsistent use on the site. It is drawn in `--c-interest` instead, which
 *    is what interest is drawn in on the payment charts. Nothing on this chart
 *    is brass, deliberately.
 */

type Row = {
  /** 1 to 12. Which month of each loan year the extra money lands in. */
  month: number;
  /** Interest given up against landing in month 1. Zero for month 1 itself. */
  givenUp: number;
  /**
   * Payoff time in the chart's abbreviated tick form, "20y 6m". Kept short
   * because the right gutter is 76px and the long form overflows it.
   */
  paidOffIn: string;
  /**
   * The same figure spelled out, "20 years, 6 months", for the aria-label only.
   * A screen reader announcing "twenty y six m" is the cost of the abbreviation
   * that makes the visual label fit, and it is not a cost worth paying when the
   * fix is one extra string.
   */
  paidOffSpoken: string;
};

const VB_W = 700;

const PAD_L = 68;
const PAD_R = 76;
const PAD_T = 30;
const PAD_B = 40;

const ROW_H = 26;
const BAR_H = 16;

export default function AnnualExtraTimingChart({
  rows,
  xMax,
  amount,
}: {
  rows: Row[];
  /** Rounded up on the page so the longest bar cannot touch the edge. */
  xMax: number;
  /** The extra paid each year, already formatted. Used in the caption. */
  amount: string;
}) {
  const plotW = VB_W - PAD_L - PAD_R;
  const vbH = PAD_T + rows.length * ROW_H + PAD_B;

  const x = (v: number) => PAD_L + (v / xMax) * plotW;
  const rowY = (i: number) => PAD_T + i * ROW_H;

  /** Five ticks, so every gridline lands on a round figure. */
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * xMax);

  const usd0 = (n: number) =>
    n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  return (
    <figure className="mt-10">
      <figcaption className="label mb-3">
        Interest given up by waiting. The same {amount} a year, landing in each
        of the twelve months of the loan year, measured against landing in month
        1.
      </figcaption>

      <svg
        viewBox={`0 0 ${VB_W} ${vbH}`}
        className="w-full"
        role="img"
        aria-label={`Interest given up on a $340,000 loan at 6.75 percent over 30 years by delaying two extra payments a year, measured against landing them in month 1 of each loan year. ${rows
          .map(
            (r) =>
              `Month ${r.month}: ${
                r.givenUp === 0 ? "nothing given up" : `${usd0(r.givenUp)} given up`
              }, paid off in ${r.paidOffSpoken}.`,
          )
          .join(" ")}`}
      >
        {/* Vertical gridlines */}
        {ticks.map((t) => (
          <line
            key={t}
            x1={x(t)}
            x2={x(t)}
            y1={PAD_T - 8}
            y2={PAD_T + rows.length * ROW_H}
            stroke="var(--line)"
            strokeWidth="1"
          />
        ))}

        {/* X axis labels, along the bottom */}
        {ticks.map((t) => (
          <text
            key={`t${t}`}
            x={x(t)}
            y={PAD_T + rows.length * ROW_H + 20}
            textAnchor="middle"
            className="chart-tick"
            fill="var(--muted)"
            fontSize="11"
          >
            {usd0(t)}
          </text>
        ))}

        {rows.map((r, i) => {
          const y = rowY(i);
          const w = x(r.givenUp) - PAD_L;

          return (
            <g key={r.month}>
              {/* Row label */}
              <text
                x={PAD_L - 10}
                y={y + BAR_H - 3}
                textAnchor="end"
                className="chart-tick"
                fill="var(--ink-2)"
                fontSize="12"
              >
                {`Month ${r.month}`}
              </text>

              {/* The bar. Month 1 gives up nothing, so it draws nothing. */}
              {w > 0 && (
                <rect
                  x={PAD_L}
                  y={y}
                  width={w}
                  height={BAR_H}
                  fill="var(--c-interest)"
                />
              )}

              {/* Payoff time, at the right edge of the plot */}
              <text
                x={VB_W - PAD_R + 10}
                y={y + BAR_H - 3}
                textAnchor="start"
                className="chart-tick"
                fill="var(--ink)"
                fontSize="12"
                fontWeight="700"
              >
                {r.paidOffIn}
              </text>
            </g>
          );
        })}

        {/* The zero rule, drawn last so it sits over the bar origins. It is
            the reference the whole chart is measured from, so it is the one
            line drawn at full strength. */}
        <line
          x1={PAD_L}
          x2={PAD_L}
          y1={PAD_T - 8}
          y2={PAD_T + rows.length * ROW_H}
          stroke="var(--line-strong)"
          strokeWidth="2"
        />
      </svg>
    </figure>
  );
}
