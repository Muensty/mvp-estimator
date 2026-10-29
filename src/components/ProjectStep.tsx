import type { ProjectRecord, ProjectType } from '../types';
import { Callout, Field, SectionHeading, SelectField, TextArea } from './Field';

interface Props {
  project: ProjectRecord;
  onChange: (project: ProjectRecord) => void;
  onTypeChange: (type: ProjectType) => void;
}

export function ProjectStep({ project, onChange, onTypeChange }: Props) {
  const set = <K extends keyof ProjectRecord>(key: K, value: ProjectRecord[K]) => {
    onChange({ ...project, [key]: value, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="step-content">
      <SectionHeading
        eyebrow="Step 1"
        title="Project foundation"
        description="Capture the client context once. These client-facing fields feed every preview and export."
      />
      <section className="panel">
        <div className="form-grid form-grid--2">
          <Field label="Client name *" value={project.clientName} onChange={(event) => set('clientName', event.target.value)} placeholder="e.g., Grandview" />
          <Field label="Project name *" value={project.projectName} onChange={(event) => set('projectName', event.target.value)} placeholder="e.g., Website design and development" />
          <Field label="Client contact *" value={project.clientContact} onChange={(event) => set('clientContact', event.target.value)} placeholder="Name, title, email" />
          <Field label="MVP contact *" value={project.mvpContact} onChange={(event) => set('mvpContact', event.target.value)} placeholder="Name and title" />
          <SelectField label="Project type" value={project.projectType} onChange={(event) => onTypeChange(event.target.value as ProjectType)} hint="Changing type replaces the scope preset and narrative starting points.">
            <option value="teamplate-2">TeamPlate 2 website</option>
            <option value="custom-website">Custom website</option>
            <option value="website-updates">Existing website updates</option>
          </SelectField>
          <div className="form-grid form-grid--2 form-grid--compact">
            <Field label="Document date" type="date" value={project.documentDate} onChange={(event) => set('documentDate', event.target.value)} />
            <Field label="Version" value={project.documentVersion} onChange={(event) => set('documentVersion', event.target.value)} placeholder="v1.0" />
          </div>
        </div>
      </section>

      <section className="panel">
        <h3>Client-facing narrative</h3>
        <p className="panel__intro">Edit freely. Pricing recalculations will not overwrite your narrative.</p>
        <TextArea label="Project overview *" value={project.overview} onChange={(event) => set('overview', event.target.value)} rows={6} />
        <TextArea label="Objectives" value={project.objectives} onChange={(event) => set('objectives', event.target.value)} rows={5} hint="Use one objective per line for cleaner exports." />
        <div className="form-grid form-grid--2">
          <TextArea label="Client responsibilities and required inputs" value={project.clientResponsibilities} onChange={(event) => set('clientResponsibilities', event.target.value)} rows={7} />
          <TextArea label="Timeline *" value={project.timeline} onChange={(event) => set('timeline', event.target.value)} rows={7} hint="Relative timing is acceptable when dates are unknown." />
          <TextArea label="Assumptions" value={project.assumptions} onChange={(event) => set('assumptions', event.target.value)} rows={7} />
          <TextArea label="Exclusions" value={project.exclusions} onChange={(event) => set('exclusions', event.target.value)} rows={7} />
        </div>
        <TextArea label="Dependencies" value={project.dependencies} onChange={(event) => set('dependencies', event.target.value)} rows={4} />
      </section>

      <section className="panel panel--internal">
        <div className="panel__title-row">
          <div>
            <span className="eyebrow">Internal only</span>
            <h3>Working notes</h3>
          </div>
          <span className="privacy-badge">Never exported</span>
        </div>
        <TextArea label="Internal notes" value={project.internalNotes} onChange={(event) => set('internalNotes', event.target.value)} rows={6} placeholder="Negotiation context, internal reminders, approval history…" />
        <Callout tone="info" title="Export protection">
          Internal notes are deliberately excluded from the shared document model used by Word, PDF, and PowerPoint.
        </Callout>
      </section>
    </div>
  );
}
