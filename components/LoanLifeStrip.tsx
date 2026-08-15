import type { PayoffRow } from "@/lib/mortgage";
import { formatDuration } from "@/lib/mortgage";

// ─────────────────────────────────────────────────────────────────────────────
// The loan-life strip — design guide §5.2.
//
// One thin vertical mark per month of the loan. Each mark is a column split
// between the interest and the principal that month's SCHEDULED payment buys,
// so the strip runs slate at the start and teal at the end and the
// front-loading of interest becomes something a reader can see rather than
// read. Months the extra payments erase are drawn short, in a 45° brass hatch.
//
// ── Three decisions worth reading before editing ────────────────────────────
//
// 1. THE VIEWBOX IS A FIXED 720 × 112, ALWAYS. The month slot is sized to fit
//    (720 / months) rather than the viewBox being sized to the months. If the
//    viewBox width tracked the term, switching 30 years to 15 would halve it,
//    and with preserveAspectRatio="meet" the rendered HEIGHT would double
//    mid-keystroke. A constant aspect ratio means the graphic never changes
//    size while someone types, which is the same requirement design guide §5.1
//    puts on result containers. It also keeps the hatch at a true 45° and every
//    stroke at a uniform weight, neither of which survives
//    preserveAspectRatio="none".
//
// 2. THE COLUMNS ARE STACKED, NOT INTERPOLATED. §5.2 specifies each mark's
//    color interpolated between --c-interest and --c-pi-2 by principal share.
//    Interpolating needs both endpoint hexes in JavaScript, and a hex copied
//    out of globals.css into a component is the palette drift §1.1 exists to
//    prevent — the token would live in three files instead of two. A stacked
//    column carries the same information more precisely, since the reader sees
//    the actual proportion rather than a color standing in for it, and every
//    color stays a CSS variable. The slate-to-teal gradient across the strip is
//    the emergent result either way.
//
//    Contrast, computed August 12, 2026: --c-pi-2 against --c-interest is
//    1.54:1, and NO pair in the data palette clears 3:1 against --c-interest
//    (--c-pi is 1.24:1, --before is 1.59:1). Two segments meeting inside one
//    column is a case the palette was never designed for. Rather than change
//    the palette inside a component — a rule change goes in the document first
//    — the boundary carries a --surface frontier line, so hue is not the only
//    signal (§7). The frontier is also the finding: it is the curve of
//    principal share rising across the life of the loan.
//
// 3. NO TEXT INSIDE THE SVG. §5.1 wants chart text at 13px minimum and inside
//    the viewBox. Every label here is HTML above or below the graphic, which
//    §5.1 requires for legends in any case and which removes the whole class of
//    clipped-caption defects.
//
// PERFORMANCE. A 360-month loan is 360 columns, redrawn on a 90ms debounce
// while someone types. Each layer is therefore ONE <path> with 360 subpaths
// rather than 360 <rect> elements — five nodes for the whole graphic instead of
// seven hundred.
// ─────────────────────────────────────────────────────────────────────────────

// Geometry. The 720 × 170 ratio is roughly 4:1, chosen by rendering the strip
// at 345px (the usable width inside a 375px phone, design guide §3.1) and
// looking at it: at the 6.4:1 ratio this was first drawn to, a phone got a
// 54px band that read as a stripe rather than as a chart. 4:1 gives 81px on a
// phone and 179px in a 760px column, which is a chart at both ends.
const VW = 720; // viewBox width, constant — see decision 1 above
const VH = 170; // viewBox height, constant
const BASE = 150; // baseline y
const TOP = 14; // top of a full-height mark
const SPAN = BASE - TOP;
const ERASED_HEIGHT = 38; // erased months are drawn short

export default function LoanLifeStrip({
  accelerated,
  baselineMonths,
  monthsSaved,
  crossover,
}: {
  /** The schedule actually paid. */
  accelerated: PayoffRow[];
  /** Months the loan would have run with no extra payment. */
  baselineMonths: number;
  monthsSaved: number;
  /**
   * The month principal first exceeds interest, marked with a rule.
   *
   * Optional, and undefined on the payoff calculator, where the reader is
   * looking at what their extra payments erase and a second vertical rule
   * beside the payoff marker would be two lines meaning two different things
   * with nothing to tell them apart. The article at
   * /learn/when-you-start-paying-more-principal-than-interest/ is the reverse
   * case: the crossing IS the subject, and the strip is the only place a
   * reader can see it rather than be told it.
   */
  crossover?: number | null;
}) {
  const paid = accelerated.length;
  const total = Math.max(baselineMonths, paid);
  if (total === 0 || paid === 0) return null;

  const slot = VW / total;
  // 0.9 rather than a wider gap: on a 360-month loan at phone width a slot is
  // under one device pixel, and a 15% gap becomes sub-pixel aliasing that
  // reads as dirty banding rather than as separate months. At 0.9 the marks
  // still separate visibly on a desktop column, where the slot is ~2px.
  const mark = slot * 0.9;

  const interest: string[] = [];
  const principal: string[] = [];
  const frontier: string[] = [];

  for (let i = 0; i < paid; i++) {
    const row = accelerated[i];
    const x = i * slot;

    // The share of this month's SCHEDULED payment that reduces the balance.
    // `extra` is excluded on purpose: the strip is about what the payment the
    // borrower already had is buying. Including a lump sum would spike one
    // column to full teal and say nothing about the loan.
    const scheduled = row.interest + row.principal;
    const share =
      scheduled > 0 ? Math.min(Math.max(row.principal / scheduled, 0), 1) : 1;
    const split = BASE - SPAN * share;

    interest.push(
      `M${x.toFixed(2)} ${BASE}V${TOP}H${(x + mark).toFixed(2)}V${BASE}Z`,
    );
    principal.push(
      `M${x.toFixed(2)} ${BASE}V${split.toFixed(2)}H${(x + mark).toFixed(
        2,
      )}V${BASE}Z`,
    );
    frontier.push(
      `M${x.toFixed(2)} ${split.toFixed(2)}H${(x + mark).toFixed(2)}`,
    );
  }

  const erasedCount = Math.max(total - paid, 0);
  const erased: string[] = [];
  for (let i = paid; i < total; i++) {
    const x = i * slot;
    erased.push(
      `M${x.toFixed(2)} ${BASE}V${BASE - ERASED_HEIGHT}H${(x + mark).toFixed(
        2,
      )}V${BASE}Z`,
    );
  }

  const markerX = paid * slot;

  // Centered on the month's own mark rather than on its leading edge: at 360
  // months a slot is 2 user units, so the difference is invisible on a desktop
  // and the center is the honest position either way.
  const crossX =
    crossover && crossover >= 1 && crossover <= paid
      ? (crossover - 0.5) * slot
      : null;

  return (
    <figure className="mt-7">
      {/* Legend in HTML, never inside the SVG — design guide §5.1. */}
      <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-2 text-[0.82rem] text-ink-2">
        <LegendItem color="var(--c-pi-2)">Principal</LegendItem>
        <LegendItem color="var(--c-interest)">Interest</LegendItem>
        {erasedCount > 0 && (
          <LegendItem color="var(--brass)">Erased by your extra</LegendItem>
        )}
      </ul>

      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={
          monthsSaved > 0
            ? `One mark per month of the loan. Early months are almost entirely interest and later months almost entirely principal, and the final ${formatDuration(
                monthsSaved,
              )} of the original term are erased by the extra payments.`
            : crossX !== null
              ? `One mark per month of the loan. Early months are almost entirely interest and later months are almost entirely principal, and the two halves become equal at month ${crossover}.`
              : "One mark per month of the loan. Early months are almost entirely interest and later months are almost entirely principal."
        }
      >
        <defs>
          <pattern
            id="loan-strip-erased"
            width="7"
            height="7"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="7" height="7" fill="var(--brass-soft)" />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="7"
              stroke="var(--brass)"
              strokeWidth="2.4"
            />
          </pattern>
        </defs>

        {/* No ground line. One was drawn here in --line-strong and removed on
            August 12: the columns already form a solid bottom edge, so it was
            invisible everywhere except under the erased hatch — and
            --line-strong measures 1.80:1 on white against the 3:1 floor for a
            meaningful graphic (design guide §7.2, still open). Removing it was
            cheaper than shipping a failing element that did nothing. */}

        <path d={interest.join("")} fill="var(--c-interest)" />
        <path d={principal.join("")} fill="var(--c-pi-2)" />

        {/* The frontier — see decision 2 in the header. Hue alone does not
            separate these two fills, so the boundary is drawn. */}
        <path
          d={frontier.join("")}
          fill="none"
          stroke="var(--surface)"
          strokeWidth="2.4"
          strokeLinecap="butt"
        />

        {/* The crossover rule. Accent, not brass: the crossing is a date, and
            brass means money you do not pay (design guide §1.3). It measures
            6.15:1 on --surface and 5.33:1 over either fill, well past the 3:1
            a meaningful graphic needs, and it is dashed so it does not read as
            a third data series. */}
        {crossX !== null && (
          <line
            x1={crossX}
            y1="0"
            x2={crossX}
            y2={BASE + 7}
            stroke="var(--accent)"
            strokeWidth="3"
            strokeDasharray="7 5"
            strokeLinecap="butt"
          />
        )}

        {erasedCount > 0 && (
          <>
            <path d={erased.join("")} fill="url(#loan-strip-erased)" />
            {/* Payoff marker. Accent rather than brass: §1.3 gives brass to the
                saving itself, which on this graphic is the hatched region, and
                a second brass element would spend the one loud color twice. */}
            <line
              x1={markerX}
              y1="0"
              x2={markerX}
              y2={BASE + 7}
              stroke="var(--accent)"
              strokeWidth="3"
              strokeDasharray="7 5"
            />
          </>
        )}
      </svg>

      <figcaption className="mt-2.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[0.82rem] text-muted">
        <span>Month 1</span>
        {crossX !== null && (
          <span className="text-ink">
            Principal overtakes interest at month{" "}
            <span className="num font-semibold">{crossover}</span>
          </span>
        )}
        {erasedCount > 0 && (
          <span className="text-ink">
            <span className="num font-semibold">
              {formatDuration(monthsSaved)}
            </span>{" "}
            erased
          </span>
        )}
        <span>
          Month <span className="num">{total}</span>
        </span>
      </figcaption>
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
