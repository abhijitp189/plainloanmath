import type { Metadata } from "next";
import Link from "next/link";
import { LAST_REVIEWED, SITE } from "@/lib/constants";
import PayoffCalculator from "@/components/PayoffCalculator";
import Disclaimer from "@/components/Disclaimer";
import { breadcrumbSchema } from "@/components/PageChrome";
import { PAYOFF_PATH, PAYMENT_PATH } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Mortgage Payoff Calculator with Extra Payments",
  description:
    "See how much time and interest an extra monthly payment takes off your mortgage. Shows the formula and the year-by-year balance.",
  alternates: { canonical: PAYOFF_PATH },
};

// Technical brief §10 makes WebApplication schema on calculator pages and
// BreadcrumbList on inner pages non-negotiable. This page had neither — it
// shipped before the rule was written down and nothing went back for it.
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

export default function MortgagePayoffPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema("Payoff with extra payments", PAYOFF_PATH),
          ),
        }}
      />

      {/* Same stripe as the payment calculator. This page used to open with a
          plain heading on white, which made the two calculators look like they
          came from different sites. Design guide §8.4 — every page opens with
          a banner or stripe, right slot filled. */}
      <section className="banner">
        <div className="relative mx-auto max-w-wrap px-[var(--gutter)] pb-11 pt-[clamp(1.1rem,2.8vw,1.7rem)]">
          <nav aria-label="Breadcrumb" className="text-[0.85rem] text-white/70">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="underline-offset-2 hover:underline">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">&rsaquo;</li>
              <li aria-current="page" className="text-white/85">
                Payoff with extra payments
              </li>
            </ol>
          </nav>

          <div className="mt-[1.05rem] grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] lg:items-stretch">
            <div>
              <p className="tag inline-flex items-center gap-2 bg-white/12 text-white/90">
                <span className="h-1.5 w-1.5 bg-[var(--gold-dark)]" />
                Payoff calculator
              </p>
              <h1 className="mt-3 text-[clamp(1.85rem,4.6vw,2.7rem)] font-extrabold leading-[1.08] tracking-[-.035em]">
                Mortgage payoff calculator with extra payments
              </h1>
              <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-white/80">
                How much does paying a little extra each month actually save?
                Add any amount and see the payoff date move, along with the
                interest you never hand over.
              </p>
            </div>

            <div className="flex flex-col justify-center border-white/20 lg:border-l lg:pl-8">
              <p className="label text-white/60">Related</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {[
                  { href: PAYMENT_PATH, label: "Monthly payment" },
                  { href: "/methodology/", label: "Methodology" },
                ].map((s) => (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      className="inline-flex min-h-tap items-center border border-white/25 bg-white/10 px-3.5 text-[0.88rem] text-white/90 transition-colors duration-150 hover:bg-white/20"
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-wrap px-[var(--gutter)] py-12">
      <PayoffCalculator />

      <Disclaimer />

      <section className="mt-14 border-t border-line pt-10">
        <h2 className="text-[clamp(1.35rem,3vw,1.65rem)] font-extrabold tracking-[-.03em] text-ink">
          Why an extra payment does so much
        </h2>
        <div className="mt-4 space-y-4 text-ink-2">
          <p>
            Every month, interest is charged on whatever you still owe. Your
            scheduled payment covers that interest first, and only what is left
            over reduces the balance. Early in a thirty-year loan the balance is
            large, so almost the whole payment goes to interest and barely any
            of it to principal.
          </p>
          <p>
            An extra payment skips that queue entirely. It is applied straight
            to the principal, which means the balance is smaller for every
            single month that follows — and so is the interest charged on it.
            The saving is not the extra payment itself. It is all the interest
            that never gets charged on the money you paid off early.
          </p>
          <p>
            That is why the effect compounds so strongly. A modest extra amount
            applied from the start of a long loan removes years from the term,
            because each early dollar of principal avoids decades of interest.
            The same dollar paid in year twenty-five saves almost nothing.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-[clamp(1.35rem,3vw,1.65rem)] font-extrabold tracking-[-.03em] text-ink">
          The formula
        </h2>
        <div className="mt-4 space-y-4 text-ink-2">
          <p>The scheduled monthly payment on a fixed-rate loan is:</p>
          <div className="border border-line bg-paper px-5 py-4 font-mono text-sm text-ink">
            M = P &times; r(1 + r)<sup>n</sup> &divide; ((1 + r)<sup>n</sup>
            &minus; 1)
          </div>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="font-semibold text-ink">M</strong> — the
              monthly payment, principal and interest only
            </li>
            <li>
              <strong className="font-semibold text-ink">P</strong> — the amount
              borrowed
            </li>
            <li>
              <strong className="font-semibold text-ink">r</strong> — the
              monthly interest rate, which is the annual rate divided by 12
            </li>
            <li>
              <strong className="font-semibold text-ink">n</strong> — the number
              of monthly payments in the term
            </li>
          </ul>
          <p>
            The calculator then runs the loan one month at a time. Each month it
            charges interest on the opening balance, applies the payment to that
            interest first, puts the remainder plus your extra payment against
            the principal, and repeats until the balance reaches zero. It runs
            the same loan twice — once with the extra payment and once without —
            and reports the difference.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-[clamp(1.35rem,3vw,1.65rem)] font-extrabold tracking-[-.03em] text-ink">
          What this calculator leaves out
        </h2>
        <div className="mt-4 space-y-4 text-ink-2">
          <p>
            These figures are principal and interest only. Your actual monthly
            payment will also include property taxes, homeowners insurance, and
            possibly mortgage insurance and HOA dues — often several hundred
            dollars more.
          </p>
          <p>
            It assumes a fixed rate for the whole term, payments made on time,
            and that your lender applies extra payments to principal
            immediately. That last one is worth confirming: some lenders hold
            extra money and apply it to the next scheduled payment instead,
            which saves you nothing. Ask, and tell them in writing to apply
            extras to principal.
          </p>
          <p>
            A small number of loans carry prepayment penalties. Check your note
            before making large extra payments.
          </p>
        </div>
      </section>

      <section className="mt-14 border-t border-line pt-8">
        <h2 className="label">
          Related
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          <li>
            <Link href={PAYMENT_PATH} className="btn btn-secondary">
              What your full monthly payment is made of
            </Link>
          </li>
          <li>
            <Link
              href="/methodology/"
              className="btn btn-secondary"
            >
              How every figure on this site is calculated
            </Link>
          </li>
        </ul>
      </section>

      <p className="mt-10 text-[0.85rem] text-muted">
        Last reviewed <time className="num" dateTime={LAST_REVIEWED}>{LAST_REVIEWED}</time>
      </p>
      </div>
    </main>
  );
}
