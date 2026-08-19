"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { comparePayoff, formatUSD, formatDuration } from "@/lib/mortgage";
import { useCalcSnapshot } from "@/components/CalcState";
import { PAYOFF_PATH, payoffHref } from "@/lib/routes";
import { SectionHead } from "@/components/PageChrome";

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
        <SectionHead
          title="What if you paid a little extra?"
          intro="Same loan as above. Anything you add on top of the required payment goes straight to the balance, which is why a small amount moves the payoff date so much further than people expect."
        />

        <div className="panel p-5 sm:p-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-10">
          <div>
            <p className="label">Extra each month</p>
            {/* Segmented control, matching the payoff page it hands off to.
                Preset chips only, never an input field — project brief §8:
                two calculators on one page is a competitor weakness, and the
                moment this takes typed input it has become the second one. */}
            <div className="seg mt-2">
              {PRESETS.map((p) => (
                <label key={p} className="seg-opt">
                  <input
                    type="radio"
                    name="teaser-extra"
                    checked={p === extra}
                    onChange={() => setExtra(p)}
                  />
                  <span className="num">${p}</span>
                </label>
              ))}
            </div>
            <p className="mt-3 max-w-prose text-[0.9rem] leading-relaxed text-ink-2">
              On{" "}
              <span className="num">{formatUSD(loanAmount)}</span> at{" "}
              <span className="num">{Number(ratePct.toFixed(3))}%</span> over{" "}
              <span className="num">{Math.round(termYears)}</span> years. Your
              required payment does not change. The loan just ends sooner.
            </p>
          </div>

          {/* Fixed height so the panel never jumps while the figures update.
              Design guide §5.1. */}
          <div className="mt-5 min-h-[150px] lg:mt-0">
            {usable ? (
              <>
                <p className="label">Interest you would not pay</p>
                {/* Design guide §1.3 — brass, and only here. */}
                <p className="figure-xl mt-1 text-brass">
                  {formatUSD(result.interestSaved)}
                </p>
                <p className="mt-2 text-[0.95rem] text-ink-2">
                  Paid off{" "}
                  <strong className="num font-semibold text-ink">
                    {formatDuration(result.monthsSaved)}
                  </strong>{" "}
                  sooner, in{" "}
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
                  className="btn btn-primary mt-4"
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
