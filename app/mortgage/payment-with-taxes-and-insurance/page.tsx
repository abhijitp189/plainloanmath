import type { Metadata } from "next";
import PaymentCalculator from "@/components/PaymentCalculator";
import PriceTable from "@/components/PriceTable";
import ExtraPaymentTeaser from "@/components/ExtraPaymentTeaser";
import { CalcProvider } from "@/components/CalcState";
import Disclaimer from "@/components/Disclaimer";
import { breadcrumbSchema, SectionHead } from "@/components/PageChrome";
import {
  Band,
  CalcFooter,
  CalcStripe,
  FaqBlock,
  faqSchema,
  type Faq,
} from "@/components/CalcChrome";
import { monthlyPayment, formatUSD } from "@/lib/mortgage";
import { LAST_REVIEWED, SITE, PMI_SOURCE, EXAMPLE } from "@/lib/constants";
import {
  PAYOFF_PATH,
  PAYOFF_VS_INVEST_PATH,
  PAYMENT_PATH,
} from "@/lib/routes";

// The monthly payment calculator, on its own page from August 10, 2026.
//
// It used to be the homepage. Moving it reverses a ledger decision, and the
// reasons are worth keeping next to the code: the homepage could not say what
// kind of calculator it held (the H1 was a positioning statement, and nothing
// on screen read "mortgage calculator"), one page cannot be tuned for one
// query while also being the site's hub, and a page carrying fourteen sections
// gets harder to maintain every time a tool ships.
//
// Design guide §8.2 is the shape: stripe, calculator, ad, interpretation,
// schedule, ad, editorial, FAQ, related tools, review meta.

export const metadata: Metadata = {
  title: "Mortgage Calculator with Taxes, Insurance and PMI",
  description:
    "A free mortgage payment calculator that separates principal, interest, property tax, homeowners insurance, PMI and HOA dues instead of lumping them. No lender pays us, and there are no quotes or lead forms.",
  alternates: { canonical: PAYMENT_PATH },
};

// ── The worked example, computed rather than typed ─────────────────────────
// Project brief §10 — one recurring example site-wide. These come out of the
// same pure engine the calculator uses, so the prose can never drift from the
// tool. Nothing here is a market figure; EXAMPLE is labeled as an example in
// lib/constants.ts and is safe to state in prose.
const EX_TERM_MONTHS = EXAMPLE.termYears * 12;
const EX_PAYMENT = monthlyPayment(
  EXAMPLE.loanAmount,
  EXAMPLE.annualRatePct,
  EX_TERM_MONTHS,
);
const EX_MONTH1_INTEREST =
  (EXAMPLE.loanAmount * EXAMPLE.annualRatePct) / 100 / 12;
const EX_MONTH1_PRINCIPAL = EX_PAYMENT - EX_MONTH1_INTEREST;

const usd2 = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const COSTS = [
  {
    color: "var(--c-pi)",
    title: "Principal & interest",
    body: "The only part that is actually your mortgage. Principal reduces what you owe; interest is the fee for borrowing it. This is the only line the interest rate touches.",
  },
  {
    color: "var(--c-tax)",
    title: "Property tax",
    body: "Set by local taxing authorities — county, city, school district — not by your lender. It is collected monthly into an escrow account and paid out once or twice a year. It rises as assessed values rise, which is why your payment can change on a fixed-rate loan.",
  },
  {
    color: "var(--c-ins)",
    title: "Homeowners insurance",
    body: "Required by mortgage lenders, also escrowed. You choose the insurer and you can change it, which makes this one of the few lines on the list you can shop for after closing.",
  },
  {
    color: "var(--c-pmi)",
    title: "Mortgage insurance",
    body: "Charged when you put down less than 20%. It protects the lender if you default — it does nothing for you. On a conventional loan federal law forces it to end on a schedule. On an FHA loan it usually does not: since June 2013 the premium generally runs for the life of the loan, and refinancing is the only way out. This calculator models the conventional rules.",
  },
  {
    color: "var(--c-hoa)",
    title: "HOA dues",
    body: "Usually paid directly to a homeowners association rather than through your lender, so it does not show up on your mortgage statement. Lenders count it against your borrowing power anyway, so it shrinks how much house you qualify for.",
  },
  {
    color: "var(--c-interest)",
    title: "What is not here",
    body: "Closing costs, maintenance, repairs, and utilities are real costs of owning a home and none of them appear in a monthly payment. Budget for them separately — no calculator that quotes you a payment is telling you what the house actually costs to run.",
  },
];

const FAQS: Faq[] = [
  {
    q: "What is included in a monthly mortgage payment?",
    a: "Four things on most loans, which is why lenders call it PITI: principal, interest, property taxes and homeowners insurance. Mortgage insurance is added when you put down less than 20%, and HOA dues apply on some properties but are usually paid directly to the association rather than through the lender. Only the first two are the mortgage. The rest are bills your lender collects on someone else's behalf.",
  },
  {
    q: "What is a good down payment?",
    a: "Twenty percent is the number everyone repeats, and the only thing that actually happens at 20% is that mortgage insurance stops being required. It is a threshold, not a rule. Plenty of conventional loans go to 3% down, and government-backed loans go lower. Putting less down means a bigger loan, a bigger payment, and mortgage insurance until you build equity — all of which the calculator above will show you if you change the field.",
  },
  {
    q: "How much house can I afford?",
    a: "A lender answers a different question than the one you are asking. They test whether your total monthly debts stay under a percentage of your gross income. That calculation knows nothing about your childcare costs, your commute, your savings rate or your job security. Treat the approval as a ceiling, not a target.",
  },
  {
    q: "Are property taxes and insurance included in my payment?",
    a: "Usually yes, through escrow. Your lender collects a twelfth of each annual bill every month and pays them when due. That is why your payment can change on a fixed-rate loan — the loan part is fixed, the escrow part is not.",
  },
  {
    q: "Why is my payment higher than the mortgage calculator said?",
    a: "Almost always because the calculator quoted principal and interest only. That is the figure most sites lead with, and on a typical loan it can be a quarter less than the amount that actually leaves your account. Taxes, insurance and mortgage insurance make up the difference. The calculator on this page includes all of them by default, which is the entire reason it exists.",
  },
  {
    q: "What is the difference between the interest rate and the APR?",
    a: "The interest rate — the note rate — is what your payment is calculated from. The APR folds lender fees and points into a single annualized number so you can compare two offers on a like-for-like basis. APR is the better comparison tool and the wrong input for a payment calculation.",
  },
  {
    q: "When does mortgage insurance come off?",
    a: "There are two separate rules and they behave differently. One cancels it automatically at a set point in your original schedule. The other lets you request cancellation earlier once you have enough equity — but you have to ask, in writing, and you may need an appraisal. Nobody will remind you.",
  },
  {
    q: "Does paying extra lower my monthly bill?",
    a: "No. On a fixed-rate loan the required payment never changes. What the extra money changes is how long you make that payment for. If you need a smaller monthly bill rather than a shorter loan, recasting or refinancing are the tools to look at instead.",
  },
  {
    q: "Will my lender apply extra money to the principal automatically?",
    a: "Not always. Some servicers hold it as a prepayment of next month’s bill, which saves you nothing at all. Send it as a separate payment marked “apply to principal,” then check the next statement to confirm the balance actually dropped by that amount.",
  },
  {
    q: "Is a 15-year mortgage better than a 30-year?",
    a: "A 15-year loan carries a lower rate and dramatically less total interest, at the cost of a much higher required payment. The honest trade-off is not discipline versus laziness — it is that a 30-year loan with an extra payment gives you nearly the same outcome while leaving you the option to stop in a bad month. A 15-year loan removes that option permanently.",
  },
];

// ── Schema — technical brief §10. Organization identity only. ──────────────
const appSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Mortgage Payment Calculator",
  url: `${SITE.url}${PAYMENT_PATH}`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
};

const SIBLINGS = [
  { href: PAYOFF_PATH, label: "Payoff with extra payments" },
  { href: PAYOFF_VS_INVEST_PATH, label: "Pay off, or invest the same money" },
  { href: "/methodology/", label: "Methodology" },
  { href: "/", label: "All calculators" },
];

export default function MortgagePaymentCalculatorPage() {
  return (
    <CalcProvider>
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(FAQS)) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              breadcrumbSchema("Mortgage payment calculator", PAYMENT_PATH),
            ),
          }}
        />

        {/* ── Stripe ─────────────────────────────────────────────────
            The eyebrow does the job the old homepage could not: it says what
            this is before anyone has to work it out from the fields. */}
        <CalcStripe
          eyebrow="Mortgage calculator"
          breadcrumb="Mortgage payment calculator"
          title="Mortgage payment calculator, with taxes and insurance"
          lede="Most calculators show you principal and interest and stop there. This one separates every part of the bill — the loan, the county, the insurer, and the mortgage insurance that only protects the lender — so you can see which pieces an interest rate can actually change."
          asideTitle="What this does"
          asidePoints={[
            "Updates as you type — nothing to submit",
            "Splits PITI, PMI and HOA dues apart",
            "Tells you when mortgage insurance ends",
            "Shareable link, CSV and PDF",
          ]}
        >
          <PaymentCalculator />
        </CalcStripe>

        {/* ── What the payment is made of ────────────────────────── */}
        <Band tone="paper">
            <SectionHead
              title="Where each dollar actually goes"
              intro="Only the first of these is money you are paying to borrow. The rest pass through the lender to somebody else, which is why the interest rate has no effect on them at all."
            />

            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {COSTS.map((c) => (
                <li
                  key={c.title}
                  className="border border-l-[3px] border-line-strong bg-surface p-4"
                  style={{ borderLeftColor: c.color }}
                >
                  <h3 className="text-[1.05rem] font-extrabold tracking-[-.025em] text-ink">
                    {c.title}
                  </h3>
                  <p className="mt-1.5 text-[0.91rem] leading-relaxed text-ink-2">
                    {c.body}
                  </p>
                </li>
              ))}
            </ul>
        </Band>

        {/* ── Live price table ───────────────────────────────────── */}
        <PriceTable />

        {/* ── Extra-payment teaser, handing off to the payoff page ─ */}
        <ExtraPaymentTeaser />

        {/* ── How it's calculated ────────────────────────────────── */}
        <Band tone="paper">
            <SectionHead
              title="How the payment is calculated"
              intro="No part of this is proprietary. It is one formula, and you can check our arithmetic against it."
            />

            <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
              <div className="space-y-4 text-ink-2">
                <p className="max-w-prose">
                  Principal and interest come from the standard amortization
                  formula. Everything else is an annual figure divided by
                  twelve.
                </p>
                <div className="num border border-line-strong bg-surface px-5 py-4 text-center text-[0.95rem] text-ink">
                  M = P &times; r(1 + r)<sup>n</sup> &divide; ((1 + r)
                  <sup>n</sup> &minus; 1)
                </div>
                <ul className="space-y-1.5 text-[0.95rem]">
                  <li>
                    <strong className="num font-semibold text-ink">M</strong>{" "}
                    &mdash; the monthly payment you are solving for
                  </li>
                  <li>
                    <strong className="num font-semibold text-ink">P</strong>{" "}
                    &mdash; the amount borrowed, after the down payment
                  </li>
                  <li>
                    <strong className="num font-semibold text-ink">r</strong>{" "}
                    &mdash; the annual rate divided by 12
                  </li>
                  <li>
                    <strong className="num font-semibold text-ink">n</strong>{" "}
                    &mdash; the number of monthly payments, so 360 on a 30-year
                    loan
                  </li>
                </ul>
                <p className="max-w-prose">
                  On the example loan used across this site &mdash;{" "}
                  <span className="num">{formatUSD(EXAMPLE.loanAmount)}</span>{" "}
                  at <span className="num">{EXAMPLE.annualRatePct}%</span> over{" "}
                  <span className="num">{EXAMPLE.termYears}</span> years &mdash;
                  that works out to{" "}
                  <strong className="num font-semibold text-ink">
                    {usd2(EX_PAYMENT)}
                  </strong>{" "}
                  a month before taxes and insurance.
                </p>
              </div>

              <div className="space-y-4 text-ink-2">
                <h3 className="text-[1.15rem] font-extrabold tracking-[-.025em] text-ink">
                  Why the early years feel like nothing is happening
                </h3>
                <p className="max-w-prose">
                  Interest is charged on what you still owe. At the start you
                  owe almost the whole amount, so almost the whole payment goes
                  to the fee and barely any of it touches the debt.
                </p>
                <p className="max-w-prose">
                  In month one on that loan,{" "}
                  <strong className="num font-semibold text-ink">
                    {usd2(EX_MONTH1_INTEREST)}
                  </strong>{" "}
                  is interest and only{" "}
                  <strong className="num font-semibold text-ink">
                    {usd2(EX_MONTH1_PRINCIPAL)}
                  </strong>{" "}
                  reduces the balance. By the final year that ratio is almost
                  exactly reversed. Nothing was hidden from you — it is what
                  charging a fee on a shrinking balance does.
                </p>
                <div
                  className="border border-l-[3px] border-line-strong bg-[var(--indigo-soft)] p-4 text-[0.92rem] leading-relaxed"
                  style={{ borderLeftColor: "var(--c-tax)" }}
                >
                  <strong className="font-semibold text-ink">
                    This is why an extra payment is unusually powerful.
                  </strong>{" "}
                  Money added on top goes entirely to the balance, so it skips
                  the fee completely. Every dollar of balance you remove early
                  also removes every future month of interest that dollar would
                  have generated.
                </div>
                <p className="max-w-prose text-[0.92rem]">
                  Mortgage insurance is the one line with a rule behind it
                  rather than just arithmetic. For a conventional loan with
                  borrower-paid insurance, the Homeowners Protection Act
                  requires your servicer to drop it once the scheduled balance
                  reaches 78% of the home&rsquo;s original value, or at the
                  midpoint of the term, whichever comes first. You can request
                  it at 80%. Both depend on being current on your payments,
                  both are measured against the original value rather than a
                  later appraisal, and loans the lender classifies as high-risk
                  are exempt.{" "}
                  <a
                    href={PMI_SOURCE.url}
                    className="text-accent-dk underline decoration-line-strong underline-offset-2 hover:decoration-accent"
                    rel="noopener"
                  >
                    CFPB explains the rule here
                  </a>
                  .
                </p>
              </div>
            </div>
        </Band>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <Band tone="surface">
            <SectionHead
              title="Questions people actually ask"
              intro="Short answers. Longer ones are linked where a full page exists."
            />
            <FaqBlock items={FAQS} />
        </Band>

        {/* ── Keep going ──────────────────────────────────────────── */}
        <Band tone="paper">
          <CalcFooter siblings={SIBLINGS} reviewed={LAST_REVIEWED} />
        </Band>
      </main>
    </CalcProvider>
  );
}
