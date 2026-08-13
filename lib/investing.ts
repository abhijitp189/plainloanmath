// ─────────────────────────────────────────────────────────────────────────────
// Pay off the mortgage, or invest the same money instead.
//
// Pure functions. No React, no browser dependency, no imports beyond the
// mortgage engine's payment formula, so this can be verified by running the
// same inputs elsewhere (technical brief §8).
//
// THE COMPARISON. Both paths spend the SAME amount every month, so the
// comparison is like for like:
//
//   Path A, "pay it down":  pay the scheduled payment P plus the extra E each
//                           month until the loan clears, then invest the whole
//                           P + E every month until the horizon.
//   Path B, "invest it":    pay the scheduled payment P only, and invest E
//                           every month from month one.
//
// The horizon is the month the loan would have ended on its own, so at the
// horizon both paths owe nothing and the only difference left is the
// investment balance. Comparing at any earlier date would mean subtracting a
// remaining balance from one side and not the other, which is where this
// comparison usually goes wrong elsewhere.
//
// THE UNITS TRAP, and it is the whole point of the page. A US mortgage rate is
// quoted as a NOMINAL annual rate compounded monthly: 6.75% means 6.75/12 each
// month, which compounds to 6.9628% over a year. An investment "average annual
// return" is conventionally already an EFFECTIVE annual figure. Comparing the
// two raw numbers compares different units, which is why the familiar rule of
// thumb — "invest if you can beat your mortgage rate" — sets the bar too low.
//
// So this module deliberately diverges from the mortgage engine's convention,
// and the divergence is the finding rather than an accident (§7.3):
//   mortgage side:    monthly rate = annual / 12          (matches lib/mortgage.ts)
//   investment side:  monthly rate = (1 + annual)^(1/12) - 1
//
// Rounding follows the shipped engine: full floating point throughout, rounded
// only at display. Totals accumulate from unrounded values.
// ─────────────────────────────────────────────────────────────────────────────

import { monthlyPayment } from "@/lib/mortgage";

/** Contributions are made at the end of each month, matching the payment. */
function investMonthlyRate(annualReturnPct: number): number {
  return Math.pow(1 + annualReturnPct / 100, 1 / 12) - 1;
}

export type PathResult = {
  /** Investment balance at the horizon. */
  invested: number;
  /** Loan balance still owed at the horizon. Zero in every normal case. */
  owed: number;
  /** invested - owed. What the reader is comparing. */
  net: number;
  /** Month the loan cleared, or null if it never does. */
  payoffMonth: number | null;
  /** Interest paid to the lender over the horizon. */
  interestPaid: number;
};

export type Outcome = {
  payDown: PathResult;
  invest: PathResult;
  /** Scheduled monthly payment, excluding the extra. */
  payment: number;
  /** Horizon in months. */
  horizon: number;
  /**
   * The annual return at which the two paths end level, or null when no such
   * return exists in the searched range — which happens when the mortgage rate
   * is at or near zero and investing wins at every positive return. A null
   * here is a real answer and the page states it in words.
   */
  crossoverPct: number | null;
  /** The mortgage rate restated as an effective annual figure. */
  effectiveMortgagePct: number;
};

/** A balance below this is treated as cleared. Matches lib/mortgage.ts. */
const CLEARED = 0.005;

/**
 * Path A: overpay until the loan clears, then redirect the whole outlay into
 * investments.
 */
function payDownPath(
  balance0: number,
  annualRatePct: number,
  termMonths: number,
  extra: number,
  annualReturnPct: number,
  horizon: number,
): PathResult {
  const payment = monthlyPayment(balance0, annualRatePct, termMonths);
  const r = annualRatePct / 100 / 12;
  const g = investMonthlyRate(annualReturnPct);

  let balance = balance0;
  let invested = 0;
  let interestPaid = 0;
  let payoffMonth: number | null = null;

  for (let month = 1; month <= horizon; month++) {
    if (balance > CLEARED) {
      const interest = balance * r;
      // Never pay more than is owed. The final month is short by design.
      const scheduledPrincipal = Math.min(payment - interest, balance);
      const extraApplied = Math.min(extra, balance - scheduledPrincipal);

      // The payment does not cover the interest. The loan can never amortize,
      // so stop rather than loop forever.
      if (scheduledPrincipal + extraApplied <= 0) break;

      balance -= scheduledPrincipal + extraApplied;
      interestPaid += interest;
      if (balance <= CLEARED && payoffMonth === null) payoffMonth = month;
    } else {
      invested = invested * (1 + g) + (payment + extra);
    }
  }

  const owed = Math.max(balance, 0);
  return { invested, owed, net: invested - owed, payoffMonth, interestPaid };
}

/** Path B: pay the scheduled payment only, invest the extra from month one. */
function investPath(
  balance0: number,
  annualRatePct: number,
  termMonths: number,
  extra: number,
  annualReturnPct: number,
  horizon: number,
): PathResult {
  const payment = monthlyPayment(balance0, annualRatePct, termMonths);
  const r = annualRatePct / 100 / 12;
  const g = investMonthlyRate(annualReturnPct);

  let balance = balance0;
  let invested = 0;
  let interestPaid = 0;
  let payoffMonth: number | null = null;

  for (let month = 1; month <= horizon; month++) {
    if (balance > CLEARED) {
      const interest = balance * r;
      const scheduledPrincipal = Math.min(payment - interest, balance);
      if (scheduledPrincipal <= 0) break;
      balance -= scheduledPrincipal;
      interestPaid += interest;
      if (balance <= CLEARED && payoffMonth === null) payoffMonth = month;
    }
    invested = invested * (1 + g) + extra;
  }

  const owed = Math.max(balance, 0);
  return { invested, owed, net: invested - owed, payoffMonth, interestPaid };
}

/**
 * The return at which both paths end level, found by bisection.
 *
 * Returns null when no crossover exists in the searched range. That is a real
 * outcome, not an error: at a zero or near-zero mortgage rate, investing is
 * ahead at every positive return and there is nothing to cross.
 */
export function crossoverReturn(
  balance0: number,
  annualRatePct: number,
  termMonths: number,
  extra: number,
  horizon: number,
  hi = 30,
): number | null {
  const gap = (pct: number) =>
    investPath(balance0, annualRatePct, termMonths, extra, pct, horizon).net -
    payDownPath(balance0, annualRatePct, termMonths, extra, pct, horizon).net;

  let lo = 0;
  if (gap(lo) > 0 || gap(hi) < 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (gap(mid) < 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * The whole comparison, from the reader's four inputs.
 *
 * Inputs are clamped rather than trusted: a negative extra payment produced a
 * negative net worth in testing, which is a nonsense figure that looks like an
 * answer.
 */
export function payoffVsInvest(
  balance0: number,
  annualRatePct: number,
  termMonths: number,
  extra: number,
  annualReturnPct: number,
): Outcome {
  const b = Math.max(balance0, 0);
  const rate = Math.max(annualRatePct, 0);
  const term = Math.max(Math.round(termMonths), 1);
  const e = Math.max(extra, 0);
  const ret = Math.max(annualReturnPct, 0);

  return {
    payDown: payDownPath(b, rate, term, e, ret, term),
    invest: investPath(b, rate, term, e, ret, term),
    payment: monthlyPayment(b, rate, term),
    horizon: term,
    crossoverPct: crossoverReturn(b, rate, term, e, term),
    effectiveMortgagePct: (Math.pow(1 + rate / 100 / 12, 12) - 1) * 100,
  };
}
