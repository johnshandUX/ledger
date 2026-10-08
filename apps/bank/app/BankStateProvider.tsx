"use client";

import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type { DeepReadonly, FinanceDataset } from "@johnshandux/ledger-synthetic-finance";
import { bankFinanceEnvironment } from "../src/finance/environment";
import {
  bankEphemeralReducer,
  createBankEphemeralState,
  type BankEphemeralAction,
  type BankEphemeralState,
} from "../src/state/ephemeral-state";

const BankStateContext = createContext<BankEphemeralState | undefined>(undefined);
const BankDispatchContext = createContext<Dispatch<BankEphemeralAction> | undefined>(
  undefined,
);

type BankStateProviderProps = Readonly<{
  children: ReactNode;
  baseline?: DeepReadonly<FinanceDataset>;
}>;

export function BankStateProvider({
  children,
  baseline = bankFinanceEnvironment,
}: BankStateProviderProps) {
  const [state, dispatch] = useReducer(
    bankEphemeralReducer,
    baseline,
    createBankEphemeralState,
  );

  return (
    <BankStateContext value={state}>
      <BankDispatchContext value={dispatch}>{children}</BankDispatchContext>
    </BankStateContext>
  );
}

export function useBankState(): BankEphemeralState {
  const state = useContext(BankStateContext);
  if (!state) throw new Error("useBankState must be used within BankStateProvider.");
  return state;
}

export function useBankDispatch(): Dispatch<BankEphemeralAction> {
  const dispatch = useContext(BankDispatchContext);
  if (!dispatch) throw new Error("useBankDispatch must be used within BankStateProvider.");
  return dispatch;
}
