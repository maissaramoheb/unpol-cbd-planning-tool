import React, { useState } from 'react';
import type { Interdependency, UnpolProjectData } from '../types';
import { PESTELS_KEYS } from '../data/pestelsCategories';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { CBD_EFFECTS, PLANNING_SIGNIFICANCE, INTERDEPENDENCY_GUIDANCE, INTERDEPENDENCY_CAUTION, dimensionName, existingEvidence, interdependencyIssues, interdependencyMap, mainBriefSelectionError, newInterdependency, resolveInterdependencyFinding } from '../lib/interdependencies';

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
  return <section className="min-w-0 rounded-xl border border-slate-200 bg-white print:hidden">
    <button type="button" aria-expanded={open} aria-controls="interdependency-workspace" onClick={() => onOpenChange(!open)} className="w-full p-4 text-left rounded-xl focus-visible:outline-2 focus-visible:outline-blue-600">
      <span className="block font-semibold text-slate-900">PESTEL-S Interdependency Analysis <span className="text-xs font-normal text-slate-500">· Optional · {items.length} recorded</span></span>
      <span className="block mt-1 text-sm text-slate-600">Explore how important PESTEL-S findings interact and why those relationships matter for CBD planning.</span>
    </button>
    {open && <div id="interdependency-workspace" className="p-4 pt-0 space-y-4 min-w-0">
      <p className="text-sm text-slate-600">{INTERDEPENDENCY_GUIDANCE}</p>
      <p className="text-xs text-slate-500">{INTERDEPENDENCY_CAUTION}</p>
      <Button type="button" variant="outline" onClick={() => { onDraftChange(newInterdependency(items)); setError(null); }}>Create interdependency</Button>
      {draft && <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-4 space-y-4" role="region" aria-label={`${draft.reference} editor`}>
        <h4 className="font-semibold">{draft.reference} · Relationship editor</h4>
        <div className="grid gap-4 md:grid-cols-2">
          {(['sourceFindingId', 'targetFindingId'] as const).map(field => <label key={field} className="min-w-0 text-sm font-semibold text-slate-700">
            {field === 'sourceFindingId' ? 'Source Finding' : 'Target Finding'}
            <select value={draft[field] ?? ''} onChange={event => update({ [field]: event.target.value || null })} className="block w-full min-w-0 mt-1 border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-500">
              <option value="">Select an existing finding</option>
              {draft[field] && !findings.some(item => item.finding.id === draft[field]) && <option value={draft[field]!}>Missing finding — select a replacement</option>}
              {findings.map(({ key, finding }) => <option key={finding.id} value={finding.id}>{dimensionName(key)} — {finding.finding}</option>)}
            </select>
          </label>)}
        </div>
        <p className="text-xs text-slate-600 break-words">Direction: {findingLabel(draft.sourceFindingId)} → {findingLabel(draft.targetFindingId)}</p>
        <TextArea label="Relationship" value={draft.relationship} onChange={event => update({ relationship: event.target.value })} helperText="How does the source condition influence, reinforce, constrain or interact with the target condition?" rows={3} />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">Effect on CBD
            <select aria-describedby="xi-effect-help" className="block w-full mt-1 border rounded-lg p-2 bg-white" value={draft.effectOnCbd} onChange={event => update({ effectOnCbd: event.target.value as Interdependency['effectOnCbd'] })}>{CBD_EFFECTS.map(value => <option key={value}>{value}</option>)}</select>
            <span id="xi-effect-help" className="block mt-1 text-xs font-normal text-slate-500">Implication for CBD, not a judgement of whether the underlying condition is positive or negative.</span>
          </label>
          <label className="text-sm font-semibold text-slate-700">Planning Significance
            <select aria-describedby="xi-significance-help" className="block w-full mt-1 border rounded-lg p-2 bg-white" value={draft.planningSignificance} onChange={event => update({ planningSignificance: event.target.value as Interdependency['planningSignificance'] })}>{PLANNING_SIGNIFICANCE.map(value => <option key={value}>{value}</option>)}</select>
            <span id="xi-significance-help" className="block mt-1 text-xs font-normal text-slate-500">How significant is this interaction for CBD planning decisions? No numeric score is calculated.</span>
          </label>
        </div>
        <TextArea label="CBD Implication" value={draft.cbdImplication} onChange={event => update({ cbdImplication: event.target.value })} helperText="What does this relationship mean for the design, prioritization, sequencing or implementation of CBD? Strongly encouraged; a draft may be saved without it." rows={3} />
        <div className="text-xs text-slate-600 space-y-2">
          <p>A · Source finding evidence: {resolveInterdependencyFinding(data, draft.sourceFindingId)?.finding.evidenceNotes?.map(note => note.sourceTitle).join('; ') || 'None recorded'}</p>
          <p>B · Target finding evidence: {resolveInterdependencyFinding(data, draft.targetFindingId)?.finding.evidenceNotes?.map(note => note.sourceTitle).join('; ') || 'None recorded'}</p>
        </div>
        <fieldset className="border rounded-lg p-3 space-y-2">
          <legend className="text-sm font-semibold">C · Supporting evidence for this relationship (optional)</legend>
          <p className="text-xs text-slate-500">Select existing evidence only where it supports the relationship itself. Underlying finding evidence is not automatically relationship evidence.</p>
          {existingEvidence(data).map(note => <label key={note.id} className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={draft.evidenceIds.includes(note.id)} onChange={event => update({ evidenceIds: event.target.checked ? [...draft.evidenceIds, note.id] : draft.evidenceIds.filter(id => id !== note.id) })} />{note.sourceTitle}</label>)}
          {existingEvidence(data).length === 0 && <p className="text-xs text-slate-500">No evidence notes recorded yet. A relationship may still record professional judgement.</p>}
        </fieldset>
        <TextArea label="Analytical / Verification Note" value={draft.analyticalNote} onChange={event => update({ analyticalNote: event.target.value })} rows={2} />
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={draft.isKeyInsight} onChange={event => update({ isKeyInsight: event.target.checked, includeInMainBrief: event.target.checked && draft.includeInMainBrief })} />Key Interdependency — explicit professional-judgement selection</label>
        <label className="flex gap-2 text-sm"><input type="checkbox" disabled={!draft.isKeyInsight} checked={draft.includeInMainBrief} onChange={event => update({ includeInMainBrief: event.target.checked })} />Include in main Planning Brief (up to five active valid key insights)</label>
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        <div className="flex flex-wrap gap-2"><Button type="button" onClick={save}>Save relationship</Button><Button type="button" variant="outline" onClick={() => { onDraftChange(null); setError(null); }}>Cancel</Button></div>
      </div>}
      {pair && <div className="flex flex-wrap items-center gap-2 text-sm"><span>Showing {pair.split(':').map(dimensionName).join(' → ')}</span><Button type="button" variant="ghost" onClick={() => setPair(null)}>Clear map filter</Button></div>}
      <div className="space-y-3" aria-label="Recorded interdependencies">
        {filtered.map(item => <article key={item.id} className="min-w-0 break-words rounded-lg border border-slate-200 p-4 space-y-2">
          <h4 className="font-semibold">{item.reference}{item.isKeyInsight ? ' · Key insight' : ''}{item.includeInMainBrief ? ' · Main brief selected' : ''}</h4>
          <p className="text-sm text-slate-600">{findingLabel(item.sourceFindingId)} → {findingLabel(item.targetFindingId)}</p>
          <p className="text-sm whitespace-pre-wrap">{item.relationship}</p>
          <p className="text-xs text-slate-500">Effect on CBD: {item.effectOnCbd} · Planning significance: {item.planningSignificance}</p>
          <p className="text-sm whitespace-pre-wrap"><strong>CBD implication:</strong> {item.cbdImplication || 'Not recorded — consider why this interaction matters for planning.'}</p>
          {interdependencyIssues(data, item).map(issue => <p key={issue} className="text-sm text-amber-800">{issue} Excluded from map, Stage 4 sources and main brief until repaired.</p>)}
          <div className="flex gap-2"><Button type="button" variant="outline" size="sm" aria-label={`Edit ${item.reference}`} onClick={() => { onDraftChange(item); setError(null); }}>Edit / relink</Button><Button type="button" variant="ghost" size="sm" aria-label={`Delete ${item.reference}`} onClick={() => { if (window.confirm(`Delete ${item.reference}? Its SWOT source links will be removed; written SWOT analysis will be preserved.`)) { onChange(items.filter(other => other.id !== item.id)); if (draft?.id === item.id) onDraftChange(null); } }}>Delete</Button></div>
        </article>)}
        {filtered.length === 0 && <p className="text-sm text-slate-500">No relationships recorded{pair ? ' for this direction' : ''}. This analysis is optional; you can continue without it.</p>}
      </div>
      <details className="rounded-lg border border-slate-200 p-3">
        <summary className="cursor-pointer font-semibold text-sm focus-visible:outline-2 focus-visible:outline-blue-600">PESTEL-S Interdependency Map · Cross-Impact View</summary>
        <p className="text-xs text-slate-500 my-3">FROM ↓ / TO → · Counts of recorded finding-to-finding relationships, not scores or causal strength. Select a populated direction to filter the cards.</p>
        <table className="hidden md:table w-full table-fixed text-[10px] text-center">
          <thead><tr><th scope="col">FROM / TO</th>{PESTELS_KEYS.map(key => <th key={key} scope="col" className="p-1 break-words">{dimensionName(key)}</th>)}</tr></thead>
          <tbody>{PESTELS_KEYS.map(from => <tr key={from}><th scope="row" className="p-1 break-words">{dimensionName(from)}</th>{PESTELS_KEYS.map(to => { const count = map.find(item => item.from === from && item.to === to)?.relationships.length ?? 0; return <td key={to} className="border border-slate-200 p-1">{from === to ? <span aria-label="Not applicable">N/A</span> : count ? <button type="button" aria-label={`${dimensionName(from)} to ${dimensionName(to)}: ${count} relationships`} onClick={() => setPair(`${from}:${to}`)} className="w-full rounded bg-blue-50 p-2 font-semibold text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600">{count}</button> : '0'}</td>; })}</tr>)}</tbody>
        </table>
        <div className="md:hidden space-y-2">{map.filter(item => item.relationships.length).map(item => <Button key={`${item.from}:${item.to}`} type="button" variant="outline" fullWidth onClick={() => setPair(`${item.from}:${item.to}`)}>{dimensionName(item.from)} → {dimensionName(item.to)} · {item.relationships.length} relationships</Button>)}{!map.some(item => item.relationships.length) && <p className="text-sm">No valid recorded relationships.</p>}</div>
      </details>
    </div>}
  </section>;
}
