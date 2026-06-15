import { UnpolProjectData, MissionProfile } from '../types';
import { defaultPestelsData } from '../data/pestelsCategories';
import { defaultStakeholders } from '../data/defaultStakeholders';
import { customCells } from '../data/cbdMatrixData';
import { defaultMissionTemplates } from '../data/defaultMissionTemplates';

const STORAGE_KEY = 'unpol_planning_tool_project_data';

export const emptyPriorityBrief = {
  topPriorities: [
    'Establish foundational coordination with Ministry and Police HQ on command authority.',
    'Build reliable records and case tracking administrative SOPs.',
    'Formulate community safety and gender advisory liaison panels.'
  ],
  quickWins: [
    'Launch basic ledger formatting workshops at local police districts.',
    'Conduct joint patrols with community representatives in urban centers.'
  ],
  sensitiveReforms: [
    'Clarify command authority and political interference boundaries with Ministry.',
    'Roll out independent complaints intake mechanisms managed by Civil Society.'
  ],
  longerTermReforms: [
    'Update general Police Act in coordination with Justice and Ministry actors.',
    'Establish regional training academy infrastructure and certified instructor pool.'
  ],
  risksAssumptions: [
    'Assumes continuous political buy-in and counterpart willingness to reform.',
    'Assumes minimum physical security and stability in key districts to allow UNPOL co-location.',
    'Assumes donor funding remains aligned with the prioritized capacity areas.'
  ],
  sequencingRecommendation: 'Begin with high-feasibility, low-risk administrative systems and local community engagement to establish trust, then leverage this credibility to tackle legal frameworks and institutional accountability mechanisms.'
};

export const defaultProfile: MissionProfile = {
  countryName: 'South Sudan / Abyei Area',
  missionName: 'UNISFA / UNMISS',
  region: 'Abyei Box / Greater Upper Nile',
  mandateEnvironment: 'Chapter VII, Protection of Civilians, Capacity Building Advisory, Co-location support',
  hostStatePolice: 'Host-State Police Service (SPS / APS)',
  conflictContext: 'Inter-communal violence, seasonal migration disputes, presence of armed militias',
  planningPurpose: 'Align UNPOL co-location mentoring and training with structural policing capacity building',
  assessmentDate: new Date().toISOString().split('T')[0],
  analystName: 'Lt.Col Maissara Selim',
  templateId: 'peacekeeping'
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
    templateId: templateId
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

  return {
    profile,
    pestels,
    stakeholders: isBlank ? [] : JSON.parse(JSON.stringify(defaultStakeholders)),
    customCells: isBlank ? {} : JSON.parse(JSON.stringify(customCells)),
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
    version: '1.0'
  };
}

export function loadProjectData(): UnpolProjectData {
  if (typeof window === 'undefined') {
    return getInitialProjectData();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialProjectData();
      saveProjectData(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error loading project data from localStorage', error);
    return getInitialProjectData();
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

export function clearProjectData(templateId = 'peacekeeping'): UnpolProjectData {
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
        if (parsed.profile && parsed.pestels && parsed.stakeholders) {
          resolve(parsed as UnpolProjectData);
        } else {
          reject(new Error('Invalid project file format. Missing core fields.'));
        }
      } catch {
        reject(new Error('Failed to parse JSON file.'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file.'));
    reader.readAsText(file);
  });
}
