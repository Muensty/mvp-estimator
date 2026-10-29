import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { Packer } from 'docx';
import { buildDocumentModel } from '../src/lib/documentModel';
import { buildDocx } from '../src/lib/exporters/docx';
import { buildPdf } from '../src/lib/exporters/pdf';
import { buildPptx } from '../src/lib/exporters/pptx';
import { createGrandviewFixture } from '../src/lib/projects';
import { createBackup } from '../src/lib/storage';

const project = createGrandviewFixture();
const model = buildDocumentModel(project, false);
const outputDirectory = new URL('../sample-exports/', import.meta.url);
const logoPath = new URL('../public/mvp-logo.jpg', import.meta.url);

await mkdir(outputDirectory, { recursive: true });
const logoBuffer = await readFile(logoPath);
const logoBytes = new Uint8Array(logoBuffer);
const logoDataUrl = `data:image/jpeg;base64,${logoBuffer.toString('base64')}`;

const docxBuffer = await Packer.toBuffer(buildDocx(model, logoBytes));
await writeFile(new URL('Grandview_Sample_SOW.docx', outputDirectory), docxBuffer);

const pdfBuffer = Buffer.from(buildPdf(model, logoDataUrl).output('arraybuffer'));
await writeFile(new URL('Grandview_Sample_SOW.pdf', outputDirectory), pdfBuffer);

const pptxOutput = await buildPptx(model, logoDataUrl).write({ outputType: 'nodebuffer' });
await writeFile(new URL('Grandview_Sample_Estimate.pptx', outputDirectory), Buffer.from(pptxOutput as Uint8Array));

await writeFile(
  new URL('Grandview_Sample_Backup.json', outputDirectory),
  JSON.stringify(createBackup([project]), null, 2),
  'utf8',
);

console.log(`Generated sample exports for ${model.clientName}: ${model.baseHours} hours / ${model.baseFeeCents} cents.`);
