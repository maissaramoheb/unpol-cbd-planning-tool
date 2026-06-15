import { UnpolProjectData } from '../types';
import { calculatePriorityScore } from './scoring';

export function generateMarkdownBrief(data: UnpolProjectData): string {
  const { profile, pestels, stakeholders, customCells, priorityBrief } = data;

  const stakeholdersByPosition = (position: string) =>
    stakeholders
      .filter(s => s.position === position)
      .map(s => `- **${s.name}** (Influence: ${s.influence}, Capacity: ${s.capacity})`)
      .join('\n') || '- *None identified*';

  // Format matrix priority cells
  const prioritizedCells = Object.keys(customCells)
    .map(key => {
      const cell = customCells[key];
      // For calculation we need standard Inputs, we'll map existing values
      const score = calculatePriorityScore({
        impact: cell.priorityScore,
        urgency: cell.priorityScore,
        feasibility: 4, // default
        risk: 2, // default
        stakeholderSupport: 4,
        mandateRelevance: 4,
        confidenceLevel: cell.confidence
      });
      return { key, cell, score };
    })
    .sort((a, b) => b.score - a.score);

  const prioritizedCellsMd = prioritizedCells.map(({ key, cell, score }) => {
    const [row, col] = key.split('|');
    return `
### ${row} × ${col} (Priority Score: ${score}/5.0)
- **Why this matters**: ${cell.why}
- **Action Levels**:
  - *Individual*: ${cell.individual}
  - *Organizational*: ${cell.organizational}
  - *Enabling Environment*: ${cell.environment}
- **Key Indicators**: ${cell.indicators.map(i => `\n    - ${i}`).join('')}
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
* **Version**: Version 0.1 — Planning Support Prototype

---

## 1. Country / Mission Profile
| Attribute | Detail |
| :--- | :--- |
| **Host-State Police Institution** | ${profile.hostStatePolice} |
| **Mandate Environment** | ${profile.mandateEnvironment} |
| **Conflict Context** | ${profile.conflictContext} |
| **Planning Purpose** | ${profile.planningPurpose} |
| **Assessment Date** | ${profile.assessmentDate} |

---

## 2. Executive Summary
This capacity-building and development (CBD) brief provides a structured alignment between the host-state environmental pressures, critical stakeholders, and targeted police development priority areas. It is designed to guide UNPOL advisors in sequencing training, administrative reforms, and legal interventions.

---

## 3. Key PESTEL-S Situational Findings
Below is an assessment of the environmental factors affecting host-state policing, along with planning implications:

${Object.keys(pestels).map(k => {
  const p = pestels[k];
  return `### ${p.name}
- **Key Finding**: ${p.finding}
- **Why it matters**: ${p.why}
- **Strategic Impact**: ${p.rating.impact}/5 | **Urgency**: ${p.rating.urgency}/5 | **Confidence**: ${p.rating.confidence}/5
- **Sequencing Guideline**: ${p.sequencing}
`;
}).join('\n')}

---

## 4. Stakeholder Map Summary
Stakeholder alignment shapes the feasibility of police capacity building. Stakeholders are grouped below by their posture toward reform:

### Enablers
${stakeholdersByPosition('Enabler')}

### Persuadables
${stakeholdersByPosition('Persuadable')}

### Blockers
${stakeholdersByPosition('Blocker')}

### Spoiler Risks
${stakeholdersByPosition('Spoiler risk')}

### Neutral / Unknown
${stakeholdersByPosition('Neutral / unknown')}

---

## 5. Priority Capacity Building (CBD) Areas
The following key area × dimension intersections have been identified as high-priority intervention lines:
${prioritizedCellsMd}

---

## 6. Priority Setting & Sequencing Recommendations
Based on the multi-criteria analysis of impact, urgency, and feasibility, the following sequencing plan is recommended:

### Top 3 CBD Priorities
${priorityBrief.topPriorities.map(p => `- ${p}`).join('\n')}

### Quick Wins (High Feasibility, Low Risk)
${priorityBrief.quickWins.map(w => `- ${w}`).join('\n')}

### Sensitive Reforms (High Impact, High Risk - Requires Command/Political Cover)
${priorityBrief.sensitiveReforms.map(s => `- ${s}`).join('\n')}

### Longer-Term Institutional Reforms
${priorityBrief.longerTermReforms.map(r => `- ${r}`).join('\n')}

### Recommended Sequencing Path
${priorityBrief.sequencingRecommendation}

---

## 7. Risks and Assumptions
${priorityBrief.risksAssumptions.map(ra => `- ${ra}`).join('\n')}

---

## 8. Suggested Next Steps
1. Convene a joint UNPOL-Host State police leadership planning session to review and co-sign these priority areas.
2. Develop detailed Implementation Plans (IP) for the identified "Quick Wins."
3. Brief the Special Representative of the Secretary-General (SRSG) and Head of Military Component on the "Sensitive Reforms" requiring integrated political cover.
4. Establish quarterly monitoring metrics based on the specified Indicators.

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
