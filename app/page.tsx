import type { Metadata } from "next";
import Link from "next/link";
import PaymentCalculator from "@/components/PaymentCalculator";
import PriceTable from "@/components/PriceTable";
import ExtraPaymentTeaser from "@/components/ExtraPaymentTeaser";
import { CalcProvider } from "@/components/CalcState";
import { monthlyPayment, formatUSD } from "@/lib/mortgage";
import { LAST_REVIEWED, SITE, PMI_SOURCE, EXAMPLE } from "@/lib/constants";
import { PAYOFF_PATH } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Mortgage Calculator — What Your Monthly Payment Is Actually Made Of",
  description:
    "A free mortgage calculator that shows every part of your monthly payment, not just principal and interest. No lender pays us. No quotes, no lead forms.",
  alternates: { canonical: "/" },
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

// ── Content ────────────────────────────────────────────────────────────────

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

// Design guide §1.3 — brass is reserved for savings figures and appears
// nowhere else. The prototype tinted step three in brass; it uses the
// insurance hue here instead so the rule holds.
const STEPS = [
  {
    no: "STEP 01",
    a: "#0D6E5F",
    bg: "#E7F0EF",
    bd: "#C0D9D5",
    title: "Put your numbers in",
    body: "Price, down payment, rate and term. If you are refinancing or already own, enter the balance you still owe as the price and leave the down payment at zero.",
    icon: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2.5" />
        <path d="M8 8h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" />
      </>
    ),
  },
  {
    no: "STEP 02",
    a: "#2E7FD1",
    bg: "#EAF2FA",
    bd: "#C9DEF3",
    title: "See what the payment is really made of",
    body: "The breakdown separates the loan from everything the lender collects alongside it. Most people are surprised how much of the bill is not the mortgage at all.",
    icon: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="M15.8 15.8L20.5 20.5" />
      </>
    ),
  },
  {
    no: "STEP 03",
    a: "#EF9A2E",
    bg: "#FDF5EA",
    bd: "#FBE5C9",
    title: "Try an extra payment",
    body: "Add any amount and watch the payoff date move. The interest you avoid is money you never hand over, which is why it is the one figure we set apart from everything else.",
    icon: (
      <>
        <path d="M4 18l5-6 4 3.5L20 6" />
        <path d="M20 10.5V6h-4.5" />
      </>
    ),
  },
];

type Tool = {
  href?: string;
  flag?: string;
  a: string;
  bg: string;
  bd: string;
  title: string;
  body: string;
  question: string;
  icon: React.ReactNode;
};

// Only tools with a live page carry an href. Project brief §3, defect 3 — the
// site already ships nine links to routes that do not exist, and this grid is
// exactly where a tenth would come from. An unbuilt tool renders as plain
// text, not as a link to a 404.
const TOOLS: Tool[] = [
  {
    href: PAYOFF_PATH,
    a: "#0D6E5F",
    bg: "#E7F0EF",
    bd: "#C0D9D5",
    title: "Payoff with extra payments",
    body: "Add anything extra each month and watch the interest disappear.",
    question: "“What if I pay $200 more?”",
    icon: (
      <>
        <path d="M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z" />
        <path d="M4 7v5c0 1.7 3.6 3 8 3s8-1.3 8-3V7" />
        <path d="M4 12v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5" />
      </>
    ),
  },
  {
    href: "/",
    a: "#2E7FD1",
    bg: "#EAF2FA",
    bd: "#C9DEF3",
    title: "Monthly payment",
    body: "Principal, interest, taxes and insurance — separated, not lumped.",
    question: "“What will I actually pay?”",
    icon: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.6" />
        <path d="M6.5 12h.01M17.5 12h.01" />
      </>
    ),
  },
  {
    flag: "Next",
    a: "#8B6FB0",
    bg: "#F3F1F7",
    bd: "#E1DAEA",
    title: "Amortization schedule",
    body: "Every month of the loan, downloadable as a spreadsheet.",
    question: "“Where is my money going?”",
    icon: <path d="M4 6h16M4 12h16M4 18h11" />,
  },
  {
    flag: "Soon",
    a: "#EF9A2E",
    bg: "#FDF5EA",
    bd: "#FBE5C9",
    title: "How much house you can afford",
    body: "The gap between what you are approved for and what is comfortable.",
    question: "“What can I really afford?”",
    icon: (
      <>
        <path d="M3 11l9-7 9 7" />
        <path d="M5.5 10v10h13V10" />
        <path d="M10 20v-5h4v5" />
      </>
    ),
  },
  {
    flag: "Soon",
    a: "#C4788C",
    bg: "#F9F2F4",
    bd: "#F0DCE1",
    title: "Refinance break-even",
    body: "The month the closing costs finish paying for themselves.",
    question: "“Is refinancing worth it?”",
    icon: (
      <>
        <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" />
        <path d="M20.5 4v4.5H16" />
      </>
    ),
  },
  {
    flag: "Soon",
    a: "#0A574B",
    bg: "#E6EEED",
    bd: "#BFD3D0",
    title: "15-year vs 30-year",
    body: "Both loans side by side, in dollars rather than adjectives.",
    question: "“Which term should I take?”",
    icon: <path d="M6 20V11M12 20V4M18 20V15" />,
  },
];

const FAQS = [
  {
    q: "What is a good down payment?",
    a: "Twenty percent is the number everyone repeats, and the only thing that actually happens at 20% is that mortgage insurance stops being required. It is a threshold, not a rule. Plenty of conventional loans go to 3% down, and government-backed loans go lower. Putting less down means a bigger loan, a bigger payment, and mortgage insurance until you build equity — all of which the calculator above will show you if you change the field.",
  },
  {
    q: "How much house can I afford?",
    a: "A lender answers a different question than the one you are asking. They test whether your total monthly debts stay under a percentage of your gross income. That calculation knows nothing about your childcare costs, your commute, your savings rate or your job security. Treat the approval as a ceiling, not a target.",
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
    q: "What is the difference between the interest rate and the APR?",
    a: "The interest rate — the note rate — is what your payment is calculated from. The APR folds lender fees and points into a single annualized number so you can compare two offers on a like-for-like basis. APR is the better comparison tool and the wrong input for a payment calculation.",
  },
  {
    q: "When does mortgage insurance come off?",
    a: "There are two separate rules and they behave differently. One cancels it automatically at a set point in your original schedule. The other lets you request cancellation earlier once you have enough equity — but you have to ask, in writing, and you may need an appraisal. Nobody will remind you.",
  },
  {
    q: "Are property taxes and insurance included in my payment?",
    a: "Usually yes, through escrow. Your lender collects a twelfth of each annual bill every month and pays them when due. That is why your payment can change on a fixed-rate loan — the loan part is fixed, the escrow part is not.",
  },
  {
    q: "Is a 15-year mortgage better than a 30-year?",
    a: "A 15-year loan carries a lower rate and dramatically less total interest, at the cost of a much higher required payment. The honest trade-off is not discipline versus laziness — it is that a 30-year loan with an extra payment gives you nearly the same outcome while leaving you the option to stop in a bad month. A 15-year loan removes that option permanently.",
  },
  {
    q: "Should I pay off the mortgage or invest instead?",
    a: "Paying down the loan is a guaranteed return equal to your interest rate. Investing is a higher expected return that is not guaranteed. The arithmetic favors investing at most historical return assumptions; the certainty favors the mortgage. Which matters more is a question about you, not about the numbers.",
  },
  {
    q: "Is there a penalty for paying off early?",
    a: "On most US mortgages written today, no. Prepayment penalties still exist on some non-standard loans, and if you have one your closing paperwork says so explicitly. It is not something a lender can apply quietly.",
  },
];

const GLOSSARY = [
  ["Principal", "The amount you owe. Every payment shaves a little off it."],
  [
    "Interest",
    "The fee for borrowing, charged on whatever principal is left.",
  ],
  [
    "Amortization",
    "The schedule that splits each payment between fee and debt.",
  ],
  [
    "Escrow",
    "A holding account your lender uses to pay your tax and insurance bills.",
  ],
  [
    "PITI",
    "Principal, interest, taxes, insurance — the four parts of a typical bill.",
  ],
  ["PMI", "Insurance you buy that protects the lender if you stop paying."],
  ["Equity", "What the home is worth minus what you still owe on it."],
  ["APR", "The rate with fees folded in, for comparing offers."],
  [
    "Points",
    "Money paid up front to buy a lower rate for the life of the loan.",
  ],
  [
    "Recast",
    "Re-spreading your remaining balance over the remaining term to lower the payment.",
  ],
  [
    "DTI",
    "Debt-to-income — the ratio lenders use to decide how much you can borrow.",
  ],
  [
    "Conforming loan",
    "A loan small enough to be sold to Fannie Mae or Freddie Mac.",
  ],
];

// ── Schema — technical brief §10. Organization identity only: no Person
// schema, no sameAs. ────────────────────────────────────────────────────────
const appSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Mortgage Payment Calculator",
  url: SITE.url,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

// ── Shared bits ────────────────────────────────────────────────────────────

/** Design guide §4.3 — outlined icon on a pale tint, never a gradient chip. */
function IconTile({
  a,
  bg,
  bd,
  children,
  size = 42,
}: {
  a: string;
  bg: string;
  bd: string;
  children: React.ReactNode;
  size?: number;
}) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center border"
      style={{
        width: size,
        height: size,
        background: bg,
        borderColor: bd,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.5}
        height={size * 0.5}
        fill="none"
        stroke={a}
        strokeWidth={1.8}
        strokeLinecap="square"
        strokeLinejoin="miter"
      >
        {children}
      </svg>
    </span>
  );
}

/** Design guide §3.3 — heading left, intro beside it, hairline underneath. */
function SectionHead({ title, intro }: { title: string; intro: string }) {
  return (
    <div className="mb-6 grid items-end gap-y-2 gap-x-12 border-b-rule border-line-strong pb-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <h2 className="text-[clamp(1.5rem,3.6vw,2rem)] font-extrabold tracking-[-.03em] text-ink">
        {title}
      </h2>
      <p className="text-[0.95rem] leading-relaxed text-muted">{intro}</p>
    </div>
  );
}

export default function Home() {
  return (
    <CalcProvider>
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        {/* ── Banner ─────────────────────────────────────────────── */}
        <section className="banner">
          <div className="relative mx-auto max-w-wrap px-[var(--gutter)] pb-12 pt-[clamp(1.6rem,4vw,2.6rem)]">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-end">
              <div>
                <p className="tag inline-flex items-center gap-2 bg-white/12 text-white/90">
                  <span className="h-1.5 w-1.5 bg-[var(--gold-dark)]" />
                  No lender pays us
                </p>
                <h1 className="mt-3 text-[clamp(1.95rem,5.2vw,2.95rem)] font-extrabold leading-[1.06] tracking-[-.035em]">
                  Your mortgage payment is more than principal and interest
                </h1>
                <p className="mt-3 max-w-lede text-[1.02rem] leading-relaxed text-white/80">
                  Principal and interest is only part of what leaves your
                  account. This shows the whole payment, who actually receives
                  each piece, and which parts an interest rate cannot touch —
                  and it updates as you type, with nothing to submit.
                </p>
              </div>

              {/* Design guide §3.4 — never a headline on one side and empty
                  space on the other. */}
              <ul className="grid grid-cols-2 gap-x-5 gap-y-3 text-[0.88rem] text-white/80">
                {[
                  "Updates as you type",
                  "Nothing leaves your browser",
                  "No quotes, no lead forms",
                  "Every formula published",
                ].map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 bg-[var(--gold-dark)]"
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7">
              <PaymentCalculator />
            </div>
          </div>
        </section>

        {/* ── What the payment is made of ────────────────────────── */}
        <section className="bg-paper py-[clamp(2.2rem,5vw,3.6rem)]">
          <div className="mx-auto max-w-wrap px-[var(--gutter)]">
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
          </div>
        </section>

        {/* ── Live price table ───────────────────────────────────── */}
        <PriceTable />

        {/* ── Extra-payment teaser, handing off to the payoff page ─ */}
        <ExtraPaymentTeaser />

        {/* ── Three steps ────────────────────────────────────────── */}
        <section className="bg-mint py-[clamp(2.2rem,5vw,3.6rem)]">
          <div className="mx-auto max-w-wrap px-[var(--gutter)]">
            <SectionHead
              title="Three steps, about a minute"
              intro="There is no account, no email and nothing to submit. The whole thing runs in your browser, so the moment you change a number every figure on the page moves with it."
            />
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {STEPS.map((s) => (
                <li
                  key={s.no}
                  className="border border-line bg-surface p-5"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[.13em] text-muted">
                    {s.no}
                  </p>
                  <span className="mt-3 block">
                    <IconTile a={s.a} bg={s.bg} bd={s.bd}>
                      {s.icon}
                    </IconTile>
                  </span>
                  <h3 className="mt-3 text-[1.02rem] font-[660] tracking-tight text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-[0.91rem] leading-relaxed text-ink-2">
                    {s.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Tool grid ──────────────────────────────────────────── */}
        <section className="py-[clamp(2.2rem,5vw,3.6rem)]">
          <div className="mx-auto max-w-wrap px-[var(--gutter)]">
            <SectionHead
              title="Every calculator answers one question"
              intro="One tool per page, so nothing is buried under a second form. Each one shows the working, not just the answer."
            />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TOOLS.map((t) => {
                const inner = (
                  <>
                    {t.flag && (
                      <span className="tag absolute right-3 top-3 bg-paper-2 text-muted">
                        {t.flag}
                      </span>
                    )}
                    <IconTile a={t.a} bg={t.bg} bd={t.bd}>
                      {t.icon}
                    </IconTile>
                    <h3 className="mt-3 text-[1.02rem] font-[660] tracking-tight text-ink">
                      {t.title}
                    </h3>
                    <p className="mt-1.5 text-[0.91rem] leading-relaxed text-ink-2">
                      {t.body}
                    </p>
                    <p className="mt-3 text-[0.85rem] text-muted">
                      {t.question}
                      {t.href ? " →" : ""}
                    </p>
                  </>
                );

                return (
                  <li key={t.title}>
                    {t.href ? (
                      <Link
                        href={t.href}
                        className="relative flex h-full min-h-tap flex-col border border-line bg-surface p-5 transition-colors duration-150 hover:border-accent"
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div className="relative flex h-full flex-col border border-dashed border-line bg-surface/60 p-5">
                        {inner}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ── How it's calculated ────────────────────────────────── */}
        <section className="bg-paper py-[clamp(2.2rem,5vw,3.6rem)]">
          <div className="mx-auto max-w-wrap px-[var(--gutter)]">
            <SectionHead
              title="How the payment is calculated"
              intro="No part of this is proprietary. It is one formula, and you can check our arithmetic against it."
            />

            {/* Design guide §3.4 — this block used to be a single column with
                dead space beside it. */}
            <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
              <div className="space-y-4 text-ink-2">
                <p className="max-w-prose">
                  Principal and interest come from the standard amortization
                  formula. Everything else is an annual figure divided by
                  twelve.
                </p>
                <div className="num border border-line bg-surface px-5 py-4 text-center text-[0.95rem] text-ink">
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
                <h3 className="text-[1.05rem] font-[660] tracking-tight text-ink">
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
                  className="border-l-[3px] border border-line bg-[var(--indigo-soft)] p-4 text-[0.92rem] leading-relaxed"
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
          </div>
        </section>

        {/* ── The one dark band — design guide §3.2 ──────────────── */}
        <section className="bg-ink-deep py-[clamp(2.2rem,5vw,3.6rem)] text-white">
          <div className="mx-auto grid max-w-wrap gap-8 px-[var(--gutter)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-start">
            <div>
              <h2 className="max-w-[24ch] text-[clamp(1.32rem,3.1vw,1.85rem)] font-[660] leading-tight tracking-tight">
                This calculator has nothing to sell you
              </h2>
              <p className="mt-3 max-w-lede leading-relaxed text-white/75">
                Most large mortgage sites disclose, in their own advertiser
                policies, that they earn money when a visitor is passed to a
                lender. That is not a secret and it is not a conspiracy. But it
                does shape which numbers a page emphasizes, and which it leaves
                out.
              </p>
              <p className="mt-3 max-w-lede leading-relaxed text-white/75">
                This site carries no lender links, no quote buttons, and no
                affiliate relationships. It is funded by ads, which means we are
                paid the same whether or not you ever take out a loan. There is
                nothing here to submit, because there is nothing we want from
                you.
              </p>
            </div>

            {/* Design guide §3.4 — the right slot is always filled. */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.13em] text-white/55">
                What you will never find here
              </p>
              <ul className="mt-3 space-y-2 text-[0.94rem] text-white/75">
                {[
                  "rate quote buttons",
                  "“get pre-approved” forms",
                  "lender affiliate links",
                  "accounts, and no email required",
                  "data sold, shared or handed to a lender",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <strong className="font-semibold text-white">No</strong>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <section className="py-[clamp(2.2rem,5vw,3.6rem)]">
          <div className="mx-auto max-w-wrap px-[var(--gutter)]">
            <SectionHead
              title="Questions people actually ask"
              intro="Short answers. Longer ones are linked where a full page exists."
            />
            {/* Native <details> — design guide §7. Works without JavaScript
                and prints open. */}
            <div className="grid gap-x-10 md:grid-cols-2 md:items-start">
              {[FAQS.slice(0, 5), FAQS.slice(5)].map((column, i) => (
                <div key={i}>
                  {column.map((f) => (
                    <details
                      key={f.q}
                      className="group border-b border-line py-1"
                    >
                      <summary className="flex min-h-tap cursor-pointer list-none items-center justify-between gap-3 py-2 text-[0.98rem] font-[660] text-ink">
                        {f.q}
                        <span
                          aria-hidden="true"
                          className="shrink-0 text-muted transition-transform duration-150 group-open:rotate-45"
                        >
                          +
                        </span>
                      </summary>
                      <p className="max-w-prose pb-3 text-[0.92rem] leading-relaxed text-ink-2">
                        {f.a}
                      </p>
                    </details>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Glossary ───────────────────────────────────────────── */}
        <section className="bg-paper py-[clamp(2.2rem,5vw,3.6rem)]">
          <div className="mx-auto max-w-wrap px-[var(--gutter)]">
            <SectionHead
              title="Mortgage words, in plain English"
              intro="If a term shows up anywhere on this site without an explanation, that is a mistake and we want to hear about it."
            />
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {GLOSSARY.map(([term, def]) => (
                <div
                  key={term}
                  className="border border-line bg-surface p-4"
                >
                  <dt className="text-[0.95rem] font-[660] text-ink">{term}</dt>
                  <dd className="mt-1 text-[0.9rem] leading-relaxed text-ink-2">
                    {def}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Review meta ────────────────────────────────────────── */}
        <section className="py-[clamp(1.6rem,3.5vw,2.4rem)]">
          <div className="mx-auto max-w-wrap px-[var(--gutter)]">
            <p className="text-[0.85rem] text-muted">
              Last reviewed{" "}
              <time className="num" dateTime={LAST_REVIEWED}>
                {LAST_REVIEWED}
              </time>
              . Estimates only — not financial advice, and not a loan offer.
            </p>
          </div>
        </section>
      </main>
    </CalcProvider>
  );
}
