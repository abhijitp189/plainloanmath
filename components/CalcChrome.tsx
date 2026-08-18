import Link from "next/link";
import Disclaimer from "@/components/Disclaimer";
import { breadcrumbSchema } from "@/components/PageChrome";
import { ROUTES, PAGE_STRIPE, type StripeKey } from "@/lib/routes";

/**
 * The page furniture every calculator page shares.
 *
 * Extracted August 12, 2026, for the reason in project brief §0.8: the payment
 * and payoff pages had drifted apart in ways nobody chose. The payment
 * calculator sat INSIDE the dark banner and the payoff calculator sat below it
 * on the page ground, so the site's two tools did not look like they came from
 * the same site. The payment page alternated `--paper` and `--surface` bands
 * per design guide §3.2; the payoff page was one flat container with margins.
 * The FAQ accordion existed twice with different markup, and the review-date
 * footer existed twice with different wording.
 *
 * None of that was decided. It accumulated because the second page was written
 * by copying parts of the first. Calculators three through six would have
 * inherited the drift and multiplied it, which is exactly what happened with
 * the section-head markup in four files.
 *
 * THE RULE: a new calculator page imports from here. If it needs something
 * this file does not export, the thing to do is add it here — not to write it
 * inline "just for this page".
 */

/* ── Inline links in prose ───────────────────────────────────────── */

/**
 * A link inside a paragraph.
 *
 * Added August 18, 2026, and the reason is a count rather than an argument.
 * The eleven-word class string this replaces existed ELEVEN times across the
 * pages before this component, which is §0.13 at its most literal: two of
 * anything is the defect, and this was nowhere near two. It had not visibly
 * drifted yet, which is the only reason nobody had noticed.
 *
 * New pages use this. The eleven existing copies are a sweep of their own and
 * are recorded as an open item rather than folded into a build session, since
 * changing them touches five files that this session otherwise has no business
 * in. What matters today is that the count stopped growing.
 *
 * `--accent-dk` on white is 8.48:1, and the underline is a second signal so
 * color is not carrying the link on its own (§7).
 */
export function InlineLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-accent-dk underline decoration-line-strong underline-offset-2"
    >
      {children}
    </Link>
  );
}

/* ── The stripe ──────────────────────────────────────────────────── */

/**
 * The dark opening band: breadcrumb, eyebrow tag, H1, lede, a filled right
 * column, and the calculator itself.
 *
 * The calculator goes INSIDE this band. That is why the `.calc` white-on-white
 * guard exists (design guide §4.2) — the band is `color: #fff`, so anything
 * dropped in without an explicit color of its own renders white on a white
 * card and disappears. It has happened twice.
 *
 * `lg:items-stretch` on the grid, with the right column as
 * `flex flex-col justify-center` and a left border — design guide §3.4. The
 * obvious `lg:items-end` sinks the right column to the bottom of a row sized
 * by the H1 and leaves a large empty region beside the headline, which is the
 * dead-column defect produced by the code written to prevent it.
 */
export function CalcStripe({
  route,
  title,
  lede,
  asideTitle,
  asidePoints,
  children,
}: {
  /**
   * The calculator this stripe belongs to. The eyebrow tag (design guide §8.2)
   * and the breadcrumb leaf both come from CALC_STRIPE[route] in lib/routes.ts,
   * so they are declared once and the breadcrumb here cannot disagree with the
   * one in the page's BreadcrumbList schema — pass the same key to
   * `calcBreadcrumbSchema` (§0.13).
   */
  route: StripeKey;
  title: string;
  lede: string;
  asideTitle: string;
  /** Three to five short lines. The right column must not be empty (§3.4). */
  asidePoints: string[];
  /**
   * The calculator, on a calculator page.
   *
   * Optional as of August 15, 2026, because an article page opens with the
   * same stripe and has no tool to put in it (design guide §8.3). When absent
   * the trailing spacer is not rendered either, or the stripe would carry an
   * empty 2rem block below the lede on every article.
   */
  children?: React.ReactNode;
}) {
  const { eyebrow, breadcrumb } = PAGE_STRIPE[route];

  return (
    <section className="banner">
      <div className="relative mx-auto max-w-wrap px-[var(--gutter)] pb-11 pt-[clamp(1.1rem,2.8vw,1.7rem)]">
        <nav aria-label="Breadcrumb" className="text-[0.85rem] text-white/70">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link
                href={ROUTES.home}
                className="underline-offset-2 hover:underline"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">&rsaquo;</li>
            <li aria-current="page" className="text-white/85">
              {breadcrumb}
            </li>
          </ol>
        </nav>

        <div className="mt-[1.05rem] grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] lg:items-stretch">
          <div>
            <p className="tag inline-flex items-center gap-2 bg-white/10 text-white/90">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 bg-[var(--gold-dark)]"
              />
              {eyebrow}
            </p>
            <h1 className="mt-3 text-[clamp(1.85rem,4.6vw,2.7rem)] font-bold leading-[1.08] tracking-[-.025em]">
              {title}
            </h1>
            <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-white/80">
              {lede}
            </p>
          </div>

          <div className="flex flex-col justify-center border-white/20 lg:border-l lg:pl-8">
            <p className="label text-white/60">{asideTitle}</p>
            <ul className="mt-3 space-y-2 text-[0.9rem] text-white/80">
              {asidePoints.map((p) => (
                <li key={p} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 bg-[var(--gold-dark)]"
                  />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}

/**
 * The `BreadcrumbList` schema for a calculator page.
 *
 * A thin wrapper over the generic `breadcrumbSchema` (components/PageChrome.tsx,
 * used by every text page too) that reads the leaf label from the same
 * CALC_STRIPE registry `CalcStripe` reads, so the structured data and the
 * visible breadcrumb are guaranteed to describe the same trail. Pass the same
 * route key to both.
 */
export function calcBreadcrumbSchema(route: StripeKey) {
  return breadcrumbSchema(PAGE_STRIPE[route].breadcrumb, ROUTES[route]);
}

/* ── Bands ───────────────────────────────────────────────────────── */

/**
 * A content band — design guide §3.2.
 *
 * Bands alternate so the page has vertical rhythm rather than reading as one
 * continuous sheet. With the warm ground, `--paper` is the default and a
 * `--surface` band is the one that lifts, which is the reverse of how it read
 * before the August 11 palette change.
 *
 * Never `dark`: §3.2 allows one dark field per page and the stripe is it.
 */
export function Band({
  tone = "paper",
  children,
}: {
  tone?: "paper" | "surface";
  children: React.ReactNode;
}) {
  return (
    <section
      className={`${
        tone === "paper" ? "bg-paper" : "bg-surface"
      } py-[clamp(2.2rem,5vw,3.6rem)]`}
    >
      <div className="mx-auto max-w-wrap px-[var(--gutter)]">{children}</div>
    </section>
  );
}

/**
 * Two-column editorial body — design guide §3.4.
 *
 * A block either has content on both sides or spans the full width; never a
 * 68ch column of text on the left of a 1200px container with a void beside it.
 * `lg:items-start` so a shorter column ends where its content ends.
 */
export function EditorialCols({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="grid gap-x-12 gap-y-8 lg:grid-cols-2 lg:items-start">
      <div className="max-w-prose space-y-4 text-ink-2">{left}</div>
      <div className="max-w-prose space-y-4 text-ink-2">{right}</div>
    </div>
  );
}

/** A subheading inside an editorial column. */
export function Sub({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[1.1rem] font-bold tracking-[-.02em] text-ink">
      {children}
    </h3>
  );
}

/* ── FAQ ─────────────────────────────────────────────────────────── */

export type Faq = { q: string; a: string };

/**
 * The FAQ accordion, and the only place its markup lives.
 *
 * Native `<details>`, so it works with no JavaScript, is announced correctly
 * without ARIA, and prints open (design guide §9). The `+` rotating to a `×`
 * is the affordance — a bold question with no visible control does not read as
 * expandable, which is how the payoff page first shipped.
 *
 * Two columns above `md`, because a single column of questions inside a 1200px
 * container is the dead-right-column defect again.
 */
export function FaqBlock({ items }: { items: Faq[] }) {
  const half = Math.ceil(items.length / 2);
  const columns = [items.slice(0, half), items.slice(half)];

  return (
    <div className="grid gap-x-12 md:grid-cols-2 md:items-start">
      {columns.map((column, i) => (
        <div
          key={i}
          className="divide-y divide-line border-t border-line last:border-b md:border-b"
        >
          {column.map((item) => (
            <details key={item.q} className="group py-1">
              <summary className="flex min-h-tap cursor-pointer list-none items-center justify-between gap-3 py-3 text-[0.98rem] font-bold text-ink marker:content-none">
                {item.q}
                <span
                  aria-hidden="true"
                  className="shrink-0 text-muted transition-transform duration-150 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-prose pb-3 text-[0.92rem] leading-relaxed text-ink-2">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      ))}
    </div>
  );
}

/** `FAQPage` schema from the same array the page renders. */
export function faqSchema(items: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/* ── Sources ─────────────────────────────────────────────────────── */

export type Source = { label: string; url: string; verified: string };

/**
 * The outbound source list. Project brief §11 — generous outbound linking to
 * primary sources is one of the things that actually carries credibility on a
 * YMYL page, and §0.2 requires every stated figure to have one.
 */
export function Sources({ items }: { items: Source[] }) {
  return (
    <>
      <p className="label">Sources</p>
      <ul className="mt-3 grid gap-3 text-[0.88rem] text-ink-2 md:grid-cols-3">
        {items.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              className="text-accent-dk underline decoration-line-strong underline-offset-2"
            >
              {s.label}
            </a>{" "}
            <span className="text-muted">
              — read <span className="num">{s.verified}</span>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ── Footer ──────────────────────────────────────────────────────── */

/**
 * Sibling links, the standing disclaimer and the review date — design guide
 * §8.4, which asks every page for three to four sibling links and a visible,
 * accurate last-reviewed date.
 *
 * `reviewed` is passed in rather than read from `LAST_REVIEWED` here, because
 * a page rewritten on its own has its own date in `ROUTE_REVIEWED` and the
 * site-wide constant still speaks for everything else.
 */
export function CalcFooter({
  siblings,
  reviewed,
}: {
  siblings: { href: string; label: string }[];
  reviewed: string;
}) {
  return (
    <>
      <p className="label">Keep going</p>
      <ul className="mt-3 flex flex-wrap gap-2.5">
        {siblings.map((s) => (
          <li key={s.href}>
            <Link href={s.href} className="btn btn-secondary">
              {s.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 max-w-prose">
        <Disclaimer />
      </div>

      <p className="mt-8 border-t-rule border-line-strong pt-5 text-[0.85rem] text-muted">
        Last reviewed{" "}
        <time className="num" dateTime={reviewed}>
          {reviewed}
        </time>
        . Estimates only — not financial advice, and not a loan offer.{" "}
        <Link
          href={ROUTES.methodology}
          className="text-accent-dk underline decoration-line-strong underline-offset-2"
        >
          How we calculate
        </Link>{" "}
        ·{" "}
        <Link
          href={ROUTES.corrections}
          className="text-accent-dk underline decoration-line-strong underline-offset-2"
        >
          Corrections
        </Link>
      </p>
    </>
  );
}
