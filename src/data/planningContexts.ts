import { PlanningContext } from '../types/explorer';

const PEACEKEEPING_PROFILE_LAST_REVIEWED = '2026-06-15';
const PEACEKEEPING_SOURCE_URL = 'https://peacekeeping.un.org/en/where-we-operate';

const genericPeacekeepingPestelsPrompts: PlanningContext['planningPrompts']['pestelsPrompts'] = {
  political: {
    prompt: 'Verify the current political-transition, peace-agreement, or ceasefire framework authorized by the mandate before evaluating police governance.',
    whyPrompt: 'Test whether political or territorial negotiations restrict police authority, jurisdiction, or institutional reform pace.'
  },
  economic: {
    prompt: 'Examine verified host-state budget allocations, donor-funded police programs, and officer compensation conditions.',
    whyPrompt: 'Test whether resource shortfalls or donor-project dependencies create sustainability risks for proposed capacity building.'
  },
  social: {
    prompt: 'Assess verified public trust levels, civil society perceptions, and inter-communal dynamics toward the host-state police.',
    whyPrompt: 'Test whether community trust deficits dictate decentralized, community-oriented, or protective policing priorities.'
  },
  technological: {
    prompt: 'Assess verified records management, communications equipment, custody registries, and fleet mobility systems.',
    whyPrompt: 'Test whether basic infrastructure or communications deficits limit standard operating procedure enforcement.'
  },
  environmental: {
    prompt: 'Identify verified seasonal access constraints, climate-related displacement, or geography affecting police presence.',
    whyPrompt: 'Test whether geographic reach and weather conditions demand mobile or decentralized training deployments.'
  },
  legal: {
    prompt: 'Review verified statutory mandates, criminal procedure codes, custody limits, and accountability legislation.',
    whyPrompt: 'Test whether legal ambiguities in arrest or detention authority create human rights or due-process risks.'
  },
  security: {
    prompt: 'Analyze verified threat profiles, presence of armed actors, public-order risks, and physical security for police personnel.',
    whyPrompt: 'Test whether acute security threats constrain civilian policing and require paired protection arrangements.'
  }
};

const genericPeacekeepingStakeholderPrompts: PlanningContext['planningPrompts']['stakeholderPrompts'] = [
  {
    category: 'UN Mission',
    rolePrompt: 'Identify the verified mission component, police adviser, rule-of-law focal point, or coordination office relevant to the planning question.',
    suggestedStakeholders: ['Verified mission focal point to identify']
  },
  {
    category: 'Host State',
    rolePrompt: 'Identify the host-state police, justice, interior, or oversight institution whose mandate and authority must be verified.',
    suggestedStakeholders: ['Host-state police institution to verify']
  },
  {
    category: 'Civil Society',
    rolePrompt: 'Identify legitimacy, accountability, gender, protection, or community-safety voices that should be consulted after context verification.',
    suggestedStakeholders: ['Accountability or community-safety actor to verify']
  }
];

export const CANONICAL_PLANNING_CONTEXTS: PlanningContext[] = [
  // 1. MINURSO
  {
    schemaVersion: 2,
    id: 'pk-minurso',
    legacyIds: [],
    identity: {
      countryArea: 'Western Sahara',
      iso3: 'ESH',
      region: 'North Africa / Western Sahara',
      missionName: 'United Nations Mission for the Referendum in Western Sahara',
      missionAcronym: 'MINURSO',
      missionType: 'Current UN Peacekeeping Operation',
      sourceCategory: 'Current UN Peacekeeping Operation'
    },
    operationalStatus: 'active',
    verificationStatus: 'review-required',
    geography: {
      longitude: -13.2,
      latitude: 24.5,
      labelOffset: { x: -72, y: -36 }
    },
    provenance: {
      sources: [
        {
          id: 'src-un-dpko-minurso',
          title: 'UN Peacekeeping Operations Where We Operate',
          organization: 'United Nations Peacekeeping',
          sourceType: 'official-portal',
          url: PEACEKEEPING_SOURCE_URL,
          publicationDate: null,
          reviewedDate: PEACEKEEPING_PROFILE_LAST_REVIEWED,
          supports: ['mandateSummary', 'operationalStatus']
        }
      ],
      profileLastReviewed: PEACEKEEPING_PROFILE_LAST_REVIEWED,
      coverageScope: 'current-peacekeeping-reference',
      limitations: [
        'Current mission status and mandate were not independently re-verified for this reference profile and must be checked before operational use.'
      ]
    },
    reference: {
      mandateSummary: {
        text: 'United Nations Mission for the Referendum in Western Sahara.',
        sourceIds: ['src-un-dpko-minurso']
      },
      policeRelevance: {
        text: 'Limited civilian police component; mandate focuses on monitoring the ceasefire and organizing a referendum if agreed.',
        sourceIds: []
      },
      hostStatePolice: {
        text: 'Host-state police or relevant security-sector institution to verify',
        sourceIds: []
      },
      planningThemes: ['Mandate verification', 'Police component relevance', 'Stakeholder mapping', 'Evidence gaps']
    },
    planningPrompts: {
      stage1Guidance: {
        mandateEnvironmentPrompt: 'Review the current official mandate and confirm whether MINURSO has police, rule-of-law, protection, or advisory relevance for this planning exercise.',
        conflictContextPrompt: 'Identify the current public-safety, protection, political, legal, and institutional conditions from verified sources before recording findings.',
        planningPurposePrompt: 'Define a CBD planning purpose only after mandate scope, counterpart institutions, and evidence gaps are verified.'
      },
      pestelsPrompts: genericPeacekeepingPestelsPrompts,
      stakeholderPrompts: genericPeacekeepingStakeholderPrompts,
      suggestedStakeholderCategories: ['UN Mission', 'Host State', 'Police Institution', 'Civil Society']
    }
  },

  // 2. MINUSCA
  {
    schemaVersion: 2,
    id: 'pk-minusca',
    legacyIds: [],
    identity: {
      countryArea: 'Central African Republic',
      iso3: 'CAF',
      region: 'Central Africa / Central African Republic',
      missionName: 'United Nations Multidimensional Integrated Stabilization Mission in the Central African Republic',
      missionAcronym: 'MINUSCA',
      missionType: 'Current UN Peacekeeping Operation',
      sourceCategory: 'Current UN Peacekeeping Operation'
    },
    operationalStatus: 'active',
    verificationStatus: 'review-required',
    geography: {
      longitude: 20.94,
      latitude: 6.61,
      labelOffset: { x: -92, y: 12 }
    },
    provenance: {
      sources: [
        {
          id: 'src-un-dpko-minusca',
          title: 'UN Peacekeeping Operations Where We Operate',
          organization: 'United Nations Peacekeeping',
          sourceType: 'official-portal',
          url: PEACEKEEPING_SOURCE_URL,
          publicationDate: null,
          reviewedDate: PEACEKEEPING_PROFILE_LAST_REVIEWED,
          supports: ['mandateSummary', 'operationalStatus']
        }
      ],
      profileLastReviewed: PEACEKEEPING_PROFILE_LAST_REVIEWED,
      coverageScope: 'current-peacekeeping-reference',
      limitations: [
        'Current mission status and mandate were not independently re-verified for this reference profile and must be checked before operational use.'
      ]
    },
    reference: {
      mandateSummary: {
        text: 'United Nations Multidimensional Integrated Stabilization Mission in the Central African Republic.',
        sourceIds: ['src-un-dpko-minusca']
      },
      policeRelevance: {
        text: 'Protection of civilians, support to extension of state authority, and capacity development of national police and gendarmerie.',
        sourceIds: []
      },
      hostStatePolice: {
        text: 'Police Nationale Centrafricaine / Gendarmerie Nationale (verify current structure)',
        sourceIds: []
      },
      planningThemes: ['Mandate verification', 'Police component relevance', 'Stakeholder mapping', 'Evidence gaps']
    },
    planningPrompts: {
      stage1Guidance: {
        mandateEnvironmentPrompt: 'Review the current official mandate and confirm whether MINUSCA has police, rule-of-law, protection, or advisory relevance for this planning exercise.',
        conflictContextPrompt: 'Identify the current public-safety, protection, political, legal, and institutional conditions from verified sources before recording findings.',
        planningPurposePrompt: 'Define a CBD planning purpose only after mandate scope, counterpart institutions, and evidence gaps are verified.'
      },
      pestelsPrompts: genericPeacekeepingPestelsPrompts,
      stakeholderPrompts: genericPeacekeepingStakeholderPrompts,
      suggestedStakeholderCategories: ['UN Mission', 'Host State', 'Police Institution', 'Civil Society']
    }
  },

  // 3. MONUSCO (Consolidated from seed-monusco)
  {
    schemaVersion: 2,
    id: 'pk-monusco',
    legacyIds: ['seed-monusco'],
    identity: {
      countryArea: 'Democratic Republic of the Congo',
      iso3: 'COD',
      region: 'Central Africa / North & South Kivu',
      missionName: 'UN Organization Stabilization Mission in the DRC',
      missionAcronym: 'MONUSCO',
      missionType: 'UN Peacekeeping Mission',
      sourceCategory: 'Current UN Peacekeeping Operation'
    },
    operationalStatus: 'active',
    verificationStatus: 'review-required',
    geography: {
      longitude: 29.22,
      latitude: -1.68,
      labelOffset: { x: -88, y: 54 }
    },
    provenance: {
      sources: [
        {
          id: 'src-unscr-2717',
          title: 'UN Security Council Resolution 2717 (2023)',
          organization: 'United Nations Security Council',
          sourceType: 'un-mandate',
          url: null,
          publicationDate: '2023',
          reviewedDate: null,
          supports: ['mandateSummary', 'planningThemes', 'hostStatePolice']
        }
      ],
      profileLastReviewed: null,
      coverageScope: 'selected-starter',
      limitations: [
        'Baseline reference: UN Security Council Resolution 2717 (2023). Current mission status, transition arrangements, and mandate were not independently re-verified for this profile and must be checked before use.'
      ]
    },
    reference: {
      mandateSummary: {
        text: 'Protection of civilians, support to security sector reform, and transition/disengagement arrangements.',
        sourceIds: ['src-unscr-2717']
      },
      policeRelevance: {
        text: 'Support to Police Nationale Congolaise (PNC) in public order management, human rights compliance, and progressive capacity handover.',
        sourceIds: ['src-unscr-2717']
      },
      hostStatePolice: {
        text: 'Police Nationale Congolaise (PNC)',
        sourceIds: ['src-unscr-2717']
      },
      planningThemes: ['Transition Strategy', 'Crowd Control Standards', 'Provincial Police Advisors']
    },
    planningPrompts: {
      stage1Guidance: {
        mandateEnvironmentPrompt: 'Review the current MONUSCO mandate and transition arrangements before defining police-support activities.',
        conflictContextPrompt: 'Assess current conflict, displacement, public-order, and regional factors affecting civilian policing.',
        planningPurposePrompt: 'Determine whether public-order compliance, accountability, or capacity-transfer support should be prioritized.'
      },
      pestelsPrompts: {
        political: {
          prompt: 'Assess the political impact of the MONUSCO transition timeline on national police reform commitments.',
          whyPrompt: 'Fast timelines may pressure PNC to assume public order duties before training is fully institutionalized.'
        },
        economic: {
          prompt: 'Examine national funding allocations for provincial police garrisons and basic equipment upkeep.',
          whyPrompt: 'Lack of local funding limits the operations of provincial police advisory councils.'
        },
        social: {
          prompt: 'Verify public trust levels toward national crowd-control units during political demonstrations.',
          whyPrompt: 'Severe trust deficits require civil society oversight in crowd-control training.'
        },
        technological: {
          prompt: 'Assess PNC communication security and command coordination in high-stress operational areas.',
          whyPrompt: 'Vulnerable communication lines risk command failure during joint operations.'
        },
        environmental: {
          prompt: 'Assess geographical challenges and road conditions affecting police rapid deployment in the Kivus.',
          whyPrompt: 'Poor road infrastructure limits police presence to major urban centers.'
        },
        legal: {
          prompt: 'Review national laws governing the use of force and assemblies in relation to international human rights standards.',
          whyPrompt: 'Outdated codes require formal alignment with the UN Code of Conduct for Law Enforcement Officials.'
        },
        security: {
          prompt: 'Analyze threat profiles from organized armed movements active near urban policing districts.',
          whyPrompt: 'Heavy military threats complicate civilian policing roles in stabilizing post-conflict zones.'
        }
      },
      stakeholderPrompts: [
        {
          category: 'Police Institution',
          rolePrompt: 'Coordinates PNC operations, provincial commands, and tactical police interventions.',
          suggestedStakeholders: ['PNC Commissariat Général', 'PNC Provincial Commander - North Kivu']
        },
        {
          category: 'UN Mission',
          rolePrompt: 'Provides tactical advice, monitors PNC conduct, and supports security sector governance.',
          suggestedStakeholders: ['MONUSCO UNPOL Commissioner', 'MONUSCO Human Rights Joint Office']
        }
      ],
      suggestedStakeholderCategories: ['UN Mission', 'Host State', 'Civil Society', 'Regional Actors']
    }
  },

  // 4. UNDOF
  {
    schemaVersion: 2,
    id: 'pk-undof',
    legacyIds: [],
    identity: {
      countryArea: 'Golan',
      iso3: 'SYR',
      region: 'Middle East / Golan',
      missionName: 'United Nations Disengagement Observer Force',
      missionAcronym: 'UNDOF',
      missionType: 'Current UN Peacekeeping Operation',
      sourceCategory: 'Current UN Peacekeeping Operation'
    },
    operationalStatus: 'active',
    verificationStatus: 'review-required',
    geography: {
      longitude: 35.82,
      latitude: 33.05,
      labelOffset: { x: 86, y: -54 }
    },
    provenance: {
      sources: [
        {
          id: 'src-un-dpko-undof',
          title: 'UN Peacekeeping Operations Where We Operate',
          organization: 'United Nations Peacekeeping',
          sourceType: 'official-portal',
          url: PEACEKEEPING_SOURCE_URL,
          publicationDate: null,
          reviewedDate: PEACEKEEPING_PROFILE_LAST_REVIEWED,
          supports: ['mandateSummary', 'operationalStatus']
        }
      ],
      profileLastReviewed: PEACEKEEPING_PROFILE_LAST_REVIEWED,
      coverageScope: 'current-peacekeeping-reference',
      limitations: [
        'Current mission status and mandate were not independently re-verified for this reference profile and must be checked before operational use.'
      ]
    },
    reference: {
      mandateSummary: {
        text: 'United Nations Disengagement Observer Force in the Golan.',
        sourceIds: ['src-un-dpko-undof']
      },
      policeRelevance: {
        text: 'Military observer force; verify if any civilian police or rule-of-law liaison roles exist.',
        sourceIds: []
      },
      hostStatePolice: {
        text: 'Host-state police or relevant security-sector institution to verify',
        sourceIds: []
      },
      planningThemes: ['Mandate verification', 'Police component relevance', 'Stakeholder mapping', 'Evidence gaps']
    },
    planningPrompts: {
      stage1Guidance: {
        mandateEnvironmentPrompt: 'Review the current official mandate and confirm whether UNDOF has police, rule-of-law, protection, or advisory relevance for this planning exercise.',
        conflictContextPrompt: 'Identify the current public-safety, protection, political, legal, and institutional conditions from verified sources before recording findings.',
        planningPurposePrompt: 'Define a CBD planning purpose only after mandate scope, counterpart institutions, and evidence gaps are verified.'
      },
      pestelsPrompts: genericPeacekeepingPestelsPrompts,
      stakeholderPrompts: genericPeacekeepingStakeholderPrompts,
      suggestedStakeholderCategories: ['UN Mission', 'Host State', 'Police Institution', 'Civil Society']
    }
  },

  // 5. UNFICYP
  {
    schemaVersion: 2,
    id: 'pk-unficyp',
    legacyIds: [],
    identity: {
      countryArea: 'Cyprus',
      iso3: 'CYP',
      region: 'Europe / Cyprus',
      missionName: 'United Nations Peacekeeping Force in Cyprus',
      missionAcronym: 'UNFICYP',
      missionType: 'Current UN Peacekeeping Operation',
      sourceCategory: 'Current UN Peacekeeping Operation'
    },
    operationalStatus: 'active',
    verificationStatus: 'review-required',
    geography: {
      longitude: 33.38,
      latitude: 35.18,
      labelOffset: { x: -92, y: -62 }
    },
    provenance: {
      sources: [
        {
          id: 'src-un-dpko-unficyp',
          title: 'UN Peacekeeping Operations Where We Operate',
          organization: 'United Nations Peacekeeping',
          sourceType: 'official-portal',
          url: PEACEKEEPING_SOURCE_URL,
          publicationDate: null,
          reviewedDate: PEACEKEEPING_PROFILE_LAST_REVIEWED,
          supports: ['mandateSummary', 'operationalStatus']
        }
      ],
      profileLastReviewed: PEACEKEEPING_PROFILE_LAST_REVIEWED,
      coverageScope: 'current-peacekeeping-reference',
      limitations: [
        'Current mission status and mandate were not independently re-verified for this reference profile and must be checked before operational use.'
      ]
    },
    reference: {
      mandateSummary: {
        text: 'United Nations Peacekeeping Force in Cyprus.',
        sourceIds: ['src-un-dpko-unficyp']
      },
      policeRelevance: {
        text: 'UNPOL component maintains liaison and fosters cooperation between Greek Cypriot and Turkish Cypriot police forces in the buffer zone.',
        sourceIds: ['src-un-dpko-unficyp']
      },
      hostStatePolice: {
        text: 'Cyprus Police / Turkish Cypriot police elements (verify liaison status)',
        sourceIds: []
      },
      planningThemes: ['Mandate verification', 'Police component relevance', 'Stakeholder mapping', 'Evidence gaps']
    },
    planningPrompts: {
      stage1Guidance: {
        mandateEnvironmentPrompt: 'Review the current official mandate and confirm whether UNFICYP has police, rule-of-law, protection, or advisory relevance for this planning exercise.',
        conflictContextPrompt: 'Identify the current public-safety, protection, political, legal, and institutional conditions from verified sources before recording findings.',
        planningPurposePrompt: 'Define a CBD planning purpose only after mandate scope, counterpart institutions, and evidence gaps are verified.'
      },
      pestelsPrompts: genericPeacekeepingPestelsPrompts,
      stakeholderPrompts: genericPeacekeepingStakeholderPrompts,
      suggestedStakeholderCategories: ['UN Mission', 'Host State', 'Police Institution', 'Civil Society']
    }
  },

  // 6. UNIFIL
  {
    schemaVersion: 2,
    id: 'pk-unifil',
    legacyIds: [],
    identity: {
      countryArea: 'Lebanon',
      iso3: 'LBN',
      region: 'Middle East / Lebanon',
      missionName: 'United Nations Interim Force in Lebanon',
      missionAcronym: 'UNIFIL',
      missionType: 'Current UN Peacekeeping Operation',
      sourceCategory: 'Current UN Peacekeeping Operation'
    },
    operationalStatus: 'active',
    verificationStatus: 'review-required',
    geography: {
      longitude: 35.42,
      latitude: 33.22,
      labelOffset: { x: -94, y: 18 }
    },
    provenance: {
      sources: [
        {
          id: 'src-un-dpko-unifil',
          title: 'UN Peacekeeping Operations Where We Operate',
          organization: 'United Nations Peacekeeping',
          sourceType: 'official-portal',
          url: PEACEKEEPING_SOURCE_URL,
          publicationDate: null,
          reviewedDate: PEACEKEEPING_PROFILE_LAST_REVIEWED,
          supports: ['mandateSummary', 'operationalStatus']
        }
      ],
      profileLastReviewed: PEACEKEEPING_PROFILE_LAST_REVIEWED,
      coverageScope: 'current-peacekeeping-reference',
      limitations: [
        'Current mission status and mandate were not independently re-verified for this reference profile and must be checked before operational use.'
      ]
    },
    reference: {
      mandateSummary: {
        text: 'United Nations Interim Force in Lebanon.',
        sourceIds: ['src-un-dpko-unifil']
      },
      policeRelevance: {
        text: 'Primary focus is military cessation of hostilities and support to Lebanese Armed Forces (LAF); civilian police relevance to verify.',
        sourceIds: []
      },
      hostStatePolice: {
        text: 'Internal Security Forces (ISF) / LAF liaison (verify relevance)',
        sourceIds: []
      },
      planningThemes: ['Mandate verification', 'Police component relevance', 'Stakeholder mapping', 'Evidence gaps']
    },
    planningPrompts: {
      stage1Guidance: {
        mandateEnvironmentPrompt: 'Review the current official mandate and confirm whether UNIFIL has police, rule-of-law, protection, or advisory relevance for this planning exercise.',
        conflictContextPrompt: 'Identify the current public-safety, protection, political, legal, and institutional conditions from verified sources before recording findings.',
        planningPurposePrompt: 'Define a CBD planning purpose only after mandate scope, counterpart institutions, and evidence gaps are verified.'
      },
      pestelsPrompts: genericPeacekeepingPestelsPrompts,
      stakeholderPrompts: genericPeacekeepingStakeholderPrompts,
      suggestedStakeholderCategories: ['UN Mission', 'Host State', 'Police Institution', 'Civil Society']
    }
  },

  // 7. UNISFA (Consolidated from seed-unisfa)
  {
    schemaVersion: 2,
    id: 'pk-unisfa',
    legacyIds: ['seed-unisfa'],
    identity: {
      countryArea: 'Sudan / South Sudan (Abyei Area)',
      iso3: 'SSD',
      region: 'East Africa / Abyei Sector',
      missionName: 'UN Interim Security Force for Abyei',
      missionAcronym: 'UNISFA',
      missionType: 'UN Peacekeeping Mission',
      sourceCategory: 'Current UN Peacekeeping Operation'
    },
    operationalStatus: 'active',
    verificationStatus: 'review-required',
    geography: {
      longitude: 28.45,
      latitude: 9.6,
      labelOffset: { x: -92, y: -46 }
    },
    provenance: {
      sources: [
        {
          id: 'src-unscr-1990',
          title: 'UN Security Council Resolution 1990 (2011)',
          organization: 'United Nations Security Council',
          sourceType: 'un-mandate',
          url: null,
          publicationDate: '2011',
          reviewedDate: null,
          supports: ['mandateSummary', 'planningThemes', 'policeRelevance', 'hostStatePolice']
        }
      ],
      profileLastReviewed: null,
      coverageScope: 'selected-starter',
      limitations: [
        'Baseline reference: UN Security Council Resolution 1990 (2011). Current mission status and mandate were not independently re-verified for this profile and must be checked before use.'
      ]
    },
    reference: {
      mandateSummary: {
        text: 'Demilitarization of Abyei Area, protection of civilians, and support to the establishment of the Abyei Joint Police Service.',
        sourceIds: ['src-unscr-1990']
      },
      policeRelevance: {
        text: 'Facilitating local dispute resolution, community policing, and technical support for joint police arrangements.',
        sourceIds: ['src-unscr-1990']
      },
      hostStatePolice: {
        text: 'Abyei Joint Police Service (proposed) / Local police elements',
        sourceIds: ['src-unscr-1990']
      },
      planningThemes: ['Disputed Border Policing', 'Community Peace Liaison Panels', 'Inter-communal Disputes']
    },
    planningPrompts: {
      stage1Guidance: {
        mandateEnvironmentPrompt: 'Review the current UNISFA mandate and confirm the authorized role of the police component.',
        conflictContextPrompt: 'Assess current governance, legal, mobility, and inter-community conditions affecting policing in the area.',
        planningPurposePrompt: 'Determine whether community-safety mechanisms and basic police administration are appropriate capacity-building priorities.'
      },
      pestelsPrompts: {
        political: {
          prompt: 'Identify how the unresolved final status of Abyei and dual Sudan/South Sudan administrative claims affect local police legitimacy and governance.',
          whyPrompt: 'Uncertain command authority makes establishing unified policing protocols highly sensitive.'
        },
        economic: {
          prompt: 'Examine resource constraints, salary backlogs, and basic infrastructure support for local police officers.',
          whyPrompt: 'Severe resource scarcity increases police exposure to community resourcing and corruption risks.'
        },
        social: {
          prompt: 'Verify trusted relationships and seasonal migration patterns between Ngok Dinka and Misseriya communities.',
          whyPrompt: 'Politicized trust dynamics require localized community-security advisory committees.'
        },
        technological: {
          prompt: 'Assess communication systems, vehicle mobility, and basic custody registry databases in the local sectors.',
          whyPrompt: 'Absence of basic data tools limits custody tracking and reporting oversight.'
        },
        environmental: {
          prompt: 'Identify the impact of seasonal rainy seasons and flooding on police mobility and sector access.',
          whyPrompt: 'Severe flooding cuts off remote police posts, complicating emergency response.'
        },
        legal: {
          prompt: 'Verify the coexistence of traditional chief courts, customary law codes, and statutory arrest procedures.',
          whyPrompt: 'Unclear legal boundaries between chiefs and statutory officers complicate human-rights-compliant detentions.'
        },
        security: {
          prompt: 'Evaluate security risks posed by seasonal armed cattle migrations and localized clashes.',
          whyPrompt: 'High security volatility requires coordinating civilian early-warning posts with military deterrent patrols.'
        }
      },
      stakeholderPrompts: [
        {
          category: 'Host State',
          rolePrompt: 'Local leadership elements coordinating interim joint police administration and dispute mediation.',
          suggestedStakeholders: ['Abyei Joint Oversight Committee (AJOC)', 'Local Police Working Group']
        },
        {
          category: 'Civil Society',
          rolePrompt: 'Represents community security views, customary leaders, and traditional court elders.',
          suggestedStakeholders: ['Traditional Leaders Council', 'Joint Peace Committee Elders']
        }
      ],
      suggestedStakeholderCategories: ['UN Mission', 'Host State', 'Civil Society']
    }
  },

  // 8. UNMIK
  {
    schemaVersion: 2,
    id: 'pk-unmik',
    legacyIds: [],
    identity: {
      countryArea: 'Kosovo',
      iso3: 'XKX',
      region: 'Europe / Kosovo',
      missionName: 'United Nations Interim Administration Mission in Kosovo',
      missionAcronym: 'UNMIK',
      missionType: 'Current UN Peacekeeping Operation',
      sourceCategory: 'Current UN Peacekeeping Operation'
    },
    operationalStatus: 'active',
    verificationStatus: 'review-required',
    geography: {
      longitude: 20.9,
      latitude: 42.6,
      labelOffset: { x: -82, y: -36 }
    },
    provenance: {
      sources: [
        {
          id: 'src-un-dpko-unmik',
          title: 'UN Peacekeeping Operations Where We Operate',
          organization: 'United Nations Peacekeeping',
          sourceType: 'official-portal',
          url: PEACEKEEPING_SOURCE_URL,
          publicationDate: null,
          reviewedDate: PEACEKEEPING_PROFILE_LAST_REVIEWED,
          supports: ['mandateSummary', 'operationalStatus']
        }
      ],
      profileLastReviewed: PEACEKEEPING_PROFILE_LAST_REVIEWED,
      coverageScope: 'current-peacekeeping-reference',
      limitations: [
        'Current mission status and mandate were not independently re-verified for this reference profile and must be checked before operational use.'
      ]
    },
    reference: {
      mandateSummary: {
        text: 'United Nations Interim Administration Mission in Kosovo (UNSCR 1244).',
        sourceIds: ['src-un-dpko-unmik']
      },
      policeRelevance: {
        text: 'Rule-of-law monitoring, human rights reporting, and INTERPOL liaison coordination.',
        sourceIds: ['src-un-dpko-unmik']
      },
      hostStatePolice: {
        text: 'Kosovo Police (KP) / Rule-of-law counterparts',
        sourceIds: []
      },
      planningThemes: ['Mandate verification', 'Police component relevance', 'Stakeholder mapping', 'Evidence gaps']
    },
    planningPrompts: {
      stage1Guidance: {
        mandateEnvironmentPrompt: 'Review the current official mandate and confirm whether UNMIK has police, rule-of-law, protection, or advisory relevance for this planning exercise.',
        conflictContextPrompt: 'Identify the current public-safety, protection, political, legal, and institutional conditions from verified sources before recording findings.',
        planningPurposePrompt: 'Define a CBD planning purpose only after mandate scope, counterpart institutions, and evidence gaps are verified.'
      },
      pestelsPrompts: genericPeacekeepingPestelsPrompts,
      stakeholderPrompts: genericPeacekeepingStakeholderPrompts,
      suggestedStakeholderCategories: ['UN Mission', 'Host State', 'Police Institution', 'Civil Society']
    }
  },

  // 9. UNMISS (Consolidated from seed-unmiss)
  {
    schemaVersion: 2,
    id: 'pk-unmiss',
    legacyIds: ['seed-unmiss'],
    identity: {
      countryArea: 'South Sudan',
      iso3: 'SSD',
      region: 'East Africa / Central Equatoria',
      missionName: 'UN Mission in South Sudan',
      missionAcronym: 'UNMISS',
      missionType: 'UN Peacekeeping Mission',
      sourceCategory: 'Current UN Peacekeeping Operation'
    },
    operationalStatus: 'active',
    verificationStatus: 'review-required',
    geography: {
      longitude: 31.58,
      latitude: 4.85,
      labelOffset: { x: 80, y: 42 }
    },
    provenance: {
      sources: [
        {
          id: 'src-unscr-2729',
          title: 'UN Security Council Resolution 2729 (2024)',
          organization: 'United Nations Security Council',
          sourceType: 'un-mandate',
          url: null,
          publicationDate: '2024',
          reviewedDate: null,
          supports: ['mandateSummary', 'planningThemes', 'policeRelevance', 'hostStatePolice']
        }
      ],
      profileLastReviewed: null,
      coverageScope: 'selected-starter',
      limitations: [
        'Baseline reference: UN Security Council Resolution 2729 (2024). Current mission status and mandate were not independently re-verified for this profile and must be checked before use.'
      ]
    },
    reference: {
      mandateSummary: {
        text: 'Protection of civilians, human rights monitoring, and support for the implementation of the Revitalized Peace Agreement.',
        sourceIds: ['src-unscr-2729']
      },
      policeRelevance: {
        text: 'Technical assistance and advisory support to South Sudan National Police Service (SSNPS) in human rights, detention monitoring, and community-oriented policing.',
        sourceIds: ['src-unscr-2729']
      },
      hostStatePolice: {
        text: 'South Sudan National Police Service (SSNPS)',
        sourceIds: ['src-unscr-2729']
      },
      planningThemes: ['National Police Reform', 'Human Rights Due Diligence', 'Detention Accountability']
    },
    planningPrompts: {
      stage1Guidance: {
        mandateEnvironmentPrompt: 'Review the current UNMISS mandate and confirm the authorized police advisory functions.',
        conflictContextPrompt: 'Assess current transition, public-safety, access, and local-governance conditions affecting policing.',
        planningPurposePrompt: 'Determine whether internal investigation and detention-inspection workflows are appropriate advisory priorities.'
      },
      pestelsPrompts: {
        political: {
          prompt: 'Assess how national transition timelines and political factions influence senior police appointments.',
          whyPrompt: 'Highly politicized command structures can undermine reform sustainability.'
        },
        economic: {
          prompt: 'Examine SSNPS budget allocation, payment delays, and reliance on donor funding for basic academy training.',
          whyPrompt: 'Underfunded academies rely heavily on international partners for training curriculum.'
        },
        social: {
          prompt: 'Examine trust deficits between urban community members and centralized police units.',
          whyPrompt: 'High trust deficits require decentralized, community-oriented policing advisory panels.'
        },
        technological: {
          prompt: 'Identify the state of national biometric records, criminal records databases, and command radio coverage.',
          whyPrompt: 'Manual record-keeping complicates reporting and increases risk of arbitrary detention.'
        },
        environmental: {
          prompt: 'Analyze seasonal flooding in Unity and Jonglei states affecting police deployments and travel.',
          whyPrompt: 'Access issues require planning mobile capacity training teams during dry seasons.'
        },
        legal: {
          prompt: 'Identify how the Transitional Constitution of South Sudan interacts with local police accountability regulations.',
          whyPrompt: 'Vague definitions of detention timelines lead to prolonged custody without charges.'
        },
        security: {
          prompt: 'Analyze the impact of cattle-raiding violence and localized conflict dynamics on police safety and operations.',
          whyPrompt: 'High violence levels require embedding public safety and human rights training concurrently.'
        }
      },
      stakeholderPrompts: [
        {
          category: 'Police Institution',
          rolePrompt: 'Manages national police deployments, academy standards, and institutional reforms.',
          suggestedStakeholders: ['SSNPS Inspector General', 'SSNPS Director of Training']
        },
        {
          category: 'Civil Society',
          rolePrompt: 'Monitors human rights violations and advocates for judicial sector accountability.',
          suggestedStakeholders: ['South Sudan Human Rights Commission', 'Local Legal Aid Advocates']
        }
      ],
      suggestedStakeholderCategories: ['UN Mission', 'Host State', 'Civil Society', 'Regional Actors']
    }
  },

  // 10. UNMOGIP
  {
    schemaVersion: 2,
    id: 'pk-unmogip',
    legacyIds: [],
    identity: {
      countryArea: 'India and Pakistan',
      iso3: 'IND',
      region: 'South Asia / India and Pakistan',
      missionName: 'United Nations Military Observer Group in India and Pakistan',
      missionAcronym: 'UNMOGIP',
      missionType: 'Current UN Peacekeeping Operation',
      sourceCategory: 'Current UN Peacekeeping Operation'
    },
    operationalStatus: 'active',
    verificationStatus: 'review-required',
    geography: {
      longitude: 74.0,
      latitude: 34.0,
      labelOffset: { x: 96, y: -30 }
    },
    provenance: {
      sources: [
        {
          id: 'src-un-dpko-unmogip',
          title: 'UN Peacekeeping Operations Where We Operate',
          organization: 'United Nations Peacekeeping',
          sourceType: 'official-portal',
          url: PEACEKEEPING_SOURCE_URL,
          publicationDate: null,
          reviewedDate: PEACEKEEPING_PROFILE_LAST_REVIEWED,
          supports: ['mandateSummary', 'operationalStatus']
        }
      ],
      profileLastReviewed: PEACEKEEPING_PROFILE_LAST_REVIEWED,
      coverageScope: 'current-peacekeeping-reference',
      limitations: [
        'Current mission status and mandate were not independently re-verified for this reference profile and must be checked before operational use.'
      ]
    },
    reference: {
      mandateSummary: {
        text: 'United Nations Military Observer Group in India and Pakistan.',
        sourceIds: ['src-un-dpko-unmogip']
      },
      policeRelevance: {
        text: 'Military observer mission; no active civilian police development mandate.',
        sourceIds: []
      },
      hostStatePolice: {
        text: 'Host-state police or relevant security-sector institution to verify',
        sourceIds: []
      },
      planningThemes: ['Mandate verification', 'Police component relevance', 'Stakeholder mapping', 'Evidence gaps']
    },
    planningPrompts: {
      stage1Guidance: {
        mandateEnvironmentPrompt: 'Review the current official mandate and confirm whether UNMOGIP has police, rule-of-law, protection, or advisory relevance for this planning exercise.',
        conflictContextPrompt: 'Identify the current public-safety, protection, political, legal, and institutional conditions from verified sources before recording findings.',
        planningPurposePrompt: 'Define a CBD planning purpose only after mandate scope, counterpart institutions, and evidence gaps are verified.'
      },
      pestelsPrompts: genericPeacekeepingPestelsPrompts,
      stakeholderPrompts: genericPeacekeepingStakeholderPrompts,
      suggestedStakeholderCategories: ['UN Mission', 'Host State', 'Police Institution', 'Civil Society']
    }
  },

  // 11. UNTSO
  {
    schemaVersion: 2,
    id: 'pk-untso',
    legacyIds: [],
    identity: {
      countryArea: 'Middle East',
      iso3: 'ISR',
      region: 'Middle East / Regional',
      missionName: 'United Nations Truce Supervision Organization',
      missionAcronym: 'UNTSO',
      missionType: 'Current UN Peacekeeping Operation',
      sourceCategory: 'Current UN Peacekeeping Operation'
    },
    operationalStatus: 'active',
    verificationStatus: 'review-required',
    geography: {
      longitude: 35.22,
      latitude: 31.78,
      labelOffset: { x: 94, y: 44 }
    },
    provenance: {
      sources: [
        {
          id: 'src-un-dpko-untso',
          title: 'UN Peacekeeping Operations Where We Operate',
          organization: 'United Nations Peacekeeping',
          sourceType: 'official-portal',
          url: PEACEKEEPING_SOURCE_URL,
          publicationDate: null,
          reviewedDate: PEACEKEEPING_PROFILE_LAST_REVIEWED,
          supports: ['mandateSummary', 'operationalStatus']
        }
      ],
      profileLastReviewed: PEACEKEEPING_PROFILE_LAST_REVIEWED,
      coverageScope: 'current-peacekeeping-reference',
      limitations: [
        'Current mission status and mandate were not independently re-verified for this reference profile and must be checked before operational use.'
      ]
    },
    reference: {
      mandateSummary: {
        text: 'United Nations Truce Supervision Organization.',
        sourceIds: ['src-un-dpko-untso']
      },
      policeRelevance: {
        text: 'Military observer mission assisting UN operations across the Middle East; no civilian police advisory component.',
        sourceIds: []
      },
      hostStatePolice: {
        text: 'Host-state police or relevant security-sector institution to verify',
        sourceIds: []
      },
      planningThemes: ['Mandate verification', 'Police component relevance', 'Stakeholder mapping', 'Evidence gaps']
    },
    planningPrompts: {
      stage1Guidance: {
        mandateEnvironmentPrompt: 'Review the current official mandate and confirm whether UNTSO has police, rule-of-law, protection, or advisory relevance for this planning exercise.',
        conflictContextPrompt: 'Identify the current public-safety, protection, political, legal, and institutional conditions from verified sources before recording findings.',
        planningPurposePrompt: 'Define a CBD planning purpose only after mandate scope, counterpart institutions, and evidence gaps are verified.'
      },
      pestelsPrompts: genericPeacekeepingPestelsPrompts,
      stakeholderPrompts: genericPeacekeepingStakeholderPrompts,
      suggestedStakeholderCategories: ['UN Mission', 'Host State', 'Police Institution', 'Civil Society']
    }
  },

  // 12. UNTMIS (Somalia)
  {
    schemaVersion: 2,
    id: 'seed-untmis',
    legacyIds: [],
    identity: {
      countryArea: 'Somalia',
      iso3: 'SOM',
      region: 'East Africa / Mogadishu Sector',
      missionName: 'United Nations Transitional Assistance Mission in Somalia',
      missionAcronym: 'UNTMIS',
      missionType: 'Special Political Mission',
      sourceCategory: 'Special Political Mission'
    },
    operationalStatus: 'active',
    verificationStatus: 'current-reference',
    geography: {
      longitude: 45.32,
      latitude: 2.05,
      labelOffset: { x: 92, y: -34 }
    },
    provenance: {
      sources: [
        {
          id: 'src-un-dppa-untmis',
          title: 'UNTMIS Somalia Factsheet',
          organization: 'United Nations DPPA',
          sourceType: 'official-portal',
          url: 'https://dppa.un.org/en/factsheet/untmis-somalia',
          publicationDate: '2024-10-30',
          reviewedDate: '2026-06-15',
          supports: ['mandateSummary', 'planningThemes', 'policeRelevance']
        }
      ],
      profileLastReviewed: '2026-06-15',
      coverageScope: 'selected-starter',
      limitations: [
        'UN Security Council Resolution 2753 (2024) established UNTMIS, succeeding UNSOM from 1 November 2024. The UNTMIS official mission site was reviewed on 15 June 2026; users must still verify current status and mandate before professional use.'
      ]
    },
    reference: {
      mandateSummary: {
        text: 'Support state-building, federal policing architecture, and transition coordination succeeding UNSOM.',
        sourceIds: ['src-un-dppa-untmis']
      },
      policeRelevance: {
        text: 'Strategic police advisory support to the Federal Government of Somalia and Federal Member States on federal-state policing models.',
        sourceIds: ['src-un-dppa-untmis']
      },
      hostStatePolice: {
        text: 'Federal and member-state police counterparts (verify current names and mandates)',
        sourceIds: []
      },
      planningThemes: ['Federal-State Police Coordination', 'Transition Mandate Verification', 'Institutional Security Reform']
    },
    planningPrompts: {
      stage1Guidance: {
        mandateEnvironmentPrompt: 'Review the current UNTMIS mandate and confirm which police, rule-of-law, or security-sector advisory functions remain authorized.',
        conflictContextPrompt: 'Identify current political, federal-state, public-safety, and security-transition factors affecting police reform.',
        planningPurposePrompt: 'Define a limited advisory objective only after verifying current counterpart priorities and mandate authority.'
      },
      pestelsPrompts: {
        political: {
          prompt: 'Assess how current federal-state relations and political negotiations affect police governance and coordination.',
          whyPrompt: 'Test whether governance arrangements create unresolved questions about police authority or reform sequencing.'
        },
        economic: {
          prompt: 'Identify current police-sector funding, donor-coordination, and host-state sustainability arrangements.',
          whyPrompt: 'Test whether funding dependencies create sustainability risks for police capacity-building priorities.'
        },
        social: {
          prompt: 'Assess how representation, identity dynamics, and local perceptions affect police impartiality and community acceptance.',
          whyPrompt: 'Test whether representation or trust concerns require locally adapted engagement approaches.'
        },
        technological: {
          prompt: 'Assess interoperability and reliability of personnel, payroll, criminal-record, and operational information systems.',
          whyPrompt: 'Test whether fragmented information systems affect accountability or coordination.'
        },
        environmental: {
          prompt: 'Assess whether climate, displacement, mobility, or infrastructure conditions create specific policing demands.',
          whyPrompt: 'Test whether service-delivery models need adaptation for displaced or hard-to-reach populations.'
        },
        legal: {
          prompt: 'Review how current formal, customary, and religious justice arrangements interact with police procedure.',
          whyPrompt: 'Test whether overlapping legal authorities create uncertainty for arrest, referral, or due-process workflows.'
        },
        security: {
          prompt: 'Assess current threats to police personnel, facilities, operations, and community-facing services.',
          whyPrompt: 'Test whether threat conditions constrain civilian policing and long-term capacity-building activities.'
        }
      },
      stakeholderPrompts: [
        {
          category: 'Host State',
          rolePrompt: 'Guides national security policies, federal police deployments, and donor cooperation.',
          suggestedStakeholders: ['Federal internal-security counterpart (verify)', 'National police leadership counterpart (verify)']
        },
        {
          category: 'Regional Actors',
          rolePrompt: 'Supports joint transition operations and tactical security handovers.',
          suggestedStakeholders: ['Current African Union mission police counterpart (verify)', 'Federal Member State Police Commissioners (verify)']
        }
      ],
      suggestedStakeholderCategories: ['UN Mission', 'Host State', 'Regional Actors', 'Civil Society']
    }
  },

  // 13. BINUH (Haiti)
  {
    schemaVersion: 2,
    id: 'seed-binuh',
    legacyIds: [],
    identity: {
      countryArea: 'Haiti',
      iso3: 'HTI',
      region: 'Caribbean / Ouest Department',
      missionName: 'UN Integrated Office in Haiti',
      missionAcronym: 'BINUH',
      missionType: 'Special Political Mission',
      sourceCategory: 'Special Political Mission'
    },
    operationalStatus: 'active',
    verificationStatus: 'review-required',
    geography: {
      longitude: -72.34,
      latitude: 18.54,
      labelOffset: { x: 0, y: -42 }
    },
    provenance: {
      sources: [
        {
          id: 'src-un-dppa-binuh',
          title: 'BINUH Haiti Factsheet',
          organization: 'United Nations DPPA',
          sourceType: 'official-portal',
          url: 'https://dppa.un.org/en/factsheet/binuh-haiti',
          publicationDate: '2023',
          reviewedDate: null,
          supports: ['mandateSummary', 'planningThemes', 'policeRelevance', 'hostStatePolice']
        }
      ],
      profileLastReviewed: null,
      coverageScope: 'selected-starter',
      limitations: [
        'Baseline reference: UN Security Council Resolution 2692 (2023). Current mission status, mandate, and security-support arrangements were not independently re-verified for this profile and must be checked before use.'
      ]
    },
    reference: {
      mandateSummary: {
        text: 'Advisory support to Haitian authorities on political dialogue, governance, police reform, and human rights.',
        sourceIds: ['src-un-dppa-binuh']
      },
      policeRelevance: {
        text: 'Strategic advice and mentoring to Police Nationale d’Haïti (PNH) on anti-gang operations, vetting, and internal affairs.',
        sourceIds: ['src-un-dppa-binuh']
      },
      hostStatePolice: {
        text: 'Police Nationale d’Haïti (PNH)',
        sourceIds: ['src-un-dppa-binuh']
      },
      planningThemes: ['Anti-Gang Operational Advice', 'Urban Security Stabilization', 'Internal Police Oversight']
    },
    planningPrompts: {
      stage1Guidance: {
        mandateEnvironmentPrompt: 'Review the current BINUH mandate and confirm authorized police and governance advisory functions.',
        conflictContextPrompt: 'Assess current governance, public-safety, institutional, and international-support conditions affecting policing.',
        planningPurposePrompt: 'Determine whether oversight, vetting, integrity, or community-safety support should be prioritized.'
      },
      pestelsPrompts: {
        political: {
          prompt: 'Assess the impact of governance voids and transitional councils on police leadership stability.',
          whyPrompt: 'Frequent leadership transitions disrupt long-term institutional reform plans.'
        },
        economic: {
          prompt: 'Analyze structural corruption, funding shortages, and basic equipment deficits (e.g. armored vehicles).',
          whyPrompt: 'Underfunded police units are highly vulnerable to gang corruption and operational failure.'
        },
        social: {
          prompt: 'Examine public confidence in PNH capacity to protect communities from organized gangs.',
          whyPrompt: 'Severe community trauma requires integrating human rights and protection guidelines into police operations.'
        },
        technological: {
          prompt: 'Analyze PNH surveillance tools, encrypted radio systems, and biometric registers.',
          whyPrompt: 'Lack of secure communications leads to operational leaks and compromised actions.'
        },
        environmental: {
          prompt: 'Evaluate urban density and slum layouts affecting policing mobility and entry points.',
          whyPrompt: 'Densely populated areas complicate tactical access and increase civilian risk during operations.'
        },
        legal: {
          prompt: 'Identify the functioning status of local court systems, prosecution offices, and vetting laws.',
          whyPrompt: 'Dysfunctional courts lead to massive pre-trial detention backups in police cells.'
        },
        security: {
          prompt: 'Assess gang infiltration, tactical capabilities, and threats to police barracks and families.',
          whyPrompt: 'Extreme security threats require strict vetting and officer-protection policies.'
        }
      },
      stakeholderPrompts: [
        {
          category: 'Police Institution',
          rolePrompt: 'Manages PNH operational coordination, inspectorate division, and tactical units.',
          suggestedStakeholders: ['PNH Director General', 'PNH Inspector General / Vetting Unit']
        },
        {
          category: 'Civil Society',
          rolePrompt: 'Monitors human rights, custody facilities, and advocates for anti-corruption measures.',
          suggestedStakeholders: ['Haitian Human Rights Coalition (RNDDH)', 'Local Bar Association Representatives']
        }
      ],
      suggestedStakeholderCategories: ['UN Mission', 'Host State', 'Civil Society', 'International Partners']
    }
  },

  // 14. FICTIONAL: Post-Conflict Police Reform
  {
    schemaVersion: 2,
    id: 'fictional-post-conflict',
    legacyIds: [],
    identity: {
      countryArea: 'Republic of Solaria (Fictional Training Scenario)',
      iso3: 'SLR',
      region: 'Training Sector A (Fictional)',
      missionName: 'Fictional Post-Conflict SSR Training Scenario',
      missionAcronym: 'F-PCSSR',
      missionType: 'Police Reform / SSR Advisory Support',
      sourceCategory: 'Fictional Training Scenario'
    },
    operationalStatus: 'fictional',
    verificationStatus: 'training-only',
    provenance: {
      sources: [],
      profileLastReviewed: null,
      coverageScope: 'training',
      limitations: [
        'Illustrative fictional training scenario. No official publication or current country source is claimed.'
      ]
    },
    reference: {
      mandateSummary: {
        text: 'This fictional scenario is designed to train officers on post-conflict security sector reform (SSR), focusing on the integration of former combatants and institutional restructuring.',
        sourceIds: []
      },
      policeRelevance: {
        text: 'Designing demobilization integration, vetting frameworks, and new regional police commands.',
        sourceIds: []
      },
      hostStatePolice: {
        text: 'Solaria Federal Police (SFP)',
        sourceIds: []
      },
      planningThemes: ['Vetting & Integrity', 'Demobilization Integration', 'Institutional Capacity Transfer']
    },
    planningPrompts: {
      stage1Guidance: {
        mandateEnvironmentPrompt: 'Review the fictional SSR mandate parameters and disarmament-demobilization integration timelines.',
        conflictContextPrompt: 'Examine factional integration risks and vetting backlogs from the 5-year conflict.',
        planningPurposePrompt: 'Define actionable capacity-building goals for transitional joint patrols and human-rights vetting.'
      },
      pestelsPrompts: {
        political: {
          prompt: 'Examine how representation of former opposing factions inside the new police force affects governance and public trust.',
          whyPrompt: 'Factional rivalries within the command structure risk stalling institutional decisions.'
        },
        economic: {
          prompt: 'Assess the integration of donor-backed integration stipends and long-term national budget sustainability.',
          whyPrompt: 'Exhaustion of donor integration funds could spark unrest among newly integrated officers.'
        },
        social: {
          prompt: 'Evaluate trust levels in communities where integrated officers are deployed to patrol former conflict zones.',
          whyPrompt: 'Hostile community reactions require establishing neutral community liaison forums.'
        },
        technological: {
          prompt: 'Identify the requirements for a centralized personnel database to track vetting records.',
          whyPrompt: 'Lack of verified files allows individuals with human rights records to slip through integration.'
        },
        environmental: {
          prompt: 'Identify how rural boundary lines and poor road access affect the distribution of new police precincts.',
          whyPrompt: 'Improper precinct mapping leaves rural minorities without physical protection.'
        },
        legal: {
          prompt: 'Verify the harmonization of transitional justice decrees with standard police arrest guidelines.',
          whyPrompt: 'Vague amnesty guidelines complicate police responses to past conflict-related crimes.'
        },
        security: {
          prompt: 'Assess threat profiles from demobilized combatants who refuse to join the peace process.',
          whyPrompt: 'Active spoiler groups require coordinating defensive police postures with peacekeeping forces.'
        }
      },
      stakeholderPrompts: [
        {
          category: 'Police Institution',
          rolePrompt: 'Administers police reorganization, vetting databases, and tactical coordination.',
          suggestedStakeholders: ['SFP Commissioner', 'SFP Integration Directorate']
        },
        {
          category: 'Civil Society',
          rolePrompt: 'Monitors vetting processes, human rights compliance, and community concerns.',
          suggestedStakeholders: ['Transitional Justice Coalition', 'Solaria Civil Society Alliance']
        }
      ],
      suggestedStakeholderCategories: ['UN Mission', 'Host State', 'Civil Society']
    },
    scenarioNarrative: {
      mandateEnvironment: 'This fictional scenario is designed to train officers on post-conflict security sector reform (SSR), focusing on the integration of former combatants and institutional restructuring.',
      conflictContext: 'A 5-year civil conflict has recently ended with a peace agreement. The police force must be rebuilt from opposing factions and vetted for human rights violations.',
      planningPurpose: 'Draft a vetting roadmap and standard operational rules for transitional joint patrols.'
    }
  },

  // 15. FICTIONAL: Public Trust Deficit & Community Policing
  {
    schemaVersion: 2,
    id: 'fictional-trust-deficit',
    legacyIds: [],
    identity: {
      countryArea: 'Province of Altera (Fictional Training Scenario)',
      iso3: 'ALT',
      region: 'Training Sector B (Fictional)',
      missionName: 'Fictional Public Trust & Community Policing Scenario',
      missionAcronym: 'F-PTCP',
      missionType: 'Capacity-Building / Training Mission',
      sourceCategory: 'Fictional Training Scenario'
    },
    operationalStatus: 'fictional',
    verificationStatus: 'training-only',
    provenance: {
      sources: [],
      profileLastReviewed: null,
      coverageScope: 'training',
      limitations: [
        'Illustrative fictional training scenario. No official publication or current country source is claimed.'
      ]
    },
    reference: {
      mandateSummary: {
        text: 'This fictional scenario focuses on building community policing capacity and internal accountability within a police force suffering from systemic corruption.',
        sourceIds: []
      },
      policeRelevance: {
        text: 'Formulating localized community safety panels to address systemic corruption and low public trust.',
        sourceIds: []
      },
      hostStatePolice: {
        text: 'Altera Provincial Police Force (APPF)',
        sourceIds: []
      },
      planningThemes: ['Community-Oriented Policing', 'Internal Anti-Corruption', 'Civilian Oversight']
    },
    planningPrompts: {
      stage1Guidance: {
        mandateEnvironmentPrompt: 'Review community-policing mandates and anti-corruption advisory parameters.',
        conflictContextPrompt: 'Examine public protest history, bribery reports, and police-community tension hotspots.',
        planningPurposePrompt: 'Define goals for establishing community safety advisory panels and complaints mechanisms.'
      },
      pestelsPrompts: {
        political: {
          prompt: 'Examine how local political actors use the police force to suppress community activists and protests.',
          whyPrompt: 'Political interference prevents impartial internal investigations of police misconduct.'
        },
        economic: {
          prompt: 'Assess how low officer salaries and lack of basic precinct funding drive predatory bribery.',
          whyPrompt: 'Predatory bribery cannot be solved by training alone; it requires administrative wage reforms.'
        },
        social: {
          prompt: 'Examine systemic discrimination by the police force against minority demographic groups in urban sectors.',
          whyPrompt: 'Systemic bias requires mandating minority representation on community safety panels.'
        },
        technological: {
          prompt: 'Identify how body-worn cameras or public digital complaint portals can increase transparency.',
          whyPrompt: 'Unsecure digital registers risk exposing complainants to police retaliation.'
        },
        environmental: {
          prompt: 'Verify urban congestion and checkpoint locations that serve as primary sites for bribery collection.',
          whyPrompt: 'Poor checkpoint positioning creates choke points used for illicit resource extraction.'
        },
        legal: {
          prompt: 'Review internal code of conduct compliance systems and independent oversight legislation.',
          whyPrompt: 'Lack of legal power for external oversight boards makes complaints panels ineffective.'
        },
        security: {
          prompt: 'Analyze public hostility towards police officers, including attacks on police precincts.',
          whyPrompt: 'High public hostility requires implementing de-escalation training alongside community outreach.'
        }
      },
      stakeholderPrompts: [
        {
          category: 'Police Institution',
          rolePrompt: 'Responsible for public relations, academy ethics training, and internal discipline.',
          suggestedStakeholders: ['APPF Professional Standards Unit', 'APPF Community Policing Director']
        },
        {
          category: 'Civil Society',
          rolePrompt: 'Represents victims of police misconduct and monitors human rights violations.',
          suggestedStakeholders: ['Youth Protest Coalition', 'Altera Human Rights Watch']
        }
      ],
      suggestedStakeholderCategories: ['UN Mission', 'Host State', 'Civil Society']
    },
    scenarioNarrative: {
      mandateEnvironment: 'This fictional scenario focuses on building community policing capacity and internal accountability within a police force suffering from systemic corruption.',
      conflictContext: 'Widespread public protests against police brutality, predatory bribery, and arbitrary arrests have created a severe trust deficit.',
      planningPurpose: 'Design community safety advisory panels and a public complaints dashboard to restore institutional credibility.'
    }
  },

  // 16. FICTIONAL: Weak Accountability & Detention Oversight
  {
    schemaVersion: 2,
    id: 'fictional-accountability',
    legacyIds: [],
    identity: {
      countryArea: 'Maris Republic (Fictional Training Scenario)',
      iso3: 'MRS',
      region: 'Training Sector C (Fictional)',
      missionName: 'Fictional Detention Accountability & Vetting Scenario',
      missionAcronym: 'F-DAVS',
      missionType: 'Rule of Law / Justice Chain Support',
      sourceCategory: 'Fictional Training Scenario'
    },
    operationalStatus: 'fictional',
    verificationStatus: 'training-only',
    provenance: {
      sources: [],
      profileLastReviewed: null,
      coverageScope: 'training',
      limitations: [
        'Illustrative fictional training scenario informed by general detention-oversight concepts. No official publication is claimed.'
      ]
    },
    reference: {
      mandateSummary: {
        text: 'This fictional scenario focuses on structural detention oversight, prevention of torture, and coordination with local magistrate courts to reduce pre-trial delays.',
        sourceIds: []
      },
      policeRelevance: {
        text: 'Overhauling police custody registries, detention center oversight, and magistrate review procedures.',
        sourceIds: []
      },
      hostStatePolice: {
        text: 'Maris Gendarmerie and Prison Service',
        sourceIds: []
      },
      planningThemes: ['Nelson Mandela Rules', 'Custody Registry Oversight', 'Magistrate Court Liaison']
    },
    planningPrompts: {
      stage1Guidance: {
        mandateEnvironmentPrompt: 'Review rule-of-law and detention monitoring mandate guidelines.',
        conflictContextPrompt: 'Examine custody overcrowding, arbitrary arrest patterns, and magistrate court backlogs.',
        planningPurposePrompt: 'Define advisory goals for standardized digital custody registries and civilian oversight inspections.'
      },
      pestelsPrompts: {
        political: {
          prompt: 'Assess how political pressure to appear tough on crime drives mass arrests and detention center backlogs.',
          whyPrompt: 'Political focus on arrest numbers conflicts with detention capacity and human rights limits.'
        },
        economic: {
          prompt: 'Identify funding deficits for basic inmate care, food supply, and sanitation inside police lockups.',
          whyPrompt: 'Severe underfunding forces detainees to rely on family packages, risking systemic exploitation.'
        },
        social: {
          prompt: 'Examine social stigma and public apathy towards the rights of detainees held in police custody.',
          whyPrompt: 'Public apathy reduces pressure on authorities to fund basic detention upgrades.'
        },
        technological: {
          prompt: 'Examine the feasibility of implementing electronic custody logs linked to local magistrate courts.',
          whyPrompt: 'Manual paper logs are easily modified, enabling unrecorded detentions.'
        },
        environmental: {
          prompt: 'Assess ventilation, light, and sanitary infrastructure constraints in old municipal detention blocks.',
          whyPrompt: 'Substandard facilities violate Mandela Rules and breed disease among inmates.'
        },
        legal: {
          prompt: 'Identify legal loopholes that allow police to extend detention beyond the constitutional 48-hour limit.',
          whyPrompt: 'Vague exception clauses in the criminal procedure code enable prolonged detentions.'
        },
        security: {
          prompt: 'Assess security risks associated with overcrowding, including escape attempts and inmate violence.',
          whyPrompt: 'Overcrowding compromises officer safety and triggers reactive, excessive force.'
        }
      },
      stakeholderPrompts: [
        {
          category: 'Police Institution',
          rolePrompt: 'Manages custody facilities, officer guards, and police station records.',
          suggestedStakeholders: ['Maris Gendarmerie Detention Chief', 'Station Commanders']
        },
        {
          category: 'Civil Society',
          rolePrompt: 'Conducts monitoring visits, advocates for prisoner rights, and provides legal aid.',
          suggestedStakeholders: ['Independent Detention Inspectorate', 'Maris Legal Defense Fund']
        }
      ],
      suggestedStakeholderCategories: ['UN Mission', 'Host State', 'Civil Society', 'Justice Chain']
    },
    scenarioNarrative: {
      mandateEnvironment: 'This fictional scenario focuses on structural detention oversight, prevention of torture, and coordination with local magistrate courts to reduce pre-trial delays.',
      conflictContext: 'Systemic over-crowding in police lockups, arbitrary extension of custody beyond legal limits, and lack of verified detainee registers.',
      planningPurpose: 'Develop a digital custody logbook template and coordinate independent civilian inspections of police stations.'
    }
  },

  // 17. FICTIONAL: Gender-Responsive Policing
  {
    schemaVersion: 2,
    id: 'fictional-gender',
    legacyIds: [],
    identity: {
      countryArea: 'Vespera Province (Fictional Training Scenario)',
      iso3: 'VES',
      region: 'Training Sector D (Fictional)',
      missionName: 'Fictional Gender-Responsive Capacity Building Scenario',
      missionAcronym: 'F-GRCB',
      missionType: 'Capacity-Building / Training Mission',
      sourceCategory: 'Fictional Training Scenario'
    },
    operationalStatus: 'fictional',
    verificationStatus: 'training-only',
    provenance: {
      sources: [],
      profileLastReviewed: null,
      coverageScope: 'training',
      limitations: [
        'Illustrative fictional training scenario. No official publication or current country source is claimed.'
      ]
    },
    reference: {
      mandateSummary: {
        text: 'This fictional training scenario addresses structural barriers to reporting sexual and gender-based violence (SGBV) and advocates for gender diversity within the host-state police.',
        sourceIds: []
      },
      policeRelevance: {
        text: 'Operationalizing Gender Desk units, SGBV referral chains, and improving female recruitment.',
        sourceIds: []
      },
      hostStatePolice: {
        text: 'Vespera National Police (VNP) / Gender Protection Units',
        sourceIds: []
      },
      planningThemes: ['Gender Protection Desks', 'SGBV Referral Chain', 'Recruitment Diversity']
    },
    planningPrompts: {
      stage1Guidance: {
        mandateEnvironmentPrompt: 'Review gender equality advisory mandates and specialized protection standards.',
        conflictContextPrompt: 'Examine SGBV prevalence, stigma barriers, and low female representation in the police service.',
        planningPurposePrompt: 'Define capacity targets for Gender Protection Desks and integrated health-legal referral protocols.'
      },
      pestelsPrompts: {
        political: {
          prompt: 'Assess governmental commitment and political backing for gender equality legislation and police recruitment quotas.',
          whyPrompt: 'Lack of high-level political support stalls the implementation of diversity targets.'
        },
        economic: {
          prompt: 'Identify resourcing constraints for private interview spaces and specialized SGBV investigator training.',
          whyPrompt: 'Sharing open reporting spaces deters victims from coming forward due to privacy concerns.'
        },
        social: {
          prompt: 'Verify cultural taboos, family pressure, and social stigma surrounding the reporting of SGBV incidents.',
          whyPrompt: 'Social pressure often forces victims to resolve cases through traditional mediation rather than courts.'
        },
        technological: {
          prompt: 'Assess availability of secure databases to track SGBV case reports and preserve victim anonymity.',
          whyPrompt: 'Unsecured filing systems risk exposing sensitive details, threatening victim safety.'
        },
        environmental: {
          prompt: 'Analyze distances to specialized referral clinics and how transport limitations affect reporting rates.',
          whyPrompt: 'Long distances to stations require establishing mobile protective reporting units.'
        },
        legal: {
          prompt: 'Identify conflicts between traditional family reconciliation customs and legal domestic violence penal codes.',
          whyPrompt: 'Customary practices often push police to mediate crimes that legally require criminal prosecution.'
        },
        security: {
          prompt: 'Evaluate threats faced by female officers and victims of SGBV from retaliation by perpetrators.',
          whyPrompt: 'Perpetrator intimidation requires strict witness-protection protocols in precincts.'
        }
      },
      stakeholderPrompts: [
        {
          category: 'Police Institution',
          rolePrompt: 'Responsible for investigating domestic crimes, victim assistance, and officer sensitization.',
          suggestedStakeholders: ['VNP Gender Protection Unit Director', 'VNP Academy Diversity Officer']
        },
        {
          category: 'Civil Society',
          rolePrompt: 'Provides shelter services, legal counseling, and monitors police accountability in SGBV cases.',
          suggestedStakeholders: ['Vespera Women\'s Crisis Center', 'Human Rights Gender Desk Coalition']
        }
      ],
      suggestedStakeholderCategories: ['UN Mission', 'Host State', 'Civil Society', 'Health & Social Sector']
    },
    scenarioNarrative: {
      mandateEnvironment: 'This fictional training scenario addresses structural barriers to reporting sexual and gender-based violence (SGBV) and advocates for gender diversity within the host-state police.',
      conflictContext: 'Post-conflict context with high rates of domestic and gender-based violence, combined with a police force that is over 95% male and lacks protective reporting environments.',
      planningPurpose: 'Design standard operational guidelines for Gender Protection Desks and coordinate referral pathways with local health clinics.'
    }
  },

  // 18. FICTIONAL: Conflict-Prevention Policing
  {
    schemaVersion: 2,
    id: 'fictional-conflict-prevention',
    legacyIds: [],
    identity: {
      countryArea: 'Meridia State (Fictional Training Scenario)',
      iso3: 'MRD',
      region: 'Training Sector E (Fictional)',
      missionName: 'Fictional Conflict-Prevention & Early Warning Scenario',
      missionAcronym: 'F-CPEW',
      missionType: 'Peacebuilding / Peacebuilding Support',
      sourceCategory: 'Fictional Training Scenario'
    },
    operationalStatus: 'fictional',
    verificationStatus: 'training-only',
    provenance: {
      sources: [],
      profileLastReviewed: null,
      coverageScope: 'training',
      limitations: [
        'Illustrative fictional training scenario. No official publication or current country source is claimed.'
      ]
    },
    reference: {
      mandateSummary: {
        text: 'This fictional scenario focuses on building early-warning systems, community indicators, and defensive de-escalation protocols to prevent local political tensions from escalating into violence.',
        sourceIds: []
      },
      policeRelevance: {
        text: 'Establishing early-warning liaison channels, community monitoring networks, and crisis response SOPs.',
        sourceIds: []
      },
      hostStatePolice: {
        text: 'Meridia State Constabulary',
        sourceIds: []
      },
      planningThemes: ['Conflict Early Warning', 'Community Liaison Networks', 'Crisis De-escalation SOPs']
    },
    planningPrompts: {
      stage1Guidance: {
        mandateEnvironmentPrompt: 'Review early-warning and preventive diplomacy advisory mandates.',
        conflictContextPrompt: 'Examine election cycle polarization, hate speech dissemination, and inter-ethnic tensions.',
        planningPurposePrompt: 'Define capacity programs for police-community early-warning networks and mediation.'
      },
      pestelsPrompts: {
        political: {
          prompt: 'Assess how election campaign rhetoric and ethnic politics affect local police neutrality.',
          whyPrompt: 'Politicized command paths undermine the credibility of police early-warning responses.'
        },
        economic: {
          prompt: 'Examine resource mobilization for rapid-response units and community dialogue funding.',
          whyPrompt: 'Lack of fuel and vehicles prevents police from responding to early-warning alerts.'
        },
        social: {
          prompt: 'Evaluate media consumption, hate-speech circulation, and rumors affecting community polarization.',
          whyPrompt: 'Rapidly spreading rumors require setting up joint fact-checking committees with community leaders.'
        },
        technological: {
          prompt: 'Review the setup of community hotline alerts, radio links, and digital event mapping.',
          whyPrompt: 'Vulnerable communication grids fail during coordinated local disruptions.'
        },
        environmental: {
          prompt: 'Analyze hotspots, regional gathering spots, and local markets where conflicts are most likely to start.',
          whyPrompt: 'High-risk gathering spots require joint preventative community patrols.'
        },
        legal: {
          prompt: 'Verify policing powers to handle hate speech, assembly permits, and preemptive mediation.',
          whyPrompt: 'Vague laws on public assembly risk leading to arbitrary arrests, escalating local anger.'
        },
        security: {
          prompt: 'Evaluate threat levels from local political party youth wings and armed vigilante groups.',
          whyPrompt: 'Armed vigilantes demand clear demarcation between police public safety roles and military backup.'
        }
      },
      stakeholderPrompts: [
        {
          category: 'Police Institution',
          rolePrompt: 'Coordinates early-warning inputs, community mediation, and provincial crisis response.',
          suggestedStakeholders: ['Meridia State Police Commissioner', 'Early Warning Coordination Officer']
        },
        {
          category: 'Civil Society',
          rolePrompt: 'Monitors election violence indicators, manages local peace committees, and fact-checks rumors.',
          suggestedStakeholders: ['Inter-Faith Mediation Council', 'Electoral Monitoring Network']
        }
      ],
      suggestedStakeholderCategories: ['UN Mission', 'Host State', 'Civil Society', 'Electoral Observers']
    },
    scenarioNarrative: {
      mandateEnvironment: 'This fictional scenario focuses on building early-warning systems, community indicators, and defensive de-escalation protocols to prevent local political tensions from escalating into violence.',
      conflictContext: 'Ahead of national elections, inter-ethnic tensions are rising, and politicized hate speech is circulating in local markets.',
      planningPurpose: 'Design early warning indicators and training for local police command on community mediation and crowd de-escalation.'
    }
  }
];
