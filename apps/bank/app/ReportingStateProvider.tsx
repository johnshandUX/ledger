"use client";

import { createContext, useCallback, useContext, useReducer, useRef, type Dispatch, type ReactNode } from "react";
import { createReportingState, reportingReducer, type ReportingAction } from "../src/reporting/state";
import type { ReportingState } from "../src/reporting/types";

const ReportingStateContext = createContext<ReportingState | undefined>(undefined);
const ReportingDispatchContext = createContext<Dispatch<ReportingAction> | undefined>(undefined);
const ReportingIdContext = createContext<((kind: "definition" | "run" | "output" | "schedule") => string) | undefined>(undefined);

export function ReportingStateProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, dispatch] = useReducer(reportingReducer, undefined, createReportingState);
  const sequence = useRef(0);
  const nextId = useCallback((kind: "definition" | "run" | "output" | "schedule") => `reporting-${kind}-${++sequence.current}`, []);
  return <ReportingStateContext value={state}><ReportingDispatchContext value={dispatch}><ReportingIdContext value={nextId}>{children}</ReportingIdContext></ReportingDispatchContext></ReportingStateContext>;
}

export function useReportingState() {
  const state = useContext(ReportingStateContext);
  if (!state) throw new Error("useReportingState must be used within ReportingStateProvider.");
  return state;
}
export function useReportingDispatch() {
  const dispatch = useContext(ReportingDispatchContext);
  if (!dispatch) throw new Error("useReportingDispatch must be used within ReportingStateProvider.");
  return dispatch;
}
export function useReportingIdSource() {
  const source = useContext(ReportingIdContext);
  if (!source) throw new Error("useReportingIdSource must be used within ReportingStateProvider.");
  return source;
}
