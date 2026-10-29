import { CLAUSE_OPTIONS } from '../data/clauses';
import { getPreset } from '../data/presets';
import type {
  Discipline,
  ProjectCore,
  ProjectRecord,
  ProjectSnapshot,
  ProjectType,
} from '../types';
import { calculateTotals } from './calculations';
import { makeId } from './id';

function clone<T>(value: T): T {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value)) as T;
}

function isoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function isoNow(): string {
  return new Date().toISOString();
}

function sourceText(category: 'estimate' | 'change'): string {
  return CLAUSE_OPTIONS.find((option) => option.category === category)?.text ?? '';
}

function blankOptionalServices() {
  return [
    {
      id: makeId('service'),
      name: 'Managed website hosting',
      description: 'Managed hosting, SSL, and backups only when specifically authorized.',
      selected: false,
      feeCents: 0,
      billingBasis: 'annual' as const,
    },
    {
      id: makeId('service'),
      name: 'CMS training',
      description: 'Training beyond any explicitly included project allowance.',
      selected: false,
      feeCents: 0,
      billingBasis: 'one-time' as const,
    },
    {
      id: makeId('service'),
      name: 'Copywriting',
      description: 'Client-facing copywriting or content organization services.',
      selected: false,
      feeCents: 0,
      billingBasis: 'one-time' as const,
    },
    {
      id: makeId('service'),
      name: 'SEO add-on',
      description: 'Supplemental SEO strategy or ongoing program beyond foundational implementation.',
      selected: false,
      feeCents: 0,
      billingBasis: 'monthly' as const,
    },
  ];
}

export function createProject(projectType: ProjectType = 'website-updates'): ProjectRecord {
  const preset = getPreset(projectType);
  const now = isoNow();
  return {
    id: makeId('project'),
    clientName: '',
    projectName: preset.name,
    clientContact: '',
    mvpContact: '',
    projectType,
    documentDate: isoDate(),
    documentVersion: 'v1.0',
    overview: preset.overview,
    objectives: preset.objectives,
    clientResponsibilities: preset.responsibilities,
    assumptions: preset.assumptions,
    exclusions: preset.exclusions,
    dependencies: 'Timely delivery of required materials, access, consolidated feedback, and approvals.',
    timeline: preset.timeline,
    internalNotes: '',
    narrativeNeedsReview: false,
    ratesConfirmed: false,
    ratesCents: {
      design: 17500,
      development: 17500,
      'project-management': 17500,
      other: 17500,
    },
    lines: preset.lines.map((line) => ({ ...clone(line), id: makeId('line') })),
    optionalServices: blankOptionalServices(),
    targetHours: null,
    targetFeeCents: null,
    terms: {
      pricingBasis: 'estimated-hourly',
      paymentTerms: '',
      estimateWording: sourceText('estimate'),
      changeProcess: sourceText('change'),
      otherClauses: '',
      includedRevisionRounds: '',
      additionalRoundsRateCents: null,
      varianceEnabled: false,
      variancePercent: 20,
      varianceDisciplines: ['design', 'development'],
      varianceWording: '',
      paymentSchedule: [],
    },
    practices: preset.practices.map((practice) => ({ ...clone(practice), id: makeId('practice') })),
    internalReviewStatus: 'draft',
    clientAcceptance: 'not-sent',
    createdAt: now,
    updatedAt: now,
    snapshots: [],
  };
}

export function createGrandviewFixture(): ProjectRecord {
  const project = createProject('custom-website');
  const rates = { design: 17500, development: 17500, 'project-management': 17500, other: 17500 };
  return {
    ...project,
    clientName: 'Grandview',
    projectName: 'Grandview Website Estimate',
    clientContact: 'Sample Client Contact',
    mvpContact: 'Ben Muenstermann',
    overview:
      'Sample calculation fixture for a custom website engagement. This is test data and not proof of client approval.',
    objectives: 'Plan, design, develop, and coordinate a responsive website engagement.',
    timeline: 'Relative timing will be confirmed after kickoff and receipt of required materials.',
    ratesCents: rates,
    ratesConfirmed: true,
    lines: [
      { id: makeId('line'), phase: 'UX and visual design', discipline: 'design', description: 'Wireframes and responsive visual design.', hours: 35, rateOverrideCents: null, optional: false, selected: true },
      { id: makeId('line'), phase: 'Development and testing', discipline: 'development', description: 'Responsive development, testing, and launch support.', hours: 50, rateOverrideCents: null, optional: false, selected: true },
      { id: makeId('line'), phase: 'Project management', discipline: 'project-management', description: 'Coordination, meetings, proofing, and approvals.', hours: 20, rateOverrideCents: null, optional: false, selected: true },
      { id: makeId('line'), phase: 'Optional copywriting', discipline: 'other', description: 'Supplemental copywriting, only if selected.', hours: 10, rateOverrideCents: null, optional: true, selected: false },
    ],
    targetHours: 105,
    targetFeeCents: 1837500,
    terms: {
      ...project.terms,
      includedRevisionRounds: 'Two consolidated rounds for wireframes and selected visual design deliverables.',
      paymentTerms: 'Sample only — 50% advance with remaining authorized project charges due on receipt of invoice.',
      paymentSchedule: [
        { id: makeId('payment'), label: 'Project advance', percentage: 50 },
        { id: makeId('payment'), label: 'Remaining project fee', percentage: 50 },
      ],
    },
    practices: project.practices.map((practice) => ({ ...practice, confirmed: true })),
    internalReviewStatus: 'needs-review',
  };
}

export function applyPreset(project: ProjectRecord, projectType: ProjectType): ProjectRecord {
  const preset = getPreset(projectType);
  return markCommercialChange({
    ...project,
    projectType,
    overview: preset.overview,
    objectives: preset.objectives,
    clientResponsibilities: preset.responsibilities,
    assumptions: preset.assumptions,
    exclusions: preset.exclusions,
    timeline: preset.timeline,
    lines: preset.lines.map((line) => ({ ...clone(line), id: makeId('line') })),
    practices: preset.practices.map((practice) => ({ ...clone(practice), id: makeId('practice') })),
    ratesConfirmed: false,
  });
}

export function markCommercialChange(project: ProjectRecord): ProjectRecord {
  return {
    ...project,
    narrativeNeedsReview: true,
    internalReviewStatus: 'needs-review',
    clientAcceptance: project.clientAcceptance === 'accepted' ? 'not-sent' : project.clientAcceptance,
    updatedAt: isoNow(),
  };
}

export function markNarrativeReviewed(project: ProjectRecord): ProjectRecord {
  return { ...project, narrativeNeedsReview: false, updatedAt: isoNow() };
}

export function duplicateProject(project: ProjectRecord): ProjectRecord {
  const now = isoNow();
  return {
    ...clone(project),
    id: makeId('project'),
    projectName: `${project.projectName || 'Untitled project'} — copy`,
    documentVersion: 'v1.0',
    internalReviewStatus: 'draft',
    clientAcceptance: 'not-sent',
    narrativeNeedsReview: true,
    createdAt: now,
    updatedAt: now,
    snapshots: [],
  };
}

export function projectCore(project: ProjectRecord): ProjectCore {
  const { snapshots: _snapshots, ...core } = clone(project);
  return core;
}

function summarizeChanges(previous: ProjectCore | undefined, current: ProjectRecord): string[] {
  if (!previous) return ['Initial exported version.'];
  const changes: string[] = [];
  const previousWithSnapshots = { ...previous, snapshots: [] } as ProjectRecord;
  const before = calculateTotals(previousWithSnapshots);
  const after = calculateTotals(current);
  if (previous.clientName !== current.clientName) changes.push('Client name changed.');
  if (previous.projectName !== current.projectName) changes.push('Project name changed.');
  if (previous.overview !== current.overview || previous.objectives !== current.objectives) changes.push('Overview or objectives changed.');
  if (JSON.stringify(previous.lines) !== JSON.stringify(current.lines)) changes.push('Scope lines, hours, or line-item rates changed.');
  if (JSON.stringify(previous.ratesCents) !== JSON.stringify(current.ratesCents)) changes.push('Project-wide rates changed.');
  if (before.baseHours !== after.baseHours) changes.push(`Base hours changed from ${before.baseHours} to ${after.baseHours}.`);
  if (before.baseFeeCents !== after.baseFeeCents) changes.push(`Base fee changed by ${after.baseFeeCents - before.baseFeeCents} cents.`);
  if (JSON.stringify(previous.terms) !== JSON.stringify(current.terms)) changes.push('Commercial terms changed.');
  if (JSON.stringify(previous.optionalServices) !== JSON.stringify(current.optionalServices)) changes.push('Optional or recurring services changed.');
  return changes.length ? changes : ['No substantive changes from the prior exported version.'];
}

export function createExportSnapshot(
  project: ProjectRecord,
  exportKinds: ProjectSnapshot['exportKinds'],
): { project: ProjectRecord; snapshot: ProjectSnapshot } {
  const previous = project.snapshots.at(-1)?.data;
  const snapshot: ProjectSnapshot = {
    id: makeId('snapshot'),
    versionLabel: project.documentVersion || `v${project.snapshots.length + 1}`,
    createdAt: isoNow(),
    exportKinds,
    diffSummary: summarizeChanges(previous, project),
    data: projectCore(project),
  };
  return {
    snapshot,
    project: {
      ...project,
      internalReviewStatus: 'ready-for-review',
      narrativeNeedsReview: false,
      updatedAt: isoNow(),
      snapshots: [...project.snapshots, snapshot],
    },
  };
}

export function updateDisciplineRate(
  project: ProjectRecord,
  discipline: Discipline,
  cents: number,
): ProjectRecord {
  return markCommercialChange({
    ...project,
    ratesConfirmed: false,
    ratesCents: { ...project.ratesCents, [discipline]: cents },
  });
}
