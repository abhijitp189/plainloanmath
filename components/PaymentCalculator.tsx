"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { InlineLink } from "@/components/InlineLink";
import {
  monthlyPiti,
  pmiSchedule,
  amortize,
  formatUSD,
  formatNumber,
} from "@/lib/mortgage";
import { PMI, EXAMPLE, FIELD_DEFAULTS } from "@/lib/constants";
import { usePublishCalc } from "@/components/CalcState";
import ResultActions from "@/components/ResultActions";
import CalcField from "@/components/CalcField";
import Donut, { DonutLegend } from "@/components/Donut";
import { breakdownToCsv } from "@/lib/csv";
import { encodeParams, readNum, syncAddressBar } from "@/lib/share";
import { PMI_DROP_OFF_PATH } from "@/lib/routes";

// The monthly payment calculator. It lived on the homepage until August 10,
// 2026 and now has its own page at PAYMENT_PATH, so it can be tuned for one
// query and maintained on its own. Still the site's most important component.
//
// No math lives in here. Every number comes out of lib/mortgage.ts, which is
// pure TypeScript with no React in it, so the same engine drops into the
// embeddable widget later. Technical brief §7.

const DEBOUNCE_MS = 90; // Design guide §6 — below the Doherty threshold.

/** Reads a typed value, tolerating commas, dollar signs and empty strings. */
function num(raw: string): number {
  const n = Number(raw.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Thousands separators, applied on blur only — never while typing. */
function group(raw: string): string {
  const n = num(raw);
  if (!raw.trim() || !Number.isFinite(n)) return "";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

type Segment = {
  key: string;
  label: string;
  value: number;
  color: string;
  note: string;
};

const TERMS = [15, 30];

/** What a share link omits, because it matches the starting state anyway. */
const URL_DEFAULTS = {
  price: EXAMPLE.homePrice,
  down: EXAMPLE.downPaymentPct,
  rate: EXAMPLE.annualRatePct,
  term: EXAMPLE.termYears,
  tax: FIELD_DEFAULTS.propertyTaxPct,
  ins: FIELD_DEFAULTS.homeInsurancePct,
  pmi: FIELD_DEFAULTS.pmiRatePct,
  hoa: FIELD_DEFAULTS.monthlyHoa,
};

export default function PaymentCalculator() {
  const [homePrice, setHomePrice] = useState(String(EXAMPLE.homePrice));
  const [downAmt, setDownAmt] = useState(
    String((EXAMPLE.homePrice * EXAMPLE.downPaymentPct) / 100),
  );
  const [downPct, setDownPct] = useState(String(EXAMPLE.downPaymentPct));
  const [rate, setRate] = useState(String(EXAMPLE.annualRatePct));
  const [termYears, setTermYears] = useState(String(EXAMPLE.termYears));
  const [taxPct, setTaxPct] = useState(String(FIELD_DEFAULTS.propertyTaxPct));
  const [insPct, setInsPct] = useState(String(FIELD_DEFAULTS.homeInsurancePct));
  const [pmiPct, setPmiPct] = useState(String(FIELD_DEFAULTS.pmiRatePct));
  const [hoa, setHoa] = useState(String(FIELD_DEFAULTS.monthlyHoa));

  const raw = { homePrice, downAmt, rate, termYears, taxPct, insPct, pmiPct, hoa };
  const [settled, setSettled] = useState(raw);

  useEffect(() => {
    const t = setTimeout(() => setSettled(raw), DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homePrice, downAmt, rate, termYears, taxPct, insPct, pmiPct, hoa]);

  // ── Incoming share links ──────────────────────────────────────────────
  // Read after mount, never during render. The page is statically exported, so
  // the server has no query string at all and reading one while rendering
  // produces a hydration mismatch. Technical brief §7.
  const hydrated = useRef(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);

    const price = readNum(q, "price", { min: 1 });
    const down = readNum(q, "down", { min: 0, max: 100 });
    const r = readNum(q, "rate", { min: 0, max: 30 });
    const term = readNum(q, "term", { min: 1, max: 50 });
    const tax = readNum(q, "tax", { min: 0, max: 20 });
    const ins = readNum(q, "ins", { min: 0, max: 20 });
    const mi = readNum(q, "pmi", { min: 0, max: 20 });
    const dues = readNum(q, "hoa", { min: 0 });

    if (price !== null) setHomePrice(String(price));
    if (r !== null) setRate(String(r));
    if (term !== null) setTermYears(String(term));
    if (tax !== null) setTaxPct(String(tax));
    if (ins !== null) setInsPct(String(ins));
    if (mi !== null) setPmiPct(String(mi));
    if (dues !== null) setHoa(String(dues));

    // Down payment last, and derived from whichever price actually applies, so
    // the dollar field and the percent field agree on arrival.
    const effectivePrice = price ?? EXAMPLE.homePrice;
    if (down !== null) {
      setDownPct(String(down));
      setDownAmt(String(Math.round((effectivePrice * down) / 100)));
    } else if (price !== null) {
      setDownAmt(String(Math.round((price * EXAMPLE.downPaymentPct) / 100)));
    }

    hydrated.current = true;
  }, []);

  // Down payment is two fields showing one quantity. Editing either updates the
  // other, and the guard stops the two setters chasing each other in a loop.
  const syncing = useRef(false);

  function onPriceChange(next: string) {
    setHomePrice(next);
    const price = num(next);
    if (price > 0) {
      const pct = num(downPct);
      setDownAmt(String(Math.round((price * pct) / 100)));
    }
  }

  function onDownAmtChange(next: string) {
    setDownAmt(next);
    if (syncing.current) return;
    syncing.current = true;
    const price = num(homePrice);
    setDownPct(price > 0 ? ((num(next) / price) * 100).toFixed(1) : "0");
    syncing.current = false;
  }

  function onDownPctChange(next: string) {
    setDownPct(next);
    if (syncing.current) return;
    syncing.current = true;
    const price = num(homePrice);
    setDownAmt(String(Math.round((price * num(next)) / 100)));
    syncing.current = false;
  }

  const result = useMemo(() => {
    const price = num(settled.homePrice);
    const down = num(settled.downAmt);
    const termMonths = Math.max(Math.round(num(settled.termYears) * 12), 1);

    const piti = monthlyPiti(
      {
        homePrice: price,
        downPayment: down,
        annualRatePct: num(settled.rate),
        termMonths,
        annualPropertyTax: (price * num(settled.taxPct)) / 100,
        annualHomeInsurance: (price * num(settled.insPct)) / 100,
        annualPmiRatePct: num(settled.pmiPct),
        monthlyHoa: num(settled.hoa),
      },
      PMI.requestLtv,
    );

    const pmi = pmiSchedule(
      price,
      piti.loanAmount,
      num(settled.rate),
      termMonths,
      PMI.requestLtv,
      PMI.automaticLtv,
    );

    return { piti, pmi, termMonths, price, down };
  }, [settled]);

  const { piti, pmi, termMonths, price, down } = result;

  // ── Outgoing share links ──────────────────────────────────────────────
  // The address bar tracks the settled inputs, so whatever is on screen is
  // always what a copied URL reproduces. Held back until the incoming read
  // above has run, or the first paint would wipe an arriving link.
  useEffect(() => {
    if (!hydrated.current) return;
    const p = Math.max(num(settled.homePrice), 1);
    const query = encodeParams(
      {
        price: num(settled.homePrice),
        down: Number(((num(settled.downAmt) / p) * 100).toFixed(2)),
        rate: num(settled.rate),
        term: num(settled.termYears),
        tax: num(settled.taxPct),
        ins: num(settled.insPct),
        pmi: num(settled.pmiPct),
        hoa: num(settled.hoa),
      },
      URL_DEFAULTS,
    );
    syncAddressBar(query);
  }, [settled]);

  // Hand the three fields the price table reads down the page. Published from
  // `settled`, so it moves on the same 90ms debounce as everything else.
  const publish = usePublishCalc();
  useEffect(() => {
    const p = num(settled.homePrice);
    publish({
      ratePct: num(settled.rate),
      termYears: num(settled.termYears),
      downPct: p > 0 ? (num(settled.downAmt) / p) * 100 : 0,
      loanAmount: piti.loanAmount,
    });
  }, [settled, piti.loanAmount, publish]);

  const segments: Segment[] = [
    {
      key: "pi",
      label: "Principal & interest",
      value: piti.principalAndInterest,
      color: "var(--c-pi)",
      note: "The only part that is actually the mortgage",
    },
    {
      key: "tax",
      label: "Property tax",
      value: piti.propertyTax,
      color: "var(--c-tax)",
      note: "Collected into escrow, paid to the county",
    },
    {
      key: "ins",
      label: "Homeowners insurance",
      value: piti.homeInsurance,
      color: "var(--c-ins)",
      note: "Also escrowed, also not the lender's money",
    },
    {
      key: "pmi",
      label: "Mortgage insurance",
      value: piti.mortgageInsurance,
      color: "var(--c-pmi)",
      note: "Protects the lender, not you",
    },
    {
      key: "hoa",
      label: "HOA dues",
      value: piti.hoa,
      color: "var(--c-hoa)",
      note: "Paid to the association, never through the lender",
    },
  ].filter((s) => s.value > 0.005);

  const termNow = Math.round(num(termYears));

  return (
    <div className="calc panel lg:grid lg:grid-cols-[minmax(320px,380px)_1fr]">
      {/* ── Inputs ───────────────────────────────────────────────── */}
      <div className="border-b-rule border-line-strong p-5 sm:p-6 lg:border-b-0 lg:border-r-rule">
        <p className="label text-accent">Your loan</p>

        <div className="mt-3.5 space-y-3.5">
          <CalcField
            id="home-price"
            label="Home price"
            prefix="$"
            value={homePrice}
            onChange={onPriceChange}
            onBlur={() => setHomePrice(group(homePrice))}
          />

          <div className="grid grid-cols-[1fr_7.5rem] gap-2.5">
            <CalcField
              id="down-amount"
              label="Down payment"
              prefix="$"
              value={downAmt}
              onChange={onDownAmtChange}
              onBlur={() => setDownAmt(group(downAmt))}
            />
            <CalcField
              id="down-percent"
              label="of price"
              suffix="%"
              value={downPct}
              onChange={onDownPctChange}
            />
          </div>

          <CalcField
            id="rate"
            label="Interest rate"
            suffix="%"
            value={rate}
            onChange={setRate}
          />

          {/* Segmented control rather than a typed field. 15 and 30 are what
              virtually every US fixed-rate loan actually is, and two taps beat
              selecting a number and retyping it on a phone. The typed field
              appears underneath only for anything unusual. */}
          <div>
            <p className="mb-1.5 text-[0.83rem] font-semibold text-ink-2">Term</p>
            <div className="seg">
              {TERMS.map((t) => (
                <label key={t} className="seg-opt">
                  <input
                    type="radio"
                    name="term-preset"
                    checked={termNow === t}
                    onChange={() => setTermYears(String(t))}
                  />
                  <span className="num">{t}</span>
                  <span className="ml-1">years</span>
                </label>
              ))}
              <label className="seg-opt">
                <input
                  type="radio"
                  name="term-preset"
                  checked={!TERMS.includes(termNow)}
                  onChange={() => setTermYears("20")}
                />
                Other
              </label>
            </div>
            {!TERMS.includes(termNow) && (
              <div className="mt-2.5">
                <CalcField
                  id="term"
                  label="Term in years"
                  suffix="yrs"
                  value={termYears}
                  onChange={setTermYears}
                />
              </div>
            )}
          </div>
        </div>

        <p className="label mt-7">Everything else</p>
        <p className="mt-1.5 text-[0.83rem] leading-relaxed text-muted">
          These start as round placeholders, not local averages. Replace them
          with figures from a real listing or your county assessor.
        </p>

        <div className="mt-3 space-y-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <CalcField
              id="tax"
              label="Property tax"
              suffix="%/yr"
              value={taxPct}
              onChange={setTaxPct}
            />
            <CalcField
              id="insurance"
              label="Insurance"
              suffix="%/yr"
              value={insPct}
              onChange={setInsPct}
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <CalcField
              id="pmi"
              label="Mortgage insurance"
              suffix="%/yr"
              value={pmiPct}
              onChange={setPmiPct}
              disabled={!pmi.applies}
              hint={pmi.applies ? undefined : "Not charged at 20% down"}
            />
            <CalcField
              id="hoa"
              label="HOA dues"
              prefix="$"
              suffix="/mo"
              value={hoa}
              onChange={setHoa}
            />
          </div>
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────────────── */}
      <div className="p-5 sm:p-6">
        <p className="label">Estimated monthly payment</p>

        <p className="figure-xl mt-1 text-ink">{formatUSD(piti.total)}</p>

        <p className="mt-1.5 text-[0.9rem] text-muted">
          on a{" "}
          <span className="num text-ink-2">{formatUSD(piti.loanAmount)}</span>{" "}
          loan
          {" · "}
          <span className="num text-ink-2">{piti.ltvPct.toFixed(0)}%</span>{" "}
          loan-to-value
        </p>

        {/* Legend in HTML above the chart, never inside the SVG — design guide
            §5.1. In-SVG legends collide with labels and don't scale. Ruled rows
            rather than a bulleted list: this is a statement of account and it
            should read like one. */}
        <div className="mt-5 min-h-tab">
          <DonutLegend segments={segments} formatValue={formatUSD} />

          <div className="mt-5 flex justify-center">
            <Donut
              segments={segments}
              total={piti.total}
              centerLabel="per month"
              formatValue={formatUSD}
              ariaLabel={`Principal and interest is ${formatUSD(
                segments[0]?.value ?? 0,
              )} of a ${formatUSD(piti.total)} monthly payment`}
            />
          </div>
        </div>

        {pmi.applies && pmi.endsMonth && (
          <p className="mt-4 border-l-[3px] border-line-strong bg-paper px-3.5 py-3 text-[0.87rem] leading-relaxed text-ink-2">
            Below 20% down, mortgage insurance is added. On a conventional loan,
            if you stay current, your servicer must drop it by month{" "}
            <span className="num font-semibold text-ink">
              {formatNumber(pmi.endsMonth)}
            </span>
            {pmi.requestMonth && pmi.requestMonth < pmi.endsMonth && (
              <>
                , and you can request it from month{" "}
                <span className="num font-semibold text-ink">
                  {formatNumber(pmi.requestMonth)}
                </span>
              </>
            )}
            . FHA loans follow different rules and usually carry the premium for
            the life of the loan.{" "}
            <InlineLink href={PMI_DROP_OFF_PATH}>
              What decides these two months
            </InlineLink>
            .
          </p>
        )}

        <ResultActions
          csvFilename="plain-loan-math-payment.csv"
          disabled={piti.total <= 0}
          note="The CSV holds the payment breakdown and the full month-by-month schedule behind it."
          buildCsv={() => {
            const breakdown = breakdownToCsv(
              segments.map((s) => ({ label: s.label, value: s.value })),
              {
                homePrice: price,
                downPayment: down,
                annualRatePct: num(settled.rate),
                termMonths,
              },
            );

            // Built on click rather than during render: this is 360 rows that
            // nobody looks at unless they ask for the file.
            const { schedule } = amortize(
              piti.loanAmount,
              num(settled.rate),
              termMonths,
              0,
            );

            const rows = [
              "",
              "Month,Payment,Interest,Principal,Balance",
              ...schedule.map((r) =>
                [
                  r.month,
                  (r.interest + r.principal).toFixed(2),
                  r.interest.toFixed(2),
                  r.principal.toFixed(2),
                  r.balance.toFixed(2),
                ].join(","),
              ),
            ].join("\r\n");

            return breakdown + rows + "\r\n";
          }}
        />
      </div>
    </div>
  );
}


