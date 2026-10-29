import { describe, expect, it } from 'vitest';
import { createExportSnapshot, createGrandviewFixture, duplicateProject } from './projects';
import { createBackup, loadProjects, parseBackup, saveProjects } from './storage';

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() { return this.data.size; }
  clear() { this.data.clear(); }
  getItem(key: string) { return this.data.get(key) ?? null; }
  key(index: number) { return [...this.data.keys()][index] ?? null; }
  removeItem(key: string) { this.data.delete(key); }
  setItem(key: string, value: string) { this.data.set(key, value); }
}

describe('saving, backups, duplication, and versions', () => {
  it('reopens saved projects without losing narrative edits', () => {
    const storage = new MemoryStorage();
    const project = createGrandviewFixture();
    project.overview = 'Edited narrative that must survive saving.';
    saveProjects([project], storage);

    const reopened = loadProjects(storage);
    expect(reopened[0].overview).toBe(project.overview);
    expect(reopened[0].lines).toEqual(project.lines);
  });

  it('round-trips a downloadable backup', () => {
    const project = createGrandviewFixture();
    const backup = createBackup([project]);
    const restored = parseBackup(JSON.stringify(backup));

    expect(restored).toEqual([project]);
  });

  it('duplicates reusable settings while clearing client approval and versions', () => {
    let project = createGrandviewFixture();
    project.clientAcceptance = 'accepted';
    project = createExportSnapshot(project, ['pdf']).project;

    const copy = duplicateProject(project);
    expect(copy.ratesCents).toEqual(project.ratesCents);
    expect(copy.terms).toEqual(project.terms);
    expect(copy.clientAcceptance).toBe('not-sent');
    expect(copy.internalReviewStatus).toBe('draft');
    expect(copy.snapshots).toEqual([]);
  });

  it('keeps an older exported version unchanged after later edits', () => {
    const original = createGrandviewFixture();
    const { project, snapshot } = createExportSnapshot(original, ['docx', 'pdf', 'pptx']);
    project.lines[0].hours = 99;
    project.overview = 'Later edit';

    expect(snapshot.data.lines[0].hours).toBe(35);
    expect(snapshot.data.overview).not.toBe('Later edit');
  });
});
