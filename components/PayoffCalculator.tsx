"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  amortizePlan,
  comparePlan,
  crossoverMonth,
  delayPlan,
  formatUSD,
  formatDuration,
  monthlyPayment,
  planIsEmpty,
  type PayoffPlan,
} from "@/lib/mortgage";
import { EXAMPLE } from "@/lib/constants";
import ResultActions from "@/components/ResultActions";
import LoanLifeStrip from "@/components/LoanLifeStrip";
import TotalPaidBars from "@/components/TotalPaidBars";
import { scheduleToCsv } from "@/lib/csv";
import { encodeParams, readNum, syncAddressBar } from "@/lib/share";

// Everything here runs in the browser. No figure the visitor types is ever
// sent anywhere — which is what the privacy policy promises.
//
// AUGUST 12, 2026 — the plan rebuild. This shipped supporting exactly one
// shape of extra payment: the same amount, every month, from the first
// payment. Every competing calculator checked that day offered four or five
// (calculator.net, mortgagecalculator.org, omnicalculator, calculator.net's
// biweekly page). We were behind the field, not ahead of it. The four shapes
// below are parity. The strip, the tipping point and the cost of waiting are
// the part nobody else has.

const DEBOUNCE_MS = 90; // Design guide §6.

const EXTRA_PRESETS = [0, 100, 250, 500];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const URL_DEFAULTS = {
  loan: EXAMPLE.loanAmount,
  rate: EXAMPLE.annualRatePct,
  years: EXAMPLE.termYears,
  extra: 200,
  start: 1,
  lump: 0,
  lumpyr: 1,
  yearly: 0,
  yearlymo: 12,
  bw: 0,
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
  const [startYear, setStartYear] = useState("1");
  const [lumpSum, setLumpSum] = useState("0");
  const [lumpYear, setLumpYear] = useState("1");
  const [annualExtra, setAnnualExtra] = useState("0");
  const [annualMonth, setAnnualMonth] = useState("12");
  const [biweekly, setBiweekly] = useState(false);
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
    const s = readNum(q, "start", { min: 1, max: 50 });
    const l = readNum(q, "lump", { min: 0 });
    const ly = readNum(q, "lumpyr", { min: 1, max: 50 });
    const ye = readNum(q, "yearly", { min: 0 });
    const ym = readNum(q, "yearlymo", { min: 1, max: 12 });
    const bw = readNum(q, "bw", { min: 0, max: 1 });

    if (loan !== null) setAmount(loan.toLocaleString("en-US"));
    if (r !== null) setRate(String(r));
    if (y !== null) setYears(String(y));
    if (x !== null) setExtra(String(x));
    if (s !== null) setStartYear(String(Math.round(s)));
    if (l !== null) setLumpSum(String(l));
    if (ly !== null) setLumpYear(String(Math.round(ly)));
    if (ye !== null) setAnnualExtra(String(ye));
    if (ym !== null) setAnnualMonth(String(Math.round(ym)));
    if (bw !== null) setBiweekly(bw === 1);

    hydrated.current = true;
  }, []);

  const principal = num(amount);
  const annualRate = num(rate);
  const termMonths = Math.round(num(years) * 12);

  // Year fields are 1-based and convert to absolute months. Clamped at 1 so a
  // cleared field cannot produce month 0 or a negative one.
  const startMonth = Math.max(Math.round(num(startYear) - 1) * 12 + 1, 1);
  const lumpSumMonth = Math.max(Math.round(num(lumpYear) - 1) * 12 + 1, 1);

  const plan: PayoffPlan = useMemo(
    () => ({
      extraMonthly: num(extra),
      annualExtra: num(annualExtra),
      annualExtraMonth: Math.min(Math.max(Math.round(num(annualMonth)), 1), 12),
      lumpSum: num(lumpSum),
      lumpSumMonth,
      biweekly,
      startMonth,
    }),
    [
      extra,
      annualExtra,
      annualMonth,
      lumpSum,
      lumpSumMonth,
      biweekly,
      startMonth,
    ],
  );

  // The address bar tracks the inputs on the same debounce as the figures, so
  // Share always copies a link that reproduces what is on screen.
  useEffect(() => {
    if (!hydrated.current) return;
    const t = setTimeout(() => {
      syncAddressBar(
        encodeParams(
          {
            loan: principal,
            rate: annualRate,
            years: num(years),
            extra: plan.extraMonthly,
            start: Math.round(num(startYear)) || 1,
            lump: plan.lumpSum,
            lumpyr: Math.round(num(lumpYear)) || 1,
            yearly: plan.annualExtra,
            yearlymo: plan.annualExtraMonth,
            bw: biweekly ? 1 : 0,
          },
          URL_DEFAULTS,
        ),
      );
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [principal, annualRate, years, plan, startYear, lumpYear, biweekly]);

  const basePayment = monthlyPayment(principal, annualRate, termMonths);

  // The scheduled payment must at least cover the first month's interest or
  // the loan never amortizes. Worth saying plainly rather than showing NaN.
  const impossible =
    principal > 0 &&
    termMonths > 0 &&
    basePayment <= (principal * annualRate) / 100 / 12;

  const valid = principal > 0 && termMonths > 0 && annualRate >= 0 && !impossible;

  const result = useMemo(
    () => (valid ? comparePlan(principal, annualRate, termMonths, plan) : null),
    [valid, principal, annualRate, termMonths, plan],
  );

  const hasPlan = !planIsEmpty(plan);

  /** The same plan started a year later — what waiting costs. */
  const delayed = useMemo(
    () =>
      valid && hasPlan
        ? comparePlan(principal, annualRate, termMonths, delayPlan(plan, 12))
        : null,
    [valid, hasPlan, principal, annualRate, termMonths, plan],
  );

  /**
   * Biweekly against the do-it-yourself version of the same idea: adding one
   * twelfth of the payment to every month. Both put in thirteen payments a
   * year; the monthly version credits the principal as it goes rather than
   * once the servicer has a whole payment in hand, so it finishes slightly
   * sooner. This is the comparison the companies selling biweekly conversion
   * programs do not put on their page.
   */
  const biweeklyVsMonthly = useMemo(() => {
    if (!valid || !biweekly || basePayment <= 0) return null;
    const asMonthly = amortizePlan(principal, annualRate, termMonths, {
      ...plan,
      biweekly: false,
      extraMonthly: plan.extraMonthly + basePayment / 12,
    });
    return asMonthly;
  }, [valid, biweekly, principal, annualRate, termMonths, plan, basePayment]);

  const crossBefore = result ? crossoverMonth(result.baseline.schedule) : null;
  const crossAfter = result ? crossoverMonth(result.accelerated.schedule) : null;

  const extraNow = Math.round(num(extra));
  const advancedOn =
    num(lumpSum) > 0 || num(annualExtra) > 0 || biweekly || startMonth > 1;

  return (
    <div className="mt-8">
      <div className="panel p-5 sm:p-6">
        <p className="label text-accent">Your loan</p>
        <p className="mt-2 text-[0.86rem] leading-relaxed text-muted">
          Already partway through? Enter what you owe today and the years you
          have left, not the original figures.
        </p>

        <div className="mt-3.5 grid gap-5 sm:grid-cols-2">
          <Field
            id="amount"
            label="Loan amount or current balance"
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
            label="Years remaining"
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

        {/* Presets under the extra-payment field. Most phone visitors will
            never type in it. */}
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

        {/* The other three shapes, folded away. A visitor who wants "what if I
            pay $200 more" should not have to scroll past a lump-sum field to
            reach the answer — but the fields have to be in the HTML source, not
            injected on open, and <details> is what prints open (design guide
            §9) and works without JavaScript. */}
        <details className="mt-5 border-t border-line pt-4" open={advancedOn}>
          <summary className="min-h-tap cursor-pointer list-none text-sm font-semibold text-accent underline underline-offset-4 hover:text-accent-dk">
            More ways to pay extra
          </summary>

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field
              id="start-year"
              label="Start the extra in year"
              value={startYear}
              onChange={setStartYear}
              hint="1 means starting with the next payment"
            />
            <Field
              id="annual-extra"
              label="Extra once a year"
              value={annualExtra}
              onChange={setAnnualExtra}
              prefix="$"
              hint="A bonus or tax refund you get every year"
            />
            <div>
              <label
                htmlFor="annual-month"
                className="block text-[0.83rem] font-semibold text-ink-2"
              >
                Which month it lands in
              </label>
              <select
                id="annual-month"
                value={annualMonth}
                onChange={(e) => setAnnualMonth(e.target.value)}
                className="mt-1.5 min-h-[46px] w-full border border-line-strong bg-surface px-3 text-[0.98rem] text-ink outline-none focus:border-accent"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={String(i + 1)}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <Field
              id="lump-sum"
              label="One-time lump sum"
              value={lumpSum}
              onChange={setLumpSum}
              prefix="$"
              hint="An inheritance, a bonus, the sale of something"
            />
            <Field
              id="lump-year"
              label="Lump sum arrives in year"
              value={lumpYear}
              onChange={setLumpYear}
            />
            <div>
              <p className="label mb-2">Pay every two weeks?</p>
              <div className="seg">
                <label className="seg-opt">
                  <input
                    type="radio"
                    name="biweekly"
                    checked={!biweekly}
                    onChange={() => setBiweekly(false)}
                  />
                  Monthly
                </label>
                <label className="seg-opt">
                  <input
                    type="radio"
                    name="biweekly"
                    checked={biweekly}
                    onChange={() => setBiweekly(true)}
                  />
                  Biweekly
                </label>
              </div>
              <p className="mt-1 text-[0.78rem] text-muted">
                26 half-payments a year, which is 13 monthly payments
              </p>
            </div>
          </div>
        </details>
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
            <p className="label">The life of your loan, month by month</p>
            <p className="mt-2 max-w-[62ch] text-[0.9rem] leading-relaxed text-ink-2">
              Each mark is one payment. The slate part is the interest it
              covers, the teal part is the debt it clears. Watch the teal grow.
            </p>

            <LoanLifeStrip
              accelerated={result.accelerated.schedule}
              baselineMonths={result.baseline.months}
              monthsSaved={result.monthsSaved}
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
                {/* The scheduled payment does NOT change when you pay extra.
                    That is the single most common misunderstanding about this
                    whole subject, so the row says it rather than hiding it in
                    a matching pair of identical numbers. */}
                <Row
                  label="Monthly payment"
                  before={formatUSD(result.baseline.monthlyPayment)}
                  after={
                    plan.extraMonthly > 0
                      ? formatUSD(
                          result.accelerated.monthlyPayment + plan.extraMonthly,
                        )
                      : "Unchanged"
                  }
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
                {crossBefore !== null && crossAfter !== null && (
                  <Row
                    label="Principal first beats interest"
                    before={`Month ${crossBefore}`}
                    after={`Month ${crossAfter}`}
                  />
                )}
              </tbody>
            </table>

            <TotalPaidBars
              baselinePrincipal={
                result.baseline.totalPaid - result.baseline.totalInterest
              }
              baselineInterest={result.baseline.totalInterest}
              acceleratedPrincipal={
                result.accelerated.totalPaid - result.accelerated.totalInterest
              }
              acceleratedInterest={result.accelerated.totalInterest}
            />

            <ResultActions
              csvFilename="plain-loan-math-payoff-schedule.csv"
              note="The CSV is every payment, not just the years shown below, and it includes every extra payment above."
              buildCsv={() =>
                scheduleToCsv(result.accelerated.schedule, {
                  tool: "Payoff with extra payments",
                  loanAmount: principal,
                  annualRatePct: annualRate,
                  termMonths,
                  extraMonthly: plan.extraMonthly,
                  planNote: describePlan(plan, basePayment),
                })
              }
            />
          </div>

          {/* The tipping point. Bankrate states this as generic trivia — "year
              18 or 19 on a 30-year loan" — without computing it for the loan in
              front of the reader. It is one line of code and it is a different
              number for every rate. */}
          {crossBefore !== null && crossAfter !== null && (
            <div className="mt-6 border-l-[3px] border-line-strong bg-paper px-5 py-4">
              <p className="label">The tipping point</p>
              <p className="mt-2 max-w-[68ch] text-[0.93rem] leading-relaxed text-ink-2">
                On the scheduled payments alone, more of your payment goes to
                principal than to interest starting at{" "}
                <strong className="font-semibold text-ink">
                  month <span className="num">{crossBefore}</span>
                </strong>{" "}
                — {formatDuration(crossBefore)} in.
                {crossAfter < crossBefore ? (
                  <>
                    {" "}
                    Your extra payments bring that forward to{" "}
                    <strong className="font-semibold text-ink">
                      month <span className="num">{crossAfter}</span>
                    </strong>
                    , because the balance the interest is charged on falls
                    faster.
                  </>
                ) : (
                  " Add an extra payment above and watch that date move."
                )}
              </p>
            </div>
          )}

          {/* What waiting costs. Almost every competitor answers "what do I
              save if I start now". Nobody answers "what does it cost me to
              start next year", which is the question that actually changes
              behavior. */}
          {delayed && result.interestSaved - delayed.interestSaved > 1 && (
            <div className="mt-4 border-l-[3px] border-line-strong bg-paper px-5 py-4">
              <p className="label">If you start a year from now instead</p>
              <p className="mt-2 max-w-[68ch] text-[0.93rem] leading-relaxed text-ink-2">
                The same plan, begun twelve months later, saves{" "}
                <span className="num">{formatUSD(delayed.interestSaved)}</span>{" "}
                rather than{" "}
                <span className="num">{formatUSD(result.interestSaved)}</span>.
                Waiting a year costs about{" "}
                <strong className="num font-semibold text-ink">
                  {formatUSD(result.interestSaved - delayed.interestSaved)}
                </strong>
                , and finishes{" "}
                {formatDuration(result.monthsSaved - delayed.monthsSaved)} later.
              </p>
            </div>
          )}

          {/* Biweekly, checked against the free version of the same idea. */}
          {biweeklyVsMonthly && (
            <div className="mt-4 border-l-[3px] border-line-strong bg-paper px-5 py-4">
              <p className="label">Biweekly, checked</p>
              <p className="mt-2 max-w-[68ch] text-[0.93rem] leading-relaxed text-ink-2">
                Paying every two weeks puts in 13 monthly payments a year. You
                can get the same 13 payments by adding{" "}
                <span className="num">{formatUSD(basePayment / 12)}</span> to
                each monthly payment yourself — and that version pays off in{" "}
                <span className="num">
                  {formatDuration(biweeklyVsMonthly.months)}
                </span>{" "}
                against{" "}
                <span className="num">
                  {formatDuration(result.accelerated.months)}
                </span>{" "}
                for the biweekly schedule, because the money reaches the
                principal as it arrives instead of waiting for a whole payment
                to accumulate.{" "}
                {biweeklyVsMonthly.totalInterest <
                result.accelerated.totalInterest ? (
                  <>
                    That is{" "}
                    <span className="num">
                      {formatUSD(
                        result.accelerated.totalInterest -
                          biweeklyVsMonthly.totalInterest,
                      )}
                    </span>{" "}
                    less interest, for no fee.
                  </>
                ) : null}
              </p>
            </div>
          )}

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

/** A one-line plain-English record of the plan, for the CSV preamble. */
function describePlan(plan: PayoffPlan, scheduledPayment: number): string {
  const parts: string[] = [];
  if (plan.extraMonthly > 0) {
    parts.push(`$${plan.extraMonthly.toFixed(2)} extra each month`);
  }
  if (plan.annualExtra > 0) {
    parts.push(
      `$${plan.annualExtra.toFixed(2)} extra each ${
        MONTHS[plan.annualExtraMonth - 1]
      }`,
    );
  }
  if (plan.lumpSum > 0) {
    parts.push(
      `$${plan.lumpSum.toFixed(2)} lump sum in month ${plan.lumpSumMonth}`,
    );
  }
  if (plan.biweekly) {
    parts.push(
      `biweekly payments, modeled as one extra $${scheduledPayment.toFixed(
        2,
      )} payment every 12 months`,
    );
  }
  if (parts.length === 0) return "no extra payment";
  const prefix = plan.startMonth > 1 ? `from month ${plan.startMonth}: ` : "";
  return prefix + parts.join("; ");
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
