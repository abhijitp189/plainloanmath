import { formatUSD } from "@/lib/mortgage";

// ─────────────────────────────────────────────────────────────────────────────
// Comparison bars — design guide §5.5.
//
// Two horizontal bars, principal then interest, both scaled against the LARGER
// of the two totals so the rows are directly comparable. The whole point is
// that the shorter bar is visibly shorter; scaling each row to its own width
// would make two loans of wildly different cost look identical, which is the
// commonest way a bar chart lies.
//
// The principal segment is the same length on both rows — you borrowed what
// you borrowed. All of the difference is interest, and putting the two rows
// directly above one another makes that the only thing that moves.
//
// DEPARTURE FROM §5.5, recorded rather than silent: §5.5 specifies interest in
// slate on the baseline row and BRASS on the accelerated row. Design guide §1.3
// reserves brass for savings figures and says plainly that it loses its power
// the moment it is used twice — and this page already spends it on the headline
// saving and on the erased region of the loan-life strip. A third brass element
// would be the third. Both interest segments are therefore --c-interest, which
// is also the more honest chart: the two rows differ in LENGTH, and length is
// the finding. Flagged for the design guide, not resolved here.
// ─────────────────────────────────────────────────────────────────────────────

type Bar = {
  label: string;
  principal: number;
  interest: number;
  emphasis?: boolean;
};

export default function TotalPaidBars({
  baselinePrincipal,
  baselineInterest,
  acceleratedPrincipal,
  acceleratedInterest,
}: {
  baselinePrincipal: number;
  baselineInterest: number;
  acceleratedPrincipal: number;
  acceleratedInterest: number;
}) {
  const bars: Bar[] = [
    {
      label: "Scheduled payments only",
      principal: baselinePrincipal,
      interest: baselineInterest,
    },
    {
      label: "With your extra payments",
      principal: acceleratedPrincipal,
      interest: acceleratedInterest,
      emphasis: true,
    },
  ];

  const max = Math.max(
    baselinePrincipal + baselineInterest,
    acceleratedPrincipal + acceleratedInterest,
    1,
  );

  return (
    <figure className="mt-7">
      <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-2 text-[0.82rem] text-ink-2">
        <LegendItem color="var(--c-pi)">What you borrowed</LegendItem>
        <LegendItem color="var(--c-interest)">Interest on top</LegendItem>
      </ul>

      <div className="space-y-4">
        {bars.map((bar) => {
          const total = bar.principal + bar.interest;
          const pPct = (bar.principal / max) * 100;
          const iPct = (bar.interest / max) * 100;

          return (
            <div key={bar.label}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <span className="text-[0.88rem] text-ink-2">{bar.label}</span>
                <span
                  className={`num text-[0.95rem] ${
                    bar.emphasis ? "font-semibold text-ink" : "text-muted"
                  }`}
                >
                  {formatUSD(total)}
                </span>
              </div>

              {/* A plain flex row rather than an SVG: two rectangles side by
                  side is what CSS is for, it scales without a viewBox, and the
                  figures beside it are real text a screen reader already gets
                  in reading order. */}
              {/* No track behind the bars. --paper-2 measures 1.30:1 against
                  the white panel, so the right-hand end of the track — the
                  thing that would carry "and this much you do not pay" — was
                  invisible anyway. Both bars start at the same left edge and
                  are scaled to the same maximum, so the comparison is the
                  difference in length, which needs no track to read. */}
              <div
                className="mt-1.5 flex h-6 w-full"
                role="img"
                aria-label={`${bar.label}: ${formatUSD(
                  bar.principal,
                )} of principal plus ${formatUSD(bar.interest)} of interest`}
              >
                <span
                  className="block h-full"
                  style={{
                    width: `${pPct}%`,
                    background: "var(--c-pi)",
                    // Browsers drop background colors when printing unless
                    // told otherwise, and design guide §9 expects the print
                    // view to carry the figures. Two bars that print white are
                    // worse than no bars.
                    printColorAdjust: "exact",
                    WebkitPrintColorAdjust: "exact",
                  }}
                />
                {/* A --surface hairline so the two segments never merge into
                    one bar at low contrast — design guide §7, color is never
                    the only signal. */}
                {/* --c-pi against --c-interest is 1.24:1 — the two segments
                    do not separate by hue at all. The separator is what makes
                    the boundary legible (design guide §7, color is never the
                    only signal), so it is 2px rather than a hairline: at 1px
                    it disappears on a phone. --surface clears 3:1 against both
                    fills (6.15:1 and 4.98:1). */}
                <span
                  className="block h-full w-0.5 shrink-0 bg-surface"
                  aria-hidden="true"
                />
                <span
                  className="block h-full"
                  style={{
                    width: `${iPct}%`,
                    background: "var(--c-interest)",
                    printColorAdjust: "exact",
                    WebkitPrintColorAdjust: "exact",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </figure>
  );
}

function LegendItem({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="inline-block h-3 w-3 shrink-0"
        style={{ background: color }}
      />
      {children}
    </li>
  );
}
