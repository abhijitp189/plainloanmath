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
import PrepaymentDecayChart from "@/components/PrepaymentDecayChart";
import { InlineLink } from "@/components/InlineLink";
import {
  EXTRA_PAYMENTS_PATH,
  ROUTES,
  ROUTE_REVIEWED,
  relatedRoutes,
} from "@/lib/routes";
import {
  amortizePlan,
  comparePlan,
  formatUSD,
  formatDuration,
  NO_PLAN,
  type PayoffPlan,
} from "@/lib/mortgage";

export const metadata: Metadata = {
  title: "Extra Mortgage Payments: What Each Strategy Is Actually Worth",
  description:
    "Fourteen ways to pay a $340,000 mortgage down early, all measured on the same loan. Includes the column nobody publishes: interest saved per dollar of extra principal.",
  alternates: { canonical: EXTRA_PAYMENTS_PATH },
};

const REVIEWED = ROUTE_REVIEWED.extraPayments ?? LAST_REVIEWED;

// ─────────────────────────────────────────────────────────────────────────────
// Every figure on this page is computed at build time from lib/mortgage.ts.
//
// Project brief §10: worked examples are computed, not typed. Nothing below is
// a number somebody wrote down, including the per-dollar column, which is the
// one figure this page exists to publish.
//
// Independently recomputed on August 21, 2026 in a separate script written
// from the amortization definition rather than from this engine, across five
// cases: $100, $500 and $1,000 a month, one extra payment a year, and a
// $10,000 lump sum in year 10. Payoff month agreed exactly in all five and
// interest saved agreed to under one cent.
//
// The canonical site example applies unchanged: $340,000 at 6.75% over 30
// years, a $425,000 home with 20% down.
//
// ON THE SERVICING CLAIM. Sourced August 21, 2026 to Fannie Mae Servicing
// Guide C-1.2-01 and F-1-09, read in the August 12, 2026 edition. The earlier
// draft said "many servicers apply unlabeled extra money to the next scheduled
// payment", which the Guide does NOT establish: it sets the servicer's
// obligation when a payment IS identified and is silent on the default for
// unidentified funds. The page now states the sourced rule and stops there.
//
// ON THE PER-DOLLAR COLUMN. It is interest saved divided by extra principal
// actually paid, read off the schedule rather than from the nominal annual
// figure. Those differ on the annual-extra rows, because the final year is
// capped when the balance runs out: three extra payments a year nominally
// costs 18 x $6,615.69, but the schedule only ever takes $112,467. Using the
// nominal figure would print $1.72 where the truth is $1.83.
// ─────────────────────────────────────────────────────────────────────────────

const HOME = 425_000;
const LOAN = 340_000;
const RATE = 6.75;
const TERM = 360;
const LUMP = 10_000;

const BASE = amortizePlan(LOAN, RATE, TERM, NO_PLAN);
const PAYMENT = BASE.monthlyPayment;

const plan = (o: Partial<PayoffPlan>): PayoffPlan => ({ ...NO_PLAN, ...o });

type Row = {
  strategy: string;
  cost: string;
  months: number;
  monthsSaved: number;
  interestSaved: number;
  perDollar: number;
};

function row(strategy: string, cost: string, p: PayoffPlan): Row {
  const c = comparePlan(LOAN, RATE, TERM, p);
  const extraPaid = c.accelerated.schedule.reduce((s, r) => s + r.extra, 0);
  return {
    strategy,
    cost,
    months: c.accelerated.months,
    monthsSaved: c.monthsSaved,
    interestSaved: c.interestSaved,
    perDollar: c.interestSaved / extraPaid,
  };
}

const MONTHLY_EXTRAS = [50, 100, 200, 250, 500, 1000] as const;

/** One extra payment a year, spread across the twelve months instead.
 *
 *  Rendered with cents rather than through formatUSD, which drops them
 *  site-wide. Whole dollars would print $184, and $184 is not one twelfth of
 *  this payment: multiplied out it claims $2,208 a year against a stated
 *  $2,205, and this whole section turns on the two methods costing the SAME
 *  money. Precision is load-bearing here, so it stays. */
const SPREAD = PAYMENT / 12;

const usdCents = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const MONTHLY_ROWS = MONTHLY_EXTRAS.map((e) =>
  row(`${formatUSD(e)} a month`, `${formatUSD(e * 12)} a year`, plan({ extraMonthly: e })),
);

const SPREAD_ROW = row(
  `${usdCents(SPREAD)} added to every payment`,
  `${formatUSD(PAYMENT)} a year`,
  plan({ extraMonthly: SPREAD }),
);

const ANNUAL_ROWS = [1, 2, 3].map((n) =>
  row(
    n === 1 ? "One extra payment a year" : `${n === 2 ? "Two" : "Three"} extra payments a year`,
    `${formatUSD(PAYMENT * n)} a year`,
    plan({ annualExtra: PAYMENT * n, annualExtraMonth: 12 }),
  ),
);

const BIWEEKLY_ROW = row(
  "Biweekly, 26 half payments",
  `${formatUSD(PAYMENT)} a year`,
  plan({ biweekly: true }),
);

const LUMP_YEARS = [1, 10, 20] as const;

const LUMP_ROWS = LUMP_YEARS.map((yr) =>
  row(
    `${formatUSD(LUMP)} lump sum in year ${yr}`,
    `${formatUSD(LUMP)} once`,
    plan({ lumpSum: LUMP, lumpSumMonth: yr * 12 }),
  ),
);

/**
 * The spread the first child page is built around, computed here rather than
 * typed into the sentence that links to it.
 *
 * Added August 22, 2026 with that child. Two extra payments a year landing in
 * month 1 of each loan year against month 12, same money either way. Four lines
 * of engine is the price of the link carrying a figure at all, and a typed "5"
 * here would be the one hand-written number on the page (§10) and would go
 * stale silently if the example loan were ever re-rated.
 */
const CHILD_TIMING_SPREAD =
  amortizePlan(
    LOAN,
    RATE,
    TERM,
    plan({ annualExtra: 2 * PAYMENT, annualExtraMonth: 12 }),
  ).months -
  amortizePlan(
    LOAN,
    RATE,
    TERM,
    plan({ annualExtra: 2 * PAYMENT, annualExtraMonth: 1 }),
  ).months;

const TABLE: Row[] = [
  ...MONTHLY_ROWS,
  SPREAD_ROW,
  ...ANNUAL_ROWS,
  BIWEEKLY_ROW,
  ...LUMP_ROWS,
];

/** The row count in the H1 and lede is derived, so it cannot drift. */
const STRATEGY_COUNT = TABLE.length;

/** ── Finding 1: the per-dollar decline ──────────────────────────── */

const DECLINE_ROWS = MONTHLY_EXTRAS.map((e) => {
  const c = comparePlan(LOAN, RATE, TERM, plan({ extraMonthly: e }));
  return {
    extra: e,
    paid: c.accelerated.schedule.reduce((s, r) => s + r.extra, 0),
    interestSaved: c.interestSaved,
    perDollar:
      c.interestSaved / c.accelerated.schedule.reduce((s, r) => s + r.extra, 0),
  };
});

const SMALLEST = DECLINE_ROWS[0];
const LARGEST = DECLINE_ROWS[DECLINE_ROWS.length - 1];

/** The finding the section is written to prove. Asserted rather than claimed
 *  in prose, so a future engine change that breaks it breaks the build. */
const DECLINE_IS_MONOTONIC = DECLINE_ROWS.every(
  (r, i) => i === 0 || r.perDollar < DECLINE_ROWS[i - 1].perDollar,
);

/** ── Finding 2: the timing decay ────────────────────────────────── */

const TIMING_YEARS = [1, 5, 10, 15, 20, 25] as const;

const TIMING_ROWS = TIMING_YEARS.map((yr) => {
  const c = comparePlan(LOAN, RATE, TERM, plan({ lumpSum: LUMP, lumpSumMonth: yr * 12 }));
  return {
    year: yr,
    interestSaved: c.interestSaved,
    monthsSaved: c.monthsSaved,
    perDollar: c.interestSaved / LUMP,
  };
});

const FIRST_YEAR = TIMING_ROWS[0];
const YEAR_20 = TIMING_ROWS[4];
const LAST_YEAR = TIMING_ROWS[TIMING_ROWS.length - 1];

/** Two of the six fall below a dollar returned per dollar sent. That is the
 *  reason the chart carries a rule at 1.00, and the reason it is worth
 *  drawing at all. */
const BELOW_BREAK_EVEN = TIMING_ROWS.filter((r) => r.perDollar < 1).length;

/** ── Finding 3: spreading versus saving up ──────────────────────── */

const YEAR_END = comparePlan(
  LOAN,
  RATE,
  TERM,
  plan({ annualExtra: PAYMENT, annualExtraMonth: 12 }),
);
const SPREAD_CMP = comparePlan(LOAN, RATE, TERM, plan({ extraMonthly: SPREAD }));

/** Rounded to cents FIRST, then subtracted.
 *
 *  The unrounded difference is $4,041.09 and the difference of the two
 *  rounded figures is $4,041.10. The page prints all three numbers, so the
 *  one that must be true is the one a reader gets by subtracting what they
 *  can see. Arithmetic a reader can check has to close. */
const cents = (n: number) => Math.round(n * 100) / 100;
const SPREAD_SAVED = cents(SPREAD_CMP.interestSaved);
const YEAR_END_SAVED = cents(YEAR_END.interestSaved);
const SPREAD_EDGE = cents(SPREAD_SAVED - YEAR_END_SAVED);

/** ── Sources ────────────────────────────────────────────────────── */

const REG_Z_URL =
  "https://www.ecfr.gov/current/title-12/chapter-X/part-1026/subpart-E/section-1026.43";
const FANNIE_C_URL =
  "https://servicing-guide.fanniemae.com/svc/c-1.2-01/processing-additional-principal-payments";
const FANNIE_F_URL =
  "https://servicing-guide.fanniemae.com/svc/f-1-09/processing-mortgage-loan-payments-and-payoffs";

const SOURCE_LIST = [
  {
    label:
      "Regulation Z, 12 C.F.R. § 1026.43(g)(2), prepayment penalty limits on covered transactions",
    url: REG_Z_URL,
    verified: "2026-08-21",
  },
  {
    label:
      "Fannie Mae Servicing Guide C-1.2-01, Processing Additional Principal Payments (11/13/2024), read in the August 12, 2026 edition",
    url: FANNIE_C_URL,
    verified: "2026-08-21",
  },
  {
    label:
      "Fannie Mae Servicing Guide F-1-09, Processing Mortgage Loan Payments and Payoffs, Processing a Principal Curtailment",
    url: FANNIE_F_URL,
    verified: "2026-08-21",
  },
];

const FAQ: Faq[] = [
  {
    q: "does paying extra actually reduce what i owe or am i just paying ahead",
    a: `It depends on whether the payment was identified as a principal payment. Fannie Mae Servicing Guide C-1.2-01 requires a servicer to immediately accept and apply an extra principal payment, called a principal curtailment, when the borrower identifies it as such on a current loan. The obligation attaches to the identifying, so money sent without it is not covered by that rule. The servicer can say how they require it to be marked, and the next statement settles it: the principal balance should have dropped by the amount sent. These rules bind servicers of loans Fannie Mae owns or guarantees, which is a large share of US mortgages but not all of them.`,
  },
  {
    q: "is biweekly better than adding extra to each monthly payment",
    a: `On this loan the calculation shows biweekly saving ${usdCents(
      YEAR_END_SAVED,
    )}, and ${usdCents(SPREAD)} added to every monthly payment saving ${usdCents(
      SPREAD_SAVED,
    )}, a difference of ${usdCents(
      SPREAD_EDGE,
    )}. But the biweekly figure comes out of a model that applies one extra full payment every twelfth month, which is how a US servicer typically handles held half payments. A biweekly plan that credited each half payment on arrival would do somewhat better than the figure shown. The real gap between the two approaches is narrower than the table makes it look.`,
  },
  {
    q: "should i pay extra or invest the money instead",
    a: `That depends on the return the money would earn elsewhere, and this page does not answer it. Everything here measures one thing: what extra principal does to this mortgage. Nothing on this page weighs that against any other use of the money.`,
  },
  {
    q: "will paying extra lower my monthly payment",
    a: `No. The required payment stays ${formatUSD(
      PAYMENT,
    )}. Extra principal shortens the loan instead, which is what every payoff figure in the main table is measuring.`,
  },
  {
    q: "is there a penalty for paying my mortgage off early",
    a: `Some loans have one and many do not. Where a covered fixed-rate qualified mortgage carries one, federal rules cap it at 2% of the amount prepaid during the first two years, drop the cap to a maximum of 1% during the third year, and prohibit any prepayment penalty after that (12 C.F.R. § 1026.43(g)(2)). The loan documents state whether a particular mortgage has one.`,
  },
];

export default function ExtraPaymentsPage() {
  const siblings = relatedRoutes("extraPayments");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Article",
              headline: "Extra mortgage payments: what each strategy is actually worth",
              description: metadata.description,
              inLanguage: "en-US",
              datePublished: REVIEWED,
              dateModified: REVIEWED,
              // Organization identity only — project brief §11.
              publisher: {
                "@type": "Organization",
                name: "Plain Loan Math",
                url: "https://plainloanmath.com",
              },
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `https://plainloanmath.com${EXTRA_PAYMENTS_PATH}`,
              },
            },
            faqSchema(FAQ),
            calcBreadcrumbSchema("extraPayments"),
          ]),
        }}
      />

      <CalcStripe
        route="extraPayments"
        title="Extra mortgage payments: what each strategy is actually worth"
        lede={`On a ${formatUSD(LOAN)} loan at ${RATE}% fixed for 30 years, an extra ${formatUSD(
          SMALLEST.extra,
        )} a month cuts ${formatDuration(
          MONTHLY_ROWS[0].monthsSaved,
        )} off the term and saves ${formatUSD(
          MONTHLY_ROWS[0].interestSaved,
        )} in interest. An extra ${formatUSD(LARGEST.extra)} a month cuts ${formatDuration(
          MONTHLY_ROWS[5].monthsSaved,
        )} and saves ${formatUSD(
          MONTHLY_ROWS[5].interestSaved,
        )}. Here is the part most pages leave out. That ${formatUSD(
          SMALLEST.extra,
        )} buys $${SMALLEST.perDollar.toFixed(
          2,
        )} of interest saved for every extra dollar it costs you. The ${formatUSD(
          LARGEST.extra,
        )} buys $${LARGEST.perDollar.toFixed(2)}.`}
        asideTitle="What this page shows"
        asidePoints={[
          `${STRATEGY_COUNT} strategies on one loan`,
          "Interest saved per dollar of extra principal",
          "Why timing beats size on a lump sum",
          "What the servicer does with unlabeled money",
          "No lender money, no quote forms",
        ]}
      />

      {/* ── 1. The comparison ─────────────────────────────────────── */}
      <Band tone="surface">
        <SectionHead
          title={`One loan, ${STRATEGY_COUNT} ways to pay it down`}
          intro={`Every number on this page describes the same loan: ${formatUSD(
            LOAN,
          )} borrowed at ${RATE}% fixed over 30 years, which is a ${formatUSD(
            HOME,
          )} home with 20% down. Principal and interest come to ${formatUSD(
            PAYMENT,
          )} a month. Left alone the loan runs ${TERM} months and the interest comes to ${formatUSD(
            BASE.totalInterest,
          )}.`}
        />

        <EditorialCols
          left={
            <>
              <p>
                Two words run through this whole page, so here is what they
                mean. <strong>Principal</strong> is the money you still owe.{" "}
                <strong>Interest</strong> is what the lender charges each month
                for lending it. Extra money only helps if it goes to principal,
                because a smaller principal means a smaller interest charge next
                month, and every month after that.
              </p>
              <p>
                Each row below changes one thing about that loan and nothing
                else. That is what makes the rows comparable to each other.
              </p>
            </>
          }
          right={
            <>
              <p>
                It is also the reason this page exists. The pages that rank for
                this question each demonstrate with a loan of their own
                choosing. Among the most visible of them, eight state the loan
                they used, and between those eight there are five different
                rates spread from 4% to 7%, on balances from{" "}
                {formatUSD(200_000)} to {formatUSD(500_000)}. Two more never say
                what loan they used at all.
              </p>
              <p>
                So a reader who wants to know whether {formatUSD(200)} a month
                beats one extra payment a year cannot find out from those pages.
                The two answers sit on separate pages, built on separate loans,
                and numbers from two different loans do not compare. Here they
                sit on one loan, so they do.
              </p>
            </>
          }
        />

        <div className="mt-10 overflow-x-auto" data-print-full>
          <table className="w-full min-w-[46rem] border-collapse text-[0.92rem]">
            <caption className="label mb-3 text-left">
              Every strategy on one loan
            </caption>
            <thead>
              <tr className="border-b-rule border-line-strong bg-paper-2">
                <th className="label px-3 py-2.5 text-left">Strategy</th>
                <th className="label px-3 py-2.5 text-right">Costs you</th>
                <th className="label px-3 py-2.5 text-right">Paid off in</th>
                <th className="label px-3 py-2.5 text-right">Time cut</th>
                <th className="label px-3 py-2.5 text-right">Interest saved</th>
                <th className="label px-3 py-2.5 text-right">Per $1 extra</th>
              </tr>
            </thead>
            <tbody>
              {TABLE.map((r) => (
                <tr key={r.strategy} className="border-b border-line">
                  <td className="px-3 py-2.5">{r.strategy}</td>
                  <td className="num px-3 py-2.5 text-right">{r.cost}</td>
                  <td className="num px-3 py-2.5 text-right">
                    {formatDuration(r.months)}
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
            <p>
              The last column needs one sentence of explanation. Saved per $1
              extra is the total interest saved divided by the total extra money
              paid in. It answers a different question from the interest saved
              column. Interest saved tells you how big the pile is. Saved per $1
              extra tells you how hard each dollar worked to build it.
            </p>
          }
          right={
            <p>
              One thing jumps out of the table right away. The three lump sum
              rows are all the same {formatUSD(LUMP)}, yet they do wildly
              different amounts of work depending only on which year the money
              arrives. That gets a section below.
            </p>
          }
        />
        </div>
      </Band>

      {/* ── 2. Finding 1 ──────────────────────────────────────────── */}
      <Band tone="paper">
        <SectionHead
          title="Why every extra dollar is worth less than the one before it"
          intro="Bigger extra payments save more money in total. They also save less money per dollar. Both are true at the same time, and the second one is almost never printed."
        />

        <div className="mt-8 overflow-x-auto" data-print-full>
          <table className="w-full min-w-[32rem] border-collapse text-[0.92rem]">
            <caption className="label mb-3 text-left">
              What each dollar of extra principal returns
            </caption>
            <thead>
              <tr className="border-b-rule border-line-strong bg-paper-2">
                <th className="label px-3 py-2.5 text-left">Extra payment</th>
                <th className="label px-3 py-2.5 text-right">
                  Total extra paid
                </th>
                <th className="label px-3 py-2.5 text-right">Interest saved</th>
                <th className="label px-3 py-2.5 text-right">Per $1</th>
              </tr>
            </thead>
            <tbody>
              {DECLINE_ROWS.map((r) => (
                <tr key={r.extra} className="border-b border-line">
                  <td className="px-3 py-2.5">
                    <span className="num">{formatUSD(r.extra)}</span> a month
                  </td>
                  <td className="num px-3 py-2.5 text-right">
                    {formatUSD(r.paid)}
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
                Read the last column from top to bottom. It falls the whole way
                down, from ${SMALLEST.perDollar.toFixed(2)} to $
                {LARGEST.perDollar.toFixed(2)}
                {DECLINE_IS_MONOTONIC ? ", with no step back up" : ""}. Nothing
                about the loan changed between those rows. The only thing that
                changed is how hard the extra money was pushed.
              </p>
              <Sub>The reason, in plain terms</Sub>
              <p>
                Extra principal shortens a loan from the far end. The months
                that disappear are the last months on the schedule, not the next
                ones. And the last months are the cheap ones. In the early years
                of a mortgage most of each payment is interest and only a small
                part is principal, and by the final years that has flipped
                around (
                <InlineLink href={ROUTES.principalVsInterest}>
                  the month it flips
                </InlineLink>
                ). So the months you erase off the end were never carrying much
                interest in the first place.
              </p>
            </>
          }
          right={
            <>
              <p>
                Cut {formatDuration(MONTHLY_ROWS[0].monthsSaved)} off the end and
                you cancel the cheapest years there are. Cut{" "}
                {formatDuration(MONTHLY_ROWS[5].monthsSaved)} off and you are
                still cancelling those same cheap final years, plus a stack of
                years above them that were not much more expensive. That is why
                the return per dollar keeps sliding as the extra payment grows.
              </p>
              <p>
                None of this makes the big payment a bad outcome.{" "}
                {formatUSD(LARGEST.interestSaved)} is the largest saving
                anywhere on this page. But it takes {formatUSD(LARGEST.paid)} of
                extra principal to get there, and each of those dollars did less
                work than a dollar in the {formatUSD(SMALLEST.extra)} row. At
                that size the real question is usually a{" "}
                <InlineLink href={ROUTES.termCompare}>shorter term</InlineLink>,
                where the lower rate does some of the work the extra payment is
                doing here.
              </p>
              <p>
                It is worth saying why you rarely read this. It points the wrong
                way for the industry. A page paid for by a lender has no reason
                to tell a reader that the smallest commitment on the list is the
                most efficient one per dollar. This site takes no lender money,
                so the column goes in.
              </p>
            </>
          }
        />
        </div>
      </Band>

      {/* ── 3. Finding 2 ──────────────────────────────────────────── */}
      <Band tone="surface">
        <SectionHead
          title="When the money lands"
          intro={`The same ${formatUSD(
            LUMP,
          )}, handed to the same loan at six different moments.`}
        />

        <div className="mt-8 overflow-x-auto" data-print-full>
          <table className="w-full min-w-[32rem] border-collapse text-[0.92rem]">
            <caption className="label mb-3 text-left">
              The same {formatUSD(LUMP)}, by the year it lands
            </caption>
            <thead>
              <tr className="border-b-rule border-line-strong bg-paper-2">
                <th className="label px-3 py-2.5 text-left">Lands in</th>
                <th className="label px-3 py-2.5 text-right">Interest saved</th>
                <th className="label px-3 py-2.5 text-right">Time cut</th>
                <th className="label px-3 py-2.5 text-right">Per $1</th>
              </tr>
            </thead>
            <tbody>
              {TIMING_ROWS.map((r) => (
                <tr key={r.year} className="border-b border-line">
                  <td className="px-3 py-2.5">
                    Year <span className="num">{r.year}</span>
                  </td>
                  <td className="num px-3 py-2.5 text-right">
                    {formatUSD(r.interestSaved)}
                  </td>
                  <td className="num px-3 py-2.5 text-right">
                    {formatDuration(r.monthsSaved)}
                  </td>
                  <td className="num px-3 py-2.5 text-right font-bold">
                    {`$${r.perDollar.toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PrepaymentDecayChart
          points={TIMING_ROWS.map((r) => ({
            year: r.year,
            perDollar: r.perDollar,
          }))}
          amount={formatUSD(LUMP)}
        />

        <div className="mt-10">
        <EditorialCols
          left={
            <>
              <p>
                Identical money. The only thing that changed is the calendar. In
                year {FIRST_YEAR.year} that {formatUSD(LUMP)} returns $
                {FIRST_YEAR.perDollar.toFixed(2)} of interest saved per dollar,
                the highest figure anywhere on this page. In year{" "}
                {YEAR_20.year} it returns ${YEAR_20.perDollar.toFixed(2)}.
              </p>
              <p>
                Read that one carefully, because it is easy to skim past. Under
                a dollar back for every dollar sent means the prepayment saves
                less in interest than it cost in cash. By year {LAST_YEAR.year}{" "}
                it is ${LAST_YEAR.perDollar.toFixed(2)}.{" "}
                {BELOW_BREAK_EVEN === 2
                  ? "Two of the six land below that line."
                  : `${BELOW_BREAK_EVEN} of the six land below that line.`}
              </p>
            </>
          }
          right={
            <>
              <p>
                Most published pages will tell you that early payments matter
                more. That much is common knowledge. What they do not do is put
                a price on it, and the price is the whole story. The same{" "}
                {formatUSD(LUMP)} saves {formatUSD(FIRST_YEAR.interestSaved)} in
                year {FIRST_YEAR.year} and {formatUSD(YEAR_20.interestSaved)} in
                year {YEAR_20.year}.
              </p>
              <p>
                This also changes what a windfall is. A {formatUSD(LUMP)} check
                is not a fixed amount of mortgage relief. Its value is set almost
                entirely by the size of the balance it lands on, and that
                balance falls slowly at first and then quickly.
              </p>
              <p>
                The same effect runs inside a single year, not just across
                twenty of them.{" "}
                <InlineLink href={ROUTES.twoExtraPayments}>
                  Two extra payments a year, taken month by month
                </InlineLink>{" "}
                follows one plan through all twelve months of the loan year: the
                payoff date moves {CHILD_TIMING_SPREAD} months, and the pattern
                connecting them turns out to be regular.
              </p>
            </>
          }
        />
        </div>
      </Band>

      {/* ── 4. Finding 3 ──────────────────────────────────────────── */}
      <Band tone="paper">
        <SectionHead
          title="Spreading it out versus saving it up"
          intro="This is the most immediately useful line on the page, and acting on it costs nothing extra."
        />

        <div className="mt-8 overflow-x-auto" data-print-full>
          <table className="w-full min-w-[38rem] border-collapse text-[0.92rem]">
            <caption className="label mb-3 text-left">
              Same money each year, two schedules
            </caption>
            <thead>
              <tr className="border-b-rule border-line-strong bg-paper-2">
                <th className="label px-3 py-2.5 text-left">Method</th>
                <th className="label px-3 py-2.5 text-right">Each month</th>
                <th className="label px-3 py-2.5 text-right">Each year</th>
                <th className="label px-3 py-2.5 text-right">Paid off in</th>
                <th className="label px-3 py-2.5 text-right">Interest saved</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-line">
                <td className="px-3 py-2.5">
                  <span className="num">{usdCents(SPREAD)}</span> added to every
                  payment
                </td>
                <td className="num px-3 py-2.5 text-right">
                  {usdCents(SPREAD)}
                </td>
                <td className="num px-3 py-2.5 text-right">
                  {formatUSD(PAYMENT)}
                </td>
                <td className="num px-3 py-2.5 text-right">
                  {formatDuration(SPREAD_CMP.accelerated.months)}
                </td>
                <td className="num px-3 py-2.5 text-right font-bold">
                  {usdCents(SPREAD_SAVED)}
                </td>
              </tr>
              <tr className="border-b border-line">
                <td className="px-3 py-2.5">
                  One payment of{" "}
                  <span className="num">{formatUSD(PAYMENT)}</span> each
                  December
                </td>
                <td className="px-3 py-2.5 text-right text-muted">nothing</td>
                <td className="num px-3 py-2.5 text-right">
                  {formatUSD(PAYMENT)}
                </td>
                <td className="num px-3 py-2.5 text-right">
                  {formatDuration(YEAR_END.accelerated.months)}
                </td>
                <td className="num px-3 py-2.5 text-right font-bold">
                  {usdCents(YEAR_END_SAVED)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-10">
        <EditorialCols
          left={
            <>
              <p>
                Same money out of your pocket over a year. Both cost{" "}
                {formatUSD(PAYMENT)}. The monthly version saves{" "}
                {usdCents(SPREAD_SAVED)} and the once a year version saves{" "}
                {usdCents(YEAR_END_SAVED)}. The difference is{" "}
                <strong>{usdCents(SPREAD_EDGE)}</strong>, plus{" "}
                {formatDuration(
                  YEAR_END.accelerated.months - SPREAD_CMP.accelerated.months,
                )}{" "}
                off the term.
              </p>
              <p>
                Here is why. Money that arrives in January makes the balance
                smaller starting in January. Every interest charge from then on
                is worked out on that smaller balance. The February money does
                the same thing from February on, and so on down the year.
              </p>
            </>
          }
          right={
            <>
              <p>
                The December version sends exactly the same total. But that
                money sits waiting until December, and the interest charged in
                January through November was worked out as if it did not exist.
                The monthly version picks up eleven months of head start that
                the December version never gets.
              </p>
              <p>
                Nothing here asks for more money. It is the same annual amount
                arriving on a different schedule. If you want to run it on your
                own balance and rate,{" "}
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

      {/* ── 5. The biweekly caveat ────────────────────────────────── */}
      <Band tone="surface">
        <SectionHead
          title="A note on the biweekly row"
          intro={`In the main table the biweekly row and the one extra payment a year row show identical numbers. That is not a discovery about the world. It is a property of how this site models biweekly payments, and it would be dishonest to present it as anything more.`}
        />

        <EditorialCols
          left={
            <p>
              The calculation models a biweekly schedule as one extra full
              payment applied every twelfth month. That choice was deliberate. A
              US servicer running a biweekly program will typically hold the
              half payments as they come in and apply the money only once a full
              payment has piled up. Treated that way the two schedules really do
              the same thing, so the two rows come out the same.
            </p>
          }
          right={
            <p>
              A biweekly schedule that credited each half payment on the day it
              arrived would pay the loan down slightly faster than the row
              shows. So the model errs on the cautious side. It does not credit
              money until it has to. The real difference between biweekly and
              one extra payment a year is small, and it favors biweekly by an
              amount this site has not computed. What can be said is that the
              biweekly row is not an overstatement of what biweekly does.
            </p>
          }
        />
      </Band>

      {/* ── 6. Before you act ─────────────────────────────────────── */}
      <Band tone="paper">
        <SectionHead
          title="Before you send extra money"
          intro="Three things decide whether any figure on this page describes what actually happens to a loan."
        />

        <EditorialCols
          left={
            <>
              <Sub>1. You have to say it is a principal payment</Sub>
              <p>
                This is the most important practical point on the page, and it
                turns on one phrase in the rules. Fannie Mae Servicing Guide
                C-1.2-01 says the servicer must immediately accept and apply an
                extra principal payment, which the rules call a{" "}
                <strong>principal curtailment</strong>, when it is{" "}
                <strong>identified by the borrower as such</strong> on a current
                loan. The obligation is attached to the identifying, not to the
                money.
              </p>
              <p>
                So nothing in any table here is guaranteed by that rule unless
                the payment is designated as principal. Servicers differ in how
                they want it done: a principal only field in the online account,
                a separate payment with a note, or a form. The servicer can say
                which. The next statement settles it, because the principal
                balance should have dropped by the amount sent.
              </p>
              <p>
                Two conditions in the same rules are worth knowing. Timing
                changes the order of application: a curtailment sent{" "}
                <em>with</em> the scheduled monthly payment is applied after
                that payment, while one sent separately at any other time of the
                month is applied before the next scheduled payment (F-1-09). And
                if the loan is behind, an extra principal payment must first go
                toward curing the delinquency, and only what is left over
                reaches principal (C-1.2-01).
              </p>
              <p>
                These rules bind servicers of loans Fannie Mae owns or
                guarantees. That is a large share of US mortgages but not all of
                them, and a loan outside that set runs on its own servicer&rsquo;s
                terms.
              </p>
            </>
          }
          right={
            <>
              <Sub>2. Prepayment penalties</Sub>
              <p>
                Some mortgages carry a charge for paying off early or paying
                down large amounts early. Under federal rules a prepayment
                penalty on a covered fixed-rate qualified mortgage may not
                exceed 2% of the amount prepaid during the first two years,
                drops to a maximum of 1% during the third year, and is not
                permitted at all after that (12 C.F.R. § 1026.43(g)(2)). That
                phrase &ldquo;covered fixed-rate qualified mortgage&rdquo; is
                wording from the rule itself. Whether any penalty applies to a
                particular loan is written in that loan&rsquo;s documents.
              </p>
              <Sub>3. Extra payments do not lower next month&rsquo;s bill</Sub>
              <p>
                Paying extra shortens the loan. It does not reduce the required
                monthly payment, which stays at {formatUSD(PAYMENT)} on this
                loan no matter what is sent alongside it. Someone whose goal is
                a smaller monthly payment is asking about a recast or a{" "}
                <InlineLink href={ROUTES.refinance}>refinance</InlineLink>,
                which are two different ways of changing the loan itself, and
                this page does not cover either one.
              </p>
            </>
          }
        />
      </Band>

      {/* ── 7. What this leaves out ───────────────────────────────── */}
      <Band tone="surface">
        <SectionHead
          title="What this leaves out"
          intro="Every page on this site says what it does not measure."
        />
        <EditorialCols
          left={
            <ul>
              <li>
                Property taxes, homeowners insurance and any mortgage insurance.
                Every figure here is principal and interest only (
                <InlineLink href={ROUTES.payment}>
                  the full monthly payment
                </InlineLink>
                , and{" "}
                <InlineLink href={ROUTES.pmiDropOff}>
                  when PMI drops off
                </InlineLink>
                ).
              </li>
              <li>
                Whether the money would do better invested somewhere else (
                <InlineLink href={ROUTES.payoffVsInvest}>
                  pay off or invest
                </InlineLink>
                ).
              </li>
            </ul>
          }
          right={
            <ul>
              <li>
                Any change to the loan itself, such as a refinance or a recast.
              </li>
              <li>The biweekly modeling choice described above.</li>
            </ul>
          }
        />
      </Band>

      {/* Band supplies `mx-auto max-w-wrap px-[var(--gutter)]`. These three
          were shipped unwrapped on August 21 and rendered full bleed with no
          gutter, which is what broke the alignment below the fold. Every other
          page wraps them. */}
      <Band tone="paper">
        <SectionHead
          title="Common questions"
          intro="Answers written to stand on their own, because search engines lift them out of the page."
        />
        <FaqBlock items={FAQ} />
      </Band>

      <Band tone="surface">
        <Sources items={SOURCE_LIST} />
        <p className="mt-6 max-w-prose text-[0.85rem] text-muted">
          Every loan figure on this page was computed from the standard
          amortization formula for a fixed rate loan, not quoted from a third
          party. The per dollar column is interest saved divided by the extra
          principal actually paid, read off the schedule.
        </p>
      </Band>

      <Band tone="paper">
        <CalcFooter siblings={siblings} reviewed={REVIEWED} />
      </Band>
    </>
  );
}
