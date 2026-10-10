// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PaymentsV2Prototype } from "./PaymentsV2Prototype";
import type { PrototypeAccount, PrototypeRecipient, PrototypeRecipientGroup } from "./prototype-model";

const accounts: readonly PrototypeAccount[] = [
  { id: "account-1", name: "Main Operating Account", maskedIdentifier: "•••• 0001", currency: "GBP", availableBalanceMinor: 20_000_000 },
  { id: "account-2", name: "Supplier Payments", maskedIdentifier: "•••• 0006", currency: "GBP", availableBalanceMinor: 10_000_000 },
];

const recipients: readonly PrototypeRecipient[] = [
  { id: "recipient-1", name: "Apex Steelworks", accountName: "Apex Steelworks Ltd", accountNumber: "81000001", sortCode: "20-10-01", maskedIdentifier: "•••• 0001", currency: "GBP" },
  { id: "recipient-2", name: "Boreal Alloys", accountName: "Boreal Alloys Ltd", accountNumber: "81000002", sortCode: "20-10-02", maskedIdentifier: "•••• 0002", currency: "GBP" },
  { id: "recipient-3", name: "Shared Name", accountName: "Shared Name One", accountNumber: "81000003", sortCode: "20-10-03", maskedIdentifier: "•••• 0003", currency: "GBP" },
  { id: "recipient-4", name: "Shared Name", accountName: "Shared Name Two", accountNumber: "81000004", sortCode: "20-10-04", maskedIdentifier: "•••• 0004", currency: "GBP" },
];

const recipientGroups: readonly PrototypeRecipientGroup[] = [
  { id: "group-suppliers", name: "Suppliers", recipientIds: ["recipient-1", "recipient-2"] },
  { id: "group-priority", name: "Priority", recipientIds: ["recipient-1"] },
];

let container: HTMLDivElement;
let root: Root;

beforeEach(async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<PaymentsV2Prototype accounts={accounts} recipients={recipients} recipientGroups={recipientGroups} referenceDate="2026-10-09" />));
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

async function click(element: HTMLElement) {
  await act(async () => element.click());
}

async function setInputValue(input: HTMLInputElement, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

async function setSelectValue(select: HTMLSelectElement, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set?.call(select, value);
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function radio(value: "single" | "multiple") {
  const input = container.querySelector<HTMLInputElement>(`input[name="payments-v2-mode"][value="${value}"]`);
  if (!input) throw new Error(`Missing ${value} mode`);
  return input;
}

function amountInput() {
  const input = container.querySelector<HTMLInputElement>("#payments-v2-amount");
  if (!input) throw new Error("Missing amount input");
  return input;
}

function button(name: string | RegExp): HTMLButtonElement {
  const match = [...document.querySelectorAll<HTMLButtonElement>("button")].find((candidate) =>
    typeof name === "string" ? candidate.textContent?.trim() === name : name.test(candidate.textContent?.trim() ?? ""),
  );
  if (!match) throw new Error(`Missing button: ${name}`);
  return match;
}

async function openRecipientSelection() {
  await click(radio("multiple"));
}

function recipientCheckbox(id: string) {
  const input = container.querySelector<HTMLInputElement>(`#payments-v2-recipient-${id}`);
  if (!input) throw new Error(`Missing recipient checkbox: ${id}`);
  return input;
}

async function addRecipient(name: string, accountNumber: string, groupIds: readonly string[] = []) {
  await click(button("Add recipient"));
  await setInputValue(container.querySelector<HTMLInputElement>("#payments-v2-new-recipient-name")!, name);
  await setInputValue(container.querySelector<HTMLInputElement>("#payments-v2-new-recipient-sort-code")!, "123456");
  await setInputValue(container.querySelector<HTMLInputElement>("#payments-v2-new-recipient-account-number")!, accountNumber);
  for (const groupId of groupIds) await click(container.querySelector<HTMLInputElement>(`#payments-v2-new-recipient-${groupId}`)!);
  await click(button("Add recipient"));
}

describe("Payments V2 adaptive entry", () => {
  it("defaults to Single with the shared account and connected amount surface", () => {
    expect(radio("single").checked).toBe(true);
    expect(radio("multiple").checked).toBe(false);
    expect(container.querySelector("h1")?.textContent).toBe("Make a payment");
    expect(container.textContent).toContain("Main Operating Account");
    expect(container.textContent).toContain("You send");
    expect(container.textContent).toContain("Recipient gets");
    expect(button("Continue to recipient").disabled).toBe(true);
  });

  it("switches to Multiple and immediately shows recipient selection without the introductory card", async () => {
    await click(radio("multiple"));
    expect(radio("multiple").checked).toBe(true);
    expect(container.querySelector("h1")?.textContent).toBe("Make a payment");
    expect(container.textContent).toContain("Recipients");
    expect(container.textContent).toContain("Search recipients");
    expect(container.textContent).toContain("Apex Steelworks");
    expect(container.textContent).not.toContain("Pay multiple recipients");
    expect(container.textContent).not.toContain("Choose recipients");
    expect(container.querySelector("#payments-v2-amount")).toBeNull();
  });

  it("restores the Single amount after switching modes", async () => {
    await setInputValue(amountInput(), "125.50");
    await click(radio("multiple"));
    await click(radio("single"));
    expect(amountInput().value).toBe("125.50");
    expect(container.textContent).toContain("£125.50");
  });

  it("shares the selected account across both modes", async () => {
    const trigger = container.querySelector<HTMLButtonElement>(".payments-v2-account-trigger");
    if (!trigger) throw new Error("Missing account trigger");
    await click(trigger);
    const option = [...document.querySelectorAll<HTMLButtonElement>(".payments-v2-option")].find((candidate) => candidate.textContent?.includes("Supplier Payments"));
    if (!option) throw new Error("Missing account option");
    await click(option);
    await click(radio("multiple"));
    expect(container.textContent).toContain("Supplier Payments");
    await click(radio("single"));
    expect(container.textContent).toContain("Supplier Payments");
  });

  it("revalidates the preserved amount when the source account changes", async () => {
    await setInputValue(amountInput(), "150000.00");
    const trigger = container.querySelector<HTMLButtonElement>(".payments-v2-account-trigger");
    if (!trigger) throw new Error("Missing account trigger");
    await click(trigger);
    const option = [...document.querySelectorAll<HTMLButtonElement>(".payments-v2-option")].find((candidate) => candidate.textContent?.includes("Supplier Payments"));
    if (!option) throw new Error("Missing account option");
    await click(option);
    expect(amountInput().value).toBe("150000.00");
    expect(amountInput().getAttribute("aria-invalid")).toBe("true");
    expect(container.textContent).toContain("higher than this account’s available balance");
    expect(container.querySelector("output")?.textContent).toBe("—");
    expect(button("Continue to recipient").disabled).toBe(true);
  });

  it("enables progression only for a valid amount and identifies the placeholder", async () => {
    const continueButton = button("Continue to recipient");
    await setInputValue(amountInput(), "12.345");
    await act(async () => amountInput().dispatchEvent(new FocusEvent("focusout", { bubbles: true })));
    expect(amountInput().getAttribute("aria-invalid")).toBe("true");
    expect(continueButton.disabled).toBe(true);
    await setInputValue(amountInput(), "12.34");
    expect(continueButton.disabled).toBe(false);
    await click(continueButton);
    expect(container.textContent).toContain("Prototype placeholder: Single recipient selection");
  });

  it("keeps the same core financial content at narrow viewport widths", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    window.dispatchEvent(new Event("resize"));
    expect(container.textContent).toContain("Main Operating Account");
    expect(container.textContent).toContain("Available balance");
    expect(container.textContent).toContain("Recipient gets");
    expect(container.textContent).toContain("Continue to recipient");
  });
});

describe("Payments V2 Single payment scheduling", () => {
  function scheduleDateInput() {
    const input = document.querySelector<HTMLInputElement>("#payments-v2-schedule-date");
    if (!input) throw new Error("Missing schedule date input");
    return input;
  }

  function scheduleSelect(id: "payments-v2-schedule-repeats" | "payments-v2-schedule-ends") {
    const select = document.querySelector<HTMLSelectElement>(`#${id}`);
    if (!select) throw new Error(`Missing schedule select: ${id}`);
    return select;
  }

  function scheduleEndDateInput() {
    const input = document.querySelector<HTMLInputElement>("#payments-v2-schedule-end-date");
    if (!input) throw new Error("Missing schedule end date input");
    return input;
  }

  async function setSchedule(date: string) {
    await click(button("Schedule"));
    await setInputValue(scheduleDateInput(), date);
    await click(button("Set schedule"));
  }

  it("defaults to immediate timing and opens the Schedule dialog", async () => {
    expect(container.textContent).toContain("Send as soon as possible");
    expect(container.textContent).toContain("We'll submit this payment for processing immediately.");
    await click(button("Schedule"));
    expect(document.body.textContent).toContain("Schedule payment");
    expect(document.activeElement?.id).toBe("payments-v2-schedule-dialog");
    expect(scheduleDateInput().min).toBe("2026-10-10");
    expect(scheduleSelect("payments-v2-schedule-repeats").value).toBe("never");
    expect(document.querySelector("#payments-v2-schedule-ends")).toBeNull();
    expect(document.querySelector("#payments-v2-schedule-end-date")).toBeNull();
    expect(button("Set schedule").disabled).toBe(true);
  });

  it("progressively reveals and hides recurrence end controls", async () => {
    await click(button("Schedule"));
    await setSelectValue(scheduleSelect("payments-v2-schedule-repeats"), "monthly");
    expect(scheduleSelect("payments-v2-schedule-ends").value).toBe("never");
    expect(document.querySelector("#payments-v2-schedule-end-date")).toBeNull();
    await setSelectValue(scheduleSelect("payments-v2-schedule-ends"), "specific-date");
    expect(scheduleEndDateInput()).toBeTruthy();
    await setSelectValue(scheduleSelect("payments-v2-schedule-repeats"), "never");
    expect(document.querySelector("#payments-v2-schedule-ends")).toBeNull();
    expect(document.querySelector("#payments-v2-schedule-end-date")).toBeNull();
  });

  it("requires a specific end date to be on or after the start date", async () => {
    await click(button("Schedule"));
    await setInputValue(scheduleDateInput(), "2026-10-20");
    await setSelectValue(scheduleSelect("payments-v2-schedule-repeats"), "weekly");
    await setSelectValue(scheduleSelect("payments-v2-schedule-ends"), "specific-date");
    expect(button("Set schedule").disabled).toBe(true);
    await setInputValue(scheduleEndDateInput(), "2026-10-19");
    expect(button("Set schedule").disabled).toBe(true);
    expect(document.body.textContent).toContain("Choose an end date on or after 20 October 2026.");
    await setInputValue(scheduleEndDateInput(), "2026-10-20");
    expect(button("Set schedule").disabled).toBe(false);
  });

  it("restores a confirmed recurring schedule and presents a readable summary", async () => {
    await click(button("Schedule"));
    await setInputValue(scheduleDateInput(), "2026-10-20");
    await setSelectValue(scheduleSelect("payments-v2-schedule-repeats"), "quarterly");
    await setSelectValue(scheduleSelect("payments-v2-schedule-ends"), "specific-date");
    await setInputValue(scheduleEndDateInput(), "2027-10-20");
    await click(button("Set schedule"));
    expect(container.textContent).toContain("Quarterly from 20 October 2026, ending 20 October 2027");

    await click(button("Change"));
    expect(scheduleDateInput().value).toBe("2026-10-20");
    expect(scheduleSelect("payments-v2-schedule-repeats").value).toBe("quarterly");
    expect(scheduleSelect("payments-v2-schedule-ends").value).toBe("specific-date");
    expect(scheduleEndDateInput().value).toBe("2027-10-20");
    await setSelectValue(scheduleSelect("payments-v2-schedule-repeats"), "never");
    await click(button("Cancel"));

    await click(button("Change"));
    expect(scheduleSelect("payments-v2-schedule-repeats").value).toBe("quarterly");
    expect(scheduleSelect("payments-v2-schedule-ends").value).toBe("specific-date");
    expect(scheduleEndDateInput().value).toBe("2027-10-20");
  });

  it("rejects a date that is not in the future", async () => {
    await click(button("Schedule"));
    await setInputValue(scheduleDateInput(), "2026-10-09");
    expect(button("Set schedule").disabled).toBe(true);
    expect(document.body.textContent).toContain("Choose a date after 9 October 2026.");
  });

  it("sets, displays and changes a future date in British format", async () => {
    await setSchedule("2026-10-20");
    expect(container.textContent).toContain("Scheduled payment");
    expect(container.textContent).toContain("20 October 2026");
    await click(button("Change"));
    expect(scheduleDateInput().value).toBe("2026-10-20");
    await setInputValue(scheduleDateInput(), "2026-11-03");
    await click(button("Set schedule"));
    expect(container.textContent).toContain("3 November 2026");
  });

  it("cancels without losing the current timing choice", async () => {
    await setSchedule("2026-10-20");
    await click(button("Change"));
    await setInputValue(scheduleDateInput(), "2026-11-03");
    await click(button("Cancel"));
    expect(container.textContent).toContain("20 October 2026");
    expect(container.textContent).not.toContain("3 November 2026");
    expect(document.activeElement?.id).toBe("payments-v2-schedule-trigger");
  });

  it("returns a scheduled payment to immediate processing", async () => {
    await setSchedule("2026-10-20");
    await click(button("Change"));
    await click(button("Send as soon as possible"));
    expect(container.textContent).toContain("We'll submit this payment for processing immediately.");
    expect(container.textContent).not.toContain("Scheduled payment");
  });

  it("allows an otherwise valid scheduled amount above today's balance", async () => {
    await setInputValue(amountInput(), "250000.00");
    await act(async () => amountInput().dispatchEvent(new FocusEvent("focusout", { bubbles: true })));
    expect(amountInput().getAttribute("aria-invalid")).toBe("true");
    await setSchedule("2026-10-20");
    expect(amountInput().getAttribute("aria-invalid")).toBe("false");
    expect(button("Continue to recipient").disabled).toBe(false);
    expect(container.textContent).not.toContain("higher than this account’s available balance");
  });

  it("revalidates against available funds when returning to immediate", async () => {
    await setInputValue(amountInput(), "250000.00");
    await setSchedule("2026-10-20");
    await click(button("Change"));
    await click(button("Send as soon as possible"));
    expect(amountInput().value).toBe("250000.00");
    expect(amountInput().getAttribute("aria-invalid")).toBe("true");
    expect(button("Continue to recipient").disabled).toBe(true);
  });

  it("preserves amount, source account and timing while switching modes", async () => {
    await setInputValue(amountInput(), "125.50");
    const trigger = container.querySelector<HTMLButtonElement>(".payments-v2-account-trigger")!;
    await click(trigger);
    const option = [...document.querySelectorAll<HTMLButtonElement>(".payments-v2-option")].find((candidate) => candidate.textContent?.includes("Supplier Payments"))!;
    await click(option);
    await setSchedule("2026-10-20");
    await click(radio("multiple"));
    await click(radio("single"));
    expect(amountInput().value).toBe("125.50");
    expect(container.textContent).toContain("Supplier Payments");
    expect(container.textContent).toContain("20 October 2026");
  });

  it("resets timing when the prototype remounts", async () => {
    await setSchedule("2026-10-20");
    await act(async () => root.render(<div />));
    await act(async () => root.render(<PaymentsV2Prototype accounts={accounts} recipients={recipients} recipientGroups={recipientGroups} referenceDate="2026-10-09" />));
    expect(container.textContent).toContain("Send as soon as possible");
    expect(container.textContent).not.toContain("20 October 2026");
  });
});

describe("Payments V2 multiple recipient selection", () => {
  it("keeps recipient selection on Page 1 with the selected source account", async () => {
    await openRecipientSelection();
    expect(container.querySelector("h1")?.textContent).toBe("Make a payment");
    expect(container.textContent).toContain("Main Operating Account");
    expect(container.textContent).toContain("£200,000.00");
    expect(container.textContent).toContain("Apex Steelworks");
  });

  it("renders existing Caldermere-style recipient records as independent rows", async () => {
    await openRecipientSelection();
    expect(container.textContent).toContain("Apex Steelworks");
    expect(container.textContent).toContain("Boreal Alloys");
    expect(container.textContent).toContain("•••• 0003");
    expect(container.textContent).toContain("•••• 0004");
  });

  it("searches case-insensitively by recipient name", async () => {
    await openRecipientSelection();
    await setInputValue(container.querySelector<HTMLInputElement>("#payments-v2-recipient-search")!, "bOrEaL");
    expect(container.textContent).toContain("Boreal Alloys");
    expect(container.textContent).not.toContain("Apex Steelworks");
  });

  it("searches by account identifier", async () => {
    await openRecipientSelection();
    await setInputValue(container.querySelector<HTMLInputElement>("#payments-v2-recipient-search")!, "0004");
    expect(container.textContent).toContain("•••• 0004");
    expect(container.querySelector("#payments-v2-recipient-recipient-3")).toBeNull();
  });

  it("uses stable recipient IDs for multi-selection and updates the count", async () => {
    await openRecipientSelection();
    await click(recipientCheckbox("recipient-3"));
    await click(recipientCheckbox("recipient-4"));
    expect(recipientCheckbox("recipient-3").checked).toBe(true);
    expect(recipientCheckbox("recipient-4").checked).toBe(true);
    expect(container.textContent).toContain("2 selected");
    expect(button("Continue with 2 recipients").disabled).toBe(false);
  });

  it("preserves Multiple selections when switching to Single and back", async () => {
    await openRecipientSelection();
    await click(recipientCheckbox("recipient-2"));
    await click(radio("single"));
    expect(container.textContent).toContain("You send");
    await click(radio("multiple"));
    expect(recipientCheckbox("recipient-2").checked).toBe(true);
    expect(container.textContent).toContain("1 selected");
  });

  it("retains selection across search", async () => {
    await openRecipientSelection();
    await click(recipientCheckbox("recipient-1"));
    await setInputValue(container.querySelector<HTMLInputElement>("#payments-v2-recipient-search")!, "Boreal");
    expect(container.textContent).toContain("1 selected");
    await setInputValue(container.querySelector<HTMLInputElement>("#payments-v2-recipient-search")!, "");
    expect(recipientCheckbox("recipient-1").checked).toBe(true);
  });

  it("retains selection across group filters and keeps ungrouped recipients in All", async () => {
    await openRecipientSelection();
    await click(recipientCheckbox("recipient-3"));
    await click(button("Suppliers"));
    expect(container.querySelector("#payments-v2-recipient-recipient-3")).toBeNull();
    expect(container.textContent).toContain("1 selected");
    await click(button("All recipients"));
    expect(recipientCheckbox("recipient-3").checked).toBe(true);
  });

  it("selects and deselects all shown without altering selections outside the filter", async () => {
    await openRecipientSelection();
    await click(recipientCheckbox("recipient-3"));
    await click(button("Suppliers"));
    const selectAll = container.querySelector<HTMLInputElement>('input[aria-label="Select all"]')!;
    await click(selectAll);
    expect(container.textContent).toContain("3 selected");
    await click(selectAll);
    expect(container.textContent).toContain("1 selected");
    await click(button("All recipients"));
    expect(recipientCheckbox("recipient-3").checked).toBe(true);
  });

  it("keeps Continue disabled when no recipients are selected", async () => {
    await openRecipientSelection();
    expect(button("Continue with 0 recipients").disabled).toBe(true);
  });

  it("opens the amount-allocation placeholder with the selected count", async () => {
    await openRecipientSelection();
    await click(recipientCheckbox("recipient-1"));
    await click(button("Continue with 1 recipient"));
    expect(container.querySelector("h1")?.textContent).toBe("Allocate payment amounts");
    expect(container.textContent).toContain("individual amount allocation for 1 recipient");
    await click(button("Back to recipients"));
    expect(container.querySelector("h1")?.textContent).toBe("Make a payment");
    expect(document.activeElement?.id).toBe("payments-v2-continue-recipients");
  });

  it("adds a recipient without a group and automatically selects it", async () => {
    await openRecipientSelection();
    await addRecipient("New Recipient", "12345678");
    expect(container.textContent).toContain("New Recipient");
    expect(container.textContent).toContain("•••• 5678");
    expect(container.textContent).not.toContain("12345678");
    expect(container.textContent).toContain("1 selected");
    expect(container.querySelector("h1")?.textContent).toBe("Make a payment");
  });

  it("adds a recipient to multiple groups and retains existing selections", async () => {
    await openRecipientSelection();
    await click(recipientCheckbox("recipient-2"));
    await addRecipient("Grouped Recipient", "87654321", ["group-suppliers", "group-priority"]);
    expect(container.textContent).toContain("2 selected");
    await click(button("Priority"));
    expect(container.textContent).toContain("Grouped Recipient");
    expect(recipientCheckbox("recipient-prototype-1").checked).toBe(true);
  });

  it("supports repeated Add recipient tasks without resetting selection", async () => {
    await openRecipientSelection();
    await addRecipient("First New", "11112222");
    await addRecipient("Second New", "33334444");
    expect(container.textContent).toContain("First New");
    expect(container.textContent).toContain("Second New");
    expect(container.textContent).toContain("2 selected");
  });

  it("cancels Add recipient without losing selected recipients", async () => {
    await openRecipientSelection();
    await click(recipientCheckbox("recipient-1"));
    await click(button("Add recipient"));
    await setInputValue(container.querySelector<HTMLInputElement>("#payments-v2-new-recipient-name")!, "Discard me");
    await click(button("Cancel"));
    expect(container.textContent).not.toContain("Discard me");
    expect(recipientCheckbox("recipient-1").checked).toBe(true);
    expect(document.activeElement?.id).toBe("payments-v2-add-recipient");
  });

  it("validates required recipient fields", async () => {
    await openRecipientSelection();
    await click(button("Add recipient"));
    await click(button("Add recipient"));
    expect(container.textContent).toContain("Enter the recipient name.");
    expect(container.textContent).toContain("Enter a six-digit UK sort code.");
    expect(container.textContent).toContain("Enter an eight-digit UK account number.");
  });

  it("removes individual recipients and clears the selection", async () => {
    await openRecipientSelection();
    await click(recipientCheckbox("recipient-1"));
    await click(recipientCheckbox("recipient-2"));
    await click(button("Remove"));
    expect(container.textContent).toContain("1 selected");
    await click(button("Clear selection"));
    expect(container.textContent).toContain("0 selected");
  });

  it("resets temporary recipients and selection when the prototype remounts", async () => {
    await openRecipientSelection();
    await addRecipient("Temporary Recipient", "12345678");
    await act(async () => root.render(<div />));
    await act(async () => root.render(<PaymentsV2Prototype accounts={accounts} recipients={recipients} recipientGroups={recipientGroups} referenceDate="2026-10-09" />));
    expect(container.querySelector("h1")?.textContent).toBe("Make a payment");
    expect(container.textContent).not.toContain("Temporary Recipient");
  });
});
