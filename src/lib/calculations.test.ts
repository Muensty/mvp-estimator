import { describe, expect, it } from 'vitest';
import { buildDocumentModel } from './documentModel';
import { calculateTotals, getUnresolvedItems } from './calculations';
import { createGrandviewFixture } from './projects';

describe('estimate calculations', () => {
  it('passes the Grandview calculation fixture exactly', () => {
    const project = createGrandviewFixture();
    const totals = calculateTotals(project);

    expect(totals.baseHours).toBe(105);
    expect(totals.baseFeeCents).toBe(1_837_500);
  });

  it('flags the five-hour target mismatch without changing hours', () => {
    const project = createGrandviewFixture();
    project.lines[1].hours = 45;

    const totals = calculateTotals(project);
    const mismatch = getUnresolvedItems(project).find((item) => item.id === 'target-hours');

    expect(totals.baseHours).toBe(100);
    expect(project.targetHours).toBe(105);
    expect(mismatch?.detail).toContain('Calculated base hours are 100');
  });

  it('updates the shared preview model when a line-item rate changes', () => {
    const project = createGrandviewFixture();
    project.lines[1].rateOverrideCents = 20_000;

    const totals = calculateTotals(project);
    const model = buildDocumentModel(project);
    const development = model.estimateRows.find((row) => row.phase === 'Development and testing');

    expect(development?.rateCents).toBe(20_000);
    expect(development?.feeCents).toBe(1_000_000);
    expect(totals.baseFeeCents).toBe(model.baseFeeCents);
    expect(model.baseFeeCents).toBe(1_962_500);
  });

  it('excludes optional work until explicitly selected', () => {
    const project = createGrandviewFixture();
    const before = calculateTotals(project);
    project.lines.find((line) => line.optional)!.selected = true;
    const after = calculateTotals(project);

    expect(before.baseFeeCents).toBe(after.baseFeeCents);
    expect(before.optionalFeeCents).toBe(0);
    expect(after.optionalFeeCents).toBe(175_000);
  });
});
