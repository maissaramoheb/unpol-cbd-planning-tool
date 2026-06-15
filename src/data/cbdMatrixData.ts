import { CbdAxis, CbdCell, PestelsItem, Stakeholder } from '../types';

export const matrixRows: CbdAxis[] = [
  {
    id: 'Professionalism & Integrity',
    name: 'Professionalism & Integrity',
    definition: 'Conduct, discipline, ethics, supervision, and professional standards that shape trusted police behaviour.'
  },
  {
    id: 'Administrative Systems',
    name: 'Administrative Systems',
    definition: 'Internal workflows, logistics, records, personnel systems, communications, and management routines enabling effective policing.'
  },
  {
    id: 'Legal & Policy Framework',
    name: 'Legal & Policy Framework',
    definition: 'Laws, mandates, internal policies, oversight arrangements, and procedural coherence that define lawful police action.'
  },
  {
    id: 'Accountability Mechanisms',
    name: 'Accountability Mechanisms',
    definition: 'Systems for complaints, internal review, discipline, inspection, compliance monitoring, and corrective action.'
  },
  {
    id: 'Stakeholder Engagement',
    name: 'Stakeholder Engagement',
    definition: 'How police communicate, consult, coordinate, and build trust with communities, institutions, and service partners.'
  }
];

export const matrixColumns: CbdAxis[] = [
  {
    id: 'Police Practice',
    name: 'Police Practice',
    definition: 'How policing is actually conducted in supervision, response, service delivery, investigations, local engagement, and routine operational behaviour.'
  },
  {
    id: 'Environmental Sustainability',
    name: 'Environmental Sustainability',
    definition: 'How police institutions manage facilities, mobility, infrastructure, assets, and public resources responsibly and realistically in context.'
  },
  {
    id: 'Conflict Prevention',
    name: 'Conflict Prevention',
    definition: 'How policing can reduce drivers of escalation, improve local responsiveness, and avoid practices that intensify tension or grievance.'
  },
  {
    id: 'Human Rights',
    name: 'Human Rights',
    definition: 'How police powers are exercised lawfully, proportionately, with dignity, due process, accountability, and protection against abuse.'
  },
  {
    id: 'Gender',
    name: 'Gender',
    definition: 'How policing addresses access, inclusion, differential security experience, non-discrimination, workplace conduct, and practical barriers to service.'
  },
  {
    id: 'Protection of Civilians',
    name: 'Protection of Civilians',
    definition: 'How police presence, conduct, coordination, and response contribute to civilian safety, confidence, and harm reduction.'
  }
];

export const customCells: Record<string, CbdCell> = {
  "Accountability Mechanisms|Human Rights": {
    key: "Accountability Mechanisms|Human Rights",
    why: "Rights protection depends on whether abuse, misconduct, unlawful detention, and procedural violations can be reported, reviewed, and acted upon in credible ways.",
    individual: "Coach relevant personnel on documenting allegations properly, preserving evidence, and applying complaint or review procedures consistently.",
    organizational: "Strengthen complaint-handling, detention review, and inspection workflows so rights-related concerns are traceable and acted upon.",
    environment: "Support clearer relationships between police review bodies, justice actors, and external oversight so serious cases are not trapped inside weak internal pathways.",
    result: "Rights-related failures become more visible, more reviewable, and less likely to repeat without consequence.",
    indicators: [
      "More complete complaint records",
      "Clearer referral pathways",
      "More regular monitoring or review",
      "Better follow-up on substantiated cases"
    ],
    drivers: ["legal", "social"],
    stakeholders: ["sh-inspectorate", "sh-justice", "sh-civil-society", "sh-human-rights"],
    engagement: "Sequence workflow strengthening with legal-policy clarification and external referral coordination.",
    risks: "Host-state leadership may resist external oversight or suppress negative inspection findings.",
    sequencing: "Begin with technical record formats first, then establish formal joint justice review meetings.",
    confidence: 4,
    priorityScore: 5,
    feasibility: 4,
    riskRating: 2,
    stakeholderSupport: 4
  },
  "Stakeholder Engagement|Gender": {
    key: "Stakeholder Engagement|Gender",
    why: "Gender-responsive stakeholder engagement improves access, trust, reporting, and understanding of how different groups experience police service and barriers to safety.",
    individual: "Mentor liaison personnel on inclusive consultation, safe interviewing, respectful communication, and handling sensitive disclosures without causing harm.",
    organizational: "Build practical engagement formats and referral pathways that include women’s groups and relevant service actors in a structured way.",
    environment: "Use broader dialogue to normalize gender-responsive policing expectations and reduce the gap between policy language and community experience.",
    result: "Stakeholder engagement becomes more representative, more credible, and more useful for service access and legitimacy.",
    indicators: [
      "More representative consultations",
      "Practical use of referral pathways",
      "Improved feedback on access barriers",
      "Better visibility of gender-responsive engagement routines"
    ],
    drivers: ["social", "legal"],
    stakeholders: ["sh-civil-society", "sh-local-admin", "sh-local-command", "sh-human-rights"],
    engagement: "Engage representative women’s actors early and translate feedback into concrete access or reporting improvements.",
    risks: "Security concerns or cultural norms may limit women’s participation in public forums.",
    sequencing: "Build trusted relations with women's advocacy networks before holding open district-level town hall dialogues.",
    confidence: 3,
    priorityScore: 4,
    feasibility: 4,
    riskRating: 2,
    stakeholderSupport: 3
  },
  "Administrative Systems|Police Practice": {
    key: "Administrative Systems|Police Practice",
    why: "Even strong policy intent fails if records, handovers, communications, tasking, and basic administrative continuity are weak.",
    individual: "Train or mentor relevant staff on handover discipline, basic records quality, and task-tracking linked to operational work.",
    organizational: "Standardize reporting, recordkeeping, and internal workflow routines so command decisions and follow-up are easier to sustain.",
    environment: "Align administrative support priorities with broader mission realities such as mobility, communication reliability, and infrastructure constraints.",
    result: "Operational work becomes more traceable, more predictable, and less dependent on improvisation.",
    indicators: [
      "Improved records consistency",
      "Fewer workflow gaps",
      "Stronger handover discipline",
      "Better task follow-up"
    ],
    drivers: ["technological", "environmental", "economic"],
    stakeholders: ["sh-police-hq", "sh-local-command", "sh-academy", "sh-donors"],
    engagement: "Pair workflow reform with realistic infrastructure and command buy-in.",
    risks: "Chronic lack of paper, electricity, or digital tools can disrupt newly introduced workflows.",
    sequencing: "Provide low-tech paper ledger templates first before trying to deploy computerized case-tracking systems.",
    confidence: 4,
    priorityScore: 4,
    feasibility: 3,
    riskRating: 3,
    stakeholderSupport: 4
  }
};
export interface FallbackCellInputs {
  rowId: string;
  colId: string;
  driversList: Record<string, PestelsItem>;
  stakeholdersList: Stakeholder[];
}

export function generateFallbackCell(rowId: string, colId: string, driversList: Record<string, PestelsItem>, stakeholdersList: Stakeholder[]): CbdCell {
  const linkedDrivers = Object.keys(driversList).filter(k => {
    const item = driversList[k];
    return item.cbdAreas.includes(rowId) || item.dimensions.includes(colId);
  }).slice(0, 3);

  const linkedStakeholders = stakeholdersList.filter(s => {
    return s.cbdAreas.includes(rowId) || s.cbdAreas.includes("All key areas");
  }).slice(0, 4).map(s => s.id);

  return {
    key: `${rowId}|${colId}`,
    why: `${rowId} × ${colId} matters because this intersection shows how UNPOL can translate broad reform intent into targeted support that reflects both operational reality and cross-cutting obligations.`,
    individual: `At individual level, support focuses on practical conduct, competence, and decision-making relevant to ${rowId.toLowerCase()} through the lens of ${colId.toLowerCase()}.`,
    organizational: `At organizational level, support focuses on workflows, supervision, standardization, and institutional routines that make this intersection sustainable.`,
    environment: `At enabling-environment level, support focuses on law, policy, oversight, coordination, and external conditions that affect whether change can hold.`,
    indicators: [
      "Clearer procedural consistency",
      "Improved supervisory or institutional follow-up",
      "Better linkage between policy intent and daily practice",
      "Stronger coordination around the selected issue"
    ],
    drivers: linkedDrivers,
    stakeholders: linkedStakeholders,
    engagement: "Start with the most influential and feasible entry points, then connect technical support to workflow and policy follow-through.",
    risks: "Weak counterpart ownership and competing administrative priorities may delay progress.",
    sequencing: "Conduct basic process mapping before drafting standard operating procedures.",
    confidence: 3,
    priorityScore: 3,
    feasibility: 3,
    riskRating: 3,
    stakeholderSupport: 3,
    result: `More coherent CBD action at the intersection of ${rowId} and ${colId}.`
  };
}
