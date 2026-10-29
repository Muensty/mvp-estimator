import type { ProjectBackup, ProjectRecord } from '../types';

export const STORAGE_KEY = 'mvp-estimate-sow-builder:v1';

export function saveProjects(projects: ProjectRecord[], storage: Storage = localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function loadProjects(storage: Storage = localStorage): ProjectRecord[] {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as ProjectRecord[];
  } catch {
    return [];
  }
}

export function createBackup(projects: ProjectRecord[]): ProjectBackup {
  return {
    format: 'mvp-estimate-sow-builder',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    projects: JSON.parse(JSON.stringify(projects)) as ProjectRecord[],
  };
}

export function parseBackup(raw: string): ProjectRecord[] {
  const parsed = JSON.parse(raw) as Partial<ProjectBackup>;
  if (
    parsed.format !== 'mvp-estimate-sow-builder' ||
    parsed.schemaVersion !== 1 ||
    !Array.isArray(parsed.projects)
  ) {
    throw new Error('This is not a valid MVP Estimate & SOW Builder backup.');
  }
  return parsed.projects as ProjectRecord[];
}
