import { PestelsItem } from '../types';

export const PESTELS_KEYS = [
  'political',
  'economic',
  'social',
  'technological',
  'environmental',
  'legal',
  'security'
] as const;

export const defaultPestelsData: Record<string, PestelsItem> = {
  political: {
    id: 'political',
    name: 'Political / Governance / Peace Process',
    definition: 'Political authority, peace-process dynamics, command relationships, and power distribution affecting host-state policing and police legitimacy.',
    finding: 'Command authority and political backing for policing remain uneven, which can weaken reform sequencing and operational consistency.',
    why: 'UNPOL cannot sequence CBD effectively when authority, political backing, and police role clarity are fragmented or contested.',
    cbdAreas: ['Professionalism & Integrity', 'Legal & Policy Framework', 'Accountability Mechanisms'],
    dimensions: ['Conflict Prevention', 'Human Rights', 'Gender'],
    stakeholders: ['Mission Leadership / UNPOL Leadership', 'Ministry / Interior Equivalents', 'Police HQ Leadership', 'Local Administration'],
    sequencing: 'Prioritize leadership-level clarification and coalition building before broad training rollout.',
    rating: { impact: 4, urgency: 4, confidence: 4, relevance: 5 }
  },
  economic: {
    id: 'economic',
    name: 'Economic / Resourcing / Corruption Exposure',
    definition: 'Funding reliability, logistics, salaries, procurement integrity, infrastructure support, and exposure to corruption or patronage.',
    finding: 'Resource constraints and weak administrative systems risk undermining professional standards and continuity.',
    why: 'CBD efforts fail when administrative systems, logistics, payroll, or resource integrity are too weak to sustain change.',
    cbdAreas: ['Administrative Systems', 'Professionalism & Integrity', 'Accountability Mechanisms'],
    dimensions: ['Police Practice', 'Human Rights'],
    stakeholders: ['Police HQ Leadership', 'Training Academy / Training Directorate', 'Inspectorate / Professional Standards', 'Donors / Mission Partners'],
    sequencing: 'Sequence administrative and oversight fixes alongside training, not after it.',
    rating: { impact: 4, urgency: 3, confidence: 4, relevance: 4 }
  },
  social: {
    id: 'social',
    name: 'Social / Trust / Identity / Community Dynamics',
    definition: 'Public trust, exclusion, identity-based grievances, reporting barriers, access disparities, and community perceptions of police.',
    finding: 'Public trust and access to police may vary across communities, affecting reporting, legitimacy, and responsiveness.',
    why: 'UNPOL support that ignores trust and access barriers risks technical improvement without public legitimacy.',
    cbdAreas: ['Stakeholder Engagement', 'Professionalism & Integrity', 'Accountability Mechanisms'],
    dimensions: ['Gender', 'Human Rights', 'Protection of Civilians', 'Conflict Prevention'],
    stakeholders: ['Women’s Groups / Civil Society', 'Local Administration', 'Justice Actors', 'Regional / Local Police Command'],
    sequencing: 'Use stakeholder engagement and accessible reporting channels early, not as a late-stage add-on.',
    rating: { impact: 3, urgency: 4, confidence: 3, relevance: 4 }
  },
  technological: {
    id: 'technological',
    name: 'Technological / Information / Communications / Records',
    definition: 'Communications systems, records reliability, data flow, case management, and information systems relevant to policing and oversight.',
    finding: 'Weak records, fragmented reporting, or limited ICT can undermine administration, accountability, and continuity.',
    why: 'Without reliable information systems, UNPOL cannot sustain improvements in supervision, case tracking, or complaint handling.',
    cbdAreas: ['Administrative Systems', 'Accountability Mechanisms', 'Legal & Policy Framework'],
    dimensions: ['Police Practice', 'Human Rights'],
    stakeholders: ['Police HQ Leadership', 'Training Academy / Training Directorate', 'Inspectorate / Professional Standards', 'Mission Leadership / UNPOL Leadership'],
    sequencing: 'Pair SOP reform with practical record and reporting workflow improvement.',
    rating: { impact: 3, urgency: 3, confidence: 4, relevance: 3 }
  },
  environmental: {
    id: 'environmental',
    name: 'Environmental / Geography / Climate / Infrastructure Stress',
    definition: 'Mobility constraints, seasonal access issues, dispersed populations, disaster stress, and infrastructure weaknesses affecting public safety delivery.',
    finding: 'Terrain, mobility, and infrastructure constraints may limit service reach, supervision, and continuity.',
    why: 'CBD plans that assume stable access, communication, and infrastructure often fail in fragile mission settings.',
    cbdAreas: ['Administrative Systems', 'Stakeholder Engagement', 'Professionalism & Integrity'],
    dimensions: ['Environmental Sustainability', 'Protection of Civilians', 'Police Practice'],
    stakeholders: ['Regional / Local Police Command', 'Local Administration', 'Donors / Mission Partners', 'Mission Leadership / UNPOL Leadership'],
    sequencing: 'Prioritize realistic service-delivery models and mobility-aware supervision plans.',
    rating: { impact: 3, urgency: 2, confidence: 4, relevance: 3 }
  },
  legal: {
    id: 'legal',
    name: 'Legal / Policy / Oversight / Mandate Coherence',
    definition: 'Police law, internal policy, disciplinary authority, complaints architecture, oversight arrangements, and mandate clarity.',
    finding: 'Policy fragmentation or unclear oversight pathways may weaken legality, discipline, and accountability.',
    why: 'UNPOL advisory work becomes shallow if legal and policy ambiguity is not linked to operational procedure and oversight reform.',
    cbdAreas: ['Legal & Policy Framework', 'Accountability Mechanisms', 'Professionalism & Integrity'],
    dimensions: ['Human Rights', 'Gender', 'Conflict Prevention'],
    stakeholders: ['Justice Actors', 'Inspectorate / Professional Standards', 'Ministry / Interior Equivalents', 'Police HQ Leadership'],
    sequencing: 'Align legal-policy dialogue with practical SOP and workflow revision.',
    rating: { impact: 4, urgency: 4, confidence: 4, relevance: 5 }
  },
  security: {
    id: 'security',
    name: 'Security / Conflict / Threat / Public Order Environment',
    definition: 'Conflict patterns, crime threats, public order challenges, armed group presence, and physical security threats affecting public safety and police operations.',
    finding: 'Volatile security conditions, regional inter-communal violence, and armed element presence strain host-state police deployment and protection capabilities.',
    why: 'Basic physical security and public order management are prerequisites; UNPOL cannot conduct long-term capacity building if the police are constantly in survival mode or combat roles.',
    cbdAreas: ['Professionalism & Integrity', 'Stakeholder Engagement', 'Legal & Policy Framework'],
    dimensions: ['Conflict Prevention', 'Protection of Civilians', 'Human Rights'],
    stakeholders: ['Mission Leadership / UNPOL Leadership', 'Regional / Local Police Command', 'Local Administration', 'Justice Actors'],
    sequencing: 'Integrate conflict-sensitive incident response and de-escalation protocols early in training and SOP advisory lines.',
    rating: { impact: 5, urgency: 5, confidence: 4, relevance: 5 }
  }
};
