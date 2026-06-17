import { UnpolProjectData, MissionProfile, Stakeholder } from '../types';
import { defaultPestelsData } from '../data/pestelsCategories';
import { defaultStakeholders } from '../data/defaultStakeholders';
import { customCells } from '../data/cbdMatrixData';
import { defaultMissionTemplates } from '../data/defaultMissionTemplates';
import { validateAndNormalizeProjectData } from './projectDataValidation';
import { APP_VERSION } from './version';

const STORAGE_KEY = 'unpol_planning_tool_project_data';

export interface ProjectDataLoadResult {
  data: UnpolProjectData;
  recoveryMessage: string | null;
}

export const emptyPriorityBrief = {
  topPriorities: [
    '[PROMPT] Identify whether command-authority coordination should be a top priority.',
    '[PROMPT] Assess whether records and case-tracking workflows require priority support.',
    '[PROMPT] Determine whether community safety and gender liaison mechanisms are appropriate.'
  ],
  quickWins: [
    '[PROMPT] Test whether basic ledger-formatting support is feasible and low risk.',
    '[PROMPT] Assess whether community-engagement activities qualify as safe quick wins.'
  ],
  sensitiveReforms: [
    '[ASSUMPTION TO TEST] Command-authority clarification may require political cover.',
    '[ASSUMPTION TO TEST] Independent complaints mechanisms may face institutional resistance.'
  ],
  longerTermReforms: [
    '[PROMPT] Verify whether police-law reform is required and appropriately sequenced.',
    '[PROMPT] Assess the sustainability of training infrastructure and instructor development.'
  ],
  risksAssumptions: [
    '[ASSUMPTION TO TEST] Counterpart political support will remain sufficient for reform.',
    '[ASSUMPTION TO TEST] Security conditions will permit planned advisory activities.',
    '[ASSUMPTION TO TEST] Funding will remain aligned with verified capacity priorities.'
  ],
  sequencingRecommendation: '[PROMPT] Validate whether high-feasibility, low-risk administrative or engagement actions should precede sensitive legal and accountability reforms.'
};

export const defaultProfile: MissionProfile = {
  countryName: 'Country / area to verify',
  missionName: 'UN peace operations planning context',
  region: 'Area of operations to verify',
  mandateEnvironment: '[PROMPT] Confirm the current mandate and authorized advisory role.',
  hostStatePolice: 'Host-state police institution to verify',
  conflictContext: '[ASSUMPTION TO TEST] Identify the conflict and public-safety conditions relevant to planning.',
  planningPurpose: '[PROMPT] Define the intended capacity-building planning purpose.',
  assessmentDate: new Date().toISOString().split('T')[0],
  analystName: 'Lt.Col Maissara Selim',
  templateId: 'peacekeeping',
  sourceCategory: null,
  coverageScope: null,
  sourceUrl: null,
  sourceDate: null,
  profileLastReviewed: null
};

export function getInitialProjectData(templateId = 'peacekeeping'): UnpolProjectData {
  const template = defaultMissionTemplates.find(t => t.id === templateId) || defaultMissionTemplates[0];

  const profile: MissionProfile = {
    ...defaultProfile,
    countryName: template.profileDefaults.countryName,
    missionName: template.profileDefaults.missionName,
    region: template.profileDefaults.region,
    mandateEnvironment: template.profileDefaults.mandateEnvironment,
    hostStatePolice: template.profileDefaults.hostStatePolice,
    conflictContext: template.profileDefaults.conflictContext,
    planningPurpose: template.profileDefaults.planningPurpose,
    assessmentDate: new Date().toISOString().split('T')[0],
    templateId: templateId,
    sourceCategory: null,
    coverageScope: null,
    sourceUrl: null,
    sourceDate: null,
    profileLastReviewed: null
  };

  // Clone default PESTEL-S and apply overrides
  const pestels = JSON.parse(JSON.stringify(defaultPestelsData));
  if (template.pestelsOverrides) {
    Object.keys(template.pestelsOverrides).forEach(key => {
      if (pestels[key] && template.pestelsOverrides) {
        const overrides = template.pestelsOverrides[key];
        if (overrides) {
          pestels[key] = {
            ...pestels[key],
            ...overrides,
            rating: {
              ...pestels[key].rating,
              ...(overrides.rating || {})
            }
          };
        }
      }
    });
  }

  const isBlank = templateId === 'blank';

  const finalCells = JSON.parse(JSON.stringify(isBlank ? {} : customCells));
  Object.keys(finalCells).forEach(key => {
    const cell = finalCells[key];
    if (cell.feasibility === undefined) cell.feasibility = 3;
    if (cell.riskRating === undefined) cell.riskRating = 3;
    if (cell.stakeholderSupport === undefined) cell.stakeholderSupport = 3;
    cell.evidenceNotes = [];
  });

  const finalStakeholders = JSON.parse(JSON.stringify(isBlank ? [] : defaultStakeholders));
  finalStakeholders.forEach((s: Stakeholder) => {
    s.evidenceNotes = [];
  });

  const finalPestels = JSON.parse(JSON.stringify(pestels));
  Object.keys(finalPestels).forEach(key => {
    finalPestels[key].evidenceNotes = [];
  });

  return {
    profile,
    pestels: finalPestels,
    stakeholders: finalStakeholders,
    customCells: finalCells,
    priorityBrief: isBlank
      ? {
          topPriorities: [],
          quickWins: [],
          sensitiveReforms: [],
          longerTermReforms: [],
          risksAssumptions: [],
          sequencingRecommendation: ''
        }
      : JSON.parse(JSON.stringify(emptyPriorityBrief)),
    version: APP_VERSION
  };
}

export function loadProjectData(): ProjectDataLoadResult {
  if (typeof window === 'undefined') {
    return { data: getInitialProjectData('blank'), recoveryMessage: null };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialProjectData('blank');
      saveProjectData(initial);
      return { data: initial, recoveryMessage: null };
    }
    const validation = validateAndNormalizeProjectData(JSON.parse(raw));
    if (!validation.data) {
      const initial = getInitialProjectData('blank');
      return {
        data: initial,
        recoveryMessage: `Stored project data was invalid and has been replaced with a safe blank workspace. ${validation.error}`
      };
    }

    return { data: validation.data, recoveryMessage: null };
  } catch (error) {
    console.error('Error loading project data from localStorage', error);
    return {
      data: getInitialProjectData('blank'),
      recoveryMessage: 'Stored project data could not be read and has been replaced with a safe blank workspace.'
    };
  }
}

export function saveProjectData(data: UnpolProjectData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving project data to localStorage', error);
  }
}

export function clearProjectData(templateId = 'blank'): UnpolProjectData {
  const initial = getInitialProjectData(templateId);
  saveProjectData(initial);
  return initial;
}

export function exportProjectData(data: UnpolProjectData): void {
  if (typeof window === 'undefined') return;

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `UNPOL_CBD_Plan_${data.profile.countryName.replace(/[^a-z0-9]/gi, '_')}_${dateStr}.json`;

  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importProjectData(file: File): Promise<UnpolProjectData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const validation = validateAndNormalizeProjectData(parsed);
        if (!validation.data) {
          reject(new Error(`Invalid project file. ${validation.error}`));
          return;
        }

        resolve(validation.data);
      } catch {
        reject(new Error('Failed to parse JSON file.'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file.'));
    reader.readAsText(file);
  });
}
