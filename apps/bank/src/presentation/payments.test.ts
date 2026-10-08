import { describe, expect, it } from "vitest";
import type { Payment } from "@johnshandux/ledger-synthetic-finance";
import { formatApprovalStatus, formatPaymentStatus, getApprovalStatusVariant, getPaymentStatusDate, maskAccountNumber } from "./payments";

const base = { id: "p", businessId: "b", sourceAccountId: "a", beneficiaryId: "x", amountMinor: 100, currency: "GBP", reference: "REF", createdByUserId: "u", createdAt: "2026-10-01T10:00:00Z" } as const;

describe("payment presentation", () => {
  it("uses the lifecycle-specific date and labels it", () => {
    expect(getPaymentStatusDate({ ...base, status: "scheduled", scheduledFor: "2026-10-08" } satisfies Payment)).toEqual({ label: "Scheduled", value: "2026-10-08" });
    expect(getPaymentStatusDate({ ...base, status: "awaiting-approval" } satisfies Payment)).toEqual({ label: "Created", value: base.createdAt });
  });
  it("uses commercial status wording", () => expect(formatPaymentStatus("awaiting-approval")).toBe("Awaiting approval"));
  it("masks beneficiary account numbers", () => expect(maskAccountNumber("81000001")).toBe("•••• 0001"));
  it("presents a rejected approval independently as an error", () => {
    expect(formatApprovalStatus("rejected")).toBe("Rejected");
    expect(getApprovalStatusVariant("rejected")).toBe("error");
  });
});
