import React, { useState } from 'react';
import type { Interdependency, UnpolProjectData } from '../types';
import { PESTELS_KEYS } from '../data/pestelsCategories';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { CBD_EFFECTS, PLANNING_SIGNIFICANCE, INTERDEPENDENCY_GUIDANCE, INTERDEPENDENCY_CAUTION, dimensionName, existingEvidence, interdependencyIssues, interdependencyMap, mainBriefSelectionError, newInterdependency, resolveInterdependencyFinding } from '../lib/interdependencies';

const PESTELS_SHORT_CODES: Record<string, string> = {
  political: 'POL',
  economic: 'ECO',
  social: 'SOC',
  technological: 'TECH',
  environmental: 'ENV',
  legal: 'LEG',
  security: 'SEC'
};

interface Props {
  data: UnpolProjectData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: Interdependency | null;
  onDraftChange: (draft: Interdependency | null) => void;
  onChange: (items: Interdependency[]) => void;
}

export function InterdependencyAnalysis({ data, open, onOpenChange, draft, onDraftChange, onChange }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pair, setPair] = useState<string | null>(null);
  const items = data.interdependencies;
  const map = interdependencyMap(data);
  const findings = PESTELS_KEYS.flatMap(key => {
    const item = resolveInterdependencyFinding(data, data.pestels[key].id);
    return item ? [item] : [];
  });
  const update = (change: Partial<Interdependency>) => { if (draft) onDraftChange({ ...draft, ...change }); setError(null); };
  const save = () => {
    if (!draft) return;
    const next = items.some(item => item.id === draft.id) ? items.map(item => item.id === draft.id ? draft : item) : [...items, draft];
    const problem = interdependencyIssues(data, draft)[0] || mainBriefSelectionError({ ...data, interdependencies: next });
    if (problem) { setError(problem); return; }
    onChange(next); onDraftChange(null); setError(null);
  };
  const filtered = pair ? map.find(item => `${item.from}:${item.to}` === pair)?.relationships ?? [] : items;
  const findingLabel = (id: string | null) => {
    const resolved = resolveInterdependencyFinding(data, id);
    return resolved ? `${dimensionName(resolved.key)}: ${resolved.finding.finding}` : 'Missing finding — relink required';
  };
  return <section className="min-w-0 rounded-xl border border-border-default bg-surface-base print:hidden">
    <button type="button" aria-expanded={open} aria-controls="interdependency-workspace" onClick={() => onOpenChange(!open)} className="w-full p-4 text-left rounded-xl focus-visible:outline-2 focus-visible:outline-focus-ring">
      <span className="block font-semibold text-text-primary">PESTEL-S Interdependency Analysis <span className="text-xs font-normal text-text-muted">· Optional · {items.length} recorded</span></span>
      <span className="block mt-1 text-sm text-text-secondary">Explore how important PESTEL-S findings interact and why those relationships matter for CBD planning.</span>
    </button>
    {open && <div id="interdependency-workspace" className="p-4 pt-0 space-y-4 min-w-0">
      <p className="text-sm text-text-secondary">{INTERDEPENDENCY_GUIDANCE}</p>
      <p className="text-xs text-text-muted">{INTERDEPENDENCY_CAUTION}</p>
      <Button type="button" variant="secondary" onClick={() => { onDraftChange(newInterdependency(items)); setError(null); }}>Create interdependency</Button>
      {draft && <div className="rounded-lg border border-status-info-border bg-status-info-bg p-4 space-y-4" role="region" aria-label={`${draft.reference} editor`}>
        <h4 className="font-semibold">{draft.reference} · Relationship editor</h4>
        <div className="grid gap-4 md:grid-cols-2">
          {(['sourceFindingId', 'targetFindingId'] as const).map(field => <label key={field} className="min-w-0 text-sm font-semibold text-text-secondary">
            {field === 'sourceFindingId' ? 'Source Finding' : 'Target Finding'}
            <select value={draft[field] ?? ''} onChange={event => update({ [field]: event.target.value || null })} className="block w-full min-w-0 mt-1 border border-border-strong rounded-lg p-2 bg-surface-base focus:ring-2 focus:ring-focus-ring">
              <option value="">Select an existing finding</option>
              {draft[field] && !findings.some(item => item.finding.id === draft[field]) && <option value={draft[field]!}>Missing finding — select a replacement</option>}
              {findings.map(({ key, finding }) => <option key={finding.id} value={finding.id}>{dimensionName(key)} — {finding.finding}</option>)}
            </select>
          </label>)}
        </div>
        <p className="text-xs text-text-secondary break-words">Direction: {findingLabel(draft.sourceFindingId)} → {findingLabel(draft.targetFindingId)}</p>
        <TextArea label="Relationship" value={draft.relationship} onChange={event => update({ relationship: event.target.value })} helperText="How does the source condition influence, reinforce, constrain or interact with the target condition?" rows={3} />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-text-secondary">Effect on CBD
            <select aria-describedby="xi-effect-help" className="block w-full mt-1 border rounded-lg p-2 bg-surface-base" value={draft.effectOnCbd} onChange={event => update({ effectOnCbd: event.target.value as Interdependency['effectOnCbd'] })}>{CBD_EFFECTS.map(value => <option key={value}>{value}</option>)}</select>
            <span id="xi-effect-help" className="block mt-1 text-xs font-normal text-text-muted">Implication for CBD, not a judgement of whether the underlying condition is positive or negative.</span>
          </label>
          <label className="text-sm font-semibold text-text-secondary">Planning Significance
            <select aria-describedby="xi-significance-help" className="block w-full mt-1 border rounded-lg p-2 bg-surface-base" value={draft.planningSignificance} onChange={event => update({ planningSignificance: event.target.value as Interdependency['planningSignificance'] })}>{PLANNING_SIGNIFICANCE.map(value => <option key={value}>{value}</option>)}</select>
            <span id="xi-significance-help" className="block mt-1 text-xs font-normal text-text-muted">How significant is this interaction for CBD planning decisions? No numeric score is calculated.</span>
          </label>
        </div>
        <TextArea label="CBD Implication" value={draft.cbdImplication} onChange={event => update({ cbdImplication: event.target.value })} helperText="What does this relationship mean for the design, prioritization, sequencing or implementation of CBD? Strongly encouraged; a draft may be saved without it." rows={3} />
        <div className="text-xs text-text-secondary space-y-2">
          <p>A · Source finding evidence: {resolveInterdependencyFinding(data, draft.sourceFindingId)?.finding.evidenceNotes?.map(note => note.sourceTitle).join('; ') || 'None recorded'}</p>
          <p>B · Target finding evidence: {resolveInterdependencyFinding(data, draft.targetFindingId)?.finding.evidenceNotes?.map(note => note.sourceTitle).join('; ') || 'None recorded'}</p>
        </div>
        <fieldset className="border rounded-lg p-3 space-y-2">
          <legend className="text-sm font-semibold">C · Supporting evidence for this relationship (optional)</legend>
          <p className="text-xs text-text-muted">Select existing evidence only where it supports the relationship itself. Underlying finding evidence is not automatically relationship evidence.</p>
          {existingEvidence(data).map(note => <label key={note.id} className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={draft.evidenceIds.includes(note.id)} onChange={event => update({ evidenceIds: event.target.checked ? [...draft.evidenceIds, note.id] : draft.evidenceIds.filter(id => id !== note.id) })} />{note.sourceTitle}</label>)}
          {existingEvidence(data).length === 0 && <p className="text-xs text-text-muted">No evidence notes recorded yet. A relationship may still record professional judgement.</p>}
        </fieldset>
        <TextArea label="Analytical / Verification Note" value={draft.analyticalNote} onChange={event => update({ analyticalNote: event.target.value })} rows={2} />
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={draft.isKeyInsight} onChange={event => update({ isKeyInsight: event.target.checked, includeInMainBrief: event.target.checked && draft.includeInMainBrief })} />Key Interdependency — explicit professional-judgement selection</label>
        <label className="flex gap-2 text-sm"><input type="checkbox" disabled={!draft.isKeyInsight} checked={draft.includeInMainBrief} onChange={event => update({ includeInMainBrief: event.target.checked })} />Include in main Planning Brief (up to five active valid key insights)</label>
        {error && <p role="alert" className="text-sm text-status-danger">{error}</p>}
        <div className="flex flex-wrap gap-2"><Button type="button" variant="primary" onClick={save}>Save relationship</Button><Button type="button" variant="secondary" onClick={() => { onDraftChange(null); setError(null); }}>Cancel</Button></div>
      </div>}
      {pair && <div className="flex flex-wrap items-center gap-2 text-sm"><span>Showing {pair.split(':').map(dimensionName).join(' → ')}</span><Button type="button" variant="tertiary" onClick={() => setPair(null)}>Clear map filter</Button></div>}
      <div className="space-y-3" aria-label="Recorded interdependencies">
        {filtered.map(item => <article key={item.id} className="min-w-0 break-words rounded-lg border border-border-default p-4 space-y-2">
          <h4 className="font-semibold">{item.reference}{item.isKeyInsight ? ' · Key insight' : ''}{item.includeInMainBrief ? ' · Main brief selected' : ''}</h4>
          <p className="text-sm text-text-secondary">{findingLabel(item.sourceFindingId)} → {findingLabel(item.targetFindingId)}</p>
          <p className="text-sm whitespace-pre-wrap">{item.relationship}</p>
          <p className="text-xs text-text-muted">Effect on CBD: {item.effectOnCbd} · Planning significance: {item.planningSignificance}</p>
          <p className="text-sm whitespace-pre-wrap"><strong>CBD implication:</strong> {item.cbdImplication || 'Not recorded — consider why this interaction matters for planning.'}</p>
          {interdependencyIssues(data, item).map(issue => <p key={issue} className="text-sm text-status-warning">{issue} Excluded from map, Stage 4 sources and main brief until repaired.</p>)}
          <div className="flex gap-2"><Button type="button" variant="secondary" size="sm" aria-label={`Edit ${item.reference}`} onClick={() => { onDraftChange(item); setError(null); }}>Edit / relink</Button><Button type="button" variant="destructive" size="sm" aria-label={`Delete ${item.reference}`} onClick={() => { if (window.confirm(`Delete ${item.reference}? Its SWOT source links will be removed; written SWOT analysis will be preserved.`)) { onChange(items.filter(other => other.id !== item.id)); if (draft?.id === item.id) onDraftChange(null); } }}>Delete</Button></div>
        </article>)}
        {filtered.length === 0 && <p className="text-sm text-text-muted">No relationships recorded{pair ? ' for this direction' : ''}. This analysis is optional; you can continue without it.</p>}
      </div>
      <details className="rounded-xl border border-border-default bg-surface-subtle/30 p-4 shadow-subtle overflow-hidden" open>
        <summary className="cursor-pointer font-bold text-sm text-text-primary focus-visible:outline-2 focus-visible:outline-focus-ring flex items-center justify-between">
          <span>PESTEL-S Interdependency Map · Cross-Impact View</span>
        </summary>
        <p className="text-xs text-text-muted my-3">FROM ↓ / TO → · Counts of recorded finding-to-finding relationships, not scores or causal strength. Select a populated direction to filter the cards.</p>

        {/* Selected Pair Indicator */}
        {pair && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-surface-active border border-action-primary/30 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-action-link">Active Matrix Filter:</span>
              <span className="font-mono font-medium text-text-primary">{pair.split(':').map(dimensionName).join(' → ')}</span>
              <span className="text-text-muted">({filtered.length} recorded)</span>
            </div>
            <button
              type="button"
              onClick={() => setPair(null)}
              className="text-xs font-semibold text-action-link hover:text-action-link-hover underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded px-1.5 py-0.5"
            >
              Clear filter
            </button>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-border-default bg-surface-base">
          <table className="hidden md:table w-full table-fixed text-[11px] text-center border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border-default">
                <th scope="col" className="p-2.5 text-center font-bold text-[10px] text-text-muted w-28 uppercase tracking-wider border-r border-border-default bg-surface-subtle">
                  <span>FROM ↓ / TO →</span>
                </th>
                {PESTELS_KEYS.map(key => (
                  <th key={key} scope="col" className="p-2 text-center border-r last:border-r-0 border-border-default">
                    <span className="font-mono text-[10px] font-bold text-text-muted uppercase block">{PESTELS_SHORT_CODES[key]}</span>
                    <span className="text-xs font-semibold text-text-primary block truncate" title={dimensionName(key)}>{dimensionName(key)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PESTELS_KEYS.map(from => (
                <tr key={from} className="border-b last:border-b-0 border-border-default hover:bg-surface-hover/30 transition-colors">
                  <th scope="row" className="p-2 text-left bg-surface-subtle border-r border-border-default font-semibold text-xs text-text-primary">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold text-text-muted uppercase shrink-0">{PESTELS_SHORT_CODES[from]}</span>
                      <span className="truncate" title={dimensionName(from)}>{dimensionName(from)}</span>
                    </div>
                  </th>
                  {PESTELS_KEYS.map(to => {
                    const count = map.find(item => item.from === from && item.to === to)?.relationships.length ?? 0;
                    const isSelected = pair === `${from}:${to}`;
                    return (
                      <td key={to} className={`border-r last:border-r-0 border-border-default p-1 text-center ${from === to ? 'bg-surface-subtle/60' : 'bg-surface-base'}`}>
                        {from === to ? (
                          <span className="text-text-muted/40 font-mono text-xs select-none block py-1.5" aria-label="Not applicable">—</span>
                        ) : count ? (
                          <button
                            type="button"
                            aria-label={`${dimensionName(from)} to ${dimensionName(to)}: ${count} relationships`}
                            aria-pressed={isSelected}
                            onClick={() => setPair(isSelected ? null : `${from}:${to}`)}
                            className={`w-full rounded-md py-1.5 px-1 font-mono text-xs font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                              isSelected
                                ? 'bg-action-primary text-text-inverse shadow-xs ring-2 ring-focus-ring'
                                : 'bg-status-info-bg text-action-link border border-status-info-border hover:border-action-link hover:shadow-2xs'
                            }`}
                          >
                            {count}
                          </button>
                        ) : (
                          <span className="text-text-muted/40 font-mono text-xs select-none block py-1.5">0</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-3 pt-3 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-status-info-bg border border-status-info-border text-action-link font-mono font-bold text-[10px]">
                1
              </span>
              <span className="text-text-secondary text-[11px]">Recorded relationships (Click to filter)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-surface-base border border-border-default text-text-muted/40 font-mono text-[10px]">
                0
              </span>
              <span className="text-text-secondary text-[11px]">No relationships recorded</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-surface-subtle border border-border-default text-text-muted/40 font-mono text-[10px]">
                —
              </span>
              <span className="text-text-secondary text-[11px]">Self-interaction (N/A)</span>
            </div>
          </div>
          <span className="text-[10px] text-text-muted italic">
            Counts represent recorded qualitative relationships, not numerical weight or causal magnitude.
          </span>
        </div>

        <div className="md:hidden space-y-2 mt-3">{map.filter(item => item.relationships.length).map(item => <Button key={`${item.from}:${item.to}`} type="button" variant="secondary" fullWidth onClick={() => setPair(`${item.from}:${item.to}`)}>{dimensionName(item.from)} → {dimensionName(item.to)} · {item.relationships.length} relationships</Button>)}{!map.some(item => item.relationships.length) && <p className="text-sm">No valid recorded relationships.</p>}</div>
      </details>
    </div>}
  </section>;
}
