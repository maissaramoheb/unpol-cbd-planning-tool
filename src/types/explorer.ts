export type MissionExplorerStatus =
  | 'active'
  | 'historical'
  | 'verification-required'
  | 'template'
  | 'custom';

export interface MissionExplorerEntry {
  id: string;
  country: string;
  iso3: string;
  region: string;
  coordinates: { x: number; y: number }; // Legacy seed metadata retained for compatibility; the map uses projected longitude/latitude positions.
  missionName: string;
  missionAcronym: string;
  missionType: string;
  status: MissionExplorerStatus;
  isFictionalScenario: boolean;
  isOfficial: boolean;
  sourceDate: string | null;
  profileLastReviewed: string | null;
  sourceNote: string;
  disclaimer: string;
  hostStatePoliceInstitution: string;
  planningPurpose: string;
  planningThemes: string[];
  starterProfile: {
    mandateEnvironment: string;
    conflictContext: string;
    planningPurpose: string;
  };
  starterPestelsPrompts: Record<
    string,
    {
      prompt: string;
      whyPrompt: string;
    }
  >;
  starterStakeholderPrompts: Array<{
    category: string;
    rolePrompt: string;
    suggestedStakeholders: string[];
  }>;
  suggestedStakeholderCategories: string[];
}
