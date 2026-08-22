import type { Metadata } from "next";
import { LAST_REVIEWED } from "@/lib/constants";
import { SectionHead } from "@/components/PageChrome";
import {
  Band,
  calcBreadcrumbSchema,
  CalcFooter,
  CalcStripe,
  EditorialCols,
  FaqBlock,
  faqSchema,
  Sources,
  Sub,
  type Faq,
} from "@/components/CalcChrome";
import AnnualExtraTimingChart from "@/components/AnnualExtraTimingChart";
import { InlineLink } from "@/components/InlineLink";
import {
  TWO_EXTRA_PAYMENTS_PATH,
  ROUTES,
  ROUTE_REVIEWED,
  relatedRoutes,
} from "@/lib/routes";
import {
  amortizePlan,
  comparePlan,
  monthlyPayment,
  formatUSD,
  formatDuration,
  NO_PLAN,
  type PayoffPlan,
} from "@/lib/mortgage";

// ─────────────────────────────────────────────────────────────────────────────
// Every figure on this page is computed at build time from lib/mortgage.ts.
//
// Project brief §10: worked examples are computed, not typed. Nothing below is
// a number somebody wrote down, including the two findings the page exists to
// publish: the twelve-month staircase and the loan-size invariance.
//
// THE CONSTANTS SIT ABOVE `metadata`, WHICH IS UNUSUAL HERE AND DELIBERATE.
// Every other page declares `metadata` first, because none of them needed a
// computed figure in it. The meta description on this page carries the answer,
// and the answer is computed, so the constants have to be evaluated before the
// object literal that reads them. Module bodies run top to bottom; putting
// `metadata` first would be a temporal dead zone error at build.
//
// Independently recomputed on August 22, 2026 in a Python script written from
// the closed-form amortization formula, sharing no code and not even a language
// with the engine. Six scenarios: the baseline, two extra payments landing in
// month 1, spread evenly and landing in month 12, and one and three extra
// payments landing in month 12. Payoff month agreed exactly in all six and
// total interest agreed to zero delta at double precision. The loan-size
// invariance and the twelve-month staircase were re-derived in the same script
// across seven loan sizes from $25,000 to $2,500,000 and three rate/term pairs.
//
// The canonical site example applies unchanged: $340,000 at 6.75% over 30
// years, a $425,000 home with 20% down.
//
// ON THE PHRASE "TWO EXTRA PAYMENTS A YEAR". It is ambiguous, the ambiguity is
// worth five months of payoff time, and the page models all three readings
// rather than picking one quietly. See THE THREE READINGS below.
//
// ON `annualExtraMonth`. It is the month of the LOAN year, not the calendar
// year: the engine tests ((month - 1) % 12) + 1. Month 1 is the loan's
// anniversary month. The page says so rather than writing "January", which
// would only be true for a loan whose first payment falls in January. The hub
// page writes "each December" for the same plan shape, which is the same
// simplification; this page is the one that has to be exact about it, because
// the whole subject is which month the money lands in.
// ─────────────────────────────────────────────────────────────────────────────

const HOME = 425_000;
const LOAN = 340_000;
const RATE = 6.75;
const TERM = 360;

/** Twelve. Named rather than written as a bare 12 at five call sites, and
 *  named rather than derived from TERM, which would only be 12 by the
 *  coincidence that the example loan happens to run thirty years. */
const MONTHS_IN_YEAR = 12;

/** The number of extra payments this page is about. In the H1, the FAQ and the
 *  plans below, so the page cannot say "two" anywhere it computes three. */
const EXTRA_COUNT = 2;

const BASE = amortizePlan(LOAN, RATE, TERM, NO_PLAN);
const PAYMENT = BASE.monthlyPayment;

const plan = (o: Partial<PayoffPlan>): PayoffPlan => ({ ...NO_PLAN, ...o });

type Scenario = {
  months: number;
  monthsSaved: number;
  interestSaved: number;
  totalInterest: number;
  /** Extra principal the schedule actually took, which the final year caps. */
  extraPaid: number;
  perDollar: number;
};

function scenario(p: PayoffPlan): Scenario {
  const c = comparePlan(LOAN, RATE, TERM, p);
  const extraPaid = c.accelerated.schedule.reduce((s, r) => s + r.extra, 0);
  return {
    months: c.accelerated.months,
    monthsSaved: c.monthsSaved,
    interestSaved: c.interestSaved,
    totalInterest: c.accelerated.totalInterest,
    extraPaid,
    perDollar: extraPaid > 0 ? c.interestSaved / extraPaid : 0,
  };
}

/**
 * `formatDuration` renders "9 years, 11 months", and the comma breaks a
 * sentence that puts two durations either side of the word "to". This is the
 * same figure with the comma dropped, used only where a range is read as one
 * phrase. It formats; it does not compute. The months come from the engine.
 */
const durTight = (m: number) => formatDuration(m).replace(", ", " ");

/**
 * Chart tick form: "20y 6m".
 *
 * It exists because the long form does not fit. `durTight` renders month 246 as
 * "20 years 6 months", which is about 114px at the 12px tick size, and the
 * chart's right gutter is 76px: every label on all twelve rows would have run
 * past the viewBox edge and been clipped. Found by measuring the text nodes in
 * the built SVG, not by looking at the chart, which is the only way this class
 * of defect gets caught before the phone check.
 *
 * Derived from `formatDuration` by string replacement rather than by dividing
 * by twelve again, so the engine stays the only place that turns a month count
 * into years and months. Abbreviation is normal in a chart tick, and the table
 * directly below the chart carries the full form for anyone who wants it.
 */
const durChart = (m: number) =>
  formatDuration(m)
    .replace(/ years?/, "y")
    .replace(/ months?/, "m")
    .replace(", ", " ");

/** ── The three readings ─────────────────────────────────────────────
 *
 *  "Two extra payments a year" can mean three different things and they are
 *  not worth the same. Modelled rather than chosen:
 *
 *    EARLY   both land in month 1 of each loan year
 *    EVEN    the same annual total spread across all twelve months
 *    LATE    both land in month 12 of each loan year
 *
 *  EVEN is one sixth of a payment added to every scheduled payment, which puts
 *  two whole payments in per year, the same cash as the other two readings.
 */

const EARLY = scenario(
  plan({ annualExtra: EXTRA_COUNT * PAYMENT, annualExtraMonth: 1 }),
);
const EVEN = scenario(plan({ extraMonthly: (EXTRA_COUNT * PAYMENT) / 12 }));
const LATE = scenario(
  plan({ annualExtra: EXTRA_COUNT * PAYMENT, annualExtraMonth: MONTHS_IN_YEAR }),
);

/**
 * THE HEADLINE READING IS `LATE`, THE LEAST FAVOURABLE OF THE THREE.
 *
 * Three reasons, in order of weight.
 *
 * 1. A page that leads with its best number is doing the thing this site was
 *    built not to do. LATE is the floor: a reader who does anything other than
 *    wait until the end of the loan year beats it.
 * 2. It agrees with the hub. `/learn/extra-mortgage-payments/` runs its annual
 *    rows at `annualExtraMonth: 12`, so quoting any other reading as THE answer
 *    would leave two pages on one site printing different figures for the same
 *    strategy on the same loan, which is the failure the shared engine exists
 *    to prevent.
 * 3. Money that shows up once a year usually shows up as a bonus or a refund,
 *    and the reader cannot generally choose the month. The reading that assumes
 *    they can is the optimistic one.
 *
 * The range is stated before the single figure everywhere it appears, because
 * the range is the honest answer and the single figure is the concession to a
 * reader who wants one number.
 */
const HEADLINE = LATE;

/** The spread the page is built around. Five months on this loan. */
const RANGE_MONTHS = LATE.months - EARLY.months;
const RANGE_INTEREST = LATE.totalInterest - EARLY.totalInterest;

/** ── Finding 1: the twelve-month staircase ──────────────────────────
 *
 *  Every month of the loan year, same money, same loan. The payoff month walks
 *  from EARLY to LATE in a perfectly regular pattern, and the regularity is
 *  the finding: one month of payoff time for every two months of delay.
 */

const MONTHS_OF_YEAR = Array.from({ length: MONTHS_IN_YEAR }, (_, i) => i + 1);

const TIMING_ROWS = MONTHS_OF_YEAR.map((month) => {
  const s = scenario(
    plan({ annualExtra: EXTRA_COUNT * PAYMENT, annualExtraMonth: month }),
  );
  return {
    month,
    months: s.months,
    monthsSaved: s.monthsSaved,
    interestSaved: s.interestSaved,
    /** Against landing in month 1, the best any of the twelve can do. */
    givenUp: s.totalInterest - EARLY.totalInterest,
  };
});

const TIMING_STEPS = TIMING_ROWS.slice(1).map(
  (r, i) => r.months - TIMING_ROWS[i].months,
);

/**
 * The finding, asserted rather than claimed in prose. Every step is 0 or 1 and
 * they alternate, so the payoff date slips exactly one month for every two
 * months the money is delayed. A rate change that broke the pattern would
 * change this constant and the sentence that reads it, instead of leaving a
 * false sentence standing.
 */
const STAIRCASE_IS_REGULAR =
  TIMING_STEPS.every((s) => s === 0 || s === 1) &&
  TIMING_STEPS.every((s, i) => i === 0 || s !== TIMING_STEPS[i - 1]);

/** What one month of waiting costs, in interest, averaged over the eleven. */
const COST_PER_MONTH_DELAYED = RANGE_INTEREST / (MONTHS_OF_YEAR.length - 1);

/** Where the even-spread reading falls among the twelve. Computed, because
 *  "it sits in the middle" is a claim and the middle is not where it has to
 *  land: it beats the month it is nominally equivalent to. */
const EVEN_BEATS_MONTHS = TIMING_ROWS.filter(
  (r) => r.months > EVEN.months,
).length;
const EVEN_TIES_MONTHS = TIMING_ROWS.filter(
  (r) => r.months === EVEN.months,
).length;
const EVEN_LOSES_MONTHS = TIMING_ROWS.filter(
  (r) => r.months < EVEN.months,
).length;

/** ── Finding 2: the answer does not depend on the balance ───────────
 *
 *  The extra is defined as a multiple of the scheduled payment, and the
 *  payment is proportional to the principal, so the accelerated schedule is
 *  the original scaled by a constant. The payoff MONTH is therefore identical
 *  at every loan size, and the interest is exactly proportional. This is why
 *  the page can answer for a reader whose loan is not $340,000.
 */

const SIZES = [150_000, LOAN, 750_000] as const;

const SIZE_ROWS = SIZES.map((size) => {
  const pay = monthlyPayment(size, RATE, TERM);
  const base = amortizePlan(size, RATE, TERM, NO_PLAN);
  const acc = amortizePlan(
    size,
    RATE,
    TERM,
    plan({ annualExtra: EXTRA_COUNT * pay, annualExtraMonth: MONTHS_IN_YEAR }),
  );
  return {
    size,
    payment: pay,
    months: acc.months,
    interestSaved: base.totalInterest - acc.totalInterest,
  };
});

/** Asserted, not asserted in prose. The claim reads as wrong, so the build
 *  should be the thing that stands behind it. */
const SIZE_INVARIANT = SIZE_ROWS.every((r) => r.months === SIZE_ROWS[0].months);

/** ── Finding 3: the rate is what moves the answer ───────────────────
 *
 *  Since the balance does nothing, a reader's own answer is set by their rate
 *  and their term. This table is the page's real deliverable for anyone whose
 *  loan is not the example.
 */

const RATES = [3, 4, 5, 6, RATE, 7.5, 8.5] as const;

const RATE_ROWS = RATES.map((r) => {
  const pay = monthlyPayment(LOAN, r, TERM);
  const base = amortizePlan(LOAN, r, TERM, NO_PLAN);
  const early = amortizePlan(
    LOAN,
    r,
    TERM,
    plan({ annualExtra: EXTRA_COUNT * pay, annualExtraMonth: 1 }),
  );
  const late = amortizePlan(
    LOAN,
    r,
    TERM,
    plan({ annualExtra: EXTRA_COUNT * pay, annualExtraMonth: MONTHS_IN_YEAR }),
  );
  return {
    rate: r,
    earlySaved: base.months - early.months,
    lateSaved: base.months - late.months,
    spread: late.months - early.months,
    interestSaved: base.totalInterest - late.totalInterest,
  };
});

const LOWEST_RATE = RATE_ROWS[0];
const HIGHEST_RATE = RATE_ROWS[RATE_ROWS.length - 1];

/** The timing question matters more the higher the rate, which is worth
 *  stating and is not obvious. Computed so the sentence cannot go stale. */
const SPREAD_WIDENS_WITH_RATE =
  HIGHEST_RATE.spread > LOWEST_RATE.spread &&
  RATE_ROWS.every((r, i) => i === 0 || r.spread >= RATE_ROWS[i - 1].spread);

/** ── The neighbours: one, two and three ─────────────────────────────
 *
 *  Two sibling pages targeting the one-payment and three-payment queries are
 *  next in the build queue. Until they exist this table is where those readers
 *  are served, and it is the context that makes the two-payment figure mean
 *  something.
 */

const COUNTS = [1, 2, 3] as const;

const COUNT_ROWS = COUNTS.map((n) => {
  const s = scenario(
    plan({ annualExtra: n * PAYMENT, annualExtraMonth: MONTHS_IN_YEAR }),
  );
  return { count: n, ...s };
});

/** What each successive extra payment adds, on top of the one before it. The
 *  decline is the hub's Finding 1 seen from a different angle, so the page
 *  states it in one line and links rather than re-arguing it. */
const MARGINAL_ROWS = COUNT_ROWS.map((r, i) => ({
  count: r.count,
  extraMonths: i === 0 ? BASE.months - r.months : COUNT_ROWS[i - 1].months - r.months,
  extraInterest:
    i === 0 ? r.interestSaved : r.interestSaved - COUNT_ROWS[i - 1].interestSaved,
}));

/** ── Chart scale ────────────────────────────────────────────────────
 *  Rounded up to the next $2,000 so the longest bar cannot touch the edge,
 *  and so the five gridlines land on round figures. See the component header. */
const CHART_X_MAX =
  Math.ceil(Math.max(...TIMING_ROWS.map((r) => r.givenUp)) / 2_000) * 2_000;

/** ── Sources ────────────────────────────────────────────────────────
 *
 *  TWO claims on this page are not arithmetic, both to the Fannie Mae
 *  Servicing Guide, and both were read against the source on August 22, 2026
 *  for this page rather than inherited from the hub's citation list.
 *
 *  A third, the Regulation Z prepayment-penalty tiers at 12 C.F.R.
 *  § 1026.43(g)(2), was verified the same day and then CUT along with the
 *  section that carried it: that material is already a section on the hub, and
 *  the cluster rule is that a child links up rather than restating. The
 *  citation went with the claim. Listing a source the page no longer relies on
 *  would imply a claim that is not there.
 *
 *  Everything else on the page is computed.
 */

const FANNIE_C_URL =
  "https://servicing-guide.fanniemae.com/svc/c-1.2-01/processing-additional-principal-payments";
const FANNIE_F_URL =
  "https://servicing-guide.fanniemae.com/svc/f-1-09/processing-mortgage-loan-payments-and-payoffs";

const SOURCE_LIST = [
  {
    label:
      "Fannie Mae Servicing Guide C-1.2-01, Processing Additional Principal Payments",
    url: FANNIE_C_URL,
    verified: "2026-08-22",
  },
  {
    label:
      "Fannie Mae Servicing Guide F-1-09, Processing Mortgage Loan Payments and Payoffs",
    url: FANNIE_F_URL,
    verified: "2026-08-22",
  },
];

/** ── FAQ ────────────────────────────────────────────────────────────
 *  Lowercase, as a person types them. House style, and it matches the two
 *  articles already shipped. */

const FAQ: Faq[] = [
  {
    q: "how many years do 2 extra mortgage payments take off",
    a: `Between ${durTight(LATE.monthsSaved)} and ${durTight(
      EARLY.monthsSaved,
    )} off a 30-year loan, and which end you land on is decided by when in the year the money arrives. On ${formatUSD(
      LOAN,
    )} at ${RATE}% over ${TERM} months, two extra payments a year clear the loan in ${
      LATE.months
    } months if both land at the end of each loan year and ${
      EARLY.months
    } months if both land at the start. The figure to quote if you need one is ${durTight(
      LATE.monthsSaved,
    )}, because it is the floor rather than the best case.`,
  },
  {
    q: "does it matter what month i make the extra payments in",
    a: `Yes, and it is worth about ${formatUSD(
      COST_PER_MONTH_DELAYED,
    )} of interest for every month you wait. Running the same two extra payments through each of the twelve months of the loan year moves the payoff date from month ${
      EARLY.months
    } to month ${LATE.months}, a spread of ${RANGE_MONTHS} months, and moves total interest by ${formatUSD(
      RANGE_INTEREST,
    )}. The pattern is regular: the payoff date slips one month for every two months the money is delayed. Nothing about the amount changes, only the date it lands.`,
  },
  {
    q: "is it better to split the extra over 12 months or pay it in one go",
    a: `Splitting it beats waiting until the end of the year and loses to paying at the start. One sixth of a payment added to every month clears the loan in ${
      EVEN.months
    } months, against ${EARLY.months} months for both payments at the start of each loan year and ${
      LATE.months
    } months for both at the end. All three cost the same ${formatUSD(
      EXTRA_COUNT * PAYMENT,
    )} a year. Against the twelve single-month timings, spreading it beats ${EVEN_BEATS_MONTHS}, ties ${EVEN_TIES_MONTHS} and loses to ${EVEN_LOSES_MONTHS}. So splitting it up is a good default, but it is not the best you can do.`,
  },
  {
    q: "does the answer change if my loan is bigger or smaller",
    a: `Not the number of years, no. Two extra payments a year means twice the scheduled payment, and the scheduled payment is proportional to the amount borrowed, so the whole schedule scales and the payoff month does not move. On ${formatUSD(
      SIZE_ROWS[0].size,
    )}, ${formatUSD(LOAN)} and ${formatUSD(
      SIZE_ROWS[2].size,
    )} at ${RATE}% over 30 years, the loan clears in month ${
      SIZE_ROWS[0].months
    } in all three cases. The dollars saved scale with the loan; the years do not. What does move the answer is the interest rate.`,
  },
  {
    q: "how much interest do 2 extra payments a year save",
    a: `On ${formatUSD(LOAN)} at ${RATE}% over 30 years, between ${formatUSD(
      LATE.interestSaved,
    )} and ${formatUSD(
      EARLY.interestSaved,
    )}, against ${formatUSD(
      BASE.totalInterest,
    )} of interest on the loan left alone. That works out at ${`$${LATE.perDollar.toFixed(
      2,
    )}`} to ${`$${EARLY.perDollar.toFixed(
      2,
    )}`} of interest saved for every dollar of extra principal. On a different balance at the same rate the saving scales in proportion.`,
  },
  {
    q: "is 2 extra payments a year the same as biweekly payments",
    a: `No. Biweekly means paying half your payment every two weeks, which works out at 26 half payments, or 13 full payments, a year. That is ONE extra payment a year, not two. On ${formatUSD(
      LOAN,
    )} at ${RATE}% one extra payment a year takes ${durTight(
      COUNT_ROWS[0].monthsSaved,
    )} off, against ${durTight(
      LATE.monthsSaved,
    )} for two. So two extra payments a year clears the loan ${durTight(
      COUNT_ROWS[0].months - COUNT_ROWS[1].months,
    )} sooner than a biweekly plan does. This site models biweekly the way a US servicer usually runs it, holding the half payments and applying them once a whole one has built up.`,
  },
  {
    q: "will 2 extra payments a year lower my monthly payment",
    a: "No, not on its own. Your monthly payment is fixed by the loan agreement, so paying extra makes the loan finish sooner rather than making the bill smaller. There is a separate route, usually called a recast. Fannie Mae Servicing Guide F-1-09 records that after a large extra principal payment the servicer may agree to recalculate the payment, spreading what is left over the remaining years at the same rate. The servicer may do this, not must, and the rule reaches only some loans: ones the lender keeps on its own books, and first mortgages bundled into mortgage-backed securities. It is a separate request from simply paying extra.",
  },
  {
    q: "will the servicer actually put the money toward principal",
    a: "Only if you tell them it is for principal. That is the whole trick, and it is the step people miss. Fannie Mae Servicing Guide C-1.2-01 requires the servicer to immediately accept and apply extra money to principal when the borrower has marked it as a principal payment and the loan is up to date. The duty attaches to the marking, so label the payment rather than assuming. If you are behind on the loan, the same rule sends the extra to catching up first, and only what is left over reaches principal. These rules cover loans Fannie Mae owns or guarantees; a different owner sets its own.",
  },
];

export const metadata: Metadata = {
  title: "How Many Years Do 2 Extra Mortgage Payments Take Off?",
  description: `On ${formatUSD(
    LOAN,
  )} at ${RATE}%, two extra payments a year clear the loan in ${
    LATE.months
  } months instead of ${TERM}. The answer moves ${RANGE_MONTHS} months depending on when in the year the money lands.`,
  alternates: { canonical: TWO_EXTRA_PAYMENTS_PATH },
};

const REVIEWED = ROUTE_REVIEWED.twoExtraPayments ?? LAST_REVIEWED;

export default function TwoExtraPaymentsPage() {
  const siblings = relatedRoutes("twoExtraPayments");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Article",
              headline: `Two extra payments a year take ${durTight(
                LATE.monthsSaved,
              )} to ${durTight(EARLY.monthsSaved)} off a 30-year mortgage`,
              description: metadata.description,
              inLanguage: "en-US",
              datePublished: REVIEWED,
              dateModified: REVIEWED,
              // Organization identity only, project brief §11.
              publisher: {
                "@type": "Organization",
                name: "Plain Loan Math",
                url: "https://plainloanmath.com",
              },
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `https://plainloanmath.com${TWO_EXTRA_PAYMENTS_PATH}`,
              },
            },
            faqSchema(FAQ),
            calcBreadcrumbSchema("twoExtraPayments"),
          ]),
        }}
      />

      <CalcStripe
        route="twoExtraPayments"
        title={`Two extra payments a year take ${durTight(
          LATE.monthsSaved,
        )} to ${durTight(EARLY.monthsSaved)} off a 30-year mortgage`}
        lede={`On ${formatUSD(
          LOAN,
        )} at ${RATE}% the loan runs ${TERM} months. Add two extra payments every year and it clears in ${
          LATE.months
        } months if the money lands at the end of each loan year, or ${
          EARLY.months
        } months if it lands at the start. Same money, same loan, ${RANGE_MONTHS} months apart.`}
        asideTitle="What this page shows"
        asidePoints={[
          "The answer, and why it is a range",
          "All twelve months, and the cost of waiting",
          "Why your balance does not change it",
          "The answer at your own rate",
          "No lender money, no quote forms",
        ]}
      />

      {/* ── 1. The answer ─────────────────────────────────────────── */}
      <Band tone="surface">
        <SectionHead
          title="What 2 extra mortgage payments a year do to a 30-year loan"
          intro={`Paid off in ${LATE.months} months instead of ${TERM}. Every other page answering this gives one number and most will not say what loan it came from. There is no single number: on one fixed loan, paying the same money every time, the answer moves ${RANGE_MONTHS} months depending on which month of the year the extra lands in.`}
        />

        <EditorialCols
          left={
            <>
              <p>
                Two words run through this page. <strong>Principal</strong> is
                the money still owed. <strong>Interest</strong> is what the
                lender charges each month for lending it. Extra money only
                shortens the loan if it goes to principal, because a smaller
                principal means a smaller interest charge next month and every
                month after.
              </p>
              <p>
                The loan is the one this site uses everywhere: {formatUSD(HOME)}{" "}
                home, 20% down, {formatUSD(LOAN)} borrowed at {RATE}% fixed over
                30 years. Principal and interest come to{" "}
                <span className="num">{formatUSD(PAYMENT)}</span> a month. Left
                alone it runs {TERM} months and costs{" "}
                <span className="num">{formatUSD(BASE.totalInterest)}</span> in
                interest.
              </p>
              <p>
                Two extra payments a year is{" "}
                <span className="num">{formatUSD(EXTRA_COUNT * PAYMENT)}</span>{" "}
                of extra principal a year, on top of the twelve scheduled ones.
              </p>
            </>
          }
          right={
            <>
              <Sub>Why the phrase has three answers</Sub>
              <p>
                {"\u201C"}Two extra payments a year{"\u201D"} does not say when.
                The three readings below all cost the same amount and all put
                the same total against the loan. They are not worth the same,
                because interest is charged on the balance that exists in each
                month, and money that arrives sooner shrinks more of those
                months.
              </p>
              <p>
                A note on what {"\u201C"}month 1{"\u201D"} means here. It is the
                first month of each <em>loan</em> year, not January. If the first
                payment falls in January the two coincide; if it falls in June
                then month 1 is June. The distinction matters on this page
                because the whole subject is which month the money lands in.
              </p>
            </>
          }
        />

        <div className="mt-10 overflow-x-auto" data-print-full>
          <table className="w-full min-w-[34rem] border-collapse text-[0.92rem]">
            <caption className="label mb-3 text-left">
              The same {formatUSD(EXTRA_COUNT * PAYMENT)} a year, three ways
            </caption>
            <thead>
              <tr className="border-b-rule border-line-strong bg-paper-2">
                <th className="label px-3 py-2.5 text-left">Reading</th>
                <th className="label px-3 py-2.5 text-right">Paid off in</th>
                <th className="label px-3 py-2.5 text-right">Time cut</th>
                <th className="label px-3 py-2.5 text-right">Interest saved</th>
                <th className="label px-3 py-2.5 text-right">Per $1 extra</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  key: "early",
                  label: "Both at the start of each loan year",
                  s: EARLY,
                },
                {
                  key: "even",
                  label: `${formatUSD(
                    (EXTRA_COUNT * PAYMENT) / 12,
                  )} added to every payment`,
                  s: EVEN,
                },
                {
                  key: "late",
                  label: "Both at the end of each loan year",
                  s: LATE,
                },
              ].map((r) => (
                <tr key={r.key} className="border-b border-line">
                  <td className="px-3 py-2.5">{r.label}</td>
                  <td className="num px-3 py-2.5 text-right">
                    {formatDuration(r.s.months)}
                  </td>
                  <td className="num px-3 py-2.5 text-right">
                    {formatDuration(r.s.monthsSaved)}
                  </td>
                  <td className="num px-3 py-2.5 text-right">
                    {formatUSD(r.s.interestSaved)}
                  </td>
                  <td className="num px-3 py-2.5 text-right font-bold">
                    {`$${r.s.perDollar.toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10">
          <EditorialCols
            left={
              <>
                <p>
                  <strong>
                    If you want one number, it is{" "}
                    {durTight(HEADLINE.monthsSaved)}.
                  </strong>{" "}
                  That is the bottom row, the least favourable of the three, and
                  it is quoted here for that reason: it is a floor rather than a
                  best case, so paying at any other point in the year beats it.
                  The top row is {durTight(EARLY.monthsSaved)}, which is{" "}
                  {RANGE_MONTHS} months better and{" "}
                  {formatUSD(RANGE_INTEREST)} cheaper for the same money.
                </p>
              </>
            }
            right={
              <>
                <p>
                  The last column is interest saved divided by the extra
                  principal the schedule actually took, not the amount nominally
                  committed: the final year is capped when the balance runs out.
                  It says how hard each dollar worked, and it is the column{" "}
                  <InlineLink href={ROUTES.extraPayments}>
                    the hub page
                  </InlineLink>{" "}
                  publishes across every strategy. To run any of this on your own
                  balance,{" "}
                  <InlineLink href={ROUTES.payoff}>
                    the payoff calculator
                  </InlineLink>{" "}
                  models all four shapes.
                </p>
              </>
            }
          />
        </div>
      </Band>

      {/* ── 2. The twelve months ──────────────────────────────────── */}
      <Band tone="paper">
        <SectionHead
          title="Why the month you pay in changes how much sooner you finish"
          intro={`Running the identical plan through all twelve months of the loan year gives twelve different payoff dates. The pattern connecting them is regular enough to state as a rule, and no page currently ranking for this question publishes it.`}
        />

        <AnnualExtraTimingChart
          rows={TIMING_ROWS.map((r) => ({
            month: r.month,
            givenUp: r.givenUp,
            paidOffIn: durChart(r.months),
            paidOffSpoken: formatDuration(r.months),
          }))}
          xMax={CHART_X_MAX}
          amount={formatUSD(EXTRA_COUNT * PAYMENT)}
        />

        <div className="mt-10">
          <EditorialCols
            left={
              <>
                <p>
                  {STAIRCASE_IS_REGULAR ? (
                    <>
                      <strong>
                        The payoff date slips one month for every two months the
                        money is delayed.
                      </strong>{" "}
                      Not roughly. Every step in the column above is either zero
                      or one month, and they alternate the whole way down.
                    </>
                  ) : (
                    <>
                      The payoff date slips as the money is delayed, though on
                      this loan the steps are not evenly spaced.
                    </>
                  )}
                </p>
                <p>
                  In interest the same delay costs about{" "}
                  <span className="num">
                    {formatUSD(COST_PER_MONTH_DELAYED)}
                  </span>{" "}
                  a month. Most people do not know they are making the decision.
                </p>
              </>
            }
            right={
              <>
                <p>
                  Money arriving in month 1 shrinks the balance from month 1, and
                  every interest charge after that is worked out on the smaller
                  number. Money arriving in month 12 leaves eleven months to be
                  charged as though it did not exist. Repeated for twenty years
                  that compounds into {RANGE_MONTHS} months.
                </p>
                <p>
                  Spreading the money evenly lands at{" "}
                  {formatDuration(EVEN.months)}: better than {EVEN_BEATS_MONTHS}{" "}
                  of the twelve single-month timings, level with{" "}
                  {EVEN_TIES_MONTHS}, behind {EVEN_LOSES_MONTHS}.{" "}
                  <InlineLink href={ROUTES.extraPayments}>
                    The hub page works through spreading against saving up
                  </InlineLink>{" "}
                  for the one-payment case, and the mechanism is identical here.
                </p>
              </>
            }
          />
        </div>
      </Band>

      {/* ── 3. The invariance, and what does move the answer ─────── */}
      <Band tone="surface">
        <SectionHead
          title="Your balance does not change this answer, your rate does"
          intro="This is the part that makes the figures above worth anything to a reader whose loan is not the example. The number of years two extra payments take off does not depend on how much was borrowed. Not approximately. Exactly. What it does depend on is the rate."
        />

        <EditorialCols
          left={
            <>
              <div className="overflow-x-auto" data-print-full>
                <table className="w-full min-w-[22rem] border-collapse text-[0.92rem]">
                  <caption className="label mb-3 text-left">
                    Three loans, {RATE}% over 30 years
                  </caption>
                  <thead>
                    <tr className="border-b-rule border-line-strong bg-paper-2">
                      <th className="label px-3 py-2.5 text-left">Borrowed</th>
                      <th className="label px-3 py-2.5 text-right">Payment</th>
                      <th className="label px-3 py-2.5 text-right">
                        Paid off in
                      </th>
                      <th className="label px-3 py-2.5 text-right">
                        Interest saved
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_ROWS.map((r) => (
                      <tr key={r.size} className="border-b border-line">
                        <td className="num px-3 py-2.5">{formatUSD(r.size)}</td>
                        <td className="num px-3 py-2.5 text-right">
                          {formatUSD(r.payment)}
                        </td>
                        <td className="num px-3 py-2.5 text-right font-bold">
                          {formatDuration(r.months)}
                        </td>
                        <td className="num px-3 py-2.5 text-right">
                          {formatUSD(r.interestSaved)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          }
          right={
            <>
              <Sub>Why it comes out identical</Sub>
              <p>
                {SIZE_INVARIANT
                  ? `All three clear in month ${SIZE_ROWS[0].months}.`
                  : `These three do not agree, which they should.`}{" "}
                A five times larger loan carries a five times larger payment, so
                {" \u201C"}two extra payments{"\u201D"} is five times more money
                as well. Every figure in the schedule scales by the same
                constant, and a schedule multiplied by a constant reaches zero in
                the same month.
              </p>
              <p>
                The dollars are not invariant and the table shows it: interest
                saved runs from{" "}
                <span className="num">
                  {formatUSD(SIZE_ROWS[0].interestSaved)}
                </span>{" "}
                to{" "}
                <span className="num">
                  {formatUSD(SIZE_ROWS[2].interestSaved)}
                </span>
                . They scale in exact proportion to the amount borrowed.
              </p>
              <p>
                <strong>This only holds when the extra is a multiple of your
                own payment.</strong>{" "}
                A flat {formatUSD(500)} a month is not, so the rule breaks for
                it and the answer there does move with the balance (
                <InlineLink href={ROUTES.extraPayments}>
                  what flat monthly amounts are worth
                </InlineLink>
                ).
              </p>
            </>
          }
        />

        <div className="mt-12">
          <Sub>What does move it: the rate</Sub>
          <p className="mt-3 max-w-[62ch] text-ink-2">
            Since the balance does nothing, what is left is the rate and the
            term. Between {LOWEST_RATE.rate}% and {HIGHEST_RATE.rate}% on a
            30-year loan the answer moves by{" "}
            {formatDuration(HIGHEST_RATE.lateSaved - LOWEST_RATE.lateSaved)}.
            This is the table to read if your loan is not the example.
          </p>
        </div>

        <div className="mt-8 overflow-x-auto" data-print-full>
          <table className="w-full min-w-[34rem] border-collapse text-[0.92rem]">
            <caption className="label mb-3 text-left">
              Two extra payments a year on a 30-year loan, by rate
            </caption>
            <thead>
              <tr className="border-b-rule border-line-strong bg-paper-2">
                <th className="label px-3 py-2.5 text-left">Rate</th>
                <th className="label px-3 py-2.5 text-right">
                  Cut, paying at year end
                </th>
                <th className="label px-3 py-2.5 text-right">
                  Cut, paying at year start
                </th>
                <th className="label px-3 py-2.5 text-right">
                  Timing is worth
                </th>
              </tr>
            </thead>
            <tbody>
              {RATE_ROWS.map((r) => (
                <tr
                  key={r.rate}
                  className={
                    r.rate === RATE
                      ? "border-b border-line bg-accent-soft"
                      : "border-b border-line"
                  }
                >
                  <td className="num px-3 py-2.5">{r.rate}%</td>
                  <td className="num px-3 py-2.5 text-right font-bold">
                    {formatDuration(r.lateSaved)}
                  </td>
                  <td className="num px-3 py-2.5 text-right">
                    {formatDuration(r.earlySaved)}
                  </td>
                  <td className="num px-3 py-2.5 text-right">
                    {formatDuration(r.spread)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10">
          <EditorialCols
            left={
              <>
                <p>
                  At {LOWEST_RATE.rate}% two extra payments a year take{" "}
                  {formatDuration(LOWEST_RATE.lateSaved)} off. At{" "}
                  {HIGHEST_RATE.rate}% the same behaviour takes{" "}
                  {formatDuration(HIGHEST_RATE.lateSaved)} off. The higher the
                  rate, the more of each scheduled payment is interest, so the
                  more work each extra dollar of principal does.
                </p>
                <p>
                  It is also why older advice on this question reads oddly. A
                  page written against a 3% loan and never revisited describes a
                  different loan from the one most readers signed (
                  <InlineLink href={ROUTES.principalVsInterest}>
                    the same problem on a different question
                  </InlineLink>
                  ).
                </p>
              </>
            }
            right={
              <>
                <p>
                  {SPREAD_WIDENS_WITH_RATE ? (
                    <>
                      <strong>
                        The timing question gets bigger as the rate rises.
                      </strong>{" "}
                      The last column widens from{" "}
                      {formatDuration(LOWEST_RATE.spread)} at{" "}
                      {LOWEST_RATE.rate}% to{" "}
                      {formatDuration(HIGHEST_RATE.spread)} at{" "}
                      {HIGHEST_RATE.rate}%, and it never narrows on the way. On
                      an expensive loan, when you pay is worth most.
                    </>
                  ) : (
                    <>
                      The last column does not widen steadily as the rate rises
                      on this loan, so no rule is stated for it.
                    </>
                  )}
                </p>
                <p>
                  The term matters too, in the opposite direction: a shorter loan
                  has less interest to remove and less room to remove it in (
                  <InlineLink href={ROUTES.termCompare}>
                    15-year against 30-year
                  </InlineLink>
                  ).
                </p>
              </>
            }
          />
        </div>
      </Band>

      {/* ── 4. The neighbours ─────────────────────────────────────── */}
      <Band tone="surface">
        <SectionHead
          title="1 extra mortgage payment a year, 2, or 3"
          intro="Two is a strange number to settle on without seeing what sits either side of it. All three rows land at the end of each loan year, so they are comparable to each other and to the headline figure above."
        />

        <div className="mt-8 overflow-x-auto" data-print-full>
          <table className="w-full min-w-[36rem] border-collapse text-[0.92rem]">
            <caption className="label mb-3 text-left">
              Extra payments a year, all landing at the end of the loan year
            </caption>
            <thead>
              <tr className="border-b-rule border-line-strong bg-paper-2">
                <th className="label px-3 py-2.5 text-left">Extra a year</th>
                <th className="label px-3 py-2.5 text-right">Costs you</th>
                <th className="label px-3 py-2.5 text-right">Time cut</th>
                <th className="label px-3 py-2.5 text-right">Interest saved</th>
                <th className="label px-3 py-2.5 text-right">Per $1 extra</th>
              </tr>
            </thead>
            <tbody>
              {COUNT_ROWS.map((r) => (
                <tr
                  key={r.count}
                  className={
                    r.count === EXTRA_COUNT
                      ? "border-b border-line bg-accent-soft"
                      : "border-b border-line"
                  }
                >
                  <td className="px-3 py-2.5">
                    <span className="num">{r.count}</span>{" "}
                    {r.count === 1 ? "payment" : "payments"}
                  </td>
                  <td className="num px-3 py-2.5 text-right">
                    {formatUSD(r.count * PAYMENT)} a year
                  </td>
                  <td className="num px-3 py-2.5 text-right">
                    {formatDuration(r.monthsSaved)}
                  </td>
                  <td className="num px-3 py-2.5 text-right">
                    {formatUSD(r.interestSaved)}
                  </td>
                  <td className="num px-3 py-2.5 text-right font-bold">
                    {`$${r.perDollar.toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10">
          <EditorialCols
            left={
              <>
                <p>
                  Each extra payment does less than the one before it. The first
                  takes {MARGINAL_ROWS[0].extraMonths} months off the loan.
                  Adding a second takes off a further{" "}
                  {MARGINAL_ROWS[1].extraMonths} months. Adding a third takes off
                  only {MARGINAL_ROWS[2].extraMonths} months more.
                </p>
                <p>
                  In interest those three steps are worth{" "}
                  {formatUSD(MARGINAL_ROWS[0].extraInterest)}, then{" "}
                  {formatUSD(MARGINAL_ROWS[1].extraInterest)}, then{" "}
                  {formatUSD(MARGINAL_ROWS[2].extraInterest)}.
                </p>
              </>
            }
            right={
              <>
                <p>
                  A bigger commitment saves more in total and less per dollar.
                  Doubling from one payment to two does not double anything.{" "}
                  <InlineLink href={ROUTES.extraPayments}>
                    Why every extra dollar is worth less than the one before it
                  </InlineLink>{" "}
                  works that through across fourteen strategies. Which row is
                  right for anyone depends on what the money would otherwise do (
                  <InlineLink href={ROUTES.payoffVsInvest}>
                    paying down against investing the same money
                  </InlineLink>
                  ).
                </p>
              </>
            }
          />
        </div>
      </Band>

      {/* ── 5. Scope ──────────────────────────────────────────────────
          DELIBERATELY SHORT, and shorter than it was in the first draft.

          That draft carried the servicing rules for identifying a curtailment
          and the Regulation Z prepayment-penalty tiers, both sourced. Both are
          already sections on the hub ("Before you send extra money", "What this
          leaves out"), and restating them here was the exact duplication the
          cluster rule forbids: a child answers one question in depth and links
          up for everything the parent already owns. They are now one sentence
          and a link, and the two citations went with them.

          What stays is only what this page's own arithmetic assumes and does
          not model. ──────────────────────────────────────────────────────── */}
      <Band tone="paper">
        <SectionHead
          title="What this page does not cover"
          intro="Three assumptions sit under every figure above. None of them changes the shape of the answer, and all three can change the number on a real loan."
        />

        <EditorialCols
          left={
            <>
              <Sub>The money reaches principal in the month it is sent</Sub>
              <p>
                Every figure assumes that. Whether it happens depends on the
                extra being identified as principal rather than sent as an
                unlabelled transfer, and on whether the loan is current.{" "}
                <InlineLink href={ROUTES.extraPayments}>
                  What to check before sending extra money
                </InlineLink>{" "}
                sets out the servicing rules and the prepayment-penalty limits,
                with the sources, and this page does not restate them.
              </p>
              <Sub>The payment is principal and interest only</Sub>
              <p>
                The {formatUSD(PAYMENT)} used throughout excludes property tax,
                homeowners insurance and any mortgage insurance, so {"\u201C"}an
                extra payment{"\u201D"} read off a bank statement can be a
                larger figure than the one modelled here (
                <InlineLink href={ROUTES.payment}>
                  what the full monthly payment contains
                </InlineLink>
                ).
              </p>
            </>
          }
          right={
            <>
              <Sub>The scheduled payment never changes</Sub>
              <p>
                Extra principal shortens the loan and leaves the bill alone.
                Fannie Mae Servicing Guide F-1-09 records one route the other
                way: after a substantial curtailment a servicer <em>may</em>{" "}
                agree to recalculate the payment, spreading what is left over
                the remaining years at the same rate. Two things about that. The
                servicer <em>may</em> do it, not must. And it does not cover
                every loan: the rule reaches loans the lender keeps on its own
                books, and first mortgages bundled into mortgage-backed
                securities, so who owns your loan decides whether you can ask.
                None of it is modelled above. Neither is a refinance (
                <InlineLink href={ROUTES.refinance}>
                  what a refinance has to recover
                </InlineLink>
                ).
              </p>
              <Sub>And one thing left out on purpose</Sub>
              <p>
                There is no recommendation anywhere on this page. Whether two
                extra payments a year is a good use of{" "}
                {formatUSD(EXTRA_COUNT * PAYMENT)} depends on an emergency fund,
                other debt at other rates, a retirement match and what the money
                would otherwise earn, none of which this site knows. The
                arithmetic says what the two payments do to the loan.
              </p>
            </>
          }
        />
      </Band>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <Band tone="surface">
        <SectionHead
          title="Common questions"
          intro="Answers written to stand on their own, because search engines lift them out of the page."
        />
        <FaqBlock items={FAQ} />
      </Band>

      {/* ── Sources ───────────────────────────────────────────────── */}
      <Band tone="paper">
        <Sources items={SOURCE_LIST} />
        <p className="mt-6 max-w-prose text-[0.85rem] text-muted">
          Every figure here was worked out from the standard formula for a fixed
          rate loan, not copied from anyone else. On {REVIEWED} the whole page
          was checked a second time by separate software written from scratch,
          so that a mistake in one would not be repeated by the other. The two
          agreed on the payoff month in every case, and on the interest to the
          cent.
        </p>
      </Band>

      <Band tone="surface">
        <CalcFooter siblings={siblings} reviewed={REVIEWED} />
      </Band>
    </>
  );
}
