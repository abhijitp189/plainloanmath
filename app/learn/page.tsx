import type { Metadata } from "next";
import Link from "next/link";
import { LAST_REVIEWED } from "@/lib/constants";
import { PageHeader, ReviewMeta, breadcrumbSchema } from "@/components/PageChrome";
import { Band } from "@/components/CalcChrome";
import {
  ARTICLE_KEYS,
  LEARN_PATH,
  ROUTES,
  ROUTE_REVIEWED,
  type ArticleKey,
} from "@/lib/routes";
import {
  amortizePlan,
  formatUSD,
  formatDuration,
  NO_PLAN,
} from "@/lib/mortgage";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Plain explanations of how a US mortgage actually behaves, each one computed from the same engine that runs the calculators. No lender money, no quote forms.",
  alternates: { canonical: LEARN_PATH },
};

const REVIEWED = ROUTE_REVIEWED.learn ?? LAST_REVIEWED;

// ─────────────────────────────────────────────────────────────────────────────
// The /learn/ index.
//
// Not a calculator hub and not a blog roll. Each entry is a question somebody
// types into a search box, answered with arithmetic this site can compute and
// most of the pages currently ranking cannot.
//
// The list is driven by ARTICLE_KEYS in lib/routes.ts, so a new article appears
// here, in the sitemap and in the related-links pool from one entry. The blurbs
// live here because they are editorial rather than identity — ROUTE_META
// carries the labels, this file carries the sentence that sells the click.
//
// WHY THIS PAGE EXISTS AT ALL, when /mortgage/ does not: /mortgage/ 301s to the
// homepage at the Cloudflare edge (technical brief §5), which is a dashboard
// setting. /learn/ has no such redirect, so a bare directory here would have
// been a 404 the moment the header linked to it.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// The figures in the twoExtraPayments blurb are COMPUTED, not typed.
//
// The three blurbs below it type theirs, which is how this file has always
// worked, and they are not being rewritten here: each would need its page's
// full constant block to reproduce, and a blurb that silently disagreed with
// its own page is exactly what project brief §10 is trying to prevent. This one
// needs four lines of engine to be right, so it gets them, and the next article
// added should follow this half of the file rather than the older half.
//
// Same canonical loan as everywhere else: $340,000 at 6.75% over 30 years.
// ─────────────────────────────────────────────────────────────────────────────

const B_LOAN = 340_000;
const B_RATE = 6.75;
const B_TERM = 360;

const B_BASE = amortizePlan(B_LOAN, B_RATE, B_TERM, NO_PLAN);
const B_PAY = B_BASE.monthlyPayment;

/** Both extra payments at the start of each loan year, and at the end. The two
 *  ends of the range the child page is built around. */
const B_EARLY = amortizePlan(B_LOAN, B_RATE, B_TERM, {
  ...NO_PLAN,
  annualExtra: 2 * B_PAY,
  annualExtraMonth: 1,
});
const B_LATE = amortizePlan(B_LOAN, B_RATE, B_TERM, {
  ...NO_PLAN,
  annualExtra: 2 * B_PAY,
  annualExtraMonth: 12,
});

const BLURB: Record<ArticleKey, { title: string; blurb: string }> = {
  twoExtraPayments: {
    title: "How many years do 2 extra mortgage payments take off?",
    blurb: `Every page answering this gives one number. On ${formatUSD(
      B_LOAN,
    )} at ${B_RATE}% the honest answer is a range: ${formatDuration(
      B_BASE.months - B_LATE.months,
    )} if the money lands at the end of each loan year, ${formatDuration(
      B_BASE.months - B_EARLY.months,
    )} if it lands at the start. Plus the reason your balance makes no difference at all.`,
  },
  extraPayments: {
    title: "Extra mortgage payments: what each strategy is actually worth",
    blurb:
      "Fourteen strategies on one $340,000 loan, so they can finally be compared to each other. Includes the column nobody publishes: interest saved per dollar of extra principal, which falls from $2.17 to $1.70 as the payment grows.",
  },
  pmiDropOff: {
    title: "When PMI drops off, and how to force it sooner",
    blurb:
      "Three dates decide it, and the down payment decides which arrives first. On a $425,000 home with 10% down, month 98 and month 112. Why extra payments move only one of them.",
  },
  principalVsInterest: {
    title:
      "When your mortgage starts paying down more principal than interest",
    blurb:
      "Every page answering this was written when a 30-year fixed cost 3%. At 6.75% the answer is month 238, not month 84. The month for every rate from 3% to 8%, and why the size of your loan makes no difference at all.",
  },
};

export default function LearnIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema("Learn", LEARN_PATH)),
        }}
      />

      <PageHeader
        eyebrow="Articles"
        title="Learn"
        lede="Each piece answers one question in its first hundred words, then shows the arithmetic. Every figure is computed by the same engine that runs the calculators, and every claim links to the agency that published it."
        breadcrumb="Learn"
        siblings={[
          { href: ROUTES.payoff, label: "Extra payment calculator" },
          { href: ROUTES.payment, label: "Monthly payment calculator" },
          { href: ROUTES.methodology, label: "How we calculate" },
        ]}
      />

      <Band tone="surface">
        <ul className="grid gap-5 md:grid-cols-2">
          {ARTICLE_KEYS.map((key) => (
            <li key={key}>
              <Link
                href={ROUTES[key]}
                className="panel group flex h-full flex-col p-6 transition-colors duration-150 hover:border-accent"
              >
                <p className="label">Article</p>
                <h2 className="mt-2.5 text-[1.25rem] font-bold leading-snug tracking-[-.02em] text-ink">
                  {BLURB[key].title}
                </h2>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-2">
                  {BLURB[key].blurb}
                </p>
                <p className="mt-4 text-[0.9rem] font-bold text-accent-dk">
                  Read it &rarr;
                </p>
              </Link>
            </li>
          ))}
        </ul>

        {/* The "More coming" filler was REMOVED on August 21, 2026, when the
            third article made it visible again and the check found it had never
            worked. It carried `md:hidden`, so it rendered only on mobile, where
            the grid is one column and there is no void to fill; on desktop,
            where an odd card really does leave an empty cell, it was hidden.
            It did the opposite of what its own comment claimed.

            It is deleted rather than repaired, on the same reasoning that
            removed the homepage roadmap (project brief §2.3, design guide
            §8.1): it is a promise about pages that do not exist, it can never
            be derived from the route data, and a surface that cannot be derived
            and does not need to exist is removed rather than maintained.

            The desktop void at an odd article count is a real §3.4 question and
            is now OPEN. A fourth article closes it on its own. */}
      </Band>

      <Band tone="paper">
        <p className="label">Start with a calculator instead</p>
        <ul className="mt-3 flex flex-wrap gap-2.5">
          <li>
            <Link href={ROUTES.payoff} className="btn btn-secondary">
              Extra payment calculator
            </Link>
          </li>
          <li>
            <Link href={ROUTES.payment} className="btn btn-secondary">
              Monthly payment calculator
            </Link>
          </li>
          <li>
            <Link href={ROUTES.refinance} className="btn btn-secondary">
              Refinance break-even
            </Link>
          </li>
        </ul>

        <div className="mt-8">
          <ReviewMeta updated={REVIEWED} />
        </div>
      </Band>
    </>
  );
}
