import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

export function Field({
  label,
  hint,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; className?: string }) {
  return (
    <label className={`field ${className}`}>
      <span className="field__label">{label}</span>
      <input {...props} />
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function TextArea({
  label,
  hint,
  rows = 5,
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string; className?: string }) {
  return (
    <label className={`field ${className}`}>
      <span className="field__label">{label}</span>
      <textarea rows={rows} {...props} />
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function SelectField({
  label,
  hint,
  children,
  className = '',
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`field ${className}`}>
      <span className="field__label">{label}</span>
      <select {...props}>{children}</select>
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="section-heading__action">{action}</div>}
    </div>
  );
}

export function Callout({ tone = 'info', title, children }: { tone?: 'info' | 'warning' | 'success'; title: string; children: ReactNode }) {
  return (
    <div className={`callout callout--${tone}`}>
      <strong>{title}</strong>
      <div>{children}</div>
    </div>
  );
}
