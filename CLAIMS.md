# Claim table — homepage and payoff calculator

**Built:** August 8, 2026
**Purpose:** every factual assertion in visible copy, with its source, so it can be checked without domain knowledge.

Project brief §9: every number links to a primary source. This table is the record of that.

---

## Verified against primary sources

| # | Claim as it appears on the page | Source | Type | Verified |
|---|---|---|---|---|
| 1 | Conventional PMI: servicer must terminate when the scheduled balance reaches 78% of original value | 12 U.S.C. § 4902(b); [CFPB Ask CFPB](https://www.consumerfinance.gov/ask-cfpb/when-can-i-remove-private-mortgage-insurance-pmi-from-my-loan-en-202/) | Statute | 2026-08-08 |
| 2 | Borrower may request cancellation at 80% of original value | 12 U.S.C. § 4902(a) | Statute | 2026-08-08 |
| 3 | Insurance must end at the midpoint of the amortization period regardless of balance | 12 U.S.C. § 4902(c) — "the first day of the month immediately following the midpoint" | Statute | 2026-08-08 |
| 4 | Both tests require the borrower to be current | 12 U.S.C. § 4902(a)(3), § 4902(c) | Statute | 2026-08-08 |
| 5 | High-risk loans are exempt | 12 U.S.C. § 4902(g) | Statute | 2026-08-08 |
| 6 | "Original value" = lower of contract sales price and appraised value at purchase | CFPB Ask CFPB (as above) | Agency | 2026-08-08 |
| 7 | FHA MIP generally runs for the life of the loan since June 2013 | [Federal Reserve FEDS Notes](https://www.federalreserve.gov/econresdata/notes/feds-notes/2016/changing-fha-mortgage-insurance-premiums-and-the-effects-on-lending-20160929.html) — case assignment date on or after June 3, 2013 | Agency | 2026-08-08 |
| 8 | HPA governs conventional borrower-paid PMI, not FHA MIP | [NCUA HPA guide](https://ncua.gov/regulation-supervision/manuals-guides/federal-consumer-financial-protection-guide/compliance-management/lending-regulations/homeowners-protection-act-pmi-cancellation-act); House Financial Services Committee bill summary | Agency + Congressional | 2026-08-08 |
| 9 | Extra payments can advance the 80% request date but not the 78% automatic date | [CFPB Bulletin 2015-03](https://files.consumerfinance.gov/f/201508_cfpb_compliance-bulletin_private-mortgage-insurance-cancellation-and-termination.pdf) | Agency | 2026-08-08 |

Each of 1–9 has at least two independent sources: the statute text itself plus an agency summary (CFPB, NCUA, or the Federal Reserve).

---

## Arithmetic — verified by computation, not by citation

| Claim | How it was checked | Result |
|---|---|---|
| Amortization formula M = P·r(1+r)ⁿ / ((1+r)ⁿ−1) | Engine output vs. closed-form computed independently | $2,205.23 on $340,000 @ 6.75%/30yr, matches to the cent |
| Total interest | Compared against (payment × term) − principal | Agrees within $1 |
| Balance closes to zero at term | Final row of the schedule | 0.00 at month 360 |
| Midpoint termination month | 30yr → 181, 15yr → 91 | Matches § 4902(c) |
| PMI boundary at exactly 20% down | LTV 80.00% → no PMI; 80.01% → PMI | Correct on both sides |
| PITI components sum to the displayed total | Floating-point comparison | Exact |
| Negative and zero inputs | Fuzzed | No crash, no NaN |

---

## Not claims — prefilled input values

These sit in input boxes and are **not** stated as fact anywhere in prose, a heading, a meta description, or schema.

| Field | Default | Status |
|---|---|---|
| Property tax | 1.2%/yr | ⚠️ Round placeholder. Needs Census ACS before it can be called an average |
| Homeowners insurance | 0.5%/yr | ⚠️ Round placeholder. Needs NAIC before it can be called an average |
| Mortgage insurance | 0.5%/yr | ⚠️ Round placeholder. Needs insurer rate cards |
| Home price / rate / term | $425,000 / 6.75% / 30yr | Labelled site example, per project brief §9 |

The page tells the visitor these are placeholders, not local averages.

---

## Claims removed during review

Recorded so they don't get reintroduced.

| Removed | Why |
|---|---|
| "Federal law forces mortgage insurance to end on a schedule, so it is temporary" | **False for FHA borrowers.** Replaced with the conventional/FHA distinction |
| "A common rule of thumb sets aside 1% of the home's value each year for repairs" | Unsourced. No primary source was ever checked for it |
| "Most calculators quote you principal and interest and stop there" | **False.** Zillow, Bankrate and NerdWallet all show full PITI. Not on the brief's §6 gap list either |
| "The large comparison sites are paid by lenders for your contact details" | Unverifiable assertion about third-party finances. Restated as what those sites disclose themselves |
| "Every other mortgage calculator is trying to sell you a mortgage" | Absolute and unprovable. Restated as a claim about this site |
| "Property tax is set by your county" | Incomplete — city, school district and special districts also levy |
| "HOA dues are never paid through the lender" | Absolute. Softened to "usually" |
| "Homeowners insurance is required by every lender" | Absolute. Softened to "required by mortgage lenders" |
| "Your mortgage payment is five things, not one" | Contradicted our own calculator, which shows three segments at the default 20% down |

---

## Still unverified — do not state these on any page yet

- National or state average property tax rates
- National average homeowners insurance premiums
- Typical PMI rate ranges
- Current mortgage rates (the `/rates/` tracker is month 3, and is FRED-sourced by design)
- Any claim about a named competitor's business model

---

# Claim table — refinance break-even calculator

**Built:** August 14, 2026
**Page:** `/mortgage/refinance-break-even/`

Every URL below was opened on the date shown. Nothing here is from recall, and
nothing is cited from an aggregator, a competitor's calculator, or an AI answer.

## Verified against primary sources

| # | Claim as it appears on the page | Primary source | Corroboration | Verified |
|---|---|---|---|---|
| 1 | Points paid to refinance normally cannot be deducted in full in the year paid, and are spread over the loan | [IRS Pub 936](https://www.irs.gov/pub/irs-pdf/p936.pdf) | [IRS FAQ, real estate](https://www.irs.gov/faqs/itemized-deductions-standard-deduction/real-estate-taxes-mortgage-interest-points-other-property-expenses/real-estate-taxes-mortgage-interest-points-other-property-expenses-6); IRS IR-2003-127 | 2026-08-14 |
| 2 | Points are spread by dividing across the number of scheduled payments, not by the number of years | IRS FAQ (as above) | IRS Tax Tip 2004-57 | 2026-08-14 |
| 3 | Unamortized points can be deducted in the year the loan ends, unless refinanced with the same lender | IRS Pub 936 | IRS FAQ (as above) | 2026-08-14 |
| 4 | Charges such as appraisal and processing fees generally are not deductible | IRS IR-2003-127 | IRS Pub 936, "amounts charged for services" | 2026-08-14 |
| 5 | One discount point costs 1% of the loan amount | [CFPB newsroom](https://www.consumerfinance.gov/about-us/newsroom/cfpb-finds-americans-are-paying-upfront-fees-seeking-to-lower-interest-rates-on-mortgages/) | ABA Banking Journal; Compliance Cohort | 2026-08-14 |
| 6 | Points have no fixed value in terms of how much they move the rate | CFPB newsroom (as above) | Compliance Cohort summary of the same report | 2026-08-14 |
| 7 | The costs-divided-by-monthly-saving method is a rough estimate | [CFPB Data Spotlight, discount points](https://www.consumerfinance.gov/data-research/research-reports/data-spotlight-trends-in-discount-points-amid-rising-interest-rates/) | — the CFPB's own wording | 2026-08-14 |
| 8 | Prepayment penalty capped at 2% of the amount prepaid in years 1–2, 1% in year 3, barred after 3 years | [eCFR 12 C.F.R. § 1026.43(g)](https://www.ecfr.gov/current/title-12/chapter-X/part-1026/subpart-E/section-1026.43) | Cornell LII; Fed Consumer Compliance Outlook | 2026-08-12 |
| 9 | Freddie Mac publishes a national survey average weekly, on Thursdays | [Freddie Mac PMMS](https://www.freddiemac.com/pmms) | PMMS FAQ on the same page | 2026-08-14 |
| 10 | PMMS surveys purchase applications, so it is not a refinance rate and is not an offer | Freddie Mac PMMS FAQ | Same page, methodology note | 2026-08-14 |

## Arithmetic — verified by computation, not by citation

| Claim | How it was checked | Result |
|---|---|---|
| Break-even is the first month where interest saved exceeds closing costs | Derived twice: by cumulative-interest difference, and by net position (cash paid plus balance owed). Proven algebraically equal, then tested across 2,000 randomized scenarios | Zero disagreements |
| Every figure produced by `refinance()` | Reimplemented from the algebra in a separate file, not by importing the engine; compared across 5,000 randomized scenarios spanning financed and upfront costs, term cuts and extensions | Zero mismatches |
| Payment arithmetic | Compared to mortgagecalculator.org's published worked example: $200,000 at 5% over 240 months, and the same refinanced at 3.25% over 180 months | Matched both to the cent |
| The rule of thumb is out by 4 months on the example loan | Both computed by the engine at build time; the page prints whichever gap the reader's own inputs produce | Shortcut 19, correct 15 |
| Refinancing a 20-year remainder into a fresh 30 costs more interest even at a 2-point rate drop | Computed from the engine | Confirmed |

## Deliberately NOT stated on the page

| Considered | Why it was left out |
|---|---|
| A current mortgage rate figure | PMMS moves weekly. A number stated here is wrong within seven days and nobody would update it. The page links to PMMS instead and states no rate |
| "Closing costs are typically 2% to 5% of the loan" | This is a **home purchase** figure. A refinance has no seller, no agent commission and normally no owner's title policy. Applying it overstates the break-even |
| A sourced average refinance closing cost | Sources conflict and all are stale: CoreLogic/ClosingCorp put 2021 refinances at $2,375 excluding transfer taxes; the CFPB's 2022 figure of $5,954 for total loan costs is discussed in a home-purchase context. Conflict recorded, not resolved (§0.3). The field carries a round placeholder instead |
| A recommendation about whether to refinance | Advice framing. The page reports the month, the rate needed, and the lifetime interest, and stops |

## Still unverified — do not state these on any page yet

- Any current or average refinance closing cost figure
- Average refinance rates, as distinct from PMMS purchase rates
- How long a refinance takes to close
- Typical equity or credit score thresholds to qualify for a refinance
