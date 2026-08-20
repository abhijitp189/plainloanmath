import type { Metadata } from "next";
import Link from "next/link";
import { InlineLink } from "@/components/InlineLink";
import {
  LAST_REVIEWED,
  SITE,
  EXAMPLE,
  PREPAYMENT_PENALTY,
  PREPAYMENT_SOURCE,
  CFPB_SOURCES,
} from "@/lib/constants";
import PayoffCalculator from "@/components/PayoffCalculator";
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
import {
  PAYOFF_PATH,
  PAYMENT_PATH,
  ROUTE_REVIEWED,
  relatedRoutes,
} from "@/lib/routes";
import {
  amortizePlan,
  comparePlan,
  crossoverMonth,
  formatUSD,
  formatDuration,
  monthlyPayment,
  NO_PLAN,
} from "@/lib/mortgage";

export const metadata: Metadata = {
  title: "Mortgage Payoff Calculator With Extra Payments",
  description:
    "See what an extra monthly payment, a yearly extra, a lump sum or a biweekly schedule takes off your mortgage. Shows the time saved, the interest saved and the month your payment starts working for you.",
  alternates: { canonical: PAYOFF_PATH },
};

const REVIEWED = ROUTE_REVIEWED.payoff ?? LAST_REVIEWED;

// ─────────────────────────────────────────────────────────────────────────────
// The worked comparison, computed at build time.
//
// Project brief §10: worked examples are computed, not typed, so the prose
// cannot drift from the tool. Every figure in the table below comes out of
// lib/mortgage.ts during the build, using the site-wide recurring example —
// $340,000 at 6.75% over 30 years, which is a $425,000 home with 20% down.
//
// Independently recomputed in Node on August 12, 2026 against a separate
// implementation of the same arithmetic: baseline $2,205.23/month,
// $453,884.07 total interest, zero balance at month 360.
// ─────────────────────────────────────────────────────────────────────────────

const P = EXAMPLE.loanAmount;
const R = EXAMPLE.annualRatePct;
const N = EXAMPLE.termYears * 12;

const SCHEDULED = monthlyPayment(P, R, N);
const BASE = amortizePlan(P, R, N, NO_PLAN);

type Strategy = {
  name: string;
  detail: string;
  months: number;
  interest: number;
  saved: number;
  monthsSaved: number;
};

function strategy(
  name: string,
  detail: string,
  plan: Parameters<typeof comparePlan>[3],
): Strategy {
  const c = comparePlan(P, R, N, plan);
  return {
    name,
    detail,
    months: c.accelerated.months,
    interest: c.accelerated.totalInterest,
    saved: c.interestSaved,
    monthsSaved: c.monthsSaved,
  };
}

const STRATEGIES: Strategy[] = [
  strategy("$250 extra every month", "$3,000 a year", {
    ...NO_PLAN,
    extraMonthly: 250,
  }),
  strategy("One extra payment a year", "Paid each December", {
    ...NO_PLAN,
    annualExtra: SCHEDULED,
    annualExtraMonth: 12,
  }),
  strategy("Biweekly", "26 half-payments a year", {
    ...NO_PLAN,
    biweekly: true,
  }),
  strategy("A twelfth of the payment, monthly", "The same 13 payments, spread out", {
    ...NO_PLAN,
    extraMonthly: SCHEDULED / 12,
  }),
  strategy("A $10,000 lump sum in year 1", "Paid once, then nothing", {
    ...NO_PLAN,
    lumpSum: 10_000,
    lumpSumMonth: 12,
  }),
];

const BASE_CROSSOVER = crossoverMonth(BASE.schedule);
const EXTRA_250_CROSSOVER = crossoverMonth(
  amortizePlan(P, R, N, { ...NO_PLAN, extraMonthly: 250 }).schedule,
);

// The biweekly comparison, computed rather than asserted. Both plans put in 13
// payments a year; the do-it-yourself version credits principal as it arrives.
const BIWEEKLY = amortizePlan(P, R, N, { ...NO_PLAN, biweekly: true });
const TWELFTH = amortizePlan(P, R, N, {
  ...NO_PLAN,
  extraMonthly: SCHEDULED / 12,
});

const EXAMPLE_LABEL = `${formatUSD(P)} at ${R}% over ${EXAMPLE.termYears} years`;

// ─────────────────────────────────────────────────────────────────────────────

const FAQ: Faq[] = [
  {
    q: "Does paying extra lower my monthly payment?",
    a: "No. Your scheduled payment is fixed for the life of a fixed-rate loan, and paying extra does not change it. It shortens the loan instead. The only way to lower the required payment on the same loan is a recast, where the servicer re-amortizes your reduced balance over the remaining term. Recasting lowers the payment but keeps the original payoff date, so it saves less interest than simply paying extra does.",
  },
  {
    q: "Is it better to pay extra every month or once a year?",
    a: `Monthly, if the amounts are the same over the year. Money that reaches the principal in January stops being charged interest eleven months earlier than money that arrives in December. On ${EXAMPLE_LABEL}, ${formatUSD(SCHEDULED / 12)} added to every payment saves ${formatUSD(TWELFTH.totalInterest > 0 ? BASE.totalInterest - TWELFTH.totalInterest : 0)} against ${formatUSD(BASE.totalInterest - BIWEEKLY.totalInterest)} for one extra payment paid each December. That is the same money, about ${formatUSD(BIWEEKLY.totalInterest - TWELFTH.totalInterest)} apart. In practice the schedule you will actually stick to beats the marginally better one you will not.`,
  },
  {
    q: "Are biweekly mortgage payments worth it?",
    a: `Biweekly means 26 half-payments a year, which is 13 monthly payments rather than 12, so the whole benefit is the one extra payment, not the fortnightly rhythm. You can produce the same 13 payments yourself by adding ${formatUSD(SCHEDULED / 12)} to each monthly payment on ${EXAMPLE_LABEL}, and that version saves slightly more because the money reaches the principal as it arrives instead of waiting for a full payment to accumulate. Companies that charge a setup or per-transaction fee to convert you to biweekly are charging for something you can do free.`,
  },
  {
    q: "Will my lender charge me for paying my mortgage off early?",
    a: `Probably not. The CFPB says prepayment penalties do not normally apply to extra principal paid in small amounts, and typically only bite when the whole balance is paid off within the first few years. Where a penalty is permitted at all, Regulation Z caps it at ${PREPAYMENT_PENALTY.maxPctFirstTwoYears}% of the balance prepaid in the first two years and ${PREPAYMENT_PENALTY.maxPctThirdYear}% in the third, and forbids it entirely after ${PREPAYMENT_PENALTY.maxYears} years. Check your note and your closing disclosure before making a large one-off payment.`,
  },
  {
    q: "How do I make sure the extra money goes to the principal?",
    a: "Say so explicitly. Most servicers have a principal-only field in their online payment form; if yours does not, send the extra as a separate payment marked for principal rather than adding it to your regular one. Then check the next statement. Some servicers hold extra money and apply it toward the next scheduled payment, which advances your due date and saves you nothing at all.",
  },
  {
    q: "I am ten years into my loan. Can I still use this?",
    a: "Yes. Enter what you owe today rather than the original loan amount, and the years you have left rather than the original term. The calculator runs forward from wherever you are. Your current balance and remaining term are both on your monthly statement.",
  },
  {
    q: "Should I pay off my mortgage early or invest the money instead?",
    a: "Paying down the mortgage returns exactly your interest rate, guaranteed and tax-free in the sense that there is no tax on money you never pay. Investing may return more, with risk and no guarantee. The comparison also depends on whether you itemize, what other debt you carry, and whether you have an emergency fund. The honest answer for most people is to fund the emergency fund and clear anything at a higher rate first. There is no single right answer, which is why this page computes the mortgage side and does not pretend to settle the rest.",
  },
  {
    q: "Does paying extra get rid of my mortgage insurance sooner?",
    a: "It brings forward the date you can ask for it. Under the Homeowners Protection Act you may request cancellation once the balance reaches 80% of the original value, and that test looks at your actual balance, so extra payments move it earlier. The automatic termination at 78% does not move, because the servicer reads that date off the original amortization schedule regardless of what you have actually paid.",
  },
];

const appSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Mortgage Payoff Calculator with Extra Payments",
  url: `${SITE.url}${PAYOFF_PATH}`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
};

// Generated rather than typed, August 18, 2026. This list predated
// `relatedRoutes()` and was the reason the article that explains this page's
// own tipping point never appeared on it, and the reason the 15-versus-30
// calculator would not have either. Methodology, corrections and the editorial
// policy are dropped from it deliberately: CalcFooter already links the first
// two in its review meta and SiteFooter carries all three on every page, so
// they were spending sibling slots that belong to tools.
const SIBLINGS = relatedRoutes("payoff");

export default function MortgagePayoffPage() {
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
          __html: JSON.stringify(calcBreadcrumbSchema("payoff")),
        }}
      />

      <CalcStripe
        route="payoff"
        title="Mortgage payoff calculator with extra payments"
        lede="Add a little each month, one payment a year, a lump sum, or a biweekly schedule. See the payoff date move and the interest you never hand over."
        asideTitle="What this does"
        asidePoints={[
          "Updates as you type, nothing to submit",
          "Monthly, yearly, lump sum or biweekly",
          "Shows the month your payment starts working for you",
          "Shareable link, CSV and PDF",
        ]}
      >
        <PayoffCalculator />
      </CalcStripe>

        {/* ── How it works ────────────────────────────────────────────── */}
        <Band tone="paper">
          <SectionHead
            title="Why a small extra payment does so much"
            intro="The saving is not the money you pay in. It is all the interest that never gets charged on it."
          />

          <EditorialCols
            left={<>
            <p>
              Every month, interest is charged on whatever you still owe. Your
              scheduled payment covers that interest first, and only what is
              left over reduces the balance. Early in a thirty-year loan the
              balance is large, so almost the whole payment goes to interest and
              barely any of it to principal. The CFPB describes the same
              mechanism: at the start of the term most of the payment is applied
              to interest, and the proportion shifts toward principal only as
              the balance comes down.
            </p>
            <p>
              An extra payment skips that queue entirely. It goes straight to
              principal, which means the balance is smaller for every single
              month that follows, and so is the interest charged on it. That is
              why the effect compounds. A modest amount applied early removes
              years from the term, because each early dollar of principal avoids
              decades of interest. The same dollar paid in year twenty-five
              saves almost nothing.
            </p>

            <Sub>The tipping point, and why nobody tells you yours</Sub>
            <p>
              There is a month in every loan where the split finally reverses
              and more of your payment goes to principal than to interest. It is
              a genuinely useful thing to know and it is almost always quoted as
              a rule of thumb (&ldquo;year eighteen or nineteen on a thirty-year
              loan&rdquo;) rather than computed. The real answer depends
              entirely on the rate.
            </p>
            <p>
              On {EXAMPLE_LABEL}, it is{" "}
              <strong className="font-semibold text-ink">
                month <span className="num">{BASE_CROSSOVER}</span>
              </strong>,{" "}
              {BASE_CROSSOVER ? formatDuration(BASE_CROSSOVER) : ""} in, not
              year eighteen. Add {formatUSD(250)} a month and it arrives at{" "}
              <strong className="font-semibold text-ink">
                month <span className="num">{EXTRA_250_CROSSOVER}</span>
              </strong>
              . The calculator above works it out for your figures and shows
              both.
            </p>

            </>}
            right={<>
            <Sub>The formula</Sub>
            <p>The scheduled monthly payment on a fixed-rate loan is:</p>
            <div className="border border-line bg-surface px-5 py-4 font-mono text-sm text-ink">
              M = P &times; r(1 + r)<sup>n</sup> &divide; ((1 + r)<sup>n</sup>{" "}
              &minus; 1)
            </div>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="font-semibold text-ink">M</strong> is the
                monthly payment, principal and interest only
              </li>
              <li>
                <strong className="font-semibold text-ink">P</strong> is the
                amount borrowed, or what you owe today
              </li>
              <li>
                <strong className="font-semibold text-ink">r</strong> is the
                monthly interest rate, which is the annual rate divided by 12
              </li>
              <li>
                <strong className="font-semibold text-ink">n</strong> is the
                number of monthly payments left in the term
              </li>
            </ul>
            <p>
              The calculator then runs the loan one month at a time. Each month
              it charges interest on the opening balance, applies the payment to
              that interest first, puts the remainder plus anything extra
              against the principal, and repeats until the balance reaches zero.
              It runs the same loan twice, once with your extra payments and
              once without, and reports the difference. The final month pays
              only what is actually owed rather than a full installment.
            </p>
            </>}
          />
        </Band>

        {/* ── The four strategies ─────────────────────────────────────── */}
        <Band tone="surface">
          <SectionHead
            title="Four ways to pay extra, and what each is worth"
            intro={
              <>
                Every figure below is computed from {EXAMPLE_LABEL} when this
                page was built, using the same engine as the calculator above.
                Nothing here is typed in by hand.
              </>
            }
          />

          <div className="tablewrap overflow-x-auto" data-print-full>
            <table className="w-full min-w-[34rem] border-collapse text-sm">
              <caption className="sr-only">
                Interest saved and time saved under five extra-payment
                strategies on a {formatUSD(P)} loan at {R}% over{" "}
                {EXAMPLE.termYears} years
              </caption>
              <thead>
                <tr className="border-b-rule border-line-strong bg-paper-2 text-left">
                  <th scope="col" className="label px-3 py-2.5">
                    Strategy
                  </th>
                  <th scope="col" className="label px-3 py-2.5 text-right">
                    Paid off in
                  </th>
                  <th scope="col" className="label px-3 py-2.5 text-right">
                    Total interest
                  </th>
                  <th scope="col" className="label px-3 py-2.5 text-right">
                    Interest saved
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line">
                  <th scope="row" className="px-3 py-2.5 text-left font-normal text-ink-2">
                    Nothing extra
                    <span className="block text-[0.8rem] text-muted">
                      The scheduled {formatUSD(SCHEDULED)} a month
                    </span>
                  </th>
                  <td className="num px-3 py-2.5 text-right text-ink-2">
                    {formatDuration(BASE.months)}
                  </td>
                  <td className="num px-3 py-2.5 text-right text-ink-2">
                    {formatUSD(BASE.totalInterest)}
                  </td>
                  <td className="num px-3 py-2.5 text-right text-muted">$0</td>
                </tr>
                {STRATEGIES.map((s) => (
                  <tr key={s.name} className="border-b border-line">
                    <th
                      scope="row"
                      className="px-3 py-2.5 text-left font-normal text-ink-2"
                    >
                      {s.name}
                      <span className="block text-[0.8rem] text-muted">
                        {s.detail}
                      </span>
                    </th>
                    <td className="num px-3 py-2.5 text-right text-ink-2">
                      {formatDuration(s.months)}
                    </td>
                    <td className="num px-3 py-2.5 text-right text-ink-2">
                      {formatUSD(s.interest)}
                    </td>
                    <td className="num px-3 py-2.5 text-right font-semibold text-ink">
                      {formatUSD(s.saved)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <EditorialCols
            left={<>
            <Sub>Biweekly payments, honestly</Sub>
            <p>
              Biweekly is sold as a trick. It is not one. Paying half your
              mortgage every two weeks means 26 half-payments a year, and 26
              halves is 13 whole payments rather than 12. The entire benefit is
              that one extra payment. The fortnightly rhythm does nothing on its
              own.
            </p>
            <p>
              Which means you can have the same benefit for free. Adding{" "}
              <span className="num">{formatUSD(SCHEDULED / 12)}</span> to each
              monthly payment on {EXAMPLE_LABEL} puts in the same 13 payments a
              year, and pays off in{" "}
              <span className="num">{formatDuration(TWELFTH.months)}</span>{" "}
              against{" "}
              <span className="num">{formatDuration(BIWEEKLY.months)}</span> for
              the biweekly schedule, saving{" "}
              <span className="num">
                {formatUSD(BIWEEKLY.totalInterest - TWELFTH.totalInterest)}
              </span>{" "}
              more interest. The do-it-yourself version wins because the money
              reaches the principal as it arrives, instead of sitting with the
              servicer until a whole payment has accumulated.
            </p>
            <p>
              If a company offers to convert you to biweekly for a setup fee or
              a charge per transaction, that is what the fee buys: a slightly
              worse version of something you can arrange yourself in your
              servicer&rsquo;s payment form.
            </p>

            </>}
            right={<>
            <Sub>Lump sums, and what a recast actually does</Sub>
            <p>
              A one-off payment (an inheritance, a bonus, the proceeds of a
              sale) behaves the same way as a monthly extra, just concentrated.
              It reduces the balance immediately and every month of interest
              after it is charged on the smaller number. What it does{" "}
              <em>not</em> do is reduce your monthly payment. That stays exactly
              where it was; the loan simply ends sooner.
            </p>
            <p>
              A recast is the other option, and it is the one most people have
              never heard of. You make a large payment and ask the servicer to
              re-amortize the reduced balance over the{" "}
              <em>remaining original term</em>. Your rate does not change, your
              payoff date does not change, and your monthly payment drops.
              Recasting buys cash flow. Paying extra without recasting buys a
              shorter loan and more interest saved. They are opposite trades of
              the same money, and servicers typically require a minimum lump sum
              and charge a modest fee to do it.
            </p>
            <p>
              Neither is a refinance. A refinance replaces the loan, which means
              a new rate, new closing costs, and, if you take a fresh
              thirty-year term, a reset amortization schedule that puts you
              back at the front of the interest curve.
            </p>
            </>}
          />
        </Band>

        {/* ── Before you start ────────────────────────────────────────── */}
        <Band tone="paper">
          <SectionHead
            title="Before you send the first extra payment"
            intro="Two things worth checking, and one worth thinking about. All three are cheap now and expensive later."
          />

          <EditorialCols
            left={<>
            <Sub>Make sure the money reaches the principal</Sub>
            <p>
              This is the one that quietly wastes people&rsquo;s money. Some
              servicers treat extra money as a payment made early: they hold it
              and apply it to next month&rsquo;s installment, which advances
              your due date and saves you nothing. Most online payment forms
              have a separate principal-only field. Use it, and if there
              isn&rsquo;t one, send the extra as its own payment marked for
              principal rather than adding it to your regular one.
            </p>
            <p>
              Then check the next statement. The balance should have fallen by
              the extra amount on top of the scheduled principal, and the due
              date should be unchanged. If the due date moved forward instead,
              the money went to the wrong place and it is worth a phone call.
            </p>

            <Sub>Check for a prepayment penalty</Sub>
            <p>
              Most borrowers do not have one. The CFPB&rsquo;s guidance is that
              a prepayment penalty typically applies only when the whole balance
              is paid off within a set number of years, because you sold or
              refinanced, and that penalties do not normally attach to extra
              principal paid in small amounts.
            </p>
            <p>
              Where one is permitted at all, Regulation Z restricts it sharply.
              A penalty is only allowed on a qualified mortgage with a rate that
              cannot increase and which is not a higher-priced mortgage loan,
              and even then it may not exceed{" "}
              <span className="num">
                {PREPAYMENT_PENALTY.maxPctFirstTwoYears}%
              </span>{" "}
              of the balance prepaid during the first two years or{" "}
              <span className="num">{PREPAYMENT_PENALTY.maxPctThirdYear}%</span>{" "}
              during the third, and it may not apply at all after{" "}
              <span className="num">{PREPAYMENT_PENALTY.maxYears}</span> years.
              You will find your own position on page one of your Loan Estimate
              and in your closing disclosure. Check it before a large one-off
              payment; a monthly extra of a few hundred dollars is very unlikely
              to trigger anything.
            </p>

            </>}
            right={<>
            <Sub>When paying extra is the wrong move</Sub>
            <p>
              Money put into a mortgage returns your interest rate, guaranteed,
              which is a genuinely good return, and also an illiquid one. You
              cannot get it back out without borrowing against the house again.
              So the ordinary sequence is: an emergency fund first, then any
              debt at a higher rate than the mortgage, then an employer
              retirement match if you have one, and extra mortgage payments
              after that.
            </p>
            <p>
              There is also a real argument for investing the money instead,
              which turns entirely on whether you expect a higher return than
              your mortgage rate and how you feel about the risk that you
              don&rsquo;t get one. That comparison deserves its own tool and its
              own page rather than a paragraph here, and it is on the way.
            </p>
            </>}
          />
        </Band>

        {/* ── Limits ──────────────────────────────────────────────────── */}
        <Band tone="surface">
          <SectionHead
            title="What this calculator leaves out"
            intro="Stated plainly, because a calculator that hides its assumptions is worth less than one that admits them."
          />

          <EditorialCols
            left={<>
            <p>
              <strong className="font-semibold text-ink">
                These figures are principal and interest only.
              </strong>{" "}
              Your actual monthly payment also includes property taxes,
              homeowners insurance, and possibly mortgage insurance and HOA dues,
              often several hundred dollars more. Extra payments do not reduce
              any of those. If you want the whole number, the{" "}
              <InlineLink href={PAYMENT_PATH}>
                monthly payment calculator
              </InlineLink>{" "}
              breaks it into parts.
            </p>
            <p>
              <strong className="font-semibold text-ink">
                It assumes a fixed rate for the whole term.
              </strong>{" "}
              On an adjustable-rate mortgage the payment changes when the rate
              does, and the arithmetic here will drift from your statement.
            </p>
            <p>
              <strong className="font-semibold text-ink">
                Biweekly is modeled as one extra full payment every twelve
                months.
              </strong>{" "}
              That is what a US servicer running a biweekly program generally
              does: the half-payments are held and applied once a whole payment
              has accumulated. Modeling it as a twelfth of a payment added each
              month would credit the principal sooner than the money is really
              applied, and would overstate the saving. Where this errs, it errs
              conservatively.
            </p>
            </>}
            right={<>
            <p>
              <strong className="font-semibold text-ink">
                It assumes every payment is made on time
              </strong>{" "}
              and that your servicer applies extras to principal immediately.
              Interest is charged monthly on the opening balance, which is the
              convention lenders and the CFPB use for disclosed payment figures;
              a servicer computing daily interest will produce figures a few
              dollars different.
            </p>
            <p>
              <strong className="font-semibold text-ink">
                Nothing here is adjusted for inflation or tax.
              </strong>{" "}
              A dollar of interest avoided in year twenty-five is counted the
              same as one avoided next month, and no mortgage interest deduction
              is applied.
            </p>
            </>}
          />
        </Band>

        {/* ── FAQ ─────────────────────────────────────────────────────── */}
        <Band tone="paper">
          <SectionHead
            title="Questions people ask"
            intro="The ones that come up most, answered in the order they usually come up."
          />

          <FaqBlock items={FAQ} />
        </Band>

        {/* ── Sources ─────────────────────────────────────────────── */}
        <Band tone="surface">
          <Sources
            items={[
              CFPB_SOURCES.payingDown,
              CFPB_SOURCES.prepaymentPenalty,
              {
                label: `${PREPAYMENT_SOURCE.label}: limits on prepayment penalties`,
                url: PREPAYMENT_SOURCE.url,
                verified: PREPAYMENT_SOURCE.verified,
              },
            ]}
          />
        </Band>

        {/* ── Keep going ──────────────────────────────────────────── */}
        <Band tone="paper">
          <CalcFooter siblings={SIBLINGS} reviewed={REVIEWED} />
        </Band>
    </main>
  );
}
