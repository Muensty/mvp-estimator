import pptxgen from 'pptxgenjs';
import type { DocumentEstimateRow, DocumentModel } from '../../types';
import { formatCurrency } from '../money';

const C = {
  dark: '17343A',
  teal: '1A7F8B',
  aqua: '1AB7C3',
  orange: 'E86C2F',
  light: 'EAF4F5',
  muted: '5F7478',
  white: 'FFFFFF',
  red: 'B42318',
};

function chunks<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result.length ? result : [[]];
}

function addEstimateSlide(
  pptx: pptxgen,
  model: DocumentModel,
  rows: DocumentEstimateRow[],
  index: number,
  count: number,
  logoDataUrl?: string,
) {
  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: C.orange }, line: { color: C.orange } });
  slide.addText(model.statusLabel, { x: 0.72, y: 0.42, w: 3.6, h: 0.2, fontFace: 'Arial', fontSize: 7, bold: true, color: model.statusLabel.startsWith('DRAFT') ? C.red : C.teal, charSpacing: 1.6, breakLine: false });
  slide.addText(model.projectName, { x: 0.72, y: 0.82, w: 3.75, h: 1.2, fontFace: 'Arial', fontSize: 24, bold: true, color: C.dark, margin: 0, valign: 'middle', breakLine: false, fit: 'shrink' });
  slide.addText(model.clientName, { x: 0.72, y: 2.1, w: 3.6, h: 0.35, fontFace: 'Arial', fontSize: 12, bold: true, color: C.teal, margin: 0, breakLine: false });
  slide.addText(`${model.projectTypeLabel}\n${model.documentDate}  •  ${model.documentVersion}${count > 1 ? `  •  ${index + 1}/${count}` : ''}`, { x: 0.72, y: 2.54, w: 3.65, h: 0.72, fontFace: 'Arial', fontSize: 9, color: C.muted, margin: 0, breakLine: false });
  const overview = model.sections.find((section) => section.heading === 'Project overview')?.body ?? '';
  slide.addText(overview, { x: 0.72, y: 3.38, w: 3.72, h: 2.2, fontFace: 'Arial', fontSize: 10.5, color: C.dark, margin: 0, valign: 'top', breakLine: false, fit: 'shrink' });
  slide.addText(`BASE PROJECT  ${formatCurrency(model.baseFeeCents)}`, { x: 0.72, y: 5.86, w: 3.72, h: 0.42, fontFace: 'Arial', fontSize: 13, bold: true, color: C.orange, margin: 0, breakLine: false });
  if (model.optionalFeeCents || model.recurringFeeCents) {
    slide.addText(`Selected optional: ${formatCurrency(model.optionalFeeCents)}${model.recurringFeeCents ? `  •  Recurring: ${formatCurrency(model.recurringFeeCents)}` : ''}`, { x: 0.72, y: 6.34, w: 3.72, h: 0.34, fontFace: 'Arial', fontSize: 8.5, color: C.muted, margin: 0, breakLine: false, fit: 'shrink' });
  }
  slide.addText('www.mvpdesign.com', { x: 0.72, y: 7.05, w: 2.2, h: 0.18, fontFace: 'Arial', fontSize: 7, color: C.muted, margin: 0, breakLine: false });
  if (logoDataUrl) {
    slide.addImage({ data: logoDataUrl, x: 3.35, y: 6.78, w: 1.1, h: 0.72 });
  }

  const tableRows: pptxgen.TableRow[] = [
    [
      { text: 'PHASE / TASK', options: { bold: true, color: C.white, fill: { color: C.teal } } },
      { text: 'DISCIPLINE', options: { bold: true, color: C.white, fill: { color: C.teal } } },
      { text: 'HOURS', options: { bold: true, color: C.white, fill: { color: C.teal }, align: 'right' } },
      { text: 'RATE', options: { bold: true, color: C.white, fill: { color: C.teal }, align: 'right' } },
      { text: 'FEE', options: { bold: true, color: C.white, fill: { color: C.teal }, align: 'right' } },
    ],
    ...rows.map((row) => [
      { text: `${row.phase}${row.optional ? ' (optional)' : ''}` },
      { text: row.discipline },
      { text: row.hours.toFixed(2).replace(/\.00$/, ''), options: { align: 'right' as const } },
      { text: formatCurrency(row.rateCents), options: { align: 'right' as const } },
      { text: formatCurrency(row.feeCents), options: { align: 'right' as const } },
    ]),
    ...(index === count - 1 ? [[
      { text: 'BASE PROJECT TOTAL', options: { bold: true, color: C.dark, fill: { color: C.light } } },
      { text: '', options: { fill: { color: C.light } } },
      { text: String(model.baseHours), options: { bold: true, align: 'right' as const, fill: { color: C.light } } },
      { text: '', options: { fill: { color: C.light } } },
      { text: formatCurrency(model.baseFeeCents), options: { bold: true, align: 'right' as const, fill: { color: C.light } } },
    ]] : []),
  ];
  slide.addTable(tableRows, {
    x: 4.82,
    y: 0.4,
    w: 8.05,
    h: 4.7,
    border: { type: 'solid', color: 'CBD5D8', pt: 0.7 },
    fill: { color: C.white },
    color: C.dark,
    fontFace: 'Arial',
    fontSize: 8.2,
    margin: 0.07,
    rowH: 0.48,
    colW: [2.4, 1.65, 0.7, 1.25, 1.3],
    valign: 'middle',
    bold: false,
    breakLine: false,
  });
  slide.addShape(pptx.ShapeType.line, { x: 4.82, y: 5.38, w: 8.05, h: 0, line: { color: C.aqua, pt: 1.6 } });
  const notes = [
    model.sections.find((section) => section.heading === 'Pricing and billing basis')?.body ?? '',
    model.sections.find((section) => section.heading === 'Payment terms')?.body ?? '',
  ].filter(Boolean).join('\n');
  slide.addText(`NOTES:\n${notes}`, { x: 4.92, y: 5.56, w: 7.78, h: 1.45, fontFace: 'Arial', fontSize: 7.2, color: C.dark, margin: 0, breakLine: false, fit: 'shrink', valign: 'top' });
}

export function buildPptx(model: DocumentModel, logoDataUrl?: string): pptxgen {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'MVP Marketing + Design, Inc.';
  pptx.company = 'MVP Marketing + Design, Inc.';
  pptx.subject = model.projectName;
  pptx.title = `${model.projectName} Estimate`;
  pptx.theme = {
    headFontFace: 'Arial',
    bodyFontFace: 'Arial',
  };
  const rowChunks = chunks(model.estimateRows, 7);
  rowChunks.forEach((rows, index) => addEstimateSlide(pptx, model, rows, index, rowChunks.length, logoDataUrl));
  return pptx;
}
