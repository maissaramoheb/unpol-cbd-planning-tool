import React, { useEffect, useRef, useState } from 'react';
import type { ExecutiveBriefSelection, UnpolProjectData } from '../types';
import { buildExecutiveBriefModel, emptyExecutiveSelection, executiveCandidates, executiveRefKey, EXECUTIVE_FIT_MESSAGE, EXECUTIVE_LIMIT_MESSAGE } from '../lib/executiveBrief';
import { Button } from '../ui/Button';

export function ExecutiveBrief({ data, onChange, onDetailed }: { data: UnpolProjectData; onChange: (s: ExecutiveBriefSelection) => void; onDetailed: () => void }) {
  const [error, setError] = useState('');
  const [overflow, setOverflow] = useState(false);
  const page = useRef<HTMLElement>(null);
  const model = buildExecutiveBriefModel(data);
  const candidates = executiveCandidates(data);
  const selection = data.executiveBriefSelection ?? emptyExecutiveSelection();
  useEffect(() => {
    const element = page.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      // Only measure the physical-width preview, not the naturally stacked mobile view.
      setOverflow(element.offsetWidth >= 790 && element.scrollHeight > 1123);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const toggle = (group: 'capacityGapKeys' | 'evidenceIds' | 'interventions' | 'criticalItems' | 'immediateNextSteps', key: string) => {
    const refs = group !== 'capacityGapKeys' && group !== 'evidenceIds';
    const current = selection[group];
    const keys = refs ? (current as ExecutiveBriefSelection['interventions']).map(executiveRefKey) : current as string[];
    if (!keys.includes(key) && current.length >= 3) { setError(EXECUTIVE_LIMIT_MESSAGE); return; }
    const nextKeys = keys.includes(key) ? keys.filter(k => k !== key) : [...keys, key];
    const next = refs ? nextKeys.flatMap(k => candidates[group as 'interventions'].filter(c => c.key === k).map(c => c.reference!)) : nextKeys;
    onChange({ ...selection, [group]: next }); setError('');
  };
  const groups = [
    { key: 'capacityGapKeys', title: 'Priority Capacity Gaps', items: candidates.priorities },
    { key: 'evidenceIds', title: 'Evidence', items: candidates.evidence },
    { key: 'interventions', title: 'Selected Interventions', items: candidates.interventions },
    { key: 'criticalItems', title: 'Critical Risks / Assumptions', items: candidates.criticalItems },
    { key: 'immediateNextSteps', title: 'Immediate Next Steps', items: candidates.immediateNextSteps }
  ] as const;
  return <>
    <details className="rounded-lg border border-slate-300 bg-white p-4 print:hidden">
      <summary className="cursor-pointer font-semibold focus-visible:outline-2 focus-visible:outline-blue-600">Configure Executive Brief</summary>
      <p className="my-3 text-sm text-slate-600">Select existing planning records. Selections are shown in the order chosen; remove and reselect to change that order. Edit underlying text in the planning stages.</p>
      <label className="block text-sm font-semibold">Primary Problem
        <select className="mt-2 block w-full min-w-0 max-w-full rounded border p-2" value={selection.primaryPriorityKey ?? ''} onChange={e => onChange({ ...selection, primaryPriorityKey: e.target.value || null })}>
          <option value="">Primary management problem not selected</option>
          {candidates.priorities.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
      </label>
      <p className="mt-2 text-xs text-slate-500">Expected Result and Ownership use the primary priority. Consultation does not mean approval. NOW does not mean authorized or ready.</p>
      {groups.map(group => <fieldset className="mt-4 border-t pt-3" key={group.key}><legend className="font-semibold text-sm">{group.title} · {selection[group.key].length} / 3 selected</legend>
        {group.key === 'evidenceIds' && <p className="text-xs text-slate-500">Prefer evidence linked to the selected priorities and analysis. Other existing project evidence remains available; nothing is selected automatically.</p>}
        {group.items.length ? group.items.map(item => {
          const selected = selection[group.key].some(ref => typeof ref === 'string' ? ref === item.key : executiveRefKey(ref) === item.key);
          return <label key={item.key} className="my-2 flex items-start gap-2 text-sm break-words"><input type="checkbox" className="mt-1 shrink-0" checked={selected} onChange={() => toggle(group.key, item.key)} /><span><strong>{item.label}</strong>{'reference' in item && item.reference ? ` · ${item.reference.priorityKey.split('|').join(' × ')}` : ''}<br />{item.text}</span></label>;
        }) : <p className="text-sm text-slate-500">No eligible records yet.</p>}
      </fieldset>)}
      {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
    </details>
    {!!model.cautions.length && <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 print:hidden"><ul>{model.cautions.map(c => <li key={c}>{c}</li>)}</ul></div>}
    {overflow && !model.pageFit.exceedsPage && <p role="status" className="border border-amber-300 bg-amber-50 p-3 text-sm print:hidden">{EXECUTIVE_FIT_MESSAGE}</p>}
    <article ref={page} className="executive-brief" aria-label="Executive CBD Brief read-only preview">
      <div className="executive-heading"><h1>{model.title}</h1><p>{model.context}</p><p className="executive-meta">{model.date} · {model.status}</p></div>
      {model.sections.map(section => <section key={section.title} className={section.title === 'Management Problem' ? 'executive-problem' : ''}><h2>{section.title}</h2>{section.lines.map((line, i) => <p key={i}>{line}</p>)}</section>)}
      <p className="executive-notice">{model.notice}</p>
    </article>
    <div className="print:hidden"><Button variant="secondary" onClick={onDetailed}>Open Detailed Planning Brief</Button></div>
  </>;
}
