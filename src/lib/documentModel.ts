import { getPreset } from '../data/presets';
import type { DocumentModel, ProjectRecord } from '../types';
import {
  calculatePaymentRows,
  calculateTotals,
  disciplineLabel,
  effectiveRateCents,
  getUnresolvedItems,
  hasRequiredUnresolved,
} from './calculations';

function selectedOptionalServices(project: ProjectRecord, recurring: boolean): string {
  return project.optionalServices
    .filter((service) => service.selected && (service.billingBasis !== 'one-time') === recurring)
    .map((service) => `${service.name}: ${service.description}`)
    .join('\n');
}

function varianceText(project: ProjectRecord): string {
  if (!project.terms.varianceEnabled) return 'No variance provision selected.';
  const disciplines = project.terms.varianceDisciplines.map((item) => disciplineLabel[item]).join(', ');
  return project.terms.varianceWording
    .replaceAll('{percentage}', String(project.terms.variancePercent))
    .concat(disciplines ? `\nApplicable disciplines: ${disciplines}.` : '');
}

export function buildDocumentModel(project: ProjectRecord, forceDraft = false): DocumentModel {
  const totals = calculateTotals(project);
  const unresolved = getUnresolvedItems(project);
  const preset = getPreset(project.projectType);
  const draft = forceDraft || hasRequiredUnresolved(project);
  const includedLines = project.lines.filter((line) => !line.optional || line.selected);
  const oneTimeOptions = selectedOptionalServices(project, false);
  const recurringOptions = selectedOptionalServices(project, true);
  const sections = [
    { heading: 'Project overview', body: project.overview },
    { heading: 'Objectives', body: project.objectives },
    {
      heading: 'Scope and deliverables',
      body: includedLines
        .map((line) => `${line.phase}: ${line.description}${line.optional ? ' (selected optional work)' : ''}`)
        .join('\n'),
    },
    { heading: 'Client responsibilities', body: project.clientResponsibilities },
    { heading: 'Timeline', body: project.timeline },
    {
      heading: 'Pricing and billing basis',
      body: [
        project.terms.pricingBasis === 'fixed-fee' ? 'Pricing basis: Fixed fee.' : 'Pricing basis: Estimated hourly.',
        project.terms.estimateWording,
        varianceText(project),
        project.terms.additionalRoundsRateCents
          ? `Additional revision rounds: billed separately at $${(project.terms.additionalRoundsRateCents / 100).toFixed(2)} per hour.`
          : 'Additional revision rounds: subject to the confirmed change process and approved project terms.',
      ].join('\n'),
    },
    { heading: 'Payment terms', body: project.terms.paymentTerms },
    { heading: 'Assumptions', body: project.assumptions },
    { heading: 'Dependencies', body: project.dependencies },
    { heading: 'Exclusions', body: project.exclusions },
    { heading: 'Change process', body: project.terms.changeProcess },
    ...(oneTimeOptions ? [{ heading: 'Selected optional services', body: oneTimeOptions }] : []),
    ...(recurringOptions ? [{ heading: 'Selected recurring services', body: recurringOptions }] : []),
    ...(project.terms.otherClauses ? [{ heading: 'Other approved commercial clauses', body: project.terms.otherClauses }] : []),
  ];

  return {
    title: 'Statement of Work and Estimate',
    clientName: project.clientName || '[CLIENT NAME REQUIRED]',
    projectName: project.projectName || '[PROJECT NAME REQUIRED]',
    projectTypeLabel: preset.name,
    documentDate: project.documentDate,
    documentVersion: project.documentVersion,
    statusLabel: draft ? 'DRAFT — UNRESOLVED ITEMS' : 'READY FOR REVIEW',
    sections,
    estimateRows: includedLines.map((line) => ({
      phase: line.phase,
      discipline: disciplineLabel[line.discipline],
      scope: line.description,
      hours: line.hours,
      rateCents: effectiveRateCents(line, project.ratesCents),
      feeCents: Math.round(line.hours * effectiveRateCents(line, project.ratesCents)),
      optional: line.optional,
    })),
    baseHours: totals.baseHours,
    baseFeeCents: totals.baseFeeCents,
    optionalFeeCents: totals.optionalFeeCents,
    recurringFeeCents: totals.recurringFeeCents,
    selectedProjectFeeCents: totals.selectedProjectFeeCents,
    paymentRows: calculatePaymentRows(project.terms.paymentSchedule, totals.selectedProjectFeeCents).map((row) => ({
      label: row.label,
      percentage: row.percentage,
      amountCents: row.amountCents,
    })),
    unresolved,
    acceptance: {
      clientName: project.clientName || '[CLIENT NAME REQUIRED]',
      mvpName: project.mvpContact || '[MVP AUTHORIZED SIGNER REQUIRED]',
    },
  };
}

export function exportFileStem(project: ProjectRecord): string {
  const raw = `${project.clientName || 'Client'}_${project.projectName || 'Project'}_${project.documentVersion || 'draft'}`;
  return raw.replace(/[^a-z0-9-_]+/gi, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}
