/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');

const { CANONICAL_PLANNING_CONTEXTS } = require('../.test-dist/data/planningContexts.js');
const { resolvePlanningContext, getAllPlanningContexts, getPlanningContextGuidance } = require('../.test-dist/lib/planningContext.js');
const { initializeFromContext, applyMissionSeed } = require('../.test-dist/lib/applyMissionSeed.js');
const { validateAndNormalizeProjectData } = require('../.test-dist/lib/projectDataValidation.js');
const { calculateQualityWarnings } = require('../.test-dist/lib/warnings.js');
const { getContextSource } = require('../.test-dist/lib/reportModel.js');

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
    assert.equal(data.profile.hostStatePolice, ctx.reference.hostStatePolice);
    assert.equal(data.profile.mandateEnvironment, ctx.reference.mandateSummary);
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
    hostStatePoliceInstitution: ctx.reference.hostStatePolice,
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
