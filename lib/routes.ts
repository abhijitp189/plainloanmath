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
  payment: PAYMENT_PATH,
  payoff: PAYOFF_PATH,
  payoffVsInvest: PAYOFF_VS_INVEST_PATH,
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
  /** The loan type, or null for non-loan pages. */
  silo: "mortgage" | null;
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
};

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
