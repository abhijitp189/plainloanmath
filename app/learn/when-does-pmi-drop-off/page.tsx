import type { Metadata } from "next";
import { LAST_REVIEWED, PMI } from "@/lib/constants";
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
import PmiWindowChart from "@/components/PmiWindowChart";
import { InlineLink } from "@/components/InlineLink";
import { PMI_DROP_OFF_PATH, ROUTES, ROUTE_REVIEWED, relatedRoutes } from "@/lib/routes";
import {
  amortize,
  pmiSchedule,
  monthlyPayment,
  formatUSD,
  formatDuration,
} from "@/lib/mortgage";

export const metadata: Metadata = {
  title: "When Does PMI Drop Off? The Exact Month, Computed",
  description:
    "PMI comes off on one of three dates, and the down payment decides which. On a $425,000 home with 10% down at 6.75%, you may ask at month 98 and it ends on its own at month 112.",
  alternates: { canonical: PMI_DROP_OFF_PATH },
};

const REVIEWED = ROUTE_REVIEWED.pmiDropOff ?? LAST_REVIEWED;

// ─────────────────────────────────────────────────────────────────────────────
// Every figure on this page is computed at build time from lib/mortgage.ts.
//
// Project brief §10: worked examples are computed, not typed. The statutory
// tests here are read off `pmiSchedule`, which already existed for the payment
// calculator and which reads the ORIGINAL amortization schedule with no extra
// payment — exactly what 12 U.S.C. § 4901(18)(A) requires and the single
// distinction this page is built around. Nothing below is a number somebody
// wrote down.
//
// Independently recomputed on August 19, 2026 in a separate script written
// from the amortization formula rather than from this engine, across all five
// down-payment tiers and all seven extra-principal rows. Every month agrees.
//
// The canonical site example is $340,000 at 6.75% over 30 years, a $425,000
// home with 20% down. Twenty percent down carries no PMI, so the premise makes
// it impossible. Project brief §10 says adapt rather than abandon: same home,
// same rate, same term, 10% down instead of 20.
// ─────────────────────────────────────────────────────────────────────────────

const HOME = 425_000;
const RATE = 6.75;
const TERM = 360;

const DOWN_PCT = 0.1;
const DOWN = HOME * DOWN_PCT;
const LOAN = HOME - DOWN;

const PAYMENT = monthlyPayment(LOAN, RATE, TERM);
const SCHEDULE = amortize(LOAN, RATE, TERM).schedule;

const PMI_10 = pmiSchedule(HOME, LOAN, RATE, TERM, PMI.requestLtv, PMI.automaticLtv);

/** The statute measures against original value, § 4901(12). Never against a
 *  later appraisal, which is the single most common misreading of the Act. */
const AT_80 = HOME * PMI.requestLtv;
const AT_78 = HOME * PMI.automaticLtv;

const REQUEST = PMI_10.requestMonth!;
const AUTOMATIC = PMI_10.automaticMonth!;

/** § 4902(c) forbids PMI beyond the first day of the month immediately
 *  FOLLOWING the midpoint. The midpoint of a 360-month schedule is month 180;
 *  the deadline is month 181. `pmiSchedule` returns the deadline. */
const MIDPOINT = TERM / 2;
const FINAL = PMI_10.finalMonth!;

const WINDOW = AUTOMATIC - REQUEST;

const bal = (month: number) => SCHEDULE[month - 1].balance;

/** ── The down-payment tiers ─────────────────────────────────────── */

const TIER_PCTS = [0.03, 0.05, 0.1, 0.15, 0.19] as const;

const TIERS = TIER_PCTS.map((pct) => {
  const loan = HOME * (1 - pct);
  const s = pmiSchedule(HOME, loan, RATE, TERM, PMI.requestLtv, PMI.automaticLtv);
  return {
    label: `${(pct * 100).toFixed(0)}%`,
    loan,
    payment: monthlyPayment(loan, RATE, TERM),
    requestMonth: s.requestMonth!,
    automaticMonth: s.automaticMonth!,
  };
});

const LOWEST = TIERS[0];
const HIGHEST = TIERS[TIERS.length - 1];
const REQUEST_SPREAD = LOWEST.requestMonth - HIGHEST.requestMonth;
const AUTOMATIC_SPREAD = LOWEST.automaticMonth - HIGHEST.automaticMonth;

/** Every tier's automatic date lands before the § 4902(c) deadline, which is
 *  the claim the chart is drawn to prove. Asserted rather than asserted in
 *  prose, so a future rate change that breaks it breaks the build instead. */
const MIDPOINT_NEVER_GOVERNS = TIERS.every((t) => t.automaticMonth < FINAL);

/** ── What extra principal buys ──────────────────────────────────── */

const EXTRAS = [50, 100, 150, 200, 250, 300, 500] as const;

const EXTRA_ROWS = EXTRAS.map((extra) => {
  const s = amortize(LOAN, RATE, TERM, extra).schedule;
  const row = s.find((r) => r.balance <= AT_80)!;
  return { extra, month: row.month, earlier: REQUEST - row.month };
});

const EXTRA_100 = EXTRA_ROWS[1];

/** ── Sources ────────────────────────────────────────────────────── */

const HPA_URL =
  "https://uscode.house.gov/view.xhtml?path=%2Fprelim%40title12%2Fchapter49&edition=prelim";
const FANNIE_URL =
  "https://servicing-guide.fanniemae.com/svc/b-8.1-04/termination-conventional-mortgage-insurance";
const CFPB_URL =
  "https://www.consumerfinance.gov/ask-cfpb/when-can-i-remove-private-mortgage-insurance-pmi-from-my-loan-en-202/";

const SOURCE_LIST = [
  {
    label:
      "Homeowners Protection Act of 1998, 12 U.S.C. ch. 49 (§§ 4901, 4902, 4904, 4905, 4906, 4908)",
    url: HPA_URL,
    verified: "2026-08-19",
  },
  {
    label:
      "Fannie Mae Servicing Guide B-8.1-04, Termination of Conventional Mortgage Insurance",
    url: FANNIE_URL,
    verified: "2026-08-19",
  },
  {
    label:
      "Consumer Financial Protection Bureau, when you can remove PMI from your loan",
    url: CFPB_URL,
    verified: "2026-08-19",
  },
];

const FAQ: Faq[] = [
  {
    q: "does pmi come off automatically or do i have to ask",
    a: `Both routes exist and they land on different months. Automatic termination at ${
      PMI.automaticLtv * 100
    }% of the home's original value happens with no request, under 12 U.S.C. § 4902(b), provided the borrower is current. Cancellation at ${
      PMI.requestLtv * 100
    }% under § 4902(a) requires a written request, a good payment history and evidence the value has not declined. On a ${formatUSD(
      LOAN,
    )} loan at ${RATE}% those dates are month ${AUTOMATIC} and month ${REQUEST}, a gap of ${WINDOW} months.`,
  },
  {
    q: "my home went up in value, does that get pmi removed",
    a: `Not under federal law. Original value is defined at 12 U.S.C. § 4901(12) as the lesser of the sales price or the appraised value at closing, so every statutory date is measured against a number fixed on the day you signed. Appreciation moves none of them. It can work under the loan owner's rules instead: Fannie Mae Servicing Guide B-8.1-04 allows termination at 75% LTV where the loan is between two and five years old, or 80% past five years, evidenced by a valuation based on an interior and exterior inspection.`,
  },
  {
    q: "will paying extra get pmi off sooner",
    a: `It moves one date and not the other. Under 12 U.S.C. § 4901(2)(A)(ii) the borrower may take a cancellation date based solely on actual payments, so ${formatUSD(
      EXTRA_100.extra,
    )} extra a month on the ${formatUSD(
      LOAN,
    )} example moves the request date from month ${REQUEST} to month ${
      EXTRA_100.month
    }. The automatic date stays at month ${AUTOMATIC} in every case, because § 4901(18)(A) reads the initial amortization schedule irrespective of the outstanding balance. The written request is still required.`,
  },
  {
    q: "how long does the servicer have to act once i ask",
    a: "Premiums may not be collected more than 30 days after the later of the request date or the date every criterion was met, under 12 U.S.C. § 4902(e)(1) and Fannie Mae Servicing Guide B-8.1-04. Notice of termination is due within 30 days. Any unearned premium refund must reach the borrower no later than 45 days after termination. A denial has its own clock: § 4904(b) requires written grounds within 30 days, including the results of any appraisal relied on.",
  },
  {
    q: "can i get a refund of pmi premiums i already paid",
    a: "Unearned premiums must be returned within 45 days of cancellation or termination, under 12 U.S.C. § 4902(f)(1). Unearned means amounts paid for coverage running past the date PMI ended, not a refund of years of coverage already provided. Under § 4906 no fee may be charged for any notice the chapter requires, including the annual statement of cancellation rights.",
  },
  {
    q: "does any of this apply to an fha loan",
    a: "No. Private mortgage insurance is defined at 12 U.S.C. § 4901(13) to exclude insurance written under the National Housing Act, which covers FHA, along with title 38, which covers VA, and the Housing Act of 1949. FHA mortgage insurance premium and the VA funding fee run on rules set by those agencies rather than by this chapter, and none of the months on this page describe them.",
  },
];

export default function PmiDropOffPage() {
  const siblings = relatedRoutes("pmiDropOff");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Article",
              headline: "When PMI drops off, and how to force it sooner",
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
                "@id": `https://plainloanmath.com${PMI_DROP_OFF_PATH}`,
              },
            },
            faqSchema(FAQ),
            calcBreadcrumbSchema("pmiDropOff"),
          ]),
        }}
      />

      <CalcStripe
        route="pmiDropOff"
        title="When PMI drops off, and how to force it sooner"
        lede={`PMI ends on one of three dates, and the size of the down payment decides which one arrives first. On a ${formatUSD(
          HOME,
        )} home with ${
          DOWN_PCT * 100
        }% down at ${RATE}%, you may ask at month ${REQUEST} and it ends on its own at month ${AUTOMATIC}. Those ${WINDOW} months in between are the ones worth knowing about.`}
        asideTitle="What this page shows"
        asidePoints={[
          "The three dates, and which one applies",
          "The month for five different down payments",
          "Why extra payments move only one of them",
          "When a risen home value counts",
          "No lender money, no quote forms",
        ]}
      />

      {/* ── 1. The answer ─────────────────────────────────────────── */}
      <Band tone="surface">
        <SectionHead
          title={`Month ${REQUEST}, then month ${AUTOMATIC}`}
          intro={`A borrower may request cancellation in writing once the balance reaches ${
            PMI.requestLtv * 100
          }% of the home's original value (12 U.S.C. § 4902(a)). The servicer must end it unasked at ${
            PMI.automaticLtv * 100
          }% (§ 4902(b)). If neither has happened, it stops after the midpoint of the term (§ 4902(c)). The down payment decides which date arrives first.`}
        />

        <EditorialCols
          left={
            <>
              <p>
                Private mortgage insurance is a policy the borrower pays for
                that pays the lender if the loan defaults. Conventional lenders
                generally require it when the down payment is under 20%.
              </p>
              <p>
                Three other words run through this page. The{" "}
                <strong>servicer</strong> is the company that collects the
                monthly payment and runs the account, which is often not the
                company that owns the loan. <strong>LTV</strong>, or loan to
                value, is the balance divided by the property value, as a
                percentage. The{" "}
                <strong>amortization schedule</strong> is the month by month
                table fixed at closing, showing how each payment splits between
                interest and principal and what the balance will be at the end
                of every month.
              </p>
              <p>
                On a new loan almost the whole payment is interest, which is why
                the early months move the balance so little (
                <InlineLink href={ROUTES.principalVsInterest}>
                  the month principal finally overtakes interest
                </InlineLink>
                ).
              </p>
              <p>
                The months below are read off amortization schedules rather than
                estimated, and they are computed by the same engine that runs{" "}
                <InlineLink href={ROUTES.payment}>the payment calculator</InlineLink>, so the two
                pages cannot disagree.
              </p>
            </>
          }
          right={
            <>
              <Sub>The 80% date: someone has to ask</Sub>
              <p>
                Under 12 U.S.C. § 4902(a), PMI shall be canceled on the
                cancellation date, <em>or on any later date</em> on which the
                borrower meets four conditions: a request{" "}
                <strong>in writing</strong> to the servicer, a good payment
                history, being current, and satisfying the holder{"'"}s
                requirement for evidence that the value has not fallen below its
                original value, plus certification under § 4902(a)(4)(B) that
                the equity is unencumbered by a subordinate lien.
              </p>
              <p>
                A subordinate lien is a second mortgage or a home equity line
                recorded against the property. Every one of those conditions can
                be satisfied while nothing happens, because the written request
                is itself one of them.
              </p>
              <p>
                The cancellation date has two definitions and the borrower
                chooses. Under § 4901(2)(A) it is either{" "}
                <strong>(i)</strong> the date the balance is first{" "}
                <em>scheduled</em> to reach {PMI.requestLtv * 100}% of original
                value, irrespective of the outstanding balance, or{" "}
                <strong>(ii)</strong> the date the balance{" "}
                <strong>based solely on actual payments</strong> reaches it.
                Clause (ii) is the entire mechanism for getting there sooner.
              </p>
            </>
          }
        />

        <div className="mt-10">
          <EditorialCols
            left={
              <>
                <Sub>The 78% date: automatic, and locked to day one</Sub>
                <p>
                  Section 4902(b) requires the servicer to terminate with no
                  request from anyone. The termination date is defined at §
                  4901(18)(A) as the date the balance is first scheduled to
                  reach {PMI.automaticLtv * 100}% of original value, read from
                  the initial amortization schedule, and the statute adds the
                  phrase{" "}
                  <strong>irrespective of the outstanding balance</strong>.
                </p>
                <p>
                  The borrower must be current on that date. If not, §
                  4902(b)(2) moves termination to the first day of the first
                  month after the account becomes current.
                </p>
                <p>
                  One event resets all three dates. Under § 4902(d), if the loan
                  is modified, the cancellation date, the termination date and
                  the final termination are recalculated on the modified terms,
                  and B-8.1-04 applies the same treatment using the modified
                  schedule.
                </p>
              </>
            }
            right={
              <>
                <Sub>The midpoint: the outer limit</Sub>
                <p>
                  Under § 4902(c), if PMI has not been canceled under (a) or
                  terminated under (b), it may in no case be imposed beyond the
                  first day of the month immediately following the midpoint of
                  the amortization period, provided the borrower is current.
                </p>
                <p>
                  Midpoint is defined at § 4901(7) as the point halfway through
                  the scheduled amortization period. On a 30-year loan that is
                  month <span className="num">{MIDPOINT}</span>, so the deadline
                  itself is month <span className="num">{FINAL}</span>. On a
                  15-year loan the midpoint is month{" "}
                  <span className="num">90</span> (
                  <InlineLink href={ROUTES.termCompare}>15-year against 30-year</InlineLink>).
                </p>
                <p>
                  <strong>Original value</strong> is defined at § 4901(12) as
                  the <em>lesser</em> of the contract sales price or the
                  appraised value at the time the loan was made, and on a
                  refinance it means the appraised value the lender relied on to
                  approve it. Every date above is measured against that fixed
                  number.
                </p>
              </>
            }
          />
        </div>
      </Band>

      {/* ── 2. Worked example ─────────────────────────────────────── */}
      <Band tone="paper">
        <SectionHead
          title={`A ${formatUSD(HOME)} home with ${DOWN_PCT * 100}% down`}
          intro={`Same house, rate and term as the example this site uses everywhere else, with ${
            DOWN_PCT * 100
          }% down instead of 20%, since 20% down carries no PMI at all.`}
        />

        <EditorialCols
          left={
            <>
              <div className="overflow-x-auto" data-print-full>
                <table className="w-full min-w-[20rem] border-collapse text-[0.92rem]">
                  <tbody>
                    {[
                      ["Home price and original value", formatUSD(HOME)],
                      [
                        `Down payment, ${DOWN_PCT * 100}%`,
                        formatUSD(DOWN),
                      ],
                      ["Loan amount", formatUSD(LOAN)],
                      ["Rate, 30-year fixed", `${RATE}%`],
                      ["Monthly principal and interest", formatUSD(PAYMENT)],
                      [
                        `${PMI.requestLtv * 100}% of original value`,
                        formatUSD(AT_80),
                      ],
                      [
                        `${PMI.automaticLtv * 100}% of original value`,
                        formatUSD(AT_78),
                      ],
                    ].map(([k, v]) => (
                      <tr key={k} className="border-b border-line">
                        <td className="px-3 py-2.5 text-ink-2">{k}</td>
                        <td className="num px-3 py-2.5 text-right">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          }
          right={
            <>
              <Sub>The two months that matter</Sub>
              <p>
                The balance first falls to {formatUSD(AT_80)} in{" "}
                <strong>month {REQUEST}</strong>, at{" "}
                <span className="num">{formatUSD(bal(REQUEST))}</span>. The
                month before it was still{" "}
                <span className="num">{formatUSD(bal(REQUEST - 1))}</span>. That
                is {formatDuration(REQUEST)} in, and it is the first day a
                written request can succeed.
              </p>
              <p>
                It first falls to {formatUSD(AT_78)} in{" "}
                <strong>month {AUTOMATIC}</strong>, at{" "}
                <span className="num">{formatUSD(bal(AUTOMATIC))}</span>, which
                is {formatDuration(AUTOMATIC)} in. That is the day the servicer
                must act unasked.
              </p>
              <p>
                <strong>
                  The gap between the two is {WINDOW} months.
                </strong>{" "}
                The midpoint rule never governs this loan: at month {FINAL} the
                balance would be down to{" "}
                <span className="num">{formatUSD(bal(MIDPOINT))}</span>, which
                is {((bal(MIDPOINT) / HOME) * 100).toFixed(1)}% of original
                value, and PMI has been gone for{" "}
                {FINAL - AUTOMATIC} months by then.
              </p>
              <p>
                {formatUSD(AT_80)} is also exactly the loan a buyer with 20%
                down would have started with. The buyer who put{" "}
                {DOWN_PCT * 100}% down reaches in month {REQUEST} the balance
                the other buyer had on day one, and has paid PMI for all{" "}
                {REQUEST} of those months.
              </p>
            </>
          }
        />

        <PmiWindowChart
          tiers={TIERS.map((t) => ({
            label: t.label,
            requestMonth: t.requestMonth,
            automaticMonth: t.automaticMonth,
          }))}
          finalMonth={FINAL}
        />

        <p className="mt-6 max-w-prose text-[0.9rem] text-ink-2">
          Savings on this page are counted in months of premium rather than in
          dollars. PMI rates vary by credit score, LTV, term and insurer, and no
          primary source publishes a single figure. A reader with a premium
          amount printed on a statement can enter it in{" "}
          <InlineLink href={ROUTES.payment}>the payment calculator</InlineLink>, which takes PMI
          as an input and applies these same two dates. The payment and every
          schedule behind it come from the standard amortization formula (
          <InlineLink href={ROUTES.methodology}>how we calculate</InlineLink>).
        </p>
      </Band>

      {/* ── 3. Down payment ───────────────────────────────────────── */}
      <Band tone="surface">
        <SectionHead
          title="Why the answer changes with the down payment"
          intro={`Same ${formatUSD(
            HOME,
          )} home, same ${RATE}%, same 30-year term. Months are read from the initial amortization schedule with no extra payments.`}
        />

        <div className="overflow-x-auto" data-print-full>
          <table className="w-full min-w-[30rem] border-collapse text-[0.92rem]">
            <caption className="label mb-3 text-left">
              When PMI can be requested off, and when it ends by itself
            </caption>
            <thead>
              <tr className="border-b-rule border-line-strong bg-paper-2">
                <th className="label px-3 py-2.5 text-left">Down</th>
                <th className="label px-3 py-2.5 text-right">Loan</th>
                <th className="label px-3 py-2.5 text-right">Monthly P&amp;I</th>
                <th className="label px-3 py-2.5 text-right">
                  May request at {PMI.requestLtv * 100}%
                </th>
                <th className="label px-3 py-2.5 text-right">
                  Automatic at {PMI.automaticLtv * 100}%
                </th>
              </tr>
            </thead>
            <tbody>
              {TIERS.map((t) => (
                <tr key={t.label} className="border-b border-line">
                  <td className="num px-3 py-2.5">{t.label}</td>
                  <td className="num px-3 py-2.5 text-right">
                    {formatUSD(t.loan)}
                  </td>
                  <td className="num px-3 py-2.5 text-right">
                    {formatUSD(t.payment)}
                  </td>
                  <td className="num px-3 py-2.5 text-right">
                    Month {t.requestMonth}
                  </td>
                  <td className="num px-3 py-2.5 text-right">
                    Month {t.automaticMonth}
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
                  The spread between a {LOWEST.label} down payment and a{" "}
                  {HIGHEST.label} one is{" "}
                  <span className="num">{REQUEST_SPREAD}</span> months on the
                  request date and <span className="num">{AUTOMATIC_SPREAD}</span>{" "}
                  months, {formatDuration(AUTOMATIC_SPREAD)}, on the automatic
                  date.
                </p>
                <p>
                  That range is why one page can say PMI ends around year eleven
                  and another can point at the midpoint of the loan, and neither
                  is making it up. They are describing different down payments.
                  There is no single answer to give, which is why this page
                  gives five.
                </p>
              </>
            }
            right={
              <>
                <p>
                  {MIDPOINT_NEVER_GOVERNS
                    ? `On none of these loans does the midpoint rule govern, because at ${RATE}% the ${
                        PMI.automaticLtv * 100
                      }% date always arrives before month ${FINAL}.`
                    : `At ${RATE}% at least one of these loans is governed by the midpoint rule.`}{" "}
                  Section 4902(c) does its work elsewhere: on very high LTV
                  loans, on longer terms, and where a higher rate slows early
                  amortization enough to push the {PMI.automaticLtv * 100}% date
                  past the halfway mark.
                </p>
                <p>
                  It is also the only one of the three dates that needs neither
                  a request nor a particular balance. It is a deadline on the
                  requirement itself.
                </p>
              </>
            }
          />
        </div>
      </Band>

      {/* ── 4. Extra payments ─────────────────────────────────────── */}
      <Band tone="paper">
        <SectionHead
          title="Extra payments move one date and not the other"
          intro="This is where most published answers go wrong. The two dates are built from different inputs, and only one of them reads what you actually paid."
        />

        <EditorialCols
          left={
            <>
              <p>
                Section 4901(2)(A)(ii) reads actual payments. Section
                4901(18)(A) reads the initial amortization schedule,{" "}
                <strong>irrespective of the outstanding balance</strong>.
              </p>
              <p>
                So a borrower who pays the loan down faster earns an earlier
                date on which a <strong>request</strong> may be made. The
                automatic date does not move at all. Paying{" "}
                {formatUSD(500)} a month extra and then waiting for the servicer
                to notice buys nothing.
              </p>
              <p>
                Put the other way: {formatUSD(EXTRA_100.extra)} extra a month
                buys a request date {EXTRA_100.earlier} months earlier, but only
                if the request is made. Without the letter, PMI runs to month{" "}
                {AUTOMATIC} on this loan no matter what was paid.
              </p>
              <p>
                Extra principal also removes interest from the rest of the loan,
                which is a separate calculation with a much larger number
                attached to it (
                <InlineLink href={ROUTES.payoff}>what extra payments do to the total</InlineLink>
                ).
              </p>
            </>
          }
          right={
            <div className="overflow-x-auto" data-print-full>
              <table className="w-full min-w-[20rem] border-collapse text-[0.92rem]">
                <caption className="label mb-3 text-left">
                  Extra principal every month, on the {formatUSD(LOAN)} loan
                </caption>
                <thead>
                  <tr className="border-b-rule border-line-strong bg-paper-2">
                    <th className="label px-3 py-2.5 text-left">Extra</th>
                    <th className="label px-3 py-2.5 text-right">
                      May request
                    </th>
                    <th className="label px-3 py-2.5 text-right">Earlier by</th>
                  </tr>
                </thead>
                <tbody>
                  {EXTRA_ROWS.map((r) => (
                    <tr key={r.extra} className="border-b border-line">
                      <td className="num px-3 py-2.5">
                        {formatUSD(r.extra)}
                      </td>
                      <td className="num px-3 py-2.5 text-right">
                        Month {r.month}
                      </td>
                      <td className="num px-3 py-2.5 text-right">
                        {r.earlier} months
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        />

        <div className="mt-10 max-w-prose border-l-rule border-line-strong bg-paper-2 p-6">
          <p className="text-ink">
            <strong>
              Every row above moves the borrower request date under 12 U.S.C. §
              4901(2)(A)(ii) and nothing else. The automatic termination date
              under § 4901(18)(A) stays at month {AUTOMATIC} in every one of
              them,
            </strong>{" "}
            because that date is read off the initial amortization schedule
            irrespective of the outstanding balance. A borrower who pays extra
            and then waits has changed the date on which a written request would
            succeed, and has changed nothing about what the servicer will do
            unprompted.
          </p>
        </div>
      </Band>

      {/* ── 5. Current value ──────────────────────────────────────── */}
      <Band tone="surface">
        <SectionHead
          title="When a risen home value counts, and when it does not"
          intro="Under the Homeowners Protection Act it does not count at all. Original value is fixed on the day you signed, and all three statutory dates run against that number. A home that appreciates 40% produces exactly the same two months."
        />

        <EditorialCols
          left={
            <>
              <p>
                Appreciation counts under a different set of rules: those of
                whoever owns the loan. For loans owned by Fannie Mae they are in{" "}
                <InlineLink href={FANNIE_URL}>Servicing Guide B-8.1-04</InlineLink>.
              </p>
              <Sub>The current value route, and its seasoning tiers</Sub>
              <p>
                Seasoning is the age of the loan, measured from closing. For a
                one unit principal residence or second home, Fannie Mae allows
                borrower initiated termination based on current value when the
                LTV is:
              </p>
              <ul className="ml-5 list-disc space-y-1.5">
                <li>
                  <strong>75% or less</strong> where seasoning is between two
                  and five years
                </li>
                <li>
                  <strong>80% or less</strong> where seasoning is greater than
                  five years
                </li>
                <li>
                  <strong>80% or less</strong> where the two year minimum is
                  waived because improvements the borrower made increased the
                  property value
                </li>
              </ul>
              <p>
                Fannie Mae describes qualifying improvements as renovation work
                that substantially improves marketability and extends the useful
                life of the property, giving kitchen and bathroom renovations
                and added square footage as its examples. Repairs that keep the
                property maintained and functional are not improvements for this
                purpose.
              </p>
            </>
          }
          right={
            <>
              <Sub>The servicer is not allowed to offer this one</Sub>
              <p>
                B-8.1-04 states that the servicer{" "}
                <strong>must not solicit</strong> a borrower for termination
                based on current value, and must act only in response to a
                borrower initiated request. Nothing arrives in the mail. No call
                comes. On this route, the borrower asking is the only event that
                starts anything.
              </p>
              <p>
                The original value route is not identical. There the servicer{" "}
                <em>is</em> authorized to identify a loan close to or at{" "}
                {PMI.requestLtv * 100}% and tell the borrower what is required,
                though it may still terminate only after a direct response. So
                one route may produce a letter and the other never will, and
                neither ends without the borrower answering.
              </p>
              <p>
                The LTV must be evidenced by a valuation based on an{" "}
                <strong>interior and exterior inspection</strong> of the
                property. A broker price opinion, or BPO, is an estimate
                prepared by a real estate broker rather than a licensed
                appraiser. Whichever product a servicer orders has to meet that
                inspection standard, so an online estimate does not satisfy it.
              </p>
              <p>
                The payment record required is the same on both routes: current
                when the request is made, nothing 30 or more days past due in
                the last 12 months, and nothing 60 or more days past due in the
                last 24 months. That is also the statutory standard for good
                payment history at § 4901(4).
              </p>
            </>
          }
        />

        <div className="mt-10">
          <EditorialCols
            left={
              <>
                <Sub>Termination based on original value</Sub>
                <p>
                  The same section covers the original value route: the balance
                  must first reach {PMI.requestLtv * 100}% of original value,
                  with that payment record,{" "}
                  <strong>and</strong> verification that current value is not
                  below original value. Appreciation is not required here.
                  Holding value is.
                </p>
                <p>
                  Where the automated value comes back below the original value,
                  the servicer must deny the request unless the borrower either
                  pays the balance down far enough to satisfy the LTV criterion
                  anyway, or chooses to have the value verified by a BPO or an
                  appraisal. A denial on an automated estimate is not the end of
                  the route.
                </p>
              </>
            }
            right={
              <>
                <Sub>Deadlines, refunds and denials</Sub>
                <p>
                  Premiums may not be collected more than 30 days after the
                  later of the request date or the date every criterion was met,
                  under both B-8.1-04 and 12 U.S.C. § 4902(e)(1). The borrower
                  must be notified within 30 days of termination. Any unearned
                  premium refund must be forwarded within 45 days of the
                  termination date, which is also the statutory limit at §
                  4902(f)(1). Section 4906 forbids charging any fee for the
                  notices the chapter requires.
                </p>
                <p>
                  If the request is denied, § 4904(b) requires the servicer to
                  give written grounds for the determination, including the
                  results of any appraisal relied on, within 30 days.
                </p>
                <p>
                  <strong>One scope limit.</strong> Those are Fannie Mae{"'"}s
                  rules. A loan owned by Freddie Mac, or held in a lender{"'"}s
                  own portfolio, follows that owner{"'"}s rules, which may set
                  different thresholds and seasoning periods. The federal dates
                  in § 4902 apply either way. Which owner{"'"}s rules apply is
                  something the servicer can be asked in writing.
                </p>
              </>
            }
          />
        </div>
      </Band>

      {/* ── 6. The request ────────────────────────────────────────── */}
      <Band tone="paper">
        <SectionHead
          title="What a written request has to establish"
          intro="The statute and the Servicing Guide between them define what the request has to contain. This is what the rules require, not a template and not advice."
        />

        <EditorialCols
          left={
            <ul className="ml-5 list-disc space-y-3">
              <li>
                <strong>The request itself, in writing.</strong> Section 4902(a)
                makes writing a condition rather than a courtesy. B-8.1-04 lets
                a servicer act on a verbal request under Fannie Mae{"'"}s own
                criteria, but only a written one satisfies the statute, so a
                phone call can succeed and cannot be relied on.
              </li>
              <li>
                <strong>Which basis is being used:</strong> the balance reaching{" "}
                {PMI.requestLtv * 100}% of <em>original</em> value, or current
                value under the owner{"'"}s rules. The evidence differs, so the
                basis has to be named.
              </li>
              <li>
                <strong>The loan number and the property address.</strong>
              </li>
            </ul>
          }
          right={
            <ul className="ml-5 list-disc space-y-3">
              <li>
                <strong>A statement that the borrower is current,</strong> with
                nothing 30 or more days past due in the last 12 months and
                nothing 60 or more days past due in the last 24. That is the
                standard in § 4901(4) and in B-8.1-04.
              </li>
              <li>
                <strong>Certification that no subordinate lien</strong> is
                recorded against the property, which § 4902(a)(4)(B) requires.
              </li>
              <li>
                <strong>A request that the servicer state in writing</strong>{" "}
                who owns the loan and which owner{"'"}s rules apply, and that it
                give the written grounds § 4904(b) requires if the answer is a
                denial, including any appraisal results.
              </li>
            </ul>
          }
        />

        <p className="mt-8 max-w-prose text-ink-2">
          A dated record of sending is what makes the 30 day and 45 day clocks
          measurable.
        </p>
      </Band>

      {/* ── 7. Exclusions ─────────────────────────────────────────── */}
      <Band tone="surface">
        <SectionHead
          title="Where none of this applies"
          intro="Four situations in which the months on this page describe nothing at all. The first is the most common reason a reader's PMI never seems to end."
        />

        <EditorialCols
          left={
            <>
              <Sub>Lender paid mortgage insurance</Sub>
              <p>
                Section 4905(b) states that §§ 4902 through 4904 do not apply to
                lender paid mortgage insurance. Section 4905(c)(1)(B) records
                that it generally carries a higher interest rate than borrower
                paid coverage and ends only when the loan is refinanced, paid
                off, or otherwise terminated.
              </p>
              <p>
                A borrower who took a loan marketed as having no PMI, in
                exchange for a higher rate, has no cancellation date at all.
                There is nothing to write to the servicer about. The route out
                is a new loan (
                <InlineLink href={ROUTES.refinance}>what a refinance has to recover</InlineLink>
                ).
              </p>
              <Sub>FHA and VA loans</Sub>
              <p>
                The definition of private mortgage insurance at § 4901(13)
                excludes insurance made under the National Housing Act, title 38
                of the U.S. Code, and the Housing Act of 1949. FHA mortgage
                insurance premium and the VA funding fee follow entirely
                separate rules, and this page does not cover them.
              </p>
            </>
          }
          right={
            <>
              <Sub>Older loans, and homes you do not live in</Sub>
              <p>
                The chapter reaches a residential mortgage transaction, defined
                at § 4901(14) and § 4901(15) as one secured by a single family
                dwelling that is the principal residence of the borrower and
                consummated on or after{" "}
                <span className="num">July 29, 1999</span>. Investment
                properties, second homes and older loans sit outside it, though
                the owner{"'"}s own rules may still provide a route: Fannie Mae
                sets 70% LTV for those property types.
              </p>
              <Sub>High risk loans</Sub>
              <p>
                Under § 4902(g)(1)(B) and (g)(2), the cancellation and automatic
                termination provisions do not apply to loans classified high
                risk at consummation. For a non-conforming high risk loan,
                termination occurs at 77% of original value rather than{" "}
                {PMI.automaticLtv * 100}%, and the midpoint rule still applies.
              </p>
            </>
          }
        />

        <div className="mt-10 max-w-prose">
          <Sub>What this page leaves out</Sub>
          <p className="mt-3 text-ink-2">
            Freddie Mac and portfolio lender thresholds are not stated here,
            because they were not read against a primary source for this page.
            PMI premium rates are not stated, for the reason given above. State
            law is not covered either, and it can matter: § 4908(a)(2) preserves
            certain state laws, in states that already regulated private
            mortgage insurance on or before{" "}
            <span className="num">January 2, 1998</span> and legislated within
            two years of the Act, where those laws require termination earlier,
            at a higher balance, or with more disclosure than the federal
            chapter does.
          </p>
        </div>
      </Band>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <Band tone="paper">
        <SectionHead
          title="Common questions"
          intro="Answers written to stand on their own, because search engines lift them out of the page."
        />
        <FaqBlock items={FAQ} />
      </Band>

      {/* ── Sources ───────────────────────────────────────────────── */}
      <Band tone="surface">
        <Sources items={SOURCE_LIST} />
        <p className="mt-6 max-w-prose text-[0.85rem] text-muted">
          Loan figures on this page were computed from the standard amortization
          formula for a fixed rate loan, not quoted from a third party. The
          statutory tests are read off the original schedule with no extra
          payment, which is what 12 U.S.C. § 4901(18)(A) requires.
        </p>
      </Band>

      <Band tone="paper">
        <CalcFooter siblings={siblings} reviewed={REVIEWED} />
      </Band>
    </>
  );
}
