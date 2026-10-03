import { formatCurrencyAmount, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@johnshandux/ledger-design-system";

const playgroundAccounts = [
  ["Operating account", "GBP", 248905.42], ["Payroll", "GBP", 84720.18], ["Client receipts", "GBP", 125600.00],
  ["European operations", "EUR", 94620.50], ["US operations", "USD", 132450.75], ["Reserve", "USD", 50000.00],
] as const;

const bankAccounts = [
  ["Operating account", "GBP", 240000.5], ["Payroll account", "GBP", 15000], ["Tax reserve", "GBP", 50000],
] as const;

export function AccountPreview({ compact = false, source = "playground" }: { compact?: boolean; source?: "playground" | "bank" }) {
  const isBankFixture = source === "bank";
  const accounts = isBankFixture ? bankAccounts : playgroundAccounts;
  return (
    <div className={`bank-preview ${compact ? "bank-preview--compact" : ""}`}>
      <div className="bank-preview__bar"><span>Ledger Bank</span><span className="status-dot">{isBankFixture ? "Current prototype fixture" : "Curated example data"}</span></div>
      <div className="bank-preview__body">
        <div className="bank-preview__heading"><div><span className="eyebrow">Northstar Trading Ltd</span><h3>Accounts</h3></div><span className="preview-action">Make a payment</span></div>
        <div className="balance-grid"><div><span>Total available · GBP</span><strong>{isBankFixture ? "£305,000.50" : "£459,225.60"}</strong></div><div><span>Accounts</span><strong>{isBankFixture ? "3" : "6"}</strong></div><div><span>Currencies</span><strong>{isBankFixture ? "1" : "3"}</strong></div></div>
        <div className="preview-table"><Table ariaLabel={isBankFixture ? "Current Ledger Bank account fixtures" : "Curated commercial bank account example"}><TableHead><TableRow><TableHeaderCell>Account</TableHeaderCell><TableHeaderCell>Currency</TableHeaderCell><TableHeaderCell align="right">Available</TableHeaderCell></TableRow></TableHead><TableBody>{accounts.slice(0, compact ? 4 : 6).map(([name, currency, balance]) => <TableRow key={name}><TableCell>{name}</TableCell><TableCell>{currency}</TableCell><TableCell align="right">{formatCurrencyAmount(balance, currency)}</TableCell></TableRow>)}</TableBody></Table></div>
      </div>
    </div>
  );
}
