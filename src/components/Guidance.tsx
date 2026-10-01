'use client';

import React, { useId, useState } from 'react';
import { ChevronDown, ChevronRight, CircleHelp, Lightbulb } from 'lucide-react';
import {
  getStageGuidanceSessionKey,
  isStageGuidanceCollapsed,
  STAGE_GUIDANCE,
  type GuidanceStage
} from '../lib/guidance';

export { StageLead } from './StageLead';

export const StageGuide: React.FC<{ stage: GuidanceStage }> = ({ stage }) => {
  const contentId = useId();
  const content = STAGE_GUIDANCE[stage];
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return isStageGuidanceCollapsed(window.sessionStorage.getItem(getStageGuidanceSessionKey(stage)));
    } catch {
      return false;
    }
  });

  const toggle = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      if (next) window.sessionStorage.setItem(getStageGuidanceSessionKey(stage), 'true');
      else window.sessionStorage.removeItem(getStageGuidanceSessionKey(stage));
    } catch {
      // Guidance remains usable when session storage is unavailable.
    }
  };

  return (
    <section className="print:hidden overflow-hidden rounded-xl border border-status-info-border bg-status-info-bg">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={!isCollapsed}
        aria-controls={contentId}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-bold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring transition-colors duration-150 motion-reduce:transition-none"
      >
        <span className="flex min-w-0 items-center gap-2"><CircleHelp size={17} className="shrink-0 text-action-link" />About this step <span className="hidden font-medium text-text-muted sm:inline">· {content.title}</span></span>
        {isCollapsed ? <ChevronRight size={17} aria-hidden="true" /> : <ChevronDown size={17} aria-hidden="true" />}
      </button>
      {!isCollapsed && (
        <div id={contentId} className="grid gap-3 border-t border-status-info-border px-4 py-4 md:grid-cols-3">
          <div><h4 className="text-[11px] font-black uppercase tracking-wider text-action-link">What are we doing here?</h4><p className="mt-1 text-xs leading-relaxed text-text-secondary">{content.doing}</p></div>
          <div><h4 className="text-[11px] font-black uppercase tracking-wider text-action-link">Why does it matter?</h4><p className="mt-1 text-xs leading-relaxed text-text-secondary">{content.why}</p></div>
          <div><h4 className="text-[11px] font-black uppercase tracking-wider text-action-link">What will this feed into next?</h4><p className="mt-1 text-xs leading-relaxed text-text-secondary">{content.next}</p></div>
        </div>
      )}
    </section>
  );
};

export const FieldGuidance: React.FC<{ help: string; example?: string }> = ({ help, example }) => {
  const contentId = useId();
  const [showExample, setShowExample] = useState(false);
  return (
    <div className="print:hidden text-xs leading-relaxed text-text-muted">
      <p>{help}</p>
      {example && (
        <>
          <button type="button" onClick={() => setShowExample(value => !value)} aria-expanded={showExample} aria-controls={contentId} className="mt-1 inline-flex items-center gap-1 font-bold text-action-link hover:text-action-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
            <Lightbulb size={13} aria-hidden="true" />CARANA example {showExample ? '−' : '+'}
          </button>
          {showExample && <p id={contentId} className="mt-2 rounded-lg border border-border-default bg-surface-subtle px-3 py-2 text-text-secondary"><strong className="text-text-secondary">Example only:</strong> {example}</p>}
        </>
      )}
    </div>
  );
};

export const NextStepCue: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <aside className="print:hidden rounded-xl border border-border-default bg-surface-base px-4 py-3">
    <p className="text-xs font-black uppercase tracking-wider text-action-link">{title}</p>
    <p className="mt-1 text-xs leading-relaxed text-text-secondary">{description}</p>
  </aside>
);
