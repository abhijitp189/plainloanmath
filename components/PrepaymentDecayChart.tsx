/**
 * What a $10,000 prepayment is worth, by the year it lands.
 *
 * One column per landing year. Column height is interest saved per dollar
 * committed, which is the figure no competitor publishes. The horizontal rule
 * at 1.00 is the line where a prepayment stops returning more interest saved
 * than the cash it consumed, and the year 20 and year 25 columns sit below it.
 *
 * The columns carry the brass because every one of them is money the reader
 * does not pay. Design guide: brass means exactly that, one meaning, used
 * consistently, and nothing decorative on this chart is brass.
 *
 * The break-even rule is drawn because it sits BELOW two of the columns. That
 * is the point of including it. A reader who has been told that early payments
 * matter more can see where "more" stops being a comparison and becomes a
 * question about whether the prepayment did anything at all.
 *
 * viewBox is constant and the data is scaled into it (design guide §5).
 */

type Point = {
  /** Year the lump sum lands. */
  year: number;
  /** Interest saved per $1 committed. */
  perDollar: number;
};

const VB_W = 700;
const VB_H = 340;

const PAD_L = 56;
const PAD_R = 22;
const PAD_T = 30;
const PAD_B = 52;

const PLOT_W = VB_W - PAD_L - PAD_R;
const PLOT_H = VB_H - PAD_T - PAD_B;

/** Fixed, so the columns stay comparable if the figures are ever recomputed. */
const Y_MAX = 6;

const COL_W = 46;

export default function PrepaymentDecayChart({
  points,
  amount,
}: {
  points: Point[];
  amount: string;
}) {
  const slotW = PLOT_W / points.length;
  const cx = (i: number) => PAD_L + i * slotW + slotW / 2;
  const y = (v: number) => PAD_T + PLOT_H - (v / Y_MAX) * PLOT_H;

  const gridVals = [0, 1, 2, 3, 4, 5, 6];

  return (
    <figure className="mt-10">
      <figcaption className="label mb-3">
        What {amount} saves per dollar, by the year it lands. The heavy rule
        marks one dollar saved per dollar sent.
      </figcaption>

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full"
        role="img"
        aria-label={`Interest saved per dollar committed for a ${amount} lump sum on a $340,000 loan at 6.75 percent over 30 years, by the year the money lands. ${points
          .map((p) => `Year ${p.year}: $${p.perDollar.toFixed(2)} per dollar.`)
          .join(
            " ",
          )} The break-even line at one dollar per dollar falls above the year 20 and year 25 columns.`}
      >
        {/* Horizontal gridlines */}
        {gridVals.map((v) => (
          <line
            key={v}
            x1={PAD_L}
            x2={VB_W - PAD_R}
            y1={y(v)}
            y2={y(v)}
            stroke="var(--line)"
            strokeWidth="1"
          />
        ))}

        {/* Y axis labels */}
        {gridVals.map((v) => (
          <text
            key={`y${v}`}
            x={PAD_L - 10}
            y={y(v) + 4}
            textAnchor="end"
            className="chart-tick"
            fill="var(--muted)"
            fontSize="11"
          >
            {`$${v}`}
          </text>
        ))}

        {points.map((p, i) => {
          const h = PAD_T + PLOT_H - y(p.perDollar);
          return (
            <g key={p.year}>
              <rect
                x={cx(i) - COL_W / 2}
                y={y(p.perDollar)}
                width={COL_W}
                height={h}
                fill="var(--brass)"
              />

              {/* Value label above the column */}
              <text
                x={cx(i)}
                y={y(p.perDollar) - 8}
                textAnchor="middle"
                fill="var(--ink)"
                fontSize="12"
                fontWeight="700"
              >
                {`$${p.perDollar.toFixed(2)}`}
              </text>

              {/* Year label below the axis */}
              <text
                x={cx(i)}
                y={VB_H - PAD_B + 18}
                textAnchor="middle"
                className="chart-tick"
                fill="var(--ink-2)"
                fontSize="12"
              >
                {`yr ${p.year}`}
              </text>
            </g>
          );
        })}

        {/* The break-even rule, drawn last so it sits over the columns */}
        <line
          x1={PAD_L}
          x2={VB_W - PAD_R}
          y1={y(1)}
          y2={y(1)}
          stroke="var(--line-strong)"
          strokeWidth="3"
        />
        {/* No in-chart label on this rule, deliberately.
            Two attempts were rasterized on August 21 and both collided: the
            long form hit the year 20 value label at 700px, the short form hit
            year 25 at 345px. The rule sits exactly on the $1 axis tick, which
            already names it, so the meaning moves to the figcaption where it
            cannot collide with anything at any width. */}

        {/* Baseline */}
        <line
          x1={PAD_L}
          x2={VB_W - PAD_R}
          y1={y(0)}
          y2={y(0)}
          stroke="var(--line-strong)"
          strokeWidth="2"
        />
      </svg>
    </figure>
  );
}
