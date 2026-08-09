import type { Metadata } from "next";
import {
  PageHeader,
  Prose,
  Block,
  ReviewMeta,
  breadcrumbSchema,
} from "@/components/PageChrome";
import { LAST_REVIEWED } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Corrections",
  description:
    "How Plain Loan Math handles mistakes: what gets corrected, how quickly, and the running log of every correction made.",
  alternates: { canonical: "/corrections/" },
};

/**
 * The correction log. Append a new entry at the top when something is fixed.
 * An empty log is honest for a site this young — an invented one is not.
 */
const CORRECTIONS: { date: string; page: string; what: string }[] = [];

export default function CorrectionsPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema("Corrections", "/corrections/"),
          ),
        }}
      />
      <PageHeader
        eyebrow="How this works"
        title="Corrections"
        lede="Mistakes get logged here with the date, not quietly edited away. A site about money that hides its errors is not worth reading."
        siblings={[
          { href: "/editorial-policy/", label: "Editorial policy" },
          { href: "/methodology/", label: "Methodology" },
          { href: "/contact/", label: "Contact" },
        ]}
      />

      <Prose>
        <Block title="What counts as a correction">
          <p>
            Anything that made a reader&rsquo;s understanding worse: a wrong
            number, a formula that produced the wrong result, a rule described
            incorrectly, a threshold that changed and was not updated, or a
            source that turned out not to say what we said it said.
          </p>
          <p>
            Fixing a typo, tightening a sentence, or redesigning a page is not
            a correction and is not logged. The test is whether someone acting
            on the old version would have been misled.
          </p>
        </Block>

        <Block title="How we handle one">
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className="font-semibold text-ink">
                Arithmetic errors are fixed immediately
              </strong>{" "}
              &mdash; within a day of being confirmed.
            </li>
            <li>
              The corrected page carries a note saying what was wrong and when
              it changed, for at least 90 days.
            </li>
            <li>
              The correction is added to the log below with the date, the page,
              and what changed.
            </li>
            <li>
              The page&rsquo;s last-reviewed date is updated.
            </li>
          </ul>
          <p>
            We do not delete a page to make an error disappear, and we do not
            change a figure without saying that we changed it.
          </p>
        </Block>

        <Block title="Telling us about one">
          <p>
            <a href="/contact/">Tell us</a> — include the page, the figure you
            saw, and what you believe it should be. You do not need
            to be certain &mdash; a question that turns out to be nothing costs
            us five minutes, and a real error left in place costs a reader far
            more. Corrections jump the queue ahead of everything else.
          </p>
        </Block>

        <Block title="The log">
          {CORRECTIONS.length === 0 ? (
            <p className="rounded-card border border-line bg-paper p-4">
              No corrections have been issued yet. This site launched recently
              and has published a small number of pages. When the first
              correction happens it will appear here, dated, rather than
              disappearing into an edit.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-card border border-line bg-surface">
              <table className="w-full min-w-[34rem] border-collapse text-[0.92rem]">
                <thead>
                  <tr className="bg-paper-2 text-left text-[11px] font-bold uppercase tracking-[.13em] text-muted">
                    <th scope="col" className="px-4 py-3">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Page
                    </th>
                    <th scope="col" className="px-4 py-3">
                      What changed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {CORRECTIONS.map((c) => (
                    <tr
                      key={`${c.date}-${c.page}`}
                      className="border-t border-line align-top"
                    >
                      <td className="num px-4 py-2.5 whitespace-nowrap text-ink-2">
                        {c.date}
                      </td>
                      <td className="px-4 py-2.5 text-ink">{c.page}</td>
                      <td className="px-4 py-2.5 text-ink-2">{c.what}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Block>

        <ReviewMeta updated={LAST_REVIEWED} />
      </Prose>
    </main>
  );
}
