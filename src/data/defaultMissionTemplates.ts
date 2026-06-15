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
    description: 'Stabilization, civilian protection, and co-location in active conflict or transitional settings (e.g., Abyei / South Sudan context).',
    profileDefaults: {
      countryName: 'South Sudan / Abyei Area',
      missionName: 'UNISFA / UNMISS',
      region: 'Abyei Box / Greater Upper Nile',
      mandateEnvironment: 'Chapter VII, Protection of Civilians, Capacity Building Advisory, Co-location support',
      hostStatePolice: 'Host-State Police Service (SPS / APS)',
      conflictContext: 'Inter-communal violence, seasonal migration disputes, presence of armed militias',
      planningPurpose: 'Align UNPOL co-location mentoring and training with structural policing capacity building'
    },
    pestelsOverrides: {
      political: {
        finding: 'Command authority and political backing for policing remain uneven, which can weaken reform sequencing and operational consistency.',
        rating: { impact: 4, urgency: 4, confidence: 4, relevance: 5 }
      },
      economic: {
        finding: 'Resource constraints, irregular payroll, and weak logistics limit police mobility and expose personnel to corruption.',
        rating: { impact: 4, urgency: 3, confidence: 4, relevance: 4 }
      },
      social: {
        finding: 'Public trust varies across ethnic divisions, causing reporting barriers and reliance on traditional dispute systems.',
        rating: { impact: 3, urgency: 4, confidence: 3, relevance: 4 }
      },
      security: {
        finding: 'Volatile security environment, armed element incursions, and public order strains exceed standard policing capacity.',
        rating: { impact: 5, urgency: 5, confidence: 4, relevance: 5 }
      }
    }
  },
  {
    id: 'spm',
    name: 'Special Political Mission (SPM)',
    description: 'Non-executive advisory, strategic advice, and political transition support (e.g., Somalia / Haiti type contexts).',
    profileDefaults: {
      countryName: 'Transition State',
      missionName: 'UN Strategic Advisory Mission',
      region: 'Capital District and regional state capitals',
      mandateEnvironment: 'Strategic advice on security sector governance, policy planning, and legislative drafting',
      hostStatePolice: 'National Police Force',
      conflictContext: 'Post-conflict consolidation, high-level political factionalism, institutional fragmentation',
      planningPurpose: 'Guide high-level legislative reforms and oversight framework integration'
    },
    pestelsOverrides: {
      political: {
        finding: 'High centralization of command but low regional integration; political appointments delay professionalization.',
        rating: { impact: 5, urgency: 4, confidence: 3, relevance: 5 }
      },
      legal: {
        finding: 'Outdated police act from the pre-transition era conflicts with the newly drafted constitution.',
        rating: { impact: 4, urgency: 5, confidence: 4, relevance: 5 }
      },
      security: {
        finding: 'Asymmetric threats in peripheral regions require distinct militarized police roles, muddying civilian police mandates.',
        rating: { impact: 4, urgency: 4, confidence: 3, relevance: 4 }
      }
    }
  },
  {
    id: 'ssr',
    name: 'Post-Conflict SSR Support',
    description: 'Focuses on security sector reform, demobilization, restructuring, policy reviews, and basic security integration.',
    profileDefaults: {
      countryName: 'Post-Conflict Nation',
      missionName: 'SSR Support & Advisory Team',
      region: 'Nationwide with focus on former conflict zones',
      mandateEnvironment: 'Support integration of former combatants, institutional vetting, and structural restructuring',
      hostStatePolice: 'National Civil Police (NCP)',
      conflictContext: 'Post-war disarmament, demobilization, and reintegration (DDR) phase with high small arms availability',
      planningPurpose: 'Sequence the demilitarization of policing and build civilian oversight capacity'
    },
    pestelsOverrides: {
      political: {
        finding: 'Power-sharing agreements place rival factions in key security ministries, leading to gridlock.',
        rating: { impact: 5, urgency: 4, confidence: 3, relevance: 5 }
      },
      social: {
        finding: 'Deep community division and fear of police due to past human rights violations during the conflict.',
        rating: { impact: 4, urgency: 5, confidence: 4, relevance: 5 }
      },
      legal: {
        finding: 'Vetting laws are weak, allowing individuals with records of violations to remain in command positions.',
        rating: { impact: 5, urgency: 5, confidence: 4, relevance: 5 }
      }
    }
  },
  {
    id: 'reform',
    name: 'Police Reform Advisory Mission',
    description: 'Targeted support for police professionalization, community policing, accountability, and modernization.',
    profileDefaults: {
      countryName: 'Democratizing State',
      missionName: 'Police Modernization & Reform Support',
      region: 'Urban and rural police districts',
      mandateEnvironment: 'Technical assistance on community policing, internal investigations, and public order management',
      hostStatePolice: 'State Police Department',
      conflictContext: 'Low-intensity civil unrest, urban crime syndicates, transition from authoritarian state policing',
      planningPurpose: 'Implement community-oriented policing models and strengthen internal accountability bodies'
    },
    pestelsOverrides: {
      social: {
        finding: 'Demand from civil society for democratic policing, but police culture remains insular and resistant to change.',
        rating: { impact: 4, urgency: 4, confidence: 5, relevance: 5 }
      },
      technological: {
        finding: 'Fragmented recordkeeping blocks proper case-tracking, leading to loss of evidence and case dismissals.',
        rating: { impact: 3, urgency: 4, confidence: 4, relevance: 4 }
      },
      legal: {
        finding: 'New human rights directives exist on paper but have not been translated into practical police SOPs.',
        rating: { impact: 4, urgency: 3, confidence: 4, relevance: 4 }
      }
    }
  },
  {
    id: 'capacity',
    name: 'Capacity-Building & Training Mission',
    description: 'Heavy training academy focus, basic policing skills, instructional development, and basic equipment support.',
    profileDefaults: {
      countryName: 'Developing State',
      missionName: 'UNPOL Capacity Building Team',
      region: 'Central Training Academy and regional training centers',
      mandateEnvironment: 'Train-the-trainer programs, curriculum development, and basic equipment donation coordination',
      hostStatePolice: 'National Police Service',
      conflictContext: 'Stable but fragile context with high rate of basic crime and low technical skills',
      planningPurpose: 'Modernize basic officer curriculum and build sustainable host-state training capacity'
    },
    pestelsOverrides: {
      economic: {
        finding: 'Zero budget for training maintenance; academy buildings and vehicles are decaying without donor funds.',
        rating: { impact: 4, urgency: 5, confidence: 5, relevance: 4 }
      },
      technological: {
        finding: 'Lack of basic instructional technology, radio training equipment, or simulation facilities.',
        rating: { impact: 3, urgency: 3, confidence: 5, relevance: 3 }
      },
      legal: {
        finding: 'Academy curriculum has not been updated in twenty years and lacks modern human rights modules.',
        rating: { impact: 3, urgency: 4, confidence: 5, relevance: 5 }
      }
    }
  },
  {
    id: 'rol',
    name: 'Rule of Law / Justice-Chain Support',
    description: 'Integrated policing, prosecution, and courts coordination to ensure rule of law continuity.',
    profileDefaults: {
      countryName: 'Rule of Law Support State',
      missionName: 'Joint Rule of Law Advisory Section',
      region: 'Courts and police districts nationwide',
      mandateEnvironment: 'Advise on police-prosecutor coordination, arrest compliance, and pre-trial detention limits',
      hostStatePolice: 'Judicial and Civil Police Forces',
      conflictContext: 'Systemic breakdown of the justice chain, overcrowded prisons, and arbitrary arrests',
      planningPurpose: 'Strengthen custody tracking workflows and police compliance with prosecution orders'
    },
    pestelsOverrides: {
      political: {
        finding: 'Executive interference in judicial processes creates impunity for politically connected individuals.',
        rating: { impact: 4, urgency: 4, confidence: 3, relevance: 4 }
      },
      legal: {
        finding: 'Statutory arrest laws are highly ambiguous, leading to routine detentions beyond the 48-hour constitutional limit.',
        rating: { impact: 5, urgency: 5, confidence: 5, relevance: 5 }
      },
      social: {
        finding: 'Marginalized groups face disproportionate arrest rates, compounding public anger and distrust.',
        rating: { impact: 3, urgency: 4, confidence: 4, relevance: 4 }
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
