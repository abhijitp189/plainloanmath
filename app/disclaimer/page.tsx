import type { Metadata } from "next";
import {
  PageHeader,
  Prose,
  Block,
  ReviewMeta,
  breadcrumbSchema,
} from "@/components/PageChrome";
import { InlineLink } from "@/components/InlineLink";
import { LAST_REVIEWED } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";

/**
 * Brought onto the shared page system August 20, 2026.
 *
 * It was the last page on the site with its own layout: a centered
 * `max-w-2xl` column, its own `Section` helper, its own heading sizes, no
 * stripe, no breadcrumb and no `BreadcrumbList` schema. It had been written
 * before `PageChrome` existed and nothing ever went back for it, which is the
 * ordinary way a page ends up outside a design system.
 *
 * The copy is unchanged apart from the lede, which the stripe now needs, and
 * the intro paragraph, which was the stripe's job all along.
 */

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "What Plain Loan Math is, what it is not, and the limits of the figures our calculators produce.",
  alternates: { canonical: ROUTES.disclaimer },
};

export default function DisclaimerPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema("Disclaimer", ROUTES.disclaimer),
          ),
        }}
      />
      <PageHeader
        eyebrow="Legal"
        title="Disclaimer"
        lede="We publish arithmetic and explanations. We are not a lender, not a broker, not a licensed financial adviser, and we are not paid by anyone in the mortgage industry. Nothing here is advice about your particular situation."
        siblings={[
          { href: ROUTES.terms, label: "Terms" },
          { href: ROUTES.privacy, label: "Privacy" },
          { href: ROUTES.methodology, label: "Methodology" },
        ]}
      />

      <Prose>
        <p>
          Everything below sets out the limits of what the figures on this site
          can tell you. It is worth reading once, and it is short on purpose.
        </p>

        <Block title="Educational, not advisory">
          <p>
            Everything on this site is general information. We do not know your
            income, your credit history, your other debts, your tax position, or
            your plans, so nothing here can be a recommendation about what you
            should do. A calculator that has never met you cannot advise you.
          </p>
          <p>
            For advice about your own circumstances, speak to a licensed
            mortgage professional, a HUD-approved housing counselor, or a
            financial professional who is able to look at the whole picture.
          </p>
        </Block>

        <Block title="What our numbers actually cover">
          <p>
            Our calculators model principal and interest using standard monthly
            amortization. Unless a page says otherwise, the figures exclude
            property taxes, homeowners insurance, mortgage insurance, HOA dues,
            closing costs, origination fees, points, and prepayment penalties.
          </p>
          <p>
            Those excluded items are often a large share of what you actually
            pay each month. A payment figure from this site is therefore smaller
            than the amount that will leave your bank account.
          </p>
          <p>
            We also assume a fixed interest rate held for the whole term, and
            payments made on schedule. Adjustable-rate loans, missed payments,
            recasts, and refinancing all change the outcome.
          </p>
        </Block>

        <Block title="Accuracy and errors">
          <p>
            We show the formula behind each calculation so you can check our
            work rather than take it on trust. We test the arithmetic against
            published reference figures. Even so, errors are possible: in the
            code, in the explanation, or in a source we relied on.
          </p>
          <p>
            If you find something wrong,{" "}
            <InlineLink href={ROUTES.contact}>tell us</InlineLink> and we will
            correct it and note the correction. Do not rely on any figure from
            this site for a decision that matters without confirming it with
            your lender.
          </p>
        </Block>

        <Block title="No relationship is created">
          <p>
            Using this site does not create any professional, advisory, or
            fiduciary relationship between you and us. We do not collect
            applications, do not pass your details to lenders, and do not
            receive payment for referrals.
          </p>
        </Block>

        <Block title="Where our information comes from">
          <p>
            Where we cite rules, limits, or figures, we use primary sources such
            as the Consumer Financial Protection Bureau, the Federal Housing
            Finance Agency, HUD, the IRS, and Freddie Mac. Those rules change.
            Anything you read here reflects our understanding at the date shown,
            and we may not have updated it since. Every formula used anywhere on
            the site is written out on{" "}
            <InlineLink href={ROUTES.methodology}>
              the methodology page
            </InlineLink>
            , with its sources.
          </p>
        </Block>

        <Block title="United States focus">
          <p>
            This site describes United States mortgage conventions: monthly
            compounding, fixed-rate amortization, and US loan products. If you
            are borrowing in another country, the arithmetic on this site may
            not match how your lender calculates interest.
          </p>
        </Block>

        <Block title="External links">
          <p>
            We link to outside sources because you should be able to check what
            we say. We do not control those sites and are not responsible for
            their content or their accuracy.
          </p>
        </Block>

        <ReviewMeta updated={LAST_REVIEWED} />
      </Prose>
    </main>
  );
}
