/**
 * The PMI window, by down payment.
 *
 * One horizontal bar per down payment tier. The bar runs from month 0 to the
 * month the borrower may first REQUEST cancellation at 80% of original value,
 * then continues in a second segment to the month the servicer must terminate
 * at 78% unasked.
 *
 * The second segment is the subject of the chart, and it carries the brass.
 * Design guide: brass means money the reader does not pay, one meaning, used
 * consistently. That segment is premium a borrower who writes to the servicer
 * on the first day of the window never pays, which is the only actionable
 * figure on the page. The first segment is neutral: those months are owed
 * either way and no letter shortens them.
 *
 * The month 181 rule is drawn because it sits to the RIGHT of every bar. That
 * is the point of including it: on all five loans the 78% date arrives first,
 * so § 4902(c) never governs any of them, and a reader who has been told
 * elsewhere to look at the midpoint can see why that advice missed.
 *
 * viewBox is constant and the data is scaled into it (design guide §5).
 */

type Tier = {
  label: string;
  requestMonth: number;
  automaticMonth: number;
};

const VB_W = 700;
const VB_H = 340;

const PAD_L = 74;
const PAD_R = 26;
const PAD_T = 34;
const PAD_B = 46;

const PLOT_W = VB_W - PAD_L - PAD_R;
const PLOT_H = VB_H - PAD_T - PAD_B;

/** Months on the x axis. Fixed, so bars are comparable across renders. */
const X_MAX = 192;

const BAR_H = 22;

export default function PmiWindowChart({
  tiers,
  finalMonth,
}: {
  tiers: Tier[];
  finalMonth: number;
}) {
  const x = (month: number) => PAD_L + (month / X_MAX) * PLOT_W;
  const rowH = PLOT_H / tiers.length;
  const y = (i: number) => PAD_T + i * rowH + (rowH - BAR_H) / 2;

  const yearTicks = [0, 24, 48, 72, 96, 120, 144, 168];

  return (
    <figure className="mt-10">
      <figcaption className="label mb-3">
        The window between asking and waiting, by down payment
      </figcaption>

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full"
        role="img"
        aria-label={`Months until PMI can be requested off and until it ends automatically, by down payment, on a $425,000 home at 6.75 percent over 30 years. ${tiers
          .map(
            (t) =>
              `${t.label} down: may request at month ${t.requestMonth}, automatic at month ${t.automaticMonth}.`,
          )
          .join(" ")} The midpoint deadline at month ${finalMonth} falls after every one of them.`}
      >
        {/* Year gridlines */}
        {yearTicks.map((m) => (
          <line
            key={m}
            x1={x(m)}
            x2={x(m)}
            y1={PAD_T - 8}
            y2={VB_H - PAD_B}
            stroke="var(--line)"
            strokeWidth="1"
          />
        ))}

        {/* X axis labels, every 24 months */}
        {yearTicks.map((m) => (
          <text
            key={`l${m}`}
            x={x(m)}
            y={VB_H - PAD_B + 18}
            textAnchor="middle"
            className="chart-tick"
            fill="var(--muted)"
            fontSize="11"
          >
            {m === 0 ? "0" : `yr ${m / 12}`}
          </text>
        ))}

        {tiers.map((t, i) => (
          <g key={t.label}>
            {/* Row label */}
            <text
              x={PAD_L - 12}
              y={y(i) + BAR_H / 2 + 4}
              textAnchor="end"
              fill="var(--ink-2)"
              fontSize="12"
            >
              {t.label} down
            </text>

            {/* Segment 1: months owed either way */}
            <rect
              x={x(0)}
              y={y(i)}
              width={x(t.requestMonth) - x(0)}
              height={BAR_H}
              fill="var(--c-pmi)"
            />

            {/* Segment 2: the window a written request closes */}
            <rect
              x={x(t.requestMonth)}
              y={y(i)}
              width={x(t.automaticMonth) - x(t.requestMonth)}
              height={BAR_H}
              fill="var(--brass)"
            />

            {/* The frontier between two adjacent fills, drawn rather than
                relied on for contrast (design guide §1.4). */}
            <line
              x1={x(t.requestMonth)}
              x2={x(t.requestMonth)}
              y1={y(i)}
              y2={y(i) + BAR_H}
              stroke="var(--surface)"
              strokeWidth="2"
            />

            {/* End-of-window label */}
            <text
              x={x(t.automaticMonth) + 7}
              y={y(i) + BAR_H / 2 + 4}
              fill="var(--ink-2)"
              fontSize="11"
            >
              mo {t.requestMonth} to {t.automaticMonth}
            </text>
          </g>
        ))}

        {/* The midpoint deadline, § 4902(c). To the right of every bar. */}
        <line
          x1={x(finalMonth)}
          x2={x(finalMonth)}
          y1={PAD_T - 14}
          y2={VB_H - PAD_B}
          stroke="var(--ink)"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
        <text
          x={x(finalMonth)}
          y={PAD_T - 20}
          textAnchor="end"
          fill="var(--ink)"
          fontSize="11"
          fontWeight="700"
        >
          midpoint deadline, month {finalMonth}
        </text>
      </svg>

      <p className="mt-4 max-w-prose text-[0.88rem] text-ink-2">
        The brass segment is the window: months in which the borrower is
        entitled to ask and the servicer is not required to act. Writing to the
        servicer on the first day of it removes those premiums. Waiting pays
        them. The dashed rule is the outer limit under 12 U.S.C. § 4902(c),
        and it sits past every bar, so on none of these loans does the midpoint
        rule do any work.
      </p>
    </figure>
  );
}
