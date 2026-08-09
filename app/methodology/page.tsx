import type { Metadata } from "next";
import {
  PageHeader,
  Prose,
  Block,
  ReviewMeta,
  breadcrumbSchema,
} from "@/components/PageChrome";
import { monthlyPayment, amortize, comparePayoff } from "@/lib/mortgage";
import {
  SITE,
  LAST_REVIEWED,
  EXAMPLE,
  PMI,
  PMI_SOURCE,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Methodology — Every Formula, With Its Sources",
  description:
    "The exact arithmetic behind every Plain Loan Math calculator: the amortization formula, how extra payments are applied, how PITI is assembled, and where the PMI rules come from.",
  alternates: { canonical: "/methodology/" },
};

// Every figure below is computed here from lib/mortgage.ts — the same engine
// the calculators use. Nothing is typed in by hand, so this page cannot drift
// away from the tools it documents.
const TERM_MONTHS = EXAMPLE.termYears * 12;
const PAYMENT = monthlyPayment(
  EXAMPLE.loanAmount,
  EXAMPLE.annualRatePct,
  TERM_MONTHS,
);
const BASE = amortize(EXAMPLE.loanAmount, EXAMPLE.annualRatePct, TERM_MONTHS, 0);
const WITH_EXTRA = comparePayoff(
  EXAMPLE.loanAmount,
  EXAMPLE.annualRatePct,
  TERM_MONTHS,
  250,
);

const usd2 = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="num rounded-card border border-line bg-paper px-5 py-4 text-center text-[0.95rem] text-ink">
      {children}
    </div>
  );
}

export default function MethodologyPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema("Methodology", "/methodology/"),
          ),
        }}
      />
      <PageHeader
        eyebrow="How this works"
        title="Methodology"
        lede="Every formula this site uses, written out, with the example numbers worked through. Nothing here is proprietary — you should be able to reproduce any figure by hand."
        siblings={[
          { href: "/editorial-policy/", label: "Editorial policy" },
          { href: "/corrections/", label: "Corrections" },
          { href: "/disclaimer/", label: "Disclaimer" },
        ]}
      />

      <Prose>
        <p>
          The calculators on {SITE.url} share one math engine. It is plain
          TypeScript with no framework in it, which means the same code
          produces the homepage figure, the payoff figure, and the numbers on
          this page &mdash; they cannot disagree with each other.
        </p>
        <p>
          Throughout, we use one example: a{" "}
          <span className="num">{usd(EXAMPLE.loanAmount)}</span> loan at{" "}
          <span className="num">{EXAMPLE.annualRatePct}%</span> over{" "}
          <span className="num">{EXAMPLE.termYears}</span> years. That is a{" "}
          <span className="num">{usd(EXAMPLE.homePrice)}</span> home with{" "}
          <span className="num">{EXAMPLE.downPaymentPct}%</span> down.
        </p>

        <Block title="1. The monthly payment">
          <p>
            Principal and interest come from the standard amortization formula
            for a fully amortizing fixed-rate loan:
          </p>
          <Formula>
            M = P × r(1 + r)<sup>n</sup> ÷ ((1 + r)<sup>n</sup> − 1)
          </Formula>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className="num font-semibold text-ink">M</strong> &mdash;
              the monthly payment
            </li>
            <li>
              <strong className="num font-semibold text-ink">P</strong> &mdash;
              the principal, meaning the amount borrowed after the down payment
            </li>
            <li>
              <strong className="num font-semibold text-ink">r</strong> &mdash;
              the monthly interest rate, which is the annual rate divided by 12
            </li>
            <li>
              <strong className="num font-semibold text-ink">n</strong> &mdash;
              the total number of monthly payments
            </li>
          </ul>
          <p>
            On the example loan, r is{" "}
            <span className="num">{EXAMPLE.annualRatePct}%</span> ÷ 12 ={" "}
            <span className="num">
              {(EXAMPLE.annualRatePct / 100 / 12).toFixed(6)}
            </span>{" "}
            and n is <span className="num">{TERM_MONTHS}</span>, giving{" "}
            <strong className="num font-semibold text-ink">
              {usd2(PAYMENT)}
            </strong>{" "}
            a month.
          </p>
          <p>
            We use monthly compounding, which is the United States convention.
            Some countries compound semi-annually and would produce a different
            figure from the same inputs.
          </p>
          <p>
            When the interest rate is zero the formula divides by zero, so that
            case is handled separately as the principal divided by the number
            of months.
          </p>
        </Block>

        <Block title="2. Splitting each payment">
          <p>
            The payment stays level, but what it does changes every month.
            Interest is charged on whatever you still owe:
          </p>
          <Formula>
            interest = balance × r
            <br />
            principal = M − interest
            <br />
            new balance = balance − principal
          </Formula>
          <p>
            That loop runs once per month until the balance reaches zero. In
            month one on the example loan,{" "}
            <strong className="num font-semibold text-ink">
              {usd2(BASE.schedule[0].interest)}
            </strong>{" "}
            is interest and only{" "}
            <strong className="num font-semibold text-ink">
              {usd2(BASE.schedule[0].principal)}
            </strong>{" "}
            reduces the debt. By the end the ratio has almost exactly reversed.
          </p>
          <p>
            This is why the early years feel like nothing is happening. It is
            not a trick and nothing is hidden from you &mdash; it is what
            charging a percentage fee on a shrinking balance does.
          </p>
          <p>
            Over the full term the example loan pays{" "}
            <span className="num">{usd(BASE.totalInterest)}</span> in interest
            on top of the <span className="num">{usd(EXAMPLE.loanAmount)}</span>{" "}
            borrowed. The final payment is reduced to whatever is actually owed
            rather than a full installment, which is what your lender does too.
          </p>
        </Block>

        <Block title="3. Extra payments">
          <p>
            An extra amount is applied entirely to principal, on top of the
            scheduled payment:
          </p>
          <Formula>principal = (M − interest) + extra</Formula>
          <p>
            Because it skips the interest portion completely, every dollar
            removes not just a dollar of balance but every future month of
            interest that dollar would have generated. The required payment
            never changes; the loan simply ends sooner.
          </p>
          <p>
            On the example loan, an extra{" "}
            <span className="num">$250</span> a month clears it in{" "}
            <strong className="num font-semibold text-ink">
              {WITH_EXTRA.accelerated.months}
            </strong>{" "}
            months instead of{" "}
            <span className="num">{WITH_EXTRA.baseline.months}</span>, saving{" "}
            <strong className="num font-semibold text-ink">
              {usd(WITH_EXTRA.interestSaved)}
            </strong>{" "}
            in interest.
          </p>
          <p>
            We assume the extra is applied to principal in the month it is
            paid. Some servicers instead hold it as a prepayment of next
            month&rsquo;s bill, which saves nothing at all &mdash; worth
            checking your statement after the first one.
          </p>
        </Block>

        <Block title="4. The rest of the monthly bill">
          <p>
            Principal and interest is only part of what leaves your account.
            The other components are annual amounts divided by twelve:
          </p>
          <Formula>
            monthly property tax = annual tax ÷ 12
            <br />
            monthly insurance = annual premium ÷ 12
            <br />
            monthly mortgage insurance = (loan × annual rate) ÷ 12
          </Formula>
          <p>
            Property tax and homeowners insurance are entered as a percentage
            of the home price for convenience, then converted to an annual
            amount. HOA dues are entered directly as a monthly figure because
            that is how they are billed.
          </p>
          <p>
            The values the calculators start with are round placeholders so you
            see a working result immediately. They are{" "}
            <strong className="font-semibold text-ink">
              not published national averages
            </strong>{" "}
            and should be replaced with figures from a real listing, your
            county assessor, or an insurance quote.
          </p>
          <p>
            Closing costs, maintenance, repairs, and utilities are excluded
            entirely. They are real costs of owning a home, but none of them
            appear in a monthly mortgage payment.
          </p>
        </Block>

        <Block title="5. Mortgage insurance and when it stops">
          <p>
            Mortgage insurance is the one line with a legal rule behind it
            rather than just arithmetic. For a conventional loan with
            borrower-paid mortgage insurance, the Homeowners Protection Act
            sets two thresholds, both measured against the{" "}
            <em>original</em> value of the home rather than a later appraisal:
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              At{" "}
              <strong className="num font-semibold text-ink">
                {PMI.requestLtv * 100}%
              </strong>{" "}
              loan-to-value you may request cancellation. You have to ask, in
              writing.
            </li>
            <li>
              At{" "}
              <strong className="num font-semibold text-ink">
                {PMI.automaticLtv * 100}%
              </strong>{" "}
              loan-to-value the servicer must terminate it automatically,
              without you asking.
            </li>
            <li>
              At the midpoint of the amortization schedule it must end
              regardless of the balance.
            </li>
          </ul>
          <p>
            Both depend on you being current on payments, and loans the lender
            classifies as high risk are exempt. Our calculators find these
            points from the scheduled balance, not from a projected home value.
          </p>
          <p>
            Source: {PMI_SOURCE.label}. Verified{" "}
            <span className="num">{PMI_SOURCE.verified}</span> against{" "}
            <a href={PMI_SOURCE.url} rel="noopener">
              the CFPB&rsquo;s explanation of PMI cancellation
            </a>
            .
          </p>
          <p>
            This rule covers conventional loans only. FHA mortgage insurance
            premiums follow separate HUD rules and, for most loans since June
            2013, run for the life of the loan &mdash; refinancing is generally
            the only way out. Our calculators model the conventional rules.
          </p>
        </Block>

        <Block title="6. Rounding">
          <p>
            All arithmetic is carried at full precision and rounded only for
            display. Monthly payments are shown to the cent; totals over the
            life of a loan are shown in whole dollars, because cent-level
            precision on a thirty-year projection implies an accuracy that no
            estimate has.
          </p>
          <p>
            Your lender may round differently at the cent level, so a
            one-or-two-dollar difference against your statement is normal. A
            difference larger than that usually means an input differs &mdash;
            most often escrow amounts, or a rate quoted as APR rather than the
            note rate.
          </p>
        </Block>

        <Block title="7. What we do not model">
          <p>
            Adjustable-rate mortgages, interest-only periods, balloon payments,
            biweekly payment schedules, recasts, points and origination fees,
            prepayment penalties, escrow shortages, and any change in your tax
            or insurance bill over time. Where a calculator adds one of these,
            this page will describe it.
          </p>
          <p>
            We also do not model APR. APR folds lender fees into a single
            annualized number for comparing offers; it is the wrong input for
            calculating a payment. Use the note rate.
          </p>
        </Block>

        <Block title="Checking our work">
          <p>
            Take any figure on this site and reproduce it &mdash; by hand, in a
            spreadsheet, or against another calculator. If ours disagrees, we
            want to know: write to{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a> and see the{" "}
            <a href="/corrections/">corrections page</a> for what happens next.
          </p>
        </Block>

        <ReviewMeta updated={LAST_REVIEWED} />
      </Prose>
    </main>
  );
}
