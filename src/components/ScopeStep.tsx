import { Check, Plus, Trash2 } from 'lucide-react';
import type { Discipline, EstimateLine, ProjectRecord } from '../types';
import { calculateTotals, DISCIPLINES, disciplineLabel, effectiveRateCents } from '../lib/calculations';
import { centsToInput, dollarsToCents, formatCurrency } from '../lib/money';
import { makeId } from '../lib/id';
import { Callout, Field, SectionHeading, SelectField } from './Field';

interface Props {
  project: ProjectRecord;
  onChange: (project: ProjectRecord) => void;
}

export function ScopeStep({ project, onChange }: Props) {
  const totals = calculateTotals(project);
  const updateLine = (id: string, patch: Partial<EstimateLine>) => {
    onChange({ ...project, lines: project.lines.map((line) => line.id === id ? { ...line, ...patch } : line) });
  };
  const addLine = () => {
    onChange({
      ...project,
      lines: [...project.lines, {
        id: makeId('line'),
        phase: 'New task',
        discipline: 'other',
        description: '',
        hours: 0,
        rateOverrideCents: null,
        optional: false,
        selected: true,
      }],
    });
  };

  return (
    <div className="step-content">
      <SectionHeading
        eyebrow="Step 2"
        title="Scope & pricing"
        description="Hours and rates are the source of truth. Totals are calculated; they are never back-solved to match a target."
        action={<button type="button" className="button button--secondary" onClick={addLine}><Plus size={16} /> Add line</button>}
      />

      <section className="panel">
        <div className="panel__title-row">
          <div>
            <h3>Project-wide rates</h3>
            <p className="panel__intro">Line-item overrides take priority. Rates start as samples and remain unresolved until confirmed.</p>
          </div>
          <label className={`confirm-control ${project.ratesConfirmed ? 'is-confirmed' : ''}`}>
            <input type="checkbox" checked={project.ratesConfirmed} onChange={(event) => onChange({ ...project, ratesConfirmed: event.target.checked })} />
            <Check size={15} /> Rates confirmed for this project
          </label>
        </div>
        <div className="rate-grid">
          {DISCIPLINES.map((discipline) => (
            <Field
              key={discipline}
              label={`${disciplineLabel[discipline]} rate`}
              type="number"
              min="0"
              step="0.01"
              value={centsToInput(project.ratesCents[discipline])}
              onChange={(event) => onChange({
                ...project,
                ratesConfirmed: false,
                ratesCents: { ...project.ratesCents, [discipline]: dollarsToCents(event.target.value) },
              })}
              inputMode="decimal"
            />
          ))}
        </div>
      </section>

      <section className="panel panel--wide">
        <div className="estimate-table-wrap">
          <table className="estimate-table">
            <thead>
              <tr>
                <th>Phase / task</th>
                <th>Discipline</th>
                <th>Scope description</th>
                <th>Hours</th>
                <th>Rate override</th>
                <th>Fee</th>
                <th>Optional</th>
                <th aria-label="Remove" />
              </tr>
            </thead>
            <tbody>
              {project.lines.map((line) => {
                const rate = effectiveRateCents(line, project.ratesCents);
                const fee = Math.round(line.hours * rate);
                return (
                  <tr key={line.id} className={line.optional && !line.selected ? 'is-excluded' : ''}>
                    <td><input aria-label="Phase" value={line.phase} onChange={(event) => updateLine(line.id, { phase: event.target.value })} /></td>
                    <td>
                      <select aria-label="Discipline" value={line.discipline} onChange={(event) => updateLine(line.id, { discipline: event.target.value as Discipline })}>
                        {DISCIPLINES.map((discipline) => <option value={discipline} key={discipline}>{disciplineLabel[discipline]}</option>)}
                      </select>
                    </td>
                    <td><textarea aria-label="Scope description" rows={2} value={line.description} onChange={(event) => updateLine(line.id, { description: event.target.value })} /></td>
                    <td><input aria-label="Hours" className="numeric" type="number" min="0" step="0.25" value={line.hours} onChange={(event) => updateLine(line.id, { hours: Number(event.target.value) || 0 })} /></td>
                    <td>
                      <input
                        aria-label="Rate override"
                        className="numeric"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={centsToInput(project.ratesCents[line.discipline])}
                        value={centsToInput(line.rateOverrideCents)}
                        onChange={(event) => updateLine(line.id, { rateOverrideCents: event.target.value === '' ? null : dollarsToCents(event.target.value) })}
                      />
                    </td>
                    <td className="fee-cell">{formatCurrency(fee)}</td>
                    <td>
                      <label className="option-toggle">
                        <input type="checkbox" checked={line.optional} onChange={(event) => updateLine(line.id, { optional: event.target.checked, selected: event.target.checked ? line.selected : true })} />
                        <span>Optional</span>
                      </label>
                      {line.optional && (
                        <label className="option-toggle option-toggle--selected">
                          <input type="checkbox" checked={line.selected} onChange={(event) => updateLine(line.id, { selected: event.target.checked })} />
                          <span>Include</span>
                        </label>
                      )}
                    </td>
                    <td><button type="button" className="icon-button icon-button--danger" onClick={() => onChange({ ...project, lines: project.lines.filter((item) => item.id !== line.id) })} aria-label={`Remove ${line.phase}`}><Trash2 size={15} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button type="button" className="text-button" onClick={addLine}><Plus size={15} /> Add another estimate line</button>
      </section>

      <div className="summary-grid">
        <section className="summary-card summary-card--primary">
          <span>Base project</span>
          <strong>{formatCurrency(totals.baseFeeCents)}</strong>
          <small>{totals.baseHours} hours</small>
        </section>
        <section className="summary-card">
          <span>Selected optional</span>
          <strong>{formatCurrency(totals.optionalFeeCents)}</strong>
          <small>{totals.optionalHours} optional hours + selected services</small>
        </section>
        <section className="summary-card">
          <span>Recurring charges</span>
          <strong>{formatCurrency(totals.recurringFeeCents)}</strong>
          <small>Kept outside the base project total</small>
        </section>
        <section className="summary-card summary-card--dark">
          <span>Selected project fee</span>
          <strong>{formatCurrency(totals.selectedProjectFeeCents)}</strong>
          <small>Base + selected one-time options</small>
        </section>
      </div>

      <section className="panel">
        <h3>Calculation checks</h3>
        <div className="form-grid form-grid--2">
          <Field label="Target hours (optional)" type="number" min="0" step="0.25" value={project.targetHours ?? ''} onChange={(event) => onChange({ ...project, targetHours: event.target.value === '' ? null : Number(event.target.value) })} hint="A mismatch is flagged; hours are never altered automatically." />
          <Field label="Target base fee (optional)" type="number" min="0" step="0.01" value={centsToInput(project.targetFeeCents)} onChange={(event) => onChange({ ...project, targetFeeCents: event.target.value === '' ? null : dollarsToCents(event.target.value) })} hint="Compared against the calculated base fee." />
        </div>
        {project.targetHours !== null && Math.abs(project.targetHours - totals.baseHours) > 0.001 && (
          <Callout tone="warning" title="Hours mismatch">
            Calculated base hours are {totals.baseHours}; target hours are {project.targetHours}. Difference: {Math.abs(project.targetHours - totals.baseHours)} hours.
          </Callout>
        )}
        {project.targetFeeCents !== null && project.targetFeeCents !== totals.baseFeeCents && (
          <Callout tone="warning" title="Fee mismatch">
            Calculated base fee is {formatCurrency(totals.baseFeeCents)}; target is {formatCurrency(project.targetFeeCents)}.
          </Callout>
        )}
      </section>

      <section className="panel">
        <h3>Optional &amp; recurring services</h3>
        <p className="panel__intro">Nothing here enters the project fee unless explicitly selected. Recurring charges always remain separate.</p>
        <div className="service-grid">
          {project.optionalServices.map((service) => (
            <article className={`service-card ${service.selected ? 'is-selected' : ''}`} key={service.id}>
              <label className="service-card__select">
                <input type="checkbox" checked={service.selected} onChange={(event) => onChange({ ...project, optionalServices: project.optionalServices.map((item) => item.id === service.id ? { ...item, selected: event.target.checked } : item) })} />
                <span>{service.name}</span>
              </label>
              <p>{service.description}</p>
              <div className="service-card__fields">
                <Field label="Fee" type="number" min="0" step="0.01" value={centsToInput(service.feeCents)} onChange={(event) => onChange({ ...project, optionalServices: project.optionalServices.map((item) => item.id === service.id ? { ...item, feeCents: dollarsToCents(event.target.value) } : item) })} />
                <SelectField label="Billing" value={service.billingBasis} onChange={(event) => onChange({ ...project, optionalServices: project.optionalServices.map((item) => item.id === service.id ? { ...item, billingBasis: event.target.value as typeof service.billingBasis } : item) })}>
                  <option value="one-time">One-time</option>
                  <option value="annual">Annual</option>
                  <option value="monthly">Monthly</option>
                </SelectField>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3>Totals by discipline</h3>
        <div className="discipline-totals">
          {DISCIPLINES.map((discipline) => (
            <div key={discipline}>
              <span>{disciplineLabel[discipline]}</span>
              <strong>{formatCurrency(totals.byDiscipline[discipline].feeCents)}</strong>
              <small>{totals.byDiscipline[discipline].hours} hours</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
