"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatUSD, formatDuration } from "@/lib/mortgage";
import { payoffVsInvest } from "@/lib/investing";
import {
  EXAMPLE,
  RETURN_TIERS,
  RETURN_DEFAULT_PCT,
} from "@/lib/constants";
import ResultActions from "@/components/ResultActions";
import CalcField from "@/components/CalcField";
import { encodeParams, readNum, syncAddressBar } from "@/lib/share";

// Everything here runs in the browser. Nothing the visitor types is sent
// anywhere, which is what the privacy policy promises.
//
// WHAT THIS PAGE REFUSES TO DO. Every competing tool checked on August 13,
// 2026 names a winner. This one reports both end balances and the return at
// which they tie, and stops there. Naming a winner would be advice framing
// (project brief §18), and the tie point is the more useful number anyway:
// it is a fact about the reader's own loan rather than a view about markets.

const DEBOUNCE_MS = 90; // Design guide §6.

const URL_DEFAULTS = {
  loan: EXAMPLE.loanAmount,
  rate: EXAMPLE.annualRatePct,
  years: EXAMPLE.termYears,
  extra: 250,
  ret: RETURN_DEFAULT_PCT,
};

/** Strips commas and currency symbols so pasted figures still parse. */
function num(value: string): number {
  const n = parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export default function PayoffVsInvestCalculator() {
  const [amount, setAmount] = useState(
    EXAMPLE.loanAmount.toLocaleString("en-US"),
  );
  const [rate, setRate] = useState(String(EXAMPLE.annualRatePct));
  const [years, setYears] = useState(String(EXAMPLE.termYears));
  const [extra, setExtra] = useState("250");
  const [ret, setRet] = useState(String(RETURN_DEFAULT_PCT));

  // Read the query string after mount, never during render: the page is
  // statically exported, the server has no query string, and reading it in
  // render produces a hydration mismatch (technical brief §8.4).
  const hydrated = useRef(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const loan = readNum(q, "loan", { min: 1 });
    const r = readNum(q, "rate", { min: 0, max: 30 });
    const y = readNum(q, "years", { min: 1, max: 50 });
    const x = readNum(q, "extra", { min: 0 });
    const g = readNum(q, "ret", { min: 0, max: 30 });

    if (loan !== null) setAmount(loan.toLocaleString("en-US"));
    if (r !== null) setRate(String(r));
    if (y !== null) setYears(String(y));
    if (x !== null) setExtra(String(x));
    if (g !== null) setRet(String(g));

    hydrated.current = true;
  }, []);

  const principal = num(amount);
  const annualRate = num(rate);
  const termMonths = Math.round(num(years) * 12);
  const extraMonthly = num(extra);
  const returnPct = num(ret);

  // The address bar tracks the inputs on the same debounce as the figures, so
  // Share always copies a link reproducing what is on screen. Guarded until
  // the incoming read has run, or first paint wipes an arriving share link.
  useEffect(() => {
    if (!hydrated.current) return;
    const t = setTimeout(() => {
      syncAddressBar(
        encodeParams(
          {
            loan: principal,
            rate: annualRate,
            years: num(years),
            extra: extraMonthly,
            ret: returnPct,
          },
          URL_DEFAULTS,
        ),
      );
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [principal, annualRate, years, extraMonthly, returnPct]);

  // STATE 3, impossible input. A payment that does not cover the first
  // month's interest never amortizes, so the loan runs forever. Say that in
  // words rather than printing a figure that looks like an answer.
  const impossible =
    principal > 0 &&
    termMonths > 0 &&
    annualRate > 0 &&
    (() => {
      const r = annualRate / 100 / 12;
      const g = Math.pow(1 + r, termMonths);
      return (principal * r * g) / (g - 1) <= principal * r;
    })();

  const valid =
    principal > 0 && termMonths > 0 && annualRate >= 0 && !impossible;

  const out = useMemo(
    () =>
      valid
        ? payoffVsInvest(
            principal,
            annualRate,
            termMonths,
            extraMonthly,
            returnPct,
          )
        : null,
    [valid, principal, annualRate, termMonths, extraMonthly, returnPct],
  );

  // STATE 4, genuine zero. With nothing spare to allocate, both paths are the
  // same path. The crossover computes as 0%, which is arithmetically true and
  // completely meaningless, so it is never shown.
  const nothingToCompare = extraMonthly <= 0;

  const gap = out ? out.invest.net - out.payDown.net : 0;

  function buildCsv(): string {
    if (!out) return "";
    const rows = [
      ["Plain Loan Math: pay off or invest"],
      ["Loan balance", String(Math.round(principal))],
      ["Mortgage rate (nominal annual %)", String(annualRate)],
      ["Mortgage rate restated as effective annual %", out.effectiveMortgagePct.toFixed(4)],
      ["Years remaining", String(num(years))],
      ["Spare amount per month", String(Math.round(extraMonthly))],
      ["Assumed annual return % (entered by you, not a forecast)", String(returnPct)],
      ["Compared at month", String(out.horizon)],
      [],
      ["Path", "Ends with"],
      ["Pay the mortgage down", out.payDown.net.toFixed(2)],
      ["Invest the spare amount", out.invest.net.toFixed(2)],
      [],
      [
        "Return at which both paths tie (%)",
        out.crossoverPct === null ? "no tie point exists" : out.crossoverPct.toFixed(4),
      ],
      ["Figures are pre-tax and ignore inflation."],
    ];
    return rows.map((r) => r.join(",")).join("\n");
  }

  return (
    <div className="mt-8">
      {/* `.calc` sets an explicit text color — the white-on-white guard,
          design guide §4.2. This band is color:#fff. */}
      <div className="calc panel lg:grid lg:grid-cols-[minmax(320px,390px)_1fr]">
        {/* ── Inputs ─────────────────────────────────────────────── */}
        <div className="border-b-rule border-line-strong p-5 sm:p-6 lg:border-b-0 lg:border-r-rule">
          <p className="label text-accent">Your loan</p>
          <p className="mt-2 text-[0.84rem] leading-relaxed text-muted">
            Partway through already? Enter what you owe today and the years you
            have left, not the original figures.
          </p>

          <div className="mt-3.5 space-y-3.5">
            <CalcField
              id="pvi-amount"
              label="Balance you still owe"
              value={amount}
              prefix="$"
              onChange={setAmount}
              onBlur={() =>
                setAmount(
                  num(amount) > 0
                    ? num(amount).toLocaleString("en-US")
                    : amount,
                )
              }
            />

            <div className="grid grid-cols-2 gap-3">
              <CalcField
                id="pvi-rate"
                label="Interest rate"
                value={rate}
                suffix="%"
                onChange={setRate}
              />
              <CalcField
                id="pvi-years"
                label="Years left"
                value={years}
                onChange={setYears}
              />
            </div>

            <CalcField
              id="pvi-extra"
              label="Spare money each month"
              value={extra}
              prefix="$"
              onChange={setExtra}
              hint="The amount you could put either way."
            />
          </div>

          <p className="label mt-6 text-accent">Return you expect</p>
          <p className="mt-2 text-[0.84rem] leading-relaxed text-muted">
            Nobody knows what investments will return. These starting points
            are what each mix actually returned from 1928 to 2025, before tax
            and before inflation. They are history, not a prediction. Type your
            own figure over them.
          </p>

          <div className="mt-3.5 grid grid-cols-3 gap-2">
            {RETURN_TIERS.map((t) => {
              const on = Math.abs(returnPct - t.pct) < 0.001;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setRet(String(t.pct))}
                  aria-pressed={on}
                  className={`min-h-tap border px-2 py-2 text-left text-[0.74rem] leading-tight transition-colors duration-150 ${
                    on
                      ? "border-accent bg-accent-soft text-ink"
                      : "border-line-strong bg-surface text-ink-2"
                  }`}
                >
                  <span className="num block text-[0.95rem] font-bold">
                    {t.pct.toFixed(1)}%
                  </span>
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="mt-3.5">
            <CalcField
              id="pvi-return"
              label="Annual return, before tax"
              value={ret}
              suffix="%"
              onChange={setRet}
            />
          </div>
        </div>

        {/* ── Results ────────────────────────────────────────────── */}
        {/* Fixed minimum height so nothing jumps mid-keystroke. */}
        <div className="min-h-[30rem] p-5 sm:p-6">
          {!valid ? (
            <div className="flex h-full min-h-[24rem] items-center">
              <p className="max-w-prose text-[0.95rem] leading-relaxed text-ink-2">
                {impossible
                  ? "At that rate and term the monthly payment never covers the interest, so the balance would never fall. Check the rate and the years left."
                  : "Enter a balance, a rate, and the years you have left to see both paths."}
              </p>
            </div>
          ) : (
            out && (
              <>
                <p className="label text-accent">
                  Where each path ends, month{" "}
                  <span className="num">{out.horizon}</span>
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="border-t-rule border-line-strong pt-3">
                    <p className="text-[0.85rem] font-bold text-ink">
                      Pay the mortgage down
                    </p>
                    <p className="num mt-1 text-[clamp(1.5rem,4.5vw,2rem)] font-bold leading-tight text-ink">
                      {formatUSD(out.payDown.net)}
                    </p>
                    <p className="mt-1 text-[0.8rem] text-muted">
                      Loan gone in{" "}
                      <span className="num">
                        {out.payDown.payoffMonth
                          ? formatDuration(out.payDown.payoffMonth)
                          : "not yet"}
                      </span>
                      , then the whole payment is invested.
                    </p>
                  </div>

                  <div className="border-t-rule border-line-strong pt-3">
                    <p className="text-[0.85rem] font-bold text-ink">
                      Invest the spare money
                    </p>
                    <p className="num mt-1 text-[clamp(1.5rem,4.5vw,2rem)] font-bold leading-tight text-ink">
                      {formatUSD(out.invest.net)}
                    </p>
                    <p className="mt-1 text-[0.8rem] text-muted">
                      Loan runs its full term while the spare money compounds.
                    </p>
                  </div>
                </div>

                {/* The finding. Never a winner — the tie point instead. */}
                <div className="mt-6 border-l-[3px] border-line-strong bg-paper px-5 py-4">
                  {nothingToCompare ? (
                    <p className="text-[0.92rem] leading-relaxed text-ink-2">
                      With no spare money there is nothing to put either way, so
                      both paths are the same path. Enter an amount above to
                      compare them.
                    </p>
                  ) : out.crossoverPct === null ? (
                    <p className="text-[0.92rem] leading-relaxed text-ink-2">
                      At this mortgage rate there is no tie point. Investing
                      ends ahead at any positive return, because the loan costs
                      almost nothing to carry.
                    </p>
                  ) : (
                    <>
                      <p className="label">The rate that decides it</p>
                      <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-2">
                        Both paths end level at a return of{" "}
                        <span className="num font-bold text-ink">
                          {out.crossoverPct.toFixed(2)}%
                        </span>
                        . Above that, investing ends ahead. Below it, paying the
                        mortgage down does.
                      </p>
                      <p className="mt-2 text-[0.88rem] leading-relaxed text-muted">
                        Note that it is not your{" "}
                        <span className="num">{annualRate}%</span> rate. A
                        mortgage rate is quoted per year but charged monthly, so{" "}
                        <span className="num">{annualRate}%</span> really costs{" "}
                        <span className="num">
                          {out.effectiveMortgagePct.toFixed(2)}%
                        </span>{" "}
                        a year. The tie point sits near that figure, not the one
                        on your statement.
                      </p>
                      <p className="mt-2 text-[0.88rem] leading-relaxed text-muted">
                        At the{" "}
                        <span className="num">{returnPct.toFixed(1)}%</span> you
                        entered, the gap between the two is{" "}
                        <span className="num font-bold text-ink">
                          {formatUSD(Math.abs(gap))}
                        </span>
                        . Which way that falls is the arithmetic above, not a
                        recommendation: one path is guaranteed and the other is
                        not.
                      </p>
                    </>
                  )}
                </div>

                <div className="mt-6">
                  <ResultActions
                    csvFilename="payoff-vs-invest.csv"
                    buildCsv={buildCsv}
                    note="The file records both end balances, the tie point, and every figure you entered."
                    disabled={!valid}
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
