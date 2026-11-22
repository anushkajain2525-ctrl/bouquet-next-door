import type { Metadata, Viewport } from "next";
import { Geist, Fraunces } from "next/font/google";
import "./globals.css";
import { PhoneProvider } from "@/lib/phone";
import Navbar from "@/components/Navbar";
import FeedbackPrompt from "@/components/FeedbackPrompt";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["SOFT", "WONK"] });

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: "Bouquet Next Door — bouquets she'll actually love", template: "%s · Bouquet Next Door" },
  description: "Design a bouquet around your girlfriend's tastes, learn what she loved, and get seasonal suggestions for Delhi NCR. Delivered to your door.",
  openGraph: { title: "Bouquet Next Door", description: "Bouquets built around her, in season, in Delhi NCR.", type: "website" },
};
export const viewport: Viewport = { themeColor: "#7a1d3b" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <PhoneProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <FeedbackPrompt />
          <footer className="mx-auto w-full max-w-5xl px-6 py-10 text-xs text-soft">
            © 2026 Bouquet Next Door · Live in Delhi NCR · Prices shown are nominal prototype prices.
          </footer>
        </PhoneProvider>
      </body>
    </html>
  );
}
