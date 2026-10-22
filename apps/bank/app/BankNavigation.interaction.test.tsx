// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  AppShell,
  AppWorkspace,
  WorkspaceHeader,
} from "@johnshandux/ledger-design-system/application-navigation";
import { BankNavigation } from "./BankNavigation";
import { BankOrganisationProvider } from "./BankOrganisationProvider";
import { getRouterPushMock } from "../vitest.setup";

const routerPushMock = getRouterPushMock();

beforeAll(() => {
  (
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

const roots: Root[] = [];

afterEach(async () => {
  routerPushMock.mockReset();
  await act(async () => {
    roots.splice(0).forEach((root) => root.unmount());
  });
  document.body.replaceChildren();
});

describe("BankNavigation organisation switching", () => {
  it("updates the active organisation and routes changed selection to Accounts", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => {
      root.render(
        <BankOrganisationProvider>
          <AppShell
            navigation={
              <BankNavigation activeRoute="admin" displayName="Amelia Hart" />
            }
          >
            <WorkspaceHeader>Admin</WorkspaceHeader>
            <AppWorkspace>Admin content</AppWorkspace>
          </AppShell>
        </BankOrganisationProvider>,
      );
    });

    const trigger = document.querySelector<HTMLButtonElement>(
      '[aria-label="Switch organisation: Caldermere Ltd"]',
    )!;
    await act(async () => trigger.click());
    const morganOption = Array.from(
      document.querySelectorAll<HTMLLabelElement>(".ledger-organisation-option"),
    ).find((option) => option.textContent?.includes("Morgan Property Holdings"))!;
    await act(async () => morganOption.click());

    expect(routerPushMock).toHaveBeenCalledOnce();
    expect(routerPushMock).toHaveBeenCalledWith("/");
    expect(
      document.querySelector(
        '[aria-label="Switch organisation: Morgan Property Holdings"]',
      ),
    ).not.toBeNull();
    expect(document.body.textContent).toContain("Viewer");
  });

  it("closes current selection without routing", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => {
      root.render(
        <BankOrganisationProvider>
          <AppShell
            navigation={
              <BankNavigation activeRoute="accounts" displayName="Amelia Hart" />
            }
          >
            <WorkspaceHeader>Accounts</WorkspaceHeader>
            <AppWorkspace>Accounts content</AppWorkspace>
          </AppShell>
        </BankOrganisationProvider>,
      );
    });

    const trigger = document.querySelector<HTMLButtonElement>(
      '[aria-label="Switch organisation: Caldermere Ltd"]',
    )!;
    await act(async () => trigger.click());
    const currentOption = document.querySelector<HTMLLabelElement>(
      '.ledger-organisation-option[data-selected="true"]',
    )!;
    await act(async () => currentOption.click());

    expect(routerPushMock).not.toHaveBeenCalled();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
});
