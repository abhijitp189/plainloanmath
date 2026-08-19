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
  title: "Editorial Policy",
  description:
    "How Plain Loan Math researches, sources, reviews and updates what it publishes, and what it will not publish at any price.",
  alternates: { canonical: "/editorial-policy/" },
};

export default function EditorialPolicyPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema("Editorial Policy", "/editorial-policy/"),
          ),
        }}
      />
      <PageHeader
        eyebrow="How this works"
        title="Editorial Policy"
        lede="The rules we hold ourselves to when writing about the largest debt most people ever take on. They exist so you can judge the work rather than trust the source."
        siblings={[
          { href: "/methodology/", label: "Methodology" },
          { href: "/corrections/", label: "Corrections" },
          { href: "/about/", label: "About" },
        ]}
      />

      <Prose>
        <Block title="Where facts come from">
          <p>
            Any rule, limit, threshold, or tax figure on this site traces to a
            primary source: the Consumer Financial Protection Bureau, the
            Federal Housing Finance Agency, HUD, the IRS, Freddie Mac, or the
            statute itself. We link to it so you can read it yourself.
          </p>
          <p>
            Secondary sources are used to check that a rule has not been
            superseded, never to establish it in the first place. We do
            not cite other calculators, comparison sites, or blogs as authority
            for a fact.
          </p>
          <p>
            Where sources genuinely disagree, we say so and link to both rather
            than picking the tidier answer.
          </p>
        </Block>

        <Block title="Dates and staleness">
          <p>
            Mortgage figures go out of date. Loan limits change every year,
            usually in late November. Tax thresholds change with legislation.
            So every dated figure carries the date it was verified, and every
            page carries the date it was last reviewed.
          </p>
          <p>
            A correct 2024 figure presented in 2026 is a wrong figure. If you
            find one, the <a href="/corrections/">corrections page</a> explains
            what happens next.
          </p>
        </Block>

        <Block title="Showing the working">
          <p>
            No calculation on this site is a black box. Every formula is
            written out on the <a href="/methodology/">methodology page</a> so
            you can reproduce it by hand or check it against any other tool. If
            our number and your lender&rsquo;s number disagree, you should be
            able to find out why.
          </p>
          <p>
            Where a technical term appears without an explanation, we treat
            that as a defect and fix it.
          </p>
        </Block>

        <Block title="Information, not advice">
          <p>
            We explain how mortgage arithmetic works. We do not tell you what
            to do, because we do not know your income, your savings, your job
            security, or your plans, and a calculator that has never met you
            cannot advise you.
          </p>
          <p>
            You will not find the words &ldquo;expert&rdquo;,
            &ldquo;advisor&rdquo;, or &ldquo;pro&rdquo; used about us on this
            site. Where a decision genuinely turns on your circumstances, we
            say so and point to a licensed mortgage professional or a
            HUD-approved housing counselor.
          </p>
        </Block>

        <Block title="Independence">
          <p>
            No lender, broker, servicer, or lead generator pays us, sponsors
            us, reviews our copy before publication, or has any relationship
            with this site. We carry no affiliate links and accept no sponsored
            content, paid links, or guest posts.
          </p>
          <p>
            Advertising is sold by Google and we do not choose which ads
            appear. Advertisers have no influence over what we publish and no
            advance sight of it. An ad next to an article is not an endorsement
            of it, in either direction.
          </p>
        </Block>

        <Block title="What we will not publish">
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Rate quotes, offers, or anything that reads as one</li>
            <li>Lender comparisons or recommendations</li>
            <li>Sponsored or affiliate content of any kind</li>
            <li>
              Predictions about where interest rates are going. Nobody knows,
              and a guess printed next to real arithmetic borrows its
              credibility
            </li>
            <li>General personal finance or news outside mortgage math</li>
          </ul>
        </Block>

        <Block title="Review cadence">
          <p>
            Calculator pages are reviewed when the underlying rules change and
            at least once a year. Pages carrying annual figures are reviewed
            each December, after the year&rsquo;s limits are announced. The
            reviewed date on a page is the real date somebody read it, not the
            date the file was touched.
          </p>
        </Block>

        <Block title="Holding us to this">
          <p>
            If something here falls short of the above,{" "}
            <a href="/contact/">tell us</a>. That includes
            copy that reads like advice, a figure without a source, or a page
            that has gone stale.
          </p>
        </Block>

        <ReviewMeta updated={LAST_REVIEWED} />
      </Prose>
    </main>
  );
}
