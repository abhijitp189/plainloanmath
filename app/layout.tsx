import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const GA_MEASUREMENT_ID = "G-4EFBNNEMNP";

export const metadata: Metadata = {
  metadataBase: new URL("https://plainloanmath.com"),
  title: {
    default: "Plain Loan Math",
    template: "%s | Plain Loan Math",
  },
  description:
    "Free mortgage calculators and plain explanations of the math. No lender pays us, and there are no rate quotes or lead forms.",
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* GA4 — brief v2 §16. Plain tags so they are visible in view-source.
            When the CMP lands (month 3), these get gated behind consent. */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-surface font-sans text-ink antialiased">
        {/* Print header — design guide §9. Hidden on screen. The browser's own
            print chrome supplies the page title, the URL and today's date, so
            none of those are rendered here: a date baked in at build time is
            wrong the day after it ships, which is the bug the footer copyright
            year already has. */}
        <div className="print-only border-b-rule border-line-strong pb-3 text-[0.8rem]">
          <p className="font-bold">Plain Loan Math &mdash; plainloanmath.com</p>
          <p>
            Estimates only. Not financial advice, and not a loan offer.
          </p>
        </div>

        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
