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
  title: "About Plain Loan Math",
  description:
    "Why a mortgage calculator with no lender links exists, who pays for it, and how to tell whether the numbers can be trusted.",
  alternates: { canonical: "/about/" },
};

export default function AboutPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema("About Plain Loan Math", "/about/"),
          ),
        }}
      />
      <PageHeader
        eyebrow="About"
        title="About Plain Loan Math"
        lede="Almost every mortgage calculator on the internet is owned by someone who profits when you take out a loan. This one isn't, and that shapes every decision on the site."
        siblings={[
          { href: "/methodology/", label: "Methodology" },
          { href: "/editorial-policy/", label: "Editorial policy" },
          { href: "/contact/", label: "Contact" },
        ]}
      />

      <Prose>
        <Block title="Why this exists">
          <p>
            If you search for a mortgage calculator, most of what you find is
            published by a lender, a broker, a comparison site paid by lenders,
            or a listings portal that earns a fee when you are passed to one.
            None of that is hidden &mdash; it is usually in their own advertiser
            disclosure.
          </p>
          <p>
            It still changes the product. When the goal is to move you toward a
            loan, the tool shows a monthly payment and a button. It does not
            linger on how much of the first decade is interest, or on what an
            extra $200 a month would do to the total, because neither of those
            makes anyone want to borrow more.
          </p>
          <p>
            Plain Loan Math shows the arithmetic first and has nothing to sell
            you at the end of it.
          </p>
        </Block>

        <Block title="What we refuse to do">
          <ul className="ml-5 list-disc space-y-1.5">
            <li>No lender links, quote buttons, or rate tables tied to offers</li>
            <li>No lead forms, no email capture, no &ldquo;get pre-approved&rdquo;</li>
            <li>No affiliate relationships with anyone in the mortgage industry</li>
            <li>No accounts and no database — nothing you type is stored</li>
          </ul>
          <p>
            These are structural, not promises. The site is a set of static
            files with no server behind it, so there is nowhere for your
            figures to be collected even if we wanted them.
          </p>
        </Block>

        <Block title="How it is paid for">
          <p>
            Advertising, through Google AdSense. That means we are paid the
            same whether you take out a mortgage tomorrow or never take one out
            at all &mdash; which is the point. We have no incentive to steer
            you, because there is no direction that pays us more.
          </p>
          <p>
            Ads never appear above a calculator, and an ad is never an
            endorsement. How advertising cookies work is set out in the{" "}
            <a href="/privacy/">privacy policy</a>.
          </p>
        </Block>

        <Block title="How to check us">
          <p>
            You should not take a stranger&rsquo;s arithmetic on trust,
            particularly about the largest debt most people ever carry. So:
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              Every formula is written out on the{" "}
              <a href="/methodology/">methodology page</a>. Check it against
              any other calculator.
            </li>
            <li>
              Rules and thresholds link to the primary source &mdash; the CFPB,
              the FHFA, HUD, the IRS &mdash; not to another blog.
            </li>
            <li>
              Every page carries the date it was last reviewed, and mistakes go
              on the <a href="/corrections/">corrections page</a> rather than
              being quietly edited away.
            </li>
            <li>
              How we research and write is set out in the{" "}
              <a href="/editorial-policy/">editorial policy</a>.
            </li>
          </ul>
        </Block>

        <Block title="Who publishes this">
          <p>
            Plain Loan Math is published by a small independent team and is not
            owned by, funded by, or affiliated with any lender, broker,
            servicer, or real estate company.
          </p>
          <p>
            We are not licensed financial professionals and nothing here is
            advice about your particular situation. For that, talk to a
            licensed mortgage professional or a HUD-approved housing counselor.
          </p>
          <p>
            Reach us <a href="/contact/">here</a>. We read everything, and
            corrections get priority.
          </p>
        </Block>

        <Block title="Scope">
          <p>
            This site covers United States mortgages: monthly compounding,
            fixed-rate amortization, and US loan products and rules. If you are
            borrowing elsewhere, the arithmetic may not match how your lender
            calculates interest.
          </p>
        </Block>

        <ReviewMeta updated={LAST_REVIEWED} />
      </Prose>
    </main>
  );
}
