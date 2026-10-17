import { Badge, Card, CardBody, CardHeader, formatCurrencyAmount } from "@johnshandux/ledger-design-system";
import { AnimatePresence, motion } from "motion/react";
import { assemblySpring as spring, componentEntry as enter, type AssemblyStep } from "./animation";
import { getExperienceConfiguration } from "./experiences";
import type { ExperienceId, GenerativeFinanceData } from "./types";

type BankingExperienceProps = {
  data: GenerativeFinanceData;
  experience: ExperienceId;
  assemblyStep: AssemblyStep;
};

function money(amountMinor: number, currency: string) {
  return formatCurrencyAmount(amountMinor / 100, currency);
}

export function BankingExperience({ data, experience, assemblyStep }: BankingExperienceProps) {
  const config = getExperienceConfiguration(experience);
  const gbp = data.availableByCurrency.find(({ currency }) => currency === "GBP");
  const contentVisible = assemblyStep >= 5;
  return (
    <motion.section className="generated-interface" layout transition={spring} aria-label={config.heading}>
      <AnimatePresence>
        {assemblyStep >= 1 ? <motion.header key="heading" {...enter} className="generated-interface__header" layout>
          <div><p className="generated-interface__eyebrow">{config.eyebrow}</p><h2>{config.heading}</h2></div>
          <Badge variant={experience === "payments" ? "warning" : "success"}>{experience === "payments" ? `${data.outstandingApprovalActions} actions` : "Live position"}</Badge>
        </motion.header> : null}
      </AnimatePresence>
      <motion.div className={`experience-grid experience-grid--${experience}`} layout transition={spring}>
        <AnimatePresence mode="popLayout">
          {experience === "cash" && assemblyStep >= 2 ? <motion.div key="balance" {...enter} transition={spring} layout className="experience-grid__balance">
              <Card className="balance-card"><CardHeader><span>Available balance · GBP</span></CardHeader><CardBody><strong className="hero-amount hero-amount--balance">{contentVisible && gbp ? money(gbp.amountMinor, gbp.currency) : "—"}</strong><div className="currency-summary">{data.availableByCurrency.filter(({ currency }) => currency !== "GBP").map((item) => <span key={item.currency}>{item.currency} <b>{contentVisible ? money(item.amountMinor, item.currency) : "—"}</b></span>)}</div></CardBody></Card>
          </motion.div> : experience === "payments" && assemblyStep >= 2 ? <motion.div key="attention" {...enter} transition={spring} layout className="experience-grid__attention"><AttentionSummary data={data} visible={contentVisible} /></motion.div> : null}
        </AnimatePresence>
        <AnimatePresence mode="popLayout">
          {experience === "cash" && assemblyStep >= 4 ? <motion.div key="flow" {...enter} transition={spring} layout className="experience-grid__flow"><CashFlow data={data} visible={contentVisible} /></motion.div> : experience === "payments" && assemblyStep >= 3 ? <motion.div key="payments" {...enter} transition={spring} layout className="experience-grid__payments"><PaymentList data={data} visible={contentVisible} /></motion.div> : null}
        </AnimatePresence>
        <AnimatePresence mode="popLayout">
          {experience === "cash" && assemblyStep >= 5 ? <motion.div key="activity" {...enter} transition={spring} layout className="experience-grid__activity"><Activity data={data} visible={contentVisible} /></motion.div> : null}
        </AnimatePresence>
        <AnimatePresence mode="popLayout">
          {assemblyStep >= (experience === "cash" ? 3 : 4) ? <motion.div key="accounts" {...enter} layout transition={spring} className="experience-grid__accounts"><AccountSummary data={data} visible={contentVisible} /></motion.div> : null}
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
}

function AccountSummary({ data, visible }: { data: GenerativeFinanceData; visible: boolean }) {
  return <Card className="accounts-card"><CardHeader><strong>Accounts summary</strong><span>{data.accounts.length} primary accounts</span></CardHeader><CardBody><ul className="data-list data-list--accounts">{data.accounts.slice(0, 3).map((account) => <li key={account.id}><span><b>{account.name}</b><small>•• {account.accountNumber.slice(-4)}</small></span><strong>{visible ? money(account.amountMinor, account.currency) : "—"}</strong></li>)}</ul></CardBody></Card>;
}

function Activity({ data, visible }: { data: GenerativeFinanceData; visible: boolean }) {
  return <Card><CardHeader><strong>Recent activity</strong><span>Today</span></CardHeader><CardBody><ul className="data-list data-list--activity">{data.activity.slice(0, 3).map((item) => <li key={item.id}><span><b>{item.description}</b><small>{item.time}</small></span><strong className={item.direction === "credit" ? "is-credit" : ""}>{visible ? `${item.direction === "credit" ? "+" : "−"}${money(item.amountMinor, item.currency)}` : "—"}</strong></li>)}</ul></CardBody></Card>;
}

function CashFlow({ data, visible }: { data: GenerativeFinanceData; visible: boolean }) {
  const maximum = Math.max(...data.cashFlow.flatMap(({ incomingMinor, outgoingMinor }) => [incomingMinor, outgoingMinor]), 1);
  const barHeight = (value: number) => value === 0 ? 0 : `${Math.max(8, value / maximum * 100)}%`;
  const description = data.cashFlow.map((day) => `${day.label}: ${money(day.incomingMinor, "GBP")} incoming and ${money(day.outgoingMinor, "GBP")} outgoing`).join("; ");
  return <Card><CardHeader><strong>Cash flow</strong><span>5 days · GBP</span></CardHeader><CardBody><div className="cash-chart" role="img" aria-label={`Five-day cash flow. ${description}`}><div className="cash-chart__plot" aria-hidden="true">{data.cashFlow.map((day) => <div className="cash-chart__day" key={day.label}><div className="cash-chart__bars"><motion.i initial={{ height: 0 }} animate={{ height: visible ? barHeight(day.incomingMinor) : 0 }} transition={spring} /><motion.i initial={{ height: 0 }} animate={{ height: visible ? barHeight(day.outgoingMinor) : 0 }} transition={{ ...spring, delay: .12 }} /></div><small>{day.label.slice(0, 2)}</small></div>)}</div><div className="cash-chart__legend" aria-hidden="true"><span><i />Incoming</span><span><i />Outgoing</span></div></div></CardBody></Card>;
}

function AttentionSummary({ data, visible }: { data: GenerativeFinanceData; visible: boolean }) {
  const total = data.payments.filter(({ currency }) => currency === "GBP").reduce((sum, item) => sum + item.amountMinor, 0);
  return <Card className="approval-card"><CardHeader><span>Approval queue</span></CardHeader><CardBody><strong className="hero-amount approval-kpi">{visible ? <><span>{data.payments.length}</span> payments</> : "—"}</strong><p className="supporting-copy">{visible ? `${money(total, "GBP")} in sterling payments awaits review, with ${data.outstandingApprovalActions} approval actions outstanding.` : "Preparing approval summary"}</p></CardBody></Card>;
}

function PaymentList({ data, visible }: { data: GenerativeFinanceData; visible: boolean }) {
  return <Card className="payments-card"><CardHeader><strong>Requires attention</strong><span>Newest first</span></CardHeader><CardBody><ul className="data-list data-list--payments">{data.payments.map((payment) => <li key={payment.id}><span><b>{visible ? payment.beneficiary : "Preparing payment"}</b><small>{visible ? `${payment.reference} · ${payment.approvals} approval${payment.approvals === 1 ? "" : "s"}` : "—"}</small></span><strong>{visible ? money(payment.amountMinor, payment.currency) : "—"}</strong>{visible ? <Badge className="payment-review-action" variant="warning">Review</Badge> : null}</li>)}</ul></CardBody></Card>;
}
