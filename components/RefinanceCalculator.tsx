"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  refinance,
  breakEvenRate,
  formatUSD,
  formatDuration,
  type RefiResult,
} from "@/lib/mortgage";
import { REFI_COST_PLACEHOLDER } from "@/lib/constants";
import ResultActions from "@/components/ResultActions";
import CalcField from "@/components/CalcField";
import RecoveryChart from "@/components/RecoveryChart";
import { encodeParams, readNum, syncAddressBar } from "@/lib/share";

// Everything here runs in the browser. Nothing the visitor types is sent
// anywhere, which is what the privacy policy promises.
//
// WHAT THIS PAGE DOES THAT THE COMPETITION DOES NOT. Every tool checked on
// August 14, 2026 asks "given a rate you have been quoted, when do you break
// even". This one also inverts it: given how long you plan to stay, what rate
// would the refinance have to reach to pay for itself. A reader who has not
// applied yet has the second question, not the first.
//
// It also reports lifetime interest beside the break-even month, because those
// two answers can point opposite ways. Refinancing a loan that is well along
// into a fresh 30-year term can break even in a year and still cost tens of
// thousands more over the full run. Nobody shows both.

const DEBOUNCE_MS = 90; // Design guide §6.

/** Starting scenario. Round, plausible, and not a claim about the market. */
const START = {
  balance: 340_000,
  oldRate: 7.5,
  oldYears: 27,
  newRate: 6.5,
  newTermYears: 27,
  costs: REFI_COST_PLACEHOLDER,
  stayYears: 7,
};

const URL_DEFAULTS = {
  bal: START.balance,
  old: START.oldRate,
  left: START.oldYears,
  rate: START.newRate,
  term: START.newTermYears,
  cost: START.costs,
  stay: START.stayYears,
  fin: 0,
};

/** Strips commas and currency symbols so pasted figures still parse. */
function num(value: string): number {
  const n = parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Whole years, or "3 years 4 months" when it is not whole. */
function yearsLabel(months: number): string {
  return formatDuration(months);
}

export default function RefinanceCalculator() {
  const [balance, setBalance] = useState(
    START.balance.toLocaleString("en-US"),
  );
  const [oldRate, setOldRate] = useState(String(START.oldRate));
  const [oldYears, setOldYears] = useState(String(START.oldYears));
  const [newRate, setNewRate] = useState(String(START.newRate));
  const [newTermYears, setNewTermYears] = useState(START.newTermYears);
  const [costs, setCosts] = useState(START.costs.toLocaleString("en-US"));
  const [financed, setFinanced] = useState(false);
  const [stayYears, setStayYears] = useState(String(START.stayYears));

  // Read the query string after mount, never during render: the page is
  // statically exported, the server has no query string, and reading it in
  // render produces a hydration mismatch (technical brief §8.4).
  const hydrated = useRef(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const b = readNum(q, "bal", { min: 1 });
    const o = readNum(q, "old", { min: 0, max: 30 });
    const l = readNum(q, "left", { min: 0.1, max: 50 });
    const r = readNum(q, "rate", { min: 0, max: 30 });
    const t = readNum(q, "term", { min: 1, max: 50 });
    const c = readNum(q, "cost", { min: 0 });
    const st = readNum(q, "stay", { min: 0.1, max: 50 });
    const f = readNum(q, "fin", { min: 0, max: 1 });

    if (b !== null) setBalance(b.toLocaleString("en-US"));
    if (o !== null) setOldRate(String(o));
    if (l !== null) setOldYears(String(l));
    if (r !== null) setNewRate(String(r));
    if (t !== null) setNewTermYears(t);
    if (c !== null) setCosts(c.toLocaleString("en-US"));
    if (st !== null) setStayYears(String(st));
    if (f !== null) setFinanced(f === 1);

    hydrated.current = true;
  }, []);

  const bal = num(balance);
  const oldPct = num(oldRate);
  const oldMonthsLeft = Math.round(num(oldYears) * 12);
  const newPct = num(newRate);
  const newTermMonths = Math.round(newTermYears * 12);
  const closingCosts = num(costs);
  const stayMonths = Math.round(num(stayYears) * 12);

  // The address bar tracks the inputs on the same debounce as the figures, so
  // Share always copies a link reproducing what is on screen. Guarded until
  // the incoming read has run, or first paint wipes an arriving share link.
  useEffect(() => {
    if (!hydrated.current) return;
    const t = setTimeout(() => {
      syncAddressBar(
        encodeParams(
          {
            bal,
            old: oldPct,
            left: num(oldYears),
            rate: newPct,
            term: newTermYears,
            cost: closingCosts,
            stay: num(stayYears),
            fin: financed ? 1 : 0,
          },
          URL_DEFAULTS,
        ),
      );
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [
    bal,
    oldPct,
    oldYears,
    newPct,
    newTermYears,
    closingCosts,
    stayYears,
    financed,
  ]);

  const inputs = useMemo(
    () => ({
      balance: bal,
      oldRatePct: oldPct,
      oldMonthsLeft,
      newRatePct: newPct,
      newTermMonths,
      closingCosts,
      financeCosts: financed,
    }),
    [
      bal,
      oldPct,
      oldMonthsLeft,
      newPct,
      newTermMonths,
      closingCosts,
      financed,
    ],
  );

  const out = useMemo(() => refinance(inputs), [inputs]);

  const targetRate = useMemo(
    () => (out && stayMonths > 0 ? breakEvenRate(inputs, stayMonths) : null),
    [out, inputs, stayMonths],
  );

  // STATE 2, mid-edit. A momentarily empty or half-typed field must not blank
  // the panel or flash. Hold the last complete result and keep rendering it;
  // the figures catch up on the next valid keystroke.
  const lastGood = useRef<RefiResult | null>(null);
  if (out) lastGood.current = out;
  const shown = out ?? lastGood.current;

  // STATE 3, impossible input. Distinguished from "never breaks even", which
  // is a real answer rather than an error.
  const unusable = !out && !lastGood.current;

  function buildCsv(): string {
    if (!shown) return "";
    const rows: string[][] = [
      ["Plain Loan Math: refinance break-even"],
      ["Balance you still owe", String(Math.round(bal))],
      ["Current rate (nominal annual %)", String(oldPct)],
      ["Years left on the current loan", String(num(oldYears))],
      ["New rate (nominal annual %)", String(newPct)],
      ["New term (years)", String(newTermYears)],
      ["Closing costs", String(Math.round(closingCosts))],
      [
        "Closing costs are",
        financed ? "added to the new loan" : "paid at closing",
      ],
      ["Years you expect to stay", String(num(stayYears))],
      [],
      ["Payment now", shown.oldPayment.toFixed(2)],
      ["Payment after refinancing", shown.newPayment.toFixed(2)],
      ["Monthly change", shown.monthlyChange.toFixed(2)],
      [
        "Break-even month",
        shown.breakEvenMonth === null
          ? "never at this rate"
          : String(shown.breakEvenMonth),
      ],
      [
        "Rule-of-thumb break-even month (costs divided by monthly saving)",
        shown.naiveBreakEvenMonth === null
          ? "not defined: the payment does not fall"
          : String(shown.naiveBreakEvenMonth),
      ],
      [
        "Rate needed to break even within the years you expect to stay (%)",
        targetRate === null ? "not reachable at any rate" : targetRate.toFixed(3),
      ],
      [],
      ["Interest left on the current loan", shown.oldTotalInterest.toFixed(2)],
      ["Interest on the new loan", shown.newTotalInterest.toFixed(2)],
      [
        "Lifetime interest change (positive means the refinance costs more)",
        shown.lifetimeInterestChange.toFixed(2),
      ],
      [],
      ["Month", "Interest saved by this month"],
    ];
    shown.savedByMonth.forEach((v, m) => {
      if (m > 0) rows.push([String(m), v.toFixed(2)]);
    });
    return rows.map((r) => r.join(",")).join("\n");
  }

  const TERMS = [30, 20, 15] as const;
  const matchYears = Math.max(1, Math.round(num(oldYears)));
  const termIsMatch = newTermYears === matchYears && !TERMS.includes(newTermYears as 30);

  return (
    <div className="mt-8">
      {/* `.calc` sets an explicit text color — the white-on-white guard,
          design guide §4.2. This band is color:#fff. */}
      <div className="calc panel lg:grid lg:grid-cols-[minmax(320px,390px)_1fr]">
        {/* ── Inputs ─────────────────────────────────────────────── */}
        <div className="border-b-rule border-line-strong p-5 sm:p-6 lg:border-b-0 lg:border-r-rule">
          <p className="label text-accent">The loan you have now</p>
          <p className="mt-2 text-[0.84rem] leading-relaxed text-muted">
            Enter what you owe today and the years you have left, not the
            figures from when you bought.
          </p>

          <div className="mt-3.5 space-y-3.5">
            <CalcField
              id="refi-balance"
              label="Balance you still owe"
              value={balance}
              prefix="$"
              onChange={setBalance}
              onBlur={() =>
                setBalance(
                  num(balance) > 0
                    ? num(balance).toLocaleString("en-US")
                    : balance,
                )
              }
            />

            <div className="grid grid-cols-2 gap-3">
              <CalcField
                id="refi-old-rate"
                label="Your rate now"
                value={oldRate}
                suffix="%"
                onChange={setOldRate}
              />
              <CalcField
                id="refi-old-years"
                label="Years left"
                value={oldYears}
                onChange={setOldYears}
              />
            </div>
          </div>

          <p className="label mt-6 text-accent">The refinance</p>
          <p className="mt-2 text-[0.84rem] leading-relaxed text-muted">
            Use the rate you have actually been quoted. A discount point costs
            1% of the loan, but it does not buy a fixed amount of rate, so the
            quote is the only reliable figure.
          </p>

          <div className="mt-3.5 space-y-3.5">
            <CalcField
              id="refi-new-rate"
              label="New rate offered"
              value={newRate}
              suffix="%"
              onChange={setNewRate}
            />

            <fieldset>
              <legend className="block text-[0.83rem] font-semibold text-ink-2">
                New term
              </legend>
              <div className="seg mt-1.5">
                {TERMS.map((t) => (
                  <label key={t} className="seg-opt">
                    <input
                      type="radio"
                      name="refi-term"
                      checked={newTermYears === t && !termIsMatch}
                      onChange={() => setNewTermYears(t)}
                    />
                    <span className="num">{t}</span> yr
                  </label>
                ))}
                <label className="seg-opt">
                  <input
                    type="radio"
                    name="refi-term"
                    checked={termIsMatch}
                    onChange={() => setNewTermYears(matchYears)}
                  />
                  Match
                </label>
              </div>
              <p className="mt-1.5 text-[0.78rem] leading-relaxed text-muted">
                Match keeps the same finish date you have now. A longer term
                cuts the payment but restarts the clock.
              </p>
            </fieldset>

            <CalcField
              id="refi-costs"
              label="Closing costs"
              value={costs}
              prefix="$"
              onChange={setCosts}
              onBlur={() =>
                setCosts(
                  num(costs) > 0 ? num(costs).toLocaleString("en-US") : costs,
                )
              }
              hint="A placeholder, not an average. Replace it with the total from your Loan Estimate."
            />

            <fieldset>
              <legend className="block text-[0.83rem] font-semibold text-ink-2">
                How the costs are paid
              </legend>
              <div className="seg mt-1.5">
                <label className="seg-opt">
                  <input
                    type="radio"
                    name="refi-financed"
                    checked={!financed}
                    onChange={() => setFinanced(false)}
                  />
                  At closing
                </label>
                <label className="seg-opt">
                  <input
                    type="radio"
                    name="refi-financed"
                    checked={financed}
                    onChange={() => setFinanced(true)}
                  />
                  Added to the loan
                </label>
              </div>
            </fieldset>
          </div>

          <p className="label mt-6 text-accent">Your plans</p>
          <div className="mt-3.5">
            <CalcField
              id="refi-stay"
              label="Years you expect to keep this home"
              value={stayYears}
              onChange={setStayYears}
              hint="Used to work out the rate that would make this worth doing."
            />
          </div>
        </div>

        {/* ── Results ────────────────────────────────────────────── */}
        {/* Fixed minimum height so nothing jumps mid-keystroke. */}
        <div className="min-h-[34rem] p-5 sm:p-6">
          {unusable ? (
            <div className="flex h-full min-h-[24rem] items-center">
              <p className="max-w-prose text-[0.95rem] leading-relaxed text-ink-2">
                Enter the balance you still owe, your current rate, and the
                years left to see when a refinance would pay for itself.
              </p>
            </div>
          ) : (
            shown && (
              <>
                <p className="label text-accent">
                  When the refinance pays for itself
                </p>

                {shown.breakEvenMonth === null ? (
                  <p className="mt-2 max-w-prose text-[1.02rem] font-bold leading-snug text-ink">
                    Never at this rate.{" "}
                    <span className="font-normal text-ink-2">
                      The new loan does not save enough interest to cover{" "}
                      <span className="num">{formatUSD(closingCosts)}</span> in
                      closing costs before one of the two loans is paid off.
                    </span>
                  </p>
                ) : (
                  <>
                    {/* NOT `.figure-note`, which is brass. Brass means "money
                        you do not pay" and this is a duration (design guide
                        §1.3). The only brass on this page is the interest
                        saved in the chart. Same size and weight, ink instead —
                        it is still the page's loudest figure, it just is not
                        spending a color that means something else. */}
                    <p className="num mt-2 text-[clamp(1.6rem,5vw,2.3rem)] font-bold leading-none tracking-[-0.03em] text-ink">
                      {yearsLabel(shown.breakEvenMonth)}
                    </p>
                    <p className="mt-2 max-w-prose text-[0.9rem] leading-relaxed text-ink-2">
                      After month{" "}
                      <span className="num">{shown.breakEvenMonth}</span> the
                      interest you have saved is more than the{" "}
                      <span className="num">{formatUSD(closingCosts)}</span> the
                      refinance cost you. Before that, you are behind.
                    </p>
                  </>
                )}

                {/* THE DIFFERENTIATOR, and §8.4 requires it on the first
                    screen rather than buried further down the page.

                    Neutral `--line-strong` on `--surface`, which is design
                    guide §4.9's treatment for a block that explains rather
                    than warns. It was brass on `--brass-soft` until a phone
                    screenshot showed brass doing three unrelated jobs on one
                    page: a duration, a rate, and money. Only the last is what
                    the color means. §4.9's brass variant is for caveats about
                    a figure's reliability, which this is not. */}
                <div className="mt-5 border-l-[3px] border-line-strong bg-paper-2 p-4">
                  <p className="label">
                    The rate you would need, staying{" "}
                    <span className="num">{num(stayYears)}</span> years
                  </p>
                  {targetRate === null ? (
                    <p className="mt-1.5 max-w-prose text-[0.92rem] leading-relaxed text-ink-2">
                      Even a rate of 0% would not recover{" "}
                      <span className="num">{formatUSD(closingCosts)}</span>{" "}
                      within{" "}
                      <span className="num">{num(stayYears)}</span> years. On
                      this loan, closing costs are the obstacle rather than the
                      rate.
                    </p>
                  ) : (
                    <p className="mt-1.5 max-w-prose text-[0.92rem] leading-relaxed text-ink-2">
                      A new rate of{" "}
                      <span className="num font-bold text-ink">
                        {targetRate.toFixed(2)}%
                      </span>{" "}
                      or lower pays for itself before you move.{" "}
                      {newPct <= targetRate + 1e-9
                        ? "The rate you entered already clears that."
                        : `The ${newPct.toFixed(2)}% you entered does not, so this refinance would not have repaid its costs by the time you leave.`}
                    </p>
                  )}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="border-t-rule border-line-strong pt-3">
                    <p className="text-[0.85rem] font-bold text-ink">
                      Payment now
                    </p>
                    <p className="num mt-1 text-[clamp(1.3rem,4vw,1.7rem)] font-bold leading-tight text-ink">
                      {formatUSD(shown.oldPayment)}
                    </p>
                    <p className="mt-1 text-[0.8rem] text-muted">
                      Principal and interest only. Paid off in{" "}
                      <span className="num">
                        {yearsLabel(shown.oldMonthsToPayoff)}
                      </span>
                      .
                    </p>
                  </div>

                  <div className="border-t-rule border-line-strong pt-3">
                    <p className="text-[0.85rem] font-bold text-ink">
                      Payment after
                    </p>
                    <p className="num mt-1 text-[clamp(1.3rem,4vw,1.7rem)] font-bold leading-tight text-ink">
                      {formatUSD(shown.newPayment)}
                    </p>
                    <p className="mt-1 text-[0.8rem] text-muted">
                      {shown.monthlyChange > 0 ? "Down " : "Up "}
                      <span className="num">
                        {formatUSD(Math.abs(shown.monthlyChange))}
                      </span>{" "}
                      a month. Paid off in{" "}
                      <span className="num">
                        {yearsLabel(shown.newMonthsToPayoff)}
                      </span>
                      .
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="label">Recovering the closing costs</p>
                  <p className="mt-1.5 text-[0.8rem] leading-relaxed text-muted">
                    The filled area is interest you have not had to pay. The
                    dashed line is what the refinance cost. Where they meet is
                    the month you are even.
                  </p>
                  <RecoveryChart
                    saved={shown.savedByMonth}
                    costs={closingCosts}
                    breakEvenMonth={shown.breakEvenMonth}
                  />
                </div>

                <div className="mt-5 border-t-rule border-line-strong pt-3">
                  <p className="text-[0.85rem] font-bold text-ink">
                    Over the whole loan
                  </p>
                  <p className="mt-1.5 max-w-prose text-[0.88rem] leading-relaxed text-ink-2">
                    {shown.lifetimeInterestChange > 0 ? (
                      <>
                        Even though the payment is lower, the new loan runs
                        long enough that you would pay{" "}
                        <span className="num font-bold text-ink">
                          {formatUSD(shown.lifetimeInterestChange)}
                        </span>{" "}
                        more interest in total than staying put. Breaking even
                        and paying less overall are two different questions,
                        and here they point opposite ways.
                      </>
                    ) : (
                      <>
                        You would pay{" "}
                        <span className="num font-bold text-ink">
                          {formatUSD(-shown.lifetimeInterestChange)}
                        </span>{" "}
                        less interest in total than staying put, on top of
                        breaking even sooner.
                      </>
                    )}
                  </p>
                </div>

                {shown.naiveBreakEvenMonth !== null &&
                  shown.breakEvenMonth !== null &&
                  shown.naiveBreakEvenMonth !== shown.breakEvenMonth && (
                    <p className="mt-4 max-w-prose text-[0.83rem] leading-relaxed text-muted">
                      The common shortcut, closing costs divided by the monthly
                      saving, gives{" "}
                      <span className="num">
                        {shown.naiveBreakEvenMonth}
                      </span>{" "}
                      months here. It is out by{" "}
                      <span className="num">
                        {Math.abs(
                          shown.naiveBreakEvenMonth - shown.breakEvenMonth,
                        )}
                      </span>{" "}
                      because it ignores that the two loans pay down what you
                      owe at different speeds.
                    </p>
                  )}

                <div className="mt-6">
                  <ResultActions
                    csvFilename="refinance-break-even.csv"
                    buildCsv={buildCsv}
                    note="The CSV carries your figures and the interest saved by every month."
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
