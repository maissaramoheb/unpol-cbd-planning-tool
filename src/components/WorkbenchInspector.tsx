import React, { createContext, useContext, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { PanelRightOpen, X } from 'lucide-react';
import type { UnpolProjectData } from '../types';
import { buildTraceabilityIndex, getEntity, traceKey, type InspectorEntityRef, type TraceabilityIndex } from '../lib/traceability';
import { WORKFLOW_STAGES, type WorkflowStage } from '../lib/workflow';
import { Button } from '../ui/Button';
import { useDialogA11y } from '../ui/useDialogA11y';

const InspectorContext = createContext<((ref: InspectorEntityRef) => void) | null>(null);
const desktopQuery = '(min-width: 1440px)';
const subscribeWidth = (notify: () => void) => {
  const media = window.matchMedia(desktopQuery);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
};
const desktopSnapshot = () => window.matchMedia(desktopQuery).matches;
const serverSnapshot = () => false;
const tabs = ['Overview', 'Evidence', 'Connections'] as const;
type InspectorTab = (typeof tabs)[number];

export function InspectButton({ entityRef, label }: { entityRef: InspectorEntityRef; label: string }) {
  const open = useContext(InspectorContext);
  if (!open) return null;
  return <Button variant="tertiary" size="sm" onClick={() => open(entityRef)} aria-label={`Inspect ${label}`} className="print:hidden shrink-0"><PanelRightOpen size={14} />Inspect</Button>;
}

/** Inspector selection and derived data stay outside the persisted project. */
export function WorkbenchRegion({ data, onNavigate, children }: { data: UnpolProjectData; onNavigate: (stage: WorkflowStage) => void; children: React.ReactNode }) {
  const [selected, setSelected] = useState<InspectorEntityRef | null>(null);
  const index = useMemo(() => buildTraceabilityIndex(data), [data]);
  return <InspectorContext.Provider value={setSelected}>
    <div className={`min-w-0 ${selected ? 'min-[1440px]:grid min-[1440px]:grid-cols-[minmax(0,1fr)_352px] min-[1440px]:gap-5 print:block' : ''}`}>
      <div className="min-w-0">{children}</div>
      {selected && <WorkbenchInspector index={index} selected={selected} onInspect={setSelected} onClose={() => setSelected(null)} onNavigate={stage => { setSelected(null); onNavigate(stage); }} />}
    </div>
  </InspectorContext.Provider>;
}

function WorkbenchInspector({ index, selected, onClose, onNavigate }: {
  index: TraceabilityIndex; selected: InspectorEntityRef; onInspect: (ref: InspectorEntityRef) => void; onClose: () => void; onNavigate: (stage: WorkflowStage) => void;
}) {
  const desktop = useSyncExternalStore(subscribeWidth, desktopSnapshot, serverSnapshot);
  const [tab, setTab] = useState<InspectorTab>('Overview');
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeCallback = useRef(onClose);
  useEffect(() => { closeCallback.current = onClose; }, [onClose]);
  const entity = getEntity(index, selected);

  // A portalled sheet leaves every app surface inert while preserving prior state.
  useEffect(() => {
    if (desktop) return;
    const siblings = Array.from(document.body.children).filter((element): element is HTMLElement => element instanceof HTMLElement && element !== overlayRef.current);
    const previous = siblings.map(element => element.inert);
    siblings.forEach(element => { element.inert = true; });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      siblings.forEach((element, position) => { element.inert = previous[position]; });
      document.body.style.overflow = overflow;
    };
  }, [desktop]);
  useDialogA11y({ isOpen: !desktop, onClose, containerRef: panelRef, initialFocusRef: closeRef });
  useEffect(() => {
    if (!desktop) return;
    const previous = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => closeRef.current?.focus(), 0);
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') closeCallback.current(); };
    window.addEventListener('keydown', escape);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', escape);
      if (previous?.isConnected) previous.focus();
    };
  }, [desktop]);
  const previousKey = useRef(traceKey(selected));
  useEffect(() => {
    if (previousKey.current === traceKey(selected)) return;
    previousKey.current = traceKey(selected);
    titleRef.current?.focus();
  }, [selected]);

  const content = <div ref={panelRef} role={desktop ? 'complementary' : 'dialog'} aria-modal={desktop ? undefined : true} aria-labelledby={`${id}-title`}
    className={`print:hidden flex flex-col min-w-0 border border-border-strong bg-surface-overlay text-text-primary shadow-overlay overflow-hidden ${desktop ? 'sticky top-20 self-start rounded-lg max-h-[calc(100dvh-6rem)]' : 'h-dvh w-full sm:w-[380px] max-w-full'}`}>
    <div className="shrink-0 border-b border-border-default p-4 flex items-start justify-between gap-3">
      <div className="min-w-0"><p className="text-xs text-text-muted font-semibold">Analytical Inspector</p><h2 ref={titleRef} tabIndex={-1} id={`${id}-title`} className="mt-1 text-sm font-bold break-words focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">{entity ? `${entity.reference ? `${entity.reference} · ` : ''}${entity.title}` : 'Item unavailable'}</h2></div>
      <Button ref={closeRef} variant="quiet" size="icon" aria-label="Close Analytical Inspector" onClick={onClose}><X size={18} /></Button>
    </div>
    <div role="tablist" aria-label="Inspector views" className="shrink-0 flex border-b border-border-default p-2 gap-1">
      {tabs.map((name, position) => <Button key={name} role="tab" id={`${id}-tab-${name}`} aria-controls={`${id}-panel-${name}`} aria-selected={tab === name} tabIndex={tab === name ? 0 : -1} selected={tab === name} variant="tertiary" size="sm" className="flex-1" onClick={() => setTab(name)} onKeyDown={event => {
        const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
        let next: number | undefined;
        if (event.key === 'ArrowRight') next = (position + (rtl ? 2 : 1)) % 3;
        if (event.key === 'ArrowLeft') next = (position + (rtl ? 1 : 2)) % 3;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = 2;
        if (next !== undefined) { event.preventDefault(); setTab(tabs[next]); document.getElementById(`${id}-tab-${tabs[next]}`)?.focus(); }
      }}>{name}</Button>)}
    </div>
    <div className="min-h-0 overflow-y-auto flex-1 p-4 text-sm space-y-4 overscroll-contain">
      {tabs.map(name => <div key={name} role="tabpanel" id={`${id}-panel-${name}`} aria-labelledby={`${id}-tab-${name}`} hidden={tab !== name} tabIndex={0} className="space-y-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
        {!entity ? <p className="text-text-muted">This item is no longer available. Close the Inspector or select another recorded item.</p> : name === 'Overview' ? <>
          <p className="text-xs text-text-muted">{entity.typeLabel} · Stage {entity.stage}</p>
          {entity.ref.type !== 'evidence' && <p className="text-xs text-text-muted">Recorded analyst judgement and planning context.</p>}
          <dl className="space-y-4">{entity.details.map(field => <div key={field.label}><dt className="text-xs font-semibold text-text-secondary">{field.label}</dt><dd dir="auto" className="mt-1 whitespace-pre-wrap break-words text-text-primary">{field.value || 'Not recorded'}</dd></div>)}</dl>
        </> : name === 'Evidence' ? <p className="text-text-muted">No recorded evidence connection</p> : <p className="text-text-muted">No recorded connection</p>}
      </div>)}
    </div>
    {entity && <div className="shrink-0 border-t border-border-default bg-surface-subtle p-3"><Button variant="secondary" fullWidth onClick={() => onNavigate(entity.stage)}>Open in Stage {entity.stage}</Button><p className="mt-2 text-xs text-text-muted">{WORKFLOW_STAGES.find(stage => stage.id === entity.stage)?.label} · Edit in the stage workspace.</p></div>}
  </div>;
  if (desktop) return content;
  return createPortal(<div ref={overlayRef} className="print:hidden fixed inset-0 z-50 flex justify-end bg-surface-scrim">{content}</div>, document.body);
}
