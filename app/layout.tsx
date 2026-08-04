import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Sans, Inter } from "next/font/google";
import Script from "next/script";
import { AttributionTracker } from "@/components/AttributionTracker";
import { CookieConsent } from "@/components/CookieConsent";
import { ScrollToTop } from "@/components/ScrollToTop";
import { GTM_CONTAINER_ID } from "@/lib/gtm";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Enta Waitlist",
  description: "Buy Bitcoin, hold Gold, and move money from your local currency.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager — growth team container. next/script keeps it
            non-blocking while injecting as early as the App Router allows. */}
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');`}
        </Script>
      </head>
      <body className={`${instrumentSans.variable} ${inter.variable} ${plexMono.variable}`}>
        {/* Google Tag Manager (noscript) — immediately after the opening body tag. */}
        <noscript>
          <iframe
            height="0"
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`}
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
            width="0"
          />
        </noscript>
        <AttributionTracker />
        <ScrollToTop />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
