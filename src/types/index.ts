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

export type SwotCategory = 'Strength' | 'Weakness' | 'Opportunity' | 'Threat';
export type StrategicOptionType = 'SO' | 'ST' | 'WO' | 'WT';
export type AnalysisSourceType = 'pestels' | 'evidence' | 'stakeholder' | 'profile';

export interface AnalysisSourceReference {
  type: AnalysisSourceType;
  id: string;
}

export interface SwotFinding {
  id: string;
  reference: string;
  category: SwotCategory;
  finding: string;
  cbdImplication: string;
  sourceReferences: AnalysisSourceReference[];
  confidence: number | null;
  verificationNote: string;
}

export interface StrategicOption {
  id: string;
  reference: string;
  type: StrategicOptionType;
  swotFindingIds: string[];
  option: string;
  planningNote: string;
}

export interface AnalysisSynthesis {
  swotFindings: SwotFinding[];
  strategicOptions: StrategicOption[];
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
  indicators: Array<string | PlanningIndicator>; // Legacy strings normalize to canonical structured records.
  resultsPlan?: ResultsPlan;
  drivers: string[];
  stakeholders: string[];
  risks: string;
  sequencing: string;
  confidence: number;  // 1 to 5
  priorityScore: number; // Legacy 1 to 5 impact value retained for imported workspaces
  impact?: number; // 1 to 5
  urgency?: number; // 1 to 5
  feasibility?: number; // 1 to 5
  riskRating?: number; // 1 to 5 (named riskRating to avoid conflicts with 'risks' string)
  stakeholderSupport?: number; // 1 to 5
  mandateRelevance?: number; // 1 to 5
  result: string;
  engagement: string;
  evidenceNotes?: EvidenceNote[];
  capacityProblem: string;
  planningObjective: string;
  leadStakeholderId: string | null;
  supportingStakeholderIds: string[];
  implementationPhase: 'NOW' | 'NEXT' | 'LATER' | null;
  milestoneTimeframe: string;
  strategicOptionIds?: string[];
}

export type InterventionLevel = 'individual' | 'organizational' | 'environment';
export interface ResultOutput { id: string; reference: string; statement: string; interventionLevels: InterventionLevel[]; note: string }
export interface ResultActivity {
  id: string; reference: string; statement: string; interventionLevel: InterventionLevel | null;
  outputIds: string[]; implementingActorId: string | null; supportingActorIds: string[];
  timeframe: string; milestone: string; dependencyIds: string[]; resourceIds: string[];
}
export interface PlanningIndicator {
  id: string; statement: string;
  resultLevel: 'Intended Result / Outcome' | 'Output' | 'Activity / Process' | 'Not assigned';
  linkedRecordId: string | null; baseline: string; target: string; verification: string;
  frequency: 'One-time' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Semi-annual' | 'Annual' | 'At milestone' | 'Other' | 'Not assigned';
  responsibleActorId: string | null; disaggregation: string; note: string;
}
export interface ResultAssumption { id: string; statement: string; importance: 'Critical' | 'Important' | 'Contextual' | 'Not assessed'; reviewNote: string }
export interface ResultDependency {
  id: string; type: 'Activity' | 'CBD priority' | 'Policy approval' | 'Stakeholder action' | 'External condition' | 'Other';
  statement: string; linkedPriorityKey: string | null; linkedRecordId: string | null;
  status: 'Required' | 'In progress' | 'Met' | 'Uncertain' | 'Not assessed';
}
export interface ResourceRequirement {
  id: string; category: 'Human Resources' | 'Financial' | 'Logistics / Equipment' | 'Technical' | 'Training / Expertise' | 'Policy / Administrative' | 'Other';
  statement: string; availability: 'Available' | 'Partially available' | 'Not available' | 'Unknown';
}
export interface ResultsPlan {
  schemaVersion: 1;
  outputs: ResultOutput[]; activities: ResultActivity[]; assumptions: ResultAssumption[];
  changeLogic: { interventionLevels: InterventionLevel[]; activityIds: string[]; because: string; assumptionIds: string[] };
  dependencies: ResultDependency[]; resources: ResourceRequirement[];
  riskManagement: { mitigation: string; responsibleActorId: string | null; reviewNote: string };
  ownership: { counterpartActorId: string | null; status: 'Not yet assessed' | 'Not consulted' | 'Consulted' | 'Supports' | 'Supports with conditions' | 'Concerns / resistance identified' | 'Not applicable'; note: string };
  sustainability: Array<{ id: string; dimension: string; requirement: string }>;
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
  analysisSynthesis: AnalysisSynthesis;
  version: string;
}
