// @vitest-environment happy-dom

import { act, useEffect, type Dispatch } from "react";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { Payment } from "@johnshandux/ledger-synthetic-finance";
import { bankFinanceEnvironment } from "../src/finance/environment";
import type { BankEphemeralAction } from "../src/state/ephemeral-state";
import {
  BankStateProvider,
  useBankDispatch,
  useBankState,
} from "./BankStateProvider";

beforeAll(() => {
  (
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
});

const mountedRoots: Root[] = [];

afterEach(async () => {
  await act(async () => {
    mountedRoots.splice(0).forEach((root) => root.unmount());
  });
});

const createdPayment: Payment = {
  ...bankFinanceEnvironment.payments[0]!,
  id: "payment-provider-test",
  reference: "EDS-PROVIDER-001",
};

type StateProbeProps = Readonly<{
  route: string;
  onDispatch?: (dispatch: Dispatch<BankEphemeralAction>) => void;
}>;

function StateProbe({ route, onDispatch }: StateProbeProps) {
  const state = useBankState();
  const dispatch = useBankDispatch();

  useEffect(() => onDispatch?.(dispatch), [dispatch, onDispatch]);

  return (
    <output data-route={route}>
      {state.baseline.businesses[0]?.id}:{Object.keys(state.overlay.payments.created).length}
    </output>
  );
}

async function mountProvider(
  route: string,
  onDispatch?: StateProbeProps["onDispatch"],
) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  mountedRoots.push(root);

  await act(async () => {
    root.render(
      <BankStateProvider>
        <StateProbe route={route} onDispatch={onDispatch} />
      </BankStateProvider>,
    );
  });

  return { container, root };
}

describe("BankStateProvider", () => {
  it("hydrates with the same deterministic baseline and empty overlay", async () => {
    const serverHtml = renderToString(
      <BankStateProvider>
        <StateProbe route="accounts" />
      </BankStateProvider>,
    );
    const container = document.createElement("div");
    container.innerHTML = serverHtml;
    document.body.append(container);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    let root: Root | undefined;
    await act(async () => {
      root = hydrateRoot(
        container,
        <BankStateProvider>
          <StateProbe route="accounts" />
        </BankStateProvider>,
      );
    });
    mountedRoots.push(root!);

    expect(container.textContent).toBe("business-caldermere:0");
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("retains overlay state when route content changes beneath the mounted provider", async () => {
    let dispatch: Dispatch<BankEphemeralAction> | undefined;
    const captureDispatch = (value: Dispatch<BankEphemeralAction>) => {
      dispatch = value;
    };
    const { container, root } = await mountProvider("accounts", captureDispatch);

    await act(async () => {
      dispatch?.({
        type: "apply-overlay-delta",
        delta: {
          collection: "payments",
          change: { kind: "create", record: createdPayment },
        },
      });
    });
    expect(container.textContent).toBe("business-caldermere:1");

    await act(async () => {
      root.render(
        <BankStateProvider>
          <StateProbe route="payments" onDispatch={captureDispatch} />
        </BankStateProvider>,
      );
    });

    expect(container.querySelector("output")?.dataset.route).toBe("payments");
    expect(container.textContent).toBe("business-caldermere:1");
  });

  it("isolates mutations between separately mounted application instances", async () => {
    let firstDispatch: Dispatch<BankEphemeralAction> | undefined;
    const first = await mountProvider("first", (value) => {
      firstDispatch = value;
    });

    await act(async () => {
      firstDispatch?.({
        type: "apply-overlay-delta",
        delta: {
          collection: "payments",
          change: { kind: "create", record: createdPayment },
        },
      });
    });
    const second = await mountProvider("second");

    expect(first.container.textContent).toBe("business-caldermere:1");
    expect(second.container.textContent).toBe("business-caldermere:0");
  });
});
