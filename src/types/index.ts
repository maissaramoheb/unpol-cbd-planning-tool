import type { MissionCoverageScope, MissionSourceCategory } from './explorer';

export interface MissionProfile {
  countryName: string;
  missionName: string;
  region: string;
  mandateEnvironment: string;
  hostStatePolice: string;
  conflictContext: string;
  planningPurpose: string;
  assessmentDate: string;
  analystName: string;
  templateId: string;
  sourceCategory: MissionSourceCategory | null;
  coverageScope: MissionCoverageScope | null;
  sourceUrl: string | null;
  sourceDate: string | null;
  profileLastReviewed: string | null;
}

export interface PestelsRating {
  impact: number;      // 1 to 5
  urgency: number;     // 1 to 5
  confidence: number;  // 1 to 5
  relevance: number;   // 1 to 5
}

export type EvidenceSourceType =
  | 'UN Mandate / Security Council Resolution'
  | 'UN / Mission Report'
  | 'Host-State Law / Policy'
  | 'Human Rights / OHCHR Source'
  | 'Police / Justice Institution Document'
  | 'Workshop Input'
  | 'Field Observation'
  | 'Interview / Consultation'
  | 'Academic / Research Source'
  | 'Analyst Judgment'
  | 'Other';

export interface EvidenceNote {
  id: string;
  sourceTitle: string;
  sourceType: EvidenceSourceType;
  dateVerified: string;
  confidenceLevel: number; // 1 to 5
  comment: string;
}

export interface PestelsItem {
  id: string; // political, economic, social, technological, environmental, legal, security
  name: string;
  definition: string;
  finding: string;
  why: string;
  cbdAreas: string[];
  dimensions: string[];
  stakeholders: string[];
  sequencing: string;
  rating: PestelsRating;
  evidenceNotes?: EvidenceNote[];
}

export type StakeholderPosition = 'Enabler' | 'Persuadable' | 'Blocker' | 'Spoiler risk' | 'Neutral / unknown';
export type RatingLevel = 'High' | 'Medium' | 'Low';
export type CapacityLevel = RatingLevel | 'Variable';

export interface Stakeholder {
  id: string;
  name: string;
  category: string;
  role: string;
  authority: string;
  influence: RatingLevel;
  position: StakeholderPosition;
  legitimacy: RatingLevel;
  relevance: RatingLevel;
  capacity: CapacityLevel;
  risk: string;
  entry: string;
  engagement: string;
  cbdAreas: string[];
  isCustom?: boolean;
  evidenceNotes?: EvidenceNote[];
}

export interface CbdCell {
  key: string; // "RowName|ColName"
  why: string;
  individual: string;
  organizational: string;
  environment: string;
  indicators: string[];
  drivers: string[];
  stakeholders: string[];
  risks: string;
  sequencing: string;
  confidence: number;  // 1 to 5
  priorityScore: number; // 1 to 5
  feasibility?: number; // 1 to 5
  riskRating?: number; // 1 to 5 (named riskRating to avoid conflicts with 'risks' string)
  stakeholderSupport?: number; // 1 to 5
  result: string;
  engagement: string;
  evidenceNotes?: EvidenceNote[];
}

export interface CbdAxis {
  id: string;
  name: string;
  definition: string;
}

export interface PriorityBrief {
  topPriorities: string[];
  quickWins: string[];
  sensitiveReforms: string[];
  longerTermReforms: string[];
  risksAssumptions: string[];
  sequencingRecommendation: string;
}

export interface UnpolProjectData {
  profile: MissionProfile;
  pestels: Record<string, PestelsItem>;
  stakeholders: Stakeholder[];
  customCells: Record<string, CbdCell>;
  priorityBrief: PriorityBrief;
  version: string;
}
