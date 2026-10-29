import { describe, expect, it } from 'vitest';
import { createGrandviewFixture } from './projects';
import { buildDocumentModel } from './documentModel';

describe('shared export model', () => {
  it('excludes internal notes from all client-facing content', () => {
    const project = createGrandviewFixture();
    project.internalNotes = 'PRIVATE NEGOTIATION NOTE — NEVER EXPORT';
    const serialized = JSON.stringify(buildDocumentModel(project));

    expect(serialized).not.toContain(project.internalNotes);
  });

  it('uses one scope and total record for every exporter', () => {
    const project = createGrandviewFixture();
    const model = buildDocumentModel(project);

    expect(model.estimateRows.map((row) => row.hours)).toEqual([35, 50, 20]);
    expect(model.baseHours).toBe(105);
    expect(model.baseFeeCents).toBe(1_837_500);
    expect(model.sections.some((section) => section.body.includes('Victory Wholesale'))).toBe(false);
    expect(model.sections.some((section) => section.body.includes('New Harbor Capital'))).toBe(false);
    expect(JSON.stringify(model)).not.toMatch(/New_Harbor|Wakefield|VWG|Clearsight|BlackArch/);
  });
});
