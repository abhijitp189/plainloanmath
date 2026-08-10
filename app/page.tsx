import type { Metadata } from "next";
import Link from "next/link";
import { LAST_REVIEWED, SITE } from "@/lib/constants";
import { PAYOFF_PATH, PAYMENT_PATH } from "@/lib/routes";

// The hub, from August 10, 2026.
//
// This page used to be the mortgage payment calculator as well. It is not any
// more — the calculator moved to PAYMENT_PATH so it can be tuned for one query
// and maintained on its own. What is left here has a single job: say what the
// site is, and get people to the right tool.
//
// The rule that made the old arrangement necessary still holds in its new
// form: there is exactly one page per tool, and this page is not one of them.
// Do not add a calculator back to this page.

export const metadata: Metadata = {
  title: "Plain Loan Math — Mortgage Calculators With Nothing to Sell",
  description:
    "Free mortgage calculators and plain explanations of the math behind them. No lender pays us, and there are no rate quotes, lead forms or affiliate links anywhere on this site.",
  alternates: { canonical: "/" },
};

type Tool = {
  href?: string;
  flag?: string;
  a: string;
  bg: string;
  bd: string;
  title: string;
  body: string;
  question: string;
  icon: React.ReactNode;
};

// Only tools with a live page carry an href. Project brief §3, defect 3 — the
// site shipped nine links to routes that did not exist, and this grid is
// exactly where a tenth would come from. An unbuilt tool renders as plain
// text, not as a link to a 404.
const TOOLS: Tool[] = [
  {
    href: PAYMENT_PATH,
    a: "#2E7FD1",
    bg: "#EAF2FA",
    bd: "#C9DEF3",
    title: "Monthly payment",
    body: "Principal, interest, taxes and insurance — separated, not lumped into one number.",
    question: "“What will I actually pay?”",
    icon: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.6" />
        <path d="M6.5 12h.01M17.5 12h.01" />
      </>
    ),
  },
  {
    href: PAYOFF_PATH,
    a: "#0D6E5F",
    bg: "#E7F0EF",
    bd: "#C0D9D5",
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
  {
    flag: "Next",
    a: "#8B6FB0",
    bg: "#F3F1F7",
    bd: "#E1DAEA",
    title: "Amortization schedule",
    body: "Every month of the loan, downloadable as a spreadsheet.",
    question: "“Where is my money going?”",
    icon: <path d="M4 6h16M4 12h16M4 18h11" />,
  },
  {
    flag: "Soon",
    a: "#EF9A2E",
    bg: "#FDF5EA",
    bd: "#FBE5C9",
    title: "How much house you can afford",
    body: "The gap between what you are approved for and what is comfortable.",
    question: "“What can I really afford?”",
    icon: (
      <>
        <path d="M3 11l9-7 9 7" />
        <path d="M5.5 10v10h13V10" />
        <path d="M10 20v-5h4v5" />
      </>
    ),
  },
  {
    flag: "Soon",
    a: "#C4788C",
    bg: "#F9F2F4",
    bd: "#F0DCE1",
    title: "Refinance break-even",
    body: "The month the closing costs finish paying for themselves.",
    question: "“Is refinancing worth it?”",
    icon: (
      <>
        <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" />
        <path d="M20.5 4v4.5H16" />
      </>
    ),
  },
  {
    flag: "Soon",
    a: "#0A574B",
    bg: "#E6EEED",
    bd: "#BFD3D0",
    title: "15-year vs 30-year",
    body: "Both loans side by side, in dollars rather than adjectives.",
    question: "“Which term should I take?”",
    icon: <path d="M6 20V11M12 20V4M18 20V15" />,
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

/** Design guide §4.3 — outlined icon on a pale tint, never a gradient chip. */
function IconTile({
  a,
  bg,
  bd,
  children,
  size = 42,
}: {
  a: string;
  bg: string;
  bd: string;
  children: React.ReactNode;
  size?: number;
}) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center border"
      style={{ width: size, height: size, background: bg, borderColor: bd }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.5}
        height={size * 0.5}
        fill="none"
        stroke={a}
        strokeWidth={1.8}
        strokeLinecap="square"
        strokeLinejoin="miter"
      >
        {children}
      </svg>
    </span>
  );
}

/** Design guide §3.3 — heading left, intro beside it, rule underneath.
    The heading column was widened from 1fr to 1.25fr: at the old ratio a
    normal-length section heading wrapped to two lines with empty space beside
    it, which is what made the page read as over-divided. */
function SectionHead({ title, intro }: { title: string; intro: string }) {
  return (
    <div className="mb-6 grid items-end gap-y-2 gap-x-12 border-b-rule border-line-strong pb-4 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <h2 className="text-[clamp(1.5rem,3.6vw,2rem)] font-extrabold tracking-[-.03em] text-ink">
        {title}
      </h2>
      <p className="text-[0.95rem] leading-relaxed text-muted">{intro}</p>
    </div>
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

      {/* ── Banner ─────────────────────────────────────────────────
          items-stretch, not items-end. The old banner sank its right column
          to the bottom of a row sized by the H1, leaving a large empty region
          beside the headline — a §3.4 violation produced by the code written
          to satisfy §3.4. The right column is now a bordered block that fills
          the height it is given. */}
      <section className="banner">
        <div className="relative mx-auto max-w-wrap px-[var(--gutter)] pb-12 pt-[clamp(1.6rem,4vw,2.6rem)]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] lg:items-stretch">
            <div>
              <p className="tag inline-flex items-center gap-2 bg-white/12 text-white/90">
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
                {[
                  "rate quote buttons",
                  "“get pre-approved” forms",
                  "lender affiliate links",
                  "accounts, and no email required",
                  "data sold, shared or handed to a lender",
                ].map((item) => (
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

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => {
              const inner = (
                <>
                  {t.flag && (
                    <span className="tag absolute right-3 top-3 bg-paper-2 text-muted">
                      {t.flag}
                    </span>
                  )}
                  <IconTile a={t.a} bg={t.bg} bd={t.bd}>
                    {t.icon}
                  </IconTile>
                  <h3 className="mt-3.5 text-[1.05rem] font-extrabold tracking-[-.025em] text-ink">
                    {t.title}
                  </h3>
                  <p className="mt-1.5 flex-1 text-[0.91rem] leading-relaxed text-ink-2">
                    {t.body}
                  </p>
                  <p className="mt-3 text-[0.88rem] italic text-muted">
                    {t.question}
                  </p>
                </>
              );

              return (
                <li key={t.title}>
                  {t.href ? (
                    <Link
                      href={t.href}
                      className="relative flex h-full min-h-tap flex-col border border-line-strong bg-surface p-5 transition-colors duration-150 hover:border-accent"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div className="relative flex h-full flex-col border border-dashed border-line-strong bg-surface/60 p-5">
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── The one dark band — design guide §3.2 ──────────────── */}
      <section className="bg-ink-deep py-[clamp(2.2rem,5vw,3.6rem)] text-white">
        <div className="mx-auto grid max-w-wrap gap-8 px-[var(--gutter)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-start">
          <div>
            <h2 className="max-w-[24ch] text-[clamp(1.5rem,3.6vw,2rem)] font-extrabold leading-tight tracking-[-.03em]">
              Why a calculator with no lender money is different
            </h2>
            <p className="mt-3 max-w-lede leading-relaxed text-white/75">
              Most large mortgage sites disclose, in their own advertiser
              policies, that they earn money when a visitor is passed to a
              lender. That is not a secret and it is not a conspiracy. But it
              does shape which numbers a page emphasizes, and which it leaves
              out.
            </p>
            <p className="mt-3 max-w-lede leading-relaxed text-white/75">
              This site carries no lender links, no quote buttons, and no
              affiliate relationships. It is funded by ads, which means we are
              paid the same whether or not you ever take out a loan. There is
              nothing here to submit, because there is nothing we want from
              you.
            </p>
            <p className="mt-3 max-w-lede leading-relaxed text-white/75">
              Every calculation runs in your own browser. The figures you type
              are never sent to us and never stored anywhere, which is not a
              policy we chose to write — it is a consequence of the site having
              no accounts, no database and nowhere to put them.
            </p>
          </div>

          {/* Design guide §3.4 — the right slot is always filled. */}
          <div className="flex flex-col justify-center border-white/20 lg:border-l lg:pl-8">
            <p className="label text-white/60">How to check us</p>
            <ul className="mt-3 space-y-3 text-[0.94rem] text-white/80">
              <li>
                <Link
                  href="/methodology/"
                  className="font-bold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
                >
                  Methodology
                </Link>{" "}
                — every formula on the site, written out with its sources.
              </li>
              <li>
                <Link
                  href="/corrections/"
                  className="font-bold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
                >
                  Corrections
                </Link>{" "}
                — what we got wrong, and when we fixed it.
              </li>
              <li>
                <Link
                  href="/editorial-policy/"
                  className="font-bold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
                >
                  Editorial policy
                </Link>{" "}
                — how pages get written and reviewed.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Glossary ───────────────────────────────────────────── */}
      <section className="bg-paper py-[clamp(2.2rem,5vw,3.6rem)]">
        <div className="mx-auto max-w-wrap px-[var(--gutter)]">
          <SectionHead
            title="Mortgage words, in plain English"
            intro="If a term shows up anywhere on this site without an explanation, that is a mistake and we want to hear about it."
          />
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GLOSSARY.map(([term, def]) => (
              <div key={term} className="border border-line-strong bg-surface p-4">
                <dt className="text-[0.95rem] font-extrabold tracking-[-.02em] text-ink">
                  {term}
                </dt>
                <dd className="mt-1 text-[0.9rem] leading-relaxed text-ink-2">
                  {def}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Review meta ────────────────────────────────────────── */}
      <section className="py-[clamp(1.6rem,3.5vw,2.4rem)]">
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
