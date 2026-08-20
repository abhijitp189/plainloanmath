import type { Metadata } from "next";
import Link from "next/link";
import { LAST_REVIEWED, SITE } from "@/lib/constants";
import {
  PAYOFF_PATH,
  PAYMENT_PATH,
  LEARN_PATH,
  ROUTES,
  CALCULATOR_KEYS,
  navLabel,
  type CalculatorKey,
} from "@/lib/routes";
import { SectionHead } from "@/components/PageChrome";
import { CALC_ICON, IconTile } from "@/components/CalcIcons";
import { InlineLink } from "@/components/InlineLink";

// The hub, from August 10, 2026. Repaletted August 11.
//
// This page used to be the mortgage payment calculator as well. It is not any
// more — the calculator moved to PAYMENT_PATH so it can be tuned for one query
// and maintained on its own. What is left here has a single job: say what the
// site is, and get people to the right tool.
//
// The rule that made the old arrangement necessary still holds in its new
// form: there is exactly one page per tool, and this page is not one of them.
// Do not add a calculator back to this page.
//
// ── August 11, 2026 — four changes, and none of them touch the copy ──────
//
// 1. The tool cards are monochrome. Each of the six used to carry its own
//    accent, pale tint and border drawn from the data palette — blue for
//    payment, teal for payoff, purple for a third tool, orange for
//    affordability. Six tinted chips in a row was the loudest thing on the
//    site, and it spent the meaning of those hues before a reader reached a
//    chart. The data palette is for data. Icons are ink strokes in a plain
//    square; teal appears on hover and on the primary button, and nowhere
//    else above the fold.
//
// 2. Two live tools, four listed. Four of six cards were dashed placeholders
//    taking the same space as the working tools, so the page's dominant
//    visual fact was absence. The built ones got full-size cards and the
//    unbuilt ones a ruled list underneath. SUPERSEDED August 19, 2026: the
//    ruled list is gone too, and the reasoning is at the tool grid below.
//
// 3. One dark band, per design guide §3.2. The trust section was a second
//    full-width --ink-deep field, and two dark slabs with a light grid
//    between them read as two websites stacked. It is now a white panel
//    between two rules, which is the same emphasis without the second wall.
//
// 4. The glossary is de-boxed. Twelve identical bordered boxes is a lot of
//    drawn structure for a definition list; it is two ruled columns now.
//    Same twelve terms, same words.

export const metadata: Metadata = {
  title: "Plain Loan Math: Mortgage Calculators With Nothing to Sell",
  description:
    "Free mortgage calculators and plain explanations of the math behind them. No lender pays us, and there are no rate quotes, lead forms or affiliate links anywhere on this site.",
  alternates: { canonical: "/" },
};

// Only tools with a live page appear as cards. Project brief §3, defect 3 —
// the site shipped nine links to routes that did not exist, and this grid is
// exactly where a tenth would come from. An unbuilt tool cannot be a card at
// all now, which is a stronger guard than rendering it as plain text.
//
// ── August 19, 2026 — the grid is derived, not typed ─────────────────────
//
// This was the last nav surface keeping its own hand-typed list of live
// tools. On August 18 the 15-year vs 30-year calculator shipped; it reached
// the header and the footer, because both iterate CALCULATOR_KEYS, and never
// reached this grid, while the roadmap below it went on promising the same
// tool as "Next". Two of anything is the defect, and the second copy is the
// one that does not receive the first one's fixes — project brief §0.13,
// technical brief §7.1.
//
// The path, the label and the icon now come from the same three records every
// other surface reads. What stays here is the only genuinely page-local part:
// the sentence and the question printed on the card. TOOL_COPY is keyed over
// CalculatorKey, so adding a calculator to CALCULATOR_KEYS without writing
// its card copy is a compile error rather than a card that quietly never
// appears.
const TOOL_COPY: Record<CalculatorKey, { body: string; question: string }> = {
  payment: {
    body: "Principal, interest, taxes and insurance, separated rather than lumped into one number.",
    question: "“What will I actually pay?”",
  },
  payoff: {
    body: "Add anything extra each month and watch the interest disappear.",
    question: "“What if I pay $200 more?”",
  },
  payoffVsInvest: {
    body: "Put the same money either way and see where each one ends, plus the return that decides it.",
    question: "“Which is worth more in the end?”",
  },
  refinance: {
    body: "Work out the month a refinance pays back what it cost, and the rate it would need to be worth it.",
    question: "“Is refinancing worth it?”",
  },
  termCompare: {
    body: "The shorter loan is sold on the interest it saves. See how much of that comes from the term, and how much from simply paying more.",
    question: "“Which term should I take?”",
  },
};

const LIVE = CALCULATOR_KEYS.map((key) => ({
  href: ROUTES[key],
  title: navLabel(key),
  body: TOOL_COPY[key].body,
  question: TOOL_COPY[key].question,
  icon: CALC_ICON[key],
}));

// ── August 19, 2026 — the roadmap is gone, not hidden ────────────────────
//
// The hub used to carry a "Not built yet" list under the tool grid. It is
// removed, and the decision behind that is in the ledger (project brief §2.3):
// nobody arrives at a mortgage calculator wanting to know what the site
// intends to build next, and a published roadmap is a promise that has to be
// maintained against reality forever. It was not maintained: 15-year vs
// 30-year shipped on August 18 and sat on this list advertised as "Next" for a
// day afterwards, on the same page that had stopped linking to it.
//
// Sequencing is now an internal decision, which is where it always belonged.
// Nothing replaces the block; the tool grid simply ends and the /learn/
// callout follows it.
//
// If it ever comes back, it comes back knowing why it left.

const GLOSSARY = [
  ["Principal", "The amount you owe. Every payment shaves a little off it."],
  ["Interest", "The fee for borrowing, charged on whatever principal is left."],
  [
    "Amortization",
    "The schedule that splits each payment between fee and debt.",
  ],
  [
    "Escrow",
    "A holding account your lender uses to pay your tax and insurance bills.",
  ],
  [
    "PITI",
    "Principal, interest, taxes, insurance: the four parts of a typical bill.",
  ],
  ["PMI", "Insurance you buy that protects the lender if you stop paying."],
  ["Equity", "What the home is worth minus what you still owe on it."],
  ["APR", "The rate with fees folded in, for comparing offers."],
  [
    "Points",
    "Money paid up front to buy a lower rate for the life of the loan.",
  ],
  [
    "Recast",
    "Re-spreading your remaining balance over the remaining term to lower the payment.",
  ],
  [
    "DTI",
    "Debt-to-income: the ratio lenders use to decide how much you can borrow.",
  ],
  [
    "Conforming loan",
    "A loan small enough to be sold to Fannie Mae or Freddie Mac.",
  ],
];

const NEVER = [
  "rate quote buttons",
  "“get pre-approved” forms",
  "lender affiliate links",
  "accounts, and no email required",
  "data sold, shared or handed to a lender",
];

// ── Schema — technical brief §10. Organization identity only: no Person
// schema, no sameAs. The WebApplication schema moved to the calculator page
// with the calculator; a hub is not an application. ─────────────────────────
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: SITE.url,
  description: SITE.tagline,
};

const siteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
  publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
      />

      {/* ── Banner — the page's one dark field ─────────────────────
          items-stretch, not items-end. The old banner sank its right column
          to the bottom of a row sized by the H1, leaving a large empty region
          beside the headline — a §3.4 violation produced by the code written
          to satisfy §3.4. The right column is now a bordered block that fills
          the height it is given. */}
      <section className="banner">
        <div className="relative mx-auto max-w-wrap px-[var(--gutter)] pb-12 pt-[clamp(1.6rem,4vw,2.6rem)]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] lg:items-stretch">
            <div>
              <p className="tag inline-flex items-center gap-2 bg-white/10 text-white/90">
                <span className="h-1.5 w-1.5 bg-[var(--gold-dark)]" />
                No lender pays us
              </p>
              <h1 className="mt-3 text-[clamp(1.95rem,5.2vw,2.95rem)] font-extrabold leading-[1.06] tracking-[-.035em]">
                Mortgage calculators with nothing to sell you
              </h1>
              <p className="mt-3 max-w-lede text-[1.02rem] leading-relaxed text-white/80">
                Every other calculator you have found is owned by someone who
                makes money when you take out a loan. This one is not. There are
                no rate quotes, no lead forms and no lender links anywhere on
                this site. Just the arithmetic, with the formula published so
                you can check it.
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <Link href={PAYMENT_PATH} className="btn btn-primary">
                  Work out a monthly payment
                </Link>
                <Link
                  href={PAYOFF_PATH}
                  className="btn border-white/30 text-white hover:bg-white/10"
                >
                  See what an extra payment does
                </Link>
              </div>
            </div>

            <div className="flex flex-col justify-center border-white/20 lg:border-l lg:pl-8">
              <p className="label text-white/60">What you will never find</p>
              <ul className="mt-3 space-y-2 text-[0.94rem] text-white/80">
                {NEVER.map((item) => (
                  <li key={item} className="flex gap-2">
                    <strong className="font-bold text-white">No</strong>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── The tools — the hub's actual job ───────────────────── */}
      <section className="py-[clamp(2.2rem,5vw,3.6rem)]">
        <div className="mx-auto max-w-wrap px-[var(--gutter)]">
          <SectionHead
            title="The calculators"
            intro="One tool per page, each answering a single question, each with the formula written out underneath it."
          />

          {/* Every live tool, at full size. Two columns rather than three:
              a 3-column grid sized for six cards left the original two looking
              like the remnants of something larger, and two columns still read
              as a set rather than a shortfall as the array grows. */}
          <ul className="grid gap-4 sm:grid-cols-2">
            {LIVE.map((t) => (
              <li key={t.title}>
                <Link
                  href={t.href}
                  className="flex h-full min-h-tap flex-col border border-line-strong bg-surface p-5 transition-colors duration-150 hover:border-accent"
                >
                  <IconTile>{t.icon}</IconTile>
                  <h3 className="mt-3.5 text-[1.12rem] font-extrabold tracking-[-.025em] text-ink">
                    {t.title}
                  </h3>
                  <p className="mt-1.5 flex-1 text-[0.93rem] leading-relaxed text-ink-2">
                    {t.body}
                  </p>
                  <p className="mt-3 text-[0.88rem] italic text-muted">
                    {t.question}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {/* Where the /learn/ silo surfaces on the hub. Deliberately outside
              the tool grid: an article is not a tool, and technical brief
              guardrail 14 keeps anything that is not a live tool out of every
              array a reader could mistake for the calculator set. */}
          <div className="mt-8 border-l-[3px] border-line-strong bg-paper-2 p-5">
            <p className="label">Reading, not a tool</p>
            <p className="mt-2 max-w-prose text-[0.95rem] leading-relaxed text-ink-2">
              Some questions do not need a calculator, they need the arithmetic
              written out. The month your own payment starts putting more toward
              principal than interest is one of them.
            </p>
            <p className="mt-3.5">
              <InlineLink href={LEARN_PATH} tone="strong">
                Read the explainers &rarr;
              </InlineLink>
            </p>
          </div>
        </div>
      </section>

      {/* ── The trust section ──────────────────────────────────────
          Was the site's second --ink-deep band. Now a white panel between two
          rules: same weight in the page, one dark field instead of two. */}
      <section className="bg-surface rule-t rule-b py-[clamp(2.2rem,5vw,3.6rem)]">
        <div className="mx-auto grid max-w-wrap gap-8 px-[var(--gutter)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-start">
          <div>
            <h2 className="max-w-[24ch] text-[clamp(1.5rem,3.6vw,2rem)] font-extrabold leading-tight tracking-[-.03em] text-ink">
              Why a calculator with no lender money is different
            </h2>
            <p className="mt-3 max-w-lede leading-relaxed text-ink-2">
              Most large mortgage sites disclose, in their own advertiser
              policies, that they earn money when a visitor is passed to a
              lender. That is not a secret and it is not a conspiracy. But it
              does shape which numbers a page emphasizes, and which it leaves
              out.
            </p>
            <p className="mt-3 max-w-lede leading-relaxed text-ink-2">
              This site carries no lender links, no quote buttons, and no
              affiliate relationships. It is funded by ads, which means we are
              paid the same whether or not you ever take out a loan. There is
              nothing here to submit, because there is nothing we want from you.
            </p>
            <p className="mt-3 max-w-lede leading-relaxed text-ink-2">
              Every calculation runs in your own browser. The figures you type
              are never sent to us and never stored anywhere, which is not a
              policy we chose to write. It is a consequence of the site having
              no accounts, no database and nowhere to put them.
            </p>
          </div>

          {/* Design guide §3.4 — the right slot is always filled. */}
          <div className="flex flex-col justify-center border-line lg:border-l-rule lg:pl-8">
            <p className="label">How to check us</p>
            <ul className="mt-3 space-y-3 text-[0.94rem] text-ink-2">
              <li>
                <InlineLink href={ROUTES.methodology} tone="strong">
                  Methodology
                </InlineLink>
                : every formula on the site, written out with its sources.
              </li>
              <li>
                <InlineLink href={ROUTES.corrections} tone="strong">
                  Corrections
                </InlineLink>
                : what we got wrong, and when we fixed it.
              </li>
              <li>
                <InlineLink href={ROUTES.editorialPolicy} tone="strong">
                  Editorial policy
                </InlineLink>
                : how pages get written and reviewed.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Glossary — ruled columns, no boxes ─────────────────── */}
      <section className="py-[clamp(2.2rem,5vw,3.6rem)]">
        <div className="mx-auto max-w-wrap px-[var(--gutter)]">
          <SectionHead
            title="Mortgage words, in plain English"
            intro="If a term shows up anywhere on this site without an explanation, that is a mistake and we want to hear about it."
          />
          {/* CSS columns, not a two-column grid.

              A grid couples the two columns into rows, so a one-line term on
              the left sat in a row sized by a two-line definition on the
              right, and its rule was pushed down leaving a band of dead
              space. Twelve entries of uneven length made that happen six
              times. Column flow decouples them: each entry is as tall as its
              own definition and its rule sits directly underneath it.

              break-inside-avoid stops an entry splitting across the column
              break. Reading order becomes down-then-across, which is how
              people read a glossary anyway. */}
          <dl className="gap-x-12 lg:columns-2">
            {GLOSSARY.map(([term, def]) => (
              <div
                key={term}
                className="grid break-inside-avoid items-baseline gap-x-3.5 border-b border-line py-3 sm:grid-cols-[7.5rem_minmax(0,1fr)]"
              >
                <dt className="text-[0.95rem] font-bold tracking-[-.01em] text-ink">
                  {term}
                </dt>
                {/* mt-1 below 640px only. The inner grid collapses to a single
                    column there, and gap-x sets no row gap, so without this
                    the definition sits flush against its term. */}
                <dd className="mt-1 text-[0.9rem] leading-relaxed text-ink-2 sm:mt-0">
                  {def}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Review meta ────────────────────────────────────────── */}
      <section className="pb-[clamp(1.6rem,3.5vw,2.4rem)]">
        <div className="mx-auto max-w-wrap px-[var(--gutter)]">
          <p className="text-[0.85rem] text-muted">
            Last reviewed{" "}
            <time className="num" dateTime={LAST_REVIEWED}>
              {LAST_REVIEWED}
            </time>
            . Estimates only, not financial advice, and not a loan offer.
          </p>
        </div>
      </section>
    </main>
  );
}
