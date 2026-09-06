/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');

const { getInitialProjectData } = require('../.test-dist/lib/storage.js');
const { validateAndNormalizeProjectData } = require('../.test-dist/lib/projectDataValidation.js');
const { buildCaranaDemoData } = require('../.test-dist/data/caranaDemo.js');
const { buildPlanningBriefModel } = require('../.test-dist/lib/reportModel.js');
const { generateMarkdownBrief } = require('../.test-dist/lib/exportMarkdown.js');
const { calculateQualityWarnings } = require('../.test-dist/lib/warnings.js');
const {
  getAnalysisSourceCandidates,
  isValidStrategicOptionCombination,
  removeStrategicOption,
  removeSwotFinding
} = require('../.test-dist/lib/analysisSynthesis.js');

function synthesisFixture() {
  const data = getInitialProjectData('blank');
  data.profile.mandateEnvironment = 'Advisory support mandate.';
  data.pestels.political.finding = 'Reform leadership is available.';
  data.pestels.political.evidenceNotes = [{ id: 'ev-1', sourceTitle: 'Workshop', sourceType: 'Workshop Input', dateVerified: '2026-01-01', confidenceLevel: 3, comment: 'Recorded input.' }];
  data.stakeholders = [{ id: 'sh-1', name: 'Police leadership', category: 'Host State', role: 'Leads reform.', authority: 'High', influence: 'High', position: 'Enabler', legitimacy: 'Medium', relevance: 'High', capacity: 'Medium', risk: '', entry: '', engagement: '', cbdAreas: [], evidenceNotes: [] }];
  data.analysisSynthesis = {
    swotFindings: [
      { id: 's1', reference: 'S01', category: 'Strength', finding: 'Leadership support.', cbdImplication: 'Use sponsorship.', sourceReferences: [{ type: 'stakeholder', id: 'sh-1' }], confidence: 3, verificationNote: '' },
      { id: 'w1', reference: 'W01', category: 'Weakness', finding: 'Weak review.', cbdImplication: 'Improve review.', sourceReferences: [{ type: 'evidence', id: 'ev-1' }], confidence: 3, verificationNote: '' },
      { id: 'o1', reference: 'O01', category: 'Opportunity', finding: 'Reform window.', cbdImplication: 'Pilot now.', sourceReferences: [{ type: 'pestels', id: 'political' }], confidence: 3, verificationNote: '' },
      { id: 't1', reference: 'T01', category: 'Threat', finding: 'Political reversal.', cbdImplication: 'Protect gains.', sourceReferences: [{ type: 'profile', id: 'mandateEnvironment' }], confidence: null, verificationNote: '' }
    ],
    strategicOptions: [
      { id: 'so1', reference: 'SO-01', type: 'SO', swotFindingIds: ['s1', 'o1'], option: 'Use sponsorship for pilot.', planningNote: '' },
      { id: 'st1', reference: 'ST-01', type: 'ST', swotFindingIds: ['s1', 't1'], option: 'Use leadership to protect gains.', planningNote: '' },
      { id: 'wo1', reference: 'WO-01', type: 'WO', swotFindingIds: ['w1', 'o1'], option: 'Use reform window to improve review.', planningNote: '' },
      { id: 'wt1', reference: 'WT-01', type: 'WT', swotFindingIds: ['w1', 't1'], option: 'Reduce review weakness and reversal exposure.', planningNote: '' }
    ]
  };
  data.customCells = { 'Accountability|Human Rights': { key: 'Accountability|Human Rights', why: '', individual: '', organizational: '', environment: '', indicators: [], drivers: [], stakeholders: [], risks: '', sequencing: '', confidence: 3, priorityScore: 3, result: '', engagement: '', capacityProblem: '', planningObjective: '', leadStakeholderId: null, supportingStakeholderIds: [], implementationPhase: null, milestoneTimeframe: '', evidenceNotes: [], strategicOptionIds: ['wo1'] } };
  return data;
}

test('SWOT findings, categories, sources and Strategic Options survive JSON normalization', () => {
  const result = validateAndNormalizeProjectData(JSON.parse(JSON.stringify(synthesisFixture())));
  assert.equal(result.error, null);
  assert.deepEqual(result.data.analysisSynthesis.swotFindings.map(item => item.category), ['Strength', 'Weakness', 'Opportunity', 'Threat']);
  assert.equal(result.data.analysisSynthesis.swotFindings[0].sourceReferences[0].id, 'sh-1');
  assert.deepEqual(result.data.customCells['Accountability|Human Rights'].strategicOptionIds, ['wo1']);
});

test('existing analysis candidates preserve PESTEL-S, evidence, stakeholder and profile IDs', () => {
  const keys = new Set(getAnalysisSourceCandidates(synthesisFixture()).map(item => `${item.reference.type}:${item.reference.id}`));
  assert.ok(keys.has('pestels:political'));
  assert.ok(keys.has('evidence:ev-1'));
  assert.ok(keys.has('stakeholder:sh-1'));
  assert.ok(keys.has('profile:mandateEnvironment'));
});

test('SO, ST, WO and WT enforce logical combination integrity without scoring', () => {
  const data = synthesisFixture();
  data.analysisSynthesis.strategicOptions.forEach(option => assert.equal(isValidStrategicOptionCombination(option, data.analysisSynthesis.swotFindings), true));
  assert.equal(isValidStrategicOptionCombination({ ...data.analysisSynthesis.strategicOptions[0], swotFindingIds: ['w1', 'o1'] }, data.analysisSynthesis.swotFindings), false);
});

test('deleting a SWOT finding removes its references and leaves the affected option reviewable', () => {
  const result = removeSwotFinding(synthesisFixture(), 'w1');
  assert.equal(result.analysisSynthesis.swotFindings.some(item => item.id === 'w1'), false);
  assert.deepEqual(result.analysisSynthesis.strategicOptions.find(item => item.id === 'wo1').swotFindingIds, ['o1']);
  assert.equal(isValidStrategicOptionCombination(result.analysisSynthesis.strategicOptions.find(item => item.id === 'wo1'), result.analysisSynthesis.swotFindings), false);
});

test('deleting a Strategic Option safely removes CBD links without altering the priority', () => {
  const result = removeStrategicOption(synthesisFixture(), 'wo1');
  assert.deepEqual(result.customCells['Accountability|Human Rights'].strategicOptionIds, []);
  assert.ok(result.customCells['Accountability|Human Rights']);
});

test('manual SWOT findings with no source remain valid', () => {
  const data = synthesisFixture();
  data.analysisSynthesis.swotFindings[0].sourceReferences = [];
  assert.equal(validateAndNormalizeProjectData(data).error, null);
});

test('quality control flags unsupported SWOT findings and incomplete TOWS bases', () => {
  const data = synthesisFixture();
  data.analysisSynthesis.swotFindings[0].sourceReferences = [];
  data.analysisSynthesis.strategicOptions[0].swotFindingIds = ['s1'];
  const warnings = calculateQualityWarnings(data);
  assert.ok(warnings.some(item => item.id === 'swot-no-source-s1' && item.category === 'synthesis'));
  assert.ok(warnings.some(item => item.id === 'option-invalid-basis-so1' && item.category === 'synthesis'));
});

test('CARANA synthesis and priority links resolve and appear in the report model', () => {
  const data = buildCaranaDemoData(getInitialProjectData('peacekeeping'));
  const findingIds = new Set(data.analysisSynthesis.swotFindings.map(item => item.id));
  const optionIds = new Set(data.analysisSynthesis.strategicOptions.map(item => item.id));
  assert.ok(data.analysisSynthesis.swotFindings.length >= 8);
  assert.ok(data.analysisSynthesis.strategicOptions.every(option => option.swotFindingIds.every(id => findingIds.has(id))));
  assert.ok(Object.values(data.customCells).every(cell => (cell.strategicOptionIds || []).every(id => optionIds.has(id))));
  const model = buildPlanningBriefModel(data);
  assert.ok(model.keySwotFindings.length > 0);
  assert.ok(model.strategicOptions.length > 0);
  assert.ok(model.priorities.some(priority => priority.strategicOptions.length > 0));
});

test('blank report data does not invent SWOT or Strategic Options', () => {
  const model = buildPlanningBriefModel(getInitialProjectData('blank'));
  assert.deepEqual(model.keySwotFindings, []);
  assert.deepEqual(model.strategicOptions, []);
  const markdown = generateMarkdownBrief(getInitialProjectData('blank'));
  assert.match(markdown, /No SWOT findings recorded/);
  assert.doesNotMatch(markdown, /\*\*S01/);
});

test('Markdown preserves SWOT, TOWS and CBD Strategic Synthesis Basis links', () => {
  const markdown = generateMarkdownBrief(synthesisFixture());
  assert.match(markdown, /## 4\. Analysis Synthesis/);
  assert.match(markdown, /\*\*W01 · Weakness\*\*/);
  assert.match(markdown, /WO-01/);
  assert.match(markdown, /Strategic Synthesis Basis\*\*: WO-01/);
});
