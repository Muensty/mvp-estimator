import { useEffect, useMemo, useState } from 'react';
import { Calculator, ClipboardCheck, FilePenLine, Files, Save } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Sidebar } from './components/Sidebar';
import { ProjectStep } from './components/ProjectStep';
import { ScopeStep } from './components/ScopeStep';
import { TermsStep } from './components/TermsStep';
import { PreviewStep } from './components/PreviewStep';
import { getUnresolvedItems } from './lib/calculations';
import { buildDocumentModel, exportFileStem } from './lib/documentModel';
import {
  applyPreset,
  createExportSnapshot,
  createGrandviewFixture,
  createProject,
  duplicateProject,
  markCommercialChange,
  markNarrativeReviewed,
} from './lib/projects';
import { createBackup, loadProjects, parseBackup, saveProjects } from './lib/storage';
import type { ProjectRecord, ProjectSnapshot, ProjectType } from './types';

const steps = [
  { id: 'project', label: 'Project', icon: FilePenLine },
  { id: 'scope', label: 'Scope & pricing', icon: Calculator },
  { id: 'terms', label: 'Terms', icon: ClipboardCheck },
  { id: 'preview', label: 'Preview & export', icon: Files },
] as const;

type StepId = typeof steps[number]['id'];

function App() {
  const [projects, setProjects] = useState<ProjectRecord[]>(() => {
    const saved = loadProjects();
    return saved.length ? saved : [createGrandviewFixture()];
  });
  const [activeId, setActiveId] = useState(() => projects[0].id);
  const [step, setStep] = useState<StepId>('project');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [savedAt, setSavedAt] = useState('');
  const active = projects.find((project) => project.id === activeId) ?? projects[0];
  const unresolved = useMemo(() => active ? getUnresolvedItems(active) : [], [active]);

  useEffect(() => {
    saveProjects(projects);
    setSavedAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
  }, [projects]);

  const replaceProject = (next: ProjectRecord) => {
    setProjects((current) => current.map((project) => project.id === next.id ? { ...next, updatedAt: new Date().toISOString() } : project));
  };

  const replaceCommercial = (next: ProjectRecord) => replaceProject(markCommercialChange(next));

  const handleNew = () => {
    const project = createProject('website-updates');
    setProjects((current) => [...current, project]);
    setActiveId(project.id);
    setStep('project');
    setMessage('');
  };

  const handleDuplicate = () => {
    if (!active) return;
    const copy = duplicateProject(active);
    setProjects((current) => [...current, copy]);
    setActiveId(copy.id);
    setStep('project');
    setMessage('Duplicated project. Client acceptance and exported versions were cleared.');
  };

  const handleTypeChange = (type: ProjectType) => {
    replaceProject(applyPreset(active, type));
  };

  const handleBackup = () => {
    const backup = createBackup(projects);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    saveAs(blob, `MVP_Estimate_SOW_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  };

  const handleRestore = async (file: File) => {
    try {
      const restored = parseBackup(await file.text());
      if (!restored.length) throw new Error('The backup contains no projects.');
      setProjects(restored);
      setActiveId(restored[0].id);
      setStep('project');
      setMessage(`Restored ${restored.length} project${restored.length === 1 ? '' : 's'} from backup.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not restore this backup.');
    }
  };

  const handleExport = async (kinds: ProjectSnapshot['exportKinds'], draft: boolean) => {
    const required = getUnresolvedItems(active).filter((item) => item.severity === 'required');
    if (!draft && required.length) {
      setMessage(`Resolve ${required.length} required item${required.length === 1 ? '' : 's'} before a review package.`);
      return;
    }
    setBusy(true);
    setMessage('Preparing exports…');
    try {
      const {
        downloadDocx,
        downloadPdf,
        downloadPptx,
        loadBrandAssets,
      } = await import('./lib/exporters/browser');
      const result = createExportSnapshot(active, kinds);
      const nextProject = draft
        ? {
            ...result.project,
            internalReviewStatus: active.internalReviewStatus,
            narrativeNeedsReview: active.narrativeNeedsReview,
          }
        : result.project;
      replaceProject(nextProject);
      const snapshotProject: ProjectRecord = { ...result.snapshot.data, snapshots: [] };
      const model = buildDocumentModel(snapshotProject, draft);
      const fileStem = exportFileStem(snapshotProject);
      const assets = await loadBrandAssets();
      for (const kind of kinds) {
        if (kind === 'docx') await downloadDocx(model, `${fileStem}_SOW`, assets);
        if (kind === 'pdf') await downloadPdf(model, `${fileStem}_SOW`, assets);
        if (kind === 'pptx') await downloadPptx(model, `${fileStem}_Estimate`, assets);
      }
      setMessage(`Exported ${draft ? 'draft ' : ''}${kinds.join(', ').toUpperCase()} and saved version ${result.snapshot.versionLabel}.`);
    } catch (error) {
      setMessage(error instanceof Error ? `Export failed: ${error.message}` : 'Export failed.');
    } finally {
      setBusy(false);
    }
  };

  if (!active) return null;

  return (
    <div className="app-shell">
      <Sidebar
        projects={projects}
        activeId={active.id}
        onSelect={(id) => { setActiveId(id); setMessage(''); }}
        onNew={handleNew}
        onDuplicate={handleDuplicate}
        onBackup={handleBackup}
        onRestore={handleRestore}
      />
      <main className="workspace">
        <header className="workspace-header">
          <div>
            <span className="eyebrow">{active.clientName || 'New client'}</span>
            <h1>{active.projectName || 'Untitled project'}</h1>
          </div>
          <div className="workspace-header__status">
            <span className={unresolved.some((item) => item.severity === 'required') ? 'status-dot is-warning' : 'status-dot is-ready'} />
            {unresolved.filter((item) => item.severity === 'required').length} required · {unresolved.filter((item) => item.severity === 'review').length} review
            <small><Save size={13} /> Autosaved {savedAt}</small>
          </div>
        </header>
        <nav className="stepper" aria-label="Project workflow">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <button type="button" key={item.id} className={step === item.id ? 'is-active' : ''} onClick={() => setStep(item.id)}>
                <span>{index + 1}</span><Icon size={16} />{item.label}
              </button>
            );
          })}
        </nav>

        {step === 'project' && <ProjectStep project={active} onChange={replaceProject} onTypeChange={handleTypeChange} />}
        {step === 'scope' && <ScopeStep project={active} onChange={replaceCommercial} />}
        {step === 'terms' && <TermsStep project={active} onChange={replaceCommercial} />}
        {step === 'preview' && (
          <PreviewStep
            project={active}
            busy={busy}
            message={message}
            onChange={replaceProject}
            onMarkNarrativeReviewed={() => replaceProject(markNarrativeReviewed(active))}
            onExport={handleExport}
          />
        )}

        <div className="step-navigation">
          <button type="button" className="button button--secondary" disabled={step === 'project'} onClick={() => setStep(steps[Math.max(0, steps.findIndex((item) => item.id === step) - 1)].id)}>Back</button>
          <button type="button" className="button button--primary" disabled={step === 'preview'} onClick={() => setStep(steps[Math.min(steps.length - 1, steps.findIndex((item) => item.id === step) + 1)].id)}>Continue</button>
        </div>
      </main>
    </div>
  );
}

export default App;
