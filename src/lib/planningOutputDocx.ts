import { BorderStyle, Document, Footer, HeadingLevel, PageNumber, PageOrientation, Packer, Paragraph, Table, TableCell, TableLayoutType, TableRow, TextRun, VerticalAlign, WidthType } from 'docx';
import type { OutputTable, PlanningOutput } from './planningOutputs';
import { sanitizeReportFilename } from './reportModel';

const paragraph = (text: string) => new Paragraph({ children: text.split('\n').flatMap((line, index) => [new TextRun({ text: line, break: index ? 1 : undefined })]), spacing: { after: 110, line: 260 } });
const heading = (text: string, level: typeof HeadingLevel.HEADING_1 | typeof HeadingLevel.HEADING_2) => new Paragraph({ text, heading: level, keepNext: true, spacing: { before: 200, after: 120 } });
const contentWidth = 15420; // A4 landscape minus 12.5 mm margins.
function table(model: OutputTable): Table {
  const widths = model.widths.map(w => Math.floor(contentWidth * w / 100));
  widths[widths.length - 1] += contentWidth - widths.reduce((a, b) => a + b, 0);
  const border = { style: BorderStyle.SINGLE, color: 'D9D9D9', size: 4 };
  return new Table({ width: { size: contentWidth, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED,
    borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
    rows: [model.columns, ...model.rows].map((row, index) => new TableRow({ tableHeader: index === 0, cantSplit: true, children: row.map((text, col) => new TableCell({
      width: { size: widths[col], type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
      shading: { fill: index === 0 ? 'EAF1F8' : index % 2 ? 'FFFFFF' : 'F8FAFC' },
      margins: { top: 110, bottom: 110, left: 110, right: 110 },
      children: text.split('\n').map(line => new Paragraph({ children: [new TextRun({ text: line, bold: index === 0, size: 20, color: '000000' })], spacing: { after: 55, line: 240 } }))
    })) }))
  });
}
export async function createPlanningOutputDocx(model: PlanningOutput): Promise<Blob> {
  return Packer.toBlob(new Document({ title: model.title, description: model.status,
    styles: { default: { document: { run: { font: 'Arial', size: 22, color: '000000' } }, title: { run: { font: 'Arial', size: 36, color: '000000' } }, heading1: { run: { font: 'Arial', size: 28, color: '000000' } }, heading2: { run: { font: 'Arial', size: 24, color: '000000' } } } },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE }, margin: { top: 709, bottom: 709, left: 709, right: 709 } } },
      footers: { default: new Footer({ children: [new Paragraph({ children: [new TextRun({ text: `${model.status} · `, size: 16 }), new TextRun({ children: [PageNumber.CURRENT], size: 16 })] })] }) },
      children: [new Paragraph({ text: model.title, heading: HeadingLevel.TITLE }), paragraph(model.status), paragraph(model.context), ...model.metadata.map(paragraph), paragraph(`Application version: ${model.version}`), paragraph(model.notice),
        ...model.sections.flatMap(s => [heading(s.title, HeadingLevel.HEADING_1), ...s.notes.map(paragraph), ...s.tables.flatMap(t => [heading(t.title, HeadingLevel.HEADING_2), table(t)])])]
    }]
  }));
}
export async function downloadPlanningOutputDocx(model: PlanningOutput): Promise<void> {
  const blob = await createPlanningOutputDocx(model);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = sanitizeReportFilename(model.context, '', 'docx').replace('Planning-Brief', model.kind);
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
