import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

// Google Analytics 4 measurement ID — brief v2 §16.
// One place, so it is never pasted into an individual page.
const GA_MEASUREMENT_ID = "G-4EFBNNEMNP";

export const metadata: Metadata = {
  metadataBase: new URL("https://plainloanmath.com"),
  title: {
    default: "Plain Loan Math",
    template: "%s | Plain Loan Math",
  },
  description: "Mortgage math, explained plainly.",
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}

        {/*
          GA4. Loaded with strategy="afterInteractive" so it runs only once
          the page is usable — it can never delay LCP or block a calculator
          from responding to input (technical brief §8).

          When the CMP arrives at month 3 (brief v2 §14), these two blocks
          get gated behind consent for EEA and UK visitors. Nothing else
          in the codebase needs to change.
        */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
