// @vitest-environment happy-dom

import { act, useEffect, type Dispatch } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { User } from "@johnshandux/ledger-synthetic-finance";
import { bankFinanceEnvironment } from "../../../src/finance/environment";
import type { BankEphemeralAction } from "../../../src/state/ephemeral-state";
import { BankStateProvider, useBankDispatch } from "../../BankStateProvider";
import { UsersExperience } from "./UsersExperience";

let container: HTMLDivElement;
let root: Root;
let bankDispatch: Dispatch<BankEphemeralAction>;

function ExperienceHarness() {
  const dispatch = useBankDispatch();
  useEffect(() => { bankDispatch = dispatch; }, [dispatch]);
  return <UsersExperience />;
}

beforeEach(async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<BankStateProvider><ExperienceHarness /></BankStateProvider>));
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  document.body.querySelectorAll("[data-radix-popper-content-wrapper]").forEach((node) => node.remove());
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

function desktop() {
  const element = container.querySelector<HTMLElement>(".people-access-desktop");
  if (!element) throw new Error("Missing desktop users presentation");
  return element;
}

function button(scope: ParentNode, name: string) {
  const match = [...scope.querySelectorAll<HTMLButtonElement>("button")]
    .find((candidate) => candidate.textContent?.trim() === name || candidate.getAttribute("aria-label") === name);
  if (!match) throw new Error(`Missing button: ${name}`);
  return match;
}

describe("Users experience interactions", () => {
  it("searches by email, reports matching versus total users and clears all criteria", async () => {
    const search = desktop().querySelector<HTMLInputElement>('input[type="search"]')!;
    await setInputValue(search, "noah.wilson");

    expect(desktop().textContent).toContain("Showing 1 matching user from 18 total");
    expect(desktop().textContent).toContain("Noah Wilson");
    expect(desktop().textContent).not.toContain("Amelia Hart");

    await click(button(desktop(), "Clear all"));
    expect(search.value).toBe("");
    expect(desktop().textContent).toContain("Showing 1–10 of 18 users");
    expect(desktop().textContent).toContain("Amelia Hart");
  });

  it("applies a native-checkbox status filter and combines it with search", async () => {
    await click(button(desktop(), "Status"));
    const suspended = [...document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')]
      .find((input) => document.querySelector(`label[for="${input.id}"]`)?.textContent === "Suspended");
    if (!suspended) throw new Error("Missing Suspended checkbox");
    await click(suspended);

    expect(desktop().textContent).toContain("Lewis Wright");
    expect(desktop().textContent).toContain("Showing 1 matching user from 18 total");
    await setInputValue(desktop().querySelector<HTMLInputElement>('input[type="search"]')!, "amelia");
    expect(desktop().textContent).toContain("No matching users");
    expect(desktop().textContent).toContain("0 matching users from 18 total");
  });

  it("sorts and pages through the same controlled dataset", async () => {
    await click(button(desktop(), "Sort by Status"));
    expect(desktop().querySelector('th[aria-sort="ascending"]')?.textContent).toContain("Status");

    await click(button(desktop(), "Next page"));
    expect(desktop().textContent).toContain("Showing 11–18 of 18 users");
    expect(button(desktop(), "Page 2").getAttribute("aria-current")).toBe("page");
  });

  it("changes page size and renders the no-user state without an add action", async () => {
    const rangeTrigger = desktop().querySelector<HTMLButtonElement>(".ledger-data-table__range-trigger")!;
    await act(async () => {
      rangeTrigger.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0 }));
      rangeTrigger.click();
    });
    const twenty = [...document.querySelectorAll<HTMLElement>('[role="menuitemradio"]')]
      .find((item) => item.textContent?.trim() === "20 results");
    if (!twenty) throw new Error("Missing 20 results page-size option");
    await click(twenty);
    expect(desktop().textContent).toContain("18 users");
    expect(desktop().querySelectorAll("tbody tr")).toHaveLength(18);

    await act(async () => {
      root.render(<BankStateProvider key="empty" baseline={{ ...bankFinanceEnvironment, users: [] }}><UsersExperience /></BankStateProvider>);
    });
    expect(desktop().textContent).toContain("No users");
    expect(desktop().textContent).not.toContain("Add user");
  });

  it("renders effective overlay-created and updated users while excluding tombstones", async () => {
    const created: User = {
      ...bankFinanceEnvironment.users[0]!,
      id: "user-overlay-created",
      firstName: "Overlay",
      lastName: "Created",
      email: "overlay.created@caldermere.example",
      roleIds: ["role-viewer"],
      additionalAccessIds: [],
    };
    await act(async () => bankDispatch({
      type: "apply-overlay-deltas",
      deltas: [
        { collection: "users", change: { kind: "create", record: created } },
        { collection: "users", change: { kind: "update", id: "user-amelia-hart", changes: { firstName: "Updated" } } },
        { collection: "users", change: { kind: "tombstone", id: "user-aisha-khan" } },
      ],
    }));

    await setInputValue(desktop().querySelector<HTMLInputElement>('input[type="search"]')!, "overlay.created");
    expect(desktop().textContent).toContain("Overlay Created");
    await setInputValue(desktop().querySelector<HTMLInputElement>('input[type="search"]')!, "Updated Hart");
    expect(desktop().textContent).toContain("Updated Hart");
    await setInputValue(desktop().querySelector<HTMLInputElement>('input[type="search"]')!, "Aisha Khan");
    expect(desktop().textContent).toContain("No matching users");
    expect(desktop().textContent).toContain("0 matching users from 18 total");
  });
});
