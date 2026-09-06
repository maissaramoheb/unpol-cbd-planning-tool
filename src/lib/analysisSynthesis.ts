import type {
  AnalysisSourceReference,
  AnalysisSynthesis,
  StrategicOption,
  StrategicOptionType,
  SwotCategory,
  SwotFinding,
  UnpolProjectData
} from '../types';

export const EMPTY_ANALYSIS_SYNTHESIS: AnalysisSynthesis = {
  swotFindings: [],
  strategicOptions: []
};

export const SWOT_CATEGORIES: SwotCategory[] = ['Strength', 'Weakness', 'Opportunity', 'Threat'];
export const STRATEGIC_OPTION_TYPES: StrategicOptionType[] = ['SO', 'ST', 'WO', 'WT'];

export const SWOT_CATEGORY_PREFIX: Record<SwotCategory, string> = {
  Strength: 'S',
  Weakness: 'W',
  Opportunity: 'O',
  Threat: 'T'
};

export const OPTION_COMBINATIONS: Record<StrategicOptionType, readonly [SwotCategory, SwotCategory]> = {
  SO: ['Strength', 'Opportunity'],
  ST: ['Strength', 'Threat'],
  WO: ['Weakness', 'Opportunity'],
  WT: ['Weakness', 'Threat']
};

export function nextReference(prefix: string, existingReferences: string[]): string {
  const used = new Set(existingReferences);
  let number = 1;
  while (used.has(`${prefix}${String(number).padStart(2, '0')}`)) number += 1;
  return `${prefix}${String(number).padStart(2, '0')}`;
}

export function isValidStrategicOptionCombination(option: StrategicOption, findings: SwotFinding[]): boolean {
  const required = OPTION_COMBINATIONS[option.type];
  const linkedCategories = option.swotFindingIds
    .map(id => findings.find(item => item.id === id)?.category)
    .filter((category): category is SwotCategory => Boolean(category));
  return required.every(category => linkedCategories.includes(category)) &&
    linkedCategories.every(category => required.includes(category));
}

export function collectValidSourceKeys(data: Pick<UnpolProjectData, 'profile' | 'pestels' | 'stakeholders' | 'customCells'>): Set<string> {
  const keys = new Set<string>();
  Object.keys(data.pestels).forEach(id => keys.add(`pestels:${id}`));
  data.stakeholders.forEach(item => keys.add(`stakeholder:${item.id}`));
  const profileFields = ['countryName', 'missionName', 'region', 'mandateEnvironment', 'hostStatePolice', 'conflictContext', 'planningPurpose'];
  profileFields.forEach(id => keys.add(`profile:${id}`));
  Object.values(data.pestels).forEach(item => item.evidenceNotes?.forEach(note => keys.add(`evidence:${note.id}`)));
  data.stakeholders.forEach(item => item.evidenceNotes?.forEach(note => keys.add(`evidence:${note.id}`)));
  Object.values(data.customCells).forEach(item => item.evidenceNotes?.forEach(note => keys.add(`evidence:${note.id}`)));
  return keys;
}

export function sourceReferenceKey(reference: AnalysisSourceReference): string {
  return `${reference.type}:${reference.id}`;
}

export interface AnalysisSourceCandidate {
  reference: AnalysisSourceReference;
  label: string;
  text: string;
  group: string;
}

export function getAnalysisSourceCandidates(data: Pick<UnpolProjectData, 'profile' | 'pestels' | 'stakeholders' | 'customCells'>): AnalysisSourceCandidate[] {
  const candidates: AnalysisSourceCandidate[] = [];
  Object.values(data.pestels).forEach(item => {
    if (item.finding.trim()) candidates.push({ reference: { type: 'pestels', id: item.id }, label: `PESTEL-S · ${item.name}`, text: item.finding, group: 'PESTEL-S findings' });
    item.evidenceNotes?.forEach(note => candidates.push({ reference: { type: 'evidence', id: note.id }, label: `Evidence · ${note.sourceTitle}`, text: note.comment || note.sourceTitle, group: 'Evidence notes' }));
  });
  data.stakeholders.forEach(item => {
    candidates.push({ reference: { type: 'stakeholder', id: item.id }, label: `Stakeholder · ${item.name}`, text: [item.role, item.risk].filter(Boolean).join(' '), group: 'Stakeholders' });
    item.evidenceNotes?.forEach(note => candidates.push({ reference: { type: 'evidence', id: note.id }, label: `Evidence · ${note.sourceTitle}`, text: note.comment || note.sourceTitle, group: 'Evidence notes' }));
  });
  Object.values(data.customCells).forEach(item => item.evidenceNotes?.forEach(note => candidates.push({ reference: { type: 'evidence', id: note.id }, label: `Evidence · ${note.sourceTitle}`, text: note.comment || note.sourceTitle, group: 'Evidence notes' })));
  const profileEntries: Array<[keyof UnpolProjectData['profile'], string]> = [
    ['mandateEnvironment', 'Profile · Mandate environment'],
    ['hostStatePolice', 'Profile · Police institution'],
    ['conflictContext', 'Profile · Conflict context'],
    ['planningPurpose', 'Profile · Planning purpose']
  ];
  profileEntries.forEach(([id, label]) => {
    const value = String(data.profile[id] ?? '').trim();
    if (value) candidates.push({ reference: { type: 'profile', id }, label, text: value, group: 'Profile context' });
  });
  return candidates.filter((candidate, index, all) => all.findIndex(item => sourceReferenceKey(item.reference) === sourceReferenceKey(candidate.reference)) === index);
}

export function resolveSourceReference(reference: AnalysisSourceReference, data: Pick<UnpolProjectData, 'profile' | 'pestels' | 'stakeholders' | 'customCells'>): AnalysisSourceCandidate | null {
  return getAnalysisSourceCandidates(data).find(candidate => sourceReferenceKey(candidate.reference) === sourceReferenceKey(reference)) ?? null;
}

export function removeSwotFinding(data: UnpolProjectData, findingId: string): UnpolProjectData {
  const options = data.analysisSynthesis.strategicOptions
    .map(option => ({ ...option, swotFindingIds: option.swotFindingIds.filter(id => id !== findingId) }));
  return {
    ...data,
    analysisSynthesis: {
      swotFindings: data.analysisSynthesis.swotFindings.filter(item => item.id !== findingId),
      strategicOptions: options
    }
  };
}

export function removeStrategicOption(data: UnpolProjectData, optionId: string): UnpolProjectData {
  return {
    ...data,
    analysisSynthesis: {
      ...data.analysisSynthesis,
      strategicOptions: data.analysisSynthesis.strategicOptions.filter(item => item.id !== optionId)
    },
    customCells: Object.fromEntries(Object.entries(data.customCells).map(([key, cell]) => [
      key,
      { ...cell, strategicOptionIds: (cell.strategicOptionIds ?? []).filter(id => id !== optionId) }
    ]))
  };
}
