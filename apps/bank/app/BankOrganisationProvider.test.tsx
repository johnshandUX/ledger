// @vitest-environment happy-dom

import { act, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { BANK_BUSINESS_ID } from "../src/finance/environment";
import { MORGAN_BUSINESS_ID } from "../src/finance/organisations";
import {
  BankOrganisationProvider,
  useBankOrganisation,
} from "./BankOrganisationProvider";

beforeAll(() => {
  (
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
});

const containers: HTMLDivElement[] = [];

afterEach(() => {
  containers.splice(0).forEach((container) => container.remove());
});

function Probe({
  onValue,
}: {
  onValue: (value: ReturnType<typeof useBankOrganisation>) => void;
}) {
  const value = useBankOrganisation();
  useEffect(() => {
    onValue(value);
  }, [onValue, value]);
  return null;
}

describe("BankOrganisationProvider", () => {
  it("defaults to Caldermere and exposes Amelia's two memberships", async () => {
    const values: ReturnType<typeof useBankOrganisation>[] = [];
    const container = document.createElement("div");
    containers.push(container);
    document.body.append(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <BankOrganisationProvider>
          <Probe onValue={(value) => values.push(value)} />
        </BankOrganisationProvider>,
      );
    });

    const value = values.at(-1)!;
    expect(value.activeOrganisationId).toBe(BANK_BUSINESS_ID);
    expect(value.activeOrganisation.name).toBe("Caldermere Ltd");
    expect(value.activeMembership.role.name).toBe("Administrator");
    expect(value.availableOrganisations).toHaveLength(2);

    await act(async () => root.unmount());
  });

  it("switches the active organisation and treats the current one as a no-op", async () => {
    const onValue = vi.fn();
    const container = document.createElement("div");
    containers.push(container);
    document.body.append(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <BankOrganisationProvider>
          <Probe onValue={onValue} />
        </BankOrganisationProvider>,
      );
    });

    let value = onValue.mock.calls.at(-1)![0] as ReturnType<
      typeof useBankOrganisation
    >;
    const callsBeforeNoOp = onValue.mock.calls.length;
    await act(async () => value.switchActiveOrganisation(BANK_BUSINESS_ID));
    expect(onValue).toHaveBeenCalledTimes(callsBeforeNoOp);

    await act(async () => value.switchActiveOrganisation(MORGAN_BUSINESS_ID));
    value = onValue.mock.calls.at(-1)![0];
    expect(value.activeOrganisation.name).toBe("Morgan Property Holdings");
    expect(value.activeMembership.role.name).toBe("Viewer");

    await act(async () => root.unmount());
  });
});
