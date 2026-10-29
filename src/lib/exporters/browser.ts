import { Packer } from 'docx';
import { saveAs } from 'file-saver';
import type { DocumentModel } from '../../types';
import { buildDocx } from './docx';
import { buildPdf } from './pdf';
import { buildPptx } from './pptx';

export interface BrandAssets {
  logoDataUrl?: string;
  logoBytes?: Uint8Array;
}

export async function loadBrandAssets(): Promise<BrandAssets> {
  try {
    const response = await fetch('/mvp-logo.jpg');
    if (!response.ok) return {};
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const blob = new Blob([bytes], { type: 'image/jpeg' });
    const logoDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    return { logoBytes: bytes, logoDataUrl };
  } catch {
    return {};
  }
}

export async function downloadDocx(model: DocumentModel, fileStem: string, assets: BrandAssets): Promise<void> {
  const blob = await Packer.toBlob(buildDocx(model, assets.logoBytes));
  saveAs(blob, `${fileStem}.docx`);
}

export async function downloadPdf(model: DocumentModel, fileStem: string, assets: BrandAssets): Promise<void> {
  const blob = buildPdf(model, assets.logoDataUrl).output('blob');
  saveAs(blob, `${fileStem}.pdf`);
}

export async function downloadPptx(model: DocumentModel, fileStem: string, assets: BrandAssets): Promise<void> {
  const blob = await buildPptx(model, assets.logoDataUrl).write({ outputType: 'blob' });
  saveAs(blob as Blob, `${fileStem}.pptx`);
}

export async function downloadPackage(model: DocumentModel, fileStem: string): Promise<void> {
  const assets = await loadBrandAssets();
  await downloadDocx(model, `${fileStem}_SOW`, assets);
  await downloadPdf(model, `${fileStem}_SOW`, assets);
  await downloadPptx(model, `${fileStem}_Estimate`, assets);
}
