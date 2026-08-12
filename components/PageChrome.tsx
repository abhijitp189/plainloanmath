import Link from "next/link";
import { SITE } from "@/lib/constants";

// The inner-page stripe — design guide §4.1. Same gradient and type treatment
// as the homepage banner, shorter. Every page opens with one.
//
// The right-hand slot is always filled. Design guide §3.4: never a headline on
// one side and empty space on the other.

export type Sibling = { href: string; label: string };

export function PageHeader({
  eyebrow,
  title,
  lede,
  siblings,
  breadcrumb = "Home",
}: {
  eyebrow: string;
  title: string;
  lede: string;
  siblings: Sibling[];
  breadcrumb?: string;
}) {
  return (
    <section className="banner">
      <div className="relative mx-auto max-w-wrap px-[var(--gutter)] pb-9 pt-[clamp(1.1rem,2.8vw,1.7rem)]">
        <nav aria-label="Breadcrumb" className="text-[0.85rem] text-white/70">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="underline-offset-2 hover:underline">
                {breadcrumb}
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="text-white/85">
              {title}
            </li>
          </ol>
        </nav>

        <div className="mt-[1.05rem] grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] lg:items-stretch">
          <div>
            <p className="tag inline-flex items-center gap-2 bg-white/10 text-white/90">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-[clamp(1.9rem,5vw,2.8rem)] font-extrabold leading-[1.08] tracking-[-.03em]">
              {title}
            </h1>
            <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-white/80">
              {lede}
            </p>
          </div>

          {/* The always-filled right slot. items-stretch plus a centered
              flex column, so a short list cannot leave a dead region beside
              a tall headline — design guide §3.4. */}
          <div className="flex flex-col justify-center border-white/20 lg:border-l lg:pl-8">
            <p className="label text-white/60">Related</p>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {siblings.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="inline-flex min-h-tap items-center border border-white/25 bg-white/10 px-3.5 text-[0.88rem] text-white/90 transition-colors duration-150 hover:bg-white/20"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The section head — heading, then its intro beneath it, 2px rule under both.
    Design guide §3.3, REVISED August 12, 2026.

    It used to be two columns: heading left, intro in a second column beside
    it, tops aligned. On a real screen that reads as two unrelated things
    rather than as a pair. A 32px heading and a 15px paragraph starting on the
    same top edge have no shared line to sit on — the paragraph floats level
    with the heading's ascenders, roughly half a line above where the eye
    expects a deck to start, and the gap between the two columns is wide enough
    that nothing connects them. Reported from a screenshot; the previous
    `items-start` fix corrected a worse version of the same problem and did not
    go far enough.

    Stacking removes the whole class of defect. There is no cross-column
    alignment left to get wrong at any width, the intro reads as a standfirst
    because it sits where a standfirst sits, and the pair is a single block
    that the 2px rule then closes.

    The lost benefit was that the two-column head filled the width. The rule
    underneath already does that, and §3.4's real target is a headline with a
    void beside it, which this no longer is — the block spans full width.

    This is a design guide change made deliberately and recorded here rather
    than a component quietly disagreeing with the document. §3.3 needs updating
    to match, and so does the "no `max-width` on section headings" note in
    §2.5, which still holds: the cap below is on the INTRO, not the heading. */
export function SectionHead({
  title,
  intro,
}: {
  title: string;
  /** ReactNode, not string — PriceTable's intro carries live figures. */
  intro: React.ReactNode;
}) {
  return (
    <div className="mb-7 border-b-rule border-line-strong pb-4">
      <h2 className="text-[clamp(1.5rem,3.6vw,2rem)] font-bold leading-[1.15] tracking-[-.015em] text-ink">
        {title}
      </h2>
      {/* 62ch on the intro only. A deck that runs the full 1200px is a
          different defect from the one above, not a fix for it. */}
      <p className="mt-2.5 max-w-[62ch] text-[1rem] leading-relaxed text-ink-2">
        {intro}
      </p>
    </div>
  );
}

/** Body copy for a text page. Design guide §2.3 — measure capped at 68ch. */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <section className="py-[clamp(2.2rem,5vw,3.6rem)]">
      <div className="mx-auto max-w-wrap px-[var(--gutter)]">
        <div className="max-w-prose space-y-4 text-ink-2 [&_a]:text-accent-dk [&_a]:underline [&_a]:decoration-line-strong [&_a]:underline-offset-2 [&_li]:leading-relaxed [&_p]:leading-relaxed">
          {children}
        </div>
      </div>
    </section>
  );
}

/** A titled block inside Prose. */
export function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="!mt-9 border-t-rule border-line-strong pt-7">
      <h2 className="text-[1.3rem] font-extrabold tracking-[-.025em] text-ink">
        {title}
      </h2>
      <div className="mt-3 space-y-4">{children}</div>
    </div>
  );
}

/** The review line every page carries. Design guide §8.4. */
export function ReviewMeta({
  updated,
  showContact = true,
}: {
  updated: string;
  /** Set false on the contact page itself, so the line does not link to itself. */
  showContact?: boolean;
}) {
  return (
    <div className="!mt-10 border-t-rule border-line-strong pt-5 text-[0.85rem] text-muted">
      <p>
        Last reviewed{" "}
        <time className="num" dateTime={updated}>
          {updated}
        </time>
        .
        {showContact ? (
          <>
            {" "}
            Questions or corrections: <a href="/contact/">contact us</a>.
          </>
        ) : null}
      </p>
    </div>
  );
}

/** BreadcrumbList schema — design guide §10, on every inner page. */
export function breadcrumbSchema(title: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE.url}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: title,
        item: `${SITE.url}${path}`,
      },
    ],
  };
}
