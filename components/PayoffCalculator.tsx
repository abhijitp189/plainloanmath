"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  comparePayoff,
  formatUSD,
  formatDuration,
  monthlyPayment,
} from "@/lib/mortgage";
import { EXAMPLE } from "@/lib/constants";
import ResultActions from "@/components/ResultActions";
import { scheduleToCsv } from "@/lib/csv";
import { encodeParams, readNum, syncAddressBar } from "@/lib/share";

// Everything here runs in the browser. No figure the visitor types is ever
// sent anywhere — which is what the privacy policy promises.

const DEBOUNCE_MS = 90; // Design guide §6.

const EXTRA_PRESETS = [0, 100, 250, 500];

const URL_DEFAULTS = {
  loan: EXAMPLE.loanAmount,
  rate: EXAMPLE.annualRatePct,
  years: EXAMPLE.termYears,
  extra: 200,
};

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
  id: string;
};

function Field({ label, value, onChange, prefix, suffix, hint, id }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-[0.83rem] font-semibold text-ink-2">
        {label}
      </label>
      <div className="mt-1.5 flex items-center border border-line-strong bg-surface focus-within:border-accent">
        {prefix && (
          <span className="num pl-3 text-sm text-muted" aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="num min-h-[46px] w-full bg-transparent px-3 py-2.5 text-[0.98rem] text-ink outline-none"
        />
        {suffix && (
          <span className="pr-3 text-sm text-muted" aria-hidden="true">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-[0.78rem] text-muted">{hint}</p>}
    </div>
  );
}

/** Strips commas and currency symbols so pasted figures still parse. */
function num(value: string): number {
  const n = parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export default function PayoffCalculator() {
  const [amount, setAmount] = useState(
    EXAMPLE.loanAmount.toLocaleString("en-US"),
  );
  const [rate, setRate] = useState(String(EXAMPLE.annualRatePct));
  const [years, setYears] = useState(String(EXAMPLE.termYears));
  const [extra, setExtra] = useState("200");
  const [showSchedule, setShowSchedule] = useState(false);

  // Prefill from the query string when the visitor arrives from the homepage
  // teaser or a shared link. Read after mount rather than during render: the
  // page is statically exported, so the server has no query string and doing
  // this in render would produce a hydration mismatch.
  const hydrated = useRef(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const loan = readNum(q, "loan", { min: 1 });
    const r = readNum(q, "rate", { min: 0, max: 30 });
    const y = readNum(q, "years", { min: 1, max: 50 });
    const x = readNum(q, "extra", { min: 0 });

    if (loan !== null) setAmount(loan.toLocaleString("en-US"));
    if (r !== null) setRate(String(r));
    if (y !== null) setYears(String(y));
    if (x !== null) setExtra(String(x));

    hydrated.current = true;
  }, []);

  const principal = num(amount);
  const annualRate = num(rate);
  const termMonths = Math.round(num(years) * 12);
  const extraMonthly = num(extra);

  // The address bar tracks the inputs on the same debounce as the figures, so
  // Share always copies a link that reproduces what is on screen. Technical
  // brief §7 listed this as half-built — the page read parameters and nothing
  // ever wrote them.
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
          },
          URL_DEFAULTS,
        ),
      );
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [principal, annualRate, years, extraMonthly]);

  const basePayment = monthlyPayment(principal, annualRate, termMonths);

  // The scheduled payment must at least cover the first month's interest or
  // the loan never amortizes. Worth saying plainly rather than showing NaN.
  const impossible =
    principal > 0 &&
    termMonths > 0 &&
    basePayment <= (principal * annualRate) / 100 / 12;

  const valid = principal > 0 && termMonths > 0 && annualRate >= 0 && !impossible;

  const result = useMemo(
    () =>
      valid
        ? comparePayoff(principal, annualRate, termMonths, extraMonthly)
        : null,
    [valid, principal, annualRate, termMonths, extraMonthly],
  );

  const extraNow = Math.round(extraMonthly);

  return (
    <div className="mt-8">
      <div className="panel p-5 sm:p-6">
        <p className="label text-accent">Your loan</p>

        <div className="mt-3.5 grid gap-5 sm:grid-cols-2">
          <Field
            id="amount"
            label="Loan amount"
            value={amount}
            onChange={setAmount}
            prefix="$"
          />
          <Field
            id="rate"
            label="Interest rate"
            value={rate}
            onChange={setRate}
            suffix="%"
          />
          <Field
            id="years"
            label="Loan term"
            value={years}
            onChange={setYears}
            suffix="years"
          />
          <Field
            id="extra"
            label="Extra payment each month"
            value={extra}
            onChange={setExtra}
            prefix="$"
            hint="On top of the scheduled payment"
          />
        </div>

        {/* Presets under the extra-payment field — design guide §4.2. Most
            phone visitors will never type in it. */}
        <div className="mt-4">
          <p className="label mb-2">Or pick one</p>
          <div className="seg">
            {EXTRA_PRESETS.map((p) => (
              <label key={p} className="seg-opt">
                <input
                  type="radio"
                  name="extra-preset"
                  checked={extraNow === p}
                  onChange={() => setExtra(String(p))}
                />
                {p === 0 ? "Nothing" : <span className="num">${p}</span>}
              </label>
            ))}
          </div>
        </div>
      </div>

      {impossible && (
        <p className="mt-5 border-l-[3px] border-brass bg-brass-soft px-5 py-4 text-sm text-ink-2">
          At that rate and term the scheduled payment would not even cover the
          monthly interest, so the balance would never fall. Check the figures.
        </p>
      )}

      {result && (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Headline
              label="You would pay it off"
              value={formatDuration(result.monthsSaved)}
              caption="earlier"
            />
            {/* Design guide §1.3 — brass, and only on the savings figure. */}
            <Headline
              label="You would save"
              value={formatUSD(result.interestSaved)}
              caption="in interest"
              brass
            />
          </div>

          <div className="panel mt-6 p-5 sm:p-6">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">
                Comparison of the loan with and without extra payments
              </caption>
              <thead>
                <tr className="border-b-rule border-line-strong text-left">
                  <th scope="col" className="py-2.5 font-medium text-muted"></th>
                  <th scope="col" className="label py-2.5 text-right">
                    Scheduled
                  </th>
                  <th
                    scope="col"
                    className="label py-2.5 text-right text-accent"
                  >
                    With extra
                  </th>
                </tr>
              </thead>
              <tbody>
                <Row
                  label="Monthly payment"
                  before={formatUSD(result.baseline.monthlyPayment)}
                  after={formatUSD(
                    result.accelerated.monthlyPayment + extraMonthly,
                  )}
                />
                <Row
                  label="Time to pay off"
                  before={formatDuration(result.baseline.months)}
                  after={formatDuration(result.accelerated.months)}
                />
                <Row
                  label="Total interest"
                  before={formatUSD(result.baseline.totalInterest)}
                  after={formatUSD(result.accelerated.totalInterest)}
                />
                <Row
                  label="Total paid"
                  before={formatUSD(result.baseline.totalPaid)}
                  after={formatUSD(result.accelerated.totalPaid)}
                />
              </tbody>
            </table>

            <ResultActions
              csvFilename="plain-loan-math-payoff-schedule.csv"
              note="The CSV is every payment, not just the years shown below, and it includes the extra payment above."
              buildCsv={() =>
                scheduleToCsv(result.accelerated.schedule, {
                  tool: "Payoff with extra payments",
                  loanAmount: principal,
                  annualRatePct: annualRate,
                  termMonths,
                  extraMonthly,
                })
              }
            />
          </div>

          <button
            type="button"
            onClick={() => setShowSchedule((s) => !s)}
            className="no-print mt-6 min-h-tap text-sm font-semibold text-accent underline underline-offset-4 hover:text-accent-dk"
          >
            {showSchedule ? "Hide" : "Show"} the year-by-year balance
          </button>

          {showSchedule && (
            <div className="tablewrap mt-4 overflow-x-auto" data-print-full>
              <table className="w-full border-collapse text-sm">
                <caption className="label mb-2 text-left">
                  Totals for each year
                </caption>
                <thead>
                  <tr className="border-b-rule border-line-strong bg-paper-2 text-left">
                    <th scope="col" className="label px-3 py-2.5">
                      Year
                    </th>
                    <th scope="col" className="label px-3 py-2.5 text-right">
                      Interest paid
                    </th>
                    <th scope="col" className="label px-3 py-2.5 text-right">
                      Principal paid
                    </th>
                    <th scope="col" className="label px-3 py-2.5 text-right">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {yearly(result.accelerated.schedule).map((y) => (
                    <tr key={y.year} className="border-b border-line">
                      <td className="num px-3 py-2 text-ink-2">{y.year}</td>
                      <td className="num px-3 py-2 text-right text-ink-2">
                        {formatUSD(y.interest)}
                      </td>
                      <td className="num px-3 py-2 text-right text-ink-2">
                        {formatUSD(y.principal)}
                      </td>
                      <td className="num px-3 py-2 text-right font-semibold text-ink">
                        {formatUSD(y.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Headline({
  label,
  value,
  caption,
  brass = false,
}: {
  label: string;
  value: string;
  caption: string;
  brass?: boolean;
}) {
  return (
    <div
      className={`border-l-[3px] p-5 ${
        brass ? "border-brass bg-brass-soft" : "border-accent bg-accent-soft"
      }`}
    >
      <p className="label">{label}</p>
      <p
        className={`num mt-1.5 text-[clamp(1.6rem,5vw,2.1rem)] font-bold leading-none tracking-[-.03em] ${
          brass ? "text-brass" : "text-ink"
        }`}
      >
        {value}
      </p>
      <p className="mt-1.5 text-sm text-ink-2">{caption}</p>
    </div>
  );
}

function Row({
  label,
  before,
  after,
}: {
  label: string;
  before: string;
  after: string;
}) {
  return (
    <tr className="border-b border-line">
      <th scope="row" className="py-2.5 text-left font-normal text-ink-2">
        {label}
      </th>
      <td className="num py-2.5 text-right text-muted">{before}</td>
      <td className="num py-2.5 text-right font-semibold text-ink">{after}</td>
    </tr>
  );
}

/** Collapses the monthly schedule into calendar-year totals for display. */
function yearly(
  schedule: {
    month: number;
    interest: number;
    principal: number;
    extra: number;
    balance: number;
  }[],
) {
  const out: {
    year: number;
    interest: number;
    principal: number;
    balance: number;
  }[] = [];
  for (const row of schedule) {
    const year = Math.ceil(row.month / 12);
    let bucket = out[year - 1];
    if (!bucket) {
      bucket = { year, interest: 0, principal: 0, balance: 0 };
      out[year - 1] = bucket;
    }
    bucket.interest += row.interest;
    bucket.principal += row.principal + row.extra;
    bucket.balance = row.balance;
  }
  return out;
}
