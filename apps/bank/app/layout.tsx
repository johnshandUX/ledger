import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@johnshandux/ledger-design-system/styles.css";
import "./globals.css";
import { BankStateProvider } from "./BankStateProvider";

const inter = Inter({
  variable: "--ledger-font-family-product",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ledger Bank · Demonstration prototype",
  description: "A fictional commercial banking reference implementation built with the Ledger Design System.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <BankStateProvider>{children}</BankStateProvider>
      </body>
    </html>
  );
}
