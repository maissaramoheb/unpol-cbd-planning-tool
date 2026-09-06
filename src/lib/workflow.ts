export interface WorkflowCompletionState {
  isProfileEmpty: boolean;
  isPestelsEmpty: boolean;
  isStakeholdersEmpty: boolean;
  isCustomCellsEmpty: boolean;
  isSequencingEmpty: boolean;
}

export const HOME_VIEW = 0;
export const EXPORT_VIEW = 8;

export const WORKFLOW_STAGES = [
  { id: 1, label: 'Context & Mandate', sub: 'Planning Context' },
  { id: 2, label: 'Diagnostic Analysis', sub: 'Context & Evidence' },
  { id: 3, label: 'Stakeholders & Ownership', sub: 'Actors & Ownership' },
  { id: 4, label: 'Analysis Synthesis', sub: 'SWOT & Strategic Options' },
  { id: 5, label: 'CBD Priorities', sub: 'Capacity Problems & Responses' },
  { id: 6, label: 'Prioritization & Sequencing', sub: 'Implementation Path' },
  { id: 7, label: 'Results & Implementation', sub: 'Results & Delivery' }
] as const;

export type WorkflowStage = (typeof WORKFLOW_STAGES)[number]['id'];

export function isWorkflowStage(view: number): view is WorkflowStage {
  return WORKFLOW_STAGES.some(stage => stage.id === view);
}

/** Documents the conceptual v0.5 navigation migration. Navigation was not persisted. */
export function mapV05StepToView(step: number, synthesisSubview = false): number {
  if (step === 1) return HOME_VIEW;
  if (step === 2) return 1;
  if (step === 3) return 2;
  if (step === 4) return synthesisSubview ? 4 : 3;
  if (step === 5) return 5;
  if (step === 6) return 6;
  if (step === 7) return EXPORT_VIEW;
  return HOME_VIEW;
}

export function getDashboardContinueStep(state: WorkflowCompletionState): number {
  if (state.isProfileEmpty) return 1;
  if (state.isPestelsEmpty) return 2;
  if (state.isStakeholdersEmpty) return 3;
  if (state.isCustomCellsEmpty) return 5;
  if (state.isSequencingEmpty) return 6;
  return 7;
}
