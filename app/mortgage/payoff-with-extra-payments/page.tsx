import type { Metadata } from "next";
import Link from "next/link";
import { LAST_REVIEWED } from "@/lib/constants";
import PayoffCalculator from "@/components/PayoffCalculator";
import Disclaimer from "@/components/Disclaimer";

export const metadata: Metadata = {
  title: "Mortgage Payoff Calculator with Extra Payments",
  description:
    "See how much time and interest an extra monthly payment takes off your mortgage. Shows the formula and the year-by-year balance.",
  alternates: { canonical: "/mortgage/payoff-with-extra-payments/" },
};

export default function MortgagePayoffPage() {
  return (
    <main className="mx-auto max-w-wrap px-[var(--gutter)] py-12">
      <nav aria-label="Breadcrumb" className="text-[0.85rem] text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-accent-dk hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">&rsaquo;</li>
          <li className="text-ink-2">Payoff with extra payments</li>
        </ol>
      </nav>

      <h1 className="mt-3 max-w-[22ch] text-[clamp(1.7rem,4.6vw,2.55rem)] font-[660] leading-[1.12] tracking-[-.02em] text-ink">
        Mortgage Payoff Calculator with Extra Payments
      </h1>
      <p className="mt-3 max-w-lede text-lg text-muted">
        How much does paying a little extra each month actually save?
      </p>

      <PayoffCalculator />

      <Disclaimer />

      <section className="mt-14 border-t border-line pt-10">
        <h2 className="text-xl font-semibold tracking-tight text-ink">
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
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          The formula
        </h2>
        <div className="mt-4 space-y-4 text-ink-2">
          <p>The scheduled monthly payment on a fixed-rate loan is:</p>
          <div className="rounded-lg border border-line bg-paper px-5 py-4 font-mono text-sm text-ink">
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
        <h2 className="text-xl font-semibold tracking-tight text-ink">
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
        <h2 className="text-[11px] font-bold uppercase tracking-[.13em] text-muted">
          Related
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          <li>
            <Link
              href="/"
              className="flex min-h-tap items-center rounded-lg border border-line px-4 text-[0.95rem] text-ink-2 transition-colors duration-150 hover:border-accent hover:text-accent-dk"
            >
              What your full monthly payment is made of
            </Link>
          </li>
          <li>
            <Link
              href="/methodology/"
              className="flex min-h-tap items-center rounded-lg border border-line px-4 text-[0.95rem] text-ink-2 transition-colors duration-150 hover:border-accent hover:text-accent-dk"
            >
              How every figure on this site is calculated
            </Link>
          </li>
        </ul>
      </section>

      <p className="mt-10 text-[0.85rem] text-muted">
        Last reviewed <time className="num" dateTime={LAST_REVIEWED}>{LAST_REVIEWED}</time>
      </p>
    </main>
  );
}
