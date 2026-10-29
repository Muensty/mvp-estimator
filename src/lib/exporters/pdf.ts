import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import type { DocumentModel } from '../../types';
import { formatCurrency } from '../money';

const COLORS = {
  teal: [26, 127, 139] as [number, number, number],
  dark: [23, 52, 58] as [number, number, number],
  orange: [232, 108, 47] as [number, number, number],
  muted: [91, 111, 115] as [number, number, number],
  light: [234, 244, 245] as [number, number, number],
  red: [180, 35, 24] as [number, number, number],
};

type AutoTableDoc = jsPDF & { lastAutoTable?: { finalY: number } };

function splitLines(doc: jsPDF, text: string, width: number): string[] {
  return doc.splitTextToSize(text || '[REVIEW REQUIRED]', width) as string[];
}

export function buildPdf(model: DocumentModel, logoDataUrl?: string): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const left = 50;
  const width = 512;
  const pageBottom = 720;
  let y = 52;

  const addPage = () => {
    doc.addPage();
    y = 52;
  };
  const need = (height: number) => {
    if (y + height > pageBottom) addPage();
  };
  const heading = (text: string) => {
    need(38);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.teal);
    doc.text(text, left, y);
    y += 20;
  };
  const paragraph = (text: string, color = COLORS.dark) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...color);
    for (const sourceLine of (text || '[REVIEW REQUIRED]').split('\n')) {
      const lines = splitLines(doc, sourceLine, width);
      need(lines.length * 13 + 6);
      doc.text(lines, left, y);
      y += lines.length * 13 + 5;
    }
    y += 4;
  };
  const sectionBlock = (section: { heading: string; body: string }) => {
    const wrappedLines = (section.body || '[REVIEW REQUIRED]')
      .split('\n')
      .reduce((count, line) => count + splitLines(doc, line, width).length, 0);
    need(Math.min(36 + wrappedLines * 18, pageBottom - 52));
    heading(section.heading);
    paragraph(section.body);
  };

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'JPEG', 455, 34, 107, 70);
    } catch {
      // Text branding below is always present when image decoding is unavailable.
    }
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...(model.statusLabel.startsWith('DRAFT') ? COLORS.red : COLORS.teal));
  doc.text(model.statusLabel, left, y);
  y += 22;
  doc.setFontSize(23);
  doc.setTextColor(...COLORS.dark);
  doc.text(splitLines(doc, model.projectName, 380), left, y);
  y += 34;
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.teal);
  doc.text(model.title, left, y);
  y += 22;
  doc.setDrawColor(...COLORS.orange);
  doc.setLineWidth(3);
  doc.line(left, y, 132, y);
  y += 20;

  autoTable(doc, {
    startY: y,
    margin: { left, right: 50 },
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 5, lineColor: [204, 215, 218], lineWidth: 0.4 },
    body: [
      ['Prepared for', model.clientName, 'Document date', model.documentDate],
      ['Project type', model.projectTypeLabel, 'Version', model.documentVersion],
    ],
    columnStyles: { 0: { fontStyle: 'bold', fillColor: COLORS.light }, 2: { fontStyle: 'bold', fillColor: COLORS.light } },
  });
  y = ((doc as AutoTableDoc).lastAutoTable?.finalY ?? y) + 20;

  model.sections.slice(0, 5).forEach(sectionBlock);

  heading('Professional fees');
  autoTable(doc, {
    startY: y,
    margin: { left, right: 50 },
    theme: 'grid',
    head: [['Phase / task', 'Discipline', 'Hours', 'Rate', 'Fee']],
    body: [
      ...model.estimateRows.map((row) => [
        `${row.phase}${row.optional ? ' (optional)' : ''}`,
        row.discipline,
        row.hours.toFixed(2).replace(/\.00$/, ''),
        formatCurrency(row.rateCents),
        formatCurrency(row.feeCents),
      ]),
      ['Base project total', '', String(model.baseHours), '', formatCurrency(model.baseFeeCents)],
      ...(model.optionalFeeCents ? [['Selected optional work', '', '', '', formatCurrency(model.optionalFeeCents)]] : []),
    ],
    headStyles: { fillColor: COLORS.teal, textColor: 255, fontStyle: 'bold' },
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 4, lineColor: [204, 215, 218], lineWidth: 0.4 },
    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
    didParseCell: (data) => {
      if (data.section === 'body' && data.row.index >= model.estimateRows.length) {
        data.cell.styles.fillColor = COLORS.light;
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });
  y = ((doc as AutoTableDoc).lastAutoTable?.finalY ?? y) + 14;

  if (model.recurringFeeCents) {
    paragraph(`Selected recurring charges: ${formatCurrency(model.recurringFeeCents)}`, COLORS.orange);
  }

  if (model.paymentRows.length) {
    heading('Payment schedule');
    autoTable(doc, {
      startY: y,
      margin: { left, right: 50 },
      theme: 'grid',
      head: [['Installment', 'Percentage', 'Amount']],
      body: model.paymentRows.map((row) => [row.label, `${row.percentage}%`, formatCurrency(row.amountCents)]),
      headStyles: { fillColor: COLORS.dark, textColor: 255 },
      styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 4, lineColor: [204, 215, 218], lineWidth: 0.4 },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    });
    y = ((doc as AutoTableDoc).lastAutoTable?.finalY ?? y) + 16;
  }

  model.sections.slice(5).forEach(sectionBlock);

  if (model.unresolved.length) {
    heading('Unresolved items');
    model.unresolved.forEach((item) => paragraph(`• ${item.label}: ${item.detail}`, COLORS.red));
  }

  heading('Acceptance');
  paragraph('By signing below, the parties acknowledge the scope, fees, and selected commercial terms in this document.');
  need(100);
  doc.setDrawColor(150, 164, 168);
  doc.line(left, y + 45, 260, y + 45);
  doc.line(330, y + 45, 560, y + 45);
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.dark);
  doc.text(model.acceptance.clientName, left, y + 60);
  doc.text('MVP Marketing + Design, Inc.', 330, y + 60);
  doc.text('Date: ____________________', left, y + 80);
  doc.text(`Authorized signer: ${model.acceptance.mvpName}`, 330, y + 80);

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.muted);
    doc.text('MVP Marketing + Design  •  Confidential', left, 758);
    doc.text(`Page ${page} of ${pages}`, 562, 758, { align: 'right' });
  }
  return doc;
}
