import type { SourceReference } from '../types';

export interface ClauseOption {
  id: string;
  category: 'estimate' | 'variance' | 'payment' | 'change';
  label: string;
  text: string;
  source: SourceReference;
  provisional: boolean;
}

export const CLAUSE_OPTIONS: ClauseOption[] = [
  {
    id: 'hourly-wakefield',
    category: 'estimate',
    label: 'Estimated hourly — Wakefield reference',
    text: 'Professional fees are estimates based on the hours and rates shown. Final charges will reflect actual work performed under the selected billing provisions; this estimate is not a fixed fee or an overall maximum.',
    source: {
      filename: '03_Wakefield_Website_Updates_SOW_102826.docx',
      location: 'SOW §§3–4',
      status: 'Adapted from an unexecuted project SOW; confirm before client use.',
    },
    provisional: true,
  },
  {
    id: 'fixed-fee-placeholder',
    category: 'estimate',
    label: 'Fixed fee — requires approved wording',
    text: '[REVIEW REQUIRED: Insert approved fixed-fee basis and clearly identify services billed outside the fixed fee.]',
    source: {
      filename: 'START_HERE.txt',
      location: 'Interpretation notes',
      status: 'No company-wide approved fixed-fee master was verified.',
    },
    provisional: true,
  },
  {
    id: 'variance-wakefield',
    category: 'variance',
    label: 'Discipline-specific variance — Wakefield reference',
    text: 'The selected disciplines are subject to a plus or minus {percentage}% variance based on actual work performed. Project management and other actual-time services remain separate from this variance unless expressly stated otherwise.',
    source: {
      filename: '03_Wakefield_Website_Updates_SOW_102826.docx',
      location: 'SOW §4',
      status: 'Adapted from an unexecuted project SOW; disciplines and percentage must be confirmed.',
    },
    provisional: true,
  },
  {
    id: 'payment-wakefield',
    category: 'payment',
    label: '50% advance / balance due on receipt — project reference',
    text: 'An advance equal to 50% of the estimated project fee is due on receipt of invoice and will be credited against project charges. Remaining authorized project charges are due on receipt of invoice.',
    source: {
      filename: '03_Wakefield_Website_Updates_SOW_102826.docx',
      location: 'SOW §5',
      status: 'Project-specific payment reference; confirm before client use.',
    },
    provisional: true,
  },
  {
    id: 'change-wakefield',
    category: 'change',
    label: 'Written supplemental estimate / change order',
    text: 'Work beyond the confirmed scope will be addressed through a written supplemental estimate or change order describing the revised scope, fees, and schedule effect before the additional work proceeds.',
    source: {
      filename: '03_Wakefield_Website_Updates_SOW_102826.docx',
      location: 'SOW §§4 and 8',
      status: 'Adapted from an unexecuted project SOW; confirm before client use.',
    },
    provisional: true,
  },
];

export function clausesFor(category: ClauseOption['category']): ClauseOption[] {
  return CLAUSE_OPTIONS.filter((clause) => clause.category === category);
}
