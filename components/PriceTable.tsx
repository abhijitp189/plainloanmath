"use client";

import { useMemo } from "react";
import { monthlyPayment, formatUSD } from "@/lib/mortgage";
import { useCalcSnapshot } from "@/components/CalcState";

// The live price table, on the payment calculator page. Principal and interest
// only. Every figure recomputes from whatever the visitor typed into the
// calculator at the top of the page.
//
// No math in here. monthlyPayment() is the same pure function the calculator
// uses, so the row nearest their own price agrees with the headline figure.

const PRICES = [
  200_000, 300_000, 400_000, 500_000, 600_000, 700_000, 800_000, 1_000_000,
];

/** Trims trailing zeros so 6.750 reads as 6.75 and 7.000 reads as 7. */
function tidyRate(pct: number): string {
  return `${Number(pct.toFixed(3))}%`;
}

export default function PriceTable() {
  const { ratePct, termYears, downPct } = useCalcSnapshot();

  const rows = useMemo(() => {
    const termMonths = Math.max(Math.round(termYears * 12), 1);
    const pct = Math.min(Math.max(downPct, 0), 100);

    return PRICES.map((price) => {
      const down = (price * pct) / 100;
      const loan = price - down;
      const payment = monthlyPayment(loan, ratePct, termMonths);
      return {
        price,
        down,
        loan,
        payment,
        totalInterest: Math.max(payment * termMonths - loan, 0),
      };
    });
  }, [ratePct, termYears, downPct]);

  return (
    <section className="bg-paper py-[clamp(2.2rem,5vw,3.6rem)]">
      <div className="mx-auto max-w-wrap px-[var(--gutter)]">
        <div className="mb-6 grid items-end gap-y-2 gap-x-12 border-b-rule border-line-strong pb-4 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <h2 className="text-[clamp(1.5rem,3.6vw,2rem)] font-extrabold tracking-[-.03em] text-ink">
            How much is a mortgage on a house?
          </h2>
          <p className="text-[0.95rem] leading-relaxed text-muted">
            Calculated at{" "}
            <strong className="num font-semibold text-ink">
              {tidyRate(ratePct)}
            </strong>{" "}
            over{" "}
            <strong className="font-semibold text-ink">
              {Math.round(termYears)} years
            </strong>{" "}
            with{" "}
            <strong className="num font-semibold text-ink">
              {Math.round(downPct)}%
            </strong>{" "}
            down &mdash; the figures you entered above. Principal and interest
            only; taxes and insurance sit on top of these numbers.
          </p>
        </div>

        {/* Design guide §4.5 — horizontal scroll on phones rather than a
            squeezed table. */}
        <div className="tablewrap panel overflow-x-auto" data-print-full>
          <table className="w-full min-w-[38rem] border-collapse text-[0.92rem]">
            <caption className="sr-only">
              Monthly principal and interest by home price, at{" "}
              {tidyRate(ratePct)} over {Math.round(termYears)} years with{" "}
              {Math.round(downPct)}% down
            </caption>
            <thead>
              <tr className="border-b-rule border-line-strong bg-paper-2 text-left">
                <th scope="col" className="label px-4 py-3">
                  Home price
                </th>
                <th scope="col" className="label px-4 py-3 text-right">
                  Down payment
                </th>
                <th scope="col" className="label px-4 py-3 text-right">
                  Loan amount
                </th>
                <th scope="col" className="label px-4 py-3 text-right">
                  Monthly P&amp;I
                </th>
                <th scope="col" className="label px-4 py-3 text-right">
                  Interest over the loan
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.price} className="border-t border-line">
                  <td className="num px-4 py-2.5 text-ink">
                    {formatUSD(r.price)}
                  </td>
                  <td className="num px-4 py-2.5 text-right text-ink-2">
                    {formatUSD(r.down)}
                  </td>
                  <td className="num px-4 py-2.5 text-right text-ink-2">
                    {formatUSD(r.loan)}
                  </td>
                  <td className="num px-4 py-2.5 text-right font-semibold text-ink">
                    {formatUSD(r.payment)}
                  </td>
                  <td className="num px-4 py-2.5 text-right text-ink-2">
                    {formatUSD(r.totalInterest)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-[0.85rem] leading-relaxed text-muted">
          Reading across one row shows the cost of the house. Reading down the
          last column shows something else entirely &mdash; how much of what you
          pay is the house, and how much is the borrowing.
        </p>
      </div>
    </section>
  );
}
