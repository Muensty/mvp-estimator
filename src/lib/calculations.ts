import type {
  Discipline,
  EstimateLine,
  EstimateTotals,
  PaymentInstallment,
  ProjectRecord,
  UnresolvedItem,
} from '../types';
import { calculateLineFeeCents, roundHours } from './money';

export const DISCIPLINES: Discipline[] = [
  'design',
  'development',
  'project-management',
  'other',
];

export const disciplineLabel: Record<Discipline, string> = {
  design: 'Design',
  development: 'Development',
  'project-management': 'Project management',
  other: 'Other',
};

export function effectiveRateCents(
  line: EstimateLine,
  rates: ProjectRecord['ratesCents'],
): number {
  return line.rateOverrideCents ?? rates[line.discipline];
}

export function calculateTotals(project: ProjectRecord): EstimateTotals {
  const byDiscipline = Object.fromEntries(
    DISCIPLINES.map((discipline) => [discipline, { hours: 0, feeCents: 0 }]),
  ) as EstimateTotals['byDiscipline'];

  let baseHours = 0;
  let baseFeeCents = 0;
  let optionalHours = 0;
  let optionalLineFeeCents = 0;

  for (const line of project.lines) {
    const rate = effectiveRateCents(line, project.ratesCents);
    const fee = calculateLineFeeCents(line.hours, rate);
    if (line.optional) {
      if (line.selected) {
        optionalHours += line.hours;
        optionalLineFeeCents += fee;
      }
      continue;
    }
    baseHours += line.hours;
    baseFeeCents += fee;
    byDiscipline[line.discipline].hours += line.hours;
    byDiscipline[line.discipline].feeCents += fee;
  }

  let selectedOneTimeServices = 0;
  let recurringFeeCents = 0;
  for (const service of project.optionalServices) {
    if (!service.selected) continue;
    if (service.billingBasis === 'one-time') selectedOneTimeServices += service.feeCents;
    else recurringFeeCents += service.feeCents;
  }

  for (const discipline of DISCIPLINES) {
    byDiscipline[discipline].hours = roundHours(byDiscipline[discipline].hours);
  }

  const optionalFeeCents = optionalLineFeeCents + selectedOneTimeServices;
  return {
    baseHours: roundHours(baseHours),
    baseFeeCents,
    optionalHours: roundHours(optionalHours),
    optionalFeeCents,
    recurringFeeCents,
    selectedProjectFeeCents: baseFeeCents + optionalFeeCents,
    byDiscipline,
  };
}

export function calculatePaymentRows(
  installments: PaymentInstallment[],
  projectFeeCents: number,
): Array<PaymentInstallment & { amountCents: number }> {
  let allocated = 0;
  return installments.map((item, index) => {
    const isLast = index === installments.length - 1;
    const amountCents = isLast
      ? projectFeeCents - allocated
      : Math.round((projectFeeCents * item.percentage) / 100);
    allocated += amountCents;
    return { ...item, amountCents };
  });
}

export function paymentPercentageTotal(installments: PaymentInstallment[]): number {
  return Math.round(installments.reduce((sum, item) => sum + item.percentage, 0) * 100) / 100;
}

export function getUnresolvedItems(project: ProjectRecord): UnresolvedItem[] {
  const totals = calculateTotals(project);
  const items: UnresolvedItem[] = [];
  const required = (
    condition: boolean,
    id: string,
    label: string,
    detail: string,
    step: UnresolvedItem['step'],
  ) => {
    if (condition) items.push({ id, label, detail, severity: 'required', step });
  };
  required(!project.clientName.trim(), 'client-name', 'Client name', 'Add the client name.', 'project');
  required(!project.projectName.trim(), 'project-name', 'Project name', 'Add the project name.', 'project');
  required(!project.clientContact.trim(), 'client-contact', 'Client contact', 'Add the client contact.', 'project');
  required(!project.mvpContact.trim(), 'mvp-contact', 'MVP contact', 'Add the responsible MVP contact.', 'project');
  required(!project.overview.trim(), 'overview', 'Project overview', 'Complete the client-facing overview.', 'project');
  required(!project.timeline.trim(), 'timeline', 'Timeline', 'Add dates or relative timing.', 'project');
  required(project.lines.filter((line) => !line.optional || line.selected).length === 0, 'scope', 'Estimate lines', 'Add at least one included scope line.', 'scope');
  required(
    !project.lines.some((line) => (!line.optional || line.selected) && line.hours > 0),
    'hours',
    'Estimated hours',
    'Enter hours for at least one included scope line.',
    'scope',
  );
  required(!project.ratesConfirmed, 'rate-confirmation', 'Rate confirmation', 'Confirm the rates for this project.', 'scope');
  required(
    project.lines.some((line) => (!line.optional || line.selected) && effectiveRateCents(line, project.ratesCents) <= 0),
    'rates',
    'Hourly rates',
    'Confirm a positive project or line-item rate for every included line.',
    'scope',
  );
  required(!project.terms.includedRevisionRounds.trim(), 'revisions', 'Revision allowance', 'Confirm the number or treatment of included revisions.', 'terms');
  required(!project.terms.paymentTerms.trim(), 'payment-terms', 'Payment terms', 'Select or enter approved payment terms.', 'terms');
  required(
    project.terms.paymentSchedule.length > 0 && paymentPercentageTotal(project.terms.paymentSchedule) !== 100,
    'payment-total',
    'Payment schedule',
    `Installment percentages total ${paymentPercentageTotal(project.terms.paymentSchedule)}%, not 100%.`,
    'terms',
  );
  required(
    project.terms.varianceEnabled && !project.terms.varianceWording.trim(),
    'variance-wording',
    'Variance wording',
    'Add confirmed variance language or disable the provision.',
    'terms',
  );
  required(
    project.terms.pricingBasis === 'estimated-hourly' && !project.terms.estimateWording.trim(),
    'estimate-wording',
    'Estimate basis wording',
    'Select or enter approved estimated-hourly wording.',
    'terms',
  );

  required(
    project.targetHours !== null && Math.abs(totals.baseHours - project.targetHours) > 0.001,
    'target-hours',
    'Target hours mismatch',
    `Calculated base hours are ${totals.baseHours}; target hours are ${project.targetHours}.`,
    'scope',
  );
  required(
    project.targetFeeCents !== null && totals.baseFeeCents !== project.targetFeeCents,
    'target-fee',
    'Target fee mismatch',
    'The calculated base fee does not equal the entered target fee.',
    'scope',
  );
  required(project.narrativeNeedsReview, 'narrative-review', 'Narrative review', 'Scope or pricing changed after narrative edits.', 'preview');
  required(
    project.practices.some((practice) => !practice.confirmed),
    'preset-practices',
    'Preset practices',
    'Confirm each project-specific practice before a clean export.',
    'terms',
  );
  return items;
}

export function hasRequiredUnresolved(project: ProjectRecord): boolean {
  return getUnresolvedItems(project).some((item) => item.severity === 'required');
}
