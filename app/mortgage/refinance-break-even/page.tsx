import type { Metadata } from "next";
import {
  LAST_REVIEWED,
  SITE,
  REFI_COST_PLACEHOLDER,
  REFI_SOURCES,
  PREPAYMENT_PENALTY,
  PREPAYMENT_SOURCE,
} from "@/lib/constants";
import RefinanceCalculator from "@/components/RefinanceCalculator";
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
import { REFINANCE_PATH, ROUTE_REVIEWED, relatedRoutes } from "@/lib/routes";
import { formatUSD, formatDuration, refinance, breakEvenRate } from "@/lib/mortgage";

export const metadata: Metadata = {
  title: "Refinance Break-Even Calculator",
  description:
    "Work out when refinancing your mortgage pays back what it cost, and the rate it would have to reach to be worth it before you move. Independent, no lender links, no quote forms.",
  alternates: { canonical: REFINANCE_PATH },
};

const REVIEWED = ROUTE_REVIEWED.refinance ?? LAST_REVIEWED;

// ─────────────────────────────────────────────────────────────────────────────
// The worked example, computed at build time.
//
// Project brief §10: worked examples are computed, not typed, so the prose
// cannot drift from the tool. Every figure below comes out of lib/mortgage.ts
// during the build.
//
// It keeps the site's recurring $340,000 loan, at a rate a refinance premise
// requires: nobody refinances out of 6.75% into 6.50%. A reader who bought at
// 7.50% and has 27 years left is the case this page is for.
//
// Independently recomputed in Node on August 14, 2026 against a separate
// implementation written from the algebra rather than by importing this one:
// 5,000 randomized scenarios, zero differences. The payment figures also match
// a third-party tool's published worked example to the cent.
// ─────────────────────────────────────────────────────────────────────────────

const EX_INPUTS = {
  balance: 340_000,
  oldRatePct: 7.5,
  oldMonthsLeft: 27 * 12,
  newRatePct: 6.5,
  newTermMonths: 27 * 12,
  closingCosts: REFI_COST_PLACEHOLDER,
  financeCosts: false,
};

const EX = refinance(EX_INPUTS)!;
const EX_FRESH30 = refinance({ ...EX_INPUTS, newTermMonths: 360 })!;
const EX_RATE_5YR = breakEvenRate(EX_INPUTS, 60);

/** A loan much further along, where the reset effect bites hardest. */
const LATE = refinance({
  balance: 250_000,
  oldRatePct: 7.5,
  oldMonthsLeft: 20 * 12,
  newRatePct: 5.5,
  newTermMonths: 360,
  closingCosts: REFI_COST_PLACEHOLDER,
  financeCosts: false,
})!;

const FAQ: Faq[] = [
  {
    q: "How do I calculate the break-even point on a refinance?",
    a: `Add up what the refinance costs you, then find the month where the interest you have saved finally exceeds it. On the example loan, ${formatUSD(EX_INPUTS.balance)} at ${EX_INPUTS.oldRatePct}% with 27 years left, refinancing to ${EX_INPUTS.newRatePct}% for ${formatUSD(REFI_COST_PLACEHOLDER)}, that happens in month ${EX.breakEvenMonth}. The shortcut most calculators use, closing costs divided by the monthly saving, gives ${EX.naiveBreakEvenMonth} months for the same loan, because it ignores that the two loans pay down what you owe at different speeds.`,
  },
  {
    q: "What is the 1% rule for refinancing?",
    a: "It is the idea that refinancing is worth it once rates fall about one percentage point below yours. Other versions say two points, and some say a quarter of a point can be enough. They disagree because the answer depends on your balance, how long you have left, what the refinance costs, and how long you are staying, none of which a single number can capture. The calculator above works out the actual rate for your loan instead.",
  },
  {
    q: "How much does it cost to refinance a mortgage?",
    a: `There is no reliable national figure, and the widely quoted "2% to 5% of the loan" is a home purchase number. A refinance has no seller, no agent commission, and normally no owner's title insurance policy, so it usually costs less. The only figure worth using is the one on your own Loan Estimate, which the lender must give you within three business days of your application. The ${formatUSD(REFI_COST_PLACEHOLDER)} in the calculator is a round placeholder to make the tool work on arrival, not an average.`,
  },
  {
    q: "Can refinancing to a lower rate cost me more money?",
    a: `Yes, and it is common. Refinancing resets the clock: a loan with 27 years left, refinanced into a fresh 30-year term, is being stretched by three years. On the example loan, dropping from ${EX_INPUTS.oldRatePct}% to ${EX_INPUTS.newRatePct}% over a fresh 30 years still breaks even in month ${EX_FRESH30.breakEvenMonth}, but it is a different question from what you pay in total. On a loan with only 20 years left, refinancing from 7.5% to 5.5% over a fresh 30 years costs ${formatUSD(LATE.lifetimeInterestChange)} more interest overall, even though the payment falls by ${formatUSD(LATE.monthlyChange)} a month.`,
  },
  {
    q: "Should I roll the closing costs into the new loan?",
    a: "You can, and the calculator has a setting for it. Adding the costs to the balance means no cash at closing, but you then borrow more and pay interest on the costs for the life of the loan, so the break-even arrives later. Which is better depends on whether the cash is worth more to you now than the interest costs later, and that is your call rather than a calculation.",
  },
  {
    q: "How long do I have to stay in my home for a refinance to be worth it?",
    a: `At least until the break-even month, and preferably well past it, because everything after that month is the actual gain. Enter how long you expect to stay and the calculator works backwards to the rate that would make it pay off in that time. On the example loan, staying five years, a rate at or below ${EX_RATE_5YR!.toFixed(2)}% does it.`,
  },
  {
    q: "Do discount points lower my rate by a fixed amount?",
    a: "No. One discount point costs 1% of the loan amount, but the CFPB is explicit that points have no fixed value in terms of how much they move the rate. Two lenders can charge the same point and offer different rates. That is why this calculator asks for the rate you have actually been quoted rather than working it out from points.",
  },
  {
    q: "Are refinance closing costs tax deductible?",
    a: "Mostly not. The IRS says charges such as appraisal fees and processing fees generally are not deductible. Points are treated differently: points paid to refinance normally cannot be deducted in full in the year you pay them, and instead are spread by dividing them across the number of scheduled payments on the loan. If you later pay that loan off or refinance with a different lender, the points you have not yet deducted can be taken in that year. This calculator ignores tax entirely, which understates the benefit slightly for anyone itemizing and paying points.",
  },
  {
    q: "Will my current lender charge me for paying off my loan early?",
    a: `Usually not, and federal limits are tight where one exists. Regulation Z permits a prepayment penalty only on certain fixed-rate qualified mortgages, caps it at ${PREPAYMENT_PENALTY.maxPctFirstTwoYears}% of the amount prepaid during the first two years and ${PREPAYMENT_PENALTY.maxPctThirdYear}% in the third, and bars it entirely after ${PREPAYMENT_PENALTY.maxYears} years. Check your note before you assume, because a penalty is a closing cost in everything but name and belongs in the box above.`,
  },
  {
    q: "Does this calculator include taxes, insurance, or mortgage insurance?",
    a: "No. It compares principal and interest only. Property taxes and homeowners insurance do not change because you refinanced, so leaving them out does not affect the comparison. Mortgage insurance is different: if refinancing drops it, or adds it, that changes your real monthly figure and this tool will not show it.",
  },
  {
    q: "Do you get paid if I refinance?",
    a: "No. No lender, broker, or comparison site pays this site anything. There are no quote buttons, no rate tables, and no lead forms anywhere on this site, which is why this page is free to tell you when refinancing is not worth doing.",
  },
];

const appSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Refinance Break-Even Calculator",
  url: `${SITE.url}${REFINANCE_PATH}`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
};

const SIBLINGS = relatedRoutes("refinance");

export default function RefinanceBreakEvenPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(FAQ)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(calcBreadcrumbSchema("refinance")),
        }}
      />

      <CalcStripe
        route="refinance"
        title="When does refinancing pay for itself?"
        lede="Refinancing costs money up front and saves it slowly. This works out the month you get back what you paid, and the rate a refinance would have to reach to be worth doing before you move."
        asideTitle="What this does"
        asidePoints={[
          "Updates as you type, nothing to submit",
          "Works out the rate you would need, not just the date",
          "Shows total interest as well as the monthly saving",
          "No lender pays us and there is no quote form",
        ]}
      >
        <RefinanceCalculator />
      </CalcStripe>

      {/* ── What break-even actually means ──────────────────────────── */}
      <Band tone="paper">
        <SectionHead
          title="What breaking even actually means"
          intro="Refinancing is a trade: you pay a known amount now to lower an unknown number of future payments. Break-even is the month the trade turns in your favor."
        />
        <EditorialCols
          left={
            <>
              <p>
                When you refinance, you pay closing costs, meaning the upfront
                fees a lender charges to set up the new loan. In exchange, your
                new loan charges less interest each month than the old one did.
              </p>
              <p>
                From the day you close, you are behind by whatever you paid.
                Every month afterwards you claw a little of it back. Break-even
                is the month you finish clawing.
              </p>
              <Sub>The example on this page</Sub>
              <p>
                A balance of {formatUSD(EX_INPUTS.balance)} at{" "}
                {EX_INPUTS.oldRatePct}% with 27 years left, refinanced to{" "}
                {EX_INPUTS.newRatePct}% over the same 27 years, costing{" "}
                {formatUSD(REFI_COST_PLACEHOLDER)} at closing.
              </p>
              <p>
                The payment falls from {formatUSD(EX.oldPayment)} to{" "}
                {formatUSD(EX.newPayment)}, a drop of{" "}
                {formatUSD(EX.monthlyChange)} a month. You break even in month{" "}
                {EX.breakEvenMonth}, which is{" "}
                {formatDuration(EX.breakEvenMonth!)} after closing.
              </p>
            </>
          }
          right={
            <>
              <Sub>Why we do not divide costs by the monthly saving</Sub>
              <p>
                Nearly every refinance calculator works out break-even by
                dividing what you paid by how much your payment fell. The CFPB
                describes that as a rough estimate, and it is.
              </p>
              <p>
                On the example loan the shortcut gives{" "}
                {EX.naiveBreakEvenMonth} months. The real answer is{" "}
                {EX.breakEvenMonth}. The gap opens because the shortcut only
                looks at the payment, and a payment is not the same thing as a
                cost. Part of every payment goes to what you owe, and you keep
                that part.
              </p>
              <p>
                This page compares the interest instead: the month your
                interest saved passes what the refinance cost. It gives the
                same answer in the simple cases and the right answer in the
                rest, including when you shorten the term and your payment goes
                up.
              </p>
            </>
          }
        />
      </Band>

      {/* ── The rate you would need ─────────────────────────────────── */}
      <Band tone="surface">
        <SectionHead
          title="The question behind the question"
          intro="Most people reading about refinancing have not been quoted a rate yet. They want to know how far rates have to fall before it is worth picking up the phone."
        />
        <EditorialCols
          left={
            <>
              <p>
                Every calculator we could find answers the same question: given
                a rate you already have in hand, when do you break even. That
                is useful once you have applied. Before that, it is the wrong
                way round.
              </p>
              <p>
                So this one runs it backwards. Tell it how long you expect to
                stay in the home, and it works out the rate a refinance would
                have to reach to pay for itself in that time.
              </p>
              <p>
                On the example loan, staying five more years, any rate at or
                below {EX_RATE_5YR!.toFixed(2)}% pays for itself before you go.
                That is a number you can watch for, rather than a rule of thumb
                you have to trust.
              </p>
            </>
          }
          right={
            <>
              <Sub>Why the rules of thumb disagree with each other</Sub>
              <p>
                You will see the 1% rule, the 2% rule, and advice that a
                quarter of a point can be enough. They are all in circulation
                at once, which is the clearest possible sign that none of them
                is the answer.
              </p>
              <p>
                They conflict because the real threshold moves with your
                balance, your remaining term, what the refinance costs, and how
                long you stay. A big balance early in its life clears its costs
                on a small rate drop. A small balance most of the way through
                may not clear them on a large one.
              </p>
              <p>
                A rule of thumb has to pick one answer for all of those. Your
                loan does not have to.
              </p>
            </>
          }
        />
      </Band>

      {/* ── Before you act ──────────────────────────────────────────── */}
      <Band tone="paper">
        <SectionHead
          title="Before you act"
          intro="Three things that change the answer, and one that changes it more than people expect."
        />
        <EditorialCols
          left={
            <>
              <Sub>Refinancing restarts the clock</Sub>
              <p>
                A new 30-year loan is 30 years from today, not 30 years from
                when you bought. Stretching what is left of your loan back out
                to a full term lowers the payment, and can still leave you
                paying more interest in total.
              </p>
              <p>
                On a {formatUSD(250_000)} balance at 7.5% with 20 years left,
                refinancing all the way down to 5.5% over a fresh 30 years cuts
                the payment by {formatUSD(LATE.monthlyChange)} a month and
                still costs {formatUSD(LATE.lifetimeInterestChange)} more
                interest over the full run.
              </p>
              <p>
                That is not a reason to avoid refinancing. It is a reason to
                look at the term as well as the rate. The Match setting in the
                calculator keeps your current finish date, which separates the
                saving from the stretching.
              </p>
            </>
          }
          right={
            <>
              <Sub>Use your Loan Estimate, not a percentage</Sub>
              <p>
                The figure in the closing costs box is a placeholder. Once you
                apply, the lender must give you a Loan Estimate, a standard
                form listing what the loan will actually cost you. Put that
                total in the box.
              </p>
              <Sub>Check your note for a prepayment penalty</Sub>
              <p>
                Paying off the old loan early can carry a charge, though the
                rules are narrow. Where one applies at all, it is capped at{" "}
                {PREPAYMENT_PENALTY.maxPctFirstTwoYears}% of the amount you pay
                off in the first two years,{" "}
                {PREPAYMENT_PENALTY.maxPctThirdYear}% in the third, and nothing
                after {PREPAYMENT_PENALTY.maxYears} years. If you have one, add
                it to the closing costs.
              </p>
              <Sub>Shop the same week</Sub>
              <p>
                Rates move weekly, so quotes gathered a month apart are not
                comparable. Freddie Mac publishes a national survey average
                every Thursday, which is a useful check on whether a quote is
                in the normal range. It is a survey of purchase applications,
                not an offer, and refinance rates differ from it.
              </p>
            </>
          }
        />
      </Band>

      {/* ── What this leaves out ────────────────────────────────────── */}
      <Band tone="surface">
        <SectionHead
          title="What this calculator leaves out"
          intro="Every assumption that could move the answer, and which direction it moves it."
        />
        <EditorialCols
          left={
            <>
              <p>
                It compares principal and interest only. Property taxes and
                homeowners insurance are the same whether or not you refinance,
                so leaving them out does not tilt the comparison.
              </p>
              <p>
                It assumes you have been paying your current loan as scheduled,
                that interest is charged monthly, and that each payment lands
                at the end of its month. It does not model a rate that can
                change, so it will not describe an adjustable-rate loan on
                either side.
              </p>
              <p>
                It does not handle cash-out refinancing, where you borrow more
                than you owe and take the difference. That is a different
                decision with a different arithmetic.
              </p>
            </>
          }
          right={
            <>
              <Sub>Where the answer is slightly off, and which way</Sub>
              <p>
                Tax is ignored. For anyone who itemizes and pays points, that
                understates the benefit a little, because points on a refinance
                are deductible spread across the loan's scheduled payments.
                Most other closing costs are not deductible at all.
              </p>
              <p>
                Mortgage insurance is ignored. If refinancing removes it
                because you now owe less than 80% of what the home is worth,
                the real saving is larger than shown. If refinancing adds it,
                the real saving is smaller.
              </p>
              <p>
                A prepayment penalty on your current loan, if you have one, is
                not included unless you add it to the closing costs. Left out,
                it makes refinancing look better than it is.
              </p>
            </>
          }
        />
      </Band>

      <Band tone="paper">
        <SectionHead
          title="Questions people ask"
          intro="The ones that come up most, answered with figures from the calculator above."
        />
        <FaqBlock items={FAQ} />
      </Band>

      <Band tone="surface">
        <Sources
          items={[
            REFI_SOURCES.pointsBreakEven,
            REFI_SOURCES.pointsNoFixedValue,
            REFI_SOURCES.irsPoints,
            REFI_SOURCES.irsPointsFaq,
            PREPAYMENT_SOURCE,
            REFI_SOURCES.pmms,
          ]}
        />
      </Band>

      <Band tone="paper">
        <CalcFooter siblings={SIBLINGS} reviewed={REVIEWED} />
      </Band>
    </main>
  );
}
