/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const {
  EXPORT_VIEW,
  HOME_VIEW,
  WORKFLOW_STAGES,
  getDashboardContinueStep,
  isWorkflowStage,
  mapV05StepToView
} = require('../.test-dist/lib/workflow.js');
const { buildCaranaDemoData } = require('../.test-dist/data/caranaDemo.js');

test('dashboard Continue follows the seven-step workflow', () => {
  assert.equal(getDashboardContinueStep({ isProfileEmpty: true, isPestelsEmpty: true, isStakeholdersEmpty: true, isCustomCellsEmpty: true, isSequencingEmpty: true }), 1);
  assert.equal(getDashboardContinueStep({ isProfileEmpty: false, isPestelsEmpty: true, isStakeholdersEmpty: true, isCustomCellsEmpty: true, isSequencingEmpty: true }), 2);
  assert.equal(getDashboardContinueStep({ isProfileEmpty: false, isPestelsEmpty: false, isStakeholdersEmpty: true, isCustomCellsEmpty: true, isSequencingEmpty: true }), 3);
  assert.equal(getDashboardContinueStep({ isProfileEmpty: false, isPestelsEmpty: false, isStakeholdersEmpty: false, isCustomCellsEmpty: true, isSequencingEmpty: true }), 5);
  assert.equal(getDashboardContinueStep({ isProfileEmpty: false, isPestelsEmpty: false, isStakeholdersEmpty: false, isCustomCellsEmpty: false, isSequencingEmpty: true }), 6);
  assert.equal(getDashboardContinueStep({ isProfileEmpty: false, isPestelsEmpty: false, isStakeholdersEmpty: false, isCustomCellsEmpty: false, isSequencingEmpty: false }), 7);
});

test('Home and Export are separate from exactly seven substantive planning stages', () => {
  assert.equal(HOME_VIEW, 0);
  assert.equal(EXPORT_VIEW, 8);
  assert.equal(WORKFLOW_STAGES.length, 7);
  assert.deepEqual(WORKFLOW_STAGES.map(stage => stage.label), [
    'Context & Mandate',
    'Diagnostic Analysis',
    'Stakeholders & Ownership',
    'Analysis Synthesis',
    'CBD Priorities',
    'Prioritization & Sequencing',
    'Results & Implementation'
  ]);
  assert.equal(WORKFLOW_STAGES.some(stage => /home|export/i.test(stage.label)), false);
});

test('v0.5 navigation concepts map safely without changing project data', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7].map(step => mapV05StepToView(step)), [0, 1, 2, 3, 5, 6, 8]);
  assert.equal(mapV05StepToView(4, true), 4);
  assert.equal(mapV05StepToView(99), HOME_VIEW);
});

test('workflow stage discrimination and view boundaries validate correctly', () => {
  for (let id = 1; id <= 7; id++) {
    assert.equal(isWorkflowStage(id), true);
  }
  assert.equal(isWorkflowStage(HOME_VIEW), false);
  assert.equal(isWorkflowStage(EXPORT_VIEW), false);
  assert.equal(isWorkflowStage(-1), false);
  assert.equal(isWorkflowStage(8), false);
  assert.equal(isWorkflowStage(99), false);

  assert.equal(WORKFLOW_STAGES.length, 7);
  WORKFLOW_STAGES.forEach((stage, idx) => {
    assert.equal(stage.id, idx + 1);
    assert.equal(typeof stage.label, 'string');
    assert.ok(stage.label.length > 0);
    assert.equal(typeof stage.sub, 'string');
    assert.ok(stage.sub.length > 0);
  });

  const stage4 = WORKFLOW_STAGES.find(s => s.id === 4);
  assert.ok(stage4);
  assert.equal(stage4.label, 'Analysis Synthesis');

  const stage7 = WORKFLOW_STAGES.find(s => s.id === 7);
  assert.ok(stage7);
  assert.equal(stage7.label, 'Results & Implementation');

  assert.ok(!WORKFLOW_STAGES.some(s => s.id === HOME_VIEW));
  assert.ok(!WORKFLOW_STAGES.some(s => s.id === EXPORT_VIEW));
});

test('CARANA demonstration is coherent, fictional, and fully populated', () => {
  const pestelsKeys = ['political', 'economic', 'social', 'technological', 'environmental', 'legal', 'security'];
  const stakeholderIds = [
    'sh-unpol-lead', 'sh-interior-min', 'sh-police-hq', 'sh-local-command', 'sh-inspectorate',
    'sh-academy', 'sh-justice', 'sh-local-admin', 'sh-civil-society', 'sh-donors', 'sh-human-rights'
  ];
  const cellKeys = [
    'Accountability Mechanisms|Human Rights',
    'Stakeholder Engagement|Gender',
    'Administrative Systems|Police Practice'
  ];
  const base = {
    profile: {},
    pestels: Object.fromEntries(pestelsKeys.map(id => [id, { id, rating: {}, evidenceNotes: [] }])),
    stakeholders: stakeholderIds.map(id => ({ id, name: id })),
    customCells: Object.fromEntries(cellKeys.map(key => [key, { key, indicators: [], evidenceNotes: [] }])),
    priorityBrief: {},
    version: 'test'
  };
  const data = buildCaranaDemoData(base);

  assert.equal(data.profile.templateId, 'fictional-carana-demo');
  assert.equal(data.profile.sourceCategory, 'Fictional Training Scenario');
  assert.match(data.profile.countryName, /fictional/i);
  assert.match(data.profile.missionName, /CARANA/);
  assert.equal(Object.keys(data.pestels).length, 7);
  assert.ok(Object.values(data.pestels).every(item => item.finding && !item.finding.startsWith('[VERIFY]')));
  assert.ok(data.stakeholders.length >= 8);
  assert.ok(Object.keys(data.customCells).length >= 3);
  assert.ok(Object.values(data.customCells).every(cell => cell.indicators.length > 0 && cell.sequencing));
  assert.ok(data.priorityBrief.topPriorities.length >= 3);
  assert.match(data.priorityBrief.sequencingRecommendation, /Phase 1/);
  assert.ok(Object.values(data.pestels).some(item => (item.evidenceNotes || []).length > 0));
  assert.ok(Object.values(data.customCells).every(cell => (cell.evidenceNotes || []).length > 0));
  assert.ok(Object.values(data.customCells).every(cell => cell.capacityProblem && cell.planningObjective));
  assert.ok(Object.values(data.customCells).every(cell => cell.leadStakeholderId && cell.implementationPhase && cell.milestoneTimeframe));
  const validIds = new Set(data.stakeholders.map(stakeholder => stakeholder.id));
  assert.ok(Object.values(data.customCells).every(cell => validIds.has(cell.leadStakeholderId)));
  assert.ok(Object.values(data.customCells).every(cell => cell.supportingStakeholderIds.every(id => validIds.has(id))));
});
