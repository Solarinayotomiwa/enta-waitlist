import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Sans, Inter } from "next/font/google";
import { AttributionTracker } from "@/components/AttributionTracker";
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
      <body className={`${instrumentSans.variable} ${inter.variable} ${plexMono.variable}`}>
        <AttributionTracker />
        {children}
      </body>
    </html>
  );
}
