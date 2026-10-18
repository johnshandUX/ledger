"use client";

import { Button } from "@johnshandux/ledger-design-system";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getExperienceForLoop, getLoopSnapshot, getReducedMotionSnapshot, initialPlayback, loopTiming } from "./animation";
import { BankingExperience } from "./BankingExperience";
import { ScaledComposition } from "./ScaledComposition";
import type { ExperienceId, GenerativeFinanceData } from "./types";

type GenerativeHeroProps = {
  data: GenerativeFinanceData;
  presentation?: boolean;
  playbackEnabled?: boolean;
  frameTreatment?: "full" | "fade";
};

export function shouldRenderGeneration(presentation: boolean, playbackEnabled: boolean, prefersReducedMotion: boolean) {
  return !presentation || playbackEnabled || prefersReducedMotion;
}

export function GenerativeHero({
  data,
  presentation = false,
  playbackEnabled = true,
  frameTreatment = "full",
}: GenerativeHeroProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [playback, setPlayback] = useState<{ elapsed: number; loop: number }>(() => ({ ...initialPlayback }));
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [runId, setRunId] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const lastTick = useRef<number | null>(null);
  const setHeroRef = useCallback((node: HTMLElement | null) => { heroRef.current = node; }, []);
  const snapshot = prefersReducedMotion ? getReducedMotionSnapshot() : getLoopSnapshot(playback.elapsed);
  const experience = getExperienceForLoop(playback.loop);
  const renderGeneration = shouldRenderGeneration(presentation, playbackEnabled, prefersReducedMotion);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? false), { threshold: 0.18 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || !playbackEnabled || paused || prefersReducedMotion) return;
    const tick = (now: number) => {
      if (lastTick.current === null) lastTick.current = now;
      const delta = Math.min(now - lastTick.current, 80);
      lastTick.current = now;
      setPlayback((value) => {
        const next = value.elapsed + delta;
        if (next >= loopTiming.total) {
          return { elapsed: next % loopTiming.total, loop: value.loop + 1 };
        }
        return { ...value, elapsed: next };
      });
    };
    const timer = window.setInterval(() => tick(performance.now()), 40);
    return () => { window.clearInterval(timer); lastTick.current = null; };
  }, [inView, paused, playbackEnabled, prefersReducedMotion, runId]);

  const replay = useCallback(() => {
    setPlayback({ ...initialPlayback });
    setPaused(false);
    setRunId((value) => value + 1);
  }, []);

  const composition = (
    <ScaledComposition>
      <div className={`showcase-frame showcase-frame--${frameTreatment}`} data-phase={snapshot.phase}>
        <div className="generative-canvas">
          <AnimatePresence mode="wait">
            {!renderGeneration ? null : snapshot.phase === "thinking" ? (
              <motion.div key={`thinking-${playback.loop}`} className="generation-thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: .985 }} transition={{ duration: .35 }}>
                <CompositionIndicator experience={experience} />
              </motion.div>
            ) : (
              <motion.div key={`experience-${playback.loop}`} className="generated-experience" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: .985 }} transition={{ duration: .35 }}>
                <BankingExperience data={data} experience={experience} assemblyStep={snapshot.assemblyStep} />
              </motion.div>
            )}
          </AnimatePresence>
          {presentation ? null : <p className="generative-canvas__status" aria-live="polite">{statusCopy(snapshot.phase, experience, paused, inView)}</p>}
        </div>
      </div>
    </ScaledComposition>
  );

  if (presentation) {
    return <MotionConfig reducedMotion="user"><div ref={setHeroRef} className="generative-presentation" aria-hidden="true">{composition}</div></MotionConfig>;
  }

  return (
    <MotionConfig reducedMotion="user">
      <section ref={setHeroRef} className="generative-hero" aria-labelledby="generative-hero-title">
        <div className="generative-hero__intro">
          <p className="eyebrow">LedgerOS · Generative interface study</p>
          <h1 id="generative-hero-title">A design system that composes banking experiences.</h1>
          <p>Ledger components provide the structure. Deterministic financial data provides the meaning. The canvas assembles the experience.</p>
        </div>
        {composition}
        <div className="prototype-controls" aria-label="Prototype controls">
          <Button size="small" onClick={replay}>Replay loop</Button>
          {!prefersReducedMotion ? <Button size="small" variant="secondary" onClick={() => setPaused((value) => !value)} aria-pressed={paused}>{paused ? "Resume animation" : "Pause animation"}</Button> : null}
          <span>{loopTiming.total / 1_000} second loop · {experience === "cash" ? "Cash position" : "Payments requiring attention"}</span>
        </div>
        {prefersReducedMotion ? <p className="reduced-motion-note">Reduced motion is enabled. A complete cash-position experience is shown without animation.</p> : null}
      </section>
    </MotionConfig>
  );
}

function CompositionIndicator({ experience }: { experience: ExperienceId }) {
  return <div className="composition-indicator" role="status" aria-label={`Generating ${experience === "cash" ? "cash position" : "payments requiring attention"} experience`}><div className="composition-indicator__stage" aria-hidden="true"><i className="composition-outline composition-outline--primary" /><i className="composition-outline composition-outline--secondary" /><i className="composition-outline composition-outline--tertiary" /></div><p>Generating experience<span className="generation-ellipsis" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span></p><small>{experience === "cash" ? "Composing liquidity and account components" : "Composing payment and approval components"}</small></div>;
}

function statusCopy(phase: "thinking" | "assembling" | "complete", experience: ExperienceId, paused: boolean, inView: boolean) {
  if (!inView) return "Animation paused outside viewport";
  if (paused) return "Animation paused";
  if (phase === "thinking") return `Generating ${experience === "cash" ? "cash position" : "payments"} experience`;
  if (phase === "assembling") return "Assembling Ledger components";
  return "Experience complete";
}
