"use client";

import { useMemo, useState } from "react";
import {
  comparePayoff,
  formatUSD,
  formatDuration,
  monthlyPayment,
} from "@/lib/mortgage";

// Everything here runs in the browser. No figure the visitor types is ever
// sent anywhere — which is what the privacy policy promises.

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
  id: string;
};

function Field({
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
  id,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink-2">
        {label}
      </label>
      <div className="mt-1.5 flex items-center rounded-md border border-line bg-surface focus-within:border-accent">
        {prefix && (
          <span className="pl-3 text-sm text-muted" aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent px-3 py-2.5 text-ink outline-none"
        />
        {suffix && (
          <span className="pr-3 text-sm text-muted" aria-hidden="true">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

/** Strips commas and currency symbols so pasted figures still parse. */
function num(value: string): number {
  const n = parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export default function PayoffCalculator() {
  const [amount, setAmount] = useState("300,000");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState("30");
  const [extra, setExtra] = useState("200");
  const [showSchedule, setShowSchedule] = useState(false);

  const principal = num(amount);
  const annualRate = num(rate);
  const termMonths = Math.round(num(years) * 12);
  const extraMonthly = num(extra);

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

  return (
    <div className="mt-8">
      <div className="rounded-lg border border-line bg-paper p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
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
      </div>

      {impossible && (
        <p className="mt-5 rounded-lg border border-brass bg-brass-soft px-5 py-4 text-sm text-ink-2">
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
            <Headline
              label="You would save"
              value={formatUSD(result.interestSaved)}
              caption="in interest"
            />
          </div>

          <table className="mt-6 w-full border-collapse text-sm">
            <caption className="sr-only">
              Comparison of the loan with and without extra payments
            </caption>
            <thead>
              <tr className="border-b border-line text-left">
                <th scope="col" className="py-2 font-medium text-muted"></th>
                <th scope="col" className="py-2 text-right font-medium text-before">
                  Scheduled
                </th>
                <th scope="col" className="py-2 text-right font-medium text-accent">
                  With extra
                </th>
              </tr>
            </thead>
            <tbody>
              <Row
                label="Monthly payment"
                before={formatUSD(result.baseline.monthlyPayment)}
                after={formatUSD(result.accelerated.monthlyPayment + extraMonthly)}
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

          <button
            type="button"
            onClick={() => setShowSchedule((s) => !s)}
            className="mt-6 text-sm text-accent underline underline-offset-2 hover:text-accent-dk"
          >
            {showSchedule ? "Hide" : "Show"} the year-by-year balance
          </button>

          {showSchedule && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th scope="col" className="py-2 font-medium text-muted">
                      Year
                    </th>
                    <th scope="col" className="py-2 text-right font-medium text-muted">
                      Interest paid
                    </th>
                    <th scope="col" className="py-2 text-right font-medium text-muted">
                      Principal paid
                    </th>
                    <th scope="col" className="py-2 text-right font-medium text-muted">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {yearly(result.accelerated.schedule).map((y) => (
                    <tr key={y.year} className="border-b border-line">
                      <td className="py-2 text-ink-2">{y.year}</td>
                      <td className="py-2 text-right tabular-nums text-ink-2">
                        {formatUSD(y.interest)}
                      </td>
                      <td className="py-2 text-right tabular-nums text-ink-2">
                        {formatUSD(y.principal)}
                      </td>
                      <td className="py-2 text-right tabular-nums text-ink">
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
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-accent-soft px-5 py-4">
      <p className="text-sm text-ink-2">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{value}</p>
      <p className="text-sm text-ink-2">{caption}</p>
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
      <td className="py-2.5 text-right tabular-nums text-before">{before}</td>
      <td className="py-2.5 text-right font-medium tabular-nums text-ink">
        {after}
      </td>
    </tr>
  );
}

/** Collapses the monthly schedule into calendar-year totals for display. */
function yearly(schedule: { month: number; interest: number; principal: number; extra: number; balance: number }[]) {
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
