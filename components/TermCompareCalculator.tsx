"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  compareTerms,
  balanceAtMonth,
  formatUSD,
  formatDuration,
  type TermCompareResult,
} from "@/lib/mortgage";
import ResultActions from "@/components/ResultActions";
import CalcField from "@/components/CalcField";
import { CalcSelect } from "@/components/CalcField";
import SavingSplitBars from "@/components/SavingSplitBars";
import { encodeParams, readNum, syncAddressBar } from "@/lib/share";
import { csvCell } from "@/lib/csv";
import { EXAMPLE, EXAMPLE_SHORT_RATE_PCT } from "@/lib/constants";

// Everything here runs in the browser. Nothing the visitor types is sent
// anywhere, which is what the privacy policy promises.
//
// WHAT THIS PAGE DOES THAT THE COMPETITION DOES NOT. Every 15-versus-30 tool
// checked on August 18, 2026 reports one number: the interest on the long loan
// minus the interest on the short one. That number conflates two completely
// different things. Most of it is caused by the borrower paying several
// hundred dollars more every month, which they can do on either loan. Only a
// slice of it is caused by the shorter loan's lower rate, which is the only
// part the choice of loan actually decides. This tool splits them.

const DEBOUNCE_MS = 90; // Design guide §6.

/**
 * Starting scenario, so the reader sees a working comparison on arrival
 * (state 1, design guide §4.12) rather than an empty panel.
 *
 * The site's recurring example loan, and a shorter-loan rate DERIVED from it
 * in lib/constants.ts rather than typed here, so the two rates keep a real
 * gap between them instead of a made-up one. Both are prefilled inputs the
 * reader overwrites, not claims about the market.
 */
const START = {
  loan: EXAMPLE.loanAmount,
  shortRate: EXAMPLE_SHORT_RATE_PCT,
  longRate: EXAMPLE.annualRatePct,
  shortYears: 15,
  longYears: 30,
};

const URL_DEFAULTS = {
  loan: START.loan,
  s: START.shortRate,
  l: START.longRate,
  st: START.shortYears,
  lt: START.longYears,
};

const TERM_OPTIONS = [10, 15, 20, 25, 30, 40];

/** Strips commas and currency symbols so pasted figures still parse. */
function num(value: string): number {
  const n = parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export default function TermCompareCalculator() {
  const [loan, setLoan] = useState(START.loan.toLocaleString("en-US"));
  const [shortRate, setShortRate] = useState(String(START.shortRate));
  const [longRate, setLongRate] = useState(String(START.longRate));
  const [shortYears, setShortYears] = useState(START.shortYears);
  const [longYears, setLongYears] = useState(START.longYears);

  // Read the query string after mount, never during render: the page is
  // statically exported, the server has no query string, and reading it in
  // render produces a hydration mismatch (technical brief §8.7).
  const hydrated = useRef(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const a = readNum(q, "loan", { min: 1 });
    const s = readNum(q, "s", { min: 0, max: 30 });
    const l = readNum(q, "l", { min: 0, max: 30 });
    const st = readNum(q, "st", { min: 1, max: 50 });
    const lt = readNum(q, "lt", { min: 1, max: 50 });

    if (a !== null) setLoan(a.toLocaleString("en-US"));
    if (s !== null) setShortRate(String(s));
    if (l !== null) setLongRate(String(l));
    if (st !== null) setShortYears(st);
    if (lt !== null) setLongYears(lt);

    hydrated.current = true;
  }, []);

  const amount = num(loan);
  const shortPct = num(shortRate);
  const longPct = num(longRate);

  // The address bar tracks the inputs on the same debounce as the figures, so
  // Share always copies a link reproducing what is on screen. Guarded until
  // the incoming read has run, or first paint wipes an arriving share link.
  useEffect(() => {
    if (!hydrated.current) return;
    const t = setTimeout(() => {
      syncAddressBar(
        encodeParams(
          {
            loan: amount,
            s: shortPct,
            l: longPct,
            st: shortYears,
            lt: longYears,
          },
          URL_DEFAULTS,
        ),
      );
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [amount, shortPct, longPct, shortYears, longYears]);

  const inputs = useMemo(
    () => ({
      loanAmount: amount,
      shortRatePct: shortPct,
      longRatePct: longPct,
      shortTermMonths: Math.round(shortYears * 12),
      longTermMonths: Math.round(longYears * 12),
    }),
    [amount, shortPct, longPct, shortYears, longYears],
  );

  const out = useMemo(() => compareTerms(inputs), [inputs]);

  // STATE 2, mid-edit. A momentarily empty or half-typed field must not blank
  // the panel or flash. Hold the last complete result and keep rendering it;
  // the figures catch up on the next valid keystroke.
  const lastGood = useRef<TermCompareResult | null>(null);
  if (out) lastGood.current = out;
  const shown = out ?? lastGood.current;

  // STATE 3, impossible input. Separated from the real answers below, which
  // include "the shorter loan costs you more" and "the two are identical".
  const unusable = !out && !lastGood.current;

  // The shorter term must be shorter. Said in words next to the control rather
  // than silently swapping the two, which would move the reader's figures
  // under them.
  const termsInverted = shortYears >= longYears;

  function buildCsv(): string {
    if (!shown) return "";
    const rows: string[][] = [
      ["Plain Loan Math: 15-year vs 30-year"],
      ["Loan amount", String(Math.round(amount))],
      ["Shorter term (years)", String(shortYears)],
      ["Rate on the shorter loan (nominal annual %)", String(shortPct)],
      ["Longer term (years)", String(longYears)],
      ["Rate on the longer loan (nominal annual %)", String(longPct)],
      [],
      ["Payment, shorter loan", shown.shortLoan.monthlyPayment.toFixed(2)],
      ["Payment, longer loan", shown.longLoan.monthlyPayment.toFixed(2)],
      ["Extra per month to take the shorter loan", shown.paymentStepUp.toFixed(2)],
      [],
      ["Total interest, shorter loan", shown.shortLoan.totalInterest.toFixed(2)],
      ["Total interest, longer loan", shown.longLoan.totalInterest.toFixed(2)],
      [
        "Total interest, longer loan paid at the shorter loan's payment",
        shown.longMatched.totalInterest.toFixed(2),
      ],
      [
        "Months to pay off the longer loan at the shorter loan's payment",
        String(shown.matchedMonths),
      ],
      [],
      [
        "Headline saving as other calculators report it",
        shown.headlineSaving.toFixed(2),
      ],
      [
        "Of which caused by the shorter loan's rate",
        shown.rateEffect.toFixed(2),
      ],
      [
        "Of which caused by paying more each month",
        shown.behaviorEffect.toFixed(2),
      ],
      [],
      [
        "Month",
        "Balance, shorter loan",
        "Balance, longer loan at the shorter payment",
        "Balance, longer loan at its own payment",
      ],
    ];
    const last = Math.max(
      shown.shortLoan.months,
      shown.longLoan.months,
      shown.matchedMonths,
    );
    for (let m = 1; m <= last; m++) {
      rows.push([
        String(m),
        balanceAtMonth(shown.shortLoan, m).toFixed(2),
        balanceAtMonth(shown.longMatched, m).toFixed(2),
        balanceAtMonth(shown.longLoan, m).toFixed(2),
      ]);
    }
    // Escaped, not joined raw: eight of the labels above contain commas.
    return rows.map((r) => r.map(csvCell).join(",")).join("\n");
  }

  /** Years at which the "if you moved" table reports, capped at the terms. */
  const marks = [5, 10, 15].filter((y) => y * 12 <= longYears * 12);

  return (
    <div className="mt-8">
      {/* `.calc` sets an explicit text color — the white-on-white guard,
          design guide §4.2. This band is color:#fff. */}
      <div className="calc panel lg:grid lg:grid-cols-[minmax(320px,390px)_1fr]">
        {/* ── Inputs ─────────────────────────────────────────────── */}
        <div className="border-b-rule border-line-strong p-5 sm:p-6 lg:border-b-0 lg:border-r-rule">
          <p className="label text-accent">The loan</p>
          <p className="mt-2 text-[0.84rem] leading-relaxed text-muted">
            The same amount borrowed either way. What changes is how long you
            have to pay it back, and the rate that comes with it.
          </p>

          <div className="mt-3.5">
            <CalcField
              id="term-loan"
              label="Amount you are borrowing"
              value={loan}
              prefix="$"
              onChange={setLoan}
              onBlur={() =>
                setLoan(
                  num(loan) > 0 ? num(loan).toLocaleString("en-US") : loan,
                )
              }
            />
          </div>

          <p className="label mt-6 text-accent">The shorter loan</p>
          <div className="mt-3.5 grid grid-cols-2 gap-3">
            <CalcSelect
              id="term-short-years"
              label="Term"
              value={String(shortYears)}
              onChange={(v) => setShortYears(Number(v))}
              options={TERM_OPTIONS.map((y) => ({
                value: String(y),
                label: `${y} years`,
              }))}
            />
            <CalcField
              id="term-short-rate"
              label="Rate"
              value={shortRate}
              suffix="%"
              onChange={setShortRate}
            />
          </div>

          <p className="label mt-6 text-accent">The longer loan</p>
          <div className="mt-3.5 grid grid-cols-2 gap-3">
            <CalcSelect
              id="term-long-years"
              label="Term"
              value={String(longYears)}
              onChange={(v) => setLongYears(Number(v))}
              options={TERM_OPTIONS.map((y) => ({
                value: String(y),
                label: `${y} years`,
              }))}
            />
            <CalcField
              id="term-long-rate"
              label="Rate"
              value={longRate}
              suffix="%"
              onChange={setLongRate}
            />
          </div>

          {termsInverted && (
            <p className="mt-3 text-[0.83rem] leading-relaxed text-ink-2">
              The shorter loan needs a term below the longer one. Change one of
              the two to see the comparison.
            </p>
          )}

          <p className="mt-5 text-[0.8rem] leading-relaxed text-muted">
            Use the rates you have actually been quoted. Shorter loans normally
            carry a lower rate, and how much lower is the whole question this
            page answers, so a guess here changes the answer.
          </p>
        </div>

        {/* ── Results ────────────────────────────────────────────── */}
        {/* Fixed minimum height so nothing jumps mid-keystroke. */}
        <div className="min-h-[34rem] p-5 sm:p-6">
          {unusable ? (
            <div className="flex h-full min-h-[24rem] items-center">
              <p className="max-w-prose text-[0.95rem] leading-relaxed text-ink-2">
                Enter the amount you are borrowing and a rate for each term to
                see what the shorter loan is really worth.
              </p>
            </div>
          ) : (
            shown && (
              <>
                <p className="label text-accent">
                  What the shorter loan itself saves you
                </p>

                {/* THE DIFFERENTIATOR, and it is on the first screen rather
                    than buried in section six (§8.4).

                    NOT `.figure-note`, which is brass. This figure is money
                    the reader does not pay, so brass would be correct by
                    §1.3 — but the two bars below are already brass carrying
                    that meaning, and a brass headline plus brass bars plus a
                    brass hatch is the color doing three jobs on one screen
                    even though all three mean the same thing. Ink here, brass
                    reserved for the chart, same call the refinance page made. */}
                {shown.rateEffect >= 0 ? (
                  <>
                    <p className="num mt-2 text-[clamp(1.6rem,5vw,2.3rem)] font-bold leading-none tracking-[-0.03em] text-ink">
                      {formatUSD(shown.rateEffect)}
                    </p>
                    <p className="mt-2 max-w-prose text-[0.9rem] leading-relaxed text-ink-2">
                      That is the interest the lower rate on the{" "}
                      <span className="num">{shortYears}</span>-year loan
                      saves. Other calculators report{" "}
                      <span className="num font-bold text-ink">
                        {formatUSD(shown.headlineSaving)}
                      </span>
                      , because they compare it against a{" "}
                      <span className="num">{longYears}</span>-year loan paid
                      at the smaller amount.
                    </p>
                  </>
                ) : (
                  <>
                    {/* Deliberately NOT `.num`. Every figure on this site is
                        mono and tabular (§2.3), but this is a word standing in
                        for a figure, and mono on a word reads as a defect. */}
                    <p className="mt-2 text-[clamp(1.6rem,5vw,2.3rem)] font-bold leading-none tracking-[-0.03em] text-ink">
                      Nothing
                    </p>
                    <p className="mt-2 max-w-prose text-[0.9rem] leading-relaxed text-ink-2">
                      At these rates the shorter loan costs you{" "}
                      <span className="num font-bold text-ink">
                        {formatUSD(-shown.rateEffect)}
                      </span>{" "}
                      more in interest, not less, because you have entered a
                      higher rate on it. Paying the{" "}
                      <span className="num">{longYears}</span>-year loan at the
                      same monthly amount clears it for less.
                    </p>
                  </>
                )}

                {/* Neutral `--line-strong` on `--paper-2`, design guide §4.9's
                    treatment for a block that explains rather than warns. */}
                <div className="mt-5 border-l-[3px] border-line-strong bg-paper-2 p-4">
                  <p className="label">The rest of that number</p>
                  <p className="mt-1.5 max-w-prose text-[0.92rem] leading-relaxed text-ink-2">
                    <span className="num font-bold text-ink">
                      {formatUSD(shown.behaviorEffect)}
                    </span>{" "}
                    of it comes from paying{" "}
                    <span className="num font-bold text-ink">
                      {formatUSD(shown.paymentStepUp)}
                    </span>{" "}
                    more every month, and you can do that on the{" "}
                    <span className="num">{longYears}</span>-year loan. Paid at{" "}
                    <span className="num">
                      {formatUSD(shown.shortLoan.monthlyPayment)}
                    </span>{" "}
                    a month, it clears in{" "}
                    <span className="num">
                      {formatDuration(shown.matchedMonths)}
                    </span>
                    {shown.matchedMonths > shown.shortLoan.months ? (
                      <>
                        , which is{" "}
                        <span className="num">
                          {shown.matchedMonths - shown.shortLoan.months}
                        </span>{" "}
                        months behind the{" "}
                        <span className="num">{shortYears}</span>-year loan.
                      </>
                    ) : (
                      <>, the same as the shorter loan.</>
                    )}
                  </p>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="border-t-rule border-line-strong pt-3">
                    <p className="text-[0.85rem] font-bold text-ink">
                      <span className="num">{shortYears}</span>-year payment
                    </p>
                    <p className="num mt-1 text-[clamp(1.3rem,4vw,1.7rem)] font-bold leading-tight text-ink">
                      {formatUSD(shown.shortLoan.monthlyPayment)}
                    </p>
                    <p className="mt-1 text-[0.8rem] text-muted">
                      Principal and interest only. Required every month, with
                      no option to pay less.
                    </p>
                  </div>

                  <div className="border-t-rule border-line-strong pt-3">
                    <p className="text-[0.85rem] font-bold text-ink">
                      <span className="num">{longYears}</span>-year payment
                    </p>
                    <p className="num mt-1 text-[clamp(1.3rem,4vw,1.7rem)] font-bold leading-tight text-ink">
                      {formatUSD(shown.longLoan.monthlyPayment)}
                    </p>
                    <p className="mt-1 text-[0.8rem] text-muted">
                      <span className="num">
                        {formatUSD(shown.paymentStepUp)}
                      </span>{" "}
                      less. This is the floor you can drop back to if you need
                      it.
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="label">Where the saving comes from</p>
                  <p className="mt-1.5 text-[0.8rem] leading-relaxed text-muted">
                    {shown.rateEffect >= 0 ? (
                      <>
                        Both bars are interest you do not pay, on the same
                        scale. The solid bar is what the shorter loan causes.
                        The hatched bar is what paying more causes, which
                        either loan can do.
                      </>
                    ) : (
                      <>
                        Both bars are on the same scale. The solid bar runs
                        left of the line because the shorter loan costs
                        interest here rather than saving it. The hatched bar is
                        interest you do not pay, from the larger monthly
                        amount, which either loan can do.
                      </>
                    )}
                  </p>
                  <div className="mt-3 min-h-[9rem]">
                    <SavingSplitBars
                      rateEffect={shown.rateEffect}
                      behaviorEffect={shown.behaviorEffect}
                    />
                  </div>
                </div>

                {marks.length > 0 && (
                  <div className="mt-6">
                    <p className="label">If you moved, what you would owe</p>
                    <div className="mt-2 overflow-x-auto" data-print-full>
                      <table className="w-full border-collapse text-[0.85rem]">
                        <thead>
                          <tr className="bg-paper-2">
                            <th className="label px-3 py-2 text-left">After</th>
                            <th className="label px-3 py-2 text-right">
                              {shortYears}-year
                            </th>
                            <th className="label px-3 py-2 text-right">
                              {longYears}-year, paid up
                            </th>
                            <th className="label px-3 py-2 text-right">
                              {longYears}-year, minimum
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {marks.map((y) => (
                            <tr
                              key={y}
                              className="border-b border-line last:border-b-0"
                            >
                              <td className="num px-3 py-2 text-left">
                                {y} years
                              </td>
                              <td className="num px-3 py-2 text-right">
                                {formatUSD(
                                  balanceAtMonth(shown.shortLoan, y * 12),
                                )}
                              </td>
                              <td className="num px-3 py-2 text-right">
                                {formatUSD(
                                  balanceAtMonth(shown.longMatched, y * 12),
                                )}
                              </td>
                              <td className="num px-3 py-2 text-right">
                                {formatUSD(
                                  balanceAtMonth(shown.longLoan, y * 12),
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-2 max-w-prose text-[0.8rem] leading-relaxed text-muted">
                      Balance still owed, so smaller is further ahead. The first
                      two columns cost the same each month.
                    </p>
                  </div>
                )}

                <div className="mt-6">
                  <ResultActions
                    csvFilename="15-vs-30-year-mortgage.csv"
                    buildCsv={buildCsv}
                    note="The CSV carries your figures and the balance on all three loans, month by month."
                  />
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}
