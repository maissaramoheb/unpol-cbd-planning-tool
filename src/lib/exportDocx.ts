import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType
} from 'docx';
import type { PlanningBriefModel, ReportPriority } from './reportModel';
import { ADVISORY_NOTE, sanitizeReportFilename } from './reportModel';

const BLUE = '244A73';
const LIGHT_BLUE = 'EAF1F8';
const SLATE = '475569';
const LIGHT_SLATE = 'F1F5F9';
const AMBER = 'FEF3C7';
const WHITE = 'FFFFFF';

const text = (value: string, options: { bold?: boolean; color?: string; size?: number; italics?: boolean } = {}) =>
  new TextRun({ text: value, ...options });

const paragraph = (value: string, options: { bold?: boolean; color?: string; bullet?: boolean; italics?: boolean; keepNext?: boolean } = {}) =>
  new Paragraph({
    children: [text(value, options)],
    bullet: options.bullet ? { level: 0 } : undefined,
    spacing: { after: 100, line: 260 },
    keepNext: options.keepNext
  });

const heading = (value: string, level: typeof HeadingLevel.HEADING_1 | typeof HeadingLevel.HEADING_2 | typeof HeadingLevel.HEADING_3 = HeadingLevel.HEADING_1) =>
  new Paragraph({ text: value, heading: level, spacing: { before: level === HeadingLevel.HEADING_1 ? 160 : 100, after: 100 } });

const sectionHeading = (value: string, startOnNewPage = false) => new Paragraph({
  text: value,
  heading: HeadingLevel.HEADING_1,
  pageBreakBefore: startOnNewPage,
  keepNext: true,
  spacing: { before: startOnNewPage ? 0 : 180, after: 100 }
});

const blankCell = () => new TableCell({
  shading: { fill: WHITE, type: ShadingType.CLEAR, color: 'auto' },
  margins: { top: 90, bottom: 90, left: 110, right: 110 },
  children: [new Paragraph({ text: '' })]
});

const headerCell = (value: string) => new TableCell({
  shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR, color: 'auto' },
  margins: { top: 90, bottom: 90, left: 110, right: 110 },
  children: [new Paragraph({ children: [text(value.toUpperCase(), { bold: true, color: BLUE, size: 16 })] })]
});

const cell = (label: string, value: string, shade = LIGHT_SLATE) => new TableCell({
  shading: { fill: shade, type: ShadingType.CLEAR, color: 'auto' },
  margins: { top: 90, bottom: 90, left: 110, right: 110 },
  children: [
    new Paragraph({ children: [text(label.toUpperCase(), { bold: true, color: SLATE, size: 16 })], spacing: { after: 45 } }),
    new Paragraph({ children: [text(value || 'Not recorded', { size: 19 })], spacing: { after: 0 } })
  ]
});

const infoTable = (items: Array<[string, string]>) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  layout: TableLayoutType.FIXED,
  borders: { top: { style: BorderStyle.SINGLE, color: 'D6DEE8', size: 2 }, bottom: { style: BorderStyle.SINGLE, color: 'D6DEE8', size: 2 }, left: { style: BorderStyle.SINGLE, color: 'D6DEE8', size: 2 }, right: { style: BorderStyle.SINGLE, color: 'D6DEE8', size: 2 }, insideHorizontal: { style: BorderStyle.SINGLE, color: 'D6DEE8', size: 2 }, insideVertical: { style: BorderStyle.SINGLE, color: 'D6DEE8', size: 2 } },
  rows: Array.from({ length: Math.ceil(items.length / 2) }, (_, rowIndex) => new TableRow({
    cantSplit: true,
    children: [0, 1].map(columnIndex => {
      const item = items[rowIndex * 2 + columnIndex];
      return item ? cell(item[0], item[1]) : blankCell();
    })
  }))
});

const bulletList = (items: string[], emptyText = 'None recorded') =>
  items.length ? items.map(item => paragraph(item, { bullet: true })) : [paragraph(emptyText, { italics: true, color: SLATE })];

function priorityTable(priority: ReportPriority): Table {
  const input = priority.assessment.inputs;
  const linkedStakeholders = priority.stakeholders.map(item => item.name).join('; ') || 'No linked stakeholders recorded';
  const responsibility = `Lead: ${priority.leadStakeholder?.name || 'Not assigned'}; Support: ${priority.supportingStakeholders.map(item => item.name).join('; ') || 'None assigned'}`;
  const phase = `${priority.cell.implementationPhase || 'Not assigned'}${priority.cell.milestoneTimeframe ? ` · ${priority.cell.milestoneTimeframe}` : ''}`;
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: { top: { style: BorderStyle.SINGLE, color: BLUE, size: 8 }, bottom: { style: BorderStyle.SINGLE, color: 'CBD5E1', size: 2 }, left: { style: BorderStyle.SINGLE, color: 'CBD5E1', size: 2 }, right: { style: BorderStyle.SINGLE, color: 'CBD5E1', size: 2 }, insideHorizontal: { style: BorderStyle.SINGLE, color: 'E2E8F0', size: 2 }, insideVertical: { style: BorderStyle.SINGLE, color: 'E2E8F0', size: 2 } },
    rows: [
      new TableRow({ cantSplit: true, children: [new TableCell({ columnSpan: 2, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR, color: 'auto' }, margins: { top: 120, bottom: 120, left: 140, right: 140 }, children: [new Paragraph({ children: [text(`PRIORITY ${priority.number} — ${priority.title}`, { bold: true, color: BLUE, size: 24 })], keepNext: true }), paragraph(`${priority.row} × ${priority.column}`, { bold: true, color: SLATE })] })] }),
      new TableRow({ children: [cell('Capacity problem / gap', priority.cell.capacityProblem || 'Not yet defined', WHITE), cell('Planning objective', priority.cell.planningObjective || 'Not yet defined', WHITE)] }),
      new TableRow({ children: [cell('Planning need / rationale', priority.cell.why || 'Not recorded', WHITE), cell('Evidence basis', priority.evidenceIds.join(' · ') || 'No linked evidence recorded', WHITE)] }),
      new TableRow({ children: [cell('Strategic Synthesis Basis', priority.strategicOptions.map(option => option.reference).join(' · ') || 'No Strategic Option linked', WHITE), cell('Evidence confidence', `${input.confidenceLevel}/5`, WHITE)] }),
      new TableRow({ children: [cell('Individual', priority.cell.individual || 'Not recorded'), cell('Organizational', priority.cell.organizational || 'Not recorded')] }),
      new TableRow({ children: [cell('Enabling environment', priority.cell.environment || 'Not recorded', WHITE), cell('Key stakeholders', linkedStakeholders, WHITE)] }),
      new TableRow({ children: [cell('Responsibility', responsibility), cell('Implementation phase / milestone', phase)] }),
      new TableRow({ children: [cell('Implementation conditions', `Feasibility ${input.feasibility}/5 · Stakeholder support ${input.stakeholderSupport}/5 · Implementation risk ${input.risk}/5 · Indicative priority ${priority.assessment.score.toFixed(1)}/5`, AMBER), cell('Evidence confidence', `${input.confidenceLevel}/5`, AMBER)] }),
      new TableRow({ children: [cell('Indicators', priority.cell.indicators.join('; ') || 'None recorded', WHITE), cell('Risks', priority.cell.risks || 'Not recorded', WHITE)] }),
      new TableRow({ cantSplit: true, children: [new TableCell({ columnSpan: 2, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [paragraph(`Recommended sequencing: ${priority.cell.sequencing || 'Not recorded'}`, { bold: true, color: BLUE })] })] })
    ]
  });
}

function stakeholderTable(model: PlanningBriefModel): Table | Paragraph {
  const stakeholders = model.data.stakeholders;
  if (!stakeholders.length) return paragraph('No stakeholders recorded.', { italics: true, color: SLATE });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: { top: { style: BorderStyle.SINGLE, color: 'CBD5E1', size: 2 }, bottom: { style: BorderStyle.SINGLE, color: 'CBD5E1', size: 2 }, left: { style: BorderStyle.SINGLE, color: 'CBD5E1', size: 2 }, right: { style: BorderStyle.SINGLE, color: 'CBD5E1', size: 2 }, insideHorizontal: { style: BorderStyle.SINGLE, color: 'E2E8F0', size: 2 }, insideVertical: { style: BorderStyle.SINGLE, color: 'E2E8F0', size: 2 } },
    rows: [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [headerCell('Actor'), headerCell('Category / role / engagement')]
      }),
      ...stakeholders.map(item => new TableRow({
        cantSplit: true,
        children: [
          cell('Actor', item.name, WHITE),
          cell('Planning details', `${item.category} · Influence ${item.influence} · Position ${item.position} · Relevance ${item.relevance}\n${item.engagement || 'No engagement approach recorded'}`, WHITE)
        ]
      }))
    ]
  });
}

const evidenceEntry = (item: PlanningBriefModel['evidence'][number]) => [
  heading(`${item.id} · ${item.title}`, HeadingLevel.HEADING_3),
  paragraph(`${item.type} · Confidence ${item.confidence}/5 · Reviewed ${item.date || 'not recorded'} · Linked to: ${item.attachedTo}`, { color: SLATE, keepNext: true }),
  paragraph(item.comment || 'No note recorded.', { italics: true })
];

export async function createPlanningBriefDocx(model: PlanningBriefModel): Promise<Blob> {
  const { data } = model;
  const p = data.profile;
  const children = [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [text('UNPOL CBD PLANNING BRIEF', { bold: true, color: BLUE, size: 36 })], spacing: { after: 80 } }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [text(model.status, { bold: true, color: '92400E', size: 20 })], shading: { fill: AMBER, type: ShadingType.CLEAR, color: 'auto' }, spacing: { after: 240 } }),
    infoTable([
      ['Country / Context', p.countryName], ['Mission / Institution', p.missionName],
      ['Area of Operations', p.region], ['Planning Purpose', p.planningPurpose],
      ['Prepared By', p.analystName || 'Participant / Team'], ['Assessment Date', p.assessmentDate],
      ['Context Source', model.contextSource], ['Source Review / Verification', p.profileLastReviewed || 'Not independently verified'],
      ['Application Version', model.version], ['Document Status', model.status]
    ]),
    heading('Executive Planning Summary'),
    heading('Primary CBD Priorities', HeadingLevel.HEADING_2),
    ...bulletList(data.priorityBrief.topPriorities.filter(Boolean).length ? data.priorityBrief.topPriorities.filter(Boolean) : model.priorities.map(item => item.title), 'No priorities recorded.'),
    heading('Immediate Planning Recommendation', HeadingLevel.HEADING_2),
    paragraph(data.priorityBrief.sequencingRecommendation || 'No sequencing recommendation recorded.'),
    heading('Critical Constraints / Risks', HeadingLevel.HEADING_2),
    ...bulletList(data.priorityBrief.risksAssumptions.slice(0, 4), 'No constraints or assumptions recorded.'),
    heading('Priority Evidence Gaps', HeadingLevel.HEADING_2),
    ...bulletList(model.evidenceGaps, 'No priority evidence gap was derived from the current recorded fields.'),
    heading('Overall Planning Judgement', HeadingLevel.HEADING_2),
    paragraph(model.overallJudgement),

    sectionHeading('2 · Context & Key Evidence'),
    heading('Planning Context', HeadingLevel.HEADING_2),
    paragraph(`Mandate environment: ${p.mandateEnvironment || 'Not recorded'}`),
    paragraph(`Police institution: ${p.hostStatePolice || 'Not recorded'}`),
    paragraph(`Conflict context: ${p.conflictContext || 'Not recorded'}`),
    heading('Decision-Relevant PESTEL-S Findings', HeadingLevel.HEADING_2),
    ...model.selectedPestels.flatMap(item => [
      heading(item.name, HeadingLevel.HEADING_3),
      paragraph(item.finding),
      paragraph(`Impact ${item.rating.impact}/5 · Urgency ${item.rating.urgency}/5 · Confidence ${item.rating.confidence}/5`, { bold: true, color: BLUE }),
      paragraph(`Why it matters: ${item.why}`),
      paragraph(`Evidence: ${item.evidenceNotes?.length ? item.evidenceNotes.map(note => model.evidence.find(evidence => evidence.noteId === note.id)?.id).filter(Boolean).join(' · ') : 'No evidence reference linked'}`, { color: SLATE })
    ]),

    sectionHeading('3 · Stakeholder Landscape'),
    heading('Critical Institutional Actors', HeadingLevel.HEADING_2),
    ...bulletList(model.stakeholderAnalysis.insights.leadershipLevel.slice(0, 6).map(item => `${item.name} — ${item.role}`), 'No high-influence actors recorded.'),
    heading('High-Influence Allies', HeadingLevel.HEADING_2),
    ...bulletList(model.stakeholderAnalysis.engagementQuadrants.find(item => item.id === 'high-influence-allies')?.stakeholders.map(item => item.name) || []),
    heading('Resistance / Sensitive Actors', HeadingLevel.HEADING_2),
    ...bulletList(model.stakeholderAnalysis.engagementQuadrants.find(item => item.id === 'high-influence-resistance')?.stakeholders.map(item => `${item.name} — ${item.risk}`) || []),
    heading('Legitimacy / Accountability Voices', HeadingLevel.HEADING_2),
    ...bulletList(model.stakeholderAnalysis.insights.legitimacyConsultation.slice(0, 6).map(item => item.name)),
    heading('Key Engagement Implications', HeadingLevel.HEADING_2),
    ...bulletList(model.stakeholderAnalysis.insights.technicalWorkingGroups.slice(0, 6).map(item => `${item.name}: ${item.engagement}`)),

    sectionHeading('Analysis Synthesis'),
    paragraph('This SWOT/TOWS synthesis records professional judgement. It supports planning choices and does not determine the CBD response.', { italics: true, color: SLATE }),
    heading('Key SWOT Findings', HeadingLevel.HEADING_2),
    ...bulletList(model.keySwotFindings.map(item => `${item.reference} · ${item.category}: ${item.finding}${item.cbdImplication ? ` — CBD implication: ${item.cbdImplication}` : ''}`), 'No SWOT findings recorded.'),
    heading('Strategic Options', HeadingLevel.HEADING_2),
    ...(model.strategicOptions.length ? [new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
      rows: [
        new TableRow({ tableHeader: true, cantSplit: true, children: [headerCell('Ref / combination'), headerCell('Strategic implication')] }),
        ...model.strategicOptions.map(option => new TableRow({ cantSplit: true, children: [cell('Basis', `${option.reference} · ${option.swotFindingIds.map(id => data.analysisSynthesis.swotFindings.find(item => item.id === id)?.reference).filter(Boolean).join(' + ')}`, WHITE), cell('Option', option.option, WHITE)] }))
      ]
    })] : [paragraph('No Strategic Options recorded.', { italics: true, color: SLATE })]),

    sectionHeading('4 · CBD Priorities'),
    ...(model.priorities.length ? model.priorities.slice(0, 2).map(priorityTable) : [paragraph('No customized CBD priorities recorded.', { italics: true, color: SLATE })]),
    sectionHeading('5 · CBD Priorities (continued)', false),
    ...(model.priorities.length > 2 ? model.priorities.slice(2, 4).map(priorityTable) : [paragraph('No additional priorities recorded.', { italics: true, color: SLATE })]),

    sectionHeading('6 · Sequencing & Implementation Pathway'),
    heading('NOW · Immediate / Enabling Actions', HeadingLevel.HEADING_2),
    ...bulletList(data.priorityBrief.quickWins),
    heading('NEXT · Follow-On / More Demanding Reforms', HeadingLevel.HEADING_2),
    ...bulletList(data.priorityBrief.sensitiveReforms),
    heading('LATER · Longer-Term / Structural Changes', HeadingLevel.HEADING_2),
    ...bulletList(data.priorityBrief.longerTermReforms),
    heading('Recorded Sequencing Recommendation', HeadingLevel.HEADING_2),
    paragraph(data.priorityBrief.sequencingRecommendation || 'No sequencing recommendation recorded.', { bold: true, color: BLUE }),

    sectionHeading('7 · Monitoring, Evidence Gaps & Planning Controls'),
    heading('Monitoring Indicators', HeadingLevel.HEADING_2),
    ...bulletList(model.priorities.flatMap(item => item.cell.indicators.map(indicator => `${item.number}: ${indicator}`)).slice(0, 12)),
    heading('Critical Evidence Gaps', HeadingLevel.HEADING_2), ...bulletList(model.evidenceGaps),
    heading('Planning Assumptions Requiring Validation', HeadingLevel.HEADING_2), ...bulletList(data.priorityBrief.risksAssumptions),
    heading('Quality-Control Flags', HeadingLevel.HEADING_2), ...bulletList(model.warnings.slice(0, 5).map(item => item.message), 'No active quality-control warnings.'),
    heading('Limitations / Advisory Note', HeadingLevel.HEADING_2), paragraph(ADVISORY_NOTE),

    sectionHeading('Annex A · Full PESTEL-S Analysis', true),
    ...Object.values(data.pestels).flatMap(item => [
      heading(item.name, HeadingLevel.HEADING_2),
      paragraph(item.finding || 'No finding recorded.'),
      paragraph(`Why: ${item.why || 'Not recorded'}`),
      paragraph(`Sequencing: ${item.sequencing || 'Not recorded'}`)
    ]),
    sectionHeading('Annex B · Stakeholder Register', false),
    stakeholderTable(model),
    sectionHeading('Annex C · Evidence & Source Register', false),
    ...(model.evidence.length ? model.evidence.flatMap(evidenceEntry) : [paragraph('No evidence sources recorded.', { italics: true, color: SLATE })]),
    sectionHeading('Annex D · Full Quality-Control Register', false), ...bulletList(model.warnings.map(item => item.message), 'No active quality-control warnings.')
  ];

  const document = new Document({
    creator: 'UNPOL CBD Planning Prototype',
    title: 'UNPOL CBD Planning Brief',
    description: model.status,
    evenAndOddHeaderAndFooters: true,
    styles: {
      default: { document: { run: { font: 'Arial', size: 20, color: '1E293B' }, paragraph: { spacing: { line: 260 } } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Arial', size: 28, bold: true, color: BLUE }, paragraph: { spacing: { before: 180, after: 100 } } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Arial', size: 22, bold: true, color: BLUE }, paragraph: { spacing: { before: 130, after: 70 } } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Arial', size: 20, bold: true, color: SLATE }, paragraph: { spacing: { before: 100, after: 50 } } }
      ]
    },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, right: 1134, bottom: 1134, left: 1134, header: 600, footer: 600 } } },
      headers: {
        default: new Header({ children: [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, color: 'CBD5E1', size: 4 } }, children: [text('UNPOL CBD PLANNING BRIEF', { bold: true, color: BLUE, size: 16 }), text(`   |   ${model.status}`, { color: SLATE, size: 16 })] })] }),
        even: new Header({ children: [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, color: 'CBD5E1', size: 4 } }, children: [text('UNPOL CBD PLANNING BRIEF', { bold: true, color: BLUE, size: 16 }), text(`   |   ${model.status}`, { color: SLATE, size: 16 })] })] })
      },
      footers: {
        default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text(`${p.countryName || 'Planning context'}   ·   Page `, { color: SLATE, size: 16 }), new TextRun({ children: [PageNumber.CURRENT], color: SLATE, size: 16 })] })] }),
        even: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text(`${p.countryName || 'Planning context'}   ·   Page `, { color: SLATE, size: 16 }), new TextRun({ children: [PageNumber.CURRENT], color: SLATE, size: 16 })] })] })
      },
      children
    }]
  });
  return Packer.toBlob(document);
}

export async function downloadPlanningBriefDocx(model: PlanningBriefModel): Promise<void> {
  const blob = await createPlanningBriefDocx(model);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = sanitizeReportFilename(model.data.profile.countryName, model.data.profile.assessmentDate, 'docx');
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
