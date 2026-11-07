'use client';

import React, { useId, useState } from 'react';
import { ChevronDown, CircleHelp } from 'lucide-react';
import {
  getStageGuidanceSessionKey,
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

export const StageLead: React.FC<StageLeadProps> = ({
  stage,
  purpose,
  children,
  className = ''
}) => {
  const contentId = useId();
  const content = STAGE_GUIDANCE[stage];
  const workflowStep = WORKFLOW_STAGES.find((s) => s.id === stage);
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = window.sessionStorage.getItem(getStageGuidanceSessionKey(stage));
      return stored === 'false' || stored === 'expanded';
    } catch {
      return false;
    }
  });

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    try {
      if (next) {
        window.sessionStorage.setItem(getStageGuidanceSessionKey(stage), 'false');
      } else {
        window.sessionStorage.setItem(getStageGuidanceSessionKey(stage), 'true');
      }
    } catch {
      // Guidance remains usable when session storage is unavailable.
    }
  };

  const displayPurpose = purpose || content.doing;

  return (
    <header className={`print:hidden pb-4 border-b border-border-default ${className}`}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-mono tabular-nums text-xs font-semibold text-action-link bg-status-info-bg/70 px-2 py-0.5 rounded border border-status-info-border/60">
            Stage 0{stage}
          </span>
          <span className="text-border-strong text-xs" aria-hidden="true">·</span>
          <span className="text-xs font-medium text-text-muted">
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

      <div className="mt-3">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={isOpen}
          aria-controls={contentId}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-action-link hover:text-action-link-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-md px-2.5 py-1 bg-surface-subtle border border-border-default hover:bg-surface-hover shadow-2xs transition-all duration-150"
        >
          <CircleHelp size={14} className="shrink-0" />
          <span>Methodology &amp; Guidance</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-150 motion-reduce:transition-none ${
              isOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <div
            id={contentId}
            className="mt-3 grid gap-4 rounded-xl border border-border-default bg-surface-raised border-s-4 border-s-action-primary p-4 md:grid-cols-3 text-xs leading-relaxed shadow-xs"
          >
            <div className="space-y-1">
              <h4 className="font-semibold text-action-link text-xs">
                What are we doing here?
              </h4>
              <p className="text-text-secondary">{content.doing}</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-text-primary text-xs">
                Why does this matter?
              </h4>
              <p className="text-text-secondary">{content.why}</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-text-primary text-xs">
                What comes next?
              </h4>
              <p className="text-text-secondary">{content.next}</p>
            </div>
          </div>
        )}
      </div>

      {children && <div className="mt-3">{children}</div>}
    </header>
  );
};
