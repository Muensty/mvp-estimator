export type ProjectType = 'teamplate-2' | 'custom-website' | 'website-updates';
export type PricingBasis = 'estimated-hourly' | 'fixed-fee';
export type Discipline = 'design' | 'development' | 'project-management' | 'other';
export type ReviewStatus = 'draft' | 'needs-review' | 'ready-for-review';
export type ClientAcceptance = 'not-sent' | 'sent' | 'accepted' | 'declined';

export interface SourceReference {
  filename: string;
  location: string;
  status: string;
}

export interface EstimateLine {
  id: string;
  phase: string;
  discipline: Discipline;
  description: string;
  hours: number;
  rateOverrideCents: number | null;
  optional: boolean;
  selected: boolean;
}

export interface OptionalService {
  id: string;
  name: string;
  description: string;
  selected: boolean;
  feeCents: number;
  billingBasis: 'one-time' | 'annual' | 'monthly';
}

export interface PaymentInstallment {
  id: string;
  label: string;
  percentage: number;
}

export interface PracticeChoice {
  id: string;
  label: string;
  included: boolean;
  confirmed: boolean;
  source: SourceReference;
}

export interface CommercialTerms {
  pricingBasis: PricingBasis;
  paymentTerms: string;
  estimateWording: string;
  changeProcess: string;
  otherClauses: string;
  includedRevisionRounds: string;
  additionalRoundsRateCents: number | null;
  varianceEnabled: boolean;
  variancePercent: number;
  varianceDisciplines: Discipline[];
  varianceWording: string;
  paymentSchedule: PaymentInstallment[];
}

export interface ProjectCore {
  id: string;
  clientName: string;
  projectName: string;
  clientContact: string;
  mvpContact: string;
  projectType: ProjectType;
  documentDate: string;
  documentVersion: string;
  overview: string;
  objectives: string;
  clientResponsibilities: string;
  assumptions: string;
  exclusions: string;
  dependencies: string;
  timeline: string;
  internalNotes: string;
  narrativeNeedsReview: boolean;
  ratesConfirmed: boolean;
  ratesCents: Record<Discipline, number>;
  lines: EstimateLine[];
  optionalServices: OptionalService[];
  targetHours: number | null;
  targetFeeCents: number | null;
  terms: CommercialTerms;
  practices: PracticeChoice[];
  internalReviewStatus: ReviewStatus;
  clientAcceptance: ClientAcceptance;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSnapshot {
  id: string;
  versionLabel: string;
  createdAt: string;
  exportKinds: Array<'docx' | 'pdf' | 'pptx'>;
  diffSummary: string[];
  data: ProjectCore;
}

export interface ProjectRecord extends ProjectCore {
  snapshots: ProjectSnapshot[];
}

export interface ScopePreset {
  id: ProjectType;
  name: string;
  summary: string;
  source: SourceReference;
  provisional: boolean;
  overview: string;
  objectives: string;
  responsibilities: string;
  assumptions: string;
  exclusions: string;
  timeline: string;
  lines: Array<Omit<EstimateLine, 'id'>>;
  practices: Array<Omit<PracticeChoice, 'id'>>;
}

export interface EstimateTotals {
  baseHours: number;
  baseFeeCents: number;
  optionalHours: number;
  optionalFeeCents: number;
  recurringFeeCents: number;
  selectedProjectFeeCents: number;
  byDiscipline: Record<Discipline, { hours: number; feeCents: number }>;
}

export interface UnresolvedItem {
  id: string;
  label: string;
  detail: string;
  severity: 'required' | 'review';
  step: 'project' | 'scope' | 'terms' | 'preview';
}

export interface DocumentEstimateRow {
  phase: string;
  discipline: string;
  scope: string;
  hours: number;
  rateCents: number;
  feeCents: number;
  optional: boolean;
}

export interface DocumentSection {
  heading: string;
  body: string;
}

export interface DocumentModel {
  title: string;
  clientName: string;
  projectName: string;
  projectTypeLabel: string;
  documentDate: string;
  documentVersion: string;
  statusLabel: string;
  sections: DocumentSection[];
  estimateRows: DocumentEstimateRow[];
  baseHours: number;
  baseFeeCents: number;
  optionalFeeCents: number;
  recurringFeeCents: number;
  selectedProjectFeeCents: number;
  paymentRows: Array<{ label: string; percentage: number; amountCents: number }>;
  unresolved: UnresolvedItem[];
  acceptance: { clientName: string; mvpName: string };
}

export interface ProjectBackup {
  format: 'mvp-estimate-sow-builder';
  schemaVersion: 1;
  exportedAt: string;
  projects: ProjectRecord[];
}
