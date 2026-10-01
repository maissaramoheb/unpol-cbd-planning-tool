/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { getInitialProjectData } = require('../.test-dist/lib/storage.js');
const { buildCaranaDemoData } = require('../.test-dist/data/caranaDemo.js');
const { buildTraceabilityIndex, getEntity, getUpstream, getDownstream, getEvidenceConnections, traceKey } = require('../.test-dist/lib/traceability.js');
const { buildPlanningOutput } = require('../.test-dist/lib/planningOutputs.js');
const { buildExecutiveBriefModel } = require('../.test-dist/lib/executiveBrief.js');
const { buildPlanningBriefModel } = require('../.test-dist/lib/reportModel.js');
const { generateMarkdownBrief } = require('../.test-dist/lib/exportMarkdown.js');
const { WorkbenchRegion, InspectButton } = require('../.test-dist/components/WorkbenchInspector.js');
const demo = () => buildCaranaDemoData(getInitialProjectData());

test('Inspector resolves existing IDs and references without inventing professional references', () => {
  const data = demo(); const index = buildTraceabilityIndex(data);
  const output = Object.values(data.customCells)[0].resultsPlan.outputs[0];
  const key = Object.keys(data.customCells)[0];
  assert.equal(getEntity(index, { type: 'output', id: output.id, owner: key }).reference, output.reference);
  assert.equal(getEntity(index, { type: 'pestels', id: data.pestels.political.id }).reference, undefined);
  assert.ok(index.entities.some(entity => entity.typeLabel === 'Evidence note'));
});

test('owner-scoped result and evidence identities cannot collide', () => {
  const data = demo(); const keys = Object.keys(data.customCells);
  const first = data.customCells[keys[0]].resultsPlan.outputs[0];
  data.customCells[keys[1]].resultsPlan.outputs[0].id = first.id;
  const index = buildTraceabilityIndex(data);
  assert.notEqual(getEntity(index, { type: 'output', id: first.id, owner: keys[0] }).key, getEntity(index, { type: 'output', id: first.id, owner: keys[1] }).key);
  assert.notEqual(traceKey({ type: 'evidence', id: 'same', owner: 'one' }), traceKey({ type: 'evidence', id: 'same', owner: 'two' }));
});

test('deleting a selected object resolves to a safe unavailable state', () => {
  const data = demo(); const ref = { type: 'swot', id: data.analysisSynthesis.swotFindings[0].id };
  assert.ok(getEntity(buildTraceabilityIndex(data), ref));
  data.analysisSynthesis.swotFindings = [];
  assert.equal(getEntity(buildTraceabilityIndex(data), ref), null);
  assert.equal(getEntity(buildTraceabilityIndex(data), { type: 'priority', id: 'missing' }), null);
});

test('Inspector UI state and derived index never enter project JSON', () => {
  const data = demo(); const before = JSON.stringify(data);
  renderToStaticMarkup(React.createElement(WorkbenchRegion, { data, onNavigate: () => {} }, React.createElement(InspectButton, { entityRef: { type: 'pestels', id: 'political' }, label: 'Political finding' })));
  assert.equal(JSON.stringify(data), before);
  assert.doesNotMatch(before, /selectedInspectorItem|inspectorOpen|traceabilityView/);
});

test('explicit SWOT → option → priority → output links have correct directions', () => {
  const data = demo(); const index = buildTraceabilityIndex(data);
  const option = data.analysisSynthesis.strategicOptions.find(o => Object.values(data.customCells).some(c => c.strategicOptionIds.includes(o.id)));
  const finding = { type: 'swot', id: option.swotFindingIds[0] };
  const optionRef = { type: 'option', id: option.id };
  const [key, cell] = Object.entries(data.customCells).find(([, cell]) => cell.strategicOptionIds.includes(option.id));
  const priority = { type: 'priority', id: key };
  const output = { type: 'output', id: cell.resultsPlan.outputs[0].id, owner: key };
  assert.ok(getDownstream(index, finding).some(r => r.to === traceKey(optionRef) && r.relationType === 'contributes'));
  assert.ok(getUpstream(index, optionRef).some(r => r.from === traceKey(finding)));
  assert.ok(getDownstream(index, optionRef).some(r => r.to === traceKey(priority)));
  assert.ok(getDownstream(index, priority).some(r => r.to === traceKey(output) && r.label === 'Has recorded output'));
  assert.ok(!getDownstream(index, output).some(r => r.to === traceKey(priority)));
});

test('shared text, stakeholder names and CBD areas never create relationships', () => {
  const data = getInitialProjectData('blank');
  data.stakeholders = demo().stakeholders;
  data.stakeholders.forEach(actor => { actor.evidenceNotes = []; });
  data.pestels.political.finding = 'Identical topic';
  data.pestels.economic.finding = 'Identical topic';
  data.pestels.political.stakeholders = [data.stakeholders[0].name];
  data.priorityBrief.topPriorities = ['Identical topic'];
  const index = buildTraceabilityIndex(data);
  assert.equal(index.relations.length, 0);
  assert.equal(index.entities.filter(e => e.ref.type === 'priority').length, 0); // no matrix fallback suggestions
});

test('duplicate stored references are deduplicated by endpoints and relation type', () => {
  const data = demo(); const finding = data.analysisSynthesis.swotFindings[0];
  finding.sourceReferences.push(...finding.sourceReferences);
  const option = data.analysisSynthesis.strategicOptions[0]; option.swotFindingIds.push(...option.swotFindingIds);
  const index = buildTraceabilityIndex(data);
  assert.equal(index.relations.length, new Set(index.relations.map(r => JSON.stringify([r.from, r.to, r.relationType]))).size);
});

test('index ordering is deterministic when stored object and array ordering changes', () => {
  const data = demo(); const first = buildTraceabilityIndex(data);
  data.pestels = Object.fromEntries(Object.entries(data.pestels).reverse());
  data.customCells = Object.fromEntries(Object.entries(data.customCells).reverse());
  data.stakeholders.reverse(); data.interdependencies.reverse();
  data.analysisSynthesis.swotFindings.reverse(); data.analysisSynthesis.strategicOptions.reverse();
  const second = buildTraceabilityIndex(data);
  assert.deepEqual(first.entities, second.entities);
  assert.deepEqual(first.relations, second.relations);
});

test('direct evidence stays distinct from evidence reached through recorded source links', () => {
  const data = demo(); const index = buildTraceabilityIndex(data);
  const political = { type: 'pestels', id: data.pestels.political.id };
  assert.equal(getEvidenceConnections(index, political).direct.length, data.pestels.political.evidenceNotes.length);
  assert.equal(getEvidenceConnections(index, political).upstream.length, 0);
  const swot = data.analysisSynthesis.swotFindings.find(f => f.sourceReferences.some(r => r.type === 'pestels' && r.id === political.id));
  const result = getEvidenceConnections(index, { type: 'swot', id: swot.id });
  assert.ok(result.upstream.some(e => e.evidence.id === data.pestels.political.evidenceNotes[0].id));
  assert.ok(result.direct.every(e => !result.upstream.some(other => other.key === e.key)));
});

test('ambiguous bare evidence IDs and missing references are never guessed', () => {
  const data = demo(); const note = data.pestels.political.evidenceNotes[0];
  data.stakeholders[0].evidenceNotes = [{ ...note }];
  const swot = data.analysisSynthesis.swotFindings[0];
  swot.sourceReferences = [{ type: 'evidence', id: note.id }, { type: 'stakeholder', id: 'deleted' }];
  const index = buildTraceabilityIndex(data);
  assert.equal(getUpstream(index, { type: 'swot', id: swot.id }).length, 0);
  assert.equal(index.entities.filter(e => e.ref.type === 'evidence' && e.ref.id === note.id).length, 2);
});

test('valid interdependencies preserve source/target roles and exclude invalid references', () => {
  const data = demo(); const item = data.interdependencies[0];
  let index = buildTraceabilityIndex(data); const ref = { type: 'interdependency', id: item.id };
  assert.ok(getUpstream(index, ref).some(r => r.from === traceKey({ type: 'pestels', id: item.sourceFindingId }) && r.relationType === 'source-finding'));
  assert.ok(getUpstream(index, ref).some(r => r.from === traceKey({ type: 'pestels', id: item.targetFindingId }) && r.relationType === 'target-finding'));
  item.targetFindingId = 'deleted'; index = buildTraceabilityIndex(data);
  assert.equal(getUpstream(index, ref).length, 0);
  assert.equal(getDownstream(index, ref).length, 0);
});

test('result links use owning priority and result-level-specific IDs, never shared intervention levels', () => {
  const data = demo(); const [key, cell] = Object.entries(data.customCells)[0];
  const activity = cell.resultsPlan.activities[0]; const output = cell.resultsPlan.outputs[0];
  let index = buildTraceabilityIndex(data);
  assert.ok(getDownstream(index, { type: 'activity', id: activity.id, owner: key }).some(r => r.to === traceKey({ type: 'output', id: output.id, owner: key })));
  activity.outputIds = ['missing']; cell.indicators[1].linkedRecordId = 'missing';
  index = buildTraceabilityIndex(data);
  assert.ok(!getDownstream(index, { type: 'activity', id: activity.id, owner: key }).some(r => r.relationType === 'output-link'));
  assert.ok(!getUpstream(index, { type: 'indicator', id: cell.indicators[1].id, owner: key }).some(r => r.relationType === 'measures'));
});

test('cross-priority dependencies are type-specific and evidence traversal terminates on cycles', () => {
  const data = demo(); const keys = Object.keys(data.customCells); const cell = data.customCells[keys[0]];
  const other = data.customCells[keys[1]].resultsPlan.activities[0];
  const dependency = cell.resultsPlan.dependencies[0];
  Object.assign(dependency, { type: 'Activity', linkedPriorityKey: keys[1], linkedRecordId: other.id });
  let index = buildTraceabilityIndex(data);
  assert.ok(getUpstream(index, { type: 'dependency', id: dependency.id, owner: keys[0] }).some(r => r.from === traceKey({ type: 'activity', id: other.id, owner: keys[1] })));
  dependency.type = 'Other'; index = buildTraceabilityIndex(data);
  assert.ok(!getUpstream(index, { type: 'dependency', id: dependency.id, owner: keys[0] }).some(r => r.from === traceKey({ type: 'activity', id: other.id, owner: keys[1] })));
  const activity = cell.resultsPlan.activities[0]; dependency.type = 'Activity'; dependency.linkedPriorityKey = keys[0]; dependency.linkedRecordId = activity.id;
  assert.doesNotThrow(() => getEvidenceConnections(buildTraceabilityIndex(data), { type: 'activity', id: activity.id, owner: keys[0] }));
});

test('traceability is pure and leaves all five output projections unchanged', () => {
  const data = demo(); const snapshot = JSON.stringify(data);
  const kinds = ['logframe', 'monitoring', 'workplan'];
  const before = kinds.map(kind => buildPlanningOutput(data, kind));
  const brief = generateMarkdownBrief(buildPlanningBriefModel(data));
  const executive = buildExecutiveBriefModel(data);
  const freeze = value => { if (value && typeof value === 'object') { Object.freeze(value); Object.values(value).forEach(freeze); } };
  freeze(data);
  buildTraceabilityIndex(data);
  assert.equal(JSON.stringify(data), snapshot);
  assert.deepEqual(kinds.map(kind => buildPlanningOutput(data, kind)), before);
  assert.equal(generateMarkdownBrief(buildPlanningBriefModel(data)), brief);
  assert.deepEqual(buildExecutiveBriefModel(data), executive);
});
