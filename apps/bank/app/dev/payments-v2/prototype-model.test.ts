import { describe, expect, it } from "vitest";
import {
  filterPrototypeOptions,
  filterPrototypeRecipients,
  formatPrototypeSortCode,
  getPrototypeBusinessDate,
  isPrototypeFutureDate,
  isPaymentsV2PrototypeAvailable,
  parsePrototypeGbpAmount,
} from "./prototype-model";

describe("Payments V2 prototype isolation", () => {
  it("is available only in development", () => {
    expect(isPaymentsV2PrototypeAvailable("development")).toBe(true);
    expect(isPaymentsV2PrototypeAvailable("production")).toBe(false);
    expect(isPaymentsV2PrototypeAvailable("test")).toBe(false);
    expect(isPaymentsV2PrototypeAvailable(undefined)).toBe(false);
  });
});

describe("prototype amount parsing", () => {
  it("parses exact GBP minor units", () => {
    expect(parsePrototypeGbpAmount("12500.00")).toEqual({
      valid: true,
      amountMinor: 1_250_000,
    });
    expect(parsePrototypeGbpAmount("0.01")).toEqual({
      valid: true,
      amountMinor: 1,
    });
  });

  it.each(["", "0", "-1", "1.234", "1,000", ".50", "GBP 10"])(
    "rejects unsupported raw value %s",
    (value) => {
      expect(parsePrototypeGbpAmount(value)).toEqual({ valid: false });
    },
  );
});

describe("prototype scheduled-date validation", () => {
  const today = new Date(2026, 9, 8, 12);

  it("accepts only a real calendar date after today", () => {
    expect(isPrototypeFutureDate("2026-10-09", today)).toBe(true);
    expect(isPrototypeFutureDate("2026-10-08", today)).toBe(false);
    expect(isPrototypeFutureDate("2026-10-07", today)).toBe(false);
    expect(isPrototypeFutureDate("2026-02-30", today)).toBe(false);
    expect(isPrototypeFutureDate("not-a-date", today)).toBe(false);
  });

  it("derives the reference date in the Ledger business timezone", () => {
    const nearMidnightUtc = new Date("2026-06-01T23:30:00Z");
    expect(getPrototypeBusinessDate(nearMidnightUtc)).toBe("2026-06-02");
  });
});

describe("prototype picker filtering", () => {
  const options = [
    { name: "Main Operating Account", maskedIdentifier: "•••• 0001" },
    { name: "Supplier Payments", maskedIdentifier: "•••• 0006" },
  ] as const;

  it("matches names and masked identifiers without mutating source order", () => {
    expect(filterPrototypeOptions(options, "supplier")).toEqual([options[1]]);
    expect(filterPrototypeOptions(options, "0001")).toEqual([options[0]]);
    expect(filterPrototypeOptions(options, "")).toBe(options);
  });
});

describe("prototype recipient helpers", () => {
  const recipients = [
    { id: "recipient-1", name: "Apex Steelworks", accountName: "Apex Steelworks Ltd", accountNumber: "81000001", sortCode: "20-10-01", maskedIdentifier: "•••• 0001", currency: "GBP" as const },
    { id: "recipient-2", name: "Boreal Alloys", accountName: "Boreal Alloys Ltd", accountNumber: "81000002", sortCode: "20-10-02", maskedIdentifier: "•••• 0002", currency: "GBP" as const },
  ];

  it("matches recipient names and account-number digits", () => {
    expect(filterPrototypeRecipients(recipients, "aPeX")).toEqual([recipients[0]]);
    expect(filterPrototypeRecipients(recipients, "0002")).toEqual([recipients[1]]);
  });

  it("formats only the first six sort-code digits", () => {
    expect(formatPrototypeSortCode("12a345678")).toBe("12-34-56");
  });
});
