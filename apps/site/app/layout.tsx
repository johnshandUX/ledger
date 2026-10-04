import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Serif, Inter } from "next/font/google";
import "@johnshandux/ledger-design-system/styles.css";
import "./globals.css";
import { SiteFooter } from "./_components/SiteFooter";
import { SiteHeader } from "./_components/SiteHeader";

const inter = Inter({ variable: "--ledger-font-family-product", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({ variable: "--ledger-font-family-brand-display", subsets: ["latin"], weight: "400" });
const ibmPlexMono = IBM_Plex_Mono({ variable: "--ledger-font-family-brand-mono", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "LedgerOS", template: "%s · LedgerOS" },
  description: "The website, documentation and playground for the Ledger Design System and Ledger Bank.",
  openGraph: { title: "LedgerOS", description: "Explore the Ledger Design System and Ledger Bank through documentation and Playground examples.", images: [{ url: "/og.png", width: 1730, height: 909, alt: "LedgerOS, the Ledger Design System and Ledger Bank" }] },
  twitter: { card: "summary_large_image", title: "LedgerOS", description: "Explore the Ledger Design System and Ledger Bank through documentation and Playground examples.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${inter.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable}`}><body><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader />{children}<SiteFooter /></body></html>;
}
