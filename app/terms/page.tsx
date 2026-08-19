import type { Metadata } from "next";
import {
  PageHeader,
  Prose,
  Block,
  ReviewMeta,
  breadcrumbSchema,
} from "@/components/PageChrome";
import { SITE, LAST_REVIEWED } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms that apply to using Plain Loan Math: what the calculators are for, what they are not, and the limits of what we promise.",
  alternates: { canonical: "/terms/" },
};

export default function TermsPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema("Terms of Use", "/terms/")),
        }}
      />
      <PageHeader
        eyebrow="Legal"
        title="Terms of Use"
        lede="Plain terms for a plain site. Use the calculators freely, check the arithmetic against your lender, and understand that estimates are estimates."
        siblings={[
          { href: "/privacy/", label: "Privacy" },
          { href: "/disclaimer/", label: "Disclaimer" },
          { href: "/methodology/", label: "Methodology" },
        ]}
      />

      <Prose>
        <p>
          By using {SITE.url} you agree to what follows. If you do not agree,
          please do not use the site.
        </p>

        <Block title="What this site is for">
          <p>
            Plain Loan Math publishes mortgage calculators and explanations of
            the arithmetic behind them. It is educational. You are welcome to
            use it for personal purposes, at work, or in teaching, at no cost
            and without asking us.
          </p>
        </Block>

        <Block title="Estimates, not offers">
          <p>
            Every figure this site produces is an estimate generated from the
            numbers you type in. It is not a loan offer, not a quote, not a
            pre-approval, and not a commitment from any lender. Your actual
            payment will be determined by your lender and will usually differ.
          </p>
          <p>
            We are not a lender, a broker, a servicer, or a licensed financial
            professional. See the <a href="/disclaimer/">disclaimer</a> for the
            full scope of what our numbers do and do not cover.
          </p>
        </Block>

        <Block title="Accuracy">
          <p>
            We publish our formulas and sources so you can check our work
            rather than trust it. We test the arithmetic against published
            reference figures. Even so, this site is provided &ldquo;as
            is&rdquo; and we make no warranty that it is free of errors or that
            it is current with every rule change.
          </p>
          <p>
            Do not make a financial decision on a figure from this site without
            confirming it with your lender. To the extent the law allows, we
            are not liable for losses arising from reliance on anything
            published here.
          </p>
        </Block>

        <Block title="Using our content">
          <p>
            The text, explanations, charts and code on this site are ours. You
            may quote a reasonable extract with a link back. Please do not
            republish whole pages, or copy the calculators wholesale, without
            asking first. Write to us and the answer is usually yes.
          </p>
          <p>
            Results you generate from your own numbers are yours. Screenshot
            them, share them, put them in a spreadsheet.
          </p>
        </Block>

        <Block title="Fair use of the site">
          <p>
            Do not attempt to disrupt the site, scrape it at a volume that
            degrades it for others, or present it as your own. Automated
            training crawlers are asked to stay out in our{" "}
            <a href="/robots.txt">robots.txt</a>.
          </p>
        </Block>

        <Block title="Advertising">
          <p>
            This site carries advertising, which is how it stays free of lender
            money. We do not control which specific ads appear and an ad is
            never an endorsement. We accept no payment for referrals and carry
            no affiliate links. See the{" "}
            <a href="/privacy/">privacy policy</a> for how advertising cookies
            work.
          </p>
        </Block>

        <Block title="Changes">
          <p>
            We may update these terms. Material changes are noted on the{" "}
            <a href="/corrections/">corrections page</a> and the reviewed date
            below is updated. Continuing to use the site means the current
            version applies.
          </p>
        </Block>

        <ReviewMeta updated={LAST_REVIEWED} />
      </Prose>
    </main>
  );
}
