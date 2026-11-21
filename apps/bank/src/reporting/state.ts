import { initialReportingState, type GeneratedReportOutput, type RecurringReportSchedule, type ReportDefinition, type ReportRun, type ReportingState } from "./types";
import type { ReportConfiguration } from "./configuration";

export type ReportingAction =
  | Readonly<{ type: "report-generated"; definition: ReportDefinition; run: ReportRun; output: GeneratedReportOutput }>
  | Readonly<{ type: "schedule-created"; definition: ReportDefinition; schedule: RecurringReportSchedule }>
  | Readonly<{ type: "schedule-confirmation-consumed"; scheduleId: string }>
  | Readonly<{ type: "assisted-configuration-prepared"; configuration: ReportConfiguration }>
  | Readonly<{ type: "assisted-configuration-consumed" }>;

export function createReportingState(): ReportingState { return { ...initialReportingState, definitions: [], runs: [], outputs: [], schedules: [], latestCreatedScheduleId: undefined }; }
export function reportingReducer(state: ReportingState, action: ReportingAction): ReportingState {
  if (action.type === "assisted-configuration-prepared") return { ...state, assistedConfiguration: cloneConfiguration(action.configuration) };
  if (action.type === "assisted-configuration-consumed") return state.assistedConfiguration ? { ...state, assistedConfiguration: undefined } : state;
  if (action.type === "schedule-confirmation-consumed") return state.latestCreatedScheduleId === action.scheduleId ? { ...state, latestCreatedScheduleId: undefined } : state;
  if (state.definitions.some(definition => definition.id === action.definition.id)) return state;
  if (action.type === "report-generated") return { ...state, definitions: [action.definition, ...state.definitions], runs: [action.run, ...state.runs], outputs: [action.output, ...state.outputs] };
  return { ...state, definitions: [action.definition, ...state.definitions], schedules: [action.schedule, ...state.schedules], latestCreatedScheduleId: action.schedule.id };
}

function cloneConfiguration(configuration: ReportConfiguration): ReportConfiguration {
  return { ...configuration, selectedAccountIds: [...configuration.selectedAccountIds], period: { ...configuration.period }, filters: { ...configuration.filters }, schedule: { ...configuration.schedule } };
}
