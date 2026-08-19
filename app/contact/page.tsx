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
  title: "Contact",
  description:
    "How to reach Plain Loan Math: corrections, questions about the math, and what we cannot help with.",
  alternates: { canonical: "/contact/" },
};

export default function ContactPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema("Contact", "/contact/")),
        }}
      />
      <PageHeader
        eyebrow="Contact"
        title="Contact"
        lede="One email address, read by a person. There is no contact form here, because a form would mean collecting your details and this site does not do that."
        siblings={[
          { href: "/corrections/", label: "Corrections" },
          { href: "/about/", label: "About" },
          { href: "/methodology/", label: "Methodology" },
        ]}
      />

      <Prose>
        <div className="border border-line bg-accent-soft p-5">
          <p className="text-[11px] font-bold uppercase tracking-[.13em] text-muted">
            Email
          </p>
          <p className="mt-1.5">
            <a
              href={`mailto:${SITE.email}`}
              className="num text-[1.15rem] font-semibold"
            >
              {SITE.email}
            </a>
          </p>
        </div>

        <Block title="Found an error?">
          <p>
            Please tell us, and please be specific: the page, the figure
            you saw, and the figure you expected. Errors in arithmetic get
            fixed the same week and are logged on the{" "}
            <a href="/corrections/">corrections page</a> with the date. We do
            not quietly edit mistakes away.
          </p>
        </Block>

        <Block title="Questions about the math">
          <p>
            Ask. If a formula on the{" "}
            <a href="/methodology/">methodology page</a> is unclear, that is a
            fault in the writing and worth fixing for everyone.
          </p>
        </Block>

        <Block title="What we cannot help with">
          <p>
            We are not lenders, brokers, or licensed financial professionals,
            and we do not know your circumstances. So we cannot tell you
            whether to refinance, which loan to take, what you can afford, or
            what your lender will approve.
          </p>
          <p>
            For that, the right people are a licensed mortgage professional, or
            a HUD-approved housing counselor, who can advise for free or at low
            cost. Please do not send us account numbers, Social Security
            numbers, or copies of loan documents. We have no use for
            them and no way to store them securely.
          </p>
        </Block>

        <Block title="Press, educators, and linking">
          <p>
            You are welcome to link to any page here without asking. If you are
            a teacher, librarian, or nonprofit counselor and want to use these
            calculators with the people you work with, that is exactly what
            they are for, so tell us and we will help.
          </p>
        </Block>

        <Block title="Advertising and partnerships">
          <p>
            We do not accept sponsored posts, paid links, guest articles, or
            affiliate arrangements, and we do not take money from lenders,
            brokers, or lead generators in any form. Pitches on those lines are
            declined without exception.
          </p>
        </Block>

        <ReviewMeta updated={LAST_REVIEWED} showContact={false} />
      </Prose>
    </main>
  );
}
