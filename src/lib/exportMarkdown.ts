import { UnpolProjectData } from '../types';
import { calculatePriorityScore } from './scoring';
import { calculateQualityWarnings } from './warnings';

export function generateMarkdownBrief(data: UnpolProjectData): string {
  const { profile, pestels, stakeholders, customCells, priorityBrief } = data;

  const warnings = calculateQualityWarnings(data);

  // 1. Compute PESTEL-S Pressures
  const sortedPressures = Object.values(pestels)
    .filter(p => p.finding !== '')
    .map(p => ({
      ...p,
      score: p.rating.impact * p.rating.urgency
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // 2. Compute Stakeholder Quadrants
  const mapAQuadrants = {
    allies: stakeholders.filter(s => (s.position === 'Enabler' || s.position === 'Persuadable') && s.influence === 'High'),
    resistance: stakeholders.filter(s => (s.position === 'Blocker' || s.position === 'Spoiler risk') && s.influence === 'High'),
    base: stakeholders.filter(s => (s.position === 'Enabler' || s.position === 'Persuadable' || s.position === 'Neutral / unknown') && s.influence !== 'High'),
    monitor: stakeholders.filter(s => (s.position === 'Blocker' || s.position === 'Spoiler risk' || s.position === 'Neutral / unknown') && s.influence !== 'High')
  };

  const mapBQuadrants = {
    partners: stakeholders.filter(s => s.legitimacy === 'High' && s.relevance === 'High'),
    relevant: stakeholders.filter(s => s.legitimacy !== 'High' && s.relevance === 'High'),
    voices: stakeholders.filter(s => s.legitimacy === 'High' && s.relevance !== 'High'),
    monitoring: stakeholders.filter(s => s.legitimacy !== 'High' && s.relevance !== 'High')
  };

  // 3. Compute CBD Heatmap tags & priorities
  const getHeatmapTagsList = (rowId: string, colId: string) => {
    const key = `${rowId}|${colId}`;
    const cell = customCells[key];
    if (!cell) return [];

    const tags: string[] = [];
    const feasibility = cell.feasibility !== undefined ? cell.feasibility : 3;
    const support = cell.stakeholderSupport !== undefined ? cell.stakeholderSupport : 3;

    if (cell.priorityScore >= 4) {
      if (support <= 2) tags.push('Sensitive');
      else if (feasibility >= 4) tags.push('Quick Win');
      else if (feasibility <= 2) tags.push('Long-term');
      else tags.push('Priority');
    }
    if (cell.confidence <= 2) tags.push('Low Confidence');

    return tags;
  };

  const prioritizedCells = Object.keys(customCells)
    .map(key => {
      const cell = customCells[key];
      const [row, col] = key.split('|');
      const score = calculatePriorityScore({
        impact: cell.priorityScore,
        urgency: cell.priorityScore,
        feasibility: cell.feasibility || 3,
        risk: cell.riskRating || 3,
        stakeholderSupport: cell.stakeholderSupport || 3,
        mandateRelevance: 4,
        confidenceLevel: cell.confidence
      });
      const tags = getHeatmapTagsList(row, col);
      return { key, cell, score, tags };
    })
    .sort((a, b) => b.score - a.score);

  // 4. Gather all Evidence Notes
  const allEvidenceNotes: { title: string; type: string; confidence: number; date: string; comment: string; item: string }[] = [];
  
  Object.values(pestels).forEach(p => {
    p.evidenceNotes?.forEach(note => {
      allEvidenceNotes.push({
        title: note.sourceTitle,
        type: note.sourceType,
        confidence: note.confidenceLevel,
        date: note.dateVerified,
        comment: note.comment,
        item: `PESTEL-S: ${p.name}`
      });
    });
  });

  stakeholders.forEach(s => {
    s.evidenceNotes?.forEach(note => {
      allEvidenceNotes.push({
        title: note.sourceTitle,
        type: note.sourceType,
        confidence: note.confidenceLevel,
        date: note.dateVerified,
        comment: note.comment,
        item: `Stakeholder: ${s.name}`
      });
    });
  });

  Object.keys(customCells).forEach(key => {
    const cell = customCells[key];
    cell.evidenceNotes?.forEach(note => {
      allEvidenceNotes.push({
        title: note.sourceTitle,
        type: note.sourceType,
        confidence: note.confidenceLevel,
        date: note.dateVerified,
        comment: note.comment,
        item: `CBD Cell: ${key}`
      });
    });
  });

  // Compile individual markdown strings
  const prioritizedCellsMd = prioritizedCells.map(({ key, cell, score, tags }) => {
    const [row, col] = key.split('|');
    return `
### ${row} × ${col} (Priority Score: ${score.toFixed(1)}/5.0)
- **Visual Tags**: ${tags.map(t => `\`${t}\``).join(', ') || '*Standard*'}
- **Why this matters**: ${cell.why}
- **Action Levels**:
  - *Individual*: ${cell.individual}
  - *Organizational*: ${cell.organizational}
  - *Enabling Environment*: ${cell.environment}
- **Key Indicators**: ${cell.indicators?.map(i => `\n    - ${i}`).join('') || '*None*'}
- **Sequencing Note**: ${cell.sequencing}
- **Identified Risks**: ${cell.risks}
`;
  }).join('\n') || '*No custom cells prioritized yet. Default matrix fallback actions will apply.*';

  return `# UNPOL CBD Planning Brief

* **Country**: ${profile.countryName || 'N/A'}
* **Mission**: ${profile.missionName || 'N/A'}
* **Area of Operations**: ${profile.region || 'N/A'}
* **Prepared by**: ${profile.analystName || 'UNPOL Advisory Team'}
* **Assessment Date**: ${profile.assessmentDate || 'N/A'}
* **Workspace Initialization**: ${
    profile.templateId === 'blank'
      ? 'Started Blank'
      : profile.templateId?.startsWith('seed-')
        ? `Mission Explorer (UN Seed Context: ${profile.templateId.replace('seed-', '').toUpperCase()})`
        : profile.templateId?.startsWith('fictional-')
          ? `Mission Explorer (Fictional Training Scenario: ${profile.templateId.replace('fictional-', '').toUpperCase()})`
          : `Static Template (${profile.templateId || 'Unknown'})`
  }
* **Version**: v0.3.0 — Visual Workspace & Mission Explorer Upgrade

---

## Executive Dashboard Overview

* **Total Stakeholders Mapped**: ${stakeholders.length}
* **Priorities Configured**: ${prioritizedCells.length}
* **Quality Cautions Active**: ${warnings.length}

### Critical Contextual Pressures (Top 3 PESTEL-S)
${sortedPressures.map((p, i) => `${i + 1}. **${p.name}** (Pressure Score: ${p.score}/25)
   - *Finding*: ${p.finding}
   - *Evidence Notes count*: ${p.evidenceNotes?.length || 0}`).join('\n') || '*No PESTEL-S pressures defined.*'}

---

## 1. Stakeholder quadrant Maps

### Influence × Support Posture Quadrants
- **High-influence allies**: ${mapAQuadrants.allies.map(s => s.name).join(', ') || '*None*'}
- **High-influence resistance / sensitive**: ${mapAQuadrants.resistance.map(s => s.name).join(', ') || '*None*'}
- **Potential support base**: ${mapAQuadrants.base.map(s => s.name).join(', ') || '*None*'}
- **Monitor / low engagement**: ${mapAQuadrants.monitor.map(s => s.name).join(', ') || '*None*'}

### Legitimacy × Operational Relevance Quadrants
- **Core institutional partners**: ${mapBQuadrants.partners.map(s => s.name).join(', ') || '*None*'}
- **Operationally relevant actors**: ${mapBQuadrants.relevant.map(s => s.name).join(', ') || '*None*'}
- **Legitimacy / accountability voices**: ${mapBQuadrants.voices.map(s => s.name).join(', ') || '*None*'}
- **Lower-priority monitoring**: ${mapBQuadrants.monitoring.map(s => s.name).join(', ') || '*None*'}

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

## 4. Priority Capacity Building Intersections
${prioritizedCellsMd}

---

## 5. Strategic Sequencing & Recommendations

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

## 6. Planning Quality-Control Cautions
${warnings.map(w => `- **[${w.type.toUpperCase()}]** ${w.message}`).join('\n') || '*Zero planning cautions detected.*'}

---

## 7. Evidence & Source Verification Index
${allEvidenceNotes.map((n, i) => `${i + 1}. **${n.title}** [${n.type}] (Confidence: ${n.confidence}/5, Verified: ${n.date})
   - *Attached to*: ${n.item}
   - *Extract / Analyst Comment*: &ldquo;${n.comment}&rdquo;`).join('\n') || '*No source citations logged.*'}

---

## 8. Assumptions & Limitations
- **Counterpart Buy-In**: Assumes minimum host-state leadership willingness to co-locate and cooperate with advisory inputs.
- **Data Limits**: The diagnostic findings rely on client-side parameters verified on the dates logged in the Evidence Index.
- **Legal Authority Limits**: Mentorship actions assume advisory status and do not authorize executive operations.

---

## 9. Disclaimer
> [!WARNING]
> **Planning Support Disclaimer**
> This tool is an educational and planning-support prototype. It is not official United Nations doctrine and does not replace mission mandate, official guidance, host-state law, human rights due diligence, command approval, or verified country analysis. Users should verify all context-specific findings through official and current sources before operational or policy use.
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
