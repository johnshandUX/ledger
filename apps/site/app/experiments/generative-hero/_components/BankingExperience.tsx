import { Badge, Card, CardBody, CardHeader, Skeleton, formatCurrencyAmount } from "@johnshandux/ledger-design-system";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { assemblySpring as spring, chartReveal, componentEntry as enter, contentReveal, getPanelGenerationStage, loopTiming, type AssemblyStep, type PanelGenerationStage } from "./animation";
import { getExperienceConfiguration } from "./experiences";
import type { ExperienceId, GenerativeFinanceData } from "./types";

type BankingExperienceProps = {
  data: GenerativeFinanceData;
  experience: ExperienceId;
  assemblyStep: AssemblyStep;
  assemblyElapsed: number;
};

function money(amountMinor: number, currency: string) {
  return formatCurrencyAmount(amountMinor / 100, currency);
}

function TypewrittenValue({ text, delay }: { text: string; delay: number }) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const character = useMotionValue(prefersReducedMotion ? text.length : 0);
  const output = useTransform(character, (latest) => text.slice(0, Math.round(latest)));
  const cursorOpacity = useTransform(character, (latest) => latest < text.length ? 1 : 0);

  useEffect(() => {
    if (prefersReducedMotion) {
      character.set(text.length);
      return;
    }
    character.set(0);
    const controls = animate(character, text.length, { delay, duration: .72, ease: "linear" });
    return () => controls.stop();
  }, [character, delay, prefersReducedMotion, text]);

  return <span className="generated-value generated-value--typewritten" aria-label={text}><motion.span aria-hidden="true">{output}</motion.span><motion.span className="generated-value__cursor" aria-hidden="true" style={{ opacity: cursorOpacity }} /></span>;
}

function GeneratedValue({ visible, children, delay = 0, placeholder = "—", typewriterText }: { visible: boolean; children: ReactNode; delay?: number; placeholder?: ReactNode; typewriterText?: string }) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const sequentialDash = placeholder === "—" || placeholder === "-";
  return <AnimatePresence mode="wait" initial={false}>{visible
    ? typewriterText ? <TypewrittenValue key="typewritten-value" text={typewriterText} delay={delay} /> : <motion.span className="generated-value" key="value" initial={prefersReducedMotion ? false : contentReveal.initial} animate={contentReveal.animate} transition={prefersReducedMotion ? { duration: 0 } : { ...contentReveal.transition, delay }}>{children}</motion.span>
    : sequentialDash ? <motion.span aria-hidden="true" className="generated-value generated-value--placeholder" key="placeholder" initial={false} animate={prefersReducedMotion ? { opacity: 1 } : { opacity: [0, 0, 1] }} transition={prefersReducedMotion ? { duration: 0 } : { duration: .28, delay }}>{placeholder}</motion.span> : <span aria-hidden="true" className="generated-value generated-value--placeholder" key="placeholder">{placeholder}</span>}
  </AnimatePresence>;
}

export function BankingExperience({ data, experience, assemblyStep, assemblyElapsed }: BankingExperienceProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const sectionEnter = prefersReducedMotion ? { initial: false as const, animate: enter.animate, exit: { opacity: 1 } } : enter;
  const config = getExperienceConfiguration(experience);
  const gbp = data.availableByCurrency.find(({ currency }) => currency === "GBP");
  const primaryStage = getPanelGenerationStage(assemblyElapsed, loopTiming.assembly.primary);
  const secondaryStage = getPanelGenerationStage(assemblyElapsed, loopTiming.assembly.secondary);
  const tertiaryStage = getPanelGenerationStage(assemblyElapsed, loopTiming.assembly.tertiary);
  const detailStage = getPanelGenerationStage(assemblyElapsed, loopTiming.assembly.content);
  return (
    <motion.section className="generated-interface" layout transition={spring} aria-label={config.heading}>
      <AnimatePresence>
        {assemblyStep >= 1 ? <motion.header key="heading" {...sectionEnter} className="generated-interface__header" layout>
          <div><p className="generated-interface__eyebrow">{config.eyebrow}</p><h2>{config.heading}</h2></div>
          <Badge variant={experience === "payments" ? "warning" : "success"}>{experience === "payments" ? `${data.outstandingApprovalActions} actions` : "Live position"}</Badge>
        </motion.header> : null}
      </AnimatePresence>
      <motion.div className={`experience-grid experience-grid--${experience}`} layout transition={spring}>
        <AnimatePresence mode="popLayout">
          {experience === "cash" && assemblyStep >= 2 ? <motion.div key="balance" {...sectionEnter} transition={spring} layout className="experience-grid__balance">
              <Card className="balance-card"><CardHeader><span>Available balance · GBP</span></CardHeader><CardBody><PanelContent stage={primaryStage} skeleton={<MetricSkeleton />}><strong className="hero-amount hero-amount--balance"><GeneratedValue visible={primaryStage !== "skeleton" && Boolean(gbp)} delay={.05} placeholder="£" typewriterText={gbp ? money(gbp.amountMinor, gbp.currency) : undefined}>{gbp ? money(gbp.amountMinor, gbp.currency) : "—"}</GeneratedValue></strong><div className="currency-summary">{data.availableByCurrency.filter(({ currency }) => currency !== "GBP").map((item, index) => <span key={item.currency}>{item.currency} <b><GeneratedValue visible={primaryStage !== "skeleton"} delay={index * .08}>{money(item.amountMinor, item.currency)}</GeneratedValue></b></span>)}</div></PanelContent></CardBody></Card>
          </motion.div> : experience === "payments" && assemblyStep >= 2 ? <motion.div key="attention" {...sectionEnter} transition={spring} layout className="experience-grid__attention"><AttentionSummary data={data} stage={primaryStage} /></motion.div> : null}
        </AnimatePresence>
        <AnimatePresence mode="popLayout">
          {experience === "cash" && assemblyStep >= 4 ? <motion.div key="flow" {...sectionEnter} transition={spring} layout className="experience-grid__flow"><CashFlow data={data} stage={tertiaryStage} /></motion.div> : experience === "payments" && assemblyStep >= 3 ? <motion.div key="payments" {...sectionEnter} transition={spring} layout className="experience-grid__payments"><PaymentList data={data} stage={secondaryStage} /></motion.div> : null}
        </AnimatePresence>
        <AnimatePresence mode="popLayout">
          {experience === "cash" && assemblyStep >= 5 ? <motion.div key="activity" {...sectionEnter} transition={spring} layout className="experience-grid__activity"><Activity data={data} stage={detailStage} /></motion.div> : null}
        </AnimatePresence>
        <AnimatePresence mode="popLayout">
          {assemblyStep >= (experience === "cash" ? 3 : 4) ? <motion.div key="accounts" {...sectionEnter} layout transition={spring} className="experience-grid__accounts"><AccountSummary data={data} stage={experience === "cash" ? secondaryStage : tertiaryStage} /></motion.div> : null}
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
}

export function PanelContent({ stage, skeleton, children }: { stage: PanelGenerationStage; skeleton: ReactNode; children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const transition = prefersReducedMotion ? { duration: 0 } : { duration: .42, ease: [0.22, 1, 0.36, 1] as const };
  return <div className="generation-layers" data-generation-stage={stage}>
    {stage === "generated" ? null : <motion.div className="generation-layer generation-layer--skeleton" aria-hidden="true" initial={false} animate={{ opacity: stage === "skeleton" ? 1 : 0 }} transition={transition}>{skeleton}</motion.div>}
    <motion.div className="generation-layer generation-layer--content" aria-hidden={stage === "skeleton" ? true : undefined} initial={false} animate={{ opacity: stage === "skeleton" ? 0 : 1 }} transition={transition}>{children}</motion.div>
  </div>;
}

function MetricSkeleton({ compact = false }: { compact?: boolean }) {
  return <div className={`panel-skeleton panel-skeleton--metric${compact ? " panel-skeleton--compact" : ""}`}><Skeleton className="panel-skeleton__figure" /><div className="panel-skeleton__inline"><Skeleton /><Skeleton /><Skeleton /></div></div>;
}

function ListSkeleton({ rows = 3, payments = false }: { rows?: number; payments?: boolean }) {
  return <div className={`panel-skeleton panel-skeleton--list${payments ? " panel-skeleton--payments" : ""}`}>{Array.from({ length: rows }, (_, index) => <div className="panel-skeleton__row" key={index}><span><Skeleton /><Skeleton /></span><Skeleton className="panel-skeleton__amount" />{payments ? <Skeleton className="panel-skeleton__action" /> : null}</div>)}</div>;
}

function ChartSkeleton() {
  return <div className="panel-skeleton panel-skeleton--chart"><div className="panel-skeleton__bars">{[42, 68, 54, 82, 64].map((height, index) => <span key={height}><Skeleton style={{ height: `${height}%` }} /><Skeleton style={{ height: `${Math.max(24, height - 18 + index * 2)}%` }} /></span>)}</div><div className="panel-skeleton__chart-labels">{[0, 1, 2, 3, 4].map((item) => <Skeleton key={item} />)}</div></div>;
}

function AccountSummary({ data, stage }: { data: GenerativeFinanceData; stage: PanelGenerationStage }) {
  const visible = stage !== "skeleton";
  return <Card className="accounts-card"><CardHeader><strong>Accounts summary</strong><span>{data.accounts.length} primary accounts</span></CardHeader><CardBody><PanelContent stage={stage} skeleton={<ListSkeleton />}><ul className="data-list data-list--accounts">{data.accounts.slice(0, 3).map((account, index) => <li key={account.id}><span><b>{account.name}</b><small>•• {account.accountNumber.slice(-4)}</small></span><strong><GeneratedValue visible={visible} delay={index * .07}>{money(account.amountMinor, account.currency)}</GeneratedValue></strong></li>)}</ul></PanelContent></CardBody></Card>;
}

function Activity({ data, stage }: { data: GenerativeFinanceData; stage: PanelGenerationStage }) {
  const visible = stage !== "skeleton";
  return <Card><CardHeader><strong>Recent activity</strong><span>Today</span></CardHeader><CardBody><PanelContent stage={stage} skeleton={<ListSkeleton />}><ul className="data-list data-list--activity">{data.activity.slice(0, 3).map((item, index) => <li key={item.id}><span><b>{item.description}</b><small>{item.time}</small></span><strong className={item.direction === "credit" ? "is-credit" : ""}><GeneratedValue visible={visible} delay={index * .07}>{`${item.direction === "credit" ? "+" : "−"}${money(item.amountMinor, item.currency)}`}</GeneratedValue></strong></li>)}</ul></PanelContent></CardBody></Card>;
}

function CashFlow({ data, stage }: { data: GenerativeFinanceData; stage: PanelGenerationStage }) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const visible = stage !== "skeleton";
  const maximum = Math.max(...data.cashFlow.flatMap(({ incomingMinor, outgoingMinor }) => [incomingMinor, outgoingMinor]), 1);
  const barHeight = (value: number) => `${Math.max(8, value / maximum * 100)}%`;
  const description = data.cashFlow.map((day) => `${day.label}: ${money(day.incomingMinor, "GBP")} incoming and ${money(day.outgoingMinor, "GBP")} outgoing`).join("; ");
  return <Card><CardHeader><strong>Cash flow</strong><span>5 days · GBP</span></CardHeader><CardBody><PanelContent stage={stage} skeleton={<ChartSkeleton />}><div className="cash-chart" role="img" aria-label={`Five-day cash flow. ${description}`}><div className="cash-chart__plot" aria-hidden="true">{data.cashFlow.map((day, index) => <div className="cash-chart__day" key={day.label}><div className="cash-chart__bars"><motion.i style={{ height: barHeight(day.incomingMinor), transformOrigin: "bottom" }} initial={prefersReducedMotion ? false : { scaleY: 0, opacity: .2 }} animate={{ scaleY: visible ? 1 : 0, opacity: visible ? 1 : .2 }} transition={prefersReducedMotion ? { duration: 0 } : { duration: chartReveal.duration, delay: index * chartReveal.stagger, ease: chartReveal.ease }} /><motion.i style={{ height: barHeight(day.outgoingMinor), transformOrigin: "bottom" }} initial={prefersReducedMotion ? false : { scaleY: 0, opacity: .2 }} animate={{ scaleY: visible ? 1 : 0, opacity: visible ? 1 : .2 }} transition={prefersReducedMotion ? { duration: 0 } : { duration: chartReveal.duration, delay: index * chartReveal.stagger + chartReveal.seriesOffset, ease: chartReveal.ease }} /></div><small>{day.label.slice(0, 2)}</small></div>)}</div><motion.div className="cash-chart__legend" aria-hidden="true" initial={prefersReducedMotion ? false : contentReveal.initial} animate={visible ? contentReveal.animate : contentReveal.initial} transition={prefersReducedMotion ? { duration: 0 } : contentReveal.transition}><span><i />Incoming</span><span><i />Outgoing</span></motion.div></div></PanelContent></CardBody></Card>;
}

function AttentionSummary({ data, stage }: { data: GenerativeFinanceData; stage: PanelGenerationStage }) {
  const total = data.payments.filter(({ currency }) => currency === "GBP").reduce((sum, item) => sum + item.amountMinor, 0);
  const paymentCount = `${data.payments.length} payments`;
  const visible = stage !== "skeleton";
  return <Card className="approval-card"><CardHeader><span>Approval queue</span></CardHeader><CardBody><PanelContent stage={stage} skeleton={<MetricSkeleton compact />}><strong className="hero-amount approval-kpi"><GeneratedValue visible={visible} delay={.05} placeholder="0" typewriterText={paymentCount}>{paymentCount}</GeneratedValue></strong><p className="supporting-copy"><GeneratedValue visible={visible} delay={.08} placeholder="Preparing approval summary">{`${money(total, "GBP")} in sterling payments awaits review, with ${data.outstandingApprovalActions} approval actions outstanding.`}</GeneratedValue></p></PanelContent></CardBody></Card>;
}

function PaymentList({ data, stage }: { data: GenerativeFinanceData; stage: PanelGenerationStage }) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const visible = stage !== "skeleton";
  return <Card className="payments-card"><CardHeader><strong>Requires attention</strong><span>Newest first</span></CardHeader><CardBody><PanelContent stage={stage} skeleton={<ListSkeleton rows={4} payments />}><ul className="data-list data-list--payments">{data.payments.map((payment, index) => <li key={payment.id}><span><b><GeneratedValue visible={visible} delay={index * .06} placeholder="Preparing payment">{payment.beneficiary}</GeneratedValue></b><small><GeneratedValue visible={visible} delay={index * .06 + .04}>{`${payment.reference} · ${payment.approvals} approval${payment.approvals === 1 ? "" : "s"}`}</GeneratedValue></small></span><strong><GeneratedValue visible={visible} delay={index * .06 + .08}>{money(payment.amountMinor, payment.currency)}</GeneratedValue></strong>{visible ? <motion.span initial={prefersReducedMotion ? false : contentReveal.initial} animate={contentReveal.animate} transition={prefersReducedMotion ? { duration: 0 } : { ...contentReveal.transition, delay: index * .06 + .12 }}><Badge className="payment-review-action" variant="warning">Review</Badge></motion.span> : null}</li>)}</ul></PanelContent></CardBody></Card>;
}
