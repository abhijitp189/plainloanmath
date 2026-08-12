// ─────────────────────────────────────────────────────────────────────────────
// Every dated or sourced figure on this site lives in this file.
//
// Technical brief §8: no dated figure is ever typed directly into a page. The
// December constants review is one file to edit instead of a hunt through
// twenty pages for a number nobody remembers writing.
//
// THE TRAP: prose does not auto-update. If an article says "the 2026 limit of
// $832,750", changing the constant below will NOT change that sentence. Any
// page whose visible text repeats one of these numbers must be listed under
// `mentionedOn` so it can be found again.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PMI cancellation and termination thresholds.
 *
 * These are federal law, not market data, so they do not expire the way a rate
 * or a loan limit does. They still live here because any page that states them
 * has to cite the statute, and the citation belongs next to the number.
 *
 * Source: Homeowners Protection Act of 1998, 12 U.S.C. § 4901 et seq.
 *   - Borrower-requested cancellation at 80% of original value: § 4902(a)
 *   - Automatic termination at 78% of original value: § 4902(b)
 *   - Final termination at the midpoint of the amortization schedule: § 4902(c)
 *
 * Verified August 8, 2026 against:
 *   https://www.consumerfinance.gov/ask-cfpb/when-can-i-remove-private-mortgage-insurance-pmi-from-my-loan-en-202/
 *   https://ncua.gov/regulation-supervision/manuals-guides/federal-consumer-financial-protection-guide/compliance-management/lending-regulations/homeowners-protection-act-pmi-cancellation-act
 *
 * Scope limits worth stating on any page that uses these: the HPA covers
 * conventional loans with borrower-paid PMI. It does not govern FHA mortgage
 * insurance premiums, which follow separate HUD rules, and it carves out
 * "high-risk" loans.
 *
 * mentionedOn: (no page states these in prose yet)
 */
export const PMI = {
  /** Borrower may request cancellation at this LTV. They must ask. */
  requestLtv: 0.8,
  /** Servicer must terminate at this LTV, unasked. */
  automaticLtv: 0.78,
} as const;

export const PMI_SOURCE = {
  label: "Homeowners Protection Act of 1998, 12 U.S.C. § 4901 et seq.",
  url: "https://www.consumerfinance.gov/ask-cfpb/when-can-i-remove-private-mortgage-insurance-pmi-from-my-loan-en-202/",
  verified: "2026-08-08",
} as const;

/**
 * Federal limits on mortgage prepayment penalties.
 *
 * Like the PMI thresholds above, these are federal law rather than market
 * data, so they do not expire the way a rate does. They live here because the
 * payoff page states them and the citation belongs next to the number.
 *
 * Regulation Z, 12 C.F.R. § 1026.43(g), implementing the Dodd-Frank amendments
 * to TILA at 15 U.S.C. § 1639c. A prepayment penalty on a covered transaction
 * is permitted ONLY where the loan is a qualified mortgage, has a rate that
 * cannot increase after consummation, and is not a higher-priced mortgage
 * loan — § 1026.43(g)(1). Where it is permitted, § 1026.43(g)(2) caps it:
 *
 *   - it may not apply at all after three years from consummation
 *   - it may not exceed 2% of the balance prepaid in the first two years
 *   - it may not exceed 1% of the balance prepaid in the third year
 *
 * A widely repeated version of this gives the first year as 3%. That is wrong;
 * the regulation states 2% for the whole of the first two years. Read from
 * eCFR on August 12, 2026 and corroborated against Cornell LII and the Federal
 * Reserve's Consumer Compliance Outlook:
 *   https://www.ecfr.gov/current/title-12/chapter-X/part-1026/subpart-E/section-1026.43
 *   https://www.law.cornell.edu/cfr/text/12/1026.43
 *
 * mentionedOn: /mortgage/payoff-with-extra-payments/
 */
export const PREPAYMENT_PENALTY = {
  /** Maximum penalty, as a percent of the balance prepaid, in years 1–2. */
  maxPctFirstTwoYears: 2,
  /** Maximum penalty, as a percent of the balance prepaid, in year 3. */
  maxPctThirdYear: 1,
  /** No penalty may apply after this many years from consummation. */
  maxYears: 3,
} as const;

export const PREPAYMENT_SOURCE = {
  label: "Regulation Z, 12 C.F.R. § 1026.43(g)",
  url: "https://www.ecfr.gov/current/title-12/chapter-X/part-1026/subpart-E/section-1026.43",
  verified: "2026-08-12",
} as const;

/**
 * CFPB consumer guidance cited on the payoff page. Read August 12, 2026.
 *
 * The prepayment answer is the source for the statement that penalties do not
 * normally attach to extra principal paid in small amounts. The amortization
 * answer is the source for the front-loading explanation.
 */
export const CFPB_SOURCES = {
  prepaymentPenalty: {
    label: "CFPB — What is a prepayment penalty?",
    url: "https://www.consumerfinance.gov/ask-cfpb/what-is-a-prepayment-penalty-en-1957/",
    verified: "2026-08-12",
  },
  payingDown: {
    label: "CFPB — How does paying down a mortgage work?",
    url: "https://www.consumerfinance.gov/ask-cfpb/how-does-paying-down-a-mortgage-work-en-1943/",
    verified: "2026-08-12",
  },
} as const;

/**
 * The recurring worked example used across the whole site.
 *
 * Project brief §9: one example everywhere, so figures stay comparable page to
 * page. Competitors use inconsistent examples; this is a real differentiator.
 * A $425,000 home with 20% down is exactly a $340,000 loan.
 *
 * This is an illustration, not a claim about the market. It is safe to state
 * in prose because it is labeled as an example.
 */
export const EXAMPLE = {
  homePrice: 425_000,
  downPaymentPct: 20,
  loanAmount: 340_000,
  annualRatePct: 6.75,
  termYears: 30,
} as const;

/**
 * ⚠️ STARTING VALUES FOR INPUT FIELDS — NOT PUBLISHED AVERAGES ⚠️
 *
 * These prefill the calculator so a visitor sees a working result immediately.
 * They are round, plausible numbers, NOT sourced national figures.
 *
 * A prefilled input a visitor can overwrite is not a factual claim. A sentence
 * saying "the average American pays 1.2% in property tax" IS one, and would
 * need a primary source (Census ACS for property tax, NAIC for homeowners
 * insurance, and the mortgage insurers' published rate cards for PMI).
 *
 * RULE: these numbers may sit in an input box. They may NOT appear in prose,
 * a heading, a meta description, or a schema field until they are replaced
 * with sourced figures and given a verified-on date above.
 */
export const FIELD_DEFAULTS = {
  /** Percent of home price per year. */
  propertyTaxPct: 1.2,
  /** Percent of home price per year. */
  homeInsurancePct: 0.5,
  /** Percent of the loan amount per year, charged only above 80% LTV. */
  pmiRatePct: 0.5,
  monthlyHoa: 0,
} as const;

/** Last full editorial review, shown on the page and matching the schema. */
export const LAST_REVIEWED = "2026-08-08";

export const SITE = {
  name: "Plain Loan Math",
  url: "https://plainloanmath.com",
  tagline: "Mortgage math, explained plainly.",
  email: "plainloanmath@gmail.com",
} as const;
