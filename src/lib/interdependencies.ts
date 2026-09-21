import type { Interdependency, UnpolProjectData } from '../types';
import { PESTELS_KEYS } from '../data/pestelsCategories';

export const CBD_EFFECTS = ['Enabling', 'Constraining', 'Mixed', 'Contextual / Indirect', 'Not assessed'] as const;
export const PLANNING_SIGNIFICANCE = ['High', 'Medium', 'Low', 'Not assessed'] as const;
export const INTERDEPENDENCY_GUIDANCE = 'Focus on relationships that could materially affect how CBD is designed, prioritized, sequenced or implemented. Exhaustive analysis of every PESTEL-S combination is neither required nor expected.';
export const INTERDEPENDENCY_CAUTION = 'Underlying findings may be evidence-supported while the relationship itself remains an analyst’s professional judgement. Recorded relationships do not establish causality or predict outcomes.';
export type InterdependencyContext = Pick<UnpolProjectData, 'pestels'> & Partial<Pick<UnpolProjectData, 'interdependencies'>>;
export const dimensionName = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);

export function resolveInterdependencyFinding(data: InterdependencyContext, id: string | null) {
  const key = PESTELS_KEYS.find(key => data.pestels[key]?.id === id);
  const finding = key ? data.pestels[key] : undefined;
  return key && finding?.finding.trim() ? { key, finding } : null;
}

export function interdependencyIssues(data: InterdependencyContext, item: Interdependency): string[] {
  const source = resolveInterdependencyFinding(data, item.sourceFindingId);
  const target = resolveInterdependencyFinding(data, item.targetFindingId);
  return [
    ...(!source ? ['Source finding missing — relink or delete this interdependency.'] : []),
    ...(!target ? ['Target finding missing — relink or delete this interdependency.'] : []),
    ...(source && target && source.key === target.key ? ['Source and target must be different PESTEL-S records.'] : []),
    ...(!item.relationship.trim() ? ['Relationship statement is required.'] : [])
  ];
}

export const isValidInterdependency = (data: InterdependencyContext, item: Interdependency) => interdependencyIssues(data, item).length === 0;

export function mainBriefSelectionError(data: InterdependencyContext): string | null {
  return (data.interdependencies ?? []).filter(item => item.isKeyInsight && item.includeInMainBrief && isValidInterdependency(data, item)).length > 5
    ? 'At most five active valid interdependencies may be included in the main brief. Deselect one before selecting or repairing another.' : null;
}

export function interdependencyMap(data: InterdependencyContext) {
  return PESTELS_KEYS.flatMap(from => PESTELS_KEYS.filter(to => to !== from).map(to => ({ from, to,
    relationships: (data.interdependencies ?? []).filter(item => isValidInterdependency(data, item) && resolveInterdependencyFinding(data, item.sourceFindingId)?.key === from && resolveInterdependencyFinding(data, item.targetFindingId)?.key === to)
  })));
}

export function existingEvidence(data: Pick<UnpolProjectData, 'pestels' | 'stakeholders' | 'customCells'>) {
  const notes = [
    ...Object.values(data.pestels).flatMap(item => item.evidenceNotes ?? []),
    ...data.stakeholders.flatMap(item => item.evidenceNotes ?? []),
    ...Object.values(data.customCells).flatMap(item => item.evidenceNotes ?? [])
  ];
  return notes.filter((note, index) => notes.findIndex(other => other.id === note.id) === index);
}

/** Clean only XI-owned references. Never rewrite the seven underlying diagnostic records. */
export function normalizeInterdependencies(data: UnpolProjectData): UnpolProjectData {
  const ids = new Set(PESTELS_KEYS.map(key => data.pestels[key]?.id).filter(Boolean));
  const evidence = new Set(existingEvidence(data).map(note => note.id));
  const interdependencies = (data.interdependencies ?? []).map(item => ({ ...item,
    sourceFindingId: item.sourceFindingId && ids.has(item.sourceFindingId) ? item.sourceFindingId : null,
    targetFindingId: item.targetFindingId && ids.has(item.targetFindingId) ? item.targetFindingId : null,
    evidenceIds: item.evidenceIds.filter(id => evidence.has(id))
  }));
  const validIds = new Set(interdependencies.filter(item => isValidInterdependency(data, item)).map(item => item.id));
  return { ...data, interdependencies, analysisSynthesis: { ...data.analysisSynthesis,
    swotFindings: data.analysisSynthesis.swotFindings.map(item => ({ ...item,
      sourceReferences: item.sourceReferences.filter(ref => ref.type !== 'interdependency' || validIds.has(ref.id))
    }))
  } };
}

export function validateInterdependencies(value: unknown): boolean {
  if (!Array.isArray(value)) return false;
  const ids = new Set<string>(), references = new Set<string>();
  return value.every(item => {
    if (!item || typeof item !== 'object') return false;
    if (!['id', 'reference', 'relationship', 'cbdImplication', 'analyticalNote'].every(key => typeof item[key] === 'string')) return false;
    if (!item.id.trim() || !/^XI-\d{2,}$/.test(item.reference) || !item.relationship.trim() || ids.has(item.id) || references.has(item.reference)) return false;
    if (![item.sourceFindingId, item.targetFindingId].every(id => id === null || (typeof id === 'string' && id.trim()))) return false;
    if (item.sourceFindingId !== null && item.sourceFindingId === item.targetFindingId) return false;
    if (!CBD_EFFECTS.includes(item.effectOnCbd) || !PLANNING_SIGNIFICANCE.includes(item.planningSignificance)) return false;
    if (!Array.isArray(item.evidenceIds) || !item.evidenceIds.every((id: unknown) => typeof id === 'string')) return false;
    if (typeof item.isKeyInsight !== 'boolean' || typeof item.includeInMainBrief !== 'boolean' || (item.includeInMainBrief && !item.isKeyInsight)) return false;
    ids.add(item.id); references.add(item.reference); return true;
  });
}

export function newInterdependency(items: Interdependency[], sourceFindingId: string | null = null): Interdependency {
  const number = Math.max(0, ...items.map(item => Number(item.reference.slice(3)) || 0)) + 1;
  return { id: crypto.randomUUID(), reference: `XI-${String(number).padStart(2, '0')}`, sourceFindingId, targetFindingId: null,
    relationship: '', effectOnCbd: 'Not assessed', planningSignificance: 'Not assessed', cbdImplication: '', evidenceIds: [], analyticalNote: '', isKeyInsight: false, includeInMainBrief: false };
}

export interface InterdependencyReportEntry {
  id: string; reference: string; source: string; target: string; direction: string;
  relationship: string; cbdImplication: string; effect: string; significance: string;
  sourceEvidence: string[]; targetEvidence: string[]; relationshipEvidence: string[];
  note: string; status: string; isKeyInsight: boolean; includeInMainBrief: boolean;
}

/** Shared projection for HTML, Word and Markdown; no independent report selection. */
export function buildInterdependencyReport(data: UnpolProjectData) {
  const evidence = existingEvidence(data);
  const register: InterdependencyReportEntry[] = (data.interdependencies ?? []).map(item => {
    const source = resolveInterdependencyFinding(data, item.sourceFindingId);
    const target = resolveInterdependencyFinding(data, item.targetFindingId);
    const issues = interdependencyIssues(data, item);
    return { id: item.id, reference: item.reference,
      source: source ? `${dimensionName(source.key)}: ${source.finding.finding}` : 'Source finding missing',
      target: target ? `${dimensionName(target.key)}: ${target.finding.finding}` : 'Target finding missing',
      direction: `${source ? dimensionName(source.key) : 'Missing source'} → ${target ? dimensionName(target.key) : 'Missing target'}`,
      relationship: item.relationship, cbdImplication: item.cbdImplication || 'Not recorded', effect: item.effectOnCbd, significance: item.planningSignificance,
      sourceEvidence: source?.finding.evidenceNotes?.map(note => note.sourceTitle) ?? [],
      targetEvidence: target?.finding.evidenceNotes?.map(note => note.sourceTitle) ?? [],
      relationshipEvidence: item.evidenceIds.flatMap(id => { const note = evidence.find(note => note.id === id); return note ? [note.sourceTitle] : []; }),
      note: item.analyticalNote || 'Not recorded', status: issues.length ? `Unresolved: ${issues.join(' ')}` : 'Recorded analyst judgement',
      isKeyInsight: item.isKeyInsight, includeInMainBrief: item.includeInMainBrief && item.isKeyInsight && !issues.length
    };
  });
  // Do not silently pick five if invalid data bypasses the import/UI gate.
  return { register, main: mainBriefSelectionError(data) ? [] : register.filter(item => item.includeInMainBrief) };
}
