import type { GeneratedReportOutput, ReportOutputRow } from "./types";

const HEADERS = ["Transaction date", "Account name", "Account identifier", "Currency", "Description", "Counterparty", "Payment reference", "Direction", "Amount"] as const;

export function serializeReportCsv(rows: readonly ReportOutputRow[]): string {
  const records = rows.map(row => [row.transactionDate, row.accountName, row.accountIdentifier, row.currency, row.description,
    row.counterparty ?? "", row.paymentReference ?? "", row.direction === "credit" ? "Incoming" : "Outgoing", formatMinorAmount(row.amountMinor)]);
  return `\uFEFF${[HEADERS, ...records].map(record => record.map(csvCell).join(",")).join("\r\n")}\r\n`;
}

export function downloadReportOutput(output: GeneratedReportOutput) {
  const url = URL.createObjectURL(new Blob([output.serializedCsv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = output.filename; anchor.style.display = "none";
  document.body.append(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
}

function formatMinorAmount(amountMinor: number) {
  const magnitude = Math.abs(amountMinor);
  return `${amountMinor < 0 ? "-" : ""}${Math.floor(magnitude / 100)}.${String(magnitude % 100).padStart(2, "0")}`;
}

function csvCell(value: string) {
  const protectedValue = /^\s*[=+\-@]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(protectedValue) ? `"${protectedValue.replaceAll('"', '""')}"` : protectedValue;
}
