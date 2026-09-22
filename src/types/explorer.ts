export type MissionExplorerStatus =
  | 'active'
  | 'historical'
  | 'verification-required'
  | 'template'
  | 'custom';

export type MissionSourceCategory =
  | 'Current UN Peacekeeping Operation'
  | 'Special Political Mission'
  | 'Regional Political Presence'
  | 'Peacebuilding / Support Context'
  | 'Fictional Training Scenario'
  | 'Custom User Context';

export type MissionCoverageScope =
  | 'current-peacekeeping-reference'
  | 'selected-starter'
  | 'training'
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
  sourceCategory: MissionSourceCategory;
  coverageScope: MissionCoverageScope;
  status: MissionExplorerStatus;
  isFictionalScenario: boolean;
  isOfficial: boolean;
  sourceDate: string | null;
  profileLastReviewed: string | null;
  sourceUrl: string | null;
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

// ============================================================================
// Canonical PlanningContext v2 Architecture
// ============================================================================

export type ContextOperationalStatus =
  | 'active'
  | 'transition'
  | 'historical'
  | 'fictional'
  | 'custom';

export type ContextVerificationStatus =
  | 'current-reference'
  | 'review-required'
  | 'training-only'
  | 'custom';

export type ContextSourceType =
  | 'un-mandate'
  | 'un-report'
  | 'official-portal'
  | 'training-material'
  | 'academic'
  | 'other';

export interface ContextSource {
  id: string;
  title: string;
  organization: string;
  sourceType: ContextSourceType;
  url: string | null;
  publicationDate: string | null;
  reviewedDate: string | null;
  supports: string[];
}

export interface ContextGeography {
  longitude: number;
  latitude: number;
  labelOffset: {
    x: number;
    y: number;
  };
}

export interface ContextIdentity {
  countryArea: string;
  iso3: string | null;
  region: string;
  missionName: string;
  missionAcronym: string;
  missionType: string;
  sourceCategory: MissionSourceCategory;
}

export interface ContextProvenance {
  sources: ContextSource[];
  profileLastReviewed: string | null;
  coverageScope: MissionCoverageScope;
  limitations: string[];
}

export interface ContextReferenceStatement {
  text: string;
  sourceIds: string[];
}

export interface ContextReferenceInfo {
  mandateSummary: ContextReferenceStatement;
  policeRelevance: ContextReferenceStatement;
  hostStatePolice: ContextReferenceStatement;
  planningThemes: string[];
}

export interface ContextPlanningPrompts {
  stage1Guidance: {
    mandateEnvironmentPrompt?: string;
    conflictContextPrompt?: string;
    planningPurposePrompt?: string;
  };
  pestelsPrompts: Record<
    string,
    {
      prompt: string;
      whyPrompt: string;
    }
  >;
  stakeholderPrompts: Array<{
    category: string;
    rolePrompt: string;
    suggestedStakeholders: string[];
  }>;
  suggestedStakeholderCategories: string[];
}

export interface ContextScenarioNarrative {
  mandateEnvironment?: string;
  conflictContext?: string;
  planningPurpose?: string;
}

export interface PlanningContext {
  schemaVersion: 2;
  id: string;
  legacyIds: string[];
  identity: ContextIdentity;
  operationalStatus: ContextOperationalStatus;
  verificationStatus: ContextVerificationStatus;
  geography?: ContextGeography;
  provenance: ContextProvenance;
  reference: ContextReferenceInfo;
  planningPrompts: ContextPlanningPrompts;
  scenarioNarrative?: ContextScenarioNarrative;
}
