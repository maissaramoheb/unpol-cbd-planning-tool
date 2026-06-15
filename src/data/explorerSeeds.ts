import { MissionExplorerEntry } from '../types/explorer';

export const EXPLORER_DISCLAIMER =
  'These are unofficial starter planning profiles, not an official UN mission database or verified country analysis. Mission status, mandate, source currency, institutions, and all context assumptions must be checked against current official UN and host-state sources before professional use.';

export const defaultExplorerSeeds: MissionExplorerEntry[] = [
  // --- 1. UNISFA (Abyei) ---
  {
    id: 'seed-unisfa',
    country: 'Sudan / South Sudan (Abyei Area)',
    iso3: 'SSD',
    region: 'East Africa / Abyei Sector',
    coordinates: { x: 55, y: 55 },
    missionName: 'UN Interim Security Force for Abyei',
    missionAcronym: 'UNISFA',
    missionType: 'UN Peacekeeping Mission',
    status: 'verification-required',
    isFictionalScenario: false,
    isOfficial: false,
    sourceDate: '2011',
    profileLastReviewed: null,
    sourceNote: 'Baseline reference: UN Security Council Resolution 1990 (2011). Current mission status and mandate were not independently re-verified for this starter profile and must be checked before use.',
    disclaimer: EXPLORER_DISCLAIMER,
    hostStatePoliceInstitution: 'Abyei Joint Police Service (proposed) / Local police elements',
    planningPurpose: '[PROMPT] Define whether community-policing procedures are an appropriate planning priority for the verified context.',
    planningThemes: ['Disputed Border Policing', 'Community Peace Liaison Panels', 'Inter-communal Disputes'],
    starterProfile: {
      mandateEnvironment: '[VERIFY] Review the current UNISFA mandate and confirm the authorized role of the police component.',
      conflictContext: '[ASSUMPTION TO TEST] Assess current governance, legal, mobility, and inter-community conditions affecting policing in the area.',
      planningPurpose: '[PROMPT] Determine whether community-safety mechanisms and basic police administration are appropriate capacity-building priorities.'
    },
    starterPestelsPrompts: {
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
        whyPrompt: 'Overlapping systems create legal confusion over detention time limits and human rights norms.'
      },
      security: {
        prompt: 'Assess threats from armed militias, seasonal livestock raiding, and civil unrest in key urban zones.',
        whyPrompt: 'Volatile threats demand strict liaison protocols between UNPOL and military peacekeepers.'
      }
    },
    starterStakeholderPrompts: [
      {
        category: 'Host State',
        rolePrompt: 'Represents traditional dispute resolution and Ngok Dinka community interests.',
        suggestedStakeholders: ['Ngok Dinka Traditional Chiefs', 'Joint Peace Committee Representative']
      },
      {
        category: 'Host State',
        rolePrompt: 'Represents pastoralist interests and seasonal migration routes.',
        suggestedStakeholders: ['Misseriya Community Elders']
      },
      {
        category: 'Police Institution',
        rolePrompt: 'Operates local safety outposts and manages basic cell security.',
        suggestedStakeholders: ['Abyei Community Police Volunteers']
      }
    ],
    suggestedStakeholderCategories: ['UN Mission', 'Host State', 'Civil Society']
  },

  // --- 2. UNMISS (South Sudan) ---
  {
    id: 'seed-unmiss',
    country: 'South Sudan',
    iso3: 'SSD',
    region: 'East Africa / Central Equatoria',
    coordinates: { x: 54, y: 57 },
    missionName: 'UN Mission in South Sudan',
    missionAcronym: 'UNMISS',
    missionType: 'UN Peacekeeping Mission',
    status: 'verification-required',
    isFictionalScenario: false,
    isOfficial: false,
    sourceDate: '2024',
    profileLastReviewed: null,
    sourceNote: 'Baseline reference: UN Security Council Resolution 2729 (2024). Current mission status and mandate were not independently re-verified for this starter profile and must be checked before use.',
    disclaimer: EXPLORER_DISCLAIMER,
    hostStatePoliceInstitution: 'South Sudan National Police Service (SSNPS)',
    planningPurpose: '[PROMPT] Assess whether police accountability and detention oversight should be prioritized in the verified context.',
    planningThemes: ['National Police Reform', 'Human Rights Due Diligence', 'Detention Accountability'],
    starterProfile: {
      mandateEnvironment: '[VERIFY] Review the current UNMISS mandate and confirm the authorized police advisory functions.',
      conflictContext: '[ASSUMPTION TO TEST] Assess current transition, public-safety, access, and local-governance conditions affecting policing.',
      planningPurpose: '[PROMPT] Determine whether internal investigation and detention-inspection workflows are appropriate advisory priorities.'
    },
    starterPestelsPrompts: {
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
    starterStakeholderPrompts: [
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
  },

  // --- 3. MONUSCO (DR Congo) ---
  {
    id: 'seed-monusco',
    country: 'Democratic Republic of the Congo',
    iso3: 'COD',
    region: 'Central Africa / North & South Kivu',
    coordinates: { x: 53, y: 59 },
    missionName: 'UN Organization Stabilization Mission in the DRC',
    missionAcronym: 'MONUSCO',
    missionType: 'UN Peacekeeping Mission',
    status: 'verification-required',
    isFictionalScenario: false,
    isOfficial: false,
    sourceDate: '2023',
    profileLastReviewed: null,
    sourceNote: 'Baseline reference: UN Security Council Resolution 2717 (2023). Current mission status, transition arrangements, and mandate were not independently re-verified for this starter profile and must be checked before use.',
    disclaimer: EXPLORER_DISCLAIMER,
    hostStatePoliceInstitution: 'Police Nationale Congolaise (PNC)',
    planningPurpose: '[PROMPT] Verify current transition arrangements and assess appropriate police capacity-transfer priorities.',
    planningThemes: ['Transition Strategy', 'Crowd Control Standards', 'Provincial Police Advisors'],
    starterProfile: {
      mandateEnvironment: '[VERIFY] Review the current MONUSCO mandate and transition arrangements before defining police-support activities.',
      conflictContext: '[ASSUMPTION TO TEST] Assess current conflict, displacement, public-order, and regional factors affecting civilian policing.',
      planningPurpose: '[PROMPT] Determine whether public-order compliance, accountability, or capacity-transfer support should be prioritized.'
    },
    starterPestelsPrompts: {
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
    starterStakeholderPrompts: [
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
  },

  // --- 4. UNTMIS (Somalia) ---
  {
    id: 'seed-untmis',
    country: 'Somalia',
    iso3: 'SOM',
    region: 'East Africa / Mogadishu Sector',
    coordinates: { x: 59, y: 53 },
    missionName: 'United Nations Transitional Assistance Mission in Somalia',
    missionAcronym: 'UNTMIS',
    missionType: 'Special Political Mission',
    status: 'active',
    isFictionalScenario: false,
    isOfficial: false,
    sourceDate: '2024-10-30',
    profileLastReviewed: '2026-06-15',
    sourceNote: 'UN Security Council Resolution 2753 (2024) established UNTMIS, succeeding UNSOM from 1 November 2024. The UNTMIS official mission site was reviewed on 15 June 2026; users must still verify current status and mandate before professional use.',
    disclaimer: EXPLORER_DISCLAIMER,
    hostStatePoliceInstitution: 'Federal and member-state police counterparts (verify current names and mandates)',
    planningPurpose: '[PROMPT] Define a verified police-governance or capacity-building planning objective within the current UNTMIS mandate.',
    planningThemes: ['Federal-State Police Coordination', 'Transition Mandate Verification', 'Institutional Security Reform'],
    starterProfile: {
      mandateEnvironment: '[VERIFY] Review the current UNTMIS mandate and confirm which police, rule-of-law, or security-sector advisory functions remain authorized.',
      conflictContext: '[ASSUMPTION TO TEST] Identify current political, federal-state, public-safety, and security-transition factors affecting police reform.',
      planningPurpose: '[PROMPT] Define a limited advisory objective only after verifying current counterpart priorities and mandate authority.'
    },
    starterPestelsPrompts: {
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
    starterStakeholderPrompts: [
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
  },

  // --- 5. BINUH (Haiti) ---
  {
    id: 'seed-binuh',
    country: 'Haiti',
    iso3: 'HTI',
    region: 'Caribbean / Ouest Department',
    coordinates: { x: 30, y: 44 },
    missionName: 'UN Integrated Office in Haiti',
    missionAcronym: 'BINUH',
    missionType: 'Special Political Mission',
    status: 'verification-required',
    isFictionalScenario: false,
    isOfficial: false,
    sourceDate: '2023',
    profileLastReviewed: null,
    sourceNote: 'Baseline reference: UN Security Council Resolution 2692 (2023). Current mission status, mandate, and security-support arrangements were not independently re-verified for this starter profile and must be checked before use.',
    disclaimer: EXPLORER_DISCLAIMER,
    hostStatePoliceInstitution: 'Police Nationale d’Haïti (PNH)',
    planningPurpose: '[PROMPT] Verify current mandate authority and define an appropriate police governance or community-safety planning objective.',
    planningThemes: ['Anti-Gang Operational Advice', 'Urban Security Stabilization', 'Internal Police Oversight'],
    starterProfile: {
      mandateEnvironment: '[VERIFY] Review the current BINUH mandate and confirm authorized police and governance advisory functions.',
      conflictContext: '[ASSUMPTION TO TEST] Assess current governance, public-safety, institutional, and international-support conditions affecting policing.',
      planningPurpose: '[PROMPT] Determine whether oversight, vetting, integrity, or community-safety support should be prioritized.'
    },
    starterPestelsPrompts: {
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
    starterStakeholderPrompts: [
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
  },

  // --- 6. FICTIONAL: Post-Conflict Police Reform ---
  {
    id: 'fictional-post-conflict',
    country: 'Republic of Solaria (Fictional Training Scenario)',
    iso3: 'SLR',
    region: 'Training Sector A (Fictional)',
    coordinates: { x: 12, y: 76 },
    missionName: 'Fictional Post-Conflict SSR Training Scenario',
    missionAcronym: 'F-PCSSR',
    missionType: 'Police Reform / SSR Advisory Support',
    status: 'template',
    isFictionalScenario: true,
    isOfficial: false,
    sourceDate: null,
    profileLastReviewed: null,
    sourceNote: 'Illustrative fictional training scenario. No official publication or current country source is claimed.',
    disclaimer: EXPLORER_DISCLAIMER,
    hostStatePoliceInstitution: 'Solaria Federal Police (SFP)',
    planningPurpose: 'Designing demobilization integration, vetting frameworks, and new regional police commands.',
    planningThemes: ['Vetting & Integrity', 'Demobilization Integration', 'Institutional Capacity Transfer'],
    starterProfile: {
      mandateEnvironment: 'This fictional scenario is designed to train officers on post-conflict security sector reform (SSR), focusing on the integration of former combatants and institutional restructuring.',
      conflictContext: 'A 5-year civil conflict has recently ended with a peace agreement. The police force must be rebuilt from opposing factions and vetted for human rights violations.',
      planningPurpose: 'Draft a vetting roadmap and standard operational rules for transitional joint patrols.'
    },
    starterPestelsPrompts: {
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
    starterStakeholderPrompts: [
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

  // --- 7. FICTIONAL: Public Trust Deficit & Community Policing ---
  {
    id: 'fictional-trust-deficit',
    country: 'Province of Altera (Fictional Training Scenario)',
    iso3: 'ALT',
    region: 'Training Sector B (Fictional)',
    coordinates: { x: 17, y: 76 },
    missionName: 'Fictional Public Trust & Community Policing Scenario',
    missionAcronym: 'F-PTCP',
    missionType: 'Capacity-Building / Training Mission',
    status: 'template',
    isFictionalScenario: true,
    isOfficial: false,
    sourceDate: null,
    profileLastReviewed: null,
    sourceNote: 'Illustrative fictional training scenario. No official publication or current country source is claimed.',
    disclaimer: EXPLORER_DISCLAIMER,
    hostStatePoliceInstitution: 'Altera Provincial Police Force (APPF)',
    planningPurpose: 'Formulating localized community safety panels to address systemic corruption and low public trust.',
    planningThemes: ['Community-Oriented Policing', 'Internal Anti-Corruption', 'Civilian Oversight'],
    starterProfile: {
      mandateEnvironment: 'This fictional scenario focuses on building community policing capacity and internal accountability within a police force suffering from systemic corruption.',
      conflictContext: 'Widespread public protests against police brutality, predatory bribery, and arbitrary arrests have created a severe trust deficit.',
      planningPurpose: 'Design community safety advisory panels and a public complaints dashboard to restore institutional credibility.'
    },
    starterPestelsPrompts: {
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
    starterStakeholderPrompts: [
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

  // --- 8. FICTIONAL: Weak Accountability & Detention Oversight ---
  {
    id: 'fictional-accountability',
    country: 'Maris Republic (Fictional Training Scenario)',
    iso3: 'MRS',
    region: 'Training Sector C (Fictional)',
    coordinates: { x: 22, y: 76 },
    missionName: 'Fictional Detention Accountability & Vetting Scenario',
    missionAcronym: 'F-DAVS',
    missionType: 'Rule of Law / Justice Chain Support',
    status: 'template',
    isFictionalScenario: true,
    isOfficial: false,
    sourceDate: null,
    profileLastReviewed: null,
    sourceNote: 'Illustrative fictional training scenario informed by general detention-oversight concepts. No official publication is claimed.',
    disclaimer: EXPLORER_DISCLAIMER,
    hostStatePoliceInstitution: 'Maris Gendarmerie and Prison Service',
    planningPurpose: 'Overhauling police custody registries, detention center oversight, and magistrate review procedures.',
    planningThemes: ['Nelson Mandela Rules', 'Custody Registry Oversight', 'Magistrate Court Liaison'],
    starterProfile: {
      mandateEnvironment: 'This fictional scenario focuses on structural detention oversight, prevention of torture, and coordination with local magistrate courts to reduce pre-trial delays.',
      conflictContext: 'Systemic over-crowding in police lockups, arbitrary extension of custody beyond legal limits, and lack of verified detainee registers.',
      planningPurpose: 'Develop a digital custody logbook template and coordinate independent civilian inspections of police stations.'
    },
    starterPestelsPrompts: {
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
    starterStakeholderPrompts: [
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

  // --- 9. FICTIONAL: Gender-Responsive Policing ---
  {
    id: 'fictional-gender',
    country: 'Vespera Province (Fictional Training Scenario)',
    iso3: 'VES',
    region: 'Training Sector D (Fictional)',
    coordinates: { x: 27, y: 76 },
    missionName: 'Fictional Gender-Responsive Capacity Building Scenario',
    missionAcronym: 'F-GRCB',
    missionType: 'Capacity-Building / Training Mission',
    status: 'template',
    isFictionalScenario: true,
    isOfficial: false,
    sourceDate: null,
    profileLastReviewed: null,
    sourceNote: 'Illustrative fictional training scenario. No official publication or current country source is claimed.',
    disclaimer: EXPLORER_DISCLAIMER,
    hostStatePoliceInstitution: 'Vespera National Police (VNP) / Gender Protection Units',
    planningPurpose: 'Operationalizing Gender Desk units, SGBV referral chains, and improving female recruitment.',
    planningThemes: ['Gender Protection Desks', 'SGBV Referral Chain', 'Recruitment Diversity'],
    starterProfile: {
      mandateEnvironment: 'This fictional training scenario addresses structural barriers to reporting sexual and gender-based violence (SGBV) and advocates for gender diversity within the host-state police.',
      conflictContext: 'Post-conflict context with high rates of domestic and gender-based violence, combined with a police force that is over 95% male and lacks protective reporting environments.',
      planningPurpose: 'Design standard operational guidelines for Gender Protection Desks and coordinate referral pathways with local health clinics.'
    },
    starterPestelsPrompts: {
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
    starterStakeholderPrompts: [
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

  // --- 10. FICTIONAL: Conflict-Prevention Policing ---
  {
    id: 'fictional-conflict-prevention',
    country: 'Meridia State (Fictional Training Scenario)',
    iso3: 'MRD',
    region: 'Training Sector E (Fictional)',
    coordinates: { x: 32, y: 76 },
    missionName: 'Fictional Conflict-Prevention & Early Warning Scenario',
    missionAcronym: 'F-CPEW',
    missionType: 'Peacebuilding / Peacebuilding Support',
    status: 'template',
    isFictionalScenario: true,
    isOfficial: false,
    sourceDate: null,
    profileLastReviewed: null,
    sourceNote: 'Illustrative fictional training scenario. No official publication or current country source is claimed.',
    disclaimer: EXPLORER_DISCLAIMER,
    hostStatePoliceInstitution: 'Meridia State Constabulary',
    planningPurpose: 'Establishing early-warning liaison channels, community monitoring networks, and crisis response SOPs.',
    planningThemes: ['Conflict Early Warning', 'Community Liaison Networks', 'Crisis De-escalation SOPs'],
    starterProfile: {
      mandateEnvironment: 'This fictional scenario focuses on building early-warning systems, community indicators, and defensive de-escalation protocols to prevent local political tensions from escalating into violence.',
      conflictContext: 'Ahead of national elections, inter-ethnic tensions are rising, and politicized hate speech is circulating in local markets.',
      planningPurpose: 'Design early warning indicators and training for local police command on community mediation and crowd de-escalation.'
    },
    starterPestelsPrompts: {
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
    starterStakeholderPrompts: [
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
  }
];
