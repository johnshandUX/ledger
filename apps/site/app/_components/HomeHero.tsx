"use client";

import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { GenerativeHero } from "../experiments/generative-hero/_components/GenerativeHero";
import type { GenerativeFinanceData } from "../experiments/generative-hero/_components/types";

type HomeHeroProps = {
  data: GenerativeFinanceData;
  frameTreatment?: "full" | "fade";
};

const revealEase = [0.22, 1, 0.36, 1] as const;
export const homeHeroCopy = {
  eyebrow: "Introducing LedgerOS",
  headline: "Finance experiences, generated.",
  subtitle: "An agentic, money focused design system",
} as const;

export const homeHeroRevealTiming = {
  headline: { delay: 0, duration: .8 },
  subtitle: { delay: .08, duration: .8 },
  frame: { delay: .18, duration: .9 },
} as const;

export function HomeHero({ data, frameTreatment = "full" }: HomeHeroProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [frameRevealed, setFrameRevealed] = useState(false);

  const reveal = (delay: number, duration: number, y: number) => ({
    initial: prefersReducedMotion ? false : { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { delay: prefersReducedMotion ? 0 : delay, duration: prefersReducedMotion ? 0 : duration, ease: revealEase },
  });

  return (
    <MotionConfig reducedMotion="user">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero__copy">
          <p className="home-hero__eyebrow">{homeHeroCopy.eyebrow}</p>
          <motion.h1 id="home-hero-title" {...reveal(homeHeroRevealTiming.headline.delay, homeHeroRevealTiming.headline.duration, 10)}>{homeHeroCopy.headline}</motion.h1>
          <motion.p className="home-hero__subtitle" {...reveal(homeHeroRevealTiming.subtitle.delay, homeHeroRevealTiming.subtitle.duration, 8)}>{homeHeroCopy.subtitle}</motion.p>
        </div>
        <motion.div
          className="home-hero__presentation"
          {...reveal(homeHeroRevealTiming.frame.delay, homeHeroRevealTiming.frame.duration, 12)}
          onAnimationComplete={() => setFrameRevealed(true)}
        >
          <GenerativeHero data={data} presentation playbackEnabled={frameRevealed || prefersReducedMotion} frameTreatment={frameTreatment} />
        </motion.div>
      </section>
    </MotionConfig>
  );
}
