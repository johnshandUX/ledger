"use client";

import { Button } from "@johnshandux/ledger-design-system";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getExperienceForLoop, getLoopSnapshot, getReducedMotionSnapshot, loopTiming } from "./animation";
import { BankingExperience } from "./BankingExperience";
import { ScaledComposition } from "./ScaledComposition";
import type { ExperienceId, GenerativeFinanceData } from "./types";

export function GenerativeHero({ data }: { data: GenerativeFinanceData }) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [playback, setPlayback] = useState({ elapsed: 0, loop: 0 });
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [runId, setRunId] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const lastTick = useRef<number | null>(null);
  const snapshot = prefersReducedMotion ? getReducedMotionSnapshot() : getLoopSnapshot(playback.elapsed);
  const experience = getExperienceForLoop(playback.loop);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? false), { threshold: 0.18 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || paused || prefersReducedMotion) return;
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
  }, [inView, paused, prefersReducedMotion, runId]);

  const replay = useCallback(() => {
    setPlayback({ elapsed: 0, loop: 0 });
    setPaused(false);
    setRunId((value) => value + 1);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <section ref={heroRef} className="generative-hero" aria-labelledby="generative-hero-title">
        <div className="generative-hero__intro">
          <p className="eyebrow">LedgerOS · Generative interface study</p>
          <h1 id="generative-hero-title">A design system that composes banking experiences.</h1>
          <p>Ledger components provide the structure. Deterministic financial data provides the meaning. The canvas assembles the experience.</p>
        </div>
        <ScaledComposition>
          <div className="showcase-frame" data-phase={snapshot.phase}>
            <div className="generative-canvas">
              <AnimatePresence mode="wait">
                {snapshot.phase === "thinking" ? (
                  <motion.div key={`thinking-${playback.loop}`} className="generation-thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: .985 }} transition={{ duration: .35 }}>
                    <CompositionIndicator experience={experience} />
                  </motion.div>
                ) : (
                  <motion.div key={`experience-${playback.loop}`} className="generated-experience" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: .985 }} transition={{ duration: .35 }}>
                    <BankingExperience data={data} experience={experience} assemblyStep={snapshot.assemblyStep} />
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="generative-canvas__status" aria-live="polite">{statusCopy(snapshot.phase, experience, paused, inView)}</p>
            </div>
          </div>
        </ScaledComposition>
        <div className="prototype-controls" aria-label="Prototype controls">
          <Button size="small" onClick={replay}>Replay loop</Button>
          {!prefersReducedMotion ? <Button size="small" variant="secondary" onClick={() => setPaused((value) => !value)} aria-pressed={paused}>{paused ? "Resume animation" : "Pause animation"}</Button> : null}
          <span>8 second loop · {experience === "cash" ? "Cash position" : "Payments requiring attention"}</span>
        </div>
        {prefersReducedMotion ? <p className="reduced-motion-note">Reduced motion is enabled. A complete cash-position experience is shown without animation.</p> : null}
      </section>
    </MotionConfig>
  );
}

function CompositionIndicator({ experience }: { experience: ExperienceId }) {
  return <div className="composition-indicator" role="status" aria-label={`Generating ${experience === "cash" ? "cash position" : "payments requiring attention"} experience`}><div className="composition-indicator__stage" aria-hidden="true"><motion.i className="composition-outline composition-outline--primary" animate={{ x: [0, -18, 0], y: [0, -8, 0], width: [124, 156, 124] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} /><motion.i className="composition-outline composition-outline--secondary" animate={{ x: [0, 16, 0], y: [0, 12, 0], height: [54, 68, 54] }} transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }} /><motion.i className="composition-outline composition-outline--tertiary" animate={{ x: [0, 8, 0], y: [0, -10, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} /><motion.span animate={{ scaleX: [.35, 1, .35], x: [-24, 24, -24] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }} /></div><p>Generating experience</p><small>{experience === "cash" ? "Composing liquidity and account components" : "Composing payment and approval components"}</small></div>;
}

function statusCopy(phase: "thinking" | "assembling" | "complete", experience: ExperienceId, paused: boolean, inView: boolean) {
  if (!inView) return "Animation paused outside viewport";
  if (paused) return "Animation paused";
  if (phase === "thinking") return `Generating ${experience === "cash" ? "cash position" : "payments"} experience`;
  if (phase === "assembling") return "Assembling Ledger components";
  return "Experience complete";
}
