import { MissionProfile, PestelsItem } from '../types';

export interface MissionTemplate {
  id: string;
  name: string;
  description: string;
  profileDefaults: Omit<MissionProfile, 'templateId' | 'assessmentDate' | 'analystName'>;
  pestelsOverrides?: Partial<Record<string, Partial<PestelsItem>>>;
}

export const defaultMissionTemplates: MissionTemplate[] = [
  {
    id: 'peacekeeping',
    name: 'UN Peacekeeping Mission',
    description: 'Starter questions for stabilization, civilian protection, and advisory work in a peacekeeping context.',
    profileDefaults: {
      countryName: 'Country / area to verify',
      missionName: 'UN peacekeeping planning context',
      region: 'Area of operations to verify',
      mandateEnvironment: '[PROMPT] Confirm the current mandate, police component role, and authorized advisory functions.',
      hostStatePolice: 'Host-state police institution to verify',
      conflictContext: '[ASSUMPTION TO TEST] Identify the conflict, protection, and public-order conditions that affect policing.',
      planningPurpose: '[PROMPT] Define the intended police capacity-building planning purpose.'
    },
    pestelsOverrides: {
      political: {
        finding: '[VERIFY] Assess whether command authority or political backing could affect reform sequencing and operational consistency.',
        rating: { impact: 4, urgency: 4, confidence: 2, relevance: 5 }
      },
      economic: {
        finding: '[VERIFY] Assess whether resourcing, payroll, or logistics constraints affect police mobility and integrity.',
        rating: { impact: 4, urgency: 3, confidence: 2, relevance: 4 }
      },
      social: {
        finding: '[VERIFY] Examine whether community trust, identity dynamics, or reporting barriers affect access to policing.',
        rating: { impact: 3, urgency: 4, confidence: 2, relevance: 4 }
      },
      security: {
        finding: '[VERIFY] Assess whether current security and public-order pressures exceed available civilian policing capacity.',
        rating: { impact: 5, urgency: 5, confidence: 2, relevance: 5 }
      }
    }
  },
  {
    id: 'spm',
    name: 'Special Political Mission (SPM)',
    description: 'Starter questions for non-executive advice, governance support, and political-transition planning.',
    profileDefaults: {
      countryName: 'Country / transition context to verify',
      missionName: 'Special political mission planning context',
      region: 'Area of operations to verify',
      mandateEnvironment: '[PROMPT] Confirm the current mandate for security-sector governance, policy, or legislative advice.',
      hostStatePolice: 'National police institution to verify',
      conflictContext: '[ASSUMPTION TO TEST] Identify political-transition and institutional-fragmentation factors relevant to policing.',
      planningPurpose: '[PROMPT] Define the intended governance, policy, or oversight advisory objective.'
    },
    pestelsOverrides: {
      political: {
        finding: '[VERIFY] Assess whether command centralization, regional integration, or appointment practices affect professionalization.',
        rating: { impact: 5, urgency: 4, confidence: 2, relevance: 5 }
      },
      legal: {
        finding: '[VERIFY] Review whether police legislation and current constitutional or transition arrangements are coherent.',
        rating: { impact: 4, urgency: 5, confidence: 2, relevance: 5 }
      },
      security: {
        finding: '[VERIFY] Assess whether asymmetric threats are blurring civilian police roles or mandate boundaries.',
        rating: { impact: 4, urgency: 4, confidence: 2, relevance: 4 }
      }
    }
  },
  {
    id: 'ssr',
    name: 'Post-Conflict SSR Support',
    description: 'Focuses on security sector reform, demobilization, restructuring, policy reviews, and basic security integration.',
    profileDefaults: {
      countryName: 'Post-conflict context to verify',
      missionName: 'SSR support planning context',
      region: 'Area of operations to verify',
      mandateEnvironment: '[PROMPT] Confirm the authorized role in integration, vetting, and institutional restructuring.',
      hostStatePolice: 'Police institution to verify',
      conflictContext: '[ASSUMPTION TO TEST] Identify relevant DDR, arms-control, and post-conflict policing conditions.',
      planningPurpose: '[PROMPT] Define the intended SSR sequencing and civilian-oversight objective.'
    },
    pestelsOverrides: {
      political: {
        finding: '[VERIFY] Assess whether power-sharing arrangements or factional representation affect security-sector decision-making.',
        rating: { impact: 5, urgency: 4, confidence: 2, relevance: 5 }
      },
      social: {
        finding: '[VERIFY] Examine whether conflict-era conduct or community division affects trust in the police.',
        rating: { impact: 4, urgency: 5, confidence: 2, relevance: 5 }
      },
      legal: {
        finding: '[VERIFY] Review whether vetting laws and procedures adequately address integrity and human-rights concerns.',
        rating: { impact: 5, urgency: 5, confidence: 2, relevance: 5 }
      }
    }
  },
  {
    id: 'reform',
    name: 'Police Reform Advisory Mission',
    description: 'Targeted support for police professionalization, community policing, accountability, and modernization.',
    profileDefaults: {
      countryName: 'Police reform context to verify',
      missionName: 'Police reform advisory planning context',
      region: 'Area of operations to verify',
      mandateEnvironment: '[PROMPT] Confirm the scope for community policing, internal-investigation, and public-order advice.',
      hostStatePolice: 'Police institution to verify',
      conflictContext: '[ASSUMPTION TO TEST] Identify public-trust, crime, and institutional-transition factors relevant to reform.',
      planningPurpose: '[PROMPT] Define the intended professionalization and accountability objective.'
    },
    pestelsOverrides: {
      social: {
        finding: '[VERIFY] Assess civil-society expectations and whether institutional culture affects reform uptake.',
        rating: { impact: 4, urgency: 4, confidence: 2, relevance: 5 }
      },
      technological: {
        finding: '[VERIFY] Examine whether fragmented recordkeeping affects case tracking, evidence continuity, or reporting.',
        rating: { impact: 3, urgency: 4, confidence: 2, relevance: 4 }
      },
      legal: {
        finding: '[VERIFY] Review whether human-rights directives are reflected in practical police procedures and supervision.',
        rating: { impact: 4, urgency: 3, confidence: 2, relevance: 4 }
      }
    }
  },
  {
    id: 'capacity',
    name: 'Capacity-Building & Training Mission',
    description: 'Heavy training academy focus, basic policing skills, instructional development, and basic equipment support.',
    profileDefaults: {
      countryName: 'Capacity-building context to verify',
      missionName: 'Police training support planning context',
      region: 'Training locations to verify',
      mandateEnvironment: '[PROMPT] Confirm the authorized scope for training, curriculum, and equipment-coordination support.',
      hostStatePolice: 'Police training institution to verify',
      conflictContext: '[ASSUMPTION TO TEST] Identify operational, crime, and skills conditions affecting training priorities.',
      planningPurpose: '[PROMPT] Define the intended curriculum and sustainable training-capacity objective.'
    },
    pestelsOverrides: {
      economic: {
        finding: '[VERIFY] Assess academy budgets, maintenance capacity, and dependence on external funding.',
        rating: { impact: 4, urgency: 5, confidence: 2, relevance: 4 }
      },
      technological: {
        finding: '[VERIFY] Identify whether instructional technology, communications equipment, or simulation facilities are adequate.',
        rating: { impact: 3, urgency: 3, confidence: 2, relevance: 3 }
      },
      legal: {
        finding: '[VERIFY] Review curriculum currency and coverage of applicable human-rights and policing standards.',
        rating: { impact: 3, urgency: 4, confidence: 2, relevance: 5 }
      }
    }
  },
  {
    id: 'rol',
    name: 'Rule of Law / Justice-Chain Support',
    description: 'Integrated policing, prosecution, and courts coordination to ensure rule of law continuity.',
    profileDefaults: {
      countryName: 'Rule-of-law context to verify',
      missionName: 'Justice-chain support planning context',
      region: 'Police and justice locations to verify',
      mandateEnvironment: '[PROMPT] Confirm the mandate for police-prosecutor coordination, arrest compliance, and detention advice.',
      hostStatePolice: 'Police and justice institutions to verify',
      conflictContext: '[ASSUMPTION TO TEST] Identify justice-chain, detention, and due-process conditions relevant to planning.',
      planningPurpose: '[PROMPT] Define the intended custody, referral, and justice-coordination objective.'
    },
    pestelsOverrides: {
      political: {
        finding: '[VERIFY] Assess whether political interference affects judicial independence or police accountability.',
        rating: { impact: 4, urgency: 4, confidence: 2, relevance: 4 }
      },
      legal: {
        finding: '[VERIFY] Review arrest and detention law, procedural clarity, and actual compliance with applicable time limits.',
        rating: { impact: 5, urgency: 5, confidence: 2, relevance: 5 }
      },
      social: {
        finding: '[VERIFY] Examine whether arrest, detention, or access-to-justice outcomes differ across population groups.',
        rating: { impact: 3, urgency: 4, confidence: 2, relevance: 4 }
      }
    }
  },
  {
    id: 'blank',
    name: 'Start Blank (No Template)',
    description: 'A clean slate for mission planning. Initial findings and context values are empty, ready for custom analysis.',
    profileDefaults: {
      countryName: '',
      missionName: '',
      region: '',
      mandateEnvironment: '',
      hostStatePolice: '',
      conflictContext: '',
      planningPurpose: ''
    },
    pestelsOverrides: {
      political: { finding: '', why: '', sequencing: '', rating: { impact: 1, urgency: 1, confidence: 3, relevance: 1 } },
      economic: { finding: '', why: '', sequencing: '', rating: { impact: 1, urgency: 1, confidence: 3, relevance: 1 } },
      social: { finding: '', why: '', sequencing: '', rating: { impact: 1, urgency: 1, confidence: 3, relevance: 1 } },
      technological: { finding: '', why: '', sequencing: '', rating: { impact: 1, urgency: 1, confidence: 3, relevance: 1 } },
      environmental: { finding: '', why: '', sequencing: '', rating: { impact: 1, urgency: 1, confidence: 3, relevance: 1 } },
      legal: { finding: '', why: '', sequencing: '', rating: { impact: 1, urgency: 1, confidence: 3, relevance: 1 } },
      security: { finding: '', why: '', sequencing: '', rating: { impact: 1, urgency: 1, confidence: 3, relevance: 1 } }
    }
  }
];
