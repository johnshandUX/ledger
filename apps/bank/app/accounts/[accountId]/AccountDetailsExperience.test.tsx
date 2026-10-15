// @vitest-environment happy-dom

import { act, useEffect, type Dispatch } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { bankFinanceEnvironment } from "../../../src/finance/environment";
import type { BankEphemeralAction } from "../../../src/state/ephemeral-state";
import { BankStateProvider, useBankDispatch } from "../../BankStateProvider";
import { AccountDetailsExperience } from "./AccountDetailsExperience";

beforeAll(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
});

function DispatchCapture({ onDispatch }: { onDispatch: (dispatch: Dispatch<BankEphemeralAction>) => void }) {
  const dispatch = useBankDispatch();
  useEffect(() => onDispatch(dispatch), [dispatch, onDispatch]);
  return null;
}

describe("AccountDetailsExperience effective state", () => {
  it("uses effective account and balance records without mutating the baseline and resets cleanly", async () => {
    const account = bankFinanceEnvironment.accounts.find(({ id }) => id === "account-main-operating")!;
    const balance = bankFinanceEnvironment.balances.find(({ accountId }) => accountId === account.id)!;
    const baselineAccount = structuredClone(account);
    const baselineBalance = structuredClone(balance);
    let dispatch: Dispatch<BankEphemeralAction> | undefined;
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);

    await act(async () => root?.render(
      <BankStateProvider>
        <DispatchCapture onDispatch={(value) => { dispatch = value; }} />
        <AccountDetailsExperience accountId={account.id} transactions={[]} />
      </BankStateProvider>,
    ));

    await act(async () => dispatch?.({
      type: "apply-overlay-deltas",
      deltas: [
        { collection: "accounts", change: { kind: "update", id: account.id, changes: { name: "Effective Operating Account" } } },
        { collection: "balances", change: { kind: "update", id: balance.id, changes: { availableBalanceMinor: 123_456, ledgerBalanceMinor: 234_567 } } },
      ],
    }));

    expect(container.textContent).toContain("Effective Operating Account");
    expect(container.textContent).toContain("£1,234.56");
    expect(container.textContent).toContain("£2,345.67");
    expect(account).toEqual(baselineAccount);
    expect(balance).toEqual(baselineBalance);

    await act(async () => dispatch?.({ type: "reset-overlay" }));
    expect(container.textContent).toContain(account.name);
    expect(container.textContent).not.toContain("Effective Operating Account");
  });
});
