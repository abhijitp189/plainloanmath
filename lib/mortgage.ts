// Mortgage arithmetic. Pure functions, no React, no formatting — so the math
// can be reasoned about and tested on its own.
//
// Convention throughout: US fixed-rate mortgage. Interest accrues monthly at
// (annual rate / 12), payments are made monthly in arrears, and the payment is
// the level amount that amortizes the balance to zero over the term. This is
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
 * Level monthly payment (principal + interest) for a fully amortizing loan.
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
 * rather than a full installment.
 *
 * `maxMonths` is a safety stop. If the scheduled payment does not cover the
 * monthly interest the balance never falls, and without a cap the loop would
 * not terminate.
 */
export function amortize(
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

    // Payment does not cover interest — the loan can never amortize.
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
  const baseline = amortize(principal, annualRatePct, termMonths, 0);
  const accelerated = amortize(principal, annualRatePct, termMonths, extraMonthly);

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

// ─────────────────────────────────────────────────────────────────────────────
// Full monthly payment — PITI
//
// The homepage calculator answers "what is my monthly payment", which is not
// principal and interest alone. It is principal, interest, property tax and
// homeowners insurance, plus mortgage insurance below 20% down and HOA dues
// where they apply.
//
// Deliberate omission: no rate, tax, insurance or PMI figure is hard-coded in
// this file. Every one of them is a caller-supplied input. Dated figures live
// in lib/constants.ts with a source and a verified-on date — see technical
// brief §8. An engine that quietly assumes "PMI is about 0.5%" is an
// unsourced claim hiding inside a pure function.
// ─────────────────────────────────────────────────────────────────────────────

export type PitiInputs = {
  homePrice: number;
  /** Down payment in dollars. The caller converts from a percentage. */
  downPayment: number;
  annualRatePct: number;
  termMonths: number;
  /** Property tax billed per year, in dollars. */
  annualPropertyTax: number;
  /** Homeowners insurance premium per year, in dollars. */
  annualHomeInsurance: number;
  /**
   * Annual mortgage insurance premium as a percentage of the original loan
   * amount. Ignored entirely when the down payment is 20% or more.
   */
  annualPmiRatePct: number;
  /** HOA or condo dues per month, in dollars. Zero for most properties. */
  monthlyHoa: number;
};

export type PitiBreakdown = {
  loanAmount: number;
  /** Loan-to-value at origination, as a percentage. */
  ltvPct: number;
  principalAndInterest: number;
  propertyTax: number;
  homeInsurance: number;
  mortgageInsurance: number;
  hoa: number;
  /** Every component above, added together. */
  total: number;
};

/**
 * Whether mortgage insurance applies, and when it comes off.
 *
 * The Homeowners Protection Act of 1998 (12 U.S.C. § 4901 et seq.) sets three
 * separate milestones, and they are genuinely different from one another.
 * Verified against the CFPB and NCUA summaries on August 8, 2026 — see
 * lib/constants.ts for the citations.
 *
 *   requestMonth   80% of original value. The borrower has to ASK in writing,
 *                  and must be current and able to show the property has not
 *                  fallen in value. Nothing happens automatically.
 *   automaticMonth 78% of original value. The servicer must act unasked.
 *   finalMonth     The month after the midpoint of the original term — month
 *                  181 of a 30-year loan. This applies EVEN IF the balance has
 *                  not reached 78%, which is why it cannot be left out: on a
 *                  high-LTV loan it is often the milestone that arrives first.
 *
 * "Original value" is the lower of the contract sales price and the appraised
 * value at purchase — not a later appraisal.
 *
 * Extra payments cut across these differently, which is a genuinely confusing
 * point worth getting right on the page. They can bring the 80% REQUEST date
 * forward, because that test looks at the actual balance. They do not move the
 * 78% automatic date, because that one is read off the ORIGINAL amortization
 * schedule regardless of what has actually been paid.
 *
 * Thresholds are parameters rather than baked-in constants because they are a
 * matter of federal law, and any page stating them has to cite the statute.
 * Passing them in keeps the citation next to the number on the page.
 */
export type PmiSchedule = {
  applies: boolean;
  requestMonth: number | null;
  automaticMonth: number | null;
  finalMonth: number | null;
  /** The earliest date PMI is actually gone without the borrower asking. */
  endsMonth: number | null;
};

export function pmiSchedule(
  homePrice: number,
  loanAmount: number,
  annualRatePct: number,
  termMonths: number,
  requestLtv: number,
  automaticLtv: number,
): PmiSchedule {
  const none: PmiSchedule = {
    applies: false,
    requestMonth: null,
    automaticMonth: null,
    finalMonth: null,
    endsMonth: null,
  };

  if (homePrice <= 0 || loanAmount <= 0 || termMonths <= 0) return none;
  if (loanAmount / homePrice <= requestLtv) return none;

  // The ORIGINAL schedule, with no extra payment. The statutory tests are read
  // off this, not off whatever the borrower actually pays.
  const { schedule } = amortize(loanAmount, annualRatePct, termMonths, 0);

  const firstMonthAtOrBelow = (ltv: number): number | null => {
    const target = homePrice * ltv;
    const row = schedule.find((r) => r.balance <= target);
    return row ? row.month : null;
  };

  const requestMonth = firstMonthAtOrBelow(requestLtv);
  const automaticMonth = firstMonthAtOrBelow(automaticLtv);
  const finalMonth = Math.floor(termMonths / 2) + 1;

  const candidates = [automaticMonth, finalMonth].filter(
    (m): m is number => m !== null,
  );

  return {
    applies: true,
    requestMonth,
    automaticMonth,
    finalMonth,
    endsMonth: candidates.length ? Math.min(...candidates) : null,
  };
}

/**
 * The full monthly payment, split into the parts a visitor recognizes on a
 * mortgage statement.
 *
 * Annual figures are divided by twelve. That is how a servicer collects them
 * into escrow, so it matches what a borrower actually pays each month even
 * though the county and the insurer are billed on their own cycles.
 */
export function monthlyPiti(
  inputs: PitiInputs,
  pmiRequestLtv: number,
): PitiBreakdown {
  const {
    homePrice,
    downPayment,
    annualRatePct,
    termMonths,
    annualPropertyTax,
    annualHomeInsurance,
    annualPmiRatePct,
    monthlyHoa,
  } = inputs;

  const loanAmount = Math.max(homePrice - downPayment, 0);
  const ltvPct = homePrice > 0 ? (loanAmount / homePrice) * 100 : 0;

  const principalAndInterest = monthlyPayment(
    loanAmount,
    annualRatePct,
    termMonths,
  );

  // Mortgage insurance is charged on the loan amount, not the home price, and
  // only while the loan is above the request threshold at origination.
  const pmiApplies = homePrice > 0 && loanAmount / homePrice > pmiRequestLtv;
  const mortgageInsurance = pmiApplies
    ? (loanAmount * (annualPmiRatePct / 100)) / 12
    : 0;

  const propertyTax = Math.max(annualPropertyTax, 0) / 12;
  const homeInsurance = Math.max(annualHomeInsurance, 0) / 12;
  const hoa = Math.max(monthlyHoa, 0);

  return {
    loanAmount,
    ltvPct,
    principalAndInterest,
    propertyTax,
    homeInsurance,
    mortgageInsurance,
    hoa,
    total:
      principalAndInterest +
      propertyTax +
      homeInsurance +
      mortgageInsurance +
      hoa,
  };
}

/** Whole dollars with no currency symbol — for table cells and axis labels. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

/** 0.0675 of a payment -> "6.8%". One decimal, because rates move in eighths. */
export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}
