/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');

const {
  canCompareContexts,
  normalizeComparisonTerm,
  getSharedPlanningThemes,
  getContextSpecificThemes,
  getSharedStakeholderCategories,
  getContextSpecificStakeholderCategories,
  getContextSourceCoverage,
  hasMixedOperationalStatus,
  getContextDifferences,
  getTransferCheckQuestions
} = require('../.test-dist/lib/contextComparison.js');

const { resolvePlanningContext, getAllPlanningContexts } = require('../.test-dist/lib/planningContext.js');
const { filterMissionExplorerEntries, getSearchMatchReason } = require('../.test-dist/lib/explorerFilters.js');
const { defaultExplorerSeeds } = require('../.test-dist/data/explorerSeeds.js');

// ============================================================================
// 1. COMPARE SELECTION TESTS
// ============================================================================

test('compare selection validates minimum 2 and maximum 3 contexts', () => {
  assert.equal(canCompareContexts([]), false, '0 contexts cannot be compared');
  assert.equal(canCompareContexts(['pk-unmiss']), false, '1 context cannot be compared');
  assert.equal(canCompareContexts(['pk-unmiss', 'pk-monusco']), true, '2 contexts can be compared');
  assert.equal(canCompareContexts(['pk-unmiss', 'pk-monusco', 'seed-binuh']), true, '3 contexts can be compared');
  assert.equal(canCompareContexts(['pk-unmiss', 'pk-monusco', 'seed-binuh', 'pk-unifil']), false, '4 contexts exceed cap');
});

test('compare selection state operations (add, remove, clear, 4th rejection)', () => {
  let compareIds = [];

  const toggle = (id) => {
    if (compareIds.includes(id)) {
      compareIds = compareIds.filter((item) => item !== id);
      return { success: true, warning: null };
    }
    if (compareIds.length < 3) {
      compareIds = [...compareIds, id];
      return { success: true, warning: null };
    }
    return { success: false, warning: 'Compare supports up to 3 contexts.' };
  };

  // Add 1st
  let res = toggle('pk-unmiss');
  assert.equal(res.success, true);
  assert.deepEqual(compareIds, ['pk-unmiss']);

  // Add 2nd
  res = toggle('pk-monusco');
  assert.equal(res.success, true);
  assert.deepEqual(compareIds, ['pk-unmiss', 'pk-monusco']);

  // Add 3rd
  res = toggle('seed-binuh');
  assert.equal(res.success, true);
  assert.deepEqual(compareIds, ['pk-unmiss', 'pk-monusco', 'seed-binuh']);

  // Attempt 4th - must reject with warning and keep current 3
  res = toggle('pk-unifil');
  assert.equal(res.success, false);
  assert.equal(res.warning, 'Compare supports up to 3 contexts.');
  assert.deepEqual(compareIds, ['pk-unmiss', 'pk-monusco', 'seed-binuh']);

  // Remove 2nd
  res = toggle('pk-monusco');
  assert.equal(res.success, true);
  assert.deepEqual(compareIds, ['pk-unmiss', 'seed-binuh']);

  // Clear
  compareIds = [];
  assert.equal(compareIds.length, 0);
});

// ============================================================================
// 2. THEMES COMPARISON TESTS
// ============================================================================

test('exact normalized shared themes detected without semantic inference', () => {
  const unmiss = resolvePlanningContext('pk-unmiss');
  const monusco = resolvePlanningContext('pk-monusco');
  assert.ok(unmiss && monusco);

  const shared = getSharedPlanningThemes([unmiss, monusco]);
  assert.ok(Array.isArray(shared));

  // Every theme in shared must exist in both contexts (case-insensitive normalized)
  shared.forEach((theme) => {
    const norm = normalizeComparisonTerm(theme);
    const inUnmiss = unmiss.reference.planningThemes.some((t) => normalizeComparisonTerm(t) === norm);
    const inMonusco = monusco.reference.planningThemes.some((t) => normalizeComparisonTerm(t) === norm);
    assert.ok(inUnmiss, `Shared theme "${theme}" must be in UNMISS`);
    assert.ok(inMonusco, `Shared theme "${theme}" must be in MONUSCO`);
  });

  // Distinct strings are not equated
  const syntheticContextA = {
    ...unmiss,
    reference: {
      ...unmiss.reference,
      planningThemes: ['Oversight Reform', 'Capacity Building']
    }
  };
  const syntheticContextB = {
    ...monusco,
    reference: {
      ...monusco.reference,
      planningThemes: ['Accountability Architecture', 'Capacity Building']
    }
  };

  const syntheticShared = getSharedPlanningThemes([syntheticContextA, syntheticContextB]);
  assert.deepEqual(syntheticShared, ['Capacity Building']);
  assert.ok(!syntheticShared.includes('Oversight Reform'));
  assert.ok(!syntheticShared.includes('Accountability Architecture'));
});

test('context-specific themes are preserved per context', () => {
  const unmiss = resolvePlanningContext('pk-unmiss');
  const monusco = resolvePlanningContext('pk-monusco');
  assert.ok(unmiss && monusco);

  const specific = getContextSpecificThemes([unmiss, monusco]);
  assert.equal(specific.length, 2);
  assert.equal(specific[0].contextId, unmiss.id);
  assert.equal(specific[1].contextId, monusco.id);

  const shared = getSharedPlanningThemes([unmiss, monusco]);
  const sharedNormalized = new Set(shared.map(normalizeComparisonTerm));

  // None of the specific themes should be in shared
  specific[0].themes.forEach((t) => {
    assert.ok(!sharedNormalized.has(normalizeComparisonTerm(t)));
  });
  specific[1].themes.forEach((t) => {
    assert.ok(!sharedNormalized.has(normalizeComparisonTerm(t)));
  });
});

// ============================================================================
// 3. STAKEHOLDER CATEGORIES TESTS
// ============================================================================

test('shared stakeholder categories derived correctly without assessed values', () => {
  const unmiss = resolvePlanningContext('pk-unmiss');
  const monusco = resolvePlanningContext('pk-monusco');
  assert.ok(unmiss && monusco);

  const sharedCats = getSharedStakeholderCategories([unmiss, monusco]);
  assert.ok(Array.isArray(sharedCats));

  sharedCats.forEach((cat) => {
    assert.equal(typeof cat, 'string');
    // Ensure no rating/score objects exist
    assert.ok(!cat.includes('High') && !cat.includes('Medium') && !cat.includes('Low'));
  });

  const specificCats = getContextSpecificStakeholderCategories([unmiss, monusco]);
  assert.equal(specificCats.length, 2);
  specificCats.forEach((entry) => {
    entry.categories.forEach((cat) => {
      assert.equal(typeof cat, 'string');
      assert.ok(!sharedCats.map(normalizeComparisonTerm).includes(normalizeComparisonTerm(cat)));
    });
  });
});

// ============================================================================
// 4. SOURCE COVERAGE & PROVENANCE TESTS
// ============================================================================

test('source coverage statement counts are correct and produce no score', () => {
  const unmiss = resolvePlanningContext('pk-unmiss');
  assert.ok(unmiss);

  const coverage = getContextSourceCoverage(unmiss);
  assert.equal(typeof coverage.sourceCount, 'number');
  assert.equal(typeof coverage.limitationsCount, 'number');
  assert.equal(typeof coverage.supportedStatementsCount, 'number');
  assert.equal(typeof coverage.unsupportedStatementsCount, 'number');
  assert.equal(coverage.supportedStatementsCount + coverage.unsupportedStatementsCount, 3);
  assert.equal(coverage.supportedStatementsCount, 3, 'UNMISS has 3 source-supported statements');
  assert.equal(coverage.unsupportedStatementsCount, 0);

  // Assert NO score properties exist
  assert.equal(coverage.score, undefined);
  assert.equal(coverage.trustScore, undefined);
  assert.equal(coverage.evidenceScore, undefined);
  assert.equal(coverage.confidenceScore, undefined);
});

test('context with empty sourceIds correctly increments unsupported statement count', () => {
  const unmiss = resolvePlanningContext('pk-unmiss');
  assert.ok(unmiss);

  const testContext = {
    ...unmiss,
    reference: {
      ...unmiss.reference,
      mandateSummary: { text: 'Mandate', sourceIds: ['src-1'] },
      policeRelevance: { text: 'Relevance', sourceIds: [] },
      hostStatePolice: { text: 'Counterpart', sourceIds: [] }
    }
  };

  const coverage = getContextSourceCoverage(testContext);
  assert.equal(coverage.supportedStatementsCount, 1);
  assert.equal(coverage.unsupportedStatementsCount, 2);
});

// ============================================================================
// 5. SEARCH & DISCOVERY ENHANCEMENT TESTS
// ============================================================================

test('search matches across PESTEL prompts, stakeholder prompts, and categories', () => {
  // 1. Search for a term present in PESTEL prompts
  const resultsPestel = filterMissionExplorerEntries(defaultExplorerSeeds, {
    searchQuery: 'detention',
    selectedRegion: 'all',
    selectedType: 'all',
    selectedStatus: 'all',
    showFictional: 'all'
  });
  assert.ok(resultsPestel.length > 0, 'Search for detention should surface relevant planning contexts');

  // 2. Search for a term present in candidate actors or categories
  const resultsActor = filterMissionExplorerEntries(defaultExplorerSeeds, {
    searchQuery: 'community-safety',
    selectedRegion: 'all',
    selectedType: 'all',
    selectedStatus: 'all',
    showFictional: 'all'
  });
  assert.ok(resultsActor.length > 0, 'Search for community-safety should surface relevant planning contexts');

  const resultsCategory = filterMissionExplorerEntries(defaultExplorerSeeds, {
    searchQuery: 'Civil Society',
    selectedRegion: 'all',
    selectedType: 'all',
    selectedStatus: 'all',
    showFictional: 'all'
  });
  assert.ok(resultsCategory.length > 0, 'Search for Civil Society category should surface relevant planning contexts');

  // 3. Search match explanation identifies non-obvious match
  const unmissEntry = defaultExplorerSeeds.find((e) => e.missionAcronym === 'UNMISS');
  assert.ok(unmissEntry);

  const reasonBasic = getSearchMatchReason(unmissEntry, 'South Sudan');
  assert.equal(reasonBasic, null, 'Country is an obvious match, reason should be null');

  const reasonAcronym = getSearchMatchReason(unmissEntry, 'UNMISS');
  assert.equal(reasonAcronym, null, 'Acronym is an obvious match, reason should be null');

  if (unmissEntry.planningThemes && unmissEntry.planningThemes.length > 0) {
    const theme = unmissEntry.planningThemes[0];
    const reasonTheme = getSearchMatchReason(unmissEntry, theme);
    assert.ok(reasonTheme && reasonTheme.includes('Matched theme:'), 'Theme match reason provided');
  }
});

test('quick filter verification status correctly filters contexts', () => {
  const refResults = filterMissionExplorerEntries(defaultExplorerSeeds, {
    searchQuery: '',
    selectedRegion: 'all',
    selectedType: 'all',
    selectedStatus: 'all',
    showFictional: 'all',
    selectedVerification: 'current-reference'
  });
  assert.ok(refResults.length > 0);
  refResults.forEach((entry) => {
    const ctx = resolvePlanningContext(entry.id);
    assert.equal(ctx?.verificationStatus, 'current-reference');
  });

  const trainingResults = filterMissionExplorerEntries(defaultExplorerSeeds, {
    searchQuery: '',
    selectedRegion: 'all',
    selectedType: 'all',
    selectedStatus: 'all',
    showFictional: 'all',
    selectedVerification: 'training-only'
  });
  assert.ok(trainingResults.length > 0);
  trainingResults.forEach((entry) => {
    assert.equal(entry.isFictionalScenario, true);
  });
});

// ============================================================================
// 6. INTEGRITY TESTS
// ============================================================================

test('comparison functions do not mutate canonical PlanningContext records', () => {
  const allContexts = getAllPlanningContexts();
  const unmiss = resolvePlanningContext('pk-unmiss');
  const monusco = resolvePlanningContext('pk-monusco');
  assert.ok(unmiss && monusco);

  const unmissSnapshot = JSON.stringify(unmiss);
  const monuscoSnapshot = JSON.stringify(monusco);

  // Execute all comparison functions
  getSharedPlanningThemes([unmiss, monusco]);
  getContextSpecificThemes([unmiss, monusco]);
  getSharedStakeholderCategories([unmiss, monusco]);
  getContextSpecificStakeholderCategories([unmiss, monusco]);
  getContextSourceCoverage(unmiss);
  getContextSourceCoverage(monusco);
  hasMixedOperationalStatus([unmiss, monusco]);
  getContextDifferences([unmiss, monusco]);

  assert.equal(JSON.stringify(unmiss), unmissSnapshot, 'UNMISS must not be mutated');
  assert.equal(JSON.stringify(monusco), monuscoSnapshot, 'MONUSCO must not be mutated');
  assert.equal(allContexts.length, 18, 'Catalogue length unchanged');
});

// ============================================================================
// 7. MIXED CONTEXTS TESTS
// ============================================================================

test('mixed real and fictional context comparison condition works accurately', () => {
  const unmiss = resolvePlanningContext('pk-unmiss');
  const monusco = resolvePlanningContext('pk-monusco');
  const fictional1 = resolvePlanningContext('fictional-post-conflict');
  const fictional2 = resolvePlanningContext('fictional-trust-deficit');
  assert.ok(unmiss && monusco && fictional1 && fictional2);

  // Real + Real -> false
  assert.equal(hasMixedOperationalStatus([unmiss, monusco]), false);

  // Fictional + Fictional -> false
  assert.equal(hasMixedOperationalStatus([fictional1, fictional2]), false);

  // Real + Fictional -> true
  assert.equal(hasMixedOperationalStatus([unmiss, fictional1]), true);
  assert.equal(hasMixedOperationalStatus([unmiss, monusco, fictional1]), true);
});

// ============================================================================
// 8. TRANSFER CHECK & DIFFERENCES TESTS
// ============================================================================

test('transfer check returns exactly 9 static methodological checklist questions', () => {
  const questions = getTransferCheckQuestions();
  assert.equal(questions.length, 9);

  questions.forEach((q) => {
    assert.ok(q.id && typeof q.id === 'string');
    assert.ok(q.category && typeof q.category === 'string');
    assert.ok(q.question && typeof q.question === 'string');
    // Questions must end with question mark
    assert.ok(q.question.endsWith('?'));
  });
});

test('context differences helper accurately flags differing categorical dimensions', () => {
  const unmiss = resolvePlanningContext('pk-unmiss');
  const monusco = resolvePlanningContext('pk-monusco');
  assert.ok(unmiss && monusco);

  const diffs = getContextDifferences([unmiss, monusco]);
  assert.equal(typeof diffs.statusDiffers, 'boolean');
  assert.equal(typeof diffs.typeDiffers, 'boolean');
  assert.equal(typeof diffs.verificationDiffers, 'boolean');
  assert.equal(typeof diffs.regionDiffers, 'boolean');

  // Both UNMISS and MONUSCO are active peacekeeping operations with current-reference verification
  assert.equal(diffs.statusDiffers, false);
  assert.equal(diffs.verificationDiffers, false);
});
