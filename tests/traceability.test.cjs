/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');

const { validateAndNormalizeProjectData } = require('../.test-dist/lib/projectDataValidation.js');
const { calculateQualityWarnings } = require('../.test-dist/lib/warnings.js');

function legacyFixture() {
  return {
    profile: { countryName: 'Context', missionName: 'Mission', region: '', mandateEnvironment: '', hostStatePolice: '', conflictContext: '', planningPurpose: '', assessmentDate: '2026-08-12', analystName: 'Participant / Team', templateId: 'blank' },
    pestels: Object.fromEntries(['political', 'economic', 'social', 'technological', 'environmental', 'legal', 'security'].map(id => [id, { id, name: id, definition: '', finding: '', why: '', cbdAreas: [], dimensions: [], stakeholders: [], sequencing: '', rating: { impact: 1, urgency: 1, confidence: 3, relevance: 1 } }])),
    stakeholders: [{ id: 'lead', name: 'Lead actor', category: 'Host State', role: '', authority: '', influence: 'High', position: 'Enabler', legitimacy: 'Medium', relevance: 'High', capacity: 'Medium', risk: '', entry: '', engagement: '', cbdAreas: [] }],
    customCells: { 'Area|Lens': { key: 'Area|Lens', why: '', individual: '', organizational: '', environment: '', indicators: ['Indicator'], drivers: [], stakeholders: ['lead'], risks: '', sequencing: '', confidence: 3, priorityScore: 5, result: '', engagement: '' } },
    priorityBrief: { topPriorities: ['Priority'], quickWins: [], sensitiveReforms: [], longerTermReforms: [], risksAssumptions: [], sequencingRecommendation: 'Sequence.' },
    version: 'v0.3.2'
  };
}

test('legacy workspaces migrate traceability fields to safe empty values', () => {
  const result = validateAndNormalizeProjectData(legacyFixture());
  assert.equal(result.error, null);
  const cell = result.data.customCells['Area|Lens'];
  assert.equal(cell.capacityProblem, '');
  assert.equal(cell.planningObjective, '');
  assert.equal(cell.leadStakeholderId, null);
  assert.deepEqual(cell.supportingStakeholderIds, []);
  assert.equal(cell.implementationPhase, null);
  assert.equal(cell.milestoneTimeframe, '');
  assert.deepEqual(cell.strategicOptionIds, []);
  assert.deepEqual(result.data.analysisSynthesis, { swotFindings: [], strategicOptions: [] });
});

test('traceability fields survive JSON round-trip and invalid actor IDs are removed', () => {
  const input = legacyFixture();
  Object.assign(input.customCells['Area|Lens'], { capacityProblem: 'Gap', planningObjective: 'Objective', leadStakeholderId: 'lead', supportingStakeholderIds: ['missing'], implementationPhase: 'NEXT', milestoneTimeframe: '90 days' });
  const result = validateAndNormalizeProjectData(JSON.parse(JSON.stringify(input)));
  const cell = result.data.customCells['Area|Lens'];
  assert.equal(cell.capacityProblem, 'Gap');
  assert.equal(cell.implementationPhase, 'NEXT');
  assert.equal(cell.leadStakeholderId, 'lead');
  assert.deepEqual(cell.supportingStakeholderIds, []);
  assert.equal(cell.milestoneTimeframe, '90 days');
});

test('high-value traceability quality-control warnings trigger', () => {
  const data = validateAndNormalizeProjectData(legacyFixture()).data;
  const cell = data.customCells['Area|Lens'];
  Object.assign(cell, { impact: 5, urgency: 5, feasibility: 5, stakeholderSupport: 5, mandateRelevance: 5, riskRating: 1 });
  cell.indicators = [];
  cell.implementationPhase = 'NOW';
  const ids = new Set(calculateQualityWarnings(data).map(item => item.id));
  assert.ok(ids.has('matrix-no-problem-Area|Lens'));
  assert.ok(ids.has('matrix-no-objective-Area|Lens'));
  assert.ok(ids.has('matrix-phase-no-lead-Area|Lens'));
  assert.ok(ids.has('matrix-now-no-indicator-Area|Lens'));
  assert.ok(ids.has('matrix-no-evidence-Area|Lens'));
});
