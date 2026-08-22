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

---

## /learn/when-you-start-paying-more-principal-than-interest/

Verified August 15, 2026. Every arithmetic figure on this page is computed at
build time from `lib/mortgage.ts` and is not typed into the copy, so the page
cannot drift from the engine. The claim table below covers the figures that
come from outside the engine, plus the one arithmetic result that needed an
outside check.

| Claim | Primary source | Corroboration | Verified |
|---|---|---|---|
| 30-year fixed averaged 6.67%, 15-year 5.96%, week ending 08/13/2026; 30-year was 6.58% a year earlier | Freddie Mac PMMS, https://www.freddiemac.com/pmms | Freddie Mac's own 08/06/2026 release (6.69% / 6.01%) shows the series and the week-on-week move; GlobeNewswire carried the 08/13 release | 2026-08-15 |
| PMMS surveys conventional conforming purchase applications from borrowers with 20% down and good to excellent credit, and is not an offer | Freddie Mac PMMS methodology note on the same page | Freddie Mac PMMS FAQ | 2026-08-15 |
| Interest is charged on the outstanding balance, so early payments are mostly interest with the remainder going to principal | CFPB, https://www.consumerfinance.gov/ask-cfpb/how-does-paying-down-a-mortgage-work-en-1943/ | Matches the engine's own output; consistent with the CFPB refinance handout's illustrations | 2026-08-15 |
| Escrow is an account a lender establishes to cover property-related bills such as taxes and insurance | CFPB, https://www.consumerfinance.gov/ask-cfpb/what-is-an-escrow-or-impound-account-en-140/ | CFPB servicing handout, which requires the escrow portion to be itemized on the monthly statement | 2026-08-15 |
| A fixed rate does not change; an adjustable rate can move at each adjustment, rewriting the schedule | CFPB, https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-fixed-rate-and-adjustable-rate-mortgage-arm-loan-en-100/ | CFPB refinance handout, section 3 | 2026-08-15 |
| Refinancing pays off the current mortgage with money from a new mortgage | CFPB "Should I refinance?" handout (9/2020), https://files.consumerfinance.gov/f/documents/cfpb_should_i_refinance_handout.pdf | Fetched and read in full 08/15/2026; the same handout notes the new loan carries a new term which could be longer | 2026-08-15 |
| Borrowers should check whether the loan allows extra payments and, if so, confirm they are applied to principal rather than interest | CFPB "Know your rights: your mortgage servicer must comply with federal rules" (9/2020), https://files.consumerfinance.gov/f/documents/cfpb_know_your_rights_mortgage_servicer_comply_federal_rules_handout.pdf | Fetched and read in full 08/15/2026 | 2026-08-15 |
| The monthly mortgage statement must show how much of the payment goes to principal, to interest and to escrow | Same servicing handout, "Billing information in writing" | Reg X periodic statement requirements | 2026-08-15 |
| At 3%, 4% and 5% on a 30-year loan the crossover falls at months 84, 153 and 195 | `lib/mortgage.ts`, computed at build time | Reproduced by an independent script written from the formula; matches SmartAsset's 2021 study (84 and 195) and HSH's 2021 answer (about 154 at 4%) | 2026-08-15 |

### Stated deliberately, and why

- **The rate appears exactly once**, with its survey week attached. A rate
  repeated through the prose is a figure nobody would return to update. It does
  not appear in the FAQ at all, because FAQ answers feed structured data and a
  dated market figure inside undated schema is a claim that goes stale silently.
- **The extra-payment crossover is stated as month 164, not 147.** Both are
  correct. 164 measures the scheduled payment's own split, which is what
  `crossoverMonth()` has always measured and what the payoff calculator
  publishes; 147 counts the extra $250 as principal as well. The page says which
  one it is rather than picking silently.
- **The 15-year comparison uses 6.00%, not 6.75%.** A 15-year loan is not priced
  like a 30-year one, so holding the rate equal would have described a choice
  nobody is offered. The same-rate figure is given too, labeled as isolating the
  term.

### Not stated, and why

- **No claim about how many borrowers reach the crossover before selling or
  refinancing.** No primary source was found for it.
- **No current-rate figure anywhere but the one dated sentence**, and no forecast.
- **No recommendation** about extra payments, term choice or refinancing. The
  page computes both sides and stops.

---

## `/learn/when-does-pmi-drop-off/`

Reviewed 2026-08-19. Every statutory rule below was read from the U.S. Code on
that date, not recalled. Every month was computed at build time by
`pmiSchedule()` in `lib/mortgage.ts`, which is the same function the payment
calculator uses, and independently reproduced by a separate script written from
the amortization formula.

| Claim | Source | Check | Verified |
|---|---|---|---|
| Borrower may request cancellation at 80% of original value, in writing, with good payment history, current, and evidence value has not declined | 12 U.S.C. § 4902(a), including the "or any later date" clause and the subordinate-lien certification at § 4902(a)(4)(B) | Read from uscode.house.gov | 2026-08-19 |
| The cancellation date may be taken on the initial schedule **or** on actual payments, at the borrower's option | 12 U.S.C. § 4901(2)(A)(i) and (ii) | Read from statute | 2026-08-19 |
| Automatic termination at 78% is fixed by the initial amortization schedule, irrespective of the outstanding balance | 12 U.S.C. § 4901(18)(A), § 4902(b) | Read from statute. This is the distinction the page is built around | 2026-08-19 |
| Final termination no later than the first day of the month after the midpoint; midpoint is month 180 on a 30-year loan, so the deadline is month 181 | 12 U.S.C. § 4902(c), § 4901(7) | Read from statute. `pmiSchedule().finalMonth` returns the deadline, 181, not the midpoint | 2026-08-19 |
| Original value is the lesser of sales price or appraised value at consummation | 12 U.S.C. § 4901(12) | Read from statute | 2026-08-19 |
| All three dates recalculate on a loan modification | 12 U.S.C. § 4902(d); Fannie Mae B-8.1-04 | Read from both | 2026-08-19 |
| Lender-paid MI is outside §§ 4902 to 4904 and ends only on refinance, payoff or other termination | 12 U.S.C. § 4905(b), § 4905(c)(1)(B) | Read from statute | 2026-08-19 |
| FHA and VA are excluded from the definition of private mortgage insurance | 12 U.S.C. § 4901(13) | Read from statute | 2026-08-19 |
| The chapter reaches single-family principal residences consummated on or after July 29, 1999 | 12 U.S.C. § 4901(14), § 4901(15) | Read from statute | 2026-08-19 |
| High-risk loans terminate at 77% rather than 78%, and the midpoint rule still applies | 12 U.S.C. § 4902(g)(1)(B), (g)(2) | Read from statute | 2026-08-19 |
| Fannie Mae current-value termination: 75% LTV at two to five years' seasoning, 80% past five years, 80% where two-year seasoning is waived for borrower improvements | Fannie Mae Servicing Guide B-8.1-04 | Read from the Guide, edition published 2026-08-12 | 2026-08-19 |
| The servicer must not solicit for current-value termination, and may act only on a borrower-initiated request | Fannie Mae B-8.1-04 | Read from the Guide | 2026-08-19 |
| On the original-value route the servicer **is** authorized to notify a borrower approaching 80%, but may terminate only after a direct response | Fannie Mae B-8.1-04 | Read from the Guide | 2026-08-19 |
| A denial on an automated value does not end the original-value route: the borrower may pay down further or elect a BPO or appraisal | Fannie Mae B-8.1-04 | Read from the Guide | 2026-08-19 |
| Premiums stop within 30 days; notice within 30 days; unearned premiums refunded within 45 days; no fee for required notices; written grounds for denial within 30 days | 12 U.S.C. § 4902(e)(1), § 4902(f)(1), § 4906, § 4904(b); Fannie Mae B-8.1-04 | Read from both | 2026-08-19 |
| § 4908(a)(2) preserves state laws enacted within two years of the Act, in states regulating PMI on or before January 2, 1998, where the state law is earlier, at a higher balance, or more disclosing | 12 U.S.C. § 4908(a)(2) | Read from statute | 2026-08-19 |
| On $382,500 at 6.75% over 30 years: request month 98, automatic month 112, a 14-month window | `lib/mortgage.ts` `pmiSchedule()`, computed at build time | Reproduced by an independent script across all five tiers and all seven extra-principal rows | 2026-08-19 |
| $100 extra per month moves the request date to month 79 and leaves the automatic date at 112 | `lib/mortgage.ts` `amortize()`, computed at build time | Reproduced independently. The automatic date is invariant by construction, since `pmiSchedule` amortizes with zero extra | 2026-08-19 |

### Stated deliberately, and why

- **The 20%-down canonical example is adapted, not abandoned.** Twenty percent
  down carries no PMI, so the page holds the home price, rate and term constant
  and moves only the down payment. Project brief §10.
- **The midpoint and the deadline are given as two different months.** Month 180
  is the midpoint under § 4901(7); month 181 is the last date PMI may be
  imposed under § 4902(c). Sources that give one figure for both are compressing
  the statute.
- **The servicer-notification asymmetry is stated even though it softens the
  page's own argument.** B-8.1-04 forbids soliciting on the current-value route
  and permits notification on the original-value route. Reporting only the
  first would have been the stronger sentence and the wrong one.
- **The verbal-request nuance is kept.** Fannie Mae permits a servicer to act on
  a verbal request; only writing satisfies § 4902(a). A reader who telephones
  and believes the matter closed is the exact failure this page exists to stop.
- **A build-time assertion holds the chart's claim.** `MIDPOINT_NEVER_GOVERNS`
  is computed rather than asserted in prose, so a future rate change that pushes
  a tier's 78% date past the deadline changes the sentence instead of leaving a
  false one standing.

### Not stated, and why

- **No PMI premium rate and no dollar saving.** Rates vary by credit score, LTV,
  term and insurer and no primary source publishes a single figure. Savings are
  counted in months of premium. This is the pattern established by the invest
  page, used for the fourth time.
- **No Freddie Mac or portfolio-lender thresholds.** Not read against a primary
  source for this page, and the page says so.
- **No template letter.** The page states what the rules require the request to
  establish and stops short of drafting it. Project brief §22, rule 2.
- **No state-by-state list under § 4908(a)(2).** The preservation rule is stated;
  which states qualify was not verified.

---

## `/learn/extra-mortgage-payments/`

Cluster hub. Shipped August 21, 2026, before any of the child pages that will
link up to it.

## Verified against primary sources

| Claim on the page | Source | Verified |
|---|---|---|
| A prepayment penalty on a covered fixed-rate qualified mortgage may not exceed 2% of the amount prepaid during the first two years | 12 C.F.R. § 1026.43(g)(2), eCFR | 2026-08-21 |
| The cap drops to a maximum of 1% during the third year | 12 C.F.R. § 1026.43(g)(2), eCFR | 2026-08-21 |
| No prepayment penalty is permitted after the third year | 12 C.F.R. § 1026.43(g)(2), eCFR | 2026-08-21 |
| The servicer must immediately accept and apply an extra principal payment, a "principal curtailment", **identified by the borrower as such** on a current loan | Fannie Mae Servicing Guide C-1.2-01, read in the 08/12/2026 edition PDF | 2026-08-21 |
| A curtailment sent with the scheduled payment is applied after it; one sent separately at another time of the month is applied before the next scheduled payment | Fannie Mae Servicing Guide F-1-09, Processing a Principal Curtailment | 2026-08-21 |
| On a delinquent loan an extra principal payment must first cure the delinquency, and only remaining funds reach principal | Fannie Mae Servicing Guide C-1.2-01 | 2026-08-21 |

**The servicing claim was rewritten on August 21, 2026, not merely sourced.**
The draft said many servicers apply unlabeled extra money to the next scheduled
payment. **The Servicing Guide does not establish that.** It sets what the
servicer must do when a payment IS identified as a curtailment and is silent on
the default for unidentified funds. Sourcing the sentence as written would have
attached a primary citation to a claim the primary source does not make, which
is worse than leaving it unsourced. The page now states the rule that exists,
that the obligation attaches to the identifying, and stops there.

**Scope limit stated on the page.** These rules bind servicers of loans Fannie
Mae owns or guarantees. Same treatment as C-1.2-01 on the 15-versus-30 page.

**The two-tier structure is the correction worth recording.** A first draft of
this page stated the 2% cap and then jumped to "none after the third year",
leaving year three undefined. The regulation sets 1% for that year. Separately,
widely repeated secondary write-ups give a 3% first-year cap, which the
regulation does not support. Project brief §0.2 already records the 3% error;
this page adds that the omission of the 1% tier is the more likely mistake,
because it survives a check against the number everyone gets wrong.

## Arithmetic — verified by computation, not by citation

Every figure is computed at build time by `lib/mortgage.ts`. Nothing is typed.

**Independently recomputed August 21, 2026** in a script written from the
amortization definition, sharing no code with the engine. Five cases: $100,
$500 and $1,000 a month, one extra payment a year, and a $10,000 lump sum in
year 10. **Payoff month agreed exactly in all five; interest saved agreed to
under one cent.** Baseline reproduces the canonical example: $2,205.23 a month
and $453,884.07 of interest, on $340,000 at 6.75% over 30 years.

| Figure | Value |
|---|---|
| Interest saved per $1 extra, $50/month | $2.17 |
| Interest saved per $1 extra, $1,000/month | $1.70 |
| $10,000 landing in year 1 | $54,951 saved, $5.50 per $1 |
| $10,000 landing in year 20 | $9,181 saved, $0.92 per $1 |
| $183.77 monthly vs one $2,205.23 payment each December | $4,041.10 apart |

### Stated deliberately, and why

- **The per-dollar column is the page's reason to exist.** No page on either
  SERP checked on August 20 publishes it. It points against the industry: it
  says the smallest commitment is the most efficient per dollar, which no
  lender-funded page has any reason to print.
- **The per-dollar figure divides by extra principal read off the schedule, not
  by the nominal annual cost.** They differ on the annual-extra rows because the
  final year is capped when the balance runs out. Three extra payments a year
  nominally costs 18 x $6,615.69, but the schedule only ever takes $112,467.
  The nominal figure would print $1.72 where the truth is $1.83.
- **The biweekly row is labeled as a modeling choice, in the body.** Biweekly
  and one-extra-payment-a-year come out identical because the engine applies
  biweekly as one extra full payment every twelfth month. Presenting that as a
  finding would be a measurement of an output treated as evidence about its
  source, which is the §0.1 failure. The page states which way the model errs.
- **The Finding 3 figures carry cents and the difference is the difference of
  the rounded pair, not the rounded difference.** True difference $4,041.09;
  difference of the two displayed figures $4,041.10. The page prints all three
  numbers, so the one that must hold is the one a reader gets by subtracting
  what they can see. `SPREAD_EDGE` rounds to cents first, then subtracts.
- **$183.77 is rendered with cents against site convention.** `formatUSD` drops
  cents everywhere else. Whole dollars print $184, which is not one twelfth of
  this payment and claims $2,208 a year against a stated $2,205. The section
  turns on both methods costing the same, so precision is load-bearing.
- **The competitor claim is counted, not estimated.** Eight of the ranking pages
  state a loan, using five distinct rates from 4% to 7% on balances from
  $200,000 to $500,000; two state none. An earlier draft said "nine loans at
  nine different rates" and was wrong on both counts.
- **Two build-time assertions hold findings that prose would otherwise assert.**
  `DECLINE_IS_MONOTONIC` and `BELOW_BREAK_EVEN` are computed, so a future engine
  or rate change alters the sentence instead of leaving a false one standing.

### Not stated, and why

- **No claim about what servicers do with unidentified money.** CLOSED as an
  open item on August 21, 2026: the Servicing Guide was read and it does not
  support one. The page states the identification requirement, which is what the
  source establishes, and does not speculate past it.
- **No claim that biweekly equals one extra payment a year in reality.** The
  engine models them identically; the real gap favors biweekly by an amount
  this site has not computed, and the page says exactly that.
- **No investment comparison.** Handed to the pay-off-or-invest calculator.
- **No recast or refinance arithmetic.** Named as different questions and left
  to the cluster's later pages.

## Still unverified — do not state these on any page yet

- **What a servicer does with money NOT identified as a curtailment.** The
  Servicing Guide is silent on it. Not stated on the page in any form.
- **Whether the same rules bind Freddie Mac or portfolio servicers.** Only the
  Fannie Mae Guide was read. The page limits its claim accordingly.
- **Whether a featured snippet sits above the organic results.** The August 20
  SERP check was organic-only and cannot see ads, People Also Ask or snippets.

## `/learn/how-many-years-two-extra-payments-take-off/`

First child of the extra-payments cluster hub. Shipped August 22, 2026, the day
after the hub, so the hub-before-children rule held.

## Verified against primary sources

Read for this page on August 22, 2026 rather than inherited from the hub's
citation list above, even where the topic is the same one.

| Claim on the page | Source | Verified |
|---|---|---|
| The servicer must immediately accept and apply an additional principal payment, a "principal curtailment", **identified by the borrower as such**, on a current mortgage loan | Fannie Mae Servicing Guide C-1.2-01, Processing Additional Principal Payments | 2026-08-22 |
| On a delinquent mortgage loan, additional principal identified as such must first be applied toward curing the delinquency, and only remaining funds reach principal | Fannie Mae Servicing Guide C-1.2-01 | 2026-08-22 |
| After a substantial principal curtailment the servicer **may** agree to reduce the P&I payment, re-amortizing the current unpaid balance over the remaining term at the current rate, for a current portfolio loan or a current first lien loan in an MBS pool | Fannie Mae Servicing Guide F-1-09, Processing Mortgage Loan Payments and Payoffs | 2026-08-22 |

**The recast claim is stated as permissive, and the word is load-bearing.**
F-1-09 says the servicer *may* agree to re-amortize, not that it must, and it
limits the option to a current portfolio loan or a current first lien loan in an
MBS pool. Writing "you can ask to have your payment recalculated" would convert
a discretion into an entitlement, which is the same class of error the hub
recorded against the unidentified-funds sentence. The page carries "may", the
scope limit and the note that it is a different transaction from prepaying.

**Two verified citations were CUT, not lost.** The Regulation Z prepayment
penalty tiers at 12 C.F.R. § 1026.43(g)(2) were read against eCFR on August 22,
2026 and confirmed: no penalty after the three-year period, 2% cap in the first
two years, 1% in the third. They were then removed from the page along with the
scope subsection that carried them, because prepayment penalties and the
servicing rules for identifying a curtailment are **already sections on the
hub**, and the cluster rule is that a child links up rather than restating. The
citation went with the claim. A source listed in a page's reference block that
the page no longer relies on implies a claim that is not being made, which is
its own small dishonesty.

**Scope limit stated on the page.** These rules bind servicers of loans Fannie
Mae owns or guarantees. Same treatment as the hub and the 15-versus-30 page.

## Arithmetic — verified by computation, not by citation

Every figure is computed at build time by `lib/mortgage.ts`. Nothing is typed,
including the meta description and the H1, which is why the constant block on
this page sits above the `metadata` export rather than below it.

**Independently recomputed August 22, 2026** in a Python script written from the
closed-form amortization formula, sharing no code and not the same language as
the engine. Six scenarios: the baseline, two extra payments landing in month 1,
spread evenly and landing in month 12, and one and three extra payments landing
in month 12. **Payoff month agreed exactly in all six; total interest agreed to
zero delta at double precision.** Baseline reproduces the canonical example:
$2,205.23 a month and $453,884.07 of interest on $340,000 at 6.75% over 30 years.

| Figure | Value |
|---|---|
| Two extra payments a year, both in month 1 of each loan year | 241 months, 9y 11m cut, $175,899.95 saved |
| The same annual total spread across all twelve months | 243 months, 9y 9m cut, $170,055.40 saved |
| Two extra payments a year, both in month 12 of each loan year | 246 months, 9y 6m cut, $164,219.43 saved |
| The spread between the best and worst timing | 5 months, $11,680.52 of interest |
| Average interest given up per month of delay | $1,061.87 |
| One extra payment a year, month 12 | 290 months, 5y 10m cut, $103,215.41 saved |
| Three extra payments a year, month 12 | 216 months, 12y 0m cut, $205,353.83 saved |
| Interest saved per $1 extra, month 1 / spread / month 12 | $1.99 / $1.91 / $1.86 |
| Two extra payments a year at 3% against 8.5% | 6y 1m cut against 11y 2m cut |
| One extra payment a year (the biweekly equivalent) against two | 290 months against 246, a gap of 3y 8m |
| Spreading the annual total evenly, against the twelve single-month timings | beats 6, ties 2, loses to 4 |

**Re-verified August 22, 2026 after an editing pass.** Every figure rendered
into the built HTML was extracted and diffed against the independent Python
implementation a second time, including figures added during the pass. All
match. The diff found two defects, neither of them a wrong number: a biweekly
comparison that rounded 3 years 8 months up to "roughly 4 years", which this
site does not do, and a sentence that rendered as "a third a further 30 ." with
the unit dropped. Both fixed.

### Stated deliberately, and why

- **The headline answer is a RANGE, and the single figure offered after it is
  the LEAST favourable of the three readings.** "Two extra payments a year" does
  not say when, and on this loan the ambiguity is worth five months. Month 12 is
  quoted as the one number because it is the floor, because the hub already runs
  its annual rows at `annualExtraMonth: 12` and two pages on one site must not
  print different figures for the same strategy on the same loan, and because
  once-a-year money is usually a bonus or a refund whose month the borrower does
  not choose. Leading with month 1 would have been the site's own competitors'
  move.
- **All three readings are modelled and the page says so.** The even-spread
  reading is one sixth of a payment added to every scheduled payment, which is
  the same annual cash as the other two.
- **The twelve-month staircase is the page's reason to exist.** Payoff months
  run 241, 241, 242, 242, 243, 243, 244, 244, 245, 245, 246, 246: the date slips
  exactly one month for every two months the money is delayed. No page checked
  on the SERP for this query publishes the within-year timing effect at all.
- **The loan-size invariance is exact, not approximate, and the page says
  "exactly".** Two extra payments means twice the scheduled payment, the payment
  is proportional to principal, so the schedule is the original scaled by a
  constant and reaches zero in the same month. Verified across seven sizes from
  $25,000 to $2,500,000: identical payoff month, interest exactly proportional
  to within 3.2e-15 of the interest-to-principal ratio. Re-checked at 4%, 6.75%
  and 9% over both 180 and 360 months.
- **The invariance is stated WITH its condition.** It holds because the extra is
  a multiple of the payment. A flat $500 a month is not, the invariance fails for
  it, and the page says so rather than leaving a reader to over-generalise.
- **"Month 1" is defined as the first month of the LOAN year, not January.** The
  engine tests `((month - 1) % 12) + 1`, so the cycle is the loan's own. The hub
  writes "each December" for the same plan shape, which is true only for a loan
  whose first payment falls in January; this page is the one whose entire
  subject is which month the money lands in, so it carries the exact statement.
- **Three findings are held in build-time constants rather than in prose.**
  `STAIRCASE_IS_REGULAR`, `SIZE_INVARIANT` and `SPREAD_WIDENS_WITH_RATE` are
  computed, and each gates the sentence that reports it. A future rate change
  that broke any of them changes the sentence instead of leaving a false one on
  the page. Same device as `DECLINE_IS_MONOTONIC` on the hub.
- **The per-dollar column divides by extra principal read off the schedule.**
  Same treatment and same reason as the hub: the final year is capped when the
  balance runs out, so the nominal annual cost overstates what was actually paid.
- **The biweekly comparison exists because it is the confusion, not because it
  is a keyword.** Biweekly is 26 half payments, which is 13 full payments, which
  is ONE extra payment a year and not two. Readers searching this question
  routinely believe the two are the same. The gap is stated exactly, as 3 years
  8 months rather than "about 4 years", and the modelling choice behind the
  biweekly figure is named rather than presented as a fact about the world.
- **The spreading comparison reports wins, ties AND losses.** An earlier draft
  said spreading "beats 6 of the twelve single-month timings", which is true and
  misleading by omission: it also ties 2 and loses to 4. All three are computed
  and printed, so nobody reads "beats six of twelve" as a recommendation.
- **Written for a reader with no finance background, and measured rather than
  assumed.** The prose scores Flesch Reading Ease 67.7 at grade level 8.4. Terms
  of art were removed from visible copy rather than merely defined: "MBS pool",
  "portfolio loan", "principal curtailment", "re-amortize", "amortization",
  "invariance", "monotonically" and "double precision" no longer appear outside
  the source titles, where they are part of a document's published name. The
  F-1-09 recast scope survived that rewrite intact: the page still says which
  loans the rule reaches, in plain words, because dropping the scope to simplify
  would have turned a limited permission into a general one.
- **Headings carry the words people type.** An earlier draft headed the opening
  section "246 months instead of 360", which is accurate and matches nothing
  anyone searches. The figure moved into the intro, where a computed number
  belongs, and the headings now carry the question wording. No phrase was
  repeated beyond where it reads naturally.
- **The rate table is the page's real deliverable for a reader whose loan is not
  the example.** Since the balance provably does nothing, rate and term are all
  that is left, and the table spans 3% to 8.5%.
- **The blurb on `/learn/` is computed, unlike the three above it.** Four lines
  of engine in `app/learn/page.tsx`. The older three are left typed rather than
  rewritten, because each would need its page's full constant block to reproduce
  and a half-migrated blurb that disagreed with its own page is the defect §10
  exists to prevent. Noted in a comment for whoever adds the next article.
- **The hub's downlink sentence carries a computed figure too.**
  `CHILD_TIMING_SPREAD` in the hub page, for the same reason: a typed "5" would
  have been the one hand-written number on that page.

### Not stated, and why

- **No recommendation, anywhere.** The page says what two extra payments do to
  the loan and explicitly says it cannot say whether that is a good use of the
  money, because an emergency fund, other debt, a retirement match and the
  alternative return are all outside what this site knows.
- **No claim about what a servicer does with money NOT identified as a
  curtailment.** Inherited as an open item from the hub and still open: the
  Servicing Guide is silent, so the page states the identification requirement
  and stops.
- **No investment comparison.** Handed to the pay-off-or-invest calculator.
- **No recast arithmetic.** The option is named, sourced and scoped, and the
  numbers are left to a later page in the cluster.
- **No biweekly row.** It belongs to the hub, which already carries the modelling
  caveat that makes it honest, and repeating the caveat here would duplicate the
  hub for no gain.
- **No prepayment-penalty or curtailment-labelling section.** Both were drafted,
  sourced and then cut as hub duplication. The page states the assumption that
  the money reaches principal in the month it is sent, and links up for the rules
  that govern whether it does.
- **No twelve-row timing table.** It was drafted and cut: the chart already
  carries every month, with bar length as interest given up and the row label as
  the payoff time, and the table's only unique column was the same fact read from
  the other end. The endpoints appear in the prose and the FAQ.
- **No count of what competing pages say.** The hub counted its SERP on August
  20 and the claim on this page is only that competitors answer with one number
  and do not publish the within-year timing effect. A precise count for this
  query's SERP was not taken, so no precise count is printed.

## Still unverified — do not state these on any page yet

- **What a servicer does with money not identified as a curtailment.** Unchanged
  from the hub. Not stated on the page in any form.
- **Whether Freddie Mac or portfolio servicers apply the same curtailment and
  recast rules.** Only the Fannie Mae Guide was read. The page limits its claim.
- **Whether the staircase pattern holds for every rate and term.** It was checked
  at 6.75% over 360 months, where it is exactly regular, and the page states the
  rule only for the loan on the page. The constant that gates the sentence is
  computed from that loan, so a rate change would withdraw the claim rather than
  generalise it.
- **The SERP for this specific query family.** Search Console impression data
  drove the page selection; no organic SERP check was run for this page, which is
  why no competitor count appears in the copy.
