/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');

const { CANONICAL_PLANNING_CONTEXTS } = require('../.test-dist/data/planningContexts.js');
const { resolvePlanningContext, getAllPlanningContexts, getPlanningContextGuidance, hasMeaningfulWork } = require('../.test-dist/lib/planningContext.js');
const { initializeFromContext, applyMissionSeed } = require('../.test-dist/lib/applyMissionSeed.js');
const { validateAndNormalizeProjectData } = require('../.test-dist/lib/projectDataValidation.js');
const { calculateQualityWarnings } = require('../.test-dist/lib/warnings.js');
const { getContextSource } = require('../.test-dist/lib/reportModel.js');
const { filterMissionExplorerEntries } = require('../.test-dist/lib/explorerFilters.js');
const { defaultExplorerSeeds } = require('../.test-dist/data/explorerSeeds.js');

// ============================================================================
// 1. CATALOGUE TESTS
// ============================================================================

test('catalogue contains exactly 18 canonical planning contexts', () => {
  const allContexts = getAllPlanningContexts();
  assert.equal(allContexts.length, 18);
  assert.equal(CANONICAL_PLANNING_CONTEXTS.length, 18);
});

test('canonical context IDs are unique and follow naming rules', () => {
  const allContexts = getAllPlanningContexts();
  const ids = allContexts.map((c) => c.id);
  const idSet = new Set(ids);
  assert.equal(idSet.size, 18, 'All 18 canonical IDs must be unique');

  // Verify distribution: 11 pk-*, 2 seed-*, 5 fictional-*
  const pkMissions = ids.filter((id) => id.startsWith('pk-'));
  const spmMissions = ids.filter((id) => id.startsWith('seed-'));
  const fictionalScenarios = ids.filter((id) => id.startsWith('fictional-'));

  assert.equal(pkMissions.length, 11, 'Exactly 11 UN Peacekeeping Operations');
  assert.equal(spmMissions.length, 2, 'Exactly 2 Special Political Missions (seed-untmis, seed-binuh)');
  assert.equal(fictionalScenarios.length, 5, 'Exactly 5 Fictional Training Scenarios');
  assert.deepEqual(spmMissions.sort(), ['seed-binuh', 'seed-untmis'].sort());
});

test('aliases are unique and never collide with canonical IDs', () => {
  const allContexts = getAllPlanningContexts();
  const canonicalIds = new Set(allContexts.map((c) => c.id));
  const allAliases = [];

  allContexts.forEach((c) => {
    c.legacyIds.forEach((alias) => {
      assert.ok(!canonicalIds.has(alias), `Alias "${alias}" must not collide with canonical IDs`);
      allAliases.push(alias);
    });
  });

  const aliasSet = new Set(allAliases);
  assert.equal(aliasSet.size, allAliases.length, 'All legacy aliases must be mutually unique');
  assert.deepEqual(allAliases.sort(), ['seed-monusco', 'seed-unisfa', 'seed-unmiss'].sort());
});

test('geography is valid when present, and omitted for fictional scenarios', () => {
  const allContexts = getAllPlanningContexts();

  allContexts.forEach((c) => {
    if (c.operationalStatus === 'fictional') {
      assert.equal(c.geography, undefined, `Fictional scenario ${c.id} should not have geographic coordinates`);
    } else {
      assert.ok(c.geography, `Real mission ${c.id} must have geography coordinates`);
      assert.ok(typeof c.geography.longitude === 'number', 'Longitude must be a number');
      assert.ok(typeof c.geography.latitude === 'number', 'Latitude must be a number');
      assert.ok(c.geography.longitude >= -180 && c.geography.longitude <= 180, 'Longitude in bounds');
      assert.ok(c.geography.latitude >= -90 && c.geography.latitude <= 90, 'Latitude in bounds');
      assert.ok(typeof c.geography.labelOffset.x === 'number', 'labelOffset.x must be a number');
      assert.ok(typeof c.geography.labelOffset.y === 'number', 'labelOffset.y must be a number');
    }
  });
});

test('iso3 country codes may be valid string or null', () => {
  const allContexts = getAllPlanningContexts();
  allContexts.forEach((c) => {
    const iso3 = c.identity.iso3;
    assert.ok(iso3 === null || (typeof iso3 === 'string' && iso3.length === 3), `iso3 in ${c.id} must be null or 3 chars`);
  });
});

// ============================================================================
// 2. ALIAS RESOLUTION TESTS
// ============================================================================

test('alias resolution correctly maps legacy seed IDs to canonical pk IDs', () => {
  assert.equal(resolvePlanningContext('seed-unisfa')?.id, 'pk-unisfa');
  assert.equal(resolvePlanningContext('seed-unmiss')?.id, 'pk-unmiss');
  assert.equal(resolvePlanningContext('seed-monusco')?.id, 'pk-monusco');
});

test('resolution resolves direct canonical IDs and returns null for unknown/empty IDs', () => {
  assert.equal(resolvePlanningContext('pk-unmiss')?.id, 'pk-unmiss');
  assert.equal(resolvePlanningContext('seed-untmis')?.id, 'seed-untmis');
  assert.equal(resolvePlanningContext('seed-binuh')?.id, 'seed-binuh');
  assert.equal(resolvePlanningContext('fictional-post-conflict')?.id, 'fictional-post-conflict');

  assert.equal(resolvePlanningContext('unknown-xyz-999'), null);
  assert.equal(resolvePlanningContext(''), null);
  assert.equal(resolvePlanningContext(null), null);
  assert.equal(resolvePlanningContext(undefined), null);
});

test('guidance helper retrieves planning prompts without mutation', () => {
  const ctx = resolvePlanningContext('pk-unmiss');
  assert.ok(ctx);
  const guidance = getPlanningContextGuidance(ctx);
  assert.ok(guidance.pestelsPrompts.political);
  assert.ok(guidance.stage1Guidance.mandateEnvironmentPrompt);
});

// ============================================================================
// 3. INITIALIZATION PURITY TESTS
// ============================================================================

test('real-world contexts initialize cleanly with empty analyst fields and technical baseline ratings', () => {
  const realContexts = getAllPlanningContexts().filter((c) => c.operationalStatus !== 'fictional');
  assert.equal(realContexts.length, 13);

  realContexts.forEach((ctx) => {
    const data = initializeFromContext(ctx);

    // Profile: identity and reference populated, analyst fields blank
    assert.equal(data.profile.countryName, ctx.identity.countryArea);
    assert.equal(data.profile.region, ctx.identity.region);
    assert.equal(data.profile.templateId, ctx.id);
    assert.equal(data.profile.hostStatePolice, ctx.reference.hostStatePolice.text);
    assert.equal(data.profile.mandateEnvironment, ctx.reference.mandateSummary.text);
    assert.equal(data.profile.conflictContext, '', `${ctx.id}: conflictContext must be blank for real context`);
    assert.equal(data.profile.planningPurpose, '', `${ctx.id}: planningPurpose must be blank for real context`);
    assert.equal(data.profile.analystName, '');

    // PESTEL-S: strictly blank findings, why, sequencing
    Object.entries(data.pestels).forEach(([key, item]) => {
      assert.equal(item.finding, '', `${ctx.id} ${key}: finding must be empty`);
      assert.equal(item.why, '', `${ctx.id} ${key}: why must be empty`);
      assert.equal(item.sequencing, '', `${ctx.id} ${key}: sequencing must be empty`);
      assert.deepEqual(item.evidenceNotes, [], `${ctx.id} ${key}: evidenceNotes must be empty`);
      // Technical baseline ratings: impact=3, urgency=3, confidence=1, relevance=3
      assert.deepEqual(item.rating, { impact: 3, urgency: 3, confidence: 1, relevance: 3 }, `${ctx.id} ${key}: technical baseline ratings`);
    });

    // Stakeholders: strictly empty array
    assert.equal(data.stakeholders.length, 0, `${ctx.id}: stakeholders must be empty array`);

    // CBD Matrix: strictly empty object
    assert.deepEqual(data.customCells, {}, `${ctx.id}: customCells must be empty`);

    // Interdependencies: strictly empty
    assert.deepEqual(data.interdependencies, [], `${ctx.id}: interdependencies must be empty`);

    // PriorityBrief: empty
    assert.deepEqual(data.priorityBrief.topPriorities, []);
    assert.deepEqual(data.priorityBrief.quickWins, []);
    assert.deepEqual(data.priorityBrief.sensitiveReforms, []);
    assert.deepEqual(data.priorityBrief.longerTermReforms, []);
    assert.deepEqual(data.priorityBrief.risksAssumptions, []);
    assert.equal(data.priorityBrief.sequencingRecommendation, '');

    // SWOT/TOWS synthesis: empty
    assert.deepEqual(data.analysisSynthesis.swotFindings, []);
    assert.deepEqual(data.analysisSynthesis.strategicOptions, []);
  });
});

test('fictional training contexts populate Stage 1 scenario narrative facts but keep analytical structures empty', () => {
  const fictionalContexts = getAllPlanningContexts().filter((c) => c.operationalStatus === 'fictional');
  assert.equal(fictionalContexts.length, 5);

  fictionalContexts.forEach((ctx) => {
    const data = initializeFromContext(ctx);

    // Stage 1 narrative facts populated from scenarioNarrative
    assert.ok(data.profile.mandateEnvironment.length > 0, `${ctx.id}: mandateEnvironment populated for fictional`);
    assert.ok(data.profile.conflictContext.length > 0, `${ctx.id}: conflictContext populated for fictional`);
    assert.ok(data.profile.planningPurpose.length > 0, `${ctx.id}: planningPurpose populated for fictional`);

    // But analytical stages remain completely blank for the student/analyst
    Object.entries(data.pestels).forEach(([key, item]) => {
      assert.equal(item.finding, '', `${ctx.id} ${key}: finding must remain empty`);
      assert.equal(item.why, '', `${ctx.id} ${key}: why must remain empty`);
      assert.equal(item.sequencing, '', `${ctx.id} ${key}: sequencing must remain empty`);
      assert.deepEqual(item.evidenceNotes, []);
      assert.deepEqual(item.rating, { impact: 3, urgency: 3, confidence: 1, relevance: 3 });
    });

    assert.equal(data.stakeholders.length, 0, `${ctx.id}: stakeholders must be empty`);
    assert.deepEqual(data.customCells, {}, `${ctx.id}: customCells must be empty`);
    assert.deepEqual(data.interdependencies, []);
    assert.deepEqual(data.analysisSynthesis.swotFindings, []);
  });
});

test('applyMissionSeed compatibility wrapper delegates cleanly to initializeFromContext', () => {
  const ctx = resolvePlanningContext('pk-unmiss');
  assert.ok(ctx);
  const data = applyMissionSeed({
    id: ctx.id,
    country: ctx.identity.countryArea,
    iso3: ctx.identity.iso3 || '',
    region: ctx.identity.region,
    coordinates: { x: 50, y: 50 },
    missionName: ctx.identity.missionName,
    missionAcronym: ctx.identity.missionAcronym,
    missionType: ctx.identity.missionType,
    sourceCategory: ctx.identity.sourceCategory,
    coverageScope: ctx.provenance.coverageScope,
    status: 'active',
    isFictionalScenario: false,
    isOfficial: false,
    sourceDate: null,
    profileLastReviewed: null,
    sourceUrl: null,
    sourceNote: '',
    disclaimer: '',
    hostStatePoliceInstitution: ctx.reference.hostStatePolice.text,
    planningPurpose: '',
    planningThemes: [],
    starterProfile: { mandateEnvironment: '', conflictContext: '', planningPurpose: '' },
    starterPestelsPrompts: {},
    starterStakeholderPrompts: [],
    suggestedStakeholderCategories: []
  });

  assert.equal(data.profile.templateId, 'pk-unmiss');
  assert.equal(data.stakeholders.length, 0);
  assert.equal(data.pestels.political.finding, '');
});

// ============================================================================
// 4. PROJECT VALIDATION & NORMALIZATION TESTS
// ============================================================================

test('every initialized context workspace passes validateAndNormalizeProjectData cleanly', () => {
  const allContexts = getAllPlanningContexts();

  allContexts.forEach((ctx) => {
    const rawData = initializeFromContext(ctx);
    const result = validateAndNormalizeProjectData(rawData);
    assert.equal(result.error, null, `Workspace from ${ctx.id} must not produce validation error`);
    assert.ok(result.data, `Workspace from ${ctx.id} must have data`);
    assert.equal(result.data.profile.templateId, ctx.id);
  });
});

test('legacy workspace with seed-* templateId validates and normalizes without corruption', () => {
  const ctx = resolvePlanningContext('pk-unmiss');
  assert.ok(ctx);
  const baseData = initializeFromContext(ctx);
  const legacyData = {
    ...baseData,
    profile: {
      ...baseData.profile,
      templateId: 'seed-unmiss'
    }
  };

  const result = validateAndNormalizeProjectData(legacyData);
  assert.equal(result.error, null);
  assert.ok(result.data);
  assert.equal(result.data.profile.templateId, 'seed-unmiss', 'Legacy templateId preserved in workspace');
});

// ============================================================================
// 5. WARNING ENGINE INTEGRITY TESTS
// ============================================================================

test('blank PESTEL factors with technical baseline ratings do NOT generate analytical warnings', () => {
  const ctx = resolvePlanningContext('pk-unmiss');
  assert.ok(ctx);
  const data = initializeFromContext(ctx);

  const warnings = calculateQualityWarnings(data);

  // Baseline ratings are { impact: 3, urgency: 3, confidence: 1, relevance: 3 }
  // There should be NO high-impact low-confidence warnings or no-evidence warnings for PESTEL
  const pestelsWarnings = warnings.filter((w) => w.category === 'pestels');
  assert.equal(pestelsWarnings.length, 0, 'No analytical PESTEL warnings on unassessed factors');
});

test('blank PESTEL factors with modified ratings still do NOT generate analytical warnings while finding is blank', () => {
  const ctx = resolvePlanningContext('pk-unmiss');
  assert.ok(ctx);
  const data = initializeFromContext(ctx);

  // Set impact to 5, confidence to 1, no evidence notes, but finding is still empty
  data.pestels.political.rating.impact = 5;
  data.pestels.political.rating.confidence = 1;
  data.pestels.political.finding = '   '; // whitespace only

  const warnings = calculateQualityWarnings(data);
  const highImpactWarning = warnings.find((w) => w.id === 'pestels-high-impact-low-conf-political');
  const noEvidenceWarning = warnings.find((w) => w.id === 'pestels-no-evidence-political');

  assert.equal(highImpactWarning, undefined, 'Must not warn when finding is blank');
  assert.equal(noEvidenceWarning, undefined, 'Must not warn when finding is blank');
});

test('populated findings generate analytical warnings normally when conditions are met', () => {
  const ctx = resolvePlanningContext('pk-unmiss');
  assert.ok(ctx);
  const data = initializeFromContext(ctx);

  // Record an analyst finding with high impact (5) and low confidence (1) and no evidence
  data.pestels.political.finding = 'Severe political interference in senior police appointments.';
  data.pestels.political.rating.impact = 5;
  data.pestels.political.rating.confidence = 1;
  data.pestels.political.evidenceNotes = [];

  const warnings = calculateQualityWarnings(data);
  const highImpactWarning = warnings.find((w) => w.id === 'pestels-high-impact-low-conf-political');
  const noEvidenceWarning = warnings.find((w) => w.id === 'pestels-no-evidence-political');

  assert.ok(highImpactWarning, 'Should generate high-impact low-confidence warning for assessed factor');
  assert.ok(noEvidenceWarning, 'Should generate no-evidence warning for assessed factor');
});

// ============================================================================
// 6. REPORT MODEL CONTEXT SOURCE TESTS
// ============================================================================

test('report model getContextSource resolves canonical IDs, legacy aliases, and scenarios', () => {
  const ctx1 = resolvePlanningContext('pk-unmiss');
  const data1 = initializeFromContext(ctx1);
  assert.equal(getContextSource(data1), 'Mission Explorer (UNMISS)');

  const data2 = initializeFromContext(ctx1);
  data2.profile.templateId = 'seed-unmiss';
  assert.equal(getContextSource(data2), 'Mission Explorer (UNMISS)');

  const ctx3 = resolvePlanningContext('fictional-post-conflict');
  const data3 = initializeFromContext(ctx3);
  assert.equal(getContextSource(data3), 'Fictional training scenario (F-PCSSR)');

  const blankData = { ...data1, profile: { ...data1.profile, templateId: 'blank' } };
  assert.equal(getContextSource(blankData), 'Started blank');

  const caranaData = { ...data1, profile: { ...data1.profile, templateId: 'fictional-carana-demo' } };
  assert.equal(getContextSource(caranaData), 'CARANA fictional training demonstration');
});

// ============================================================================
// 7. REFERENCE STATEMENT TRACEABILITY TESTS
// ============================================================================

test('all 18 canonical contexts have valid statement structures and resolvable source IDs', () => {
  const allContexts = getAllPlanningContexts();
  assert.equal(allContexts.length, 18);

  allContexts.forEach((ctx) => {
    const { mandateSummary, policeRelevance, hostStatePolice } = ctx.reference;

    // Check statements exist with text and sourceIds array
    assert.ok(mandateSummary && typeof mandateSummary.text === 'string', `${ctx.id}: mandateSummary must have string text`);
    assert.ok(Array.isArray(mandateSummary.sourceIds), `${ctx.id}: mandateSummary.sourceIds must be array`);
    assert.ok(policeRelevance && typeof policeRelevance.text === 'string', `${ctx.id}: policeRelevance must have string text`);
    assert.ok(Array.isArray(policeRelevance.sourceIds), `${ctx.id}: policeRelevance.sourceIds must be array`);
    assert.ok(hostStatePolice && typeof hostStatePolice.text === 'string', `${ctx.id}: hostStatePolice must have string text`);
    assert.ok(Array.isArray(hostStatePolice.sourceIds), `${ctx.id}: hostStatePolice.sourceIds must be array`);

    const knownSourceIds = new Set(ctx.provenance.sources.map((s) => s.id));

    // Every referenced source ID must resolve to a known source in ctx.provenance.sources
    [...mandateSummary.sourceIds, ...policeRelevance.sourceIds, ...hostStatePolice.sourceIds].forEach((srcId) => {
      assert.ok(knownSourceIds.has(srcId), `${ctx.id}: sourceId "${srcId}" must exist in provenance.sources`);
    });

    // Fictional contexts must have empty sourceIds across all statements
    if (ctx.operationalStatus === 'fictional') {
      assert.equal(mandateSummary.sourceIds.length, 0, `${ctx.id}: fictional mandateSummary must have empty sourceIds`);
      assert.equal(policeRelevance.sourceIds.length, 0, `${ctx.id}: fictional policeRelevance must have empty sourceIds`);
      assert.equal(hostStatePolice.sourceIds.length, 0, `${ctx.id}: fictional hostStatePolice must have empty sourceIds`);
    }
  });
});

test('source-backed statements vs unverified statements correctly reflect sourceIds', () => {
  // UNMISS has verified UNSCR 2729 backing mandate, police, and counterpart
  const unmiss = resolvePlanningContext('pk-unmiss');
  assert.ok(unmiss);
  assert.deepEqual(unmiss.reference.mandateSummary.sourceIds, ['src-unscr-2729']);
  assert.deepEqual(unmiss.reference.policeRelevance.sourceIds, ['src-unscr-2729']);
  assert.deepEqual(unmiss.reference.hostStatePolice.sourceIds, ['src-unscr-2729']);

  // MINURSO has DPKO source backing mandate, but empty sourceIds on police relevance and counterpart
  const minurso = resolvePlanningContext('pk-minurso');
  assert.ok(minurso);
  assert.deepEqual(minurso.reference.mandateSummary.sourceIds, ['src-un-dpko-minurso']);
  assert.deepEqual(minurso.reference.policeRelevance.sourceIds, [], 'MINURSO police relevance has no direct external source');
  assert.deepEqual(minurso.reference.hostStatePolice.sourceIds, [], 'MINURSO counterpart has no direct external source');
});

test('specific resolution-titled sources have url: null rather than generic peacekeeping portal url', () => {
  const monusco = resolvePlanningContext('pk-monusco');
  assert.ok(monusco);
  const monuscoSrc = monusco.provenance.sources.find((s) => s.id === 'src-unscr-2717');
  assert.ok(monuscoSrc);
  assert.equal(monuscoSrc.url, null, 'MONUSCO UNSCR 2717 must have url: null');

  const unisfa = resolvePlanningContext('pk-unisfa');
  assert.ok(unisfa);
  const unisfaSrc = unisfa.provenance.sources.find((s) => s.id === 'src-unscr-1990');
  assert.ok(unisfaSrc);
  assert.equal(unisfaSrc.url, null, 'UNISFA UNSCR 1990 must have url: null');

  const unmiss = resolvePlanningContext('pk-unmiss');
  assert.ok(unmiss);
  const unmissSrc = unmiss.provenance.sources.find((s) => s.id === 'src-unscr-2729');
  assert.ok(unmissSrc);
  assert.equal(unmissSrc.url, null, 'UNMISS UNSCR 2729 must have url: null');

  // Generic peacekeeping portal sources retain valid URL
  const minurso = resolvePlanningContext('pk-minurso');
  assert.ok(minurso);
  const minursoSrc = minurso.provenance.sources.find((s) => s.id === 'src-un-dpko-minurso');
  assert.ok(minursoSrc);
  assert.equal(minursoSrc.url, 'https://peacekeeping.un.org/en/where-we-operate');

  // No specific resolution-titled source should point to generic peacekeeping portal
  getAllPlanningContexts().forEach((ctx) => {
    ctx.provenance.sources.forEach((src) => {
      if (src.title.toLowerCase().includes('resolution') || src.title.toLowerCase().includes('unscr')) {
        assert.notEqual(src.url, 'https://peacekeeping.un.org/en/where-we-operate', `${ctx.id} resolution source ${src.id} must not point to generic peacekeeping portal`);
      }
    });
  });
});

// ============================================================================
// 8. EXTENDED EXPLORER SEARCH FILTER TESTS
// ============================================================================

test('search matches across planningThemes, hostStatePoliceInstitution, and region', () => {
  const baseFilters = {
    searchQuery: '',
    selectedRegion: 'all',
    selectedType: 'all',
    selectedStatus: 'all',
    showFictional: 'all'
  };

  // Search by theme
  const transitionResults = filterMissionExplorerEntries(defaultExplorerSeeds, {
    ...baseFilters,
    searchQuery: 'Transition Strategy'
  });
  assert.ok(transitionResults.length > 0, 'Should find entries with Transition Strategy theme');
  assert.ok(transitionResults.some((e) => e.missionAcronym === 'MONUSCO'));

  // Search by police institution acronym / name
  const pnhResults = filterMissionExplorerEntries(defaultExplorerSeeds, {
    ...baseFilters,
    searchQuery: 'PNH'
  });
  assert.ok(pnhResults.length > 0, 'Should find BINUH by police institution name');
  assert.ok(pnhResults.some((e) => e.missionAcronym === 'BINUH'));

  // Search by region
  const middleEastResults = filterMissionExplorerEntries(defaultExplorerSeeds, {
    ...baseFilters,
    searchQuery: 'Middle East'
  });
  assert.ok(middleEastResults.length >= 3, 'Should find Middle East missions via search query');
  assert.ok(middleEastResults.some((e) => e.missionAcronym === 'UNIFIL'));
  assert.ok(middleEastResults.some((e) => e.missionAcronym === 'UNDOF'));
});

// ============================================================================
// 9. MEANINGFUL WORK DETECTION TESTS
// ============================================================================

test('hasMeaningfulWork returns false for empty or freshly initialized workspaces', () => {
  assert.equal(hasMeaningfulWork(null), false);
  assert.equal(hasMeaningfulWork(undefined), false);

  // Freshly initialized real mission workspace
  const unmiss = resolvePlanningContext('pk-unmiss');
  assert.ok(unmiss);
  const unmissData = initializeFromContext(unmiss);
  assert.equal(hasMeaningfulWork(unmissData), false, 'Fresh real context workspace must not be flagged as meaningful work');

  // Freshly initialized fictional scenario workspace
  const fictional = resolvePlanningContext('fictional-post-conflict');
  assert.ok(fictional);
  const fictionalData = initializeFromContext(fictional);
  assert.equal(hasMeaningfulWork(fictionalData), false, 'Fresh fictional scenario workspace must not be flagged as meaningful work');
});

test('hasMeaningfulWork returns true when analyst records substantive planning work', () => {
  const ctx = resolvePlanningContext('pk-unmiss');
  assert.ok(ctx);

  // 1. Non-empty PESTEL finding
  const dataWithFinding = initializeFromContext(ctx);
  dataWithFinding.pestels.political.finding = 'Political interference in operational command.';
  assert.equal(hasMeaningfulWork(dataWithFinding), true);

  // Whitespace-only finding does NOT count
  const dataWithWhitespaceFinding = initializeFromContext(ctx);
  dataWithWhitespaceFinding.pestels.political.finding = '   \n  ';
  assert.equal(hasMeaningfulWork(dataWithWhitespaceFinding), false);

  // 2. Added stakeholder
  const dataWithStakeholder = initializeFromContext(ctx);
  dataWithStakeholder.stakeholders.push({
    id: 'sh-1',
    name: 'Inspector General',
    category: 'Host State',
    role: 'Lead commander',
    authority: 'High',
    influence: 'High',
    position: 'Enabler',
    legitimacy: 'Medium',
    relevance: 'High',
    capacity: 'Medium',
    risk: '',
    entry: '',
    engagement: '',
    cbdAreas: ['Professionalism & Integrity']
  });
  assert.equal(hasMeaningfulWork(dataWithStakeholder), true);

  // 3. Custom CBD cell
  const dataWithCell = initializeFromContext(ctx);
  dataWithCell.customCells['1|1'] = {
    key: '1|1',
    why: 'Leadership deficit',
    individual: 'Train executives',
    organizational: 'SOPs',
    environment: 'Legal oversight',
    indicators: [],
    drivers: [],
    stakeholders: [],
    risks: '',
    sequencing: '',
    confidence: 3,
    priorityScore: 3,
    result: '',
    engagement: '',
    capacityProblem: '',
    planningObjective: '',
    leadStakeholderId: null,
    supportingStakeholderIds: [],
    implementationPhase: null,
    milestoneTimeframe: ''
  };
  assert.equal(hasMeaningfulWork(dataWithCell), true);

  // 4. SWOT finding
  const dataWithSwot = initializeFromContext(ctx);
  dataWithSwot.analysisSynthesis.swotFindings.push({
    id: 'swot-1',
    reference: 'S1',
    category: 'Strength',
    finding: 'Cohesive mid-level officer cohort',
    cbdImplication: '',
    sourceReferences: [],
    confidence: 4,
    verificationNote: ''
  });
  assert.equal(hasMeaningfulWork(dataWithSwot), true);

  // 5. Interdependency
  const dataWithInterdep = initializeFromContext(ctx);
  dataWithInterdep.interdependencies.push({
    id: 'xi-1',
    reference: 'XI-01',
    sourceFindingId: 'political',
    targetFindingId: 'legal',
    relationship: 'Legal void amplifies political capture',
    effectOnCbd: 'Constraining',
    planningSignificance: 'High',
    cbdImplication: '',
    evidenceIds: [],
    analyticalNote: '',
    isKeyInsight: true,
    includeInMainBrief: true
  });
  assert.equal(hasMeaningfulWork(dataWithInterdep), true);

  // 6. Priority brief top priority
  const dataWithPriority = initializeFromContext(ctx);
  dataWithPriority.priorityBrief.topPriorities.push('Executive command reform');
  assert.equal(hasMeaningfulWork(dataWithPriority), true);

  // 7. Priority brief sequencing recommendation
  const dataWithSeq = initializeFromContext(ctx);
  dataWithSeq.priorityBrief.sequencingRecommendation = 'Phase 1: Legal mandate review before equipment transfer.';
  assert.equal(hasMeaningfulWork(dataWithSeq), true);
});

test('hasMeaningfulWork detects Stage 1 profile edits against baselines and ignores unchanged identity', () => {
  const ctx = resolvePlanningContext('pk-unmiss');
  assert.ok(ctx);

  // Unchanged baseline returns false
  const cleanData = initializeFromContext(ctx);
  assert.equal(hasMeaningfulWork(cleanData), false);

  // Unchanged prefilled identity fields (countryName, missionName, region) do not trigger meaningful work
  const cleanDataWithIdentity = initializeFromContext(ctx);
  assert.ok(cleanDataWithIdentity.profile.countryName.length > 0);
  assert.ok(cleanDataWithIdentity.profile.missionName.length > 0);
  assert.equal(hasMeaningfulWork(cleanDataWithIdentity), false);

  // 1. analystName entered
  const dataWithAnalyst = initializeFromContext(ctx);
  dataWithAnalyst.profile.analystName = 'Col. Sarah Jenkins';
  assert.equal(hasMeaningfulWork(dataWithAnalyst), true, 'analystName triggers meaningful work');

  // Whitespace-only analystName does NOT count
  const dataWithWsAnalyst = initializeFromContext(ctx);
  dataWithWsAnalyst.profile.analystName = '   \t  ';
  assert.equal(hasMeaningfulWork(dataWithWsAnalyst), false, 'whitespace analystName does not trigger work');

  // 'Participant / Team' placeholder does NOT count
  const dataWithTeam = initializeFromContext(ctx);
  dataWithTeam.profile.analystName = 'Participant / Team';
  assert.equal(hasMeaningfulWork(dataWithTeam), false);

  // 2. planningPurpose modified
  const dataWithPurpose = initializeFromContext(ctx);
  dataWithPurpose.profile.planningPurpose = 'Strengthen community policing oversight and station administration.';
  assert.equal(hasMeaningfulWork(dataWithPurpose), true, 'planningPurpose triggers meaningful work');

  // 3. conflictContext modified
  const dataWithConflict = initializeFromContext(ctx);
  dataWithConflict.profile.conflictContext = 'Escalating inter-communal cattle-raiding and local militia activity.';
  assert.equal(hasMeaningfulWork(dataWithConflict), true, 'conflictContext triggers meaningful work');

  // 4. mandateEnvironment edited from baseline
  const dataWithMandate = initializeFromContext(ctx);
  dataWithMandate.profile.mandateEnvironment = 'Amended mandate focusing solely on executive policing assistance.';
  assert.equal(hasMeaningfulWork(dataWithMandate), true, 'edited mandateEnvironment triggers meaningful work');

  // 5. hostStatePolice edited from baseline
  const dataWithHostPolice = initializeFromContext(ctx);
  dataWithHostPolice.profile.hostStatePolice = 'National Police Service - Anti-Corruption Directorate';
  assert.equal(hasMeaningfulWork(dataWithHostPolice), true, 'edited hostStatePolice triggers meaningful work');

  // Fictional context: prefilled scenario facts do not trigger meaningful work
  const fCtx = resolvePlanningContext('fictional-post-conflict');
  assert.ok(fCtx);
  const fData = initializeFromContext(fCtx);
  assert.equal(hasMeaningfulWork(fData), false, 'fictional scenario narrative facts do not trigger false positive');

  // Fictional context: analyst modifying scenario purpose triggers meaningful work
  const fDataEdited = initializeFromContext(fCtx);
  fDataEdited.profile.planningPurpose = 'Analyst bespoke purpose overriding scenario.';
  assert.equal(hasMeaningfulWork(fDataEdited), true, 'modified fictional purpose triggers meaningful work');
});

// ============================================================================
// 10. METHODOLOGICAL INTEGRITY & PROMPT SEPARATION TESTS
// ============================================================================

test('context guidance prompts are strictly questions/prompts and never pre-assessed findings', () => {
  const allContexts = getAllPlanningContexts();

  allContexts.forEach((ctx) => {
    const prompts = getPlanningContextGuidance(ctx);
    assert.ok(prompts.pestelsPrompts);
    assert.ok(prompts.stage1Guidance);

    // Each PESTEL prompt must have a prompt question and whyPrompt explanation
    Object.entries(prompts.pestelsPrompts).forEach(([factor, item]) => {
      assert.ok(typeof item.prompt === 'string' && item.prompt.length > 10, `${ctx.id} ${factor}: prompt must be descriptive question`);
      assert.ok(typeof item.whyPrompt === 'string' && item.whyPrompt.length > 5, `${ctx.id} ${factor}: whyPrompt must provide rationale`);
    });

    // Suggested stakeholders must only be strings or categories, never scored
    if (prompts.suggestedStakeholderCategories) {
      assert.ok(Array.isArray(prompts.suggestedStakeholderCategories));
    }
    if (prompts.stakeholderPrompts) {
      assert.ok(Array.isArray(prompts.stakeholderPrompts));
      prompts.stakeholderPrompts.forEach((sp) => {
        assert.ok(typeof sp.category === 'string');
        assert.ok(typeof sp.rolePrompt === 'string');
        assert.ok(Array.isArray(sp.suggestedStakeholders));
      });
    }
  });
});
