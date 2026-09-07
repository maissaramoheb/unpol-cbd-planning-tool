/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const JSZip = require('jszip');
const { getInitialProjectData } = require('../.test-dist/lib/storage.js');
const { buildCaranaDemoData } = require('../.test-dist/data/caranaDemo.js');
const { buildPlanningOutput, planningOutputMarkdown } = require('../.test-dist/lib/planningOutputs.js');
const { createPlanningOutputDocx } = require('../.test-dist/lib/planningOutputDocx.js');
const { buildPlanningBriefModel } = require('../.test-dist/lib/reportModel.js');
const { generateMarkdownBrief } = require('../.test-dist/lib/exportMarkdown.js');
const { validateAndNormalizeProjectData } = require('../.test-dist/lib/projectDataValidation.js');
const { evaluateCbdCell } = require('../.test-dist/lib/scoring.js');
const demo = () => buildCaranaDemoData(getInitialProjectData());
const tables = model => model.sections.flatMap(s => s.tables);
const text = model => JSON.stringify(model);

test('logframe uses canonical outcome and exact output links without a manufactured Goal or process misclassification', () => {
  const data = demo();
  for (const [key, cell] of Object.entries(data.customCells)) {
    const model = buildPlanningOutput(data, 'logframe', key);
    const rows = tables(model)[0].rows;
    assert.ok(rows[0][0].includes(cell.planningObjective));
    assert.ok(rows[1][0].includes(cell.resultsPlan.outputs[0].statement));
    assert.equal(rows[0][1], cell.indicators[0].statement);
    assert.equal(rows[1][1], cell.indicators[1].statement);
    assert.equal(rows.some(r => r[1] === cell.indicators[2].statement), false);
    assert.ok(tables(model)[1].rows.some(r => r[0] === 'Activity / Process'));
    assert.ok(tables(model)[1].rows.some(r => r[1] === 'Not assigned'));
    assert.doesNotMatch(text(model), /"Goal"|"Impact"/);
    assert.ok(text(model).includes(cell.resultsPlan.assumptions[0].statement));
    assert.match(text(model), /Priority-level assumptions \(not row-specific\)/);
  }
});

test('all configured priorities are included, without the narrative brief four-priority cap or a new score order', () => {
  const data = demo(); const cell = Object.values(data.customCells)[0];
  for (let n = 0; n < 3; n++) data.customCells[`Additional ${n}|Lens`] = { ...cell, key: `Additional ${n}|Lens` };
  assert.equal(buildPlanningOutput(data, 'logframe').sections.length, 12);
  assert.equal(tables(buildPlanningOutput(data, 'monitoring'))[0].rows.length, 24);
  assert.equal(tables(buildPlanningOutput(data, 'workplan'))[0].rows.length, 6);
});

test('M&E preserves qualitative measurement, frequency, actors, disaggregation and notes across paired bands', () => {
  const data = demo(); const [key, cell] = Object.entries(data.customCells)[0];
  cell.indicators[0].disaggregation = 'By station and gender where safe';
  const [measurement, arrangements] = tables(buildPlanningOutput(data, 'monitoring', key));
  assert.equal(measurement.rows.length, cell.indicators.length);
  cell.indicators.forEach((i, n) => {
    assert.equal(measurement.rows[n][3], i.baseline || 'Not recorded');
    assert.equal(measurement.rows[n][4], i.target || 'Not recorded');
    assert.equal(measurement.rows[n][5], i.verification || 'Not recorded');
    assert.equal(arrangements.rows[n][2], i.frequency);
    assert.equal(arrangements.rows[n][3], data.stakeholders.find(s => s.id === i.responsibleActorId)?.name || 'Not assigned');
    assert.ok(arrangements.rows[n][4].includes(i.note));
    assert.deepEqual(measurement.rows[n].slice(0, 2), arrangements.rows[n].slice(0, 2));
  });
  assert.match(arrangements.rows[0][4], /By station and gender where safe/);
  assert.match(measurement.rows[3][2], /Not assigned/);
});

test('invalid or missing result links are never guessed even before normalization', () => {
  const data = demo(); const cell = Object.values(data.customCells)[0];
  cell.indicators[0].linkedRecordId = 'other-priority';
  cell.indicators[1].linkedRecordId = 'deleted-output';
  const rows = tables(buildPlanningOutput(data, 'logframe', cell.key))[0].rows;
  assert.ok(rows.every(r => r[1] === 'No linked indicator recorded'));
  const other = tables(buildPlanningOutput(data, 'logframe', cell.key))[1].rows;
  assert.equal(other[0][1], 'Not assigned'); assert.equal(other[1][1], 'Not assigned');
});

test('Workplan preserves canonical activities, intervention text, accountable vs implementing actor, phase and timing levels', () => {
  const data = demo(); const cell = Object.values(data.customCells)[0];
  const activity = cell.resultsPlan.activities[0];
  activity.implementingActorId = 'sh-unpol-lead'; activity.timeframe = 'Two supervised sessions'; activity.milestone = 'Review completed';
  const model = buildPlanningOutput(data, 'workplan', cell.key);
  const [delivery, conditions] = tables(model);
  assert.equal(delivery.rows.length, 1);
  assert.equal(delivery.rows[0][1], cell.implementationPhase);
  assert.ok(delivery.rows[0][3].includes(cell.organizational));
  assert.ok(delivery.rows[0][3].includes(activity.statement));
  assert.equal(delivery.rows[0][4], data.stakeholders.find(s => s.id === activity.implementingActorId).name);
  assert.ok(text(model).includes(`Priority Lead / Accountable Actor: ${data.stakeholders.find(s => s.id === cell.leadStakeholderId).name}`));
  assert.ok(conditions.rows[0][1].includes(activity.timeframe));
  assert.ok(conditions.rows[0][1].includes(activity.milestone));
  assert.ok(conditions.rows[0][1].includes(cell.milestoneTimeframe));
  assert.ok(conditions.rows[0][2].includes('Required'));
  assert.ok(conditions.rows[0][3].includes('Unknown'));
  assert.ok(conditions.rows[0][4].includes(cell.risks));
  assert.ok(conditions.rows[0][4].includes(cell.resultsPlan.riskManagement.mitigation));
  assert.match(text(model), /Status: Consulted/);
  assert.ok(text(model).includes(cell.resultsPlan.sustainability[0].requirement));
});

test('Workplan resolves cross-priority dependency and records unlinked requirements without silently dropping them', () => {
  const data = demo(); const [first, second] = Object.values(data.customCells);
  first.resultsPlan.dependencies.push({ id: 'cross', type: 'Activity', statement: 'Cross dependency', status: 'Uncertain', linkedPriorityKey: second.key, linkedRecordId: second.resultsPlan.activities[0].id });
  first.resultsPlan.resources.push({ id: 'unlinked', category: 'Financial', availability: 'Not available', statement: 'Funding decision not recorded' });
  const model = buildPlanningOutput(data, 'workplan', first.key);
  assert.match(text(model), /Cross dependency/);
  assert.ok(text(model).includes(second.key.split('|').join(' × ')));
  assert.match(text(model), /Financial — Not available/);
});

test('blank and legacy projects remain honest; no inferred outputs, activities, measurement or actors', () => {
  for (const kind of ['logframe', 'monitoring', 'workplan']) {
    const model = buildPlanningOutput(getInitialProjectData('blank'), kind);
    assert.equal(tables(model).length, 0);
    assert.match(text(model), /No configured CBD priorities/);
  }
  const data = demo(); const cell = Object.values(data.customCells)[0];
  delete cell.resultsPlan; cell.indicators = ['Legacy indicator'];
  assert.match(text(buildPlanningOutput(data, 'logframe', cell.key)), /No outputs have been recorded/);
  assert.equal(tables(buildPlanningOutput(data, 'workplan', cell.key)).length, 0);
  assert.match(text(buildPlanningOutput(data, 'monitoring', cell.key)), /Not assigned/);
});

test('read-only output generation never mutates project data, scoring, JSON or existing narrative exports; edits regenerate immediately', () => {
  const data = demo(); const before = JSON.stringify(data);
  const brief = generateMarkdownBrief(data); const report = buildPlanningBriefModel(data);
  const scores = Object.values(data.customCells).map(evaluateCbdCell);
  for (const kind of ['logframe', 'monitoring', 'workplan']) buildPlanningOutput(data, kind);
  assert.equal(JSON.stringify(data), before);
  assert.equal(generateMarkdownBrief(data), brief);
  assert.deepEqual(buildPlanningBriefModel(data), report);
  assert.deepEqual(Object.values(data.customCells).map(evaluateCbdCell), scores);
  const restored = validateAndNormalizeProjectData(JSON.parse(before));
  assert.equal(restored.error, null); assert.deepEqual(restored.data, data);
  const cell = Object.values(data.customCells)[0]; cell.planningObjective = 'Changed canonical objective';
  assert.match(text(buildPlanningOutput(data, 'logframe')), /Changed canonical objective/);
  cell.resultsPlan.activities[0].statement = 'Changed canonical activity';
  assert.match(text(buildPlanningOutput(data, 'workplan')), /Changed canonical activity/);
  cell.indicators[0].target = 'Changed qualitative target';
  assert.match(text(buildPlanningOutput(data, 'monitoring')), /Changed qualitative target/);
});

test('Markdown preserves all table cells and safely escapes pipes, newlines, backslashes and raw HTML', () => {
  const data = demo(); const cell = Object.values(data.customCells)[0];
  cell.indicators[0].statement = 'A | B\n<script>test</script> \\ *text*';
  const model = buildPlanningOutput(data, 'monitoring'); const md = planningOutputMarkdown(model);
  assert.match(md, /A \\\| B<br>&lt;script&gt;/);
  assert.doesNotMatch(md, /<script>/);
  const rows = md.split('\n').filter(line => line.startsWith('| '));
  assert.equal(rows.length, tables(model).reduce((n, t) => n + t.rows.length + 2, 0));
  assert.match(md, /fictional UN peacekeeping training/);
});

test('all CARANA DOCX packages have editable tables, A4 landscape, repeating headers and complete model text', async () => {
  for (const kind of ['logframe', 'monitoring', 'workplan']) {
    const model = buildPlanningOutput(demo(), kind);
    const blob = await createPlanningOutputDocx(model);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    assert.ok(zip.file('[Content_Types].xml'));
    const xml = await zip.file('word/document.xml').async('string');
    assert.match(xml, /w:orient="landscape"/);
    assert.match(xml, /w:w="16838"/); assert.match(xml, /w:h="11906"/);
    assert.equal((xml.match(/<w:tblHeader\/>/g) || []).length, tables(model).length);
    assert.match(xml, /w:tblLayout w:type="fixed"/);
    assert.doesNotMatch(xml, /w:hRule="exact"/);
    assert.match(xml, /UNOFFICIAL/);
    const plain = xml.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
    for (const table of tables(model)) for (const row of table.rows) for (const value of row) {
      assert.ok(plain.includes(value.replace(/\n/g, '')), `${kind}: missing ${value}`);
    }
  }
});

test('preview and format actions share one model, remain outside stage inputs, and print tables can paginate', () => {
  const ui = fs.readFileSync('src/components/ExportBrief.tsx', 'utf8');
  assert.match(ui, /PlanningOutputPreview model=\{outputModel\}/);
  assert.match(ui, /downloadPlanningOutputDocx\(outputModel\)/);
  assert.match(ui, /planningOutputMarkdown\(outputModel\)/);
  assert.match(ui, /Edit in Results &amp; Implementation/);
  const preview = fs.readFileSync('src/components/PlanningOutputPreview.tsx', 'utf8');
  assert.doesNotMatch(preview, /<input|<textarea|contentEditable|localStorage/);
  assert.match(preview, /scope="col"/);
  const css = fs.readFileSync('src/app/globals.css', 'utf8');
  assert.match(css, /@page planning-matrix \{ size: A4 landscape/);
  assert.match(css, /\.planning-output thead \{ display: table-header-group/);
  assert.match(css, /\.planning-output table \{[^}]*break-inside: auto/);
});
