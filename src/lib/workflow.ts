export interface WorkflowCompletionState {
  isProfileEmpty: boolean;
  isPestelsEmpty: boolean;
  isStakeholdersEmpty: boolean;
  isCustomCellsEmpty: boolean;
}

export function getDashboardContinueStep(state: WorkflowCompletionState): number {
  if (state.isProfileEmpty) return 2;
  if (state.isPestelsEmpty) return 3;
  if (state.isStakeholdersEmpty) return 4;
  if (state.isCustomCellsEmpty) return 5;
  return 6;
}
