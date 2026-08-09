"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { comparePayoff, formatUSD, formatDuration } from "@/lib/mortgage";
import { useCalcSnapshot } from "@/components/CalcState";
import { PAYOFF_PATH, payoffHref } from "@/lib/routes";

// The bridge between the two calculators.
//
// This deliberately does NOT become a second calculator. It answers one
// question — "what would an extra payment do?" — on the visitor's own numbers,
// then hands off. The schedule, the chart, the invest-instead panel and the
// CSV all stay on the payoff page, which is the page that has to rank for
// "mortgage payoff calculator with extra payments".
//
// Project brief §8: "two calculators on one page" is a competitor weakness.
// Preset chips only, no input field, so this stays a preview and not a tool.

const PRESETS = [100, 200, 500];

export default function ExtraPaymentTeaser() {
  const { ratePct, termYears, loanAmount } = useCalcSnapshot();
  const [extra, setExtra] = useState(200);

  const result = useMemo(() => {
    const termMonths = Math.max(Math.round(termYears * 12), 1);
    if (loanAmount <= 0 || ratePct < 0) return null;
    return comparePayoff(loanAmount, ratePct, termMonths, extra);
  }, [loanAmount, ratePct, termYears, extra]);

  const usable = result !== null && result.monthsSaved > 0;

  return (
    <section className="py-[clamp(2.2rem,5vw,3.6rem)]">
      <div className="mx-auto max-w-wrap px-[var(--gutter)]">
        <div className="mb-6 grid items-end gap-y-2 gap-x-12 border-b border-line pb-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <h2 className="text-[clamp(1.32rem,3.1vw,1.85rem)] font-[660] tracking-tight text-ink">
            What if you paid a little extra?
          </h2>
          <p className="text-[0.95rem] leading-relaxed text-muted">
            Same loan as above. Anything you add on top of the required payment
            goes straight to the balance, which is why a small amount moves the
            payoff date so much further than people expect.
          </p>
        </div>

        <div className="rounded-card border border-line bg-surface p-5 sm:p-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.13em] text-muted">
              Extra each month
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESETS.map((p) => {
                const on = p === extra;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setExtra(p)}
                    aria-pressed={on}
                    className={`num min-h-tap rounded-full border px-4 text-[0.95rem] transition-colors duration-150 ${
                      on
                        ? "border-accent bg-accent-soft font-semibold text-accent-dk"
                        : "border-line text-ink-2 hover:border-accent"
                    }`}
                  >
                    ${p}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 max-w-prose text-[0.9rem] leading-relaxed text-ink-2">
              On{" "}
              <span className="num">{formatUSD(loanAmount)}</span> at{" "}
              <span className="num">{Number(ratePct.toFixed(3))}%</span> over{" "}
              <span className="num">{Math.round(termYears)}</span> years. Your
              required payment does not change — the loan just ends sooner.
            </p>
          </div>

          {/* Fixed height so the panel never jumps while the figures update.
              Design guide §5.1. */}
          <div className="mt-5 min-h-[150px] lg:mt-0">
            {usable ? (
              <>
                <p className="text-[11px] font-bold uppercase tracking-[.13em] text-muted">
                  Interest you would not pay
                </p>
                {/* Design guide §1.3 — brass, and only here. */}
                <p className="num mt-1 text-[clamp(2rem,6vw,2.8rem)] font-[640] leading-none text-brass">
                  {formatUSD(result.interestSaved)}
                </p>
                <p className="mt-2 text-[0.95rem] text-ink-2">
                  Paid off{" "}
                  <strong className="num font-semibold text-ink">
                    {formatDuration(result.monthsSaved)}
                  </strong>{" "}
                  sooner &mdash; in{" "}
                  <span className="num">
                    {formatDuration(result.accelerated.months)}
                  </span>{" "}
                  instead of{" "}
                  <span className="num">
                    {formatDuration(result.baseline.months)}
                  </span>
                  .
                </p>
                <Link
                  href={payoffHref({
                    loanAmount,
                    ratePct,
                    termYears,
                    extra,
                  })}
                  className="mt-4 inline-flex min-h-tap items-center rounded-md bg-accent px-4 text-[0.95rem] font-semibold text-white transition-colors duration-150 hover:bg-accent-dk"
                >
                  See the full schedule and chart →
                </Link>
                <p className="mt-2 text-[0.82rem] text-muted">
                  Opens the payoff calculator with these numbers already filled
                  in.
                </p>
              </>
            ) : (
              <p className="text-[0.95rem] text-muted">
                Enter a loan amount above to see what an extra payment would
                do.{" "}
                <Link
                  href={PAYOFF_PATH}
                  className="text-accent-dk underline decoration-line-strong underline-offset-2 hover:decoration-accent"
                >
                  Open the payoff calculator
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
