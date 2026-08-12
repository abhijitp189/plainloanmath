import type { Metadata } from "next";
import Link from "next/link";
import { LAST_REVIEWED, SITE } from "@/lib/constants";
import { PAYOFF_PATH, PAYMENT_PATH } from "@/lib/routes";
import { SectionHead } from "@/components/PageChrome";

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
//    payment, teal for payoff, purple for amortization, orange for
//    affordability. Six tinted chips in a row was the loudest thing on the
//    site, and it spent the meaning of those hues before a reader reached a
//    chart. The data palette is for data. Icons are ink strokes in a plain
//    square; teal appears on hover and on the primary button, and nowhere
//    else above the fold.
//
// 2. Two live tools, four listed. Four of six cards were dashed placeholders
//    taking the same space as the working tools, so the page's dominant
//    visual fact was absence. The built ones now get full-size cards; the
//    unbuilt ones are a ruled list underneath, which is also more honest —
//    a list reads as a roadmap, six cards read as a product with holes in it.
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
  title: "Plain Loan Math — Mortgage Calculators With Nothing to Sell",
  description:
    "Free mortgage calculators and plain explanations of the math behind them. No lender pays us, and there are no rate quotes, lead forms or affiliate links anywhere on this site.",
  alternates: { canonical: "/" },
};

type LiveTool = {
  href: string;
  title: string;
  body: string;
  question: string;
  icon: React.ReactNode;
};

type PlannedTool = {
  flag: string;
  title: string;
  question: string;
};

// Only tools with a live page appear as cards. Project brief §3, defect 3 —
// the site shipped nine links to routes that did not exist, and this grid is
// exactly where a tenth would come from. An unbuilt tool cannot be a card at
// all now, which is a stronger guard than rendering it as plain text.
const LIVE: LiveTool[] = [
  {
    href: PAYMENT_PATH,
    title: "Monthly payment",
    body: "Principal, interest, taxes and insurance — separated, not lumped into one number.",
    question: "“What will I actually pay?”",
    icon: (
      <>
        <rect x="3" y="6" width="18" height="12" />
        <circle cx="12" cy="12" r="2.6" />
        <path d="M6.5 12h.01M17.5 12h.01" />
      </>
    ),
  },
  {
    href: PAYOFF_PATH,
    title: "Payoff with extra payments",
    body: "Add anything extra each month and watch the interest disappear.",
    question: "“What if I pay $200 more?”",
    icon: (
      <>
        <path d="M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z" />
        <path d="M4 7v5c0 1.7 3.6 3 8 3s8-1.3 8-3V7" />
        <path d="M4 12v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5" />
      </>
    ),
  },
];

const PLANNED: PlannedTool[] = [
  {
    flag: "Next",
    title: "Amortization schedule",
    question: "“Where is my money going?”",
  },
  {
    flag: "Soon",
    title: "How much house you can afford",
    question: "“What can I really afford?”",
  },
  {
    flag: "Soon",
    title: "Refinance break-even",
    question: "“Is refinancing worth it?”",
  },
  {
    flag: "Soon",
    title: "15-year vs 30-year",
    question: "“Which term should I take?”",
  },
];

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
    "Principal, interest, taxes, insurance — the four parts of a typical bill.",
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
    "Debt-to-income — the ratio lenders use to decide how much you can borrow.",
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

/** Design guide §4.3, revised August 11 — outlined ink icon in a plain square.
    No per-tool color, no pale tint, no gradient chip. The square is a hairline
    in --line-strong and the strokes are ink; the only thing that moves on
    hover is the card border, and it moves to the accent. */
function IconTile({
  children,
  size = 44,
}: {
  children: React.ReactNode;
  size?: number;
}) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center border border-line-strong"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.5}
        height={size * 0.5}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="square"
        strokeLinejoin="miter"
        className="text-ink"
      >
        {children}
      </svg>
    </span>
  );
}

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
                makes money when you take out a loan. This one is not. There
                are no rate quotes, no lead forms and no lender links anywhere
                on this site — just the arithmetic, with the formula published
                so you can check it.
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
            intro="One tool per page, each answering a single question, each with the formula written out underneath it. Tools without a link are not built yet — they are listed so you can see where this is going."
          />

          {/* Two live tools, at full size. Two columns rather than three:
              a 3-column grid sized for six cards left these two looking like
              the remnants of something larger. */}
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

          {/* The roadmap. A ruled list, not cards — see note 2 at the top.
              Grid rather than flex so the question column lines up down the
              list regardless of how long a title runs; the question drops off
              below 640px rather than wrapping to three ragged lines. */}
          <div className="mt-8">
            <p className="label">Not built yet</p>
            <ul className="mt-2.5 border-t border-line">
              {PLANNED.map((t) => (
                <li
                  key={t.title}
                  className="grid grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-x-3.5 border-b border-line py-2.5 sm:grid-cols-[3rem_15rem_minmax(0,1fr)]"
                >
                  <span className="tag tag-status">{t.flag}</span>
                  <span className="text-[0.95rem] font-bold text-ink">
                    {t.title}
                  </span>
                  <span className="hidden text-[0.88rem] text-muted sm:block">
                    {t.question}
                  </span>
                </li>
              ))}
            </ul>
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
              nothing here to submit, because there is nothing we want from
              you.
            </p>
            <p className="mt-3 max-w-lede leading-relaxed text-ink-2">
              Every calculation runs in your own browser. The figures you type
              are never sent to us and never stored anywhere, which is not a
              policy we chose to write — it is a consequence of the site having
              no accounts, no database and nowhere to put them.
            </p>
          </div>

          {/* Design guide §3.4 — the right slot is always filled. */}
          <div className="flex flex-col justify-center border-line lg:border-l-rule lg:pl-8">
            <p className="label">How to check us</p>
            <ul className="mt-3 space-y-3 text-[0.94rem] text-ink-2">
              <li>
                <Link
                  href="/methodology/"
                  className="font-bold text-accent-dk underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                >
                  Methodology
                </Link>{" "}
                — every formula on the site, written out with its sources.
              </li>
              <li>
                <Link
                  href="/corrections/"
                  className="font-bold text-accent-dk underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                >
                  Corrections
                </Link>{" "}
                — what we got wrong, and when we fixed it.
              </li>
              <li>
                <Link
                  href="/editorial-policy/"
                  className="font-bold text-accent-dk underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                >
                  Editorial policy
                </Link>{" "}
                — how pages get written and reviewed.
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
            . Estimates only — not financial advice, and not a loan offer.
          </p>
        </div>
      </section>
    </main>
  );
}
