import type { Metadata } from "next";
import { GenerativeHero } from "./_components/GenerativeHero";
import { prepareGenerativeFinanceData } from "./_components/finance";
import "./generative-hero.css";

export const metadata: Metadata = {
  title: "Generative Interface Hero V3",
  description: "An isolated LedgerOS motion study for deterministic generative banking interfaces.",
};

export default function GenerativeHeroExperimentPage() {
  return <main id="main-content" className="generative-page"><GenerativeHero data={prepareGenerativeFinanceData()} /></main>;
}
