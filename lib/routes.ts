// ─────────────────────────────────────────────────────────────────────────────
// Internal routes, in one place.
//
// The payoff calculator's URL was settled on August 9, 2026 and is recorded in
// the decisions ledger (project brief §2.3). The four rival paths that used to
// appear across the documents are superseded. This comment previously said the
// decision was still open, which was true when it was written and stale by the
// time anyone read it.
//
// It should not be revisited after indexing. If it ever is, it is one edit
// here rather than a hunt through every page that links to it.
// ─────────────────────────────────────────────────────────────────────────────

/** Settled August 9, 2026 — project brief §2.3. */
export const PAYOFF_PATH = "/mortgage/payoff-with-extra-payments/";

/**
 * The monthly payment calculator, moved off the homepage on August 10, 2026.
 *
 * This reverses the "homepage doubles as the payment calculator" entry in the
 * ledger. The path deliberately mirrors PAYOFF_PATH — `/mortgage/<what it
 * does>/` — so the two read as siblings rather than as one tool that happens
 * to live at the root and another that doesn't.
 *
 * On the name: the head term "mortgage calculator" is Tier 3 and unwinnable
 * for years (project brief §7), so the slug targets the phrase that is
 * actually winnable — a payment calculator that includes taxes and insurance,
 * which is the gap the tool genuinely fills.
 *
 * Changing it is one line here and one line in the sitemap it now feeds.
 * After indexing it is a 301 and a ranking dip.
 */
export const PAYMENT_PATH = "/mortgage/payment-with-taxes-and-insurance/";

/**
 * Pay off the mortgage, or invest the same money instead.
 *
 * Added August 13, 2026. Short slug under the loan-type silo: two levels, no
 * stop words, and it does not repeat "mortgage" inside the path. The two older
 * calculators run five and six words because those were argued for before the
 * length rule existed; they are indexed and they stay.
 */
export const PAYOFF_VS_INVEST_PATH = "/mortgage/payoff-vs-invest/";

/**
 * When a refinance pays for itself.
 *
 * Added August 14, 2026. Three-word slug under the loan-type silo, and it does
 * not repeat "mortgage" inside the path. "break-even" is hyphenated because
 * that is how a reader writes it; the search phrase runs both ways and short
 * beats exact match.
 */
export const REFINANCE_PATH = "/mortgage/refinance-break-even/";

/**
 * The editorial silo, added August 15, 2026. The site's second silo, and the
 * first thing to exercise `relatedRoutes()` across a silo boundary.
 *
 * `/learn/` is a real page, not a bare path.
 *
 * UPDATED August 19, 2026: `/mortgage/` is now one too, see MORTGAGE_PATH
 * below. Until that date this comment recorded the asymmetry and the reason
 * for it, which was a Cloudflare redirect rather than a design choice.
 */
export const LEARN_PATH = "/learn/";

/**
 * The calculator silo index, added August 19, 2026.
 *
 * ⚠️ THIS PATH DEPENDS ON A DASHBOARD CHANGE. ⚠️
 *
 * `/mortgage/` used to 301 to `/` at the Cloudflare edge (technical brief §5),
 * which is a setting nobody can see from the repo and nothing in the build can
 * check. That redirect rule has to be deleted before this page can be reached;
 * with it in place the page builds, enters the sitemap, and then redirects
 * away from itself, which is worse than not having it. If this page ever
 * appears to 404 or to bounce to the homepage, that rule is the first place to
 * look.
 *
 * Why it exists now, having deliberately not existed since August 9: the site
 * has two silos, `/learn/` has had an index since the day it shipped, and the
 * header carried two "All calculators" links that both pointed at the
 * homepage because there was nowhere better to send them. A silo with five
 * pages and no front door was the odd one out.
 *
 * Bare directory, no slug. The path is the noun.
 */
export const MORTGAGE_PATH = "/mortgage/";

/**
 * Fifteen-year loan against thirty-year loan.
 *
 * Added August 18, 2026. The slug carries numerals, which the URL rules
 * otherwise forbid, and the rule was amended in the same delivery rather than
 * bent quietly: numerals are allowed where the number is part of the product's
 * own name. "15 vs 30" is what a reader says out loud and types into a search
 * box. The wordless alternatives that obey the letter of the old rule, such as
 * /mortgage/loan-term/, do not say what the tool does and nobody searches
 * them.
 *
 * Three segments-worth of meaning in three tokens, no repetition of the silo,
 * and no stuffing of the full target phrase into the path.
 */
export const TERM_COMPARE_PATH = "/mortgage/15-vs-30/";

/**
 * When a mortgage payment starts putting more toward principal than interest.
 *
 * Added August 15, 2026. The slug is long by the two-to-three-word rule used
 * for calculators, and deliberately so: this is an article competing on a
 * question phrase people type almost verbatim, not a tool competing on a noun
 * phrase. The words in the path are the words in the query.
 */
export const PRINCIPAL_VS_INTEREST_PATH =
  "/learn/when-you-start-paying-more-principal-than-interest/";

/**
 * When PMI drops off, and how to force it sooner.
 *
 * Added August 19, 2026. Short, unlike the article above, because the query is
 * short: "when does PMI drop off" is typed almost verbatim and the whole phrase
 * fits the slug. The longer article's slug is long for the same reason its
 * query is.
 */
export const PMI_DROP_OFF_PATH = "/learn/when-does-pmi-drop-off/";

/**
 * Cluster hub for extra payments. An article, not a silo index: it has a
 * subject, an argument and its own computation, which /learn/ itself does not.
 * It ships BEFORE the child pages that will link up to it, so the set never
 * exists as a flat group of near-identical pages with no hierarchy above them.
 */
export const EXTRA_PAYMENTS_PATH = "/learn/extra-mortgage-payments/";

export type PayoffParams = {
  loanAmount: number;
  ratePct: number;
  termYears: number;
  extra: number;
};

/**
 * Builds a link that opens the payoff calculator with values prefilled.
 *
 * Technical brief §7 lists "results encoded in the URL so links are
 * shareable" as a convention. This is the first place it is implemented.
 * Values are rounded because a shared link full of floating-point noise looks
 * broken, and the calculator re-derives everything from them anyway.
 */
export function payoffHref(p: PayoffParams): string {
  const q = new URLSearchParams({
    loan: String(Math.round(p.loanAmount)),
    rate: String(Number(p.ratePct.toFixed(3))),
    years: String(Math.round(p.termYears)),
    extra: String(Math.round(p.extra)),
  });
  return `${PAYOFF_PATH}?${q.toString()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// The route registry.
//
// Every page on the site appears here exactly once. Three things read it:
// the header, the footer, and `app/sitemap.ts`. Adding a page is one entry
// here plus wherever it should be linked from — the sitemap picks it up on
// its own, because it iterates this object rather than keeping its own list.
//
// `app/sitemap.ts` also asserts, at build time, that every `app/**/page.tsx`
// has an entry below. Ship a page and forget this file and the BUILD FAILS
// with the path it wants. A failed build deploys nothing, so the live site is
// unaffected — technical brief §1.
// ─────────────────────────────────────────────────────────────────────────────

export const ROUTES = {
  home: "/",
  calculators: MORTGAGE_PATH,
  payment: PAYMENT_PATH,
  payoff: PAYOFF_PATH,
  payoffVsInvest: PAYOFF_VS_INVEST_PATH,
  refinance: REFINANCE_PATH,
  termCompare: TERM_COMPARE_PATH,
  learn: LEARN_PATH,
  principalVsInterest: PRINCIPAL_VS_INTEREST_PATH,
  pmiDropOff: PMI_DROP_OFF_PATH,
  extraPayments: EXTRA_PAYMENTS_PATH,
  methodology: "/methodology/",
  corrections: "/corrections/",
  editorialPolicy: "/editorial-policy/",
  about: "/about/",
  contact: "/contact/",
  disclaimer: "/disclaimer/",
  privacy: "/privacy/",
  terms: "/terms/",
} as const;

export type RouteKey = keyof typeof ROUTES;

/**
 * Pages whose last significant edit differs from the site-wide review date in
 * `lib/constants.ts`. Anything absent uses `LAST_REVIEWED`.
 *
 * This exists because Google only uses <lastmod> when it is "consistently and
 * verifiably accurate" — verified August 11, 2026 against
 * https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
 * A date that moves on every deploy is neither, so the sitemap carries the
 * editorial review date instead of the build date. When one page is rewritten
 * without a full site review, put its date here.
 */
export const ROUTE_REVIEWED: Partial<Record<RouteKey, string>> = {
  // Rebuilt August 12, 2026: the plan engine (lump sums, yearly extras,
  // biweekly, delayed starts), the loan-life strip, the tipping point, and
  // roughly 1,600 words of editorial with CFPB and Regulation Z citations.
  // The rest of the site was not reviewed that day, which is exactly the case
  // this map exists for — LAST_REVIEWED still says August 8 and still speaks
  // for every other page.
  payoff: "2026-08-12",
  // Built August 13, 2026. The rest of the site was not reviewed that day.
  payoffVsInvest: "2026-08-13",
  // Built August 14, 2026. The rest of the site was not reviewed that day.
  refinance: "2026-08-14",
  // Built August 18, 2026. The rest of the site was not reviewed that day.
  termCompare: "2026-08-18",
  // Built August 19, 2026, when /mortgage/ stopped being a redirect.
  calculators: "2026-08-19",
  // Built August 15, 2026, with the /learn/ index alongside it.
  learn: "2026-08-15",
  principalVsInterest: "2026-08-15",
  // Built August 19, 2026. The rest of the site was not reviewed that day.
  pmiDropOff: "2026-08-19",
  extraPayments: "2026-08-21",
};

/**
 * Routes deliberately kept out of the sitemap. Empty today, and it should
 * stay that way — a page worth building is a page worth listing. It exists so
 * that excluding one is a recorded decision rather than a quiet omission.
 */
export const SITEMAP_EXCLUDE: readonly RouteKey[] = [];

// ─────────────────────────────────────────────────────────────────────────────
// Related links, generated rather than typed.
//
// Sibling lists chosen by hand are a maintenance debt: at ten calculators that
// is ten lists to revisit every time anything is added. Each route carries
// topic tags instead, and `relatedRoutes()` derives the block, so a new
// calculator appears on its relatives the moment it enters this file.
//
// SILO-AWARE FROM THE START, with one silo. Same-silo pages outrank cross-silo
// ones, so a mortgage page fills its slots with mortgage pages when enough
// exist and reaches across only when it cannot. Retrofitting this later would
// mean revisiting every page the helper already feeds; building it now costs
// one field. Cross-silo links worth making deliberately stay contextual body
// links written by hand, not automatic slots.
//
// DETERMINISTIC ORDER. Ties break on the route key, so the built HTML does not
// shuffle between builds and a diff stays readable.
// ─────────────────────────────────────────────────────────────────────────────

type RouteMeta = {
  /** The related-links label — appears in the "Related calculators" block. */
  label: string;
  /**
   * The header / footer / hub label, when it should be tighter than `label`.
   * The nav wants "Monthly payment"; the related block wants "Monthly payment
   * calculator". Both live here so a rename is one edit, not four (§0.13).
   * Before this, the header, the footer and the hub each carried their own
   * copy — and they had already drifted: the header said "Payoff with extra
   * payments" while this file said "Extra payment calculator" for one tool,
   * and the footer was missing the "Pay off or invest" calculator entirely.
   */
  navLabel?: string;
  /**
   * The silo, or null for pages that belong to none.
   *
   * Widened from `"mortgage" | null` on August 15, 2026 when `/learn/`
   * shipped. The scoring in `relatedRoutes()` did not change: same-silo still
   * earns two points, and now that two silos exist that weighting finally does
   * something. A mortgage page fills its slots with mortgage pages first and
   * reaches into `/learn/` only when the topic overlap is strong enough to
   * beat a weaker same-silo match, which is the behavior the helper was
   * written for in August with nothing to exercise it.
   */
  silo: "mortgage" | "learn" | null;
  topics: readonly string[];
};

export const ROUTE_META: Partial<Record<RouteKey, RouteMeta>> = {
  payment: {
    label: "Monthly payment calculator",
    navLabel: "Monthly payment",
    silo: "mortgage",
    topics: ["payment", "escrow", "pmi", "affordability"],
  },
  payoff: {
    label: "Extra payment calculator",
    navLabel: "Payoff with extra payments",
    silo: "mortgage",
    topics: ["payoff", "extra-payments", "interest", "amortization"],
  },
  payoffVsInvest: {
    label: "Pay off or invest",
    navLabel: "Pay off or invest",
    silo: "mortgage",
    topics: ["payoff", "extra-payments", "investing", "interest"],
  },
  refinance: {
    label: "Refinance break-even",
    navLabel: "Refinance break-even",
    silo: "mortgage",
    topics: ["refinance", "closing-costs", "interest", "payment"],
  },
  termCompare: {
    label: "15-year vs 30-year",
    navLabel: "15 vs 30 year",
    silo: "mortgage",
    // "term" is the tag this page owns, and it is new: no other route carries
    // it, so it earns nothing on its own today. The other three are shared
    // deliberately. Scored out on August 18: payoff 6, pay off or invest 5,
    // payment 5, refinance 5, principal vs interest 2, methodology 2. The
    // payoff calculator leads because a reader told most of their "saving"
    // comes from paying more will want the tool that shows what paying more
    // does, which is exactly that page.
    topics: ["term", "interest", "payment", "amortization"],
  },
  calculators: {
    label: "All calculators",
    navLabel: "Calculators",
    silo: "mortgage",
    // Deliberately empty, on the same reasoning as `learn` below. A silo index
    // has no subject of its own, and `relatedRoutes()` drops any route sharing
    // zero topics, so an empty list keeps this page out of every sibling block
    // without needing an exclusion list. It still reaches the header and the
    // sitemap, which read ROUTES rather than topic scores.
    topics: [],
  },
  learn: {
    label: "Learn",
    navLabel: "Learn",
    silo: "learn",
    // Deliberately empty. A silo index has no subject of its own, and
    // `relatedRoutes()` drops any route sharing zero topics, so leaving this
    // empty keeps the hub out of every sibling block without needing an
    // exclusion list. It still appears in the header, the footer and the
    // sitemap, which read ROUTES rather than topic scores.
    topics: [],
  },
  principalVsInterest: {
    label: "When principal overtakes interest",
    navLabel: "Principal vs interest",
    silo: "learn",
    // Four tags, all shared with the payoff calculator, which is the page this
    // article should hand its readers to and the one whose tipping point it
    // explains. Scored out on August 15: payoff 4, pay off or invest 3,
    // methodology 2, refinance 1. No same-silo bonus applies until a second
    // article ships, so those four are cross-silo links earned on topic
    // overlap alone.
    topics: ["amortization", "interest", "payoff", "extra-payments"],
  },
  pmiDropOff: {
    label: "When PMI drops off",
    navLabel: "When PMI drops off",
    silo: "learn",
    // "pmi" is shared with the payment calculator alone, which is the page a
    // reader wanting to see a premium line in a monthly total should land on,
    // and the only other route that carries the tag. "extra-payments" and
    // "amortization" reach the payoff calculator and the sibling article,
    // because the whole "how to force it" half of this page is extra principal
    // read against the original schedule. Scored out on August 19: payment 3,
    // payoff 2, principal vs interest 2, pay off or invest 1.
    topics: ["pmi", "payment", "extra-payments", "amortization"],
  },
  extraPayments: {
    label: "Extra mortgage payments, compared",
    navLabel: "Extra payments compared",
    silo: "learn",
    // The same four tags the payoff calculator carries, which is deliberate:
    // this page's job is to hand a reader to that calculator once they know
    // which strategy they want, and every child page in this cluster will
    // carry a subset of these. Not empty topics — that treatment is for a silo
    // index with no subject of its own, and this page has one.
    topics: ["extra-payments", "payoff", "amortization", "interest"],
  },
  methodology: {
    label: "How we calculate",
    silo: null,
    topics: ["amortization", "interest", "payment"],
  },
};

/**
 * The live calculators, in the order they appear in navigation.
 *
 * The single source for "which calculators exist and in what sequence." The
 * header, the footer and the hub tool grid all iterate this, so a new
 * calculator is one entry here plus its page — and it cannot land in one nav
 * surface but not another. That is not hypothetical: before this list existed,
 * "Pay off or invest" shipped into the header and the hub but was never added
 * to the footer, because each surface kept its own hand-typed list.
 *
 * Add a calculator here the day its page ships, not the day it is planned
 * (project brief §3, defect 3 — nine links to pages that did not yet exist).
 */
export const CALCULATOR_KEYS = [
  "payment",
  "payoff",
  "payoffVsInvest",
  "refinance",
  "termCompare",
] as const satisfies readonly RouteKey[];

/**
 * The route keys that have a calculator page. Derived from CALCULATOR_KEYS so
 * the two cannot disagree — add a calculator to that array and this type, the
 * icon map (components/CalcIcons.tsx) and the stripe registry below all demand
 * the new entry at compile time.
 */
export type CalculatorKey = (typeof CALCULATOR_KEYS)[number];

/**
 * The stripe identity for each calculator: the eyebrow tag above the H1, and
 * the breadcrumb leaf label.
 *
 * The H1, the lede and the aside points are page-local editorial and stay on
 * the page. These two are identity labels, and the breadcrumb one is read in
 * two places that must agree — the visible breadcrumb in `CalcStripe` and the
 * `BreadcrumbList` schema (`calcBreadcrumbSchema` in components/CalcChrome.tsx).
 * Before this, each page typed the breadcrumb string twice and the eyebrow
 * once; the two breadcrumbs were kept in sync by hand, which is exactly the
 * arrangement §0.13 calls a defect waiting to happen — a schema describing a
 * different trail from the page is a Search Console problem nobody would see.
 *
 * Keyed over CalculatorKey, so a new calculator cannot ship without both.
 */
export const CALC_STRIPE: Record<
  CalculatorKey,
  { eyebrow: string; breadcrumb: string }
> = {
  payment: {
    eyebrow: "Mortgage calculator",
    breadcrumb: "Mortgage payment calculator",
  },
  payoff: {
    eyebrow: "Payoff calculator",
    breadcrumb: "Payoff with extra payments",
  },
  payoffVsInvest: {
    eyebrow: "Pay off or invest",
    breadcrumb: "Pay off or invest",
  },
  refinance: {
    eyebrow: "Refinance calculator",
    breadcrumb: "Refinance break-even",
  },
  termCompare: {
    eyebrow: "15 vs 30 year calculator",
    breadcrumb: "15-year vs 30-year",
  },
};

/**
 * The live articles, in the order they appear on the /learn/ index.
 *
 * The editorial counterpart to CALCULATOR_KEYS, and deliberately a SEPARATE
 * array rather than an addition to it. CALCULATOR_KEYS drives three surfaces
 * that mean "tool" — the header dropdown, the footer's Calculators column and
 * the hub's tool grid — so folding an article into it would have published a
 * 2,000-word explainer as the site's fifth calculator in all three places at
 * once. The types below keep them distinct at compile time.
 *
 * Newest first: unlike the calculator order, which is a considered sequence,
 * an article index is a reverse chronology.
 */
export const ARTICLE_KEYS = [
  "extraPayments",
  "pmiDropOff",
  "principalVsInterest",
] as const satisfies readonly RouteKey[];

export type ArticleKey = (typeof ARTICLE_KEYS)[number];

/** Stripe identity for each article, on the same terms as CALC_STRIPE. */
export const ARTICLE_STRIPE: Record<
  ArticleKey,
  { eyebrow: string; breadcrumb: string }
> = {
  principalVsInterest: {
    eyebrow: "Article",
    breadcrumb: "Principal vs interest",
  },
  pmiDropOff: {
    eyebrow: "Article",
    breadcrumb: "When PMI drops off",
  },
  extraPayments: {
    eyebrow: "Article",
    breadcrumb: "Extra payments compared",
  },
};

/**
 * Every page that opens with a stripe, calculator or article.
 *
 * `CalcStripe` and `calcBreadcrumbSchema` both read this one record, so the
 * visible breadcrumb and the BreadcrumbList schema still cannot disagree —
 * the guarantee that made CALC_STRIPE worth building in the first place, now
 * covering two kinds of page.
 *
 * Composed from the two records above rather than replacing them, so each half
 * keeps its own exhaustive `Record<...Key, ...>` check: a new calculator still
 * cannot ship without an eyebrow and a breadcrumb, and neither can a new
 * article.
 */
export type StripeKey = CalculatorKey | ArticleKey;

export const PAGE_STRIPE: Record<
  StripeKey,
  { eyebrow: string; breadcrumb: string }
> = { ...CALC_STRIPE, ...ARTICLE_STRIPE };

/**
 * The label the header, footer and hub show for a route. Prefers `navLabel`,
 * falls back to the related-links `label`, then to the route key, so a nav
 * surface can never render an empty string. This is the one place those
 * surfaces read their calculator names from — none of them carries its own
 * copy any more (§0.13).
 */
export function navLabel(key: RouteKey): string {
  const meta = ROUTE_META[key];
  return meta?.navLabel ?? meta?.label ?? key;
}

/**
 * The most closely related live routes, excluding the page itself.
 *
 * Score is one point per shared topic, plus two for being in the same silo, so
 * a same-silo page with one shared topic still outranks a cross-silo page with
 * two. Routes with no shared topic at all are never returned: an unrelated
 * link is worse than a short list.
 */
export function relatedRoutes(
  from: RouteKey,
  limit = 4,
): { href: string; label: string }[] {
  const self = ROUTE_META[from];
  if (!self) return [];

  return (Object.keys(ROUTE_META) as RouteKey[])
    .filter((key) => key !== from)
    .map((key) => {
      const meta = ROUTE_META[key]!;
      const shared = meta.topics.filter((t) => self.topics.includes(t)).length;
      const sameSilo = self.silo !== null && meta.silo === self.silo ? 2 : 0;
      return { key, meta, score: shared === 0 ? 0 : shared + sameSilo };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.key.localeCompare(b.key))
    .slice(0, limit)
    .map((r) => ({ href: ROUTES[r.key], label: r.meta.label }));
}
