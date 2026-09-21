/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const JSZip = require('jszip');
const { getInitialProjectData } = require('../.test-dist/lib/storage.js');
const { buildCaranaDemoData } = require('../.test-dist/data/caranaDemo.js');
const { validateAndNormalizeProjectData } = require('../.test-dist/lib/projectDataValidation.js');
const { getAnalysisSourceCandidates } = require('../.test-dist/lib/analysisSynthesis.js');
const xi = require('../.test-dist/lib/interdependencies.js');
const { buildPlanningBriefModel } = require('../.test-dist/lib/reportModel.js');
const { generateMarkdownBrief } = require('../.test-dist/lib/exportMarkdown.js');
const { createPlanningBriefDocx } = require('../.test-dist/lib/exportDocx.js');
const { buildPlanningOutput, planningOutputMarkdown } = require('../.test-dist/lib/planningOutputs.js');
const { evaluateCbdCell } = require('../.test-dist/lib/scoring.js');
const { calculateQualityWarnings } = require('../.test-dist/lib/warnings.js');
const demo = () => buildCaranaDemoData(getInitialProjectData());
const restore = data => validateAndNormalizeProjectData(JSON.parse(JSON.stringify(data)));
const relationship = (id, extra = {}) => ({ id: `test-${id}`, reference: `XI-${String(id).padStart(2, '0')}`, sourceFindingId: 'political', targetFindingId: 'security', relationship: 'May constrain implementation', effectOnCbd: 'Mixed', planningSignificance: 'High', cbdImplication: 'Confirm reporting lines first', evidenceIds: [], analyticalNote: 'Verify with counterparts', isKeyInsight: true, includeInMainBrief: false, ...extra });

test('legacy v0.7 workspace normalizes to empty XI without inferring relationships or changing its seven findings', () => {
  const data = demo(); delete data.interdependencies;
  const result = restore(data); assert.equal(result.error, null);
  assert.deepEqual(result.data.interdependencies, []);
  assert.deepEqual(result.data.pestels, data.pestels);
  assert.deepEqual(result.data.customCells, data.customCells);
});

test('blank workspace invents no interdependencies and optional empty analysis has no report sections', () => {
  const data = getInitialProjectData('blank');
  assert.deepEqual(data.interdependencies, []);
  assert.deepEqual(xi.buildInterdependencyReport(data), { register: [], main: [] });
  assert.doesNotMatch(generateMarkdownBrief(data), /Key Interdependencies|Interdependency Register/);
});

test('all directional relationship fields, stable IDs, classifications, evidence and selection flags survive JSON', () => {
  const data = demo();
  data.interdependencies = [relationship(9, { evidenceIds: ['carana-ev-political-1'], includeInMainBrief: true })];
  const result = restore(data); assert.equal(result.error, null);
  assert.deepEqual(result.data.interdependencies, data.interdependencies);
  assert.equal(xi.resolveInterdependencyFinding(result.data, 'political').key, 'political');
  assert.equal(xi.resolveInterdependencyFinding(result.data, 'security').key, 'security');
  assert.equal(xi.buildInterdependencyReport(result.data).register[0].direction, 'Political → Security');
});

test('same endpoint, blank relationship and malformed records reject atomically', () => {
  const data = demo(), original = JSON.stringify(data);
  const changes = [{ targetFindingId: 'political' }, { relationship: ' ' }, { effectOnCbd: 5 }, { planningSignificance: 'Very high' }, { isKeyInsight: 'yes' }, { isKeyInsight: false, includeInMainBrief: true }, { evidenceIds: [4] }, { sourceFindingId: 4 }, { reference: 'P01' }, { analyticalNote: null }];
  for (const change of changes) {
    const bad = { ...data, interdependencies: [relationship(1, change)] };
    assert.equal(restore(bad).data, null, JSON.stringify(change));
  }
  assert.equal(JSON.stringify(data), original);
  assert.equal(restore({ ...data, interdependencies: [relationship(1), relationship(1)] }).data, null);
});

test('optional implication, evidence and not-assessed classifications can be saved', () => {
  const data = demo(); data.interdependencies = [relationship(1, { cbdImplication: '', analyticalNote: '', effectOnCbd: 'Not assessed', planningSignificance: 'Not assessed', isKeyInsight: false })];
  assert.equal(restore(data).error, null);
});

test('multiple same-direction relationships and reverse direction remain distinct and map counts are not scores', () => {
  const data = demo(); data.interdependencies = [relationship(1), relationship(2), relationship(3, { sourceFindingId: 'security', targetFindingId: 'political' })];
  const map = xi.interdependencyMap(data);
  assert.equal(map.length, 42);
  assert.equal(map.find(p => p.from === 'political' && p.to === 'security').relationships.length, 2);
  assert.equal(map.find(p => p.from === 'security' && p.to === 'political').relationships.length, 1);
  assert.ok(map.every(p => p.from !== p.to && !('score' in p)));
  data.interdependencies[0].planningSignificance = 'Low';
  assert.equal(xi.interdependencyMap(data).find(p => p.from === 'political' && p.to === 'security').relationships.length, 2);
});

test('Stage 4 exposes valid XI first with stable key-first order and full context; no automatic SWOT classification', () => {
  const data = demo(); data.interdependencies = [relationship(1, { isKeyInsight: false }), relationship(2), relationship(3), relationship(4, { sourceFindingId: null })];
  const before = JSON.stringify(data.analysisSynthesis);
  const candidates = getAnalysisSourceCandidates(data).filter(c => c.reference.type === 'interdependency');
  assert.deepEqual(candidates.map(c => c.reference.id), ['test-2', 'test-3', 'test-1']);
  assert.equal(candidates[0].group, 'Interdependency Insights');
  for (const value of [data.pestels.political.finding, data.pestels.security.finding, 'CBD implication:', 'Planning significance:', 'May constrain implementation']) assert.ok(candidates[0].text.includes(value));
  assert.equal(JSON.stringify(data.analysisSynthesis), before);
  assert.ok(candidates.every(c => !('category' in c)));
});

test('cleared finding preserves XI written history and flags but excludes unresolved XI and cleans SWOT links', () => {
  const data = demo(); const item = data.interdependencies[0];
  data.analysisSynthesis.swotFindings[0].sourceReferences.push({ type: 'interdependency', id: item.id });
  const written = data.analysisSynthesis.swotFindings[0].finding;
  data.pestels.political.finding = '';
  const result = restore(data).data;
  assert.deepEqual(result.interdependencies[0], item);
  assert.equal(result.analysisSynthesis.swotFindings[0].finding, written);
  assert.ok(!result.analysisSynthesis.swotFindings[0].sourceReferences.some(r => r.id === item.id));
  assert.ok(!getAnalysisSourceCandidates(result).some(c => c.reference.id === item.id));
  assert.ok(!xi.interdependencyMap(result).some(p => p.relationships.some(r => r.id === item.id)));
  assert.ok(!xi.buildInterdependencyReport(result).main.some(r => r.id === item.id));
  assert.match(xi.buildInterdependencyReport(result).register[0].status, /Unresolved/);
});

test('unknown finding ID becomes repairable null; relinking does not silently restore removed SWOT links', () => {
  const data = demo(); data.interdependencies[0].sourceFindingId = 'deleted-finding';
  data.analysisSynthesis.swotFindings[0].sourceReferences = [{ type: 'interdependency', id: data.interdependencies[0].id }];
  const orphan = restore(data).data;
  assert.equal(orphan.interdependencies[0].sourceFindingId, null);
  orphan.interdependencies[0].sourceFindingId = 'political';
  const repaired = restore(orphan).data;
  assert.ok(xi.isValidInterdependency(repaired, repaired.interdependencies[0]));
  assert.deepEqual(repaired.analysisSynthesis.swotFindings[0].sourceReferences, []);
});

test('deleting XI removes only its source links, preserving SWOT text, TOWS and downstream CBD links', () => {
  const data = demo(); const item = data.interdependencies[0];
  data.analysisSynthesis.swotFindings[0].sourceReferences.push({ type: 'interdependency', id: item.id });
  const before = structuredClone(data);
  data.interdependencies = data.interdependencies.filter(r => r.id !== item.id);
  const normalized = xi.normalizeInterdependencies(data);
  assert.equal(normalized.analysisSynthesis.swotFindings[0].finding, before.analysisSynthesis.swotFindings[0].finding);
  assert.ok(!normalized.analysisSynthesis.swotFindings[0].sourceReferences.some(r => r.id === item.id));
  assert.deepEqual(normalized.analysisSynthesis.strategicOptions, before.analysisSynthesis.strategicOptions);
  assert.deepEqual(normalized.customCells, before.customCells);
});

test('source, target and relationship evidence remain distinct; dangling evidence links normalize safely', () => {
  const data = demo(); const item = data.interdependencies[0];
  let report = xi.buildInterdependencyReport(data).register[0];
  assert.ok(report.sourceEvidence.length); assert.ok(report.targetEvidence.length); assert.deepEqual(report.relationshipEvidence, []);
  item.evidenceIds = ['carana-ev-political-1', 'missing'];
  const cleaned = xi.normalizeInterdependencies(data);
  assert.deepEqual(cleaned.interdependencies[0].evidenceIds, ['carana-ev-political-1']);
  cleaned.pestels.political.evidenceNotes = [];
  assert.deepEqual(xi.normalizeInterdependencies(cleaned).interdependencies[0].evidenceIds, []);
  report = xi.buildInterdependencyReport(cleaned).register[0];
  assert.deepEqual(report.sourceEvidence, []); assert.ok(report.targetEvidence.length);
});

test('key does not imply main-brief inclusion; explicit selections retain recorded order regardless of significance', () => {
  const data = demo(); data.interdependencies = [relationship(1), relationship(2, { includeInMainBrief: true, planningSignificance: 'Low' }), relationship(3, { includeInMainBrief: true })];
  const report = buildPlanningBriefModel(data).interdependencyAnalysis;
  assert.deepEqual(report.main.map(r => r.reference), ['XI-02', 'XI-03']);
  assert.equal(report.register.length, 3);
  assert.ok(data.interdependencies[0].isKeyInsight);
});

test('five active selected insights accepted, sixth rejected without implicit truncation or cap bypass on repair', () => {
  const data = demo(); data.interdependencies = Array.from({ length: 5 }, (_, i) => relationship(i + 1, { includeInMainBrief: true }));
  assert.equal(restore(data).error, null);
  data.interdependencies.push(relationship(6, { includeInMainBrief: true }));
  assert.equal(restore(data).data, null); assert.match(xi.mainBriefSelectionError(data), /five/);
  assert.equal(xi.buildInterdependencyReport(data).main.length, 0);
  data.interdependencies[5].sourceFindingId = null;
  assert.equal(restore(data).error, null); assert.equal(xi.buildInterdependencyReport(data).main.length, 5);
  data.interdependencies[5].sourceFindingId = 'political';
  assert.match(xi.mainBriefSelectionError(data), /five/);
});

test('CARANA seeds exactly four resolvable cautious relationships and two explicit brief selections only in demo builder', () => {
  const data = demo(); assert.equal(data.interdependencies.length, 4);
  assert.ok(data.interdependencies.every(item => xi.isValidInterdependency(data, item) && item.evidenceIds.length === 0 && /Fictional/.test(item.analyticalNote)));
  assert.equal(data.interdependencies.filter(item => item.isKeyInsight).length, 2);
  assert.equal(xi.buildInterdependencyReport(data).main.length, 2);
  assert.equal(getInitialProjectData().interdependencies.length, 0);
});

test('XI changes leave Logframe, M&E, Workplan, scoring and all Stage 7 canonical records unchanged', () => {
  const data = demo(), without = { ...data, interdependencies: [] };
  for (const kind of ['logframe', 'monitoring', 'workplan']) {
    assert.deepEqual(buildPlanningOutput(data, kind), buildPlanningOutput(without, kind));
    assert.equal(planningOutputMarkdown(buildPlanningOutput(data, kind)), planningOutputMarkdown(buildPlanningOutput(without, kind)));
  }
  const before = JSON.stringify(data.customCells);
  const scores = Object.values(data.customCells).map(evaluateCbdCell);
  xi.normalizeInterdependencies(data); xi.buildInterdependencyReport(data); getAnalysisSourceCandidates(data);
  assert.equal(JSON.stringify(data.customCells), before);
  assert.deepEqual(Object.values(data.customCells).map(evaluateCbdCell), scores);
});

test('QC groups XI cautions into at most four messages without blocking or asserting causal proof', () => {
  const data = demo(); data.interdependencies = Array.from({ length: 12 }, (_, i) => relationship(i + 1, { cbdImplication: '', isKeyInsight: i % 2 === 0, sourceFindingId: i === 0 ? null : 'political' }));
  const warnings = calculateQualityWarnings(data).filter(w => w.id.startsWith('xi-'));
  assert.equal(warnings.length, 4);
  assert.match(warnings.find(w => w.id === 'xi-high-no-evidence').message, /Consider whether additional evidence or verification is needed/);
  assert.equal(restore(data).error, null);
});

test('Markdown and DOCX use shared explicit selections and readable register, including unresolved records', async () => {
  const data = demo(); data.interdependencies[1].sourceFindingId = null;
  data.interdependencies[1].relationship = 'A | B <script> \n *literal*';
  const model = buildPlanningBriefModel(data), md = generateMarkdownBrief(data);
  const main = md.split('### Key Interdependencies')[1].split('### Key SWOT Findings')[0];
  assert.match(main, /XI-01/); assert.match(main, /XI-04/); assert.doesNotMatch(main, /XI-02|XI-03/);
  assert.match(md, /Unresolved/); assert.match(md, /&lt;script&gt;/); assert.doesNotMatch(md, /<script>/);
  for (const label of ['A · Source finding evidence', 'B · Target finding evidence', 'C · Relationship evidence']) assert.ok(md.includes(label));
  const zip = await JSZip.loadAsync(await (await createPlanningBriefDocx(model)).arrayBuffer());
  const xml = await zip.file('word/document.xml').async('string');
  for (const item of model.interdependencyAnalysis.register) { assert.ok(xml.includes(item.reference)); assert.ok(xml.includes(item.direction)); }
  assert.match(xml, /PESTEL-S Interdependency Register/); assert.match(xml, /Unresolved/);
  assert.doesNotMatch(xml, /Interdependency Map/);
});

test('UI keeps optional collapsed workspace, native accessible controls, mobile map alternative and unchanged navigation', () => {
  const ui = fs.readFileSync('src/components/InterdependencyAnalysis.tsx', 'utf8');
  assert.match(ui, /aria-expanded=\{open\}/); assert.match(ui, /aria-controls="interdependency-workspace"/);
  assert.match(ui, /Counts of recorded finding-to-finding relationships, not scores/);
  assert.match(ui, /hidden md:table/); assert.match(ui, /md:hidden/);
  assert.match(ui, /includeInMainBrief: event.target.checked && draft.includeInMainBrief/);
  assert.match(ui, /mainBriefSelectionError/);
  const stage = fs.readFileSync('src/components/SituationalAnalysis.tsx', 'utf8');
  assert.match(stage, /setInterdependencyOpen\] = useState\(false\)/);
  assert.match(stage, /onClick=\{onNext\}/);
  assert.match(stage, /newInterdependency\(data.interdependencies, activeItem.id\)/);
});
