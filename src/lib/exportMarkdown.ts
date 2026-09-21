import { indicatorTexts } from "./resultsPlanning";
import type { PlanningBriefModel } from "./reportModel";
import {
  formatStakeholderNames,
  STAKEHOLDER_RATINGS_CAVEAT
} from './stakeholderAnalysis';
import { INTERDEPENDENCY_CAUTION } from './interdependencies';

const escapeXiMarkdown = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([\\`*_{}\[\]#|])/g, '\\$1');

export function generateMarkdownBrief(model: PlanningBriefModel): string {
  const { data, priorities, selectedPestels, warnings, interdependencyAnalysis, stakeholderAnalysis, evidence, contextSource, version } = model;
  const { profile, pestels, stakeholders, priorityBrief, analysisSynthesis } = data;

  const xiMain = interdependencyAnalysis.main.length ? `\n### Key Interdependencies\n\n${INTERDEPENDENCY_CAUTION}\n\n${interdependencyAnalysis.main.map(item => `#### ${item.reference} · ${item.direction}\n${escapeXiMarkdown(item.relationship)}\n\n**CBD implication:** ${escapeXiMarkdown(item.cbdImplication)}`).join('\n\n')}\n` : '';
  const xiRegister = interdependencyAnalysis.register.length ? `\n## Annex · PESTEL-S Interdependency Register\n\n${INTERDEPENDENCY_CAUTION}\n\n${interdependencyAnalysis.register.map(item => `### ${item.reference} · ${item.direction}\n${escapeXiMarkdown(item.status)} · ${item.isKeyInsight ? 'Key insight' : 'Not key'} · ${item.includeInMainBrief ? 'Included in main brief' : 'Register only'}\n\n- **Source finding:** ${escapeXiMarkdown(item.source)}\n- **Target finding:** ${escapeXiMarkdown(item.target)}\n- **Effect on CBD:** ${item.effect}\n- **Planning significance:** ${item.significance}\n- **Relationship:** ${escapeXiMarkdown(item.relationship)}\n- **CBD implication:** ${escapeXiMarkdown(item.cbdImplication)}\n- **A · Source finding evidence:** ${escapeXiMarkdown(item.sourceEvidence.join('; ') || 'None recorded')}\n- **B · Target finding evidence:** ${escapeXiMarkdown(item.targetEvidence.join('; ') || 'None recorded')}\n- **C · Relationship evidence:** ${escapeXiMarkdown(item.relationshipEvidence.join('; ') || 'None linked — analyst judgement')}\n- **Analytical / verification note:** ${escapeXiMarkdown(item.note)}`).join('\n\n')}\n` : '';

  // 1. Stakeholder Decision-Support Summary
  const stakeholderQuadrantsMd = [
    {
      title: 'Influence × Support Posture',
      quadrants: stakeholderAnalysis.engagementQuadrants
    },
    {
      title: 'Legitimacy / Accountability × Operational Relevance',
      quadrants: stakeholderAnalysis.credibilityQuadrants
    }
  ].map((map) => `### ${map.title}
${map.quadrants.map((quadrant) => `- **${quadrant.title} (${quadrant.stakeholders.length})**: ${formatStakeholderNames(quadrant.stakeholders)}
  - **Recommended posture**: ${quadrant.recommendation}
  - **Review caveat**: ${quadrant.caveat}`).join('\n')}`).join('\n\n');

  // 2. Compute CBD Heatmap tags & priorities from canonical model (top 4 prioritized packages)
  const prioritizedCellsMd = priorities.map((priority) => {
    const { row, column, cell, assessment, leadStakeholder, supportingStakeholders, strategicOptions, evidenceIds } = priority;
    return `
### ${row} × ${column} (Indicative Priority: ${assessment.score.toFixed(1)}/5.0)
- **Visual Tags**: ${assessment.tags.map(t => `\`${t}\``).join(', ') || '*Standard*'}
- **Capacity Problem / Gap**: ${cell.capacityProblem || 'Not yet defined'}
- **Planning Objective**: ${cell.planningObjective || 'Not yet defined'}
- **Why this matters**: ${cell.why || 'Not recorded.'}
- **Evidence Basis**: ${evidenceIds.join(' · ') || 'No linked evidence recorded'}
- **Strategic Synthesis Basis**: ${strategicOptions.map(option => option.reference).join(' · ') || 'No Strategic Option linked'}
- **Action Levels**:
  - *Individual*: ${cell.individual || 'Not recorded.'}
  - *Organizational*: ${cell.organizational || 'Not recorded.'}
  - *Enabling Environment*: ${cell.environment || 'Not recorded.'}
- **Key Indicators**: ${indicatorTexts(cell).map(i => `\n    - ${i}`).join('') || '*None*'}
- **Responsibility**: Lead: ${leadStakeholder?.name || 'Not assigned'}; Support: ${supportingStakeholders.map(s => s.name).join('; ') || 'None assigned'}
- **Implementation Phase / Milestone**: ${cell.implementationPhase || 'Not assigned'}${cell.milestoneTimeframe ? ` · ${cell.milestoneTimeframe}` : ''}
- **Sequencing Note**: ${cell.sequencing || 'Not recorded.'}
- **Identified Risks**: ${cell.risks || 'Not recorded.'}
`;
  }).join('\n') || '*No custom cells prioritized yet. Default matrix fallback actions will apply.*';

  // 3. Assumptions & Limitations from canonical recorded data
  const assumptionsMd = priorityBrief.risksAssumptions.filter(Boolean).length
    ? priorityBrief.risksAssumptions.filter(Boolean).map(a => `- ${a}`).join('\n')
    : '*No recorded planning assumptions or risks.*';

  return `# Unofficial UNPOL CBD Planning Brief

* **Country**: ${profile.countryName || 'N/A'}
* **Mission**: ${profile.missionName || 'N/A'}
* **Area of Operations**: ${profile.region || 'N/A'}
* **Prepared by**: ${profile.analystName || 'Participant / Team'}
* **Assessment Date**: ${profile.assessmentDate || 'N/A'}
* **Source Category**: ${profile.sourceCategory || 'User-defined / static template'}
* **Source Date**: ${profile.sourceDate || 'Not provided'}
* **Profile Last Reviewed**: ${profile.profileLastReviewed || 'Not independently verified'}
* **Workspace Initialization**: ${contextSource}
* **Version**: ${version}

---

## Planning Overview

* **Total Stakeholders Mapped**: ${stakeholders.length}
* **Priorities Configured**: ${priorities.length}
* **Quality Cautions Active**: ${warnings.length}

### Critical Contextual Pressures (Top 4 PESTEL-S)
${selectedPestels.map((p, i) => `${i + 1}. **${p.name}** (Pressure Score: ${p.rating.impact * p.rating.urgency}/25 · Impact: ${p.rating.impact}/5 · Urgency: ${p.rating.urgency}/5 · Confidence: ${p.rating.confidence}/5)
   - *Finding*: ${p.finding}
   - *Evidence Notes count*: ${p.evidenceNotes?.length || 0}`).join('\n') || '*No PESTEL-S pressures defined.*'}

---

## 1. Stakeholder Decision-Support Summary

${stakeholderQuadrantsMd}

### Recommended Engagement Posture
- **Priority engagement risks**: ${formatStakeholderNames(stakeholderAnalysis.insights.priorityRisks)}
- **Actors needing leadership-level engagement**: ${formatStakeholderNames(stakeholderAnalysis.insights.leadershipLevel)}
- **Actors suitable for technical working groups**: ${formatStakeholderNames(stakeholderAnalysis.insights.technicalWorkingGroups)}
- **Actors to consult for legitimacy/accountability**: ${formatStakeholderNames(stakeholderAnalysis.insights.legitimacyConsultation)}
- **Actors currently requiring monitoring only**: ${formatStakeholderNames(stakeholderAnalysis.insights.monitoringOnly)}

### Major Stakeholder Risk Notes
${stakeholderAnalysis.insights.priorityRisks.map((stakeholder) => `- **${stakeholder.name}**: ${stakeholder.risk}`).join('\n') || '- No elevated stakeholder risks currently derived from the recorded ratings.'}

> **Analytical caveat:** ${STAKEHOLDER_RATINGS_CAVEAT}

---

## 2. Country / Mission Profile Details
| Attribute | Detail |
| :--- | :--- |
| **Host-State Police Institution** | ${profile.hostStatePolice || 'N/A'} |
| **Mandate Environment** | ${profile.mandateEnvironment || 'N/A'} |
| **Conflict Context** | ${profile.conflictContext || 'N/A'} |
| **Planning Purpose** | ${profile.planningPurpose || 'N/A'} |

---

## 3. Key PESTEL-S Situational Findings
${Object.keys(pestels).map(k => {
  const p = pestels[k];
  return `### ${p.name}
- **Key Finding**: ${p.finding || '*No diagnostic finding defined*'}
- **Why it matters**: ${p.why || '*No description*'}
- **Ratings**: Impact: ${p.rating.impact}/5 | Urgency: ${p.rating.urgency}/5 | Confidence: ${p.rating.confidence}/5
- **Sequencing**: ${p.sequencing || '*None*'}
`;
}).join('\n')}

---

## 4. Analysis Synthesis
${xiMain}
> SWOT/TOWS synthesis records professional judgement. It supports planning choices and does not determine the CBD response.

### Key SWOT Findings
${analysisSynthesis.swotFindings.map(item => `- **${item.reference} · ${item.category}**: ${item.finding || '*Finding not yet recorded*'}\n  - **CBD implication**: ${item.cbdImplication || '*Not recorded*'}\n  - **Structural source links**: ${item.sourceReferences.length || 0}`).join('\n') || '*No SWOT findings recorded.*'}

### Strategic Options
| Ref | Combination | Strategic Implication |
| :--- | :--- | :--- |
${analysisSynthesis.strategicOptions.map(option => `| ${option.reference} | ${option.swotFindingIds.map(id => analysisSynthesis.swotFindings.find(item => item.id === id)?.reference).filter(Boolean).join(' + ')} | ${option.option || 'Not yet recorded'} |`).join('\n') || '| — | — | No Strategic Options recorded |'}

---

## 5. CBD Key Areas × Cross-Cutting Analytical Lenses

This 5×6 matrix is a prototype analytical structure, not a formal UN taxonomy.

> **Prototype planning heuristic — not UN doctrine.** Indicative Priority = 25% Impact + 20% Urgency + 20% Mandate Relevance + 15% Feasibility + 10% Stakeholder Support + 10% inverse Implementation Risk. Evidence Confidence is shown as a caution and is not included in the score. The result supports discussion and does not replace professional judgement.
${prioritizedCellsMd}

---

## 6. Strategic Sequencing & Recommendations

### Top 3 CBD Priorities
${priorityBrief.topPriorities?.map(p => `- ${p}`).join('\n') || '*None defined*'}

### Quick Wins (High Feasibility, Low Risk)
${priorityBrief.quickWins?.map(w => `- ${w}`).join('\n') || '*None defined*'}

### Sensitive Reforms (Requires Command/Political Cover)
${priorityBrief.sensitiveReforms?.map(s => `- ${s}`).join('\n') || '*None defined*'}

### Longer-Term Institutional Reforms
${priorityBrief.longerTermReforms?.map(r => `- ${r}`).join('\n') || '*None defined*'}

### Recommended Sequencing Narrative
${priorityBrief.sequencingRecommendation || '*No narrative configured*'}

---

## 7. Planning Quality-Control Cautions
${warnings.map(w => `- **[${w.type.toUpperCase()}]** ${w.message}`).join('\n') || '*Zero planning cautions detected.*'}

---

## 8. Evidence & Source Verification Index
${evidence.map((n) => `${n.id}. **${n.title}** [${n.type}] (Confidence: ${n.confidence}/5, Source reviewed: ${n.date || 'not recorded'})
   - *Attached to*: ${n.attachedTo}
   - *Extract / Analyst Comment*: &ldquo;${n.comment || 'No note recorded.'}&rdquo;`).join('\n') || '*No source citations logged.*'}

---

## 9. Assumptions & Limitations
${assumptionsMd}

---

## 10. Disclaimer
> [!WARNING]
> **Planning Support Disclaimer**
> This tool is an educational and planning-support prototype. It is not official United Nations doctrine and does not replace mission mandate, official guidance, host-state law, human rights due diligence, command approval, or verified country analysis. Users should verify all context-specific findings through official and current sources before operational or policy use.
${xiRegister}
`;
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return Promise.resolve(false);
  }
  return navigator.clipboard.writeText(text)
    .then(() => true)
    .catch(() => false);
}
