/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');

const {
  EXPORT_VIEW,
  HOME_VIEW,
  WORKFLOW_STAGES,
  getDashboardContinueStep,
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

test('main shell exposes Stage 4 directly, Stage 7 summary, and non-numbered Export', () => {
  const shell = fs.readFileSync('src/components/AppShell.tsx', 'utf8');
  const tabs = fs.readFileSync('src/components/ModuleTabs.tsx', 'utf8');
  const results = fs.readFileSync('src/components/ResultsImplementation.tsx', 'utf8');
  const exportBrief = fs.readFileSync('src/components/ExportBrief.tsx', 'utf8');

  assert.match(shell, /case 4:[\s\S]*<AnalysisSynthesis/);
  assert.match(shell, /case 7:[\s\S]*<ResultsImplementation/);
  assert.match(shell, /case EXPORT_VIEW:[\s\S]*<ExportBrief/);
  assert.match(tabs, /WORKFLOW_STAGES\.map/);
  assert.match(tabs, /Home<\/button>/);
  assert.match(tabs, /Export<\/button>/);
  assert.match(results, /Currently recorded/);
  assert.match(results, /Future results-planning capability/);
  assert.doesNotMatch(exportBrief, />7\. Export Planning Brief</);
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
