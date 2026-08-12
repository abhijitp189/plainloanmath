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

  // Donut segments — the whole ring is what the loan costs with NO extra
  // payments, split into what you borrowed, the interest you would still pay
  // under your plan, and the interest the plan deletes. The three add back to
  // the baseline total paid exactly, which is what makes the brass arc mean
  // something: it is the slice of the ring you are removing.
  const donut = result
    ? [
        {
          key: "principal",
          label: "What you borrowed",
          value: principal,
          color: "var(--c-pi)",
        },
        {
          key: "interest",
          label: "Interest you would still pay",
          value: result.accelerated.totalInterest,
          color: "var(--c-interest)",
        },
        {
          key: "saved",
          label: "Interest you avoid",
          value: result.interestSaved,
          color: "var(--brass)",
        },
      ].filter((seg) => seg.value > 0)
    : [];

  const donutTotal = result ? result.baseline.totalPaid : 0;

  return (
    <div className="mt-8">
      {/* Inputs left, results right — the same shape as the payment
          calculator. This shipped as one stacked column, which meant changing
          an input and reading the answer were at opposite ends of a scroll:
          on a phone that is unavoidable, on a laptop it was self-inflicted.
          `.calc` also sets an explicit text color, which is the white-on-white
          guard (design guide §4.2). */}
      <div className="calc panel lg:grid lg:grid-cols-[minmax(320px,390px)_1fr]">
        {/* ── Inputs ─────────────────────────────────────────────── */}
        <div className="border-b-rule border-line-strong p-5 sm:p-6 lg:border-b-0 lg:border-r-rule">
          <p className="label text-accent">Your loan</p>
          <p className="mt-2 text-[0.84rem] leading-relaxed text-muted">
            Already partway through? Enter what you owe today and the years you
            have left, not the original figures.
          </p>

          <div className="mt-3.5 space-y-3.5">
            <Field
              id="amount"
              label="Loan amount or current balance"
              value={amount}
              onChange={setAmount}
              prefix="$"
            />
            <div className="grid grid-cols-2 gap-2.5">
              <Field
                id="rate"
                label="Interest rate"
                value={rate}
                onChange={setRate}
                suffix="%"
              />
              <Field
                id="years"
                label="Years left"
                value={years}
                onChange={setYears}
                suffix="yr"
              />
            </div>
          </div>

          <p className="label mt-7">Your extra payments</p>

          <div className="mt-3 space-y-3.5">
            <Field
              id="extra"
              label="Extra each month"
              value={extra}
              onChange={setExtra}
              prefix="$"
              hint="On top of the scheduled payment"
            />

            <div>
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

          {/* The other three shapes, folded away. Someone asking "what if I pay
              $200 more" should not scroll past a lump-sum field to reach the
              answer — but the fields are in the static HTML rather than mounted
              on open, and <details> is what prints open (design guide §9) and
              works with no JavaScript. */}
          <details className="mt-5 border-t border-line pt-4" open={advancedOn}>
            <summary className="min-h-tap cursor-pointer list-none py-1 text-sm font-semibold text-accent underline underline-offset-4 marker:content-none hover:text-accent-dk">
              More ways to pay extra
            </summary>

            {/* GROUPED, NOT A FLAT GRID. This was one six-cell grid filling in
                row-major order, which put "Which month it lands in" directly
                beneath "Start the extra in year" while its actual partner sat
                in the other column. Every field was labeled correctly and the
                pairing still read wrong, because a grid pairs by ROW and a
                reader pairs by COLUMN. */}
            <div className="mt-4 space-y-5">
              <Field
                id="start-year"
                label="Start the extra in year"
                value={startYear}
                onChange={setStartYear}
                hint="1 means starting with the next payment"
              />

              <div>
                {/* "Pay every two weeks?" is a yes/no question and these are
                    not yes/no answers. The heading names the actual choice. */}
                <p className="label mb-2">How often you pay</p>
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
                <p className="mt-1.5 text-[0.78rem] leading-relaxed text-muted">
                  Biweekly is 26 half-payments a year, which is 13 monthly
                  payments
                </p>
              </div>

              <div className="border-t border-line pt-4">
                <p className="label mb-2.5">Extra once a year</p>
                <div className="space-y-3">
                  <Field
                    id="annual-extra"
                    label="Amount"
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
                </div>
              </div>

              <div className="border-t border-line pt-4">
                <p className="label mb-2.5">A one-time lump sum</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <Field
                    id="lump-sum"
                    label="Amount"
                    value={lumpSum}
                    onChange={setLumpSum}
                    prefix="$"
                  />
                  <Field
                    id="lump-year"
                    label="Arrives in year"
                    value={lumpYear}
                    onChange={setLumpYear}
                  />
                </div>
              </div>
            </div>
          </details>
        </div>

        {/* ── Results ────────────────────────────────────────────── */}
        <div className="p-5 sm:p-6">
          {impossible ? (
            <div className="min-h-tab">
              <p className="label">Check the figures</p>
              <p className="mt-3 max-w-[46ch] border-l-[3px] border-brass bg-brass-soft px-5 py-4 text-sm leading-relaxed text-ink-2">
                At that rate and term the scheduled payment would not even cover
                the monthly interest, so the balance would never fall.
              </p>
            </div>
          ) : !result ? (
            <div className="min-h-tab">
              <p className="label">Interest you would save</p>
              <p className="mt-3 text-[0.92rem] text-muted">
                Enter a balance, a rate and a term to see the result.
              </p>
            </div>
          ) : (
            <div className="min-h-tab">
              <p className="label">Interest you would save</p>

              {/* Brass, and it is the page's one loud figure — design guide
                  §1.3. --brass on --surface is 4.68:1, which clears the 4.5
                  floor, and this is large text besides. */}
              <p className="figure-xl mt-1 text-brass">
                {formatUSD(result.interestSaved)}
              </p>

              <p className="mt-1.5 max-w-[46ch] text-[0.9rem] leading-relaxed text-muted">
                {result.monthsSaved > 0 ? (
                  <>
                    and you would be done in{" "}
                    <span className="num text-ink-2">
                      {formatDuration(result.accelerated.months)}
                    </span>{" "}
                    instead of{" "}
                    <span className="num text-ink-2">
                      {formatDuration(result.baseline.months)}
                    </span>{" "}
                    — {formatDuration(result.monthsSaved)} sooner
                  </>
                ) : (
                  <>
                    Add an extra payment on the left and this figure starts
                    moving.
                  </>
                )}
              </p>

              {/* Ruled rows rather than a bordered table: this is a statement
                  of account and should read like one, the same way the payment
                  calculator's breakdown does. */}
              <table className="mt-5 w-full border-collapse text-[0.9rem]">
                <caption className="sr-only">
                  The same loan with and without your extra payments
                </caption>
                <thead>
                  <tr className="border-b border-line text-left">
                    <th scope="col" className="py-2 font-normal"></th>
                    <th scope="col" className="label py-2 text-right">
                      As scheduled
                    </th>
                    <th
                      scope="col"
                      className="label py-2 text-right text-accent"
                    >
                      With extra
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* The scheduled payment does NOT change when you pay extra.
                      That is the single commonest misunderstanding about this
                      subject, so the row says so rather than hiding it behind
                      a matching pair of identical numbers. */}
                  <Row
                    label="Monthly payment"
                    before={formatUSD(result.baseline.monthlyPayment)}
                    after={
                      plan.extraMonthly > 0
                        ? formatUSD(
                            result.accelerated.monthlyPayment +
                              plan.extraMonthly,
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

              {/* Legend in HTML above the chart, never inside the SVG —
                  design guide §5.1. */}
              <div className="mt-6">
                <p className="label">Everything this loan costs you</p>
                <ul className="mt-2.5 border-t border-line">
                  {donut.map((seg) => (
                    <li
                      key={seg.key}
                      className="flex items-baseline gap-2.5 border-b border-line py-2.5 text-[0.9rem]"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[0.35rem] h-2.5 w-2.5 shrink-0"
                        style={{
                          background: seg.color,
                          printColorAdjust: "exact",
                          WebkitPrintColorAdjust: "exact",
                        }}
                      />
                      <span className="flex-1 text-ink-2">{seg.label}</span>
                      <span className="num font-semibold text-ink">
                        {formatUSD(seg.value)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex justify-center">
                  <PayoffDonut segments={donut} total={donutTotal} />
                </div>
              </div>

              <ResultActions
                csvFilename="plain-loan-math-payoff-schedule.csv"
                note="The CSV is every payment, not just the years below, and it includes every extra payment above."
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
          )}
        </div>
      </div>

      {result && (
        <>
          {/* ── The strip ──────────────────────────────────────────── */}
          <div className="panel mt-6 p-5 sm:p-6">
            <p className="label">The life of your loan, month by month</p>
            <p className="mt-2 max-w-[68ch] text-[0.9rem] leading-relaxed text-ink-2">
              Each mark is one payment. The slate part is the interest it
              covers, the teal part is the debt it clears. Watch the teal grow.
            </p>

            <LoanLifeStrip
              accelerated={result.accelerated.schedule}
              baselineMonths={result.baseline.months}
              monthsSaved={result.monthsSaved}
            />
          </div>

          {/* ── What the figures mean ──────────────────────────────
              A grid, not a stack. These were three full-width callouts
              separated by whitespace, which read as three unrelated boxes
              dropped on the page rather than as a set. */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {crossBefore !== null && crossAfter !== null && (
              <Insight title="The tipping point">
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
                  " Add an extra payment and watch that date move."
                )}
              </Insight>
            )}

            {delayed && result.interestSaved - delayed.interestSaved > 1 && (
              <Insight title="If you start a year from now instead">
                The same plan, begun twelve months later, saves{" "}
                <span className="num">{formatUSD(delayed.interestSaved)}</span>{" "}
                rather than{" "}
                <span className="num">{formatUSD(result.interestSaved)}</span>.
                Waiting a year costs about{" "}
                <strong className="num font-semibold text-ink">
                  {formatUSD(result.interestSaved - delayed.interestSaved)}
                </strong>
                , and finishes{" "}
                {formatDuration(result.monthsSaved - delayed.monthsSaved)}{" "}
                later.
              </Insight>
            )}

            {biweeklyVsMonthly && (
              <Insight title="Biweekly, checked">
                Paying every two weeks puts in 13 monthly payments a year. You
                can get the same 13 by adding{" "}
                <span className="num">{formatUSD(basePayment / 12)}</span> to
                each monthly payment yourself — and that version pays off in{" "}
                <span className="num">
                  {formatDuration(biweeklyVsMonthly.months)}
                </span>{" "}
                against{" "}
                <span className="num">
                  {formatDuration(result.accelerated.months)}
                </span>
                , because the money reaches the principal as it arrives instead
                of waiting for a whole payment to accumulate.
                {biweeklyVsMonthly.totalInterest <
                result.accelerated.totalInterest ? (
                  <>
                    {" "}
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
              </Insight>
            )}
          </div>

          {/* ── The schedule ───────────────────────────────────────
              A <details> inside a panel, not a bare link floating between two
              callouts. The old version was an underlined button with nothing
              around it, so it read as something that had landed on the page by
              accident. <details> also prints open (design guide §9), which the
              button did not. */}
          <details className="panel mt-6 px-5 sm:px-6">
            <summary className="group flex min-h-tap cursor-pointer list-none items-center justify-between gap-3 py-4 text-[0.98rem] font-bold text-ink marker:content-none">
              Show the year-by-year balance
              <span
                aria-hidden="true"
                className="shrink-0 text-muted transition-transform duration-150 group-open:rotate-45"
              >
                +
              </span>
            </summary>

            <div
              className="tablewrap -mx-5 overflow-x-auto pb-5 sm:-mx-6"
              data-print-full
            >
              <table className="w-full min-w-[30rem] border-collapse text-sm">
                <caption className="label px-5 pb-2 text-left sm:px-6">
                  Totals for each year
                </caption>
                <thead>
                  <tr className="border-y border-line-strong bg-paper-2 text-left">
                    <th scope="col" className="label px-5 py-2.5 sm:px-6">
                      Year
                    </th>
                    <th scope="col" className="label px-3 py-2.5 text-right">
                      Interest paid
                    </th>
                    <th scope="col" className="label px-3 py-2.5 text-right">
                      Principal paid
                    </th>
                    <th
                      scope="col"
                      className="label px-5 py-2.5 text-right sm:px-6"
                    >
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {yearly(result.accelerated.schedule).map((y) => (
                    <tr key={y.year} className="border-b border-line">
                      <td className="num px-5 py-2 text-ink-2 sm:px-6">
                        {y.year}
                      </td>
                      <td className="num px-3 py-2 text-right text-ink-2">
                        {formatUSD(y.interest)}
                      </td>
                      <td className="num px-3 py-2 text-right text-ink-2">
                        {formatUSD(y.principal)}
                      </td>
                      <td className="num px-5 py-2 text-right font-semibold text-ink sm:px-6">
                        {formatUSD(y.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </div>
  );
}

/** One of the three read-this-next blocks under the calculator. */
function Insight({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="h-full border-l-[3px] border-line-strong bg-surface px-5 py-4">
      <p className="label">{title}</p>
      <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-2">
        {children}
      </p>
    </div>
  );
}

/* ── Donut ─────────────────────────────────────────────────────────
   Design guide §5.3: r=68, stroke-width 26, stacked circles rotated -90°,
   each segment shortened by 3px so a white separator falls between them.
   Hand-written SVG — no charting library, ever.

   The ring is what the loan costs with NO extra payments, so the brass arc is
   literally the part of the circle the extra payments delete. Center figure
   scales with its own length: "$793,884" is two characters longer than the
   payment calculator's "$2,807" and overruns the hole at a fixed 21px. */
function PayoffDonut({
  segments,
  total,
}: {
  segments: { key: string; label: string; value: number; color: string }[];
  total: number;
}) {
  const R = 68;
  const CIRC = 2 * Math.PI * R;
  const GAP = 3;

  const text = formatUSD(total);
  // The hole is 110 user units across (2 × (68 − 13)). A mono digit runs about
  // 0.6em, so 21px only clears 8 characters and "$1,284,120" on a large loan
  // would print over the ring. Stepped rather than continuous so the figure
  // does not resize on every keystroke.
  const fontSize =
    text.length > 10 ? 14 : text.length > 9 ? 15 : text.length > 8 ? 17 : 21;

  let offset = 0;

  return (
    <svg
      viewBox="0 0 180 180"
      width="100%"
      style={{ maxWidth: 210 }}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Of ${formatUSD(total)} this loan would cost with no extra payments, ${formatUSD(
        segments.find((s) => s.key === "saved")?.value ?? 0,
      )} is interest your extra payments avoid`}
    >
      <g transform="rotate(-90 90 90)">
        <circle
          cx="90"
          cy="90"
          r={R}
          fill="none"
          stroke="var(--paper-2)"
          strokeWidth="26"
        />
        {total > 0 &&
          segments.map((s) => {
            const len = Math.max((s.value / total) * CIRC - GAP, 0);
            const el = (
              <circle
                key={s.key}
                cx="90"
                cy="90"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth="26"
                strokeDasharray={`${len} ${CIRC - len}`}
                strokeDashoffset={-offset}
                style={{
                  printColorAdjust: "exact",
                  WebkitPrintColorAdjust: "exact",
                }}
              />
            );
            offset += (s.value / total) * CIRC;
            return el;
          })}
      </g>

      <text
        x="90"
        y="86"
        textAnchor="middle"
        className="num"
        fontSize={fontSize}
        fontWeight="700"
        fill="var(--ink)"
      >
        {text}
      </text>
      <text x="90" y="104" textAnchor="middle" fontSize="13" fill="var(--muted)">
        without extra
      </text>
    </svg>
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
