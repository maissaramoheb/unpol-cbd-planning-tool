/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const JSZip = require('jszip');
const { getInitialProjectData } = require('../.test-dist/lib/storage.js');
const { buildCaranaDemoData } = require('../.test-dist/data/caranaDemo.js');
const { validateAndNormalizeProjectData } = require('../.test-dist/lib/projectDataValidation.js');
const ex = require('../.test-dist/lib/executiveBrief.js');
const { createExecutiveBriefDocx } = require('../.test-dist/lib/executiveBriefDocx.js');
const { buildPlanningBriefModel } = require('../.test-dist/lib/reportModel.js');
const { generateMarkdownBrief } = require('../.test-dist/lib/exportMarkdown.js');
const { buildPlanningOutput } = require('../.test-dist/lib/planningOutputs.js');
const { buildInterdependencyReport } = require('../.test-dist/lib/interdependencies.js');
const { evaluateCbdCell } = require('../.test-dist/lib/scoring.js');
const demo = () => buildCaranaDemoData(getInitialProjectData());
const restore = d => validateAndNormalizeProjectData(JSON.parse(JSON.stringify(d)));
const primary = d => d.customCells[d.executiveBriefSelection.primaryPriorityKey];

test('legacy selection defaults empty without inferring from CARANA, NOW, scores or key insights', () => {
  const d = demo(); delete d.executiveBriefSelection;
  assert.deepEqual(restore(d).data.executiveBriefSelection, ex.emptyExecutiveSelection());
  const m = ex.buildExecutiveBriefModel(d); assert.equal(m.primaryPriorityKey, null); assert.deepEqual(m.immediateNextSteps, []);
});
test('primary and complete reference-only selection survives JSON round trip', () => {
  const d = demo(); assert.deepEqual(restore(d).data.executiveBriefSelection, d.executiveBriefSelection);
});
for (const group of ['capacityGapKeys', 'evidenceIds', 'interventions', 'criticalItems', 'immediateNextSteps']) test(`${group} rejects a fourth selection without mutating the project`, () => {
  const d = demo(), before = JSON.stringify(d);
  const s = ex.emptyExecutiveSelection();
  s[group] = Array.from({length: 4}, (_, i) => group === 'capacityGapKeys' || group === 'evidenceIds' ? `key${i}` : { priorityKey: `key${i}`, kind: group === 'interventions' ? 'individual' : group === 'criticalItems' ? 'risk' : 'priorityMilestone' });
  assert.equal(restore({...d, executiveBriefSelection:s}).data, null); assert.equal(JSON.stringify(d), before);
});
test('rejects duplicate refs, copied text, wrong types and multiple primary problems', () => {
  const d = demo();
  for (const s of [ {...d.executiveBriefSelection, primaryPriorityKey: ['a','b']}, {...d.executiveBriefSelection, evidenceIds:['a','a']}, {...d.executiveBriefSelection, narrative:'copied'}, {...d.executiveBriefSelection, interventions:[{priorityKey:'a',kind:'individual',text:'copied'}]}, {...d.executiveBriefSelection, criticalItems:[{priorityKey:'a',kind:'assumption'}]} ]) assert.equal(restore({...d,executiveBriefSelection:s}).data,null);
});
test('capacity problem and objective resolve live canonical text', () => {
  const d = demo(); primary(d).capacityProblem='Changed canonical problem'; primary(d).planningObjective='Changed objective';
  const m = ex.buildExecutiveBriefModel(d); assert.equal(m.primaryProblem, primary(d).capacityProblem); assert.equal(m.expectedResult, primary(d).planningObjective);
  primary(d).planningObjective=''; assert.equal(ex.buildExecutiveBriefModel(d).expectedResult,'Not yet recorded.');
});
test('evidence resolves canonical notes including valid unrelated project evidence', () => {
  const d=demo(); d.executiveBriefSelection.evidenceIds=['carana-ev-political-1'];
  const m=ex.buildExecutiveBriefModel(d); assert.equal(m.evidence[0].text,d.pestels.political.evidenceNotes[0].comment);
});
test('ownership resolves actors and preserves Consulted without claiming approval', () => {
  const d=demo(), m=ex.buildExecutiveBriefModel(d); assert.equal(m.ownership.status,'Consulted');
  assert.equal(m.ownership.lead,d.stakeholders.find(s=>s.id===primary(d).leadStakeholderId).name);
  assert.equal(m.ownership.counterpart,d.stakeholders.find(s=>s.id===primary(d).resultsPlan.ownership.counterpartActorId).name);
});
test('intervention references resolve exact canonical text and analyst-selected order', () => {
  const d=demo(); d.executiveBriefSelection.interventions.reverse();
  const m=ex.buildExecutiveBriefModel(d); assert.equal(m.interventions[0].text,primary(d).organizational); assert.equal(m.interventions[1].text,primary(d).individual);
});
test('risk with mitigation and assumption retain distinct types', () => {
  const d=demo(), m=ex.buildExecutiveBriefModel(d); assert.equal(m.criticalItems[0].label,'Risk'); assert.ok(m.criticalItems[0].text.includes(primary(d).resultsPlan.riskManagement.mitigation));
  assert.equal(m.criticalItems[1].label,'Assumption'); assert.equal(m.criticalItems[1].text,primary(d).resultsPlan.assumptions[0].statement);
});
test('next steps use canonical activity, milestone and unresolved dependency records only', () => {
  const d=demo(), c=primary(d), key=c.key;
  c.resultsPlan.activities[0].milestone='Recorded activity milestone';
  d.executiveBriefSelection.immediateNextSteps=[{priorityKey:key,kind:'activityMilestone',id:c.resultsPlan.activities[0].id},{priorityKey:key,kind:'priorityMilestone'},{priorityKey:key,kind:'dependency',id:c.resultsPlan.dependencies[0].id}];
  const m=ex.buildExecutiveBriefModel(d); assert.equal(m.immediateNextSteps[0].text,'Recorded activity milestone'); assert.equal(m.immediateNextSteps[1].text,c.milestoneTimeframe);
  c.resultsPlan.dependencies[0].status='Met'; assert.equal(ex.normalizeExecutiveReferences(d).executiveBriefSelection.immediateNextSteps.length,2);
});
test('deleted evidence activity assumption and reset priority clear references without retargeting', () => {
  const d=demo(), c=primary(d), before=c.capacityProblem;
  for (const p of Object.values(d.pestels)) p.evidenceNotes=[];
  for (const p of Object.values(d.customCells)) p.evidenceNotes=[];
  c.resultsPlan.activities=[]; c.resultsPlan.assumptions=[];
  const n=ex.normalizeExecutiveReferences(d); assert.equal(n.executiveBriefSelection.evidenceIds.length,0); assert.equal(n.executiveBriefSelection.criticalItems.length,1); assert.equal(n.executiveBriefSelection.immediateNextSteps.length,1); assert.equal(c.capacityProblem,before);
  c.capacityProblem=''; const reset=ex.normalizeExecutiveReferences(d).executiveBriefSelection; assert.equal(reset.primaryPriorityKey,null); assert.deepEqual(reset.capacityGapKeys,[]); assert.deepEqual(reset.interventions,[]);
});
test('CARANA management projection has curated explicit selections without new facts', () => {
  const d=demo(), m=ex.buildExecutiveBriefModel(d); assert.equal(m.sections.length,8); assert.equal(m.evidence.length,2); assert.equal(m.interventions.length,2); assert.equal(m.criticalItems.length,2); assert.equal(m.immediateNextSteps.length,2);
  assert.equal(m.primaryProblem,primary(d).capacityProblem); assert.equal(m.expectedResult,primary(d).planningObjective);
});
test('blank workspace provides professional empty states and no automatic next steps', () => {
  const m=ex.buildExecutiveBriefModel(getInitialProjectData('blank')); assert.match(m.primaryProblem,/not selected/); assert.equal(m.ownership.counterpart,'Not recorded.'); assert.equal(m.expectedResult,'Not yet recorded.'); assert.match(m.sections[7].lines[0],/No immediate/);
});
test('page-fit warning is non-blocking and does not truncate substantive content', () => {
  const d=demo(); primary(d).capacityProblem='Long canonical text. '.repeat(500);
  const m=ex.buildExecutiveBriefModel(d); assert.equal(m.pageFit.exceedsPage,true); assert.equal(m.primaryProblem,primary(d).capacityProblem); assert.ok(m.cautions.includes(ex.EXECUTIVE_FIT_MESSAGE));
});
for (const kind of ['brief','logframe','monitoring','workplan','interdependencies','scoring']) test(`${kind} output unchanged by executive selection`, () => {
  const d=demo(), other={...d,executiveBriefSelection:ex.emptyExecutiveSelection()};
  const project=x=>kind==='brief'?{...buildPlanningBriefModel(x),data:undefined,markdown:generateMarkdownBrief(x)}:kind==='interdependencies'?buildInterdependencyReport(x):kind==='scoring'?Object.values(x.customCells).map(evaluateCbdCell):buildPlanningOutput(x,kind);
  assert.deepEqual(project(d),project(other));
});
test('Markdown retains the shared model sections content and no technical matrix', () => {
  const m=ex.buildExecutiveBriefModel(demo()), md=ex.executiveBriefMarkdown(m); for (const s of m.sections) assert.ok(md.includes(`## ${s.title}`)); assert.ok(md.includes(m.primaryProblem)); assert.doesNotMatch(md,/Cross-Impact Map/);
});
test('editable DOCX is A4 portrait and contains all selected canonical text', async () => {
  const m=ex.buildExecutiveBriefModel(demo()), blob=await createExecutiveBriefDocx(m), zip=await JSZip.loadAsync(await blob.arrayBuffer()); const xml=await zip.file('word/document.xml').async('string');
  assert.match(xml,/w:w="11906"/); assert.match(xml,/w:h="16838"/); assert.doesNotMatch(xml,/w:orient="landscape"/); for(const s of m.sections) assert.ok(xml.includes(s.title.replaceAll('&','&amp;'))); assert.ok(xml.includes(m.primaryProblem));
});
test('screen print and exports share the model with scoped portrait CSS and no editable preview', () => {
  const ui=fs.readFileSync('src/components/ExecutiveBrief.tsx','utf8'), css=fs.readFileSync('src/app/globals.css','utf8'), integration=fs.readFileSync('src/components/ExportBrief.tsx','utf8');
  assert.match(ui,/model.sections.map/); assert.match(ui,/read-only preview/); assert.match(css,/@page executive-cbd \{ size: A4 portrait/); assert.match(integration,/downloadExecutiveBriefDocx\(executiveModel\)/); assert.match(integration,/executiveBriefMarkdown\(executiveModel\)/);
});
test('primary can be explicitly cleared without selecting a replacement', () => {
  const d=demo(); d.executiveBriefSelection.primaryPriorityKey=null; const m=ex.buildExecutiveBriefModel(restore(d).data); assert.equal(m.primaryPriorityKey,null); assert.equal(m.expectedResult,'Not yet recorded.');
});
test('activity text updates through its reference without storing another copy', () => {
  const d=demo(); primary(d).resultsPlan.activities[0].statement='Canonical activity changed'; const m=ex.buildExecutiveBriefModel(d); assert.match(m.immediateNextSteps[0].text,/Canonical activity changed/); assert.doesNotMatch(JSON.stringify(d.executiveBriefSelection),/Canonical activity changed/);
});
test('projection and normalization never rewrite canonical planning data', () => {
  const d=demo(), before=JSON.stringify(d); ex.buildExecutiveBriefModel(d); ex.normalizeExecutiveReferences(d); assert.equal(JSON.stringify(d),before);
});
