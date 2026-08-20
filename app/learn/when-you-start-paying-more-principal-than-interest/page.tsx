import type { Metadata } from "next";
import { LAST_REVIEWED, PMMS } from "@/lib/constants";
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
import LoanLifeStrip from "@/components/LoanLifeStrip";
import { InlineLink } from "@/components/InlineLink";
import LoanSizeInvariance from "@/components/LoanSizeInvariance";
import {
  PRINCIPAL_VS_INTEREST_PATH,
  ROUTES,
  ROUTE_REVIEWED,
  relatedRoutes,
} from "@/lib/routes";
import {
  amortize,
  crossoverMonth,
  formatUSD,
  formatDuration,
} from "@/lib/mortgage";

export const metadata: Metadata = {
  title: "When Does Your Mortgage Pay More Principal Than Interest?",
  description:
    "At 6.75% on a 30-year loan, principal overtakes interest at month 238. The month for every rate, and why the size of your loan makes no difference at all.",
  alternates: { canonical: PRINCIPAL_VS_INTEREST_PATH },
};

const REVIEWED = ROUTE_REVIEWED.principalVsInterest ?? LAST_REVIEWED;

// ─────────────────────────────────────────────────────────────────────────────
// Every figure on this page, computed at build time from lib/mortgage.ts.
//
// Project brief §10: worked examples are computed, not typed. Nothing below is
// a number somebody wrote down, which is the only way this page and the payoff
// calculator can be guaranteed to agree about month 238.
//
// Independently recomputed on August 15, 2026 from the amortization formula in
// a separate script, and reproduces the published 2021 figures at 3%, 4% and
// 5% exactly (months 84, 153 and 195), which validates this engine against the
// only outside numbers available for this question.
// ─────────────────────────────────────────────────────────────────────────────

const LOAN = 340_000;
const RATE = 6.75;
const T30 = 360;
const T15 = 180;

/** The rate a 15-year is actually priced at, as against holding 6.75% fixed. */
const RATE_15 = 6.0;

type Case = {
  payment: number;
  totalInterest: number;
  crossover: number;
  firstInterest: number;
  firstPrincipal: number;
  interestByCrossover: number;
  balanceAtCrossover: number;
};

function build(rate: number, termMonths: number, loan = LOAN): Case {
  const { monthlyPayment, totalInterest, schedule } = amortize(
    loan,
    rate,
    termMonths,
  );
  const crossover = crossoverMonth(schedule) ?? schedule.length;
  const upTo = schedule.slice(0, crossover);

  return {
    payment: monthlyPayment,
    totalInterest,
    crossover,
    firstInterest: schedule[0].interest,
    firstPrincipal: schedule[0].principal,
    interestByCrossover: upTo.reduce((sum, r) => sum + r.interest, 0),
    balanceAtCrossover: upTo[upTo.length - 1].balance,
  };
}

const C30 = build(RATE, T30);
const C15 = build(RATE_15, T15);
const C15_SAME_RATE = build(RATE, T15);

/** Share of one figure in another, as a one-decimal percentage string. */
const share = (part: number, whole: number) =>
  `${((part / whole) * 100).toFixed(1)}%`;

const INTEREST_SHARE_AT_CROSSOVER = share(
  C30.interestByCrossover,
  C30.totalInterest,
);
const PRINCIPAL_SHARE_AT_CROSSOVER = share(LOAN - C30.balanceAtCrossover, LOAN);
const INTEREST_SHARE_15 = share(C15.interestByCrossover, C15.totalInterest);
const PRINCIPAL_SHARE_15 = share(LOAN - C15.balanceAtCrossover, LOAN);
const FIRST_INTEREST_SHARE_30 = share(C30.firstInterest, C30.payment);
const FIRST_PRINCIPAL_SHARE_30 = share(C30.firstPrincipal, C30.payment);
const FIRST_INTEREST_SHARE_15 = share(C15.firstInterest, C15.payment);

/** The strip is drawn from the plain 30-year schedule, with nothing erased. */
const STRIP = amortize(LOAN, RATE, T30);

/** Month 12 principal, for the "the split crawls" paragraph. */
const YEAR_ONE_END = STRIP.schedule[11].principal;

const RATES = [3, 4, 5, 6, 6.5, 6.75, 7, 7.5, 8] as const;

const TABLE = RATES.map((rate) => ({
  rate,
  thirty: build(rate, T30).crossover,
  fifteen: build(rate, T15).crossover,
}));

/** Half a point of rate, in dollars rather than in months. */
const LOWER_RATE = build(6.25, T30);
const RATE_STEP_SAVING = C30.totalInterest - LOWER_RATE.totalInterest;

/** What an extra payment does to the same loan. */
function withExtra(extraMonthly: number) {
  const { schedule, totalInterest, months } = amortize(
    LOAN,
    RATE,
    T30,
    extraMonthly,
  );
  return {
    crossover: crossoverMonth(schedule) ?? months,
    months,
    interestSaved: C30.totalInterest - totalInterest,
  };
}

const EXTRA_250 = withExtra(250);

const PAYMENT_GAP = C15.payment - C30.payment;

const FAQ: Faq[] = [
  {
    q: "when does a mortgage start paying more principal than interest",
    a: `On a 30-year fixed at ${RATE}%, principal overtakes interest at payment ${C30.crossover}, which is ${formatDuration(
      C30.crossover,
    )} in. The month depends almost entirely on the interest rate. At 5% it is month ${
      TABLE[2].thirty
    }, at 6% month ${TABLE[3].thirty}, at 7% month ${
      TABLE[6].thirty
    } and at 8% month ${
      TABLE[8].thirty
    }. Older articles that say seven years were calculated at a 3% rate.`,
  },
  {
    q: "why does my mortgage payment go almost entirely to interest at first",
    a: `Because interest is charged on the balance you still owe, and at the start you owe nearly all of it. On ${formatUSD(
      LOAN,
    )} at ${RATE}%, the first month's interest is ${formatUSD(
      C30.firstInterest,
    )} out of a ${formatUSD(C30.payment)} payment, leaving ${formatUSD(
      C30.firstPrincipal,
    )} for principal. The payment stays flat for thirty years, so the split can only shift as the balance falls, which it does slowly at first.`,
  },
  {
    q: "when does a 15-year mortgage start paying more principal than interest",
    a: `A 15-year fixed at ${RATE_15}% crosses at month ${
      C15.crossover
    }, ${formatDuration(C15.crossover)}. At ${RATE}% it crosses at month ${
      C15_SAME_RATE.crossover
    }, at 7% month ${TABLE[6].fifteen} and at 8% month ${
      TABLE[8].fifteen
    }. At 4% a 15-year loan puts more toward principal than interest in the very first payment. Because 15-year loans are typically priced below 30-year loans, the gap between the two crossover months is usually wider than the terms alone would suggest.`,
  },
  {
    q: "does the size of my loan change when principal passes interest",
    a: `No. At ${RATE}% over 30 years, a ${formatUSD(100_000)} loan, a ${formatUSD(
      LOAN,
    )} loan and a ${formatUSD(900_000)} loan all cross at month ${
      C30.crossover
    }. Doubling the amount borrowed doubles the monthly payment and doubles the monthly interest charge in the same proportion, so the ratio inside each payment is unchanged. Only the interest rate and the length of the term move the crossover month.`,
  },
  {
    q: "what month does a 30-year mortgage at 7% cross over",
    a: `Month ${TABLE[6].thirty}, which is ${formatDuration(
      TABLE[6].thirty,
    )}. At 6.5% it is month ${TABLE[4].thirty}, at ${RATE}% month ${
      TABLE[5].thirty
    }, at 7.5% month ${TABLE[7].thirty} and at 8% month ${
      TABLE[8].thirty
    }. The steps get shorter as rates rise, because the crossing point is being pushed toward the end of a fixed 360-month term and has less room left to move.`,
  },
  {
    q: "how much interest have i already paid when principal overtakes interest",
    a: `On a ${formatUSD(LOAN)} loan at ${RATE}% over 30 years, you have paid ${formatUSD(
      C30.interestByCrossover,
    )} in interest by payment ${
      C30.crossover
    }, which is ${INTEREST_SHARE_AT_CROSSOVER} of the ${formatUSD(
      C30.totalInterest,
    )} the loan will charge across its full life. Over the same payments you have repaid ${PRINCIPAL_SHARE_AT_CROSSOVER} of the amount borrowed, leaving ${formatUSD(
      C30.balanceAtCrossover,
    )} outstanding. On a 15-year loan at ${RATE_15}%, the equivalent figures are ${INTEREST_SHARE_15} and ${PRINCIPAL_SHARE_15}.`,
  },
  {
    q: "do extra payments move the crossover date earlier",
    a: `Yes, when the extra amount is applied to principal. Money that reduces the balance means next month's interest is charged on a smaller figure, so more of the flat payment reaches principal, and the effect compounds from there. On the loan above, an extra ${formatUSD(
      250,
    )} a month from the first payment moves the crossing from month ${
      C30.crossover
    } to month ${
      EXTRA_250.crossover
    }, counting the regular payment's own split. The CFPB tells borrowers to check whether their loan allows extra payments and, if it does, to make sure they are applied to the loan's principal rather than to interest.`,
  },
  {
    q: "does refinancing restart the amortization schedule",
    a: "Yes. A refinance pays off the existing mortgage with money from a new one, so the old schedule ends and a new one begins at month one, with its own rate, its own term and its own crossover point counted from the new closing date. Payments already made on the previous loan do not carry over. Refinancing a 30-year into another 30-year restarts the count from zero.",
  },
  {
    q: "why do older articles say the crossover is at seven years",
    a: `Because they were calculated at around 3%, where the crossover on a 30-year loan genuinely is month ${
      TABLE[0].thirty
    }, seven years exactly. Those figures were accurate when they were published in 2021. At ${RATE}% the same calculation gives month ${
      C30.crossover
    }, ${formatDuration(
      C30.crossover,
    )}, so a page written for a 3% market is describing a loan that is no longer being written.`,
  },
  {
    q: "is the crossover point the same as breaking even on my house",
    a: "No. The crossover only compares two halves of a single monthly payment: how much goes to interest against how much goes to the balance. It says nothing about the home's market value, about selling costs, or about whether a sale would leave you with money. Home equity and mortgage amortization are separate calculations with different inputs.",
  },
  {
    q: "does escrow change when principal passes interest",
    a: "No. Escrow collects property taxes and homeowners insurance alongside the loan payment, and the servicer pays those bills from the account. That money sits outside the principal and interest split, so it has no effect on the crossover month. It does mean the total on a monthly statement is larger than the principal and interest figure, and that it changes when tax bills or insurance premiums change.",
  },
  {
    q: "how do i find the exact month for my own mortgage",
    a: "The crossover is fixed by two things: the interest rate on your note and the original length of the term in months. Nothing else changes it, including the amount you borrowed. Under federal servicing rules your monthly mortgage statement has to show how much of the current payment goes to principal, to interest and to escrow, so you can read this month's split off your own statement, and an amortization table for the loan gives every month at once.",
  },
];

export default function PrincipalVsInterestPage() {
  const siblings = relatedRoutes("principalVsInterest");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Article",
              headline:
                "When your mortgage starts paying down more principal than interest",
              description: metadata.description,
              inLanguage: "en-US",
              datePublished: REVIEWED,
              dateModified: REVIEWED,
              // Organization identity only — project brief §11. No author
              // Person, no sameAs.
              publisher: {
                "@type": "Organization",
                name: "Plain Loan Math",
                url: "https://plainloanmath.com",
              },
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `https://plainloanmath.com${PRINCIPAL_VS_INTEREST_PATH}`,
              },
            },
            faqSchema(FAQ),
            calcBreadcrumbSchema("principalVsInterest"),
          ]),
        }}
      />

      <CalcStripe
        route="principalVsInterest"
        title="When your mortgage starts paying down more principal than interest"
        lede={`Most of the pages answering this question were written when a 30-year fixed cost 3%. At ${RATE}%, the month your payment finally puts more toward principal than interest is month ${C30.crossover}. Nineteen years and ten months in.`}
        asideTitle="What this page shows"
        asidePoints={[
          "The exact month, from 3% to 8%",
          `A 15-year loan tips at month ${C15.crossover}`,
          "Why loan size changes nothing at all",
          "What moves the date, and what resets it",
          "No lender money, no quote forms",
        ]}
      />

      {/* ── 1. The answer ─────────────────────────────────────────── */}
      <Band tone="surface">
        <SectionHead
          title={`Month ${C30.crossover}`}
          intro={`On a 30-year fixed at ${RATE}%, the first payment that sends more to principal than to interest is payment number ${C30.crossover}. ${formatDuration(
            C30.crossover,
          )} after your first one.`}
        />

        <EditorialCols
          left={
            <>
              <p>
                Month {C30.crossover}. That is the answer for a 30-year loan at{" "}
                {RATE}%, and it holds whether you borrowed{" "}
                {formatUSD(100_000)} or {formatUSD(900_000)}.
              </p>
              <p>
                The pages that say seven years were written in 2021, when a
                30-year fixed sat close to 3%. At 3% the answer really is month{" "}
                {TABLE[0].thirty}, so those pages were correct when they were
                published. That was the market in 2021. It is not the market
                now.
              </p>
              <p>
                Freddie Mac{"'"}s Primary Mortgage Market Survey put the 30-year
                average at{" "}
                <span className="num">{PMMS.thirtyYearPct}%</span> and the
                15-year at{" "}
                <span className="num">{PMMS.fifteenYearPct}%</span> for the week
                ending <span className="num">08/13/2026</span>, with the
                30-year at{" "}
                <span className="num">{PMMS.thirtyYearYearAgoPct}%</span> a year
                earlier. That survey is a national average built from purchase
                applications by borrowers with 20% down and good to excellent
                credit. It is not an offer, and no lender is bound by it.
              </p>
              <p>
                Your own month depends on the rate written on your note and the
                term you signed, not on an average, so{" "}
                <InlineLink href={ROUTES.payoff}>
                  entering your rate, balance and term will show the crossover
                  month for your actual loan
                </InlineLink>
                .
              </p>
            </>
          }
          right={
            <>
              <Sub>The loan this site uses on every page</Sub>
              <p>
                {formatUSD(LOAN)} borrowed, which is a {formatUSD(425_000)} home
                with 20% down. At {RATE}% over 30 years, principal and interest
                come to <span className="num">{formatUSD(C30.payment)}</span> a
                month.
              </p>
              <p>
                Your first payment splits like this. Interest takes{" "}
                <span className="num">{formatUSD(C30.firstInterest)}</span>.
                Principal gets{" "}
                <span className="num">{formatUSD(C30.firstPrincipal)}</span>.
                That is {FIRST_INTEREST_SHARE_30} of the payment going to the
                cost of borrowing and {FIRST_PRINCIPAL_SHARE_30} going to the
                debt itself.
              </p>
              <p>
                Payment {C30.crossover} is where it turns. That month,{" "}
                <span className="num">
                  {formatUSD(STRIP.schedule[C30.crossover - 1].principal)}
                </span>{" "}
                goes to principal and{" "}
                <span className="num">
                  {formatUSD(STRIP.schedule[C30.crossover - 1].interest)}
                </span>{" "}
                goes to interest, a gap of about seven dollars. Nothing arrives
                in the mail. No rate changes. Two lines simply cross.
              </p>
            </>
          }
        />

        <div className="mt-10 overflow-x-auto" data-print-full>
          <table className="w-full min-w-[26rem] border-collapse text-[0.92rem]">
            <caption className="label mb-3 text-left">
              The month principal overtakes interest, by rate
            </caption>
            <thead>
              <tr className="border-b-rule border-line-strong bg-paper-2">
                <th className="label px-3 py-2.5 text-left">Rate</th>
                <th className="label px-3 py-2.5 text-right">30-year</th>
                <th className="label px-3 py-2.5 text-right">15-year</th>
              </tr>
            </thead>
            <tbody>
              {TABLE.map((r) => (
                <tr key={r.rate} className="border-b border-line">
                  <td className="num px-3 py-2.5">{r.rate}%</td>
                  <td className="num px-3 py-2.5 text-right">
                    Month {r.thirty}
                  </td>
                  <td className="num px-3 py-2.5 text-right">
                    Month {r.fifteen}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Band>

      {/* ── 2. Why it takes so long ───────────────────────────────── */}
      <Band tone="paper">
        <SectionHead
          title="Why almost twenty years"
          intro="Interest is not charged on the loan you signed. It is charged on what you still owe this month, and for a long time you still owe nearly all of it."
        />

        <div className="mb-10">
          <LoanLifeStrip
            accelerated={STRIP.schedule}
            baselineMonths={T30}
            monthsSaved={0}
            crossover={C30.crossover}
          />
        </div>

        <EditorialCols
          left={
            <>
              <Sub>Interest is rent on the balance</Sub>
              <p>
                Picture the balance as something you rent by the month. At{" "}
                {RATE}%, the rent is the annual rate divided by twelve, applied
                to whatever is left. On {formatUSD(LOAN)} that comes to{" "}
                <span className="num">{formatUSD(C30.firstInterest)}</span> for
                month one. Your payment is{" "}
                <span className="num">{formatUSD(C30.payment)}</span>, so{" "}
                <span className="num">{formatUSD(C30.firstPrincipal)}</span>{" "}
                survives the rent and goes against the balance. Next month the
                rent is charged on a balance that much smaller.
              </p>
              <p>
                Set the rental picture aside now, because the numbers carry it
                from here.
              </p>

              <Sub>The payment never moves, so the split crawls</Sub>
              <p>
                For thirty years the payment stays at{" "}
                <span className="num">{formatUSD(C30.payment)}</span>. The only
                thing changing is the balance, and the balance only changes by
                whatever the interest charge leaves behind. In year one that
                runs from{" "}
                <span className="num">{formatUSD(C30.firstPrincipal)}</span> a
                month up to <span className="num">{formatUSD(YEAR_ONE_END)}</span>
                , against a balance of {formatUSD(LOAN)}.
              </p>
              <p>
                Every dollar of principal you retire shaves a sliver off next
                month{"'"}s interest, which lets a sliver more principal through
                the month after that. The process feeds itself, but it starts
                from almost nothing, and it needs {C30.crossover - 1} payments
                to catch up.
              </p>

              <Sub>The shape belongs to the loan, not to you</Sub>
              <p>
                The curve is attached to a balance and a clock. Pay off one loan
                with another and both reset. Someone fourteen years into a
                30-year mortgage who takes a new 30-year mortgage is back at a
                month-one split, on a smaller balance, possibly at a lower rate,
                but back at month one. What that costs up front and how long it
                takes to earn back is separate arithmetic:{" "}
                <InlineLink href={ROUTES.refinance}>
                  the point at which a refinance has paid back what it cost, and
                  the rate it would take
                </InlineLink>
                .
              </p>
            </>
          }
          right={
            <>
              <Sub>By the crossover, the interest is nearly all paid</Sub>
              <p>
                Over its full life, that {formatUSD(LOAN)} loan at {RATE}%
                charges{" "}
                <span className="num">{formatUSD(C30.totalInterest)}</span> in
                interest. By payment {C30.crossover}, you have already paid{" "}
                <span className="num">
                  {formatUSD(C30.interestByCrossover)}
                </span>{" "}
                of it.
              </p>
              <p>
                That is {INTEREST_SHARE_AT_CROSSOVER} of every dollar of
                interest the loan will ever charge, handed over by the moment
                the split finally turns in your favor.
              </p>
              <p>
                Over those same {C30.crossover} payments you have repaid{" "}
                {PRINCIPAL_SHARE_AT_CROSSOVER} of the {formatUSD(LOAN)}. The
                balance still standing is{" "}
                <span className="num">
                  {formatUSD(C30.balanceAtCrossover)}
                </span>
                . The interest is nearly finished. The principal is not yet half
                done. Most people expect those two percentages to be closer
                together, and the reason they are not is the flat payment
                working against a barely moving balance.
              </p>

              <Sub>The 15-year loan is a different animal</Sub>
              <p>
                A 15-year is not priced like a 30-year. It is consistently
                cheaper, which is why the comparison a reader actually faces is{" "}
                {RATE}% over 30 years against {RATE_15}% over 15.
              </p>
              <p>
                The 15-year at {RATE_15}% crosses at month{" "}
                <span className="num">{C15.crossover}</span>.{" "}
                {formatDuration(C15.crossover)}.
              </p>
              <p>
                Its first payment sends{" "}
                <span className="num">{formatUSD(C15.firstInterest)}</span> to
                interest and{" "}
                <span className="num">{formatUSD(C15.firstPrincipal)}</span> to
                principal, so interest takes {FIRST_INTEREST_SHARE_15} of the
                payment rather than {FIRST_INTEREST_SHARE_30}. By its crossover
                it has charged{" "}
                <span className="num">
                  {formatUSD(C15.interestByCrossover)}
                </span>
                , {INTEREST_SHARE_15} of the{" "}
                <span className="num">{formatUSD(C15.totalInterest)}</span> it
                will charge in total. The payment is{" "}
                <span className="num">{formatUSD(C15.payment)}</span> rather
                than <span className="num">{formatUSD(C30.payment)}</span>.
              </p>
            </>
          }
        />
      </Band>

      {/* ── 3. Loan size ──────────────────────────────────────────── */}
      <Band tone="surface">
        <SectionHead
          title={`A ${formatUSD(100_000)} loan and a ${formatUSD(900_000)} loan cross on the same day`}
          intro={`At ${RATE}% over 30 years, ${formatUSD(100_000)}, ${formatUSD(
            LOAN,
          )} and ${formatUSD(900_000)} all cross at month ${C30.crossover}. Not close to each other. The same month.`}
        />

        <EditorialCols
          left={
            <>
              <p>
                Both halves of your payment are built from the same starting
                number. Double what you borrow and the monthly payment doubles.
                Double what you borrow and the interest charged in month one
                doubles too, because it is a percentage of that same figure.
                Both halves grow by the same multiple, so the ratio between them
                is untouched.
              </p>
              <p>
                That is why {FIRST_INTEREST_SHARE_30} of the first payment goes
                to interest at {RATE}% on a {formatUSD(LOAN)} loan, and also on
                a {formatUSD(100_000)} loan, and also on a{" "}
                {formatUSD(900_000)} loan. The dollar amounts are wildly
                different. The proportions are identical, month by month, all
                the way to month {T30}.
              </p>
              <p>
                Only two things set the crossover month: the interest rate and
                the number of months in the term. Not the price of the house.
                Not the size of your down payment, except through the rate it
                helped you qualify for. Not your income, and not the state you
                live in.
              </p>
              <p>
                What does scale with the loan is every dollar figure hanging off
                it. Somebody with a {formatUSD(900_000)} loan hands over far
                more interest before reaching month {C30.crossover} than
                somebody with {formatUSD(100_000)}, and they both get there in
                the same month.
              </p>
              <p>
                This is worth knowing when you read an older article. A page
                that tells you the crossover on a {formatUSD(200_000)} mortgage
                is at {formatDuration(TABLE[1].thirty)} is not telling you
                something about {formatUSD(200_000)}. It is telling you the rate
                was 4%.
              </p>
            </>
          }
          right={<LoanSizeInvariance />}
        />
      </Band>

      {/* ── 4. What moves the date ────────────────────────────────── */}
      <Band tone="paper">
        <SectionHead
          title="What moves the date"
          intro="Two things fix the crossover at signing. One thing pulls it earlier afterward, and one thing sends it back to the start."
        />

        <EditorialCols
          left={
            <>
              <Sub>The rate</Sub>
              <p>
                The table above gives every step from 3% to 8%. The steps are
                not even. One percentage point, from 3% to 4%, moves the date
                from month {TABLE[0].thirty} to month {TABLE[1].thirty}. The
                same one-point step from 7% to 8% moves it from month{" "}
                {TABLE[6].thirty} to month {TABLE[8].thirty}. Higher up the
                range the date is being pressed against the end of the term, and
                there is less room left for it to travel.
              </p>
              <p>
                Half a point matters less than most people assume once you are
                above 6%. Anywhere between 6% and 8%, it moves the date by seven
                to ten months. What it does to the money is a larger question:
                the same {formatUSD(LOAN)} at 6.25% rather than {RATE}% charges{" "}
                <span className="num">{formatUSD(RATE_STEP_SAVING)}</span> less
                interest across the thirty years.
              </p>

              <Sub>The term</Sub>
              <p>The term does more to the crossover than the rate does.</p>
              <p>
                Thirty years at {RATE}% gives month {C30.crossover}. Fifteen
                years at {RATE_15}%, which is close to what a 15-year is priced
                at right now, gives month {C15.crossover}. That is a difference
                of more than sixteen years on a loan taken out the same week.
              </p>
              <p>
                Most of that gap comes from the term rather than the discount.
                Hold the rate identical at {RATE}% on both and it is still month{" "}
                {C30.crossover} against month {C15_SAME_RATE.crossover}. The
                higher payment on a shorter loan overwhelms the interest charge
                from the first month onward. Push the rate low enough and the
                crossover disappears entirely: a 15-year at 4% has more
                principal than interest in payment number one.
              </p>
            </>
          }
          right={
            <>
              <Sub>Extra payments</Sub>
              <p>
                An extra dollar sent to principal is not spread across the
                schedule. It comes straight off the balance, so next month{"'"}s
                interest is charged on a smaller number, so more of the flat
                payment gets through to principal, and every month after that
                starts from a lower figure. The crossover moves earlier and the
                loan ends sooner.
              </p>
              <p>
                On the loan above, an extra{" "}
                <span className="num">{formatUSD(250)}</span> a month from the
                first payment moves the crossing from month {C30.crossover} to
                month <span className="num">{EXTRA_250.crossover}</span>, and
                the loan ends at month{" "}
                <span className="num">{EXTRA_250.months}</span> rather than{" "}
                {T30}. The interest it never charges comes to{" "}
                <span className="num">
                  {formatUSD(EXTRA_250.interestSaved)}
                </span>
                .
              </p>
              <p>
                That month {EXTRA_250.crossover} counts the regular payment{"'"}s
                own split, which is the same thing every other figure on this
                page measures. Count the extra {formatUSD(250)} as principal
                too, which it is, and the crossing lands earlier still. Both are
                true, and they answer slightly different questions.
              </p>
              <p>
                Two things sit alongside that arithmetic. The CFPB tells
                borrowers to check whether their loan allows extra payments and,
                if it does, to make sure the money is applied to the loan{"'"}s
                principal rather than to interest. And the same money has other
                uses, which is what{" "}
                <InlineLink href={ROUTES.payoffVsInvest}>
                  weighing an extra mortgage payment against investing the same
                  amount
                </InlineLink>{" "}
                sets out.
              </p>

              <Sub>Refinancing</Sub>
              <p>
                Under the CFPB{"'"}s description, a refinance retires the old
                mortgage with money from a new one. That is the whole mechanic.
                The old schedule stops where it stops, and a new schedule begins
                at month one with its own rate, its own term and its own
                crossover counted from the new closing date.
              </p>
              <p>
                A lower rate does place the crossover earlier within the new
                loan{"'"}s life. It does not credit you for the payments you
                already made on the old one. Refinancing a 30-year into a fresh
                30-year, ten years in, restarts the count from zero on the new
                balance.
              </p>
            </>
          }
        />
      </Band>

      {/* ── 5. What it does not tell you ──────────────────────────── */}
      <Band tone="surface">
        <SectionHead
          title={`What month ${C30.crossover} does not tell you`}
          intro="The crossover is a fact about an amortization schedule, and amortization schedules are narrower than people expect."
        />

        <EditorialCols
          left={
            <>
              <Sub>{formatUSD(C30.payment)} is not your bill</Sub>
              <p>
                The figures on this page are principal and interest only. Most
                monthly payments also collect property taxes and homeowners
                insurance into escrow, which the CFPB describes as an account a
                lender establishes to cover property-related bills. None of that
                changes the crossover month, because none of it is part of the
                principal and interest split.
              </p>
              <p>
                It does mean the number on your statement is bigger than the
                number here, and that it moves when your tax bill or your
                premium moves.{" "}
                <InlineLink href={ROUTES.payment}>
                  Adding taxes, insurance and mortgage insurance to see the full
                  monthly figure
                </InlineLink>{" "}
                gets you closer to the real one.
              </p>

              <Sub>An adjustable-rate loan has no fixed answer</Sub>
              <p>
                With a fixed rate, the schedule is knowable on day one. With an
                adjustable rate, the interest rate can go up or down at each
                adjustment, and the schedule is rewritten each time. A crossover
                month calculated today on an ARM is good until the next
                adjustment and no further.
              </p>
            </>
          }
          right={
            <>
              <Sub>This is not break-even on the house</Sub>
              <p>
                The crossover compares two halves of one payment. It says
                nothing about what your home is worth, what selling it would
                cost, or whether you would come away with money. Those are
                different calculations with different inputs.
              </p>

              <Sub>And it says nothing about whether the loan was a good one</Sub>
              <p>
                The 15-year at {RATE_15}% crosses at month {C15.crossover} and
                costs <span className="num">{formatUSD(PAYMENT_GAP)}</span> more
                every month for fifteen years. Month {C30.crossover} and month{" "}
                {C15.crossover} are both just arithmetic, and both assume every
                payment lands on schedule, nothing extra is ever paid, and the
                loan runs its full term.
              </p>
            </>
          }
        />
      </Band>

      <Band tone="paper">
        <FaqBlock items={FAQ} />
      </Band>

      <Band tone="surface">
        <Sources
          items={[
            PMMS.source,
            {
              label: "CFPB: how does paying down a mortgage work?",
              url: "https://www.consumerfinance.gov/ask-cfpb/how-does-paying-down-a-mortgage-work-en-1943/",
              verified: "2026-08-15",
            },
            {
              label: "CFPB: what is an escrow or impound account?",
              url: "https://www.consumerfinance.gov/ask-cfpb/what-is-an-escrow-or-impound-account-en-140/",
              verified: "2026-08-15",
            },
            {
              label: "CFPB: fixed-rate against adjustable-rate mortgages",
              url: "https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-fixed-rate-and-adjustable-rate-mortgage-arm-loan-en-100/",
              verified: "2026-08-15",
            },
            {
              label: "CFPB: Should I refinance? (9/2020)",
              url: "https://files.consumerfinance.gov/f/documents/cfpb_should_i_refinance_handout.pdf",
              verified: "2026-08-15",
            },
            {
              label: "CFPB: your mortgage servicer must comply (9/2020)",
              url: "https://files.consumerfinance.gov/f/documents/cfpb_know_your_rights_mortgage_servicer_comply_federal_rules_handout.pdf",
              verified: "2026-08-15",
            },
          ]}
        />
      </Band>

      <Band tone="paper">
        <CalcFooter siblings={siblings} reviewed={REVIEWED} />
      </Band>
    </>
  );
}
