// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { bankFinanceEnvironment } from "../../src/finance/environment";
import { getBankPaymentsFromEnvironment } from "../../src/finance/payments";
import { createPaymentsPresentationRowModel, PaymentsDataTable } from "./PaymentsDataTable";

let container: HTMLDivElement;
let root: Root;

beforeEach(async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(
    <PaymentsDataTable payments={getBankPaymentsFromEnvironment(bankFinanceEnvironment)} />,
  ));
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

async function setSelectValue(select: HTMLSelectElement, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set?.call(select, value);
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

async function click(element: HTMLElement) {
  await act(async () => element.click());
}

function mobile() {
  const element = container.querySelector<HTMLElement>(".payments-mobile");
  if (!element) throw new Error("Missing mobile payments presentation");
  return element;
}

function firstPaymentReference() {
  return mobile().querySelector<HTMLElement>(".payment-reference")?.textContent;
}

function paymentReferences() {
  return [...mobile().querySelectorAll<HTMLElement>(".payment-reference")].map(reference => reference.textContent);
}

describe("mobile payments interactions", () => {
  it("uses the shared labelled icon control and preserves the payment sorting rules", async () => {
    const select = mobile().querySelector<HTMLSelectElement>("select")!;
    expect(mobile().querySelector(`label[for="${select.id}"]`)?.textContent).toBe("Sort payments by");
    expect(select.value).toBe("statusDate");

    const descending = mobile().querySelector<HTMLButtonElement>('[aria-label="Sort descending; change to ascending"]')!;
    expect(descending).not.toBeNull();
    expect(descending.textContent).toBe("");
    expect(descending.querySelector(".mobile-table-direction-icon--descending")).not.toBeNull();
    const payments = getBankPaymentsFromEnvironment(bankFinanceEnvironment);
    const expectedDescending = createPaymentsPresentationRowModel(payments, {
      query: "",
      filters: {},
      pageIndex: 0,
      pageSize: payments.length,
      sort: { columnId: "statusDate", direction: "descending" },
    }, [payments.length]).sortedRows.map(payment => payment.reference);
    expect(paymentReferences()).toEqual(expectedDescending);

    await click(descending);
    const ascending = mobile().querySelector<HTMLButtonElement>('[aria-label="Sort ascending; change to descending"]')!;
    expect(ascending.querySelector(".mobile-table-direction-icon--ascending")).not.toBeNull();
    const expectedAscending = createPaymentsPresentationRowModel(payments, {
      query: "",
      filters: {},
      pageIndex: 0,
      pageSize: payments.length,
      sort: { columnId: "statusDate", direction: "ascending" },
    }, [payments.length]).sortedRows.map(payment => payment.reference);
    expect(paymentReferences()).toEqual(expectedAscending);

    await setSelectValue(select, "payment");
    expect(select.value).toBe("payment");
    expect(firstPaymentReference()).toBe("123PX00000123");
    expect(container.querySelector('.payments-table th[aria-sort="ascending"]')?.textContent).toContain("Payment");
  });
});
