/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');

const { getDashboardContinueStep } = require('../.test-dist/lib/workflow.js');
const { buildCaranaDemoData } = require('../.test-dist/data/caranaDemo.js');

test('dashboard Continue follows the seven-step workflow', () => {
  assert.equal(getDashboardContinueStep({ isProfileEmpty: true, isPestelsEmpty: true, isStakeholdersEmpty: true, isCustomCellsEmpty: true }), 2);
  assert.equal(getDashboardContinueStep({ isProfileEmpty: false, isPestelsEmpty: true, isStakeholdersEmpty: true, isCustomCellsEmpty: true }), 3);
  assert.equal(getDashboardContinueStep({ isProfileEmpty: false, isPestelsEmpty: false, isStakeholdersEmpty: true, isCustomCellsEmpty: true }), 4);
  assert.equal(getDashboardContinueStep({ isProfileEmpty: false, isPestelsEmpty: false, isStakeholdersEmpty: false, isCustomCellsEmpty: true }), 5);
  assert.equal(getDashboardContinueStep({ isProfileEmpty: false, isPestelsEmpty: false, isStakeholdersEmpty: false, isCustomCellsEmpty: false }), 6);
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
