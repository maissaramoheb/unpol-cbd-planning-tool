/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { getInitialProjectData } = require('../.test-dist/lib/storage.js');
const { buildCaranaDemoData } = require('../.test-dist/data/caranaDemo.js');
const { validateAndNormalizeProjectData } = require('../.test-dist/lib/projectDataValidation.js');
const { indicatorTexts, normalizeResultsReferences, emptyResultsPlan, createIndicator, resultsCautions, resultsCompleteness } = require('../.test-dist/lib/resultsPlanning.js');
const { generateMarkdownBrief } = require('../.test-dist/lib/exportMarkdown.js');
const { buildPlanningBriefModel } = require('../.test-dist/lib/reportModel.js');
const { evaluateCbdCell } = require('../.test-dist/lib/scoring.js');
const demo = () => buildCaranaDemoData(getInitialProjectData());
const normalize = data => { const result = validateAndNormalizeProjectData(JSON.parse(JSON.stringify(data))); assert.equal(result.error, null); return result.data; };

test('v0.6 legacy migration preserves exact objective, interventions, indicators, lead, timing and risk without inferred results', () => {
  const legacy = demo();
  for (const cell of Object.values(legacy.customCells)) {
    delete cell.resultsPlan;
    cell.indicators = ['  Exact whitespace\nretained  ', '', 'Repeated', 'Repeated', 'شرطة — سجل'];
  }
  const migrated = normalize(legacy);
  for (const [key, old] of Object.entries(legacy.customCells)) {
    const cell = migrated.customCells[key];
    for (const field of ['planningObjective', 'individual', 'organizational', 'environment', 'capacityProblem', 'leadStakeholderId', 'supportingStakeholderIds', 'implementationPhase', 'milestoneTimeframe', 'risks', 'sequencing', 'result']) assert.deepEqual(cell[field], old[field], field);
    assert.deepEqual(indicatorTexts(cell), old.indicators);
    assert.equal(cell.resultsPlan, undefined);
    assert.equal(new Set(cell.indicators.map(i => i.id)).size, old.indicators.length);
    cell.indicators.forEach(i => { assert.equal(i.baseline, ''); assert.equal(i.target, ''); assert.equal(i.responsibleActorId, null); assert.equal(i.resultLevel, 'Not assigned'); });
    assert.deepEqual(normalize(migrated).customCells[key].indicators, cell.indicators);
  }
});

test('all rich Results Plan collections and measurement values survive JSON round-trip without changing stages 1–6 or scoring', () => {
  const data = demo();
  const result = normalize(data);
  assert.deepEqual(result, data);
  for (const [key, cell] of Object.entries(data.customCells)) {
    assert.deepEqual(result.customCells[key].resultsPlan, cell.resultsPlan);
    assert.deepEqual(result.customCells[key].indicators, cell.indicators);
    assert.deepEqual(evaluateCbdCell(result.customCells[key]), evaluateCbdCell(cell));
    const i = cell.indicators[0];
    for (const field of ['baseline', 'target', 'verification', 'frequency', 'responsibleActorId']) assert.ok(i[field]);
    assert.equal(cell.resultsPlan.activities[0].interventionLevel, 'organizational');
  }
  for (const field of ['profile', 'pestels', 'stakeholders', 'analysisSynthesis', 'priorityBrief']) assert.deepEqual(result[field], data[field]);
});

test('CARANA has three coherent partial plans with live output/activity/actor/assumption/resource references', () => {
  const data = demo();
  assert.equal(Object.keys(data.customCells).length, 3);
  const actors = new Set(data.stakeholders.map(s => s.id));
  for (const cell of Object.values(data.customCells)) {
    const p = cell.resultsPlan;
    assert.ok(p.outputs.length >= 1 && p.outputs.length <= 3);
    assert.ok(p.activities.every(a => p.outputs.some(o => a.outputIds.includes(o.id))));
    assert.ok(p.activities.every(a => actors.has(a.implementingActorId)));
    assert.ok(p.activities.every(a => p.resources.some(r => a.resourceIds.includes(r.id))));
    assert.ok(p.changeLogic.assumptionIds.every(id => p.assumptions.some(a => a.id === id)));
    assert.ok(actors.has(p.ownership.counterpartActorId));
    assert.equal(p.ownership.status, 'Consulted');
    assert.match(p.ownership.note, /Fictional/);
    assert.match(cell.indicators[0].baseline, /Fictional/);
    assert.ok(cell.indicators.some(i => !i.baseline));
    assert.equal(p.resources[0].availability, 'Unknown');
    assert.equal(p.dependencies[0].status, 'Required');
  }
});

test('stakeholder deletion clears measurement, implementation, ownership and mitigation references immediately', () => {
  const data = demo();
  const key = Object.keys(data.customCells)[0];
  const id = data.customCells[key].resultsPlan.ownership.counterpartActorId;
  data.stakeholders = data.stakeholders.filter(s => s.id !== id);
  const cell = normalizeResultsReferences(data).customCells[key];
  assert.equal(cell.leadStakeholderId, null);
  assert.ok(!cell.supportingStakeholderIds.includes(id));
  assert.equal(cell.indicators[0].responsibleActorId, null);
  assert.equal(cell.resultsPlan.activities[0].implementingActorId, null);
  assert.equal(cell.resultsPlan.ownership.counterpartActorId, null);
  assert.equal(cell.resultsPlan.ownership.status, 'Not yet assessed');
  assert.equal(cell.resultsPlan.riskManagement.responsibleActorId, null);
  assert.ok(cell.resultsPlan.ownership.note);
});

test('output deletion clears activity and indicator links without deleting their analytical content', () => {
  const data = demo(); const key = Object.keys(data.customCells)[0];
  const before = data.customCells[key].indicators[1].statement;
  data.customCells[key].resultsPlan.outputs = [];
  const cell = normalizeResultsReferences(data).customCells[key];
  assert.equal(cell.indicators[1].linkedRecordId, null);
  assert.equal(cell.indicators[1].statement, before);
  assert.deepEqual(cell.resultsPlan.activities[0].outputIds, []);
});

test('activity and priority deletions clear cross-priority dependencies and reset stale status', () => {
  const data = demo(); const [first, second] = Object.keys(data.customCells);
  const activityId = data.customCells[first].resultsPlan.activities[0].id;
  data.customCells[second].resultsPlan.dependencies.push({ id: 'cross', type: 'Activity', statement: 'Depends on pilot', linkedPriorityKey: first, linkedRecordId: activityId, status: 'Met' });
  data.customCells[first].resultsPlan.activities = [];
  let result = normalizeResultsReferences(data);
  assert.equal(result.customCells[second].resultsPlan.dependencies[1].linkedRecordId, null);
  assert.equal(result.customCells[second].resultsPlan.dependencies[1].status, 'Not assessed');
  assert.deepEqual(result.customCells[first].resultsPlan.changeLogic.activityIds, []);
  assert.equal(result.customCells[first].indicators[2].linkedRecordId, null);
  delete result.customCells[first];
  result = normalizeResultsReferences(result);
  assert.equal(result.customCells[first], undefined);
  assert.equal(result.customCells[second].resultsPlan.dependencies[1].linkedPriorityKey, null);
});

test('assumption, resource and dependency deletions clean their local links', () => {
  const data = demo(); const key = Object.keys(data.customCells)[0];
  Object.assign(data.customCells[key].resultsPlan, { assumptions: [], resources: [], dependencies: [] });
  const p = normalizeResultsReferences(data).customCells[key].resultsPlan;
  assert.deepEqual(p.changeLogic.assumptionIds, []);
  assert.deepEqual(p.activities[0].resourceIds, []);
  assert.deepEqual(p.activities[0].dependencyIds, []);
});

test('invalid structured data, duplicate IDs and unknown enums are rejected atomically', () => {
  for (const corrupt of [
    cell => { cell.resultsPlan.schemaVersion = 99; },
    cell => { cell.resultsPlan.outputs.push(cell.resultsPlan.outputs[0]); },
    cell => { cell.indicators.push(cell.indicators[0]); },
    cell => { cell.indicators[0].baseline = 42; },
    cell => { cell.indicators[0].frequency = 'Invented'; },
    cell => { cell.resultsPlan.ownership.status = 'Verified'; },
    cell => { cell.resultsPlan.activities[0].supportingActorIds = null; },
    cell => { cell.resultsPlan.dependencies[0].status = 'Approved'; },
    cell => { cell.resultsPlan = null; },
    cell => { cell.indicators.push(null); }
  ]) {
    const data = demo(); corrupt(Object.values(data.customCells)[0]);
    const before = JSON.stringify(data);
    const result = validateAndNormalizeProjectData(data);
    assert.equal(result.data, null);
    assert.ok(result.error);
    assert.equal(JSON.stringify(data), before);
  }
});

test('same indicator edits appear in existing report and Markdown without rich-output expansion', () => {
  const data = demo(); const key = Object.keys(data.customCells)[0];
  data.customCells[key].indicators[0].statement = 'Canonical indicator edited once';
  data.customCells[key].indicators[0].baseline = 'PRIVATE WORKSPACE BASELINE SENTINEL';
  const report = buildPlanningBriefModel(data);
  assert.ok(report.priorities.some(p => indicatorTexts(p.cell).includes('Canonical indicator edited once')));
  const markdown = generateMarkdownBrief(data);
  assert.match(markdown, /Canonical indicator edited once/);
  assert.doesNotMatch(markdown, /PRIVATE WORKSPACE BASELINE SENTINEL/);
  assert.doesNotMatch(markdown, /\[object Object\]/);
});

test('blank workspace remains blank and empty plans make no invented judgements', () => {
  assert.deepEqual(normalize(getInitialProjectData('blank')).customCells, {});
  const p = emptyResultsPlan();
  assert.equal(p.ownership.status, 'Not yet assessed');
  assert.equal(p.changeLogic.because, '');
  assert.deepEqual(p.resources, []);
  assert.deepEqual(p.dependencies, []);
  assert.deepEqual(p.sustainability, []);
  assert.equal(createIndicator('new').resultLevel, 'Not assigned');
});

test('completeness is descriptive and cautions remain bounded without judging consultation as approval', () => {
  const data = demo(); const cell = Object.values(data.customCells)[0];
  assert.ok(resultsCautions(cell).length <= 7);
  assert.ok(resultsCompleteness(cell).every(c => ['Recorded', 'Partially recorded', 'Not recorded'].includes(c.status)));
  assert.equal(resultsCompleteness(cell).find(c => c.label === 'Measurement').status, 'Partially recorded');
  assert.equal(resultsCompleteness(cell).find(c => c.label === 'Resources').status, 'Partially recorded');
  assert.equal(cell.resultsPlan.ownership.status, 'Consulted');
});
