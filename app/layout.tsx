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
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
