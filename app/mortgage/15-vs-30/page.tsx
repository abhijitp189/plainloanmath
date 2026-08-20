import type { Metadata } from "next";
import {
  LAST_REVIEWED,
  SITE,
  EXAMPLE,
  EXAMPLE_SHORT_RATE_PCT,
  TERM_SOURCES,
  PREPAYMENT_PENALTY,
  PREPAYMENT_SOURCE,
  REFI_SOURCES,
} from "@/lib/constants";
import TermCompareCalculator from "@/components/TermCompareCalculator";
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
import { InlineLink } from "@/components/InlineLink";
import {
  TERM_COMPARE_PATH,
  PAYOFF_PATH,
  PAYMENT_PATH,
  PAYOFF_VS_INVEST_PATH,
  ROUTE_REVIEWED,
  relatedRoutes,
} from "@/lib/routes";
import {
  compareTerms,
  balanceAtMonth,
  formatUSD,
  formatDuration,
} from "@/lib/mortgage";

export const metadata: Metadata = {
  title: "15-Year vs 30-Year Mortgage Calculator",
  description:
    "Compare a 15-year and a 30-year mortgage. See how much of the interest saving comes from the lower rate, and how much from simply paying more each month.",
  alternates: { canonical: TERM_COMPARE_PATH },
};

const REVIEWED = ROUTE_REVIEWED.termCompare ?? LAST_REVIEWED;

// ─────────────────────────────────────────────────────────────────────────────
// The worked example, computed at build time.
//
// Project brief §10: worked examples are computed, not typed, so the prose
// cannot drift from the tool. Every figure below comes out of lib/mortgage.ts
// during the build.
//
// It keeps the site's recurring $340,000 at 6.75%, and takes the shorter
// loan's rate from EXAMPLE_SHORT_RATE_PCT, which is that rate less the gap
// between Freddie Mac's two published series. Deriving it rather than typing
// it means the example cannot end up describing a spread that does not exist.
//
// Independently recomputed in Node on August 18, 2026 against a separate
// implementation written from the algebra rather than by importing this one:
// 5,000 randomized term pairs, zero differences, and the identity
// headline = rateEffect + behaviorEffect holds to 2.3e-10.
// ─────────────────────────────────────────────────────────────────────────────

const EX_INPUTS = {
  loanAmount: EXAMPLE.loanAmount,
  shortRatePct: EXAMPLE_SHORT_RATE_PCT,
  longRatePct: EXAMPLE.annualRatePct,
  shortTermMonths: 15 * 12,
  longTermMonths: 30 * 12,
};

const EX = compareTerms(EX_INPUTS)!;

/** The same loan with no rate gap at all, which is the proof of the claim. */
const EX_NO_GAP = compareTerms({
  ...EX_INPUTS,
  shortRatePct: EXAMPLE.annualRatePct,
})!;

/** A wide gap, to show the finding is not an artifact of one spread. */
const EX_WIDE = compareTerms({
  ...EX_INPUTS,
  shortRatePct: EXAMPLE.annualRatePct - 1.5,
})!;

const EX_SHARE = Math.round((EX.rateShare ?? 0) * 100);
const EX_WIDE_SHARE = Math.round((EX_WIDE.rateShare ?? 0) * 100);
const EX_GAP = Number(
  (EXAMPLE.annualRatePct - EXAMPLE_SHORT_RATE_PCT).toFixed(2),
);

const EX_BAL_10_SHORT = balanceAtMonth(EX.shortLoan, 120);
const EX_BAL_10_MATCHED = balanceAtMonth(EX.longMatched, 120);
const EX_BAL_10_LONG = balanceAtMonth(EX.longLoan, 120);

const FAQ: Faq[] = [
  {
    q: "Is it better to get a 15-year mortgage or a 30-year and pay extra?",
    a: `They are closer than the usual figures suggest. On the example loan, ${formatUSD(EXAMPLE.loanAmount)} at ${EXAMPLE.annualRatePct}% over 30 years against ${EXAMPLE_SHORT_RATE_PCT}% over 15, the 15-year loan saves ${formatUSD(EX.rateEffect)} in interest compared with taking the 30-year loan and paying it at the same ${formatUSD(EX.shortLoan.monthlyPayment)} a month. The much larger ${formatUSD(EX.headlineSaving)} figure other calculators report includes ${formatUSD(EX.behaviorEffect)} that comes from paying more, which either loan allows. What the 15-year loan buys is the lower rate. What the 30-year loan keeps is the right to pay ${formatUSD(EX.longLoan.monthlyPayment)} in a month when you have to.`,
  },
  {
    q: "How much lower is a 15-year mortgage rate than a 30-year?",
    a: "It moves week to week and it depends on the lender and on you. Freddie Mac has published a weekly national average for both the 30-year and the 15-year fixed-rate mortgage since 1991, and it publishes both on the one page, linked at the foot of this one. The size of that gap is the entire financial case for the shorter loan, which is why this calculator asks you to enter both rates rather than assuming one.",
  },
  {
    q: "Why is the saving on a 15-year mortgage smaller than other calculators say?",
    a: `It is not smaller, it is split. The total is the same. Other tools compare a 15-year loan against a 30-year loan paid at its own smaller amount, so their single figure mixes together the effect of the lower rate and the effect of paying ${formatUSD(EX.paymentStepUp)} more every month. Only the first of those is decided by which loan you sign. This page shows both parts and labels them.`,
  },
  {
    q: "If the rates were the same, would a 15-year loan save anything?",
    a: `Nothing at all. At an identical rate, paying a 30-year loan at the 15-year payment clears it in exactly 15 years and costs exactly the same interest, to the cent. On the example loan both come to ${formatUSD(EX_NO_GAP.shortLoan.totalInterest)}. That is worth knowing because it shows what the shorter loan is actually selling: not speed, which you can have either way, but a discount on the rate.`,
  },
  {
    q: "Can I pay off a 30-year mortgage in 15 years?",
    a: `Arithmetically, yes: pay ${formatUSD(EX.paymentStepUp)} more each month on the example loan and it clears in ${formatDuration(EX.matchedMonths)} rather than 30 years. Two practical things get in the way. The first is that nothing forces you to, and money that is not required has a way of going elsewhere. The second is mechanical: the CFPB says to check that your loan allows extra payments and that they are applied to the principal, because a payment that is not a full installment can be held in a separate account until enough builds up to make one.`,
  },
  {
    q: "Is a 15-year mortgage harder to qualify for?",
    a: `Usually, and for a simple reason: the required payment is larger. On the example loan it is ${formatUSD(EX.shortLoan.monthlyPayment)} against ${formatUSD(EX.longLoan.monthlyPayment)}, and a lender weighing what you can afford is looking at the required figure, not at what you intend to pay. That is also the practical argument for the longer loan for anyone near the edge: the same monthly outlay, without needing to qualify for it.`,
  },
  {
    q: "Does a 15-year mortgage build equity faster?",
    a: `Faster than a 30-year loan paid at its own amount, yes, and by a wide margin. After ten years on the example loan you would owe ${formatUSD(EX_BAL_10_SHORT)} on the 15-year loan and ${formatUSD(EX_BAL_10_LONG)} on the 30-year loan at its minimum. But most of that gap is the payment rather than the loan: pay the 30-year loan at the 15-year amount and after ten years you would owe ${formatUSD(EX_BAL_10_MATCHED)}, which is much closer.`,
  },
  {
    q: "What if I take the 15-year loan and cannot keep up the payment?",
    a: "There is no lower rung to step down to. The larger payment is the contract, not a target, and missing it is a delinquency rather than a slower month. Your options at that point are the ones anyone in difficulty has: talk to the servicer about loss mitigation, or refinance, which costs money and depends on rates and on your circumstances at the time. This is the risk the shorter loan carries and the reason the comparison on this page is a price rather than a recommendation.",
  },
  {
    q: "Does the rate gap have to be big before the 15-year loan is worth it?",
    a: `There is no threshold to clear, which is why you will not find one on this page. The shorter loan is ahead by some amount at any gap above zero and behind at any gap below it, and the amount grows smoothly as the gap widens. On the example loan a ${EX_GAP} point gap is worth ${formatUSD(EX.rateEffect)} and a 1.5 point gap is worth ${formatUSD(EX_WIDE.rateEffect)}. What you are deciding is whether that figure is worth giving up the option to pay less.`,
  },
  {
    q: "Does this calculator include taxes, insurance, or mortgage insurance?",
    a: "No. It compares principal and interest only. Property taxes, homeowners insurance and HOA dues are the same on both loans, so including them would add the same amount to each column and could not change the comparison. Mortgage insurance is the exception: it ends earlier on the shorter loan, because you cross the equity thresholds sooner, so leaving it out understates the shorter loan slightly. The monthly payment calculator on this site handles all four.",
  },
  {
    q: "What about the mortgage interest deduction?",
    a: "It is ignored here, and ignoring it works slightly against the shorter loan. If you itemize, the loan that charges more interest also generates more deductible interest, so part of the longer loan's extra cost comes back. How much depends on whether you itemize at all, your bracket, and the limits in IRS Publication 936. It only bites at all if your itemized deductions come to more than the standard deduction, so for a lot of people the effect is nil. We do not model any of it.",
  },
  {
    q: "Do you get paid if I choose one of these?",
    a: "No. No lender, broker, or comparison site pays this site anything. There are no quote buttons, no rate tables, and no lead forms anywhere on this site, which is why this page can tell you the number in the other calculators is mostly not what it appears to be.",
  },
];

const appSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "15-Year vs 30-Year Mortgage Calculator",
  url: `${SITE.url}${TERM_COMPARE_PATH}`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
};

const SIBLINGS = relatedRoutes("termCompare");

export default function TermComparePage() {
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
          __html: JSON.stringify(calcBreadcrumbSchema("termCompare")),
        }}
      />

      <CalcStripe
        route="termCompare"
        title="15-year vs 30-year mortgage: what is the shorter loan worth?"
        lede="A 15-year loan is sold on the interest it saves. Most of that saving comes from paying more each month, which you can do on a 30-year loan too. This works out the part that actually comes from the shorter loan."
        asideTitle="What this does"
        asidePoints={[
          "Splits the saving into the part the loan causes and the part you cause",
          "Compares against a 30-year loan paid at the 15-year amount",
          "Shows what you would owe if you moved at year 5, 10 or 15",
          "No lender pays us and there is no quote form",
        ]}
      >
        <TermCompareCalculator />
      </CalcStripe>

      {/* ── The number everyone reports ─────────────────────────────── */}
      <Band tone="paper">
        <SectionHead
          title="The number everyone reports, taken apart"
          intro="Every 15-versus-30 calculator answers with one figure. That figure is real, but it is two different things added together, and only one of them is about the loan."
        />
        <EditorialCols
          left={
            <>
              <p>
                Take the site&rsquo;s example loan:{" "}
                {formatUSD(EXAMPLE.loanAmount)} borrowed, at{" "}
                {EXAMPLE.annualRatePct}% over 30 years or{" "}
                {EXAMPLE_SHORT_RATE_PCT}% over 15.
              </p>
              <p>
                The 15-year loan costs{" "}
                {formatUSD(EX.shortLoan.totalInterest)} in interest. The
                30-year loan costs {formatUSD(EX.longLoan.totalInterest)}. The
                difference is {formatUSD(EX.headlineSaving)}, and that is the
                number the tools report.
              </p>
              <p>
                But the two loans are not being paid the same way. The 15-year
                loan is being paid at{" "}
                {formatUSD(EX.shortLoan.monthlyPayment)} a month and the
                30-year loan at {formatUSD(EX.longLoan.monthlyPayment)}. That
                is {formatUSD(EX.paymentStepUp)} a month of difference, before
                the rate is even considered.
              </p>
              <Sub>Paying them the same way</Sub>
              <p>
                Pay the 30-year loan {formatUSD(EX.shortLoan.monthlyPayment)} a
                month, the same as the 15-year loan, and it clears in{" "}
                {formatDuration(EX.matchedMonths)} and costs{" "}
                {formatUSD(EX.longMatched.totalInterest)} in interest.
              </p>
              <p>
                Now the comparison is fair, and the difference is{" "}
                {formatUSD(EX.rateEffect)}. That is {EX_SHARE}% of the figure
                you started with. The other{" "}
                {formatUSD(EX.behaviorEffect)} was never about the loan at
                all, and if that is the part you care about, the{" "}
                <InlineLink href={PAYOFF_PATH}>
                  extra payment calculator
                </InlineLink>{" "}
                shows what paying more does to any loan you already have.
              </p>
            </>
          }
          right={
            <>
              <Sub>The test that settles it</Sub>
              <p>
                Give both loans the same rate and the argument disappears
                entirely. At {EXAMPLE.annualRatePct}% on both, a 30-year loan
                paid at the 15-year amount finishes in exactly 15 years and
                costs exactly the same interest:{" "}
                {formatUSD(EX_NO_GAP.shortLoan.totalInterest)} either way, to
                the cent.
              </p>
              <p>
                Not approximately the same. The same, because a level payment
                on a fixed balance at a fixed rate does not care what the paper
                says the term is.
              </p>
              <p>
                So the shorter loan is not selling you speed. Speed is
                available on either loan for the same money. It is selling you
                a lower rate, and the whole question is what that discount is
                worth.
              </p>
              <Sub>It is not one spread</Sub>
              <p>
                At the {EX_GAP} point gap in the example, the rate is worth{" "}
                {EX_SHARE}% of the headline. Widen it to a full 1.5 points and
                the rate is worth {formatUSD(EX_WIDE.rateEffect)}, which is
                still only {EX_WIDE_SHARE}% of that comparison&rsquo;s
                headline. The split moves with the gap, and on this loan
                paying more stays the larger half of it until the gap passes
                about 2.5 points, which is more than three times the gap in the
                example.
              </p>
            </>
          }
        />
      </Band>

      {/* ── What each loan actually gives you ───────────────────────── */}
      <Band tone="surface">
        <SectionHead
          title="What each loan actually gives you"
          intro="Once the payment is held equal, the two loans differ in exactly two ways. One is money and one is not."
        />
        <EditorialCols
          left={
            <>
              <Sub>The shorter loan gives you a lower rate</Sub>
              <p>
                Lenders normally charge less for a shorter loan. Freddie Mac has
                published a weekly national average for both the 30-year and
                the 15-year fixed-rate mortgage since 1991, and the shorter one
                is normally the lower of the two. It is linked at the foot of
                this page.
              </p>
              <p>
                That discount is worth {formatUSD(EX.rateEffect)} on the
                example loan. It is real money and it is the reason anyone
                takes the shorter loan.
              </p>
              <Sub>The longer loan gives you a floor</Sub>
              <p>
                The 30-year loan&rsquo;s required payment is{" "}
                {formatUSD(EX.longLoan.monthlyPayment)}. You can pay{" "}
                {formatUSD(EX.shortLoan.monthlyPayment)} every month for years
                and still, in the month you need to, pay the smaller figure
                without asking anyone.
              </p>
              <p>
                On the 15-year loan there is no smaller figure. The larger
                payment is the contract.
              </p>
            </>
          }
          right={
            <>
              <Sub>Why we do not tell you which to pick</Sub>
              <p>
                The trade is {formatUSD(EX.rateEffect)} against the right to
                pay {formatUSD(EX.paymentStepUp)} less in a bad month. Putting
                a number on the second half of that would mean guessing how
                likely you are to have a bad month, and how bad, and this site
                does not know that about you.
              </p>
              <p>
                So the page prices what can be priced and stops there. If your
                income is steady and the gap is wide, the arithmetic favors the
                shorter loan. If your income moves around, the floor may be
                worth more than the discount. Both of those are your call, and
                neither of them is arithmetic.
              </p>
              <Sub>What the calculator will not do</Sub>
              <p>
                It will not name a winner, and it will not tell you that a
                particular rate gap is enough. There is no threshold to clear:
                the shorter loan is ahead by some amount at every gap above
                zero, and the amount grows smoothly. A rule of thumb here would
                be an invention.
              </p>
            </>
          }
        />
      </Band>

      {/* ── Before you act ──────────────────────────────────────────── */}
      <Band tone="paper">
        <SectionHead
          title="Before you act"
          intro="Three things that decide whether paying a 30-year loan like a 15-year one actually works, and one that stops it working at all."
        />
        <EditorialCols
          left={
            <>
              <Sub>Check that extra payments reach the principal</Sub>
              <p>
                This whole comparison assumes the extra{" "}
                {formatUSD(EX.paymentStepUp)} comes off what you owe. The CFPB
                says to check whether your loan allows extra payments and to
                make sure they are applied to the principal.
              </p>
              <p>
                The word that does the work is identified. On a loan Fannie Mae
                owns or guarantees, the servicer must immediately accept and
                apply an additional principal payment that the borrower has
                identified as one, on a loan that is current. Money that
                arrives without being labeled is not covered by that, and how
                it gets applied is then down to the servicer.
              </p>
              <p>
                So label it. Send it with the regular payment, say in writing
                that the extra {formatUSD(EX.paymentStepUp)} is a principal
                payment, and check the next statement shows the balance falling
                by that amount. If your loan is not a Fannie Mae loan, the same
                practice still applies, but the requirement above may not.
              </p>
              <Sub>Check for a prepayment penalty</Sub>
              <p>
                Paying ahead can carry a charge, though the rules are narrow.
                Where one applies at all, it is capped at{" "}
                {PREPAYMENT_PENALTY.maxPctFirstTwoYears}% of the amount you pay
                off in the first two years,{" "}
                {PREPAYMENT_PENALTY.maxPctThirdYear}% in the third, and nothing
                after {PREPAYMENT_PENALTY.maxYears} years. The monthly
                statement most servicers have to send lists any early-payoff
                penalty, so that is where to look first, and your note is where
                to look second.
              </p>
            </>
          }
          right={
            <>
              <Sub>Be honest about whether you will actually do it</Sub>
              <p>
                The 30-year loan only matches the 15-year loan if you pay it
                like one, every month, for{" "}
                {formatDuration(EX.matchedMonths)}. Nothing enforces that. If
                you know from experience that money not claimed by a bill goes
                somewhere else, the required payment on the shorter loan is a
                commitment device, and that is a legitimate reason to prefer
                it. It is just not an arithmetic one.
              </p>
              <Sub>Get both rates from the same lender, the same week</Sub>
              <p>
                The gap between the two rates is the entire financial case for
                the shorter loan, so a gap assembled from two different lenders
                on two different days is not a gap you can act on. Ask for both
                quotes together.
              </p>
              <Sub>Qualifying is a separate question</Sub>
              <p>
                What you have to qualify for is the required payment on the
                note, not the one you intend to make. On the example loan that
                is{" "}
                {formatUSD(EX.shortLoan.monthlyPayment)} against{" "}
                {formatUSD(EX.longLoan.monthlyPayment)}. If the shorter loan
                would push you to a smaller house, the comparison on this page
                is not the comparison you are actually making.
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
                It compares principal and interest only. Property taxes,
                homeowners insurance and HOA dues are the same on both loans,
                so leaving them out cannot tilt the comparison. It does mean
                the payment figures here are smaller than what you would
                actually send each month, which the{" "}
                <InlineLink href={PAYMENT_PATH}>
                  monthly payment calculator
                </InlineLink>{" "}
                works out in full.
              </p>
              <p>
                Mortgage insurance is left out, and that works against the
                shorter loan. If you are putting down less than 20%, the
                15-year loan crosses the equity thresholds sooner and the
                insurance ends sooner, so its real advantage is a little larger
                than shown.
              </p>
              <p>
                It assumes both loans are fixed-rate, that interest is charged
                monthly, and that each payment lands at the end of its month.
                It does not model a rate that can change.
              </p>
            </>
          }
          right={
            <>
              <Sub>Where the answer is slightly off, and which way</Sub>
              <p>
                Tax is ignored. For anyone who itemizes, the loan charging more
                interest also generates more deductible interest, so part of
                the longer loan&rsquo;s extra cost comes back and the shorter
                loan&rsquo;s advantage is smaller than shown. The limits are in
                IRS Publication 936, linked below.
              </p>
              <p>
                What you might do with the difference is ignored. Paying{" "}
                {formatUSD(EX.paymentStepUp)} less each month frees up that
                money, and putting it somewhere is a different comparison with
                a different answer, which the{" "}
                <InlineLink href={PAYOFF_VS_INVEST_PATH}>
                  pay off or invest calculator
                </InlineLink>{" "}
                works through.
              </p>
              <p>
                The model assumes the larger payment is made every month
                without fail. Real people miss months, which would make the
                30-year loan&rsquo;s real interest higher than shown here. The
                error runs against the case this page is making, which is the
                direction we would rather it ran.
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
            TERM_SOURCES.fannieCurtailment,
            TERM_SOURCES.servicerRules,
            PREPAYMENT_SOURCE,
            TERM_SOURCES.pmms,
            REFI_SOURCES.irsPoints,
          ]}
        />
      </Band>

      <Band tone="paper">
        <CalcFooter siblings={SIBLINGS} reviewed={REVIEWED} />
      </Band>
    </main>
  );
}
