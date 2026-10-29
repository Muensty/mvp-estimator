import { AlertTriangle, BookOpen, Plus, Trash2 } from 'lucide-react';
import { CLAUSE_OPTIONS, clausesFor } from '../data/clauses';
import { calculatePaymentRows, calculateTotals, DISCIPLINES, disciplineLabel, paymentPercentageTotal } from '../lib/calculations';
import { centsToInput, dollarsToCents, formatCurrency } from '../lib/money';
import { makeId } from '../lib/id';
import type { Discipline, ProjectRecord } from '../types';
import { Callout, Field, SectionHeading, SelectField, TextArea } from './Field';

interface Props {
  project: ProjectRecord;
  onChange: (project: ProjectRecord) => void;
}

export function TermsStep({ project, onChange }: Props) {
  const totals = calculateTotals(project);
  const paymentTotal = paymentPercentageTotal(project.terms.paymentSchedule);
  const paymentRows = calculatePaymentRows(project.terms.paymentSchedule, totals.selectedProjectFeeCents);
  const setTerms = (patch: Partial<ProjectRecord['terms']>) => onChange({ ...project, terms: { ...project.terms, ...patch } });
  const varianceOption = CLAUSE_OPTIONS.find((option) => option.id === 'variance-wakefield');

  return (
    <div className="step-content">
      <SectionHeading
        eyebrow="Step 3"
        title="Commercial terms"
        description="Select project-specific rules deliberately. Reference wording remains editable and source-labeled."
      />
      <Callout tone="warning" title="No universal terms master was verified">
        Reference clauses below are project-specific or provisional. Confirm rates, payment terms, revisions, variance, hosting, and training for every project.
      </Callout>

      <section className="panel">
        <h3>Pricing basis</h3>
        <div className="form-grid form-grid--2">
          <SelectField label="Pricing basis" value={project.terms.pricingBasis} onChange={(event) => setTerms({ pricingBasis: event.target.value as ProjectRecord['terms']['pricingBasis'] })}>
            <option value="estimated-hourly">Estimated hourly</option>
            <option value="fixed-fee">Fixed fee</option>
          </SelectField>
          <Field label="Included revision rounds *" value={project.terms.includedRevisionRounds} onChange={(event) => setTerms({ includedRevisionRounds: event.target.value })} placeholder="e.g., Two consolidated rounds" />
          <Field label="Additional-round hourly rate" type="number" min="0" step="0.01" value={centsToInput(project.terms.additionalRoundsRateCents)} onChange={(event) => setTerms({ additionalRoundsRateCents: event.target.value === '' ? null : dollarsToCents(event.target.value) })} hint="Kept separate from any variance provision." />
        </div>
        <ClausePicker category="estimate" onUse={(text) => setTerms({ estimateWording: text })} />
        <TextArea label="Estimate / fee basis wording *" value={project.terms.estimateWording} onChange={(event) => setTerms({ estimateWording: event.target.value })} rows={5} />
      </section>

      <section className="panel">
        <div className="panel__title-row">
          <div>
            <h3>Variance provision</h3>
            <p className="panel__intro">Variance and additional-round charges are separate controls.</p>
          </div>
          <label className="switch-control">
            <input type="checkbox" checked={project.terms.varianceEnabled} onChange={(event) => setTerms({
              varianceEnabled: event.target.checked,
              varianceWording: event.target.checked && !project.terms.varianceWording ? varianceOption?.text ?? '' : project.terms.varianceWording,
            })} />
            <span>Use variance provision</span>
          </label>
        </div>
        {project.terms.varianceEnabled && (
          <>
            <div className="form-grid form-grid--2">
              <Field label="Variance percentage" type="number" min="0" max="100" step="1" value={project.terms.variancePercent} onChange={(event) => setTerms({ variancePercent: Number(event.target.value) || 0 })} />
              <div className="field">
                <span className="field__label">Applicable disciplines</span>
                <div className="check-cluster">
                  {DISCIPLINES.map((discipline) => (
                    <label key={discipline}>
                      <input
                        type="checkbox"
                        checked={project.terms.varianceDisciplines.includes(discipline)}
                        onChange={(event) => {
                          const next = event.target.checked
                            ? [...project.terms.varianceDisciplines, discipline]
                            : project.terms.varianceDisciplines.filter((item) => item !== discipline);
                          setTerms({ varianceDisciplines: next as Discipline[] });
                        }}
                      />
                      {disciplineLabel[discipline]}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <TextArea label="Variance wording *" value={project.terms.varianceWording} onChange={(event) => setTerms({ varianceWording: event.target.value })} rows={5} hint="{percentage} is replaced with the project percentage in exports." />
            {varianceOption && <SourceNote {...varianceOption.source} />}
          </>
        )}
      </section>

      <section className="panel">
        <h3>Payment terms</h3>
        <ClausePicker category="payment" onUse={(text) => {
          setTerms({
            paymentTerms: text,
            paymentSchedule: [
              { id: makeId('payment'), label: 'Project advance', percentage: 50 },
              { id: makeId('payment'), label: 'Remaining project fee', percentage: 50 },
            ],
          });
        }} />
        <TextArea label="Approved payment terms *" value={project.terms.paymentTerms} onChange={(event) => setTerms({ paymentTerms: event.target.value })} rows={5} placeholder="Required before Ready for review export" />
        <div className="panel__title-row panel__title-row--sub">
          <div>
            <h4>Payment schedule</h4>
            <p>Installment amounts reconcile against {formatCurrency(totals.selectedProjectFeeCents)}.</p>
          </div>
          <button type="button" className="button button--secondary button--small" onClick={() => setTerms({ paymentSchedule: [...project.terms.paymentSchedule, { id: makeId('payment'), label: 'Installment', percentage: 0 }] })}><Plus size={15} /> Add installment</button>
        </div>
        {project.terms.paymentSchedule.length === 0 ? (
          <div className="empty-state empty-state--small">No percentage schedule entered. Add one if the approved terms use installment percentages.</div>
        ) : (
          <div className="payment-table-wrap">
            <table className="payment-table">
              <thead><tr><th>Installment</th><th>Percentage</th><th>Calculated amount</th><th /></tr></thead>
              <tbody>
                {paymentRows.map((row) => (
                  <tr key={row.id}>
                    <td><input value={row.label} onChange={(event) => setTerms({ paymentSchedule: project.terms.paymentSchedule.map((item) => item.id === row.id ? { ...item, label: event.target.value } : item) })} /></td>
                    <td><input className="numeric" type="number" min="0" max="100" step="0.01" value={row.percentage} onChange={(event) => setTerms({ paymentSchedule: project.terms.paymentSchedule.map((item) => item.id === row.id ? { ...item, percentage: Number(event.target.value) || 0 } : item) })} /></td>
                    <td>{formatCurrency(row.amountCents)}</td>
                    <td><button type="button" className="icon-button icon-button--danger" onClick={() => setTerms({ paymentSchedule: project.terms.paymentSchedule.filter((item) => item.id !== row.id) })}><Trash2 size={15} /></button></td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr><td>Total</td><td className={paymentTotal === 100 ? 'is-valid' : 'is-invalid'}>{paymentTotal}%</td><td>{formatCurrency(paymentRows.reduce((sum, row) => sum + row.amountCents, 0))}</td><td /></tr></tfoot>
            </table>
          </div>
        )}
        {project.terms.paymentSchedule.length > 0 && paymentTotal !== 100 && (
          <Callout tone="warning" title="Payment schedule does not total 100%">
            Update the percentages before producing a Ready for review export.
          </Callout>
        )}
      </section>

      <section className="panel">
        <h3>Change process &amp; other clauses</h3>
        <ClausePicker category="change" onUse={(text) => setTerms({ changeProcess: text })} />
        <TextArea label="Change process" value={project.terms.changeProcess} onChange={(event) => setTerms({ changeProcess: event.target.value })} rows={5} />
        <TextArea label="Other approved commercial clauses" value={project.terms.otherClauses} onChange={(event) => setTerms({ otherClauses: event.target.value })} rows={7} placeholder="Leave blank unless approved project-specific language is available." />
      </section>

      <section className="panel">
        <h3>Preset practices to confirm</h3>
        <p className="panel__intro">Each item must be actively included or excluded and then confirmed.</p>
        <div className="practice-list">
          {project.practices.map((practice) => (
            <article key={practice.id} className={`practice-item ${practice.confirmed ? 'is-confirmed' : ''}`}>
              <div className="practice-item__main">
                <AlertTriangle size={17} />
                <div>
                  <strong>{practice.label}</strong>
                  <SourceNote {...practice.source} />
                </div>
              </div>
              <div className="practice-item__controls">
                <label><input type="checkbox" checked={practice.included} onChange={(event) => onChange({ ...project, practices: project.practices.map((item) => item.id === practice.id ? { ...item, included: event.target.checked, confirmed: false } : item) })} /> Include</label>
                <label><input type="checkbox" checked={practice.confirmed} onChange={(event) => onChange({ ...project, practices: project.practices.map((item) => item.id === practice.id ? { ...item, confirmed: event.target.checked } : item) })} /> Confirmed</label>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ClausePicker({ category, onUse }: { category: 'estimate' | 'payment' | 'change'; onUse: (text: string) => void }) {
  return (
    <div className="clause-picker">
      {clausesFor(category).map((clause) => (
        <article key={clause.id}>
          <div><BookOpen size={15} /><strong>{clause.label}</strong></div>
          <p>{clause.text}</p>
          <SourceNote {...clause.source} />
          <button type="button" className="text-button" onClick={() => onUse(clause.text)}>Use this wording</button>
        </article>
      ))}
    </div>
  );
}

function SourceNote({ filename, location, status }: { filename: string; location: string; status: string }) {
  return (
    <small className="source-note"><BookOpen size={12} /> {filename} · {location}. {status}</small>
  );
}
