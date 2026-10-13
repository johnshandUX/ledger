// @vitest-environment happy-dom

import { act, useEffect, type Dispatch } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import type { User } from "@johnshandux/ledger-synthetic-finance";
import { bankFinanceEnvironment } from "../../src/finance/environment";
import type { BankEphemeralAction } from "../../src/state/ephemeral-state";
import { BankStateProvider, useBankDispatch } from "../BankStateProvider";
import { AdminOverview } from "./AdminOverview";

beforeAll(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

const mountedRoots: Root[] = [];

afterEach(async () => {
  await act(async () => mountedRoots.splice(0).forEach((root) => root.unmount()));
  document.body.innerHTML = "";
});

function Harness({ onDispatch }: { onDispatch: (dispatch: Dispatch<BankEphemeralAction>) => void }) {
  const dispatch = useBankDispatch();
  useEffect(() => onDispatch(dispatch), [dispatch, onDispatch]);
  return <AdminOverview />;
}

describe("Administration overview", () => {
  it("renders the dashboard hierarchy and truthful unavailable states", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    mountedRoots.push(root);
    await act(async () => root.render(<BankStateProvider><AdminOverview /></BankStateProvider>));

    expect(container.querySelector(".admin-summary")?.textContent).toContain("18 users");
    expect(container.querySelector(".admin-summary")?.textContent).toContain("17 active");
    expect(container.textContent).toContain("Needs your attention");
    expect(container.textContent).toContain("Recent activity");
    expect(container.textContent).toContain("Billing");
    expect(container.textContent).toContain("Quick access");
    expect(container.textContent).toContain("Access requests are not yet available");
    expect(container.textContent).toContain("Mobile registration data is not currently available");
    expect(container.textContent).not.toMatch(/requests? awaiting|next billing date|today,|yesterday,/i);
  });

  it("updates all user figures from the effective in-memory state", async () => {
    let dispatch: Dispatch<BankEphemeralAction> | undefined;
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    mountedRoots.push(root);
    await act(async () => root.render(
      <BankStateProvider><Harness onDispatch={(next) => { dispatch = next; }} /></BankStateProvider>,
    ));

    const createdUser: User = {
      ...bankFinanceEnvironment.users[0]!,
      id: "user-admin-overview-created",
      email: "overview.created@caldermere.example",
      roleIds: [],
      status: "active",
    };
    await act(async () => {
      dispatch!({ type: "apply-overlay-delta", delta: { collection: "users", change: { kind: "create", record: createdUser } } });
      dispatch!({ type: "apply-overlay-delta", delta: { collection: "users", change: { kind: "update", id: "user-lewis-wright", changes: { status: "active" } } } });
      dispatch!({ type: "apply-overlay-delta", delta: { collection: "users", change: { kind: "tombstone", id: "user-noah-wilson" } } });
    });

    const summary = container.querySelector(".admin-summary")?.textContent;
    expect(summary).toContain("18 users");
    expect(summary).toContain("18 active");
    expect(summary).not.toContain("with banking roles");
  });
});
