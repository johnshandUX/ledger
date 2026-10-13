// @vitest-environment happy-dom

import { act, useEffect, type Dispatch } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { bankFinanceEnvironment } from "../../../../../src/finance/environment";
import type { BankEphemeralAction } from "../../../../../src/state/ephemeral-state";
import { BankStateProvider, useBankDispatch } from "../../../../BankStateProvider";
import { UserDetailsExperience } from "./UserDetailsExperience";

let container: HTMLDivElement;
let root: Root;
let bankDispatch: Dispatch<BankEphemeralAction>;

function Harness({ userId }: { userId: string }) {
  const dispatch = useBankDispatch();
  useEffect(() => { bankDispatch = dispatch; }, [dispatch]);
  return <UserDetailsExperience userId={userId} />;
}

async function renderUser(userId: string) {
  await act(async () => {
    root.render(<BankStateProvider><Harness userId={userId} /></BankStateProvider>);
  });
}

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("UserDetailsExperience", () => {
  it("keeps banking role and additional access separate for a developer-only user", async () => {
    await renderUser("user-noah-wilson");

    expect(container.textContent).toContain("Noah Wilson");
    expect(container.textContent).toContain("Software Developer");
    expect(container.querySelector('[aria-labelledby="banking-role-heading"]')?.textContent).toContain("Unassigned");
    expect(container.querySelector('[aria-labelledby="additional-access-heading"]')?.textContent).toContain("Developer");
    expect(container.querySelector('[aria-labelledby="additional-access-heading"]')?.textContent)
      .toContain("Access to developer tools, banking APIs and integrations.");
  });

  it("shows the optional job-title fallback and suspended status", async () => {
    await renderUser("user-lewis-wright");

    expect(container.querySelector('[aria-labelledby="identity-heading"]')?.textContent).toContain("Job titleNot provided");
    expect(container.textContent).toContain("Suspended");
    expect(container.querySelector(".ledger-badge--warning")?.textContent).toBe("Suspended");
  });

  it("reflects an overlay-updated job title without mutating the baseline", async () => {
    const baseline = bankFinanceEnvironment.users.find(({ id }) => id === "user-amelia-hart")!;
    const before = structuredClone(baseline);
    await renderUser(baseline.id);

    await act(async () => bankDispatch({
      type: "apply-overlay-delta",
      delta: {
        collection: "users",
        change: { kind: "update", id: baseline.id, changes: { jobTitle: "Group Treasurer" } },
      },
    }));

    expect(container.querySelector('[aria-labelledby="identity-heading"]')?.textContent).toContain("Group Treasurer");
    expect(baseline).toEqual(before);
  });

  it("renders overlay-created users and switches tombstoned users to unavailable", async () => {
    const created = {
      ...bankFinanceEnvironment.users[0]!,
      id: "user-overlay-created",
      firstName: "Overlay",
      lastName: "User",
      email: "overlay.user@caldermere.example",
      jobTitle: undefined,
      roleIds: [],
      additionalAccessIds: [],
    };
    await renderUser(created.id);

    expect(container.textContent).toContain("User unavailable");
    await act(async () => bankDispatch({
      type: "apply-overlay-delta",
      delta: { collection: "users", change: { kind: "create", record: created } },
    }));
    expect(container.textContent).toContain("Overlay User");
    expect(container.textContent).toContain("Not provided");
    expect(container.querySelector('[aria-labelledby="banking-role-heading"]')?.textContent).toContain("Unassigned");
    expect(container.querySelector('[aria-labelledby="additional-access-heading"]')?.textContent).toContain("No additional access");

    await act(async () => bankDispatch({
      type: "apply-overlay-delta",
      delta: { collection: "users", change: { kind: "tombstone", id: created.id } },
    }));
    expect(container.textContent).toContain("User unavailable");
    expect(container.textContent).not.toContain(created.id);
  });
});
