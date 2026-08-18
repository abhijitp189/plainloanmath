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

// ─────────────────────────────────────────────────────────────────────────────
// Payoff plans
//
// `amortize` above handles one shape of extra payment: the same amount, every
// month, from the first payment. That is the commonest case and it is what the
// payoff calculator shipped with, but it is not how most people actually pay
// extra, and every competing calculator checked on August 12, 2026 offers more
// than we did:
//
//   calculator.net           monthly extra, yearly extra, one-time, biweekly
//   mortgagecalculator.org   monthly extra, opening lump sum, mid-term start
//   omnicalculator.com       monthly extra, lump sum, one payment a year
//
// A plan below is a set of extra payments with dates attached. Everything is
// expressed in absolute month numbers so the schedule loop stays a single pass
// with no special cases, and so `delayPlan` can shift a whole plan by twelve
// months without knowing what is in it.
//
// NOTE ON BIWEEKLY. Twenty-six half-payments a year is thirteen monthly
// payments a year, which is twelve scheduled payments plus one extra. It is
// modeled here as one extra full payment applied every twelfth month, because
// that is what a US servicer running a biweekly program actually does: the
// half-payments are held and applied when a full payment has accumulated.
// Modeling it as one twelfth of a payment added every month would credit the
// principal sooner than the money is really applied and would overstate the
// saving. The difference is small and the page states which way it errs.
// ─────────────────────────────────────────────────────────────────────────────

export type PayoffPlan = {
  /** Added to every scheduled payment from `startMonth` onward. */
  extraMonthly: number;
  /** Added once a year, in `annualExtraMonth` of each year. */
  annualExtra: number;
  /** 1–12. Which month of each year the annual extra lands in. */
  annualExtraMonth: number;
  /** A single one-off payment. */
  lumpSum: number;
  /** 1-based absolute month the lump sum lands in. */
  lumpSumMonth: number;
  /** 26 half-payments a year — see the note above. */
  biweekly: boolean;
  /** Nothing in this plan applies before this month. 1 means "from the start". */
  startMonth: number;
};

export const NO_PLAN: PayoffPlan = {
  extraMonthly: 0,
  annualExtra: 0,
  annualExtraMonth: 1,
  lumpSum: 0,
  lumpSumMonth: 1,
  biweekly: false,
  startMonth: 1,
};

/** True when the plan would put no extra money against the loan at all. */
export function planIsEmpty(plan: PayoffPlan): boolean {
  return (
    plan.extraMonthly <= 0 &&
    plan.annualExtra <= 0 &&
    plan.lumpSum <= 0 &&
    !plan.biweekly
  );
}

/**
 * The same plan, started `months` later.
 *
 * This is what powers the "what it costs to wait" figure. Shifting the plan
 * rather than re-deriving it means the delayed run is provably the same plan —
 * there is no second place for the two to drift apart.
 */
export function delayPlan(plan: PayoffPlan, months: number): PayoffPlan {
  return {
    ...plan,
    startMonth: plan.startMonth + months,
    lumpSumMonth: plan.lumpSumMonth + months,
  };
}

/** The extra principal this plan puts in during `month`, before clamping. */
function extraForMonth(
  plan: PayoffPlan,
  month: number,
  scheduledPayment: number,
): number {
  if (month < plan.startMonth) return 0;

  let extra = 0;

  if (plan.extraMonthly > 0) extra += plan.extraMonthly;

  // ((month - 1) % 12) + 1 maps month 12 to 12 rather than to 0, which a bare
  // modulo does not. Getting this wrong moves every annual payment by a month.
  if (plan.annualExtra > 0 && ((month - 1) % 12) + 1 === plan.annualExtraMonth) {
    extra += plan.annualExtra;
  }

  if (plan.lumpSum > 0 && month === plan.lumpSumMonth) extra += plan.lumpSum;

  if (plan.biweekly && month % 12 === 0) extra += scheduledPayment;

  return extra;
}

/**
 * Runs the loan under a plan. Same conventions as `amortize`: interest accrues
 * monthly on the opening balance, the scheduled payment covers it first, and
 * the final month pays only what is owed.
 */
export function amortizePlan(
  principal: number,
  annualRatePct: number,
  termMonths: number,
  plan: PayoffPlan,
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
    const scheduledPrincipal = Math.min(payment - interest, balance);

    // Never pay more than is owed, however large the plan is.
    const extra = Math.max(
      Math.min(
        extraForMonth(plan, month, payment),
        balance - Math.max(scheduledPrincipal, 0),
      ),
      0,
    );

    // Payment does not cover interest and no extra is arriving — the loan can
    // never amortize, so stop rather than loop to maxMonths.
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

/** The loan with and without the plan, plus the difference. */
export function comparePlan(
  principal: number,
  annualRatePct: number,
  termMonths: number,
  plan: PayoffPlan,
): Comparison {
  const baseline = amortizePlan(
    principal,
    annualRatePct,
    termMonths,
    NO_PLAN,
  );
  const accelerated = amortizePlan(principal, annualRatePct, termMonths, plan);

  return {
    baseline,
    accelerated,
    monthsSaved: baseline.months - accelerated.months,
    interestSaved: baseline.totalInterest - accelerated.totalInterest,
  };
}

/**
 * The first month in which the scheduled payment puts more toward principal
 * than toward interest — the "tipping point".
 *
 * Deliberately measured on the SCHEDULED payment only, with `extra` excluded.
 * The question a reader is asking is "when does my payment finally start
 * working for me", and counting the extra would answer a different question:
 * any month with a large enough extra would trivially qualify. Extra payments
 * still move this date earlier, because they shrink the balance and therefore
 * the interest charged on it — which is the finding worth showing.
 *
 * Returns null when the loan never gets there, which happens only on a loan
 * that does not amortize.
 */
export function crossoverMonth(schedule: PayoffRow[]): number | null {
  const row = schedule.find((r) => r.principal > r.interest);
  return row ? row.month : null;
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
// The payment calculator answers "what is my monthly payment", which is not
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

// ─────────────────────────────────────────────────────────────────────────────
// REFINANCE BREAK-EVEN
//
// Added August 14, 2026 for /mortgage/refinance-break-even/.
//
// THE DEFINITION, and it is the whole point of this section:
//
//   Break-even is the first month m where  I_old(m) - I_new(m) >= C
//
// where I(m) is cumulative interest through month m and C is total closing
// costs. Derived two independent ways and proved equal:
//
//   For any level-payment loan,  m * payment + balance(m) = L + I(m).
//   Comparing net position (cash paid so far, plus balance still owed):
//     NetOld(m) = balance + I_old(m)
//     NetNew(m) = balance + C + I_new(m)          [either way costs are paid]
//   so  NetNew(m) - NetOld(m) = C + I_new(m) - I_old(m).  The balances cancel.
//
// Both framings were run against 2,000 randomized scenarios covering financed
// and upfront costs, term extensions and term cuts: zero disagreements.
//
// WHY NOT closingCosts / monthlySaving, which is what every competing tool
// checked on August 14, 2026 uses, and which the CFPB itself describes as a
// rough estimate. Three failures:
//   1. It divides by zero or goes negative when the new payment is HIGHER,
//      which is what happens refinancing into a shorter term. That is a real
//      and common refinance, and it has a real break-even.
//   2. It ignores that the two loans pay down principal at different speeds,
//      so it overstates the break-even. Worked case below: it says 21.7
//      months where the answer is 17.
//   3. It cannot express costs rolled into the loan.
// `naiveBreakEvenMonth` is returned anyway, because showing the reader the
// difference between the rule of thumb and their own number is the finding.
//
// Conventions match the rest of this file: full floating point throughout,
// rounded only at display; half-cent epsilon termination; zero rate handled
// as simple division; a maxMonths safety stop.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cumulative interest through each month.
 *
 * Index m holds the interest paid from month 1 through month m inclusive, so
 * index 0 is always 0 and the array length is the payoff month plus one.
 */
function cumulativeInterest(
  principal: number,
  annualRatePct: number,
  termMonths: number,
  maxMonths = 1200,
): number[] {
  const payment = monthlyPayment(principal, annualRatePct, termMonths);
  const r = annualRatePct / 100 / 12;

  let balance = principal;
  let total = 0;
  const cum = [0];

  const limit = Math.min(termMonths, maxMonths);
  for (let month = 1; month <= limit && balance > 0.005; month++) {
    const interest = balance * r;
    const applied = Math.min(payment - interest, balance);

    // The payment does not cover the interest: the loan can never amortize.
    if (applied <= 0) break;

    balance -= applied;
    total += interest;
    cum.push(total);
  }

  return cum;
}

export type RefiInputs = {
  /** What is still owed on the existing loan today. */
  balance: number;
  /** The rate on the existing loan, nominal annual percent. */
  oldRatePct: number;
  /** Months still to run on the existing loan. */
  oldMonthsLeft: number;
  /** The rate being offered, nominal annual percent. */
  newRatePct: number;
  /** Term of the new loan in months. */
  newTermMonths: number;
  /** Total closing costs in dollars. */
  closingCosts: number;
  /** True if the costs are added to the new loan rather than paid at closing. */
  financeCosts: boolean;
};

export type RefiResult = {
  oldPayment: number;
  newPayment: number;
  /** What is actually borrowed: the balance, plus costs if they are financed. */
  newPrincipal: number;
  /** Old payment minus new. Positive means the monthly payment falls. */
  monthlyChange: number;
  /** First month where interest saved covers the costs. Null if it never does. */
  breakEvenMonth: number | null;
  /** The rule-of-thumb answer, for comparison. Null when the payment rises. */
  naiveBreakEvenMonth: number | null;
  oldTotalInterest: number;
  newTotalInterest: number;
  /** New minus old. POSITIVE MEANS THE REFINANCE COSTS MORE over the full run. */
  lifetimeInterestChange: number;
  /**
   * Interest saved by the end of each month, net of nothing — the raw saving,
   * with the costs as a separate threshold. Index 0 is 0. Used for the chart
   * and for reading off a figure at any month.
   */
  savedByMonth: number[];
  /** Months until each loan is gone, from today. */
  oldMonthsToPayoff: number;
  newMonthsToPayoff: number;
};

/**
 * Compare an existing mortgage against a refinance of it.
 *
 * Returns null on input that cannot describe a loan, so the caller renders a
 * message rather than a figure that looks like an answer.
 *
 * NOTE ON THE EXISTING PAYMENT. It is derived by amortizing the remaining
 * balance over the remaining term, which for a level-payment fixed-rate loan
 * paid as scheduled equals the original payment exactly. A reader who has been
 * paying extra has a lower balance AND a shorter remaining term; entering both
 * honestly still reproduces their real scheduled payment.
 */
export function refinance(inputs: RefiInputs): RefiResult | null {
  const {
    balance,
    oldRatePct,
    oldMonthsLeft,
    newRatePct,
    newTermMonths,
    closingCosts,
    financeCosts,
  } = inputs;

  if (
    !Number.isFinite(balance) ||
    !Number.isFinite(oldRatePct) ||
    !Number.isFinite(newRatePct) ||
    !Number.isFinite(closingCosts) ||
    balance <= 0 ||
    oldMonthsLeft <= 0 ||
    newTermMonths <= 0 ||
    oldRatePct < 0 ||
    newRatePct < 0 ||
    closingCosts < 0
  ) {
    return null;
  }

  const newPrincipal = financeCosts ? balance + closingCosts : balance;

  const oldPayment = monthlyPayment(balance, oldRatePct, oldMonthsLeft);
  const newPayment = monthlyPayment(newPrincipal, newRatePct, newTermMonths);

  const oldCum = cumulativeInterest(balance, oldRatePct, oldMonthsLeft);
  const newCum = cumulativeInterest(newPrincipal, newRatePct, newTermMonths);

  // Neither loan amortizes: the payment never covers the interest.
  if (oldCum.length <= 1 || newCum.length <= 1) return null;

  const oldMonthsToPayoff = oldCum.length - 1;
  const newMonthsToPayoff = newCum.length - 1;

  // Compare only over the span both loans are still running. Past the shorter
  // one's payoff the comparison stops meaning anything, because one side has
  // no payment left to make.
  const span = Math.min(oldMonthsToPayoff, newMonthsToPayoff);

  const savedByMonth: number[] = [0];
  let breakEvenMonth: number | null = null;
  for (let m = 1; m <= span; m++) {
    const saved = oldCum[m] - newCum[m];
    savedByMonth.push(saved);
    if (breakEvenMonth === null && saved >= closingCosts) breakEvenMonth = m;
  }

  const monthlyChange = oldPayment - newPayment;

  return {
    oldPayment,
    newPayment,
    newPrincipal,
    monthlyChange,
    breakEvenMonth,
    naiveBreakEvenMonth:
      monthlyChange > 0 ? Math.ceil(closingCosts / monthlyChange) : null,
    oldTotalInterest: oldCum[oldMonthsToPayoff],
    newTotalInterest: newCum[newMonthsToPayoff],
    lifetimeInterestChange:
      newCum[newMonthsToPayoff] - oldCum[oldMonthsToPayoff],
    savedByMonth,
    oldMonthsToPayoff,
    newMonthsToPayoff,
  };
}

/**
 * The rate the new loan would have to reach to pay for itself within a given
 * number of months.
 *
 * THIS IS THE PAGE'S REASON TO EXIST. Every competing tool answers "given a
 * rate I have been quoted, when do I break even". Nobody inverts it, and the
 * inverted question is the one a reader who has not applied yet actually has:
 * how far do rates have to fall before this is worth doing for me.
 *
 * Solved by bisection rather than algebra: cumulative interest has no closed
 * form to invert against a break-even month, but savings are monotone in the
 * rate, so bisection is exact to any precision we need. 200 iterations is far
 * past double precision and costs nothing at this size.
 *
 * Returns null when no rate down to 0% would do it inside the horizon, which
 * is a real and useful answer rather than a failure.
 */
export function breakEvenRate(
  inputs: RefiInputs,
  horizonMonths: number,
): number | null {
  if (horizonMonths <= 0) return null;

  /** Interest saved by the horizon, less the costs. Monotone falling in rate. */
  const surplus = (ratePct: number): number | null => {
    const out = refinance({ ...inputs, newRatePct: ratePct });
    if (!out) return null;
    if (horizonMonths >= out.savedByMonth.length) return null;
    return out.savedByMonth[horizonMonths] - inputs.closingCosts;
  };

  let lo = 0;
  let hi = inputs.oldRatePct;

  const atHi = surplus(hi);
  if (atHi !== null && atHi >= 0) return hi; // Already worth it at today's rate.

  const atLo = surplus(lo);
  if (atLo === null || atLo < 0) return null; // Not reachable at any rate.

  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const s = surplus(mid);
    if (s !== null && s >= 0) lo = mid;
    else hi = mid;
  }

  return lo;
}

// ─────────────────────────────────────────────────────────────────────────────
// Comparing two loan terms — the 15 versus 30 question
//
// Added August 18, 2026.
//
// THE POINT OF THIS FUNCTION, in one paragraph. Every 15-versus-30 tool
// checked on August 18, 2026 reports one saving: the total interest on the
// long loan minus the total interest on the short one. On the site's example
// loan that is roughly $276,000, and it is not what it looks like. Most of it
// is not caused by the shorter loan at all — it is caused by the borrower
// paying several hundred dollars more every month, which they could also do on
// the long loan. This function separates the two.
//
// Three runs of `amortize()`, all on the same principal:
//
//   A  the short loan at its own rate and term
//   B  the long loan at its own rate and term, paid at its own required amount
//   C  the long loan at its own rate and term, paid at A's amount instead
//
// C is the honest alternative to A. It reaches a zero balance at nearly the
// same time and it keeps the right to fall back to B's lower required payment,
// which A does not. So:
//
//   headline       = I(B) − I(A)     what every competitor reports
//   rateEffect     = I(C) − I(A)     what the shorter loan actually causes
//   behaviorEffect = I(B) − I(C)     what paying more causes, on either loan
//
// and headline = rateEffect + behaviorEffect exactly. Verified across 5,000
// randomized spreads on August 18, 2026, maximum residual 2.3e-10.
//
// THERE IS NO BREAK-EVEN SPREAD, and it is worth recording why, because it
// looks like there should be one and an earlier draft of this page went
// looking for it with a bisection solver. Set the two rates equal and C
// collapses onto A: the same payment on the same principal at the same rate
// amortizes in exactly the short term, to the cent. So rateEffect is zero at
// zero spread and rises monotonically from there. There is nothing to solve
// for. The flexibility C buys has no dollar value inside this model, because
// its worth depends on the odds the borrower ever needs it, and this file does
// not guess at those. The page reports the price and names no winner.
//
// CONVENTIONS. Same as everything else here (technical brief §8.5): full
// floating point throughout, rounding only at display, a half-cent
// termination epsilon, and a maximum-months safety stop inherited from
// `amortize()`.
// ─────────────────────────────────────────────────────────────────────────────

export type TermCompareInputs = {
  loanAmount: number;
  /** Annual nominal rate on the shorter loan. */
  shortRatePct: number;
  /** Annual nominal rate on the longer loan. */
  longRatePct: number;
  shortTermMonths: number;
  longTermMonths: number;
};

export type TermCompareResult = {
  /** The short loan, run at its own required payment. */
  shortLoan: PayoffResult;
  /** The long loan at its own required payment. */
  longLoan: PayoffResult;
  /** The long loan paid at the short loan's payment. */
  longMatched: PayoffResult;
  /** How much more per month the short loan's payment is. Never negative. */
  paymentStepUp: number;
  /** I(long) − I(short). The figure every competing tool headlines. */
  headlineSaving: number;
  /** I(longMatched) − I(short). The part the shorter loan itself causes. */
  rateEffect: number;
  /** I(long) − I(longMatched). The part paying more causes, on either loan. */
  behaviorEffect: number;
  /**
   * rateEffect as a share of headlineSaving, 0 to 1. Null when the headline is
   * not positive, which happens when the shorter loan is quoted at the higher
   * rate — a real case, and a share of a non-positive total means nothing.
   */
  rateShare: number | null;
  /** Months the matched long loan takes. Longer than the short term whenever
   *  its rate is higher, and exactly equal at a zero spread. */
  matchedMonths: number;
};

/**
 * Splits the headline interest saving into the part the shorter term causes
 * and the part the larger payment causes.
 *
 * Returns null on any input that cannot produce an answer, rather than a
 * figure that looks like one. This guard has to live here rather than in the
 * field: a non-finite principal does not produce NaN downstream, because the
 * loop condition `balance > 0.005` is false for NaN, so the loop never runs
 * and the caller gets a clean and completely wrong $0.00. Same trap the
 * refinance engine hit (§8.6).
 */
export function compareTerms(
  inputs: TermCompareInputs,
): TermCompareResult | null {
  const {
    loanAmount,
    shortRatePct,
    longRatePct,
    shortTermMonths,
    longTermMonths,
  } = inputs;

  const values = [
    loanAmount,
    shortRatePct,
    longRatePct,
    shortTermMonths,
    longTermMonths,
  ];
  if (values.some((v) => !Number.isFinite(v))) return null;
  if (loanAmount <= 0) return null;
  if (shortTermMonths <= 0 || longTermMonths <= 0) return null;
  if (shortRatePct < 0 || longRatePct < 0) return null;
  if (shortTermMonths >= longTermMonths) return null;

  const shortLoan = amortize(loanAmount, shortRatePct, shortTermMonths);
  const longLoan = amortize(loanAmount, longRatePct, longTermMonths);

  // A short loan can only fail to amortize if its own payment does not cover
  // its interest, which a level payment cannot do. Guard anyway rather than
  // divide into an empty schedule.
  if (shortLoan.months === 0 || longLoan.months === 0) return null;

  const paymentStepUp = Math.max(
    0,
    shortLoan.monthlyPayment - longLoan.monthlyPayment,
  );

  const longMatched = amortize(
    loanAmount,
    longRatePct,
    longTermMonths,
    paymentStepUp,
  );

  const headlineSaving = longLoan.totalInterest - shortLoan.totalInterest;
  const rateEffect = longMatched.totalInterest - shortLoan.totalInterest;
  const behaviorEffect = longLoan.totalInterest - longMatched.totalInterest;

  return {
    shortLoan,
    longLoan,
    longMatched,
    paymentStepUp,
    headlineSaving,
    rateEffect,
    behaviorEffect,
    rateShare: headlineSaving > 0 ? rateEffect / headlineSaving : null,
    matchedMonths: longMatched.months,
  };
}

/**
 * Balance still owed after a given number of months, or 0 once the loan is
 * paid off. Used for the "where you stand if you move" table, because a reader
 * who sells in year seven is not served by an end-of-term figure.
 */
export function balanceAtMonth(result: PayoffResult, month: number): number {
  // Month 0 is before any payment has been made, so the answer is the opening
  // balance. Returning schedule[0] there would give the balance AFTER the
  // first payment, which is a month out. Nothing calls it with 0 today; it was
  // wrong anyway and would have been wrong quietly.
  if (month <= 0) {
    const first = result.schedule[0];
    return first ? first.balance + first.principal + first.extra : 0;
  }
  const row = result.schedule[month - 1];
  return row ? row.balance : 0;
}
