import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import type { ExecutiveBriefModel } from './executiveBrief';

export async function createExecutiveBriefDocx(model: ExecutiveBriefModel): Promise<Blob> {
  const paragraph = (text: string, bold = false) => new Paragraph({ children: text.split('\n').map((line, i) => new TextRun({ text: line, break: i ? 1 : undefined, bold })), spacing: { after: 65, line: 250 } });
  return Packer.toBlob(new Document({ title: model.title, description: model.status,
    styles: { default: { document: { run: { font: 'Arial', size: 22, color: '1E293B' } }, title: { run: { font: 'Arial', size: 38, color: '000000', bold: true } }, heading1: { run: { font: 'Arial', size: 22, bold: true, color: '000000' } } } },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 680, bottom: 680, left: 850, right: 850 } } }, children: [
      new Paragraph({ text: model.title, heading: HeadingLevel.TITLE, spacing: { after: 90 } }),
      paragraph(model.context), new Paragraph({ children: [new TextRun({ text: `${model.date} · ${model.status}`, size: 18 })], spacing: { after: 100 } }),
      ...model.sections.flatMap(s => [new Paragraph({ text: s.title, heading: HeadingLevel.HEADING_1, keepNext: true, spacing: { before: 110, after: 65 } }), ...s.lines.map(line => paragraph(line, s.title === 'Management Problem'))]),
      new Paragraph({ children: [new TextRun({ text: model.notice, size: 18, color: '475569' })], spacing: { before: 110 } })
    ] }]
  }));
}
export async function downloadExecutiveBriefDocx(model: ExecutiveBriefModel) {
  const url = URL.createObjectURL(await createExecutiveBriefDocx(model));
  const link = document.createElement('a'); link.href = url; link.download = 'Executive-CBD-Brief.docx';
  document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
