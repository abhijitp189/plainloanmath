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

const BLURB: Record<ArticleKey, { title: string; blurb: string }> = {
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

        {/* §3.4: never a column of content with a void beside it. With one
            article the grid is a single card on a half-width column, so the
            second cell carries the standing note about what this silo is for
            rather than being left empty. It becomes a second article as soon
            as one ships. */}
        {ARTICLE_KEYS.length % 2 === 1 && (
          <div className="mt-5 border-l-[3px] border-line-strong bg-paper-2 p-5 md:mt-0 md:hidden">
            <p className="label">More coming</p>
            <p className="mt-2 max-w-prose text-[0.92rem] text-ink-2">
              Written one at a time, each on a question with a real answer that
              nobody has published for the current rate environment.
            </p>
          </div>
        )}
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
