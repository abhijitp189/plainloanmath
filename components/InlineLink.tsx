import Link from "next/link";

/**
 * The one inline text link on the site.
 *
 * It lived inside `CalcChrome.tsx` and was therefore only reachable from a
 * calculator page, so every other surface hand-copied the class string
 * instead. Eleven copies had accumulated across nine files, two of which had
 * quietly grown a hover state the other nine did not have, and the PMI
 * article had given up and defined its own `A` and `L` helpers locally.
 * Project brief §22 item 10: two of anything is the defect. This is the third
 * time the string was copied, which is two times too many.
 *
 * `--accent-dk` on white is 8.48:1, and the underline is a second signal so
 * color is not carrying the link on its own (design guide §7).
 *
 * Two tones and no more:
 *
 * - `body` is a link inside a sentence. Understated, because a paragraph with
 *   four bold links in it reads as a navigation block rather than as prose.
 * - `strong` is a link that IS the sentence, or nearly so: a list item whose
 *   whole purpose is the destination, a call to action at the end of a panel.
 *   Heavier weight, softer underline, more offset.
 *
 * Every body link now hovers. Nine of the eleven copies did not, which meant
 * hovering a link in an article did nothing while hovering the same link in a
 * teaser darkened it.
 *
 * External hrefs render `<a>`, internal ones render `next/link`. Nothing here
 * sets `target`, so nothing here needs `rel="noopener"` — that attribute only
 * does work on a link that opens a new context.
 */

type Tone = "body" | "strong";

const TONE: Record<Tone, string> = {
  body: "text-accent-dk underline decoration-line-strong underline-offset-2 hover:decoration-accent",
  strong:
    "font-bold text-accent-dk underline decoration-accent/40 underline-offset-4 hover:decoration-accent",
};

/** Anything that leaves the site, plus the two schemes that leave the browser. */
const EXTERNAL = /^(https?:|mailto:|tel:)/;

export function InlineLink({
  href,
  children,
  tone = "body",
}: {
  href: string;
  children: React.ReactNode;
  tone?: Tone;
}) {
  const className = TONE[tone];

  if (EXTERNAL.test(href)) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
