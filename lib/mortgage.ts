// Mortgage arithmetic. Pure functions, no React, no formatting — so the maths
// can be reasoned about and tested on its own.
//
// Convention throughout: US fixed-rate mortgage. Interest accrues monthly at
// (annual rate / 12), payments are made monthly in arrears, and the payment is
// the level amount that amortises the balance to zero over the term. This is
// the convention lenders and the CFPB use for disclosed payment figures.

export type PayoffRow = {
  /** 1-based month number. */
  month: number;
  interest: number;
  principal: number;
  extra: number;
  /** Balance remaining after this month's payment. */
  balance: number;
};

export type PayoffResult = {
  /** Scheduled payment excluding any extra — principal and interest only. */
  monthlyPayment: number;
  /** Months actually taken to reach a zero balance. */
  months: number;
  totalInterest: number;
  /** Total of every payment made, including extras. */
  totalPaid: number;
  schedule: PayoffRow[];
};

export type Comparison = {
  baseline: PayoffResult;
  accelerated: PayoffResult;
  monthsSaved: number;
  interestSaved: number;
};

/**
 * Level monthly payment (principal + interest) for a fully amortising loan.
 *
 *   M = P · r(1+r)^n / ((1+r)^n − 1)
 *
 * where r is the monthly rate and n the number of months. At r = 0 the
 * formula is undefined (0/0), so the zero-interest case is handled separately
 * as simple division.
 */
export function monthlyPayment(
  principal: number,
  annualRatePct: number,
  termMonths: number,
): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / termMonths;
  const growth = Math.pow(1 + r, termMonths);
  return (principal * r * growth) / (growth - 1);
}

/**
 * Runs the loan month by month until the balance clears.
 *
 * Each month: interest accrues on the opening balance, the scheduled payment
 * covers that interest with the remainder reducing principal, and any extra
 * payment reduces principal further. The final month pays only what is owed
 * rather than a full instalment.
 *
 * `maxMonths` is a safety stop. If the scheduled payment does not cover the
 * monthly interest the balance never falls, and without a cap the loop would
 * not terminate.
 */
export function amortise(
  principal: number,
  annualRatePct: number,
  termMonths: number,
  extraMonthly = 0,
  maxMonths = 1200,
): PayoffResult {
  const payment = monthlyPayment(principal, annualRatePct, termMonths);
  const r = annualRatePct / 100 / 12;

  let balance = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  const schedule: PayoffRow[] = [];

  for (let month = 1; month <= maxMonths && balance > 0.005; month++) {
    const interest = balance * r;

    // Never pay more than is owed. The payoff month is short by design.
    const scheduledPrincipal = Math.min(payment - interest, balance);
    const extra = Math.min(extraMonthly, balance - scheduledPrincipal);

    // Payment does not cover interest — the loan can never amortise.
    if (scheduledPrincipal + extra <= 0) break;

    balance -= scheduledPrincipal + extra;
    totalInterest += interest;
    totalPaid += interest + scheduledPrincipal + extra;

    schedule.push({
      month,
      interest,
      principal: scheduledPrincipal,
      extra,
      balance: Math.max(balance, 0),
    });
  }

  return {
    monthlyPayment: payment,
    months: schedule.length,
    totalInterest,
    totalPaid,
    schedule,
  };
}

/** Same loan with and without the extra payment, plus the difference. */
export function comparePayoff(
  principal: number,
  annualRatePct: number,
  termMonths: number,
  extraMonthly: number,
): Comparison {
  const baseline = amortise(principal, annualRatePct, termMonths, 0);
  const accelerated = amortise(principal, annualRatePct, termMonths, extraMonthly);

  return {
    baseline,
    accelerated,
    monthsSaved: baseline.months - accelerated.months,
    interestSaved: baseline.totalInterest - accelerated.totalInterest,
  };
}

/** Whole dollars. Cent precision implies accuracy this cannot have. */
export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** 47 -> "3 years, 11 months" */
export function formatDuration(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y} year${y === 1 ? "" : "s"}`);
  if (m > 0) parts.push(`${m} month${m === 1 ? "" : "s"}`);
  return parts.length ? parts.join(", ") : "0 months";
}
