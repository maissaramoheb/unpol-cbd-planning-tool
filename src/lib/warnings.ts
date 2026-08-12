import { UnpolProjectData } from '../types';
import { evaluateCbdCell } from './scoring';

export interface QualityWarning {
  id: string;
  type: 'warning' | 'caution' | 'info';
  category: 'profile' | 'pestels' | 'stakeholders' | 'matrix' | 'sequencing';
  message: string;
  itemKey?: string;
}

export function calculateQualityWarnings(data: UnpolProjectData): QualityWarning[] {
  const warnings: QualityWarning[] = [];
  const { profile, pestels, stakeholders, customCells, priorityBrief } = data;

  // 1. Incomplete mission profile / missing critical fields for export
  const criticalProfileFields: { field: keyof typeof profile; label: string }[] = [
    { field: 'countryName', label: 'Country / Area of Operations' },
    { field: 'missionName', label: 'UN Mission Name' },
    { field: 'analystName', label: 'Analyst / Advisory Team' }
  ];

  criticalProfileFields.forEach(({ field, label }) => {
    const val = profile[field];
    if (!val || val.trim() === '') {
      warnings.push({
        id: `profile-missing-${field}`,
        type: 'warning',
        category: 'profile',
        message: `Analytical caution: Mission profile field "${label}" is empty. Planning brief exports will show missing parameters.`
      });
    }
  });

  const optionalProfileFields: { field: keyof typeof profile; label: string }[] = [
    { field: 'region', label: 'Region / Sectors Covered' },
    { field: 'hostStatePolice', label: 'Host-State Police Force' },
    { field: 'planningPurpose', label: 'Planning Purpose' },
    { field: 'mandateEnvironment', label: 'Mandate Environment' },
    { field: 'conflictContext', label: 'Conflict Context' }
  ];

  optionalProfileFields.forEach(({ field, label }) => {
    const val = profile[field];
    if (!val || val.trim() === '') {
      warnings.push({
        id: `profile-empty-${field}`,
        type: 'caution',
        category: 'profile',
        message: `Analytical caution: Optional profile field "${label}" is empty. Consider adding context for completeness.`
      });
    }
  });

  // 2. High impact but low confidence in PESTEL-S drivers
  Object.values(pestels).forEach((item) => {
    if (item.rating.impact >= 4 && item.rating.confidence <= 2) {
      warnings.push({
        id: `pestels-high-impact-low-conf-${item.id}`,
        type: 'warning',
        category: 'pestels',
        message: `Analytical caution: "${item.name}" has high impact (${item.rating.impact}/5) but low confidence (${item.rating.confidence}/5). Verify before using in a planning brief.`,
        itemKey: item.id
      });
    }
  });

  // 3. High priority but low confidence in CBD Matrix cells
  Object.keys(customCells).forEach((key) => {
    const cell = customCells[key];
    const assessment = evaluateCbdCell(cell);
    if (assessment.score >= 4 && cell.confidence <= 2) {
      warnings.push({
        id: `matrix-high-priority-low-conf-${key}`,
        type: 'warning',
        category: 'matrix',
        message: `Analytical caution: CBD intersection "${key}" has a high indicative priority (${assessment.score.toFixed(1)}/5) but low confidence (${cell.confidence}/5). Verify before using in a planning brief.`,
        itemKey: key
      });
    }
  });

  Object.entries(customCells).forEach(([key, cell]) => {
    const highPriority = evaluateCbdCell(cell).score >= 4;
    if (highPriority && !cell.capacityProblem?.trim()) warnings.push({ id: `matrix-no-problem-${key}`, type: 'warning', category: 'matrix', message: `Analytical caution: High-priority CBD action "${key}" has no defined capacity problem or gap.`, itemKey: key });
    if (highPriority && !cell.planningObjective?.trim()) warnings.push({ id: `matrix-no-objective-${key}`, type: 'warning', category: 'matrix', message: `Analytical caution: High-priority CBD action "${key}" has no planning objective.`, itemKey: key });
    if (cell.implementationPhase && !cell.leadStakeholderId) warnings.push({ id: `matrix-phase-no-lead-${key}`, type: 'warning', category: 'sequencing', message: `Analytical caution: CBD action "${key}" is assigned to ${cell.implementationPhase} but has no lead stakeholder or actor.`, itemKey: key });
    if (cell.implementationPhase === 'NOW' && !cell.indicators?.some(indicator => indicator.trim())) warnings.push({ id: `matrix-now-no-indicator-${key}`, type: 'warning', category: 'sequencing', message: `Analytical caution: NOW action "${key}" has no monitoring indicator.`, itemKey: key });
  });

  // 4. High priority but low stakeholder support in CBD Matrix cells
  Object.keys(customCells).forEach((key) => {
    const cell = customCells[key];
    const assessment = evaluateCbdCell(cell);
    const support = cell.stakeholderSupport !== undefined ? cell.stakeholderSupport : 3;
    if (assessment.score >= 4 && support <= 2) {
      warnings.push({
        id: `matrix-high-priority-low-support-${key}`,
        type: 'warning',
        category: 'matrix',
        message: `Analytical caution: High-priority CBD action "${key}" has low stakeholder support (${support}/5). Implementation is at risk of obstruction.`,
        itemKey: key
      });
    }
  });

  // 5. High priority with no evidence notes (Custom CBD cell or high PESTEL-S)
  Object.values(pestels).forEach((item) => {
    if (item.rating.impact >= 4 && (!item.evidenceNotes || item.evidenceNotes.length === 0)) {
      warnings.push({
        id: `pestels-no-evidence-${item.id}`,
        type: 'warning',
        category: 'pestels',
        message: `Analytical caution: High impact pressure "${item.name}" has no evidence notes. Verify and document sources.`,
        itemKey: item.id
      });
    }
  });

  Object.keys(customCells).forEach((key) => {
    const cell = customCells[key];
    const assessment = evaluateCbdCell(cell);
    if (assessment.score >= 4 && (!cell.evidenceNotes || cell.evidenceNotes.length === 0)) {
      warnings.push({
        id: `matrix-no-evidence-${key}`,
        type: 'warning',
        category: 'matrix',
        message: `Analytical caution: High-priority CBD action "${key}" has no evidence notes. Document sources to support this decision.`,
        itemKey: key
      });
    }
  });

  // 6. Sensitive reform marked as quick win (cross-check list contents)
  const quickWins = priorityBrief.quickWins || [];
  const sensitiveReforms = priorityBrief.sensitiveReforms || [];

  quickWins.forEach((qw) => {
    const isSensitive = sensitiveReforms.some(
      (sr) =>
        sr.toLowerCase().trim() === qw.toLowerCase().trim() ||
        (qw.length > 8 && sr.toLowerCase().includes(qw.toLowerCase())) ||
        (sr.length > 8 && qw.toLowerCase().includes(sr.toLowerCase()))
    );
    if (isSensitive) {
      warnings.push({
        id: `sequencing-contradiction-${qw.replace(/\s+/g, '-')}`,
        type: 'warning',
        category: 'sequencing',
        message: `Analytical caution: The item "${qw}" is listed both as a Quick Win and a Sensitive Reform. Verify sequencing rationale.`
      });
    }
  });

  // 7. Export brief has missing critical fields
  if (!priorityBrief.topPriorities || priorityBrief.topPriorities.length === 0 || priorityBrief.topPriorities.every(p => p.trim() === '')) {
    warnings.push({
      id: 'brief-missing-priorities',
      type: 'warning',
      category: 'sequencing',
      message: 'Analytical caution: Export brief has missing critical fields. Top CBD Priorities are empty.'
    });
  }
  if (!priorityBrief.sequencingRecommendation || priorityBrief.sequencingRecommendation.trim() === '') {
    warnings.push({
      id: 'brief-missing-sequencing',
      type: 'warning',
      category: 'sequencing',
      message: 'Analytical caution: Export brief has missing critical fields. Recommended Sequencing Pathway is empty.'
    });
  }

  // 8. Stakeholder checks (resolves unused variable warning)
  if (stakeholders.length === 0) {
    warnings.push({
      id: 'stakeholders-empty',
      type: 'caution',
      category: 'stakeholders',
      message: 'Analytical caution: No stakeholders analyzed. Influence and support mapping is incomplete.'
    });
  }

  return warnings;
}
