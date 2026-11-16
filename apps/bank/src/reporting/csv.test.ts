// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";
import { downloadReportOutput, serializeReportCsv } from "./csv";
import type { ReportOutputRow } from "./types";

const row: ReportOutputRow = { transactionId: "tx-1", transactionDate: "2026-10-01", bookedAt: "2026-10-01T10:00:00Z", accountId: "a-1", accountName: "Operating, UK", accountIdentifier: "12345678", currency: "GBP", description: "Invoice \"Alpha\"\nSecond line", counterparty: "=SUM(A1:A2)", paymentReference: "+123", direction: "debit", amountMinor: 12345 };

describe("report CSV", () => {
  it("writes stable UTF-8 CSV headers, escaped records and precise amounts", () => {
    const first = serializeReportCsv([row]);
    expect(first.startsWith("\uFEFFTransaction date,Account name")).toBe(true);
    expect(first).toContain('"Operating, UK"');
    expect(first).toContain('"Invoice ""Alpha""\nSecond line"');
    expect(first).toContain("'=SUM(A1:A2)");
    expect(first).toContain("'+123");
    expect(first).toContain(",123.45\r\n");
    expect(serializeReportCsv([row])).toBe(first);
  });

  it("allows an empty report with headers", () => {
    expect(serializeReportCsv([]).split("\r\n")).toHaveLength(2);
  });

  it.each(["-command", "@command", "  =command"])("protects the formula-like value %s", value => {
    expect(serializeReportCsv([{ ...row, description: value }])).toContain(`'${value}`);
  });

  it("downloads the captured snapshot and revokes the temporary object URL", () => {
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    let revoked = "";
    URL.createObjectURL = () => "blob:report";
    URL.revokeObjectURL = value => { revoked = value; };
    const click = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = () => undefined;
    downloadReportOutput({ id: "output", runId: "run", filename: "report.csv", format: "csv", recordCount: 1, createdAt: "2026-11-01T00:00:00Z", rows: [row], serializedCsv: serializeReportCsv([row]) });
    expect(revoked).toBe("blob:report");
    expect(document.querySelector('a[download="report.csv"]')).toBeNull();
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
    HTMLAnchorElement.prototype.click = click;
  });
});
