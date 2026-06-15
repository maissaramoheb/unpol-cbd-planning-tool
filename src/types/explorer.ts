export type MissionExplorerStatus = 'active' | 'historical' | 'template' | 'custom';

export interface MissionExplorerEntry {
  id: string;
  country: string;
  iso3: string;
  region: string;
  coordinates: { x: number; y: number }; // Plotting grid percentages (0 to 100) on a 2D flat SVG map
  missionName: string;
  missionAcronym: string;
  missionType: string;
  status: MissionExplorerStatus;
  isFictionalScenario: boolean;
  isOfficial: boolean;
  lastReviewed: string;
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
