/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { getInitialProjectData } = require('../.test-dist/lib/storage.js');
const { buildCaranaDemoData } = require('../.test-dist/data/caranaDemo.js');
const { buildTraceabilityIndex, getEntity, traceKey } = require('../.test-dist/lib/traceability.js');
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
