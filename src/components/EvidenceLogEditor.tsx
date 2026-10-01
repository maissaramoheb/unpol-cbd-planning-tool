import React, { useId, useState } from 'react';
import { EvidenceNote, EvidenceSourceType } from '../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Slider } from '../ui/Slider';
import { Trash2, Plus, Calendar, FileText } from 'lucide-react';

interface EvidenceLogEditorProps {
  notes: EvidenceNote[];
  onChange: (notes: EvidenceNote[]) => void;
}

const SOURCE_TYPES: EvidenceSourceType[] = [
  'UN Mandate / Security Council Resolution',
  'UN / Mission Report',
  'Host-State Law / Policy',
  'Human Rights / OHCHR Source',
  'Police / Justice Institution Document',
  'Workshop Input',
  'Field Observation',
  'Interview / Consultation',
  'Academic / Research Source',
  'Analyst Judgment',
  'Other'
];

export const EvidenceLogEditor: React.FC<EvidenceLogEditorProps> = ({
  notes,
  onChange
}) => {
  const fieldIdPrefix = useId();
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState({
    sourceTitle: '',
    sourceType: SOURCE_TYPES[0],
    dateVerified: new Date().toISOString().split('T')[0],
    confidenceLevel: 3,
    comment: ''
  });

  const handleAdd = () => {
    if (!newNote.sourceTitle.trim()) {
      alert('Please enter a source title or reference.');
      return;
    }

    const note: EvidenceNote = {
      id: `ev-${Date.now()}`,
      sourceTitle: newNote.sourceTitle.trim(),
      sourceType: newNote.sourceType,
      dateVerified: newNote.dateVerified,
      confidenceLevel: newNote.confidenceLevel,
      comment: newNote.comment.trim()
    };

    onChange([...notes, note]);
    setNewNote({
      sourceTitle: '',
      sourceType: SOURCE_TYPES[0],
      dateVerified: new Date().toISOString().split('T')[0],
      confidenceLevel: 3,
      comment: ''
    });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    onChange(notes.filter(n => n.id !== id));
  };

  return (
    <div className="flex flex-col gap-4 border-t border-border-subtle pt-4 mt-2">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
          <FileText size={14} className="text-action-link" />
          Evidence & Verification Logs ({notes.length})
        </h4>
        {!isAdding && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="text-xs py-1"
          >
            <Plus size={12} className="mr-1" /> Add Evidence
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="p-4 border border-status-info-border bg-status-info-bg rounded-lg flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor={`${fieldIdPrefix}-source-title`} className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Source Title / Reference</label>
              <input
                id={`${fieldIdPrefix}-source-title`}
                type="text"
                value={newNote.sourceTitle}
                onChange={e => setNewNote({ ...newNote, sourceTitle: e.target.value })}
                placeholder="e.g. UNSCR 2630 (2022) / Host-State Police Act Art. 4"
                className="px-2.5 py-1.5 border border-border-strong rounded-lg text-xs bg-surface-base focus:outline-none focus:ring-2 focus:ring-focus-ring"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor={`${fieldIdPrefix}-source-type`} className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Source Type</label>
              <select
                id={`${fieldIdPrefix}-source-type`}
                value={newNote.sourceType}
                onChange={e => setNewNote({ ...newNote, sourceType: e.target.value as EvidenceSourceType })}
                className="px-2.5 py-1.5 border border-border-strong rounded-lg text-xs bg-surface-base focus:outline-none focus:ring-2 focus:ring-focus-ring"
              >
                {SOURCE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
            <div className="flex flex-col gap-1">
              <label htmlFor={`${fieldIdPrefix}-verification-date`} className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Verification Date</label>
              <input
                id={`${fieldIdPrefix}-verification-date`}
                type="date"
                value={newNote.dateVerified}
                onChange={e => setNewNote({ ...newNote, dateVerified: e.target.value })}
                className="px-2.5 py-1.5 border border-border-strong rounded-lg text-xs bg-surface-base focus:outline-none focus:ring-2 focus:ring-focus-ring"
              />
            </div>
            <div className="flex flex-col gap-1 py-1">
              <Slider
                label="Confidence Level"
                value={newNote.confidenceLevel}
                onChange={v => setNewNote({ ...newNote, confidenceLevel: v })}
                minLabel="Hypothetical"
                maxLabel="Triangulated / Certain"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor={`${fieldIdPrefix}-comment`} className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Comment / Findings Extract</label>
            <textarea
              id={`${fieldIdPrefix}-comment`}
              value={newNote.comment}
              onChange={e => setNewNote({ ...newNote, comment: e.target.value })}
              placeholder="Detail the supporting findings, page numbers, or interview context..."
              rows={2}
              className="px-2.5 py-1.5 border border-border-strong rounded-lg text-xs bg-surface-base focus:outline-none focus:ring-2 focus:ring-focus-ring"
            />
          </div>

          <div className="flex justify-end gap-2 mt-1">
            <Button variant="tertiary" size="sm" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAdd}>
              Save Evidence
            </Button>
          </div>
        </div>
      )}

      {notes.length === 0 ? (
        <p className="text-xs text-text-muted italic bg-surface-subtle p-3 rounded-lg border border-dashed border-border-default">
          No evidence notes logged yet. Add current sources and record when each source was reviewed.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {notes.map(note => (
            <div
              key={note.id}
              className="p-3 border border-border-default bg-surface-subtle rounded-lg flex flex-col gap-2 relative hover:border-border-strong transition-colors"
            >
              <button
                type="button"
                onClick={() => handleDelete(note.id)}
                className="absolute top-3 right-3 text-text-muted hover:text-status-danger transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                title="Remove Evidence Note"
                aria-label="Remove Evidence Note"
              >
                <Trash2 size={13} />
              </button>

              <div className="flex flex-wrap items-center gap-2 pr-6">
                <span className="font-bold text-xs text-text-primary leading-snug">
                  {note.sourceTitle}
                </span>
                <Badge variant="blue" className="text-[9px] uppercase font-extrabold tracking-wider">
                  {note.sourceType}
                </Badge>
                <Badge variant={note.confidenceLevel >= 4 ? 'green' : note.confidenceLevel <= 2 ? 'rose' : 'slate'} className="text-[9px]">
                  Conf: {note.confidenceLevel}/5
                </Badge>
              </div>

              {note.comment && (
                <p className="text-[11px] text-text-secondary leading-relaxed italic bg-surface-base border border-border-subtle p-2 rounded-lg">
                  &ldquo;{note.comment}&rdquo;
                </p>
              )}

              <div className="flex items-center gap-1.5 text-[9px] text-text-muted font-semibold uppercase tracking-wider">
                <Calendar size={10} />
                <span>Source reviewed: {note.dateVerified}</span>
                <span className="text-text-muted border-l border-border-strong h-2 px-0.5" />
                <FileText size={10} className="text-text-muted" />
                <span className="text-text-secondary">Evidence Note</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
