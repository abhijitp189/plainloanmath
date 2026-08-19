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
  title: "Privacy Policy",
  description:
    "What Plain Loan Math collects, what it does not, and how Google Analytics and Google AdSense use cookies on this site.",
  alternates: { canonical: "/privacy/" },
};

export default function PrivacyPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema("Privacy Policy", "/privacy/")),
        }}
      />
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        lede="The short version: the numbers you type into a calculator never leave your browser. We use Google Analytics to see which pages get read, and advertising on this site is served by Google using cookies."
        siblings={[
          { href: "/terms/", label: "Terms" },
          { href: "/disclaimer/", label: "Disclaimer" },
          { href: "/contact/", label: "Contact" },
        ]}
      />

      <Prose>
        <p>
          This policy explains what Plain Loan Math ({SITE.url}) collects, why,
          and what you can do about it. It applies to this website only.
        </p>

        <Block title="What the calculators do with your numbers">
          <p>
            Nothing. Every calculation on this site runs entirely in your own
            browser using JavaScript. The home price, loan amount, interest
            rate, and any other figure you enter is never transmitted to us,
            never written to a server, and never stored anywhere.
          </p>
          <p>
            There is no server to receive it. This site is a set of static
            files. That is a deliberate architectural choice, not a policy we
            could quietly change. There is no database to put your
            figures in.
          </p>
        </Block>

        <Block title="What we do not collect">
          <ul className="ml-5 list-disc space-y-1.5">
            <li>No accounts, sign-ups, or logins</li>
            <li>No name, email address, phone number, or postal address</li>
            <li>No contact forms or quote request forms of any kind</li>
            <li>
              No credit information, income information, or Social Security
              number
            </li>
          </ul>
          <p>
            We do not sell, rent, share, or otherwise pass information to
            mortgage lenders, brokers, or lead generators. We have no financial
            relationship with any of them.
          </p>
        </Block>

        <Block title="Google Analytics">
          <p>
            We use Google Analytics 4 to understand which pages people read and
            how they arrive. It sets cookies in your browser and reports
            aggregate information to us: page views, approximate
            location at city level, device type, and referring site. We do not
            use it to identify individual people, and we have Google Signals
            turned off.
          </p>
          <p>
            Google&rsquo;s handling of this data is covered by{" "}
            <a
              href="https://policies.google.com/privacy"
              rel="noopener nofollow"
            >
              Google&rsquo;s Privacy Policy
            </a>
            . You can opt out across all sites using the{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              rel="noopener nofollow"
            >
              Google Analytics Opt-out Browser Add-on
            </a>
            .
          </p>
        </Block>

        <Block title="Advertising: Google AdSense">
          <p>
            This site is funded by advertising, which is what keeps it free and
            free of lender money. Our advertising partner is{" "}
            <strong className="font-semibold text-ink">Google AdSense</strong>.
          </p>
          <p>
            Google, as a third-party vendor, uses cookies to serve ads on this
            site. Google&rsquo;s use of advertising cookies enables it and its
            partners to serve ads to you based on your visit to this site and
            other sites on the internet. This is known as personalized
            advertising, and it may draw on your browsing history across many
            websites, not just this one.
          </p>
          <p>
            Third-party vendors and ad networks may also serve ads here and may
            set their own cookies.
          </p>
          <p>
            You can turn off personalized advertising at{" "}
            <a
              href="https://myadcenter.google.com/"
              rel="noopener nofollow"
            >
              Google Ad Settings
            </a>
            , and opt out of many third-party vendors at{" "}
            <a
              href="https://optout.aboutads.info/"
              rel="noopener nofollow"
            >
              aboutads.info
            </a>
            . Turning off personalization does not remove ads; it makes them
            less relevant.
          </p>
          <p>
            Advertising is not currently live on this site. This section
            describes how it will work when it launches and will be reviewed on
            the day it does.
          </p>
        </Block>

        <Block title="Cookies">
          <p>
            The cookies on this site come from Google Analytics and, once
            advertising launches, Google AdSense. We set none of our own. Most
            browsers let you block or delete cookies in their settings; the
            calculators will keep working normally if you do, because they do
            not use cookies at all.
          </p>
        </Block>

        <Block title="If you are in the EU, UK, or California">
          <p>
            Where the law requires consent for advertising cookies, a consent
            tool will be shown before those cookies are set, and you will be
            able to change your choice at any time.
          </p>
          <p>
            Because we hold no personal information about you, we generally
            have nothing to look up, export, or delete if you ask. There
            is no account and no record. For the data Google holds, use the
            Google links above, which reach further than we can.
          </p>
        </Block>

        <Block title="Children">
          <p>
            This site is aimed at adults making decisions about home loans. We
            do not knowingly collect information from children under 13.
          </p>
        </Block>

        <Block title="Links to other sites">
          <p>
            We link generously to primary sources such as the Consumer
            Financial Protection Bureau so you can check what we say. Those
            sites have their own privacy policies and we do not control them.
          </p>
        </Block>

        <Block title="Changes to this policy">
          <p>
            If this policy changes in a way that matters, we will update the
            reviewed date below and describe the change on our{" "}
            <a href="/corrections/">corrections page</a>.
          </p>
        </Block>

        <ReviewMeta updated={LAST_REVIEWED} />
      </Prose>
    </main>
  );
}
