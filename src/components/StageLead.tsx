'use client';

import React, { useId, useState } from 'react';
import { ChevronDown, CircleHelp } from 'lucide-react';
import {
  getStageGuidanceSessionKey,
  isStageGuidanceCollapsed,
  STAGE_GUIDANCE,
  type GuidanceStage
} from '../lib/guidance';
import { WORKFLOW_STAGES } from '../lib/workflow';

interface StageLeadProps {
  stage: GuidanceStage;
  purpose?: string;
  children?: React.ReactNode;
  className?: string;
}

const STAGE_PURPOSES: Record<GuidanceStage, string> = {
  1: 'Define the operational context, mandate parameters, counterpart institutions, and planning timeframe for the capacity-building exercise.',
  2: 'Assess environmental factors impacting host-state policing. Examine conditions and evidence to shape CBD priorities.',
  3: 'Map critical host-state, mission, civil society, and international actors by authority, influence, legitimacy, and reform posture to assess institutional ownership.',
  4: 'Synthesize diagnostic findings and stakeholder dynamics into structured SWOT findings and actionable TOWS strategic options.',
  5: 'Define capacity problems, intended results, and institutional intervention packages across the CBD Matrix Key Areas and Cross-Cutting Analytical Lenses.',
  6: 'Review indicative heuristic rankings, apply professional judgement, and record sequencing groups and priorities into implementation phases.',
  7: 'Structure delivery logic, operational indicators, detailed activities, dependencies, resource requirements, and national ownership conditions for configured priorities.'
};

export const StageLead: React.FC<StageLeadProps> = ({
  stage,
  purpose,
  children,
  className = ''
}) => {
  const contentId = useId();
  const content = STAGE_GUIDANCE[stage];
  const workflowStep = WORKFLOW_STAGES.find((s) => s.id === stage);
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

  const displayPurpose = purpose || STAGE_PURPOSES[stage] || content.doing;

  return (
    <header className={`print:hidden pb-3.5 border-b border-border-default ${className}`}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-mono tabular-nums text-xs font-bold uppercase tracking-wider text-action-primary">
            Stage 0{stage}
          </span>
          <span className="text-text-muted" aria-hidden="true">·</span>
          <span className="text-xs font-semibold text-text-muted">
            {workflowStep?.sub || content.title}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
          {workflowStep?.label || content.title}
        </h2>
        <p className="mt-0.5 text-xs sm:text-sm leading-relaxed text-text-secondary max-w-4xl">
          {displayPurpose}
        </p>
      </div>

      <div className="mt-2">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={!isCollapsed}
          aria-controls={contentId}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-action-primary hover:text-action-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1 rounded py-0.5 transition-colors"
        >
          <CircleHelp size={14} className="shrink-0" />
          <span>Methodology &amp; Guidance</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-150 motion-reduce:transition-none ${
              !isCollapsed ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {!isCollapsed && (
          <div
            id={contentId}
            className="mt-2.5 grid gap-3 rounded-md border border-border-default bg-surface-subtle p-3.5 md:grid-cols-3 text-xs leading-relaxed"
          >
            <div>
              <h4 className="font-bold text-action-primary uppercase tracking-wider text-[11px]">
                What are we doing here?
              </h4>
              <p className="mt-1 text-text-secondary">{content.doing}</p>
            </div>
            <div>
              <h4 className="font-bold text-action-primary uppercase tracking-wider text-[11px]">
                Why does it matter?
              </h4>
              <p className="mt-1 text-text-secondary">{content.why}</p>
            </div>
            <div>
              <h4 className="font-bold text-action-primary uppercase tracking-wider text-[11px]">
                What will this feed into next?
              </h4>
              <p className="mt-1 text-text-secondary">{content.next}</p>
            </div>
          </div>
        )}
      </div>

      {children && <div className="mt-3">{children}</div>}
    </header>
  );
};

export default StageLead;
