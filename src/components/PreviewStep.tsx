import { CheckCircle2, Download, FileText, FileType2, History, Presentation, ShieldAlert } from 'lucide-react';
import { buildDocumentModel } from '../lib/documentModel';
import { calculateTotals, getUnresolvedItems } from '../lib/calculations';
import { formatCurrency } from '../lib/money';
import type { ProjectRecord, ProjectSnapshot } from '../types';
import { Callout, SectionHeading, SelectField } from './Field';

interface Props {
  project: ProjectRecord;
  busy: boolean;
  message: string;
  onChange: (project: ProjectRecord) => void;
  onMarkNarrativeReviewed: () => void;
  onExport: (kinds: ProjectSnapshot['exportKinds'], draft: boolean) => void;
}

export function PreviewStep({ project, busy, message, onChange, onMarkNarrativeReviewed, onExport }: Props) {
  const unresolved = getUnresolvedItems(project);
  const required = unresolved.filter((item) => item.severity === 'required');
  const review = unresolved.filter((item) => item.severity === 'review');
  const model = buildDocumentModel(project, required.length > 0);
  const totals = calculateTotals(project);

  return (
    <div className="step-content">
      <SectionHeading
        eyebrow="Step 4"
        title="Preview & export"
        description="Every format is generated from this exact shared record. Exporting creates an immutable version snapshot."
      />

      <div className="review-layout">
        <aside className="review-panel">
          <div className="review-score">
            <div className={required.length ? 'review-score__icon is-warning' : 'review-score__icon is-ready'}>
              {required.length ? <ShieldAlert size={25} /> : <CheckCircle2 size={25} />}
            </div>
            <div>
              <strong>{required.length ? `${required.length} required item${required.length === 1 ? '' : 's'}` : 'Ready for review'}</strong>
              <span>{review.length} additional review flag{review.length === 1 ? '' : 's'}</span>
            </div>
          </div>
          {unresolved.length ? (
            <div className="unresolved-list">
              {unresolved.map((item) => (
                <article key={item.id} className={`unresolved-item unresolved-item--${item.severity}`}>
                  <span>{item.step}</span>
                  <strong>{item.label}</strong>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          ) : <div className="empty-state empty-state--small">No unresolved items.</div>}

          <div className="review-panel__controls">
            <SelectField label="Internal review status" value={project.internalReviewStatus} onChange={(event) => onChange({ ...project, internalReviewStatus: event.target.value as ProjectRecord['internalReviewStatus'] })}>
              <option value="draft">Draft</option>
              <option value="needs-review">Needs review</option>
              <option value="ready-for-review">Ready for review</option>
            </SelectField>
            <SelectField label="Client acceptance" value={project.clientAcceptance} onChange={(event) => onChange({ ...project, clientAcceptance: event.target.value as ProjectRecord['clientAcceptance'] })}>
              <option value="not-sent">Not sent</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
            </SelectField>
          </div>

          {project.narrativeNeedsReview && (
            <button type="button" className="button button--secondary button--full" onClick={onMarkNarrativeReviewed}>
              <CheckCircle2 size={16} /> Mark narrative reviewed
            </button>
          )}
        </aside>

        <div className="document-preview" aria-label="SOW preview">
          <div className="document-preview__header">
            <div>
              <span className={model.statusLabel.startsWith('DRAFT') ? 'status-label status-label--draft' : 'status-label'}>{model.statusLabel}</span>
              <h1>{model.projectName}</h1>
              <p>{model.title}</p>
            </div>
            <img src="/mvp-logo.jpg" alt="MVP Marketing + Design" />
          </div>
          <div className="document-meta">
            <div><span>Prepared for</span><strong>{model.clientName}</strong></div>
            <div><span>Project type</span><strong>{model.projectTypeLabel}</strong></div>
            <div><span>Document date</span><strong>{model.documentDate}</strong></div>
            <div><span>Version</span><strong>{model.documentVersion}</strong></div>
          </div>
          {model.sections.slice(0, 5).map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.split('\n').map((line, index) => <p key={`${section.heading}-${index}`}>{line || '[REVIEW REQUIRED]'}</p>)}
            </section>
          ))}
          <section>
            <h2>Professional fees</h2>
            <div className="preview-table-wrap">
              <table className="preview-table">
                <thead><tr><th>Phase / task</th><th>Discipline</th><th>Hours</th><th>Rate</th><th>Fee</th></tr></thead>
                <tbody>
                  {model.estimateRows.map((row, index) => (
                    <tr key={`${row.phase}-${index}`}>
                      <td>{row.phase}{row.optional && <em>Optional</em>}</td>
                      <td>{row.discipline}</td>
                      <td>{row.hours}</td>
                      <td>{formatCurrency(row.rateCents)}</td>
                      <td>{formatCurrency(row.feeCents)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr><td>Base project total</td><td /><td>{model.baseHours}</td><td /><td>{formatCurrency(model.baseFeeCents)}</td></tr>
                  {model.optionalFeeCents > 0 && <tr><td>Selected optional work</td><td /><td /><td /><td>{formatCurrency(model.optionalFeeCents)}</td></tr>}
                </tfoot>
              </table>
            </div>
            {model.recurringFeeCents > 0 && <p className="preview-recurring">Selected recurring charges: <strong>{formatCurrency(model.recurringFeeCents)}</strong></p>}
          </section>
          {model.paymentRows.length > 0 && (
            <section>
              <h2>Payment schedule</h2>
              <div className="document-payment-grid">
                {model.paymentRows.map((row) => <div key={row.label}><span>{row.label} · {row.percentage}%</span><strong>{formatCurrency(row.amountCents)}</strong></div>)}
              </div>
            </section>
          )}
          {model.sections.slice(5).map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.split('\n').map((line, index) => <p key={`${section.heading}-${index}`}>{line || '[REVIEW REQUIRED]'}</p>)}
            </section>
          ))}
          <section>
            <h2>Acceptance</h2>
            <p>By signing below, the parties acknowledge the scope, fees, and selected commercial terms in this document.</p>
            <div className="signature-grid"><div><span>{model.acceptance.clientName}</span></div><div><span>MVP Marketing + Design, Inc.</span></div></div>
          </section>
        </div>
      </div>

      <section className="panel export-panel">
        <div className="panel__title-row">
          <div>
            <h3>Document exports</h3>
            <p className="panel__intro">Word is editable, PDF mirrors the same document model, and PowerPoint uses an editable Clearsight-inspired estimate layout.</p>
          </div>
          <div className="export-total"><span>Selected project fee</span><strong>{formatCurrency(totals.selectedProjectFeeCents)}</strong></div>
        </div>
        {message && <Callout tone={message.startsWith('Exported') ? 'success' : 'warning'} title="Export status">{message}</Callout>}
        <div className="export-actions">
          <button type="button" className="button button--primary" disabled={busy || required.length > 0} onClick={() => onExport(['docx', 'pdf', 'pptx'], false)}><Download size={17} /> Export review package</button>
          <button type="button" className="button button--secondary" disabled={busy} onClick={() => onExport(['docx', 'pdf', 'pptx'], true)}><Download size={17} /> Export draft package</button>
          <button type="button" className="format-button" disabled={busy} onClick={() => onExport(['docx'], true)}><FileType2 size={19} /><span>Word<small>Editable SOW</small></span></button>
          <button type="button" className="format-button" disabled={busy} onClick={() => onExport(['pdf'], true)}><FileText size={19} /><span>PDF<small>Matching SOW</small></span></button>
          <button type="button" className="format-button" disabled={busy} onClick={() => onExport(['pptx'], true)}><Presentation size={19} /><span>PowerPoint<small>Editable estimate</small></span></button>
        </div>
        {required.length > 0 && <p className="export-blocker">Resolve all required items to enable the clean “Ready for review” package. Draft exports remain available.</p>}
      </section>

      <section className="panel">
        <div className="panel__title-row">
          <div><h3>Exported versions</h3><p className="panel__intro">Snapshots keep earlier scope, pricing, terms, and narrative unchanged.</p></div>
          <History size={21} />
        </div>
        {project.snapshots.length === 0 ? <div className="empty-state">No exported versions yet.</div> : (
          <div className="snapshot-list">
            {[...project.snapshots].reverse().map((snapshot) => (
              <article key={snapshot.id}>
                <div className="snapshot-list__head">
                  <strong>{snapshot.versionLabel}</strong>
                  <span>{new Date(snapshot.createdAt).toLocaleString()}</span>
                  <em>{snapshot.exportKinds.join(' · ')}</em>
                </div>
                <ul>{snapshot.diffSummary.map((change) => <li key={change}>{change}</li>)}</ul>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
