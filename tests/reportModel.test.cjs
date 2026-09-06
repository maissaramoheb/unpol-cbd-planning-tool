/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const JSZip = require('jszip');

const { buildPlanningBriefModel, sanitizeReportFilename } = require('../.test-dist/lib/reportModel.js');
const { createPlanningBriefDocx } = require('../.test-dist/lib/exportDocx.js');

function fixture() {
  const evidence = { id: 'note-1', sourceTitle: 'Workshop note', sourceType: 'Workshop Input', dateVerified: '2026-01-15', confidenceLevel: 3, comment: 'Exercise evidence.' };
  const priorityEvidence = { ...evidence, id: 'note-2', sourceTitle: 'Priority design note' };
  return {
    profile: { countryName: 'Carana (fictional)', missionName: 'CARANA Demonstration', region: 'Kantara', mandateEnvironment: 'Fictional mandate.', hostStatePolice: 'Carana Police', conflictContext: 'Fictional context.', planningPurpose: 'Demonstrate planning.', assessmentDate: '2026-08-11', analystName: 'Participant / Team', templateId: 'fictional-carana-demo', sourceCategory: 'Fictional Training Scenario', coverageScope: 'training', sourceUrl: null, sourceDate: null, profileLastReviewed: null },
    pestels: { security: { id: 'security', name: 'Security', definition: '', finding: 'Recorded security finding.', why: 'It affects implementation.', cbdAreas: [], dimensions: [], stakeholders: [], sequencing: 'Validate first.', rating: { impact: 5, urgency: 5, confidence: 3, relevance: 5 }, evidenceNotes: [evidence] } },
    stakeholders: [{ id: 'sh-1', name: 'Police leadership', category: 'Host State', role: 'Implementation authority.', authority: 'High', influence: 'High', position: 'Persuadable', legitimacy: 'Medium', relevance: 'High', capacity: 'Medium', risk: 'Ownership may weaken.', entry: 'Leadership dialogue.', engagement: 'Confirm sponsorship.', cbdAreas: [], evidenceNotes: [] }],
    customCells: { 'Accountability|Human Rights': { key: 'Accountability|Human Rights', why: 'Recorded rationale.', capacityProblem: 'Review workflow is inconsistent.', planningObjective: 'Test a consistent review workflow.', individual: 'Coach staff.', organizational: 'Test workflow.', environment: 'Clarify authority.', indicators: ['Workflow used'], drivers: ['security'], stakeholders: ['sh-1'], leadStakeholderId: 'sh-1', supportingStakeholderIds: [], implementationPhase: 'NOW', milestoneTimeframe: 'Review after 90 days', risks: 'Resistance.', sequencing: 'Pilot then review.', confidence: 3, priorityScore: 5, impact: 5, urgency: 5, feasibility: 4, riskRating: 2, stakeholderSupport: 4, mandateRelevance: 5, result: 'Improved review.', engagement: 'Engage leadership.', evidenceNotes: [priorityEvidence] } },
    priorityBrief: { topPriorities: ['Strengthen accountability workflow'], quickWins: ['Map the workflow'], sensitiveReforms: ['Clarify review authority'], longerTermReforms: ['Institutionalize the workflow'], risksAssumptions: ['Leadership support remains available'], sequencingRecommendation: 'Validate, pilot, review, then consider expansion.' },
    analysisSynthesis: { swotFindings: [], strategicOptions: [] },
    version: '0.3.2'
  };
}

async function documentXml(blob) {
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  return zip.file('word/document.xml').async('string');
}

test('professional report model preserves traceability and recorded judgement', () => {
  const model = buildPlanningBriefModel(fixture());
  assert.equal(model.status, 'UNOFFICIAL — DRAFT FOR REVIEW');
  assert.equal(model.priorities[0].title, 'Accountability × Human Rights');
  assert.deepEqual(model.priorities[0].evidenceIds, ['E02']);
  assert.equal(model.selectedPestels[0].id, 'security');
  assert.match(model.overallJudgement, /recorded planning judgement/i);
  assert.equal(model.priorities[0].leadStakeholder.name, 'Police leadership');
  assert.equal(model.priorities[0].cell.implementationPhase, 'NOW');
});

test('Word filename is safely normalized', () => {
  assert.equal(sanitizeReportFilename('Carana / Kantara', '2026-08-11', 'docx'), 'UNPOL-CBD-Planning-Brief-Carana-Kantara-2026-08-11.docx');
});

test('Word export is a genuine Office Open XML package', async () => {
  const blob = await createPlanningBriefDocx(buildPlanningBriefModel(fixture()));
  const bytes = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
  assert.deepEqual([...bytes], [0x50, 0x4b]);
  assert.ok(blob.size > 1000);
});

test('Word export does not create orphan fallback text or pin all priority rows to one page', async () => {
  const xml = await documentXml(await createPlanningBriefDocx(buildPlanningBriefModel(fixture())));
  assert.doesNotMatch(xml, />Not recorded</);
  assert.ok((xml.match(/<w:cantSplit/g) || []).length < 10);
  assert.doesNotMatch(xml, /<w:br[^>]*w:type="page"/);
});

test('professional output represents blank planning links accurately', () => {
  const data = fixture();
  data.customCells['Accountability|Human Rights'].capacityProblem = '';
  data.customCells['Accountability|Human Rights'].planningObjective = '';
  data.customCells['Accountability|Human Rights'].leadStakeholderId = null;
  data.customCells['Accountability|Human Rights'].implementationPhase = null;
  const model = buildPlanningBriefModel(data);
  assert.equal(model.priorities[0].cell.capacityProblem || 'Not yet defined', 'Not yet defined');
  assert.equal(model.priorities[0].leadStakeholder, null);
});

test('professional Word output includes SWOT, Strategic Options and the linked synthesis basis', async () => {
  const data = fixture();
  data.analysisSynthesis = {
    swotFindings: [
      { id: 'w1', reference: 'W01', category: 'Weakness', finding: 'Supervisory review is inconsistent.', cbdImplication: 'Strengthen review practice.', sourceReferences: [{ type: 'pestels', id: 'security' }], confidence: 3, verificationNote: '' },
      { id: 'o1', reference: 'O01', category: 'Opportunity', finding: 'Leadership supports modernization.', cbdImplication: 'Use the reform window.', sourceReferences: [{ type: 'stakeholder', id: 'sh-1' }], confidence: 3, verificationNote: '' }
    ],
    strategicOptions: [{ id: 'wo1', reference: 'WO-01', type: 'WO', swotFindingIds: ['w1', 'o1'], option: 'Use the reform window to strengthen supervisory review.', planningNote: '' }]
  };
  data.customCells['Accountability|Human Rights'].strategicOptionIds = ['wo1'];
  const model = buildPlanningBriefModel(data);
  assert.equal(model.priorities[0].strategicOptions[0].reference, 'WO-01');
  const xml = await documentXml(await createPlanningBriefDocx(model));
  assert.match(xml, /Analysis Synthesis/);
  assert.match(xml, /WO-01/);
  assert.match(xml, /STRATEGIC SYNTHESIS BASIS/);
});
