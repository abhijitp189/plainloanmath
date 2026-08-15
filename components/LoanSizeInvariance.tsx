import { amortize, formatUSD } from "@/lib/mortgage";

// ─────────────────────────────────────────────────────────────────────────────
// Three loans, one crossover — design guide §5.1.
//
// Three small multiples, one per loan size, each plotting the interest and the
// principal portion of every scheduled payment across the full term. The three
// y-scales differ by a factor of nine. The crossing sits at the identical x
// position in all three.
//
// WHY THIS EXISTS. The claim it carries — that the month principal overtakes
// interest does not depend on how much was borrowed — reads as wrong. A reader
// who is told it will not believe it. A reader who sees three curves of wildly
// different magnitude cross at the same place has no way not to.
//
// ── Four decisions worth reading before editing ─────────────────────────────
//
// 1. THE VIEWBOX IS CONSTANT AND THE PANELS ARE FIXED. 720 × 260, three rows
//    stacked. Nothing here is data-driven except the paths, so the rendered
//    height cannot change (§5.1). This component takes no user input at all —
//    it is built once at build time from constants — but the rule holds
//    anyway, because the next person to reach for this file may not know that.
//
// 2. EACH PANEL IS SCALED TO ITS OWN MAXIMUM, AND THAT IS THE POINT. A shared
//    y-scale would flatten the $100,000 loan into a line at the bottom of the
//    box and the graphic would say nothing. Scaling each panel independently
//    is normally a way to mislead; here the deception it usually produces —
//    "these look the same" — is the true finding, and the dollar figures on
//    each panel say plainly that the magnitudes are not the same.
//
// 3. NO TEXT INSIDE THE SVG (§5.1). The loan labels and the axis ends are HTML
//    around the graphic. This removes the whole class of clipped-caption
//    defects at 345px and is why there is no minimum font size to check.
//
// 4. THE TWO SERIES ARE 1.54:1 APART AND MUST NOT TOUCH (§1.4, §7.1).
//    --c-pi-2 against --c-interest fails every contrast floor, so hue is not
//    the only signal: the interest series is dashed, the principal series is
//    solid, and where they cross the marker rule separates them. Same problem
//    the loan-life strip solves with a drawn frontier; here the lines are
//    strokes rather than adjacent fills, so a dash pattern is the cheaper fix.
// ─────────────────────────────────────────────────────────────────────────────

const VW = 720;
// 104, not 74. At 74 the panel rendered 35px tall at 345px, thinner than the
// 54px stripe design guide §5.2 already rejected once as unreadable on a
// phone. 104 gives 50px per panel, which is where the two strokes separate
// clearly enough to see them cross. Found by rasterizing, not by reasoning.
const PANEL_H = 104; // plot height of one panel
const GAP = 19; // vertical space between panels
const PAD_R = 4; // keeps the final stroke inside the box

/** Every panel is the same loan at the same rate and term, sized differently. */
const RATE_PCT = 6.75;
const TERM_MONTHS = 360;
const SIZES = [100_000, 340_000, 900_000];

type Panel = {
  size: number;
  interest: string;
  principal: string;
  crossover: number;
  firstInterest: number;
};

function buildPanel(size: number, top: number): Panel {
  const { schedule } = amortize(size, RATE_PCT, TERM_MONTHS);
  const months = schedule.length;

  // Scaled to the largest value EITHER series reaches, not to month one's
  // interest.
  //
  // Month-one interest was the obvious peak and the wrong one. On a level
  // payment the principal portion climbs past it: at 6.75% over 30 years the
  // first month's interest is about $1,912 and the last month's principal is
  // about $2,193, so scaling to the former ran the principal stroke 15% above
  // the top of the panel, where it was silently clipped. Rasterizing caught it
  // (design guide §5.7); no computed check would have. Same failure the
  // recovery chart had on its lower bound in August, and the same fix: let the
  // domain follow the data instead of assuming which end is extreme.
  const peak = schedule.reduce(
    (max, row) => Math.max(max, row.interest, row.principal),
    0,
  );
  const step = (VW - PAD_R) / (months - 1);
  const y = (v: number) => top + PANEL_H - (v / peak) * PANEL_H;

  const interest: string[] = [];
  const principal: string[] = [];
  let crossover = months;

  for (let i = 0; i < months; i++) {
    if (schedule[i].principal > schedule[i].interest) {
      crossover = schedule[i].month;
      break;
    }
  }

  // SAMPLED, NOT EVERY MONTH — and the reason is page weight, not looks.
  //
  // Three panels at 360 months, two series each, is 2,160 coordinate pairs and
  // it took this page from 30 KB gzipped to 62 KB, double the heaviest
  // calculator page, for a graphic whose whole job is showing that three
  // curves cross in the same place. Both series are smooth, and at the widest
  // this ever renders one month is about two device pixels, so every fourth
  // month is visually identical and costs a quarter as much.
  //
  // MONTH ONE, THE CROSSOVER MONTH AND THE FINAL MONTH ARE ALWAYS INCLUDED.
  // The first two matter: without the crossover as a real sample the two
  // polylines would intersect wherever the straight segments happened to meet,
  // which could sit a pixel or two off the marker rule and quietly undermine
  // the one claim the graphic exists to make.
  const keep = new Set([1, crossover, months]);
  for (let m = 1; m <= months; m += 4) keep.add(m);

  let started = false;
  for (let i = 0; i < months; i++) {
    const row = schedule[i];
    if (!keep.has(row.month)) continue;
    const x = (i * step).toFixed(1);
    const cmd = started ? "L" : "M";
    interest.push(`${cmd}${x} ${y(row.interest).toFixed(1)}`);
    principal.push(`${cmd}${x} ${y(row.principal).toFixed(1)}`);
    started = true;
  }

  return {
    size,
    interest: interest.join(" "),
    principal: principal.join(" "),
    crossover,
    firstInterest: schedule[0].interest,
  };
}

export default function LoanSizeInvariance() {
  const panels = SIZES.map((size, i) => buildPanel(size, i * (PANEL_H + GAP)));

  // All three are equal by construction; asserting it here rather than
  // trusting it means a future change to the engine that broke the invariant
  // would fail the build instead of quietly publishing a false graphic.
  const crossover = panels[0].crossover;
  if (panels.some((p) => p.crossover !== crossover)) {
    throw new Error(
      "LoanSizeInvariance: the three loan sizes no longer cross at the same month.",
    );
  }

  const months = TERM_MONTHS;
  const crossX = (((crossover - 1) * (VW - PAD_R)) / (months - 1)).toFixed(2);

  return (
    <figure className="panel min-h-[26rem] p-5 sm:p-6">
      <p className="label">
        Interest and principal per payment, {RATE_PCT}% over 30 years
      </p>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.82rem] text-ink-2">
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-0 w-6 shrink-0 border-t-[3px] border-dashed"
            style={{ borderColor: "var(--c-interest)" }}
          />
          Interest
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-0 w-6 shrink-0 border-t-[3px]"
            style={{ borderColor: "var(--c-pi-2)" }}
          />
          Principal
        </li>
      </ul>

      <div className="mt-4 space-y-1">
        {panels.map((p, i) => (
          <div key={p.size}>
            <p className="flex items-baseline justify-between gap-3 text-[0.84rem]">
              <span className="num font-bold text-ink">
                {formatUSD(p.size)}
              </span>
              <span className="text-muted">
                first payment{"'"}s interest{" "}
                <span className="num">{formatUSD(p.firstInterest)}</span>
              </span>
            </p>

            <svg
              className="mt-1 block w-full"
              width="100%"
              viewBox={`0 0 ${VW} ${PANEL_H}`}
              preserveAspectRatio="xMidYMid meet"
              style={{
                printColorAdjust: "exact",
                WebkitPrintColorAdjust: "exact",
              }}
              role="img"
              aria-label={`On a ${formatUSD(
                p.size,
              )} loan at ${RATE_PCT}% over 30 years, the principal portion of the payment overtakes the interest portion at month ${crossover}.`}
            >
              <g transform={`translate(0 ${-i * (PANEL_H + GAP)})`}>
                <line
                  x1={crossX}
                  y1={i * (PANEL_H + GAP)}
                  x2={crossX}
                  y2={i * (PANEL_H + GAP) + PANEL_H}
                  stroke="var(--accent)"
                  strokeWidth="3"
                  strokeDasharray="7 5"
                />
                <path
                  d={p.interest}
                  fill="none"
                  stroke="var(--c-interest)"
                  strokeWidth="3"
                  strokeDasharray="9 6"
                  strokeLinecap="butt"
                />
                <path
                  d={p.principal}
                  fill="none"
                  stroke="var(--c-pi-2)"
                  strokeWidth="3"
                  strokeLinecap="butt"
                />
              </g>
            </svg>
          </div>
        ))}
      </div>

      <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-line pt-2.5 text-[0.82rem] text-muted">
        <span>Month 1</span>
        <span className="text-ink">
          All three cross at month <span className="num">{crossover}</span>
        </span>
        <span>
          Month <span className="num">{months}</span>
        </span>
      </figcaption>
    </figure>
  );
}
