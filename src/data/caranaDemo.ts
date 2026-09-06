import { EvidenceNote, UnpolProjectData } from '../types';

const DEMO_DATE = '2026-01-15';

function fictionalEvidence(id: string, sourceTitle: string, comment: string): EvidenceNote {
  return {
    id,
    sourceTitle,
    sourceType: 'Workshop Input',
    dateVerified: DEMO_DATE,
    confidenceLevel: 3,
    comment: `Fictional CARANA exercise material: ${comment}`
  };
}

export function buildCaranaDemoData(base: UnpolProjectData): UnpolProjectData {
  const stakeholderNames: Record<string, string> = {
    'sh-unpol-lead': 'UN Mission in Carana / UNPOL Leadership',
    'sh-interior-min': 'Carana Ministry of Interior',
    'sh-police-hq': 'Carana National Police Headquarters',
    'sh-local-command': 'Kantara Regional Police Command',
    'sh-inspectorate': 'Carana Police Inspectorate',
    'sh-academy': 'Carana National Police Academy',
    'sh-justice': 'Carana Justice Actors',
    'sh-local-admin': 'Kantara Regional Administration',
    'sh-civil-society': 'Carana Civil Society and Women’s Networks',
    'sh-donors': 'International Partners Supporting Police Reform',
    'sh-human-rights': 'UN Mission Human Rights Component'
  };

  const stakeholders = base.stakeholders
    .filter(stakeholder => stakeholder.id in stakeholderNames)
    .map(stakeholder => ({
      ...stakeholder,
      name: stakeholderNames[stakeholder.id],
      evidenceNotes: stakeholder.id === 'sh-police-hq'
        ? [fictionalEvidence('carana-ev-stakeholder-1', 'CARANA stakeholder workshop summary', 'Police headquarters supports a limited regional pilot but requires clear reporting lines.')]
        : []
    }));

  return {
    ...base,
    profile: {
      ...base.profile,
      countryName: 'Carana (fictional training context)',
      missionName: 'CARANA — UN Peacekeeping CBD Planning Demonstration',
      region: 'Kantara Region and national-level institutions',
      mandateEnvironment: 'Fictional UN peacekeeping mandate supporting protection of civilians, restoration of public order, and advisory assistance to professionalize host-state police. Mandate scope must be treated as exercise material only.',
      hostStatePolice: 'Carana National Police (fictional)',
      conflictContext: 'A fragile peace agreement has reduced large-scale violence, but armed-group activity, intercommunal tension, weak police mobility, inconsistent command practices, and low public trust continue in Kantara Region.',
      planningPurpose: 'Demonstrate how context and evidence can inform stakeholder engagement, selection of CBD interventions, and phased support to accountable and community-responsive policing in Kantara Region.',
      analystName: 'Participant / Team',
      templateId: 'fictional-carana-demo',
      sourceCategory: 'Fictional Training Scenario',
      coverageScope: 'training',
      sourceUrl: null,
      sourceDate: DEMO_DATE,
      profileLastReviewed: null
    },
    pestels: {
      political: {
        ...base.pestels.political,
        finding: 'National reform commitments coexist with contested command authority between police headquarters and regional commanders, slowing consistent implementation in Kantara.',
        why: 'CBD activities require visible national sponsorship and practical agreement on who directs, supervises, and reviews regional implementation.',
        sequencing: 'Confirm national and regional sponsorship and reporting lines before launching the Kantara pilot.',
        rating: { impact: 4, urgency: 4, confidence: 3, relevance: 5 },
        evidenceNotes: [fictionalEvidence('carana-ev-political-1', 'CARANA joint planning workshop summary', 'Participants identified unclear national-regional command relationships as a reform constraint.')]
      },
      economic: {
        ...base.pestels.economic,
        finding: 'Irregular operating funds, vehicle shortages, and weak maintenance systems limit supervision and routine police presence outside Kantara town.',
        why: 'Training and new procedures will not hold if supervisors cannot reach stations or sustain basic records and communications.',
        sequencing: 'Use low-cost administrative controls and align mobility support with verified maintenance capacity.',
        rating: { impact: 4, urgency: 3, confidence: 3, relevance: 4 },
        evidenceNotes: [fictionalEvidence('carana-ev-economic-1', 'CARANA regional logistics review', 'The exercise assumes limited vehicles, fuel, and maintenance capability across district stations.')]
      },
      social: {
        ...base.pestels.social,
        finding: 'Women, displaced communities, and minority groups report limited access to police and low confidence that complaints will be handled safely.',
        why: 'Unequal access and weak feedback channels reduce police legitimacy and conceal protection and misconduct concerns.',
        sequencing: 'Consult representative groups before designing liaison and complaint-access pilots.',
        rating: { impact: 4, urgency: 4, confidence: 3, relevance: 5 },
        evidenceNotes: [fictionalEvidence('carana-ev-social-1', 'CARANA community consultation synthesis', 'The fictional consultations identify access, trust, and safe-reporting barriers.')]
      },
      technological: {
        ...base.pestels.technological,
        finding: 'Stations use inconsistent paper registers and radio coverage is unreliable, weakening incident handover, complaint tracking, and supervisory review.',
        why: 'Simple, consistent information workflows are needed before more advanced systems can be credible or sustainable.',
        sequencing: 'Pilot standardized paper registers and supervisory checks before considering digital case management.',
        rating: { impact: 4, urgency: 3, confidence: 4, relevance: 4 },
        evidenceNotes: [fictionalEvidence('carana-ev-technology-1', 'CARANA station process-mapping notes', 'The exercise documents inconsistent registers and incomplete handover records.')]
      },
      environmental: {
        ...base.pestels.environmental,
        finding: 'Seasonal flooding and poor roads isolate several Kantara districts and disrupt supervision, referrals, and community access.',
        why: 'CBD delivery and indicators must account for predictable access constraints rather than assume continuous field presence.',
        sequencing: 'Schedule field mentoring around access periods and establish remote reporting and contingency arrangements.',
        rating: { impact: 3, urgency: 2, confidence: 3, relevance: 3 },
        evidenceNotes: []
      },
      legal: {
        ...base.pestels.legal,
        finding: 'Complaint-handling and detention-review responsibilities are formally assigned but procedures, referral thresholds, and follow-up records are inconsistent.',
        why: 'Accountability support needs a clear legal-policy basis and usable workflows connecting police, inspectorate, and justice actors.',
        sequencing: 'Map existing authority first, then test complaint and detention-review workflows in selected stations.',
        rating: { impact: 5, urgency: 4, confidence: 3, relevance: 5 },
        evidenceNotes: [fictionalEvidence('carana-ev-legal-1', 'CARANA accountability process review', 'The fictional review identifies procedural gaps rather than claiming a definitive legal assessment.')]
      },
      security: {
        ...base.pestels.security,
        finding: 'Armed-group incidents, localized intercommunal tension, and periodic public disorder place pressure on an under-resourced civilian police service.',
        why: 'Support must strengthen lawful civilian policing and de-escalation without pushing police into inappropriate military roles.',
        sequencing: 'Integrate conflict sensitivity, protection, and de-escalation into early command and field mentoring.',
        rating: { impact: 5, urgency: 5, confidence: 3, relevance: 5 },
        evidenceNotes: [fictionalEvidence('carana-ev-security-1', 'CARANA fictional security-context brief', 'The exercise assumes persistent localized threats and public-order pressures in Kantara.')]
      }
    },
    stakeholders,
    analysisSynthesis: {
      swotFindings: [
        { id: 'carana-swot-s1', reference: 'S01', category: 'Strength', finding: 'Police headquarters and Kantara command support a bounded regional pilot when responsibilities and reporting lines are clear.', cbdImplication: 'CBD can build on existing sponsorship through limited, reviewable pilots rather than immediate national rollout.', sourceReferences: [{ type: 'stakeholder', id: 'sh-police-hq' }, { type: 'evidence', id: 'carana-ev-stakeholder-1' }], confidence: 3, verificationNote: 'Fictional workshop finding for demonstration.' },
        { id: 'carana-swot-s2', reference: 'S02', category: 'Strength', finding: 'The Police Inspectorate has a formal accountability role and can anchor review of complaint and detention workflows.', cbdImplication: 'Existing institutional authority offers a credible counterpart for testing supervisory review.', sourceReferences: [{ type: 'stakeholder', id: 'sh-inspectorate' }, { type: 'pestels', id: 'legal' }], confidence: 3, verificationNote: 'Authority and practical access require validation in the exercise.' },
        { id: 'carana-swot-w1', reference: 'W01', category: 'Weakness', finding: 'Station records, incident handovers and supervisory checks are inconsistent.', cbdImplication: 'CBD should establish a workable minimum records routine before considering advanced systems.', sourceReferences: [{ type: 'pestels', id: 'technological' }, { type: 'evidence', id: 'carana-ev-technology-1' }], confidence: 4, verificationNote: 'Supported by fictional station process-mapping notes.' },
        { id: 'carana-swot-w2', reference: 'W02', category: 'Weakness', finding: 'Complaint and detention-review procedures are inconsistently applied and followed up.', cbdImplication: 'Accountability support needs traceable procedures, safeguards and documented inspectorate review.', sourceReferences: [{ type: 'pestels', id: 'legal' }, { type: 'evidence', id: 'carana-ev-legal-1' }], confidence: 3, verificationNote: 'Fictional procedural review; not a definitive legal assessment.' },
        { id: 'carana-swot-w3', reference: 'W03', category: 'Weakness', finding: 'Police liaison arrangements do not provide sufficiently safe access for women and underserved groups.', cbdImplication: 'Representative consultation and protected referral pathways should precede broader engagement activity.', sourceReferences: [{ type: 'pestels', id: 'social' }, { type: 'stakeholder', id: 'sh-civil-society' }], confidence: 3, verificationNote: 'Fictional consultation synthesis.' },
        { id: 'carana-swot-o1', reference: 'O01', category: 'Opportunity', finding: 'National reform commitments and partner interest create a time-bound opening for carefully governed police modernization pilots.', cbdImplication: 'A limited pilot can translate broad commitment into testable institutional practice.', sourceReferences: [{ type: 'pestels', id: 'political' }, { type: 'stakeholder', id: 'sh-donors' }], confidence: 3, verificationNote: 'Commitment must be reconfirmed before implementation.' },
        { id: 'carana-swot-o2', reference: 'O02', category: 'Opportunity', finding: 'Civil society, women’s networks and the mission human rights component can inform safer access and accountability design.', cbdImplication: 'These actors can strengthen safeguards, legitimacy and feedback during pilot design and review.', sourceReferences: [{ type: 'stakeholder', id: 'sh-civil-society' }, { type: 'stakeholder', id: 'sh-human-rights' }], confidence: 3, verificationNote: 'Participation and protection arrangements require agreement.' },
        { id: 'carana-swot-t1', reference: 'T01', category: 'Threat', finding: 'Contested national-regional command authority may delay implementation or weaken corrective follow-up.', cbdImplication: 'CBD sequencing should confirm sponsorship, authority and escalation routes before launching pilots.', sourceReferences: [{ type: 'pestels', id: 'political' }, { type: 'evidence', id: 'carana-ev-political-1' }], confidence: 3, verificationNote: 'Fictional political-operational constraint.' },
        { id: 'carana-swot-t2', reference: 'T02', category: 'Threat', finding: 'Armed-group incidents and localized disorder may disrupt civilian-police mentoring and increase pressure for inappropriate roles.', cbdImplication: 'Support requires conflict sensitivity, contingency arrangements and a clear civilian-policing boundary.', sourceReferences: [{ type: 'pestels', id: 'security' }, { type: 'evidence', id: 'carana-ev-security-1' }], confidence: 3, verificationNote: 'Fictional security-context assumption.' },
        { id: 'carana-swot-t3', reference: 'T03', category: 'Threat', finding: 'Seasonal access constraints and weak mobility may interrupt supervision and referrals outside Kantara town.', cbdImplication: 'Pilots need realistic access windows, remote follow-up and low-resource continuity measures.', sourceReferences: [{ type: 'pestels', id: 'environmental' }, { type: 'pestels', id: 'economic' }], confidence: 3, verificationNote: 'Seasonal and logistics assumptions require local validation.' }
      ],
      strategicOptions: [
        { id: 'carana-option-so1', reference: 'SO-01', type: 'SO', swotFindingIds: ['carana-swot-s1', 'carana-swot-o1'], option: 'Use existing national and regional sponsorship to authorize a small, time-bound Kantara pilot with agreed reporting and review points.', planningNote: 'Confirm ownership and exit criteria before launch.' },
        { id: 'carana-option-st1', reference: 'ST-01', type: 'ST', swotFindingIds: ['carana-swot-s2', 'carana-swot-t1'], option: 'Use the Inspectorate’s formal role to establish a documented review route that is resilient to contested command relationships.', planningNote: 'Map authority and escalation routes before testing the workflow.' },
        { id: 'carana-option-wo1', reference: 'WO-01', type: 'WO', swotFindingIds: ['carana-swot-w1', 'carana-swot-o1'], option: 'Use the current reform window to pilot one minimum station register and supervisory-review routine before considering digital tools.', planningNote: 'Review practical use after 30 days.' },
        { id: 'carana-option-wt1', reference: 'WT-01', type: 'WT', swotFindingIds: ['carana-swot-w3', 'carana-swot-t2'], option: 'Establish protected, low-visibility liaison and referral arrangements that preserve access during insecurity without exposing participants.', planningNote: 'Complete a do-no-harm review with representative actors.' }
      ]
    },
    customCells: {
      'Accountability Mechanisms|Human Rights': {
        ...base.customCells['Accountability Mechanisms|Human Rights'],
        organizational: 'Pilot a traceable complaint and detention-review workflow linking selected Kantara stations with the Carana Police Inspectorate.',
        environment: 'Clarify referral and review relationships among police headquarters, the inspectorate, justice actors, and the UN mission human rights component.',
        result: 'Complaints and detention concerns in pilot locations are recorded, referred, reviewed, and followed up more consistently.',
        indicators: ['Pilot stations using the agreed complaint register', 'Monthly inspectorate review completed', 'Referral outcomes recorded', 'Supervisors documenting corrective follow-up'],
        risks: 'Senior or regional actors may resist review of sensitive complaints, and weak confidentiality could expose complainants.',
        sequencing: 'Confirm authority and safeguards, test the register in two stations, then review results before expansion.',
        urgency: 5,
        mandateRelevance: 5,
        capacityProblem: 'Kantara stations lack a consistent, safeguarded process for recording, referring, reviewing, and following up complaints and detention concerns.',
        planningObjective: 'Establish and test a traceable complaint and detention-review workflow in selected Kantara stations with documented inspectorate follow-up.',
        leadStakeholderId: 'sh-inspectorate',
        supportingStakeholderIds: ['sh-police-hq', 'sh-justice', 'sh-human-rights'],
        implementationPhase: 'NEXT',
        milestoneTimeframe: 'Two-station pilot reviewed after 90 days',
        strategicOptionIds: ['carana-option-st1'],
        evidenceNotes: [fictionalEvidence('carana-ev-matrix-1', 'CARANA accountability design workshop', 'Participants linked complaint workflow gaps to the proposed pilot intervention.')]
      },
      'Stakeholder Engagement|Gender': {
        ...base.customCells['Stakeholder Engagement|Gender'],
        organizational: 'Establish a small Kantara liaison pilot connecting trained police focal points with women’s networks and relevant referral services.',
        result: 'Women and other underserved groups have safer, more predictable channels to raise protection and service-access concerns.',
        indicators: ['Representative consultations held', 'Police focal points using a referral directory', 'Access barriers logged and reviewed', 'Participant feedback informs pilot adjustments'],
        risks: 'Visible participation may create protection concerns, and symbolic consultation may not lead to operational change.',
        sequencing: 'Complete a do-no-harm consultation and referral mapping before public engagement activities.',
        urgency: 4,
        mandateRelevance: 5,
        capacityProblem: 'Police liaison arrangements do not provide women and other underserved groups with sufficiently safe, representative, and predictable access or referral channels.',
        planningObjective: 'Test a protected liaison and referral arrangement that turns representative community feedback into practical service-access improvements.',
        leadStakeholderId: 'sh-local-command',
        supportingStakeholderIds: ['sh-civil-society', 'sh-local-admin', 'sh-human-rights'],
        implementationPhase: 'NEXT',
        milestoneTimeframe: 'Consultation and referral pilot reviewed after 12 weeks',
        strategicOptionIds: ['carana-option-wt1'],
        evidenceNotes: [fictionalEvidence('carana-ev-matrix-2', 'CARANA community-access workshop', 'The exercise links reported access barriers to a limited liaison and referral pilot.')]
      },
      'Administrative Systems|Police Practice': {
        ...base.customCells['Administrative Systems|Police Practice'],
        organizational: 'Introduce a standardized incident, handover, and task-follow-up register in selected Kantara stations with weekly supervisory review.',
        result: 'Pilot stations maintain more complete operational records and supervisors can identify missed follow-up earlier.',
        indicators: ['Required register fields completed', 'Weekly supervisory checks documented', 'Outstanding actions carried forward', 'Pilot review identifies workable adjustments'],
        risks: 'Supply shortages, weak supervision, or adding forms without removing duplication may undermine adoption.',
        sequencing: 'Map current records, agree one minimum register, coach supervisors, and assess use before any digital solution.',
        impact: 4,
        urgency: 4,
        mandateRelevance: 4,
        capacityProblem: 'Inconsistent station records, handovers, and supervisory checks prevent reliable task follow-up and obscure operational gaps.',
        planningObjective: 'Introduce one workable minimum record and supervisory-review routine in selected Kantara stations before considering digital tools.',
        leadStakeholderId: 'sh-local-command',
        supportingStakeholderIds: ['sh-police-hq', 'sh-unpol-lead', 'sh-academy'],
        implementationPhase: 'NOW',
        milestoneTimeframe: 'Baseline and first supervisory review within 30 days',
        strategicOptionIds: ['carana-option-wo1'],
        evidenceNotes: [fictionalEvidence('carana-ev-matrix-3', 'CARANA station process-mapping notes', 'The proposed register responds to documented exercise gaps in handover and task tracking.')]
      }
    },
    priorityBrief: {
      topPriorities: [
        'Pilot traceable complaint and detention-review workflows in selected Kantara stations.',
        'Standardize basic incident, handover, and supervisory review records in pilot locations.',
        'Establish a protected community liaison and referral pilot with representative women’s networks.'
      ],
      quickWins: [
        'Map existing station registers and agree a minimum common format.',
        'Compile a practical referral directory with police, justice, protection, and service actors.'
      ],
      sensitiveReforms: [
        'Clarifying inspectorate access to sensitive complaint and detention records.',
        'Aligning national and Kantara command authority for supervision and corrective action.'
      ],
      longerTermReforms: [
        'Embed tested accountability and records workflows in national policy, supervision, and academy curricula.',
        'Develop sustainable mobility, communications, and maintenance arrangements for regional policing.'
      ],
      risksAssumptions: [
        'Fictional assumption: national and regional leaders will authorize and protect the limited pilots.',
        'Fictional assumption: security and seasonal access will permit periodic mentoring and review.',
        'Risk: parallel partner support could add incompatible tools or reporting requirements.'
      ],
      sequencingRecommendation: 'Phase 1: validate authority, evidence, safeguards, and baseline workflows. Phase 2: run limited Kantara records, accountability, and liaison pilots with coaching. Phase 3: review results with stakeholders and adapt. Phase 4: consider wider institutionalization only where evidence, ownership, resources, and mandate allow.'
    }
  };
}
