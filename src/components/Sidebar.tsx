import { Copy, Database, Download, FilePlus2, FolderOpen, RotateCcw } from 'lucide-react';
import type { ChangeEvent } from 'react';
import type { ProjectRecord } from '../types';

interface SidebarProps {
  projects: ProjectRecord[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDuplicate: () => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
}

export function Sidebar({ projects, activeId, onSelect, onNew, onDuplicate, onBackup, onRestore }: SidebarProps) {
  const handleRestore = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onRestore(file);
    event.target.value = '';
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <img src="/mvp-logo.jpg" alt="MVP Marketing + Design" />
        <div>
          <span>Internal tool</span>
          <strong>Estimate &amp; SOW Builder</strong>
        </div>
      </div>

      <button className="button button--primary button--full" type="button" onClick={onNew}>
        <FilePlus2 size={17} /> Create project
      </button>

      <div className="sidebar__label">Projects</div>
      <nav className="project-list" aria-label="Saved projects">
        {projects.map((project) => (
          <button
            type="button"
            className={`project-list__item ${project.id === activeId ? 'is-active' : ''}`}
            key={project.id}
            onClick={() => onSelect(project.id)}
          >
            <span>{project.clientName || 'New client'}</span>
            <strong>{project.projectName || 'Untitled project'}</strong>
            <small>{project.internalReviewStatus.replaceAll('-', ' ')} · {project.documentVersion}</small>
          </button>
        ))}
      </nav>

      <div className="sidebar__tools">
        <button type="button" onClick={onDuplicate}><Copy size={15} /> Duplicate current</button>
        <button type="button" onClick={onBackup}><Download size={15} /> Download backup</button>
        <label className="sidebar__file-button">
          <FolderOpen size={15} /> Restore backup
          <input type="file" accept="application/json,.json" onChange={handleRestore} />
        </label>
      </div>
      <div className="sidebar__footer">
        <Database size={14} /> Saved locally in this browser
        <span><RotateCcw size={13} /> Use backups between devices</span>
      </div>
    </aside>
  );
}
