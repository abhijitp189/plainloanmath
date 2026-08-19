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
    label: "CFPB: What is a prepayment penalty?",
    url: "https://www.consumerfinance.gov/ask-cfpb/what-is-a-prepayment-penalty-en-1957/",
    verified: "2026-08-12",
  },
  payingDown: {
    label: "CFPB: How does paying down a mortgage work?",
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

/**
 * Long-run NOMINAL compound annual returns, 1928-2025.
 *
 * These prefill the "pay off or invest" comparison. They are HISTORY, not a
 * forecast, and the page says so in the sentence beside the control. Nobody
 * can cite a future rate of return to a statute the way a PMI threshold can be
 * cited, which is why this is a required reader input with a starting value
 * rather than a fixed assumption baked into the math (project brief §18).
 *
 * COMPUTED, NOT COPIED. Each figure was calculated from the annual return
 * series in the source below, read August 13, 2026. The blend is computed from
 * the annual series with yearly rebalancing — averaging the two headline rates
 * instead gives 7.8%, which is wrong, because a rebalanced portfolio does not
 * earn the weighted average of two compound rates.
 *
 * NOMINAL, deliberately. The mortgage rate a reader types is nominal. Mixing a
 * real return against a nominal mortgage rate would corrupt the comparison far
 * worse than any rounding. Inflation is named in "what this leaves out".
 *
 * A CONFLICT IN THE SOURCE, recorded rather than resolved (§0.3). Every year
 * from 1928 to 2024 reconciles exactly against the table's own cumulative
 * column. 2025 does not: the stated 10-year Treasury return of 7.80% implies
 * 8.29% from that column's own movement ($7,159.45 to $7,752.88). Both
 * readings were tested and both give 4.5 / 8.3 / 10.0 at one decimal, so the
 * figures below are unaffected. Re-check at the next annual update.
 */
export const RETURN_TIERS = [
  { key: "treasury", label: "10-year Treasuries", pct: 4.5 },
  { key: "blend", label: "60/40 stocks and Treasuries", pct: 8.3 },
  { key: "stocks", label: "S&P 500", pct: 10.0 },
] as const;

/** The starting value: the middle tier. Overwritable, and not a prediction. */
export const RETURN_DEFAULT_PCT = 8.3;

export const RETURN_SOURCE = {
  label: "NYU Stern: historical returns on stocks, bonds and bills",
  url: "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html",
  /** The source's own last-updated stamp. */
  effective: "2026-01-05",
  verified: "2026-08-13",
} as const;

/**
 * ⚠️ STARTING VALUE FOR THE CLOSING-COST FIELD — NOT A PUBLISHED AVERAGE ⚠️
 *
 * $4,000 prefills the refinance calculator so a visitor sees a working result
 * immediately (design guide §9.8, first paint). It is deliberately round so it
 * reads as a placeholder, and the field tells the reader to replace it with
 * the figure on their own Loan Estimate.
 *
 * WHY THERE IS NO SOURCED DEFAULT. Unlike a PMI threshold, no authority
 * publishes a current refinance closing-cost figure, and the available numbers
 * conflict badly. Recorded rather than resolved (project brief §0.3):
 *
 *   - CoreLogic/ClosingCorp put the 2021 national average for a single-family
 *     REFINANCE at $2,375, under 1% of the average refinance loan, excluding
 *     recordation and other specialty taxes.
 *   - The CFPB's 2022 HMDA report put total loan costs at $5,954, up 22% from
 *     2021, with 50.2% of borrowers paying discount points at a median $2,370.
 *     That release discusses home purchase borrowers throughout.
 *   - The widely repeated "2% to 5% of the loan amount" is a PURCHASE figure.
 *
 * THE TRAP THIS AVOIDS, and it is the page's reason to exist: applying a
 * purchase percentage to a refinance overstates the cost, which overstates the
 * break-even, which tells a reader not to refinance when they should. A
 * refinance has no seller, no agent commission and normally no owner's title
 * policy. ClosingCorp's own comparison for 2021 was $3,860 for a purchase
 * against $2,375 for a refinance on the same exclusions.
 *
 * RULE: this number may sit in an input box. It may NOT appear in prose, a
 * heading, a meta description or a schema field.
 */
export const REFI_COST_PLACEHOLDER = 4_000;

/**
 * Sources for the refinance page. Every URL read August 14, 2026.
 *
 * `pointsBreakEven` is the CFPB describing the closing-costs-over-monthly-
 * saving shortcut as a rough estimate. It is cited on the page for exactly
 * that: the shortcut is theirs, the word "roughly" is theirs, and the page
 * shows how far off it runs on the reader's own loan.
 *
 * `pointsNoFixedValue` matters because several competing tools imply a point
 * buys a fixed rate reduction. The CFPB states points have no fixed value in
 * terms of the change in interest rate, which is why this calculator takes the
 * quoted rate as an input instead of deriving it from points.
 */
export const REFI_SOURCES = {
  pmms: {
    label: "Freddie Mac Primary Mortgage Market Survey",
    url: "https://www.freddiemac.com/pmms",
    verified: "2026-08-14",
  },
  pointsBreakEven: {
    label: "CFPB: trends in discount points amid rising interest rates",
    url: "https://www.consumerfinance.gov/data-research/research-reports/data-spotlight-trends-in-discount-points-amid-rising-interest-rates/",
    verified: "2026-08-14",
  },
  pointsNoFixedValue: {
    label: "CFPB: borrowers paying upfront fees to lower mortgage rates",
    url: "https://www.consumerfinance.gov/about-us/newsroom/cfpb-finds-americans-are-paying-upfront-fees-seeking-to-lower-interest-rates-on-mortgages/",
    verified: "2026-08-14",
  },
  irsPoints: {
    label: "IRS Publication 936: Home Mortgage Interest Deduction",
    url: "https://www.irs.gov/pub/irs-pdf/p936.pdf",
    verified: "2026-08-14",
  },
  irsPointsFaq: {
    label: "IRS: deducting refinance points over the life of the loan",
    url: "https://www.irs.gov/faqs/itemized-deductions-standard-deduction/real-estate-taxes-mortgage-interest-points-other-property-expenses/real-estate-taxes-mortgage-interest-points-other-property-expenses-6",
    verified: "2026-08-14",
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Freddie Mac's Primary Mortgage Market Survey, one dated snapshot.
//
// Guardrail 3: no dated figure is typed into a page. This one lives here
// because /learn/when-you-start-paying-more-principal-than-interest/ has to
// establish, once, that the rate environment its arithmetic assumes is the one
// that exists — the whole premise of that article is that the pages currently
// ranking were computed at 3% and nobody has published a figure for a loan
// written above 5%.
//
// TWO THINGS THIS FIGURE IS NOT, both from Freddie Mac's own FAQ and both of
// which the page states:
//
//   - It is not an offer or a quote. It is a survey of applications submitted
//     through Loan Product Advisor, for conventional conforming purchase loans
//     from borrowers with 20% down and good to excellent credit.
//   - It is not a refinance rate. PMMS surveys purchase applications.
//
// AND ONE THING IT CANNOT SUPPLY: fees and points. Freddie Mac stopped
// reporting them in November 2022 because lenders are no longer always
// required to provide them.
//
// The article states this once, with the survey date attached, and never
// again. A rate repeated through the prose is a maintenance liability that
// nobody would ever come back to update. When /rates/ ships (project brief
// §17) it reads FRED weekly and this constant becomes the fallback rather than
// the source.
// ─────────────────────────────────────────────────────────────────────────────

export const PMMS = {
  /** Survey week the figures below belong to. */
  weekEnding: "2026-08-13",
  thirtyYearPct: 6.67,
  fifteenYearPct: 5.96,
  /** The same week one year earlier, for the "not a spike" point. */
  thirtyYearYearAgoPct: 6.58,
  source: {
    label: "Freddie Mac Primary Mortgage Market Survey",
    url: "https://www.freddiemac.com/pmms",
    verified: "2026-08-18",
  },
} as const;

/**
 * The rate on the shorter loan in the 15-versus-30 page's worked example.
 *
 * DERIVED, NOT TYPED. It is the site's recurring 6.75% less the gap between
 * the two PMMS series above, so it moves with that constant and cannot drift
 * away from it. At the week ending 08/13/2026 that gap is 0.71 points, giving
 * 6.04%.
 *
 * It is an ILLUSTRATION on the same footing as EXAMPLE, not a published
 * average and not a rate anyone is being offered. The point of the page is
 * that the size of this gap is the whole financial case for the shorter loan,
 * so the calculator takes both rates as required inputs and this figure only
 * ever prefills a box and drives the worked example in the prose.
 */
export const EXAMPLE_SHORT_RATE_PCT = Number(
  (EXAMPLE.annualRatePct - (PMMS.thirtyYearPct - PMMS.fifteenYearPct)).toFixed(
    2,
  ),
);

/**
 * Sources for the 15-versus-30 page. Every URL read live on August 18, 2026.
 *
 * `servicerRules` is the one that matters most, because the whole page turns
 * on whether a borrower can actually pay a 30-year loan at a 15-year loan's
 * amount. The CFPB says to check whether your loan allows extra payments and
 * to make sure they reach the principal rather than sitting somewhere else,
 * and it describes the suspense account behavior that catches people out: a
 * payment that is not a full installment can be held until enough accumulates
 * to make one. That is the practical failure mode of the strategy this page
 * describes, so the page states it rather than assuming it away.
 *
 * `servicerRules` also records that the periodic statement must disclose any
 * penalty for paying the loan off early, which is where a reader should look
 * before relying on any of this.
 */
export const TERM_SOURCES = {
  /**
   * The rule that makes "pay the 30 like a 15" work, from a primary rather
   * than from inference. Fannie Mae's Servicing Guide C-1.2-01 requires the
   * servicer to immediately accept and apply an additional principal payment
   * that the BORROWER HAS IDENTIFIED as such, on a current loan. The
   * identification is the operative part, and it is why the page tells the
   * reader to label the payment rather than just send it.
   *
   * SCOPE, stated on the page rather than glossed over: this binds servicers
   * of loans Fannie Mae owns or guarantees. It is not a universal rule for
   * every mortgage, so the page attributes it rather than presenting it as
   * federal law.
   */
  fannieCurtailment: {
    label:
      "Fannie Mae Servicing Guide C-1.2-01: processing additional principal payments",
    url: "https://servicing-guide.fanniemae.com/svc/c-1.2-01/processing-additional-principal-payments",
    verified: "2026-08-18",
  },
  servicerRules: {
    label: "CFPB: your mortgage servicer must comply with federal rules",
    url: "https://www.consumerfinance.gov/consumer-tools/mortgages/your-mortgage-servicer-must-comply-with-federal-rules/",
    verified: "2026-08-18",
  },
  pmms: {
    label: "Freddie Mac Primary Mortgage Market Survey",
    url: "https://www.freddiemac.com/pmms",
    verified: "2026-08-18",
  },
} as const;

/** Last full editorial review, shown on the page and matching the schema. */
export const LAST_REVIEWED = "2026-08-08";

export const SITE = {
  name: "Plain Loan Math",
  url: "https://plainloanmath.com",
  tagline: "Mortgage math, explained plainly.",
  email: "plainloanmath@gmail.com",
} as const;
