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
