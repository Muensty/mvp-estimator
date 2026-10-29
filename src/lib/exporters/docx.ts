import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  PageBreak,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import type { DocumentModel } from '../../types';
import { formatCurrency } from '../money';

const TEAL = '1A7F8B';
const DARK = '17343A';
const ORANGE = 'E86C2F';
const LIGHT = 'EAF4F5';

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CBD5D8' };
const cellBorders = { top: border, bottom: border, left: border, right: border };
type Alignment = (typeof AlignmentType)[keyof typeof AlignmentType];

function cell(text: string, bold = false, shade?: string, align: Alignment = AlignmentType.LEFT): TableCell {
  return new TableCell({
    borders: cellBorders,
    shading: shade ? { fill: shade } : undefined,
    margins: { top: 100, bottom: 100, left: 110, right: 110 },
    children: [
      new Paragraph({
        alignment: align,
        children: [new TextRun({ text, bold, color: bold ? DARK : '263A3E', size: 18 })],
      }),
    ],
  });
}

function linesToParagraphs(body: string): Paragraph[] {
  if (!body.trim()) {
    return [new Paragraph({ children: [new TextRun({ text: '[REVIEW REQUIRED]', color: 'B42318', bold: true })] })];
  }
  return body.split('\n').map((line) => new Paragraph({
    spacing: { after: 90 },
    children: [new TextRun({ text: line, size: 20, color: '263A3E' })],
  }));
}

export function buildDocx(model: DocumentModel, logoBytes?: Uint8Array): Document {
  const headerChildren: Paragraph[] = [];
  if (logoBytes) {
    headerChildren.push(new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new ImageRun({ data: logoBytes, transformation: { width: 122, height: 80 }, type: 'jpg' })],
    }));
  } else {
    headerChildren.push(new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: 'MVP  marketing + design', bold: true, color: TEAL, size: 18 })],
    }));
  }

  const estimateRows = [
    new TableRow({
      tableHeader: true,
      children: [
        cell('Phase / task', true, TEAL),
        cell('Discipline', true, TEAL),
        cell('Hours', true, TEAL, AlignmentType.RIGHT),
        cell('Rate', true, TEAL, AlignmentType.RIGHT),
        cell('Fee', true, TEAL, AlignmentType.RIGHT),
      ],
    }),
    ...model.estimateRows.map((row) => new TableRow({ children: [
      cell(`${row.phase}${row.optional ? ' (optional)' : ''}`),
      cell(row.discipline),
      cell(row.hours.toFixed(2).replace(/\.00$/, ''), false, undefined, AlignmentType.RIGHT),
      cell(formatCurrency(row.rateCents), false, undefined, AlignmentType.RIGHT),
      cell(formatCurrency(row.feeCents), false, undefined, AlignmentType.RIGHT),
    ] })),
    new TableRow({ children: [
      cell('Base project total', true, LIGHT),
      cell('', true, LIGHT),
      cell(String(model.baseHours), true, LIGHT, AlignmentType.RIGHT),
      cell('', true, LIGHT),
      cell(formatCurrency(model.baseFeeCents), true, LIGHT, AlignmentType.RIGHT),
    ] }),
    ...(model.optionalFeeCents ? [new TableRow({ children: [
      cell('Selected optional work', true, LIGHT), cell('', true, LIGHT), cell('', true, LIGHT), cell('', true, LIGHT), cell(formatCurrency(model.optionalFeeCents), true, LIGHT, AlignmentType.RIGHT),
    ] })] : []),
  ];

  const body: Array<Paragraph | Table> = [
    new Paragraph({
      spacing: { after: 90 },
      children: [new TextRun({ text: model.statusLabel, bold: true, color: model.statusLabel.startsWith('DRAFT') ? 'B42318' : TEAL, size: 18 })],
    }),
    new Paragraph({
      heading: HeadingLevel.TITLE,
      spacing: { after: 80 },
      children: [new TextRun({ text: model.projectName, bold: true, color: DARK, size: 40 })],
    }),
    new Paragraph({
      spacing: { after: 250 },
      children: [new TextRun({ text: model.title, color: TEAL, bold: true, size: 24 })],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [cell('Prepared for', true, LIGHT), cell(model.clientName), cell('Document date', true, LIGHT), cell(model.documentDate)] }),
        new TableRow({ children: [cell('Project type', true, LIGHT), cell(model.projectTypeLabel), cell('Version', true, LIGHT), cell(model.documentVersion)] }),
      ],
    }),
    new Paragraph({ text: '', spacing: { after: 100 } }),
  ];

  model.sections.slice(0, 5).forEach((section) => {
    body.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 180, after: 80 }, children: [new TextRun({ text: section.heading, bold: true, color: TEAL, size: 26 })] }));
    body.push(...linesToParagraphs(section.body));
  });

  body.push(
    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 220, after: 100 }, children: [new TextRun({ text: 'Professional fees', bold: true, color: TEAL, size: 26 })] }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: estimateRows }),
  );

  if (model.recurringFeeCents) {
    body.push(new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: `Selected recurring charges: ${formatCurrency(model.recurringFeeCents)}`, bold: true, color: ORANGE })] }));
  }

  if (model.paymentRows.length) {
    body.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 80 }, children: [new TextRun({ text: 'Payment schedule', bold: true, color: DARK, size: 22 })] }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [cell('Installment', true, TEAL), cell('Percentage', true, TEAL), cell('Amount', true, TEAL)] }),
          ...model.paymentRows.map((row) => new TableRow({ children: [cell(row.label), cell(`${row.percentage}%`), cell(formatCurrency(row.amountCents))] })),
        ],
      }),
    );
  }

  model.sections.slice(5).forEach((section) => {
    body.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 180, after: 80 }, children: [new TextRun({ text: section.heading, bold: true, color: TEAL, size: 26 })] }));
    body.push(...linesToParagraphs(section.body));
  });

  if (model.unresolved.length) {
    body.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 80 }, children: [new TextRun({ text: 'Unresolved items', bold: true, color: 'B42318', size: 26 })] }));
    model.unresolved.forEach((item) => body.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: `${item.label}: ${item.detail}`, color: 'B42318', size: 19 })] })));
  }

  body.push(
    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 260, after: 100 }, children: [new TextRun({ text: 'Acceptance', bold: true, color: TEAL, size: 26 })] }),
    new Paragraph({ children: [new TextRun({ text: 'By signing below, the parties acknowledge the scope, fees, and selected commercial terms in this document.', size: 20 })] }),
    new Paragraph({ text: '' }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [cell(model.acceptance.clientName, true), cell('MVP Marketing + Design, Inc.', true)] }),
        new TableRow({ children: [cell('\nSignature: __________________________\nDate: _______________________________'), cell(`\nAuthorized signature: __________________\nPrinted name: ${model.acceptance.mvpName}\nDate: _________________________________`)] }),
      ],
    }),
  );

  return new Document({
    styles: {
      default: { document: { run: { font: 'Arial', size: 20 }, paragraph: { spacing: { line: 276 } } } },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        },
      },
      headers: { default: new Header({ children: headerChildren }) },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'MVP Marketing + Design  •  Confidential  •  Page ', color: '617276', size: 16 }), new TextRun({ children: [PageNumber.CURRENT], color: '617276', size: 16 })],
          })],
        }),
      },
      children: body,
    }],
  });
}
