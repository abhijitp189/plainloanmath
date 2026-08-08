import type { Metadata } from "next";
import Link from "next/link";
import PaymentCalculator from "@/components/PaymentCalculator";
import { LAST_REVIEWED, SITE, PMI_SOURCE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Mortgage Calculator — What Your Monthly Payment Is Actually Made Of",
  description:
    "A free mortgage calculator that shows every part of your monthly payment, not just principal and interest. No lender pays us. No quotes, no lead forms.",
  alternates: { canonical: "/" },
};

// WebApplication schema — technical brief §10. Organization identity only:
// no Person schema, no sameAs.
const schema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Mortgage Payment Calculator",
  url: SITE.url,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
};

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

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* ── Banner ─────────────────────────────────────────────── */}
      <section className="banner">
        <div className="relative mx-auto max-w-wrap px-[var(--gutter)] pb-12 pt-[clamp(1.6rem,4vw,2.6rem)]">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[0.73rem] font-semibold uppercase tracking-[.11em]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold-dark)]" />
                No lender pays us
              </p>
              <h1 className="mt-3 text-[clamp(1.7rem,4.6vw,2.55rem)] font-[660] leading-[1.1] tracking-[-.02em]">
                Your mortgage payment is more than principal and interest
              </h1>
              <p className="mt-3 max-w-lede text-[1.02rem] leading-relaxed text-white/80">
                Principal and interest is only part of what leaves your
                account. This shows the whole payment, who actually receives
                each piece, and which parts an interest rate cannot touch — and
                it updates as you type, with nothing to submit.
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
                    className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-[var(--gold-dark)]"
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
          <div className="mb-6 grid items-end gap-y-2 gap-x-12 border-b border-line pb-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <h2 className="text-[clamp(1.32rem,3.1vw,1.85rem)] font-[660] tracking-tight text-ink">
              Where each dollar actually goes
            </h2>
            <p className="text-[0.95rem] leading-relaxed text-muted">
              Only the first of these is money you are paying to borrow. The
              rest pass through the lender to somebody else, which is why the
              interest rate has no effect on them at all.
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COSTS.map((c) => (
              <li
                key={c.title}
                className="rounded-card border-l-[3px] border border-line bg-surface p-4"
                style={{ borderLeftColor: c.color }}
              >
                <h3 className="text-[1.02rem] font-[660] tracking-tight text-ink">
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

      {/* ── How it's calculated ────────────────────────────────── */}
      <section className="py-[clamp(2.2rem,5vw,3.6rem)]">
        <div className="mx-auto max-w-wrap px-[var(--gutter)]">
          <div className="mb-6 grid items-end gap-y-2 gap-x-12 border-b border-line pb-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <h2 className="text-[clamp(1.32rem,3.1vw,1.85rem)] font-[660] tracking-tight text-ink">
              How the payment is calculated
            </h2>
            <p className="text-[0.95rem] leading-relaxed text-muted">
              No part of this is proprietary. It is one formula, and you can
              check our arithmetic against it.
            </p>
          </div>

          <div className="max-w-prose space-y-4 text-ink-2">
            <p>
              Principal and interest come from the standard amortization
              formula. Everything else is an annual figure divided by twelve.
            </p>
            <div className="num rounded-card border border-line bg-paper px-5 py-4 text-[0.95rem] text-ink">
              M = P &times; r(1 + r)<sup>n</sup> &divide; ((1 + r)<sup>n</sup>{" "}
              &minus; 1)
            </div>
            <p>
              <strong className="font-semibold text-ink">P</strong> is the
              amount borrowed, <strong className="font-semibold text-ink">r</strong>{" "}
              is the annual rate divided by twelve, and{" "}
              <strong className="font-semibold text-ink">n</strong> is the
              number of monthly payments. The result is a level amount that
              pays the loan to exactly zero over the term.
            </p>
            <p>
              Mortgage insurance is the one line with a rule behind it rather
              than just arithmetic. For a conventional loan with
              borrower-paid insurance, the Homeowners Protection Act requires
              your servicer to drop it once the scheduled balance reaches 78%
              of the home&rsquo;s original value, or at the midpoint of the
              term, whichever comes first. You can request it at 80%. Both
              depend on being current on your payments, both are measured
              against the original value rather than a later appraisal, and
              loans the lender classifies as high-risk are exempt.{" "}
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
      </section>

      {/* ── The one dark band — design guide §3.2 ──────────────── */}
      <section className="bg-ink-deep py-[clamp(2.2rem,5vw,3.6rem)] text-white">
        <div className="mx-auto max-w-wrap px-[var(--gutter)]">
          <h2 className="max-w-[24ch] text-[clamp(1.32rem,3.1vw,1.85rem)] font-[660] leading-tight tracking-tight">
            This calculator has nothing to sell you
          </h2>
          <p className="mt-3 max-w-lede leading-relaxed text-white/75">
            Most large mortgage sites disclose, in their own advertiser policies,
            that they earn money when a visitor is passed to a lender. That is
            not a secret and it is not a conspiracy. But it does shape which
            numbers a page emphasizes, and which it leaves out.
          </p>
          <p className="mt-3 max-w-lede leading-relaxed text-white/75">
            This site carries no lender links, no quote buttons, and no
            affiliate relationships. It is funded by ads, which means we are
            paid the same whether or not you ever take out a loan. There is
            nothing here to submit, because there is nothing we want from you.
          </p>
        </div>
      </section>

      {/* ── Tools ──────────────────────────────────────────────── */}
      <section className="py-[clamp(2.2rem,5vw,3.6rem)]">
        <div className="mx-auto max-w-wrap px-[var(--gutter)]">
          <h2 className="text-[clamp(1.32rem,3.1vw,1.85rem)] font-[660] tracking-tight text-ink">
            Other calculators
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            <li>
              <Link
                href="/mortgage/payoff-with-extra-payments/"
                className="block rounded-card border border-line p-4 transition-colors duration-150 hover:border-accent"
              >
                <span className="block font-[660] text-ink">
                  Payoff with extra payments
                </span>
                <span className="mt-1 block text-[0.91rem] text-muted">
                  What an extra $200 a month really takes off the term
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/methodology/"
                className="block rounded-card border border-line p-4 transition-colors duration-150 hover:border-accent"
              >
                <span className="block font-[660] text-ink">Methodology</span>
                <span className="mt-1 block text-[0.91rem] text-muted">
                  Every formula on this site, with its sources
                </span>
              </Link>
            </li>
          </ul>

          <p className="mt-8 text-[0.85rem] text-muted">
            Last reviewed{" "}
            <time className="num" dateTime={LAST_REVIEWED}>
              {LAST_REVIEWED}
            </time>
            . Estimates only — not financial advice, and not a loan offer.
          </p>
        </div>
      </section>
    </main>
  );
}
