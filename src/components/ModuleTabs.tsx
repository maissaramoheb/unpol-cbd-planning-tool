'use client';

import React, { useEffect, useRef } from 'react';
import { FileText, Home } from 'lucide-react';
import { EXPORT_VIEW, HOME_VIEW, isWorkflowStage, WORKFLOW_STAGES } from '../lib/workflow';

interface ModuleTabsProps {
  currentView: number;
  onViewChange: (view: number) => void;
}

const SHORT_LABELS: Record<number, string> = {
  1: 'Context',
  2: 'Diagnostic',
  3: 'Stakeholders',
  4: 'Synthesis',
  5: 'CBD Priorities',
  6: 'Prioritization',
  7: 'Results & M&E'
};

export const ModuleTabs: React.FC<ModuleTabsProps> = ({
  currentView,
  onViewChange
}) => {
  const stepperRef = useRef<HTMLDivElement>(null);
  const activeStep = WORKFLOW_STAGES.find((step) => step.id === currentView);

  useEffect(() => {
    const container = stepperRef.current;
    if (!activeStep) {
      container?.scrollTo({ left: 0 });
      return;
    }
    const active = container?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!container || !active) return;
    const relativeLeft = active.getBoundingClientRect().left - container.getBoundingClientRect().left + container.scrollLeft;
    container.scrollTo({ left: relativeLeft - (container.clientWidth - active.offsetWidth) / 2 });
  }, [activeStep]);

  return (
    <nav
      aria-label="Planning workflow"
      className="w-full bg-surface-base rounded-xl border border-border-default shadow-xs px-2 py-1"
    >
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 h-11">
        {/* Home Utility */}
        <div className="shrink-0 flex items-center">
          <button
            type="button"
            onClick={() => onViewChange(HOME_VIEW)}
            aria-current={currentView === HOME_VIEW ? 'page' : undefined}
            title="Return to Planning Overview (Home)"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
              currentView === HOME_VIEW
                ? 'text-action-link bg-status-info-bg shadow-2xs border border-status-info-border/60'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-subtle'
            }`}
          >
            <Home size={14} className="shrink-0" />
            <span>Home</span>
          </button>
        </div>

        {/* Divider between Utilities and Workflow Stages */}
        <div className="h-5 w-px bg-border-default shrink-0 mx-0.5 opacity-70" aria-hidden="true" />

        {/* Continuous Workflow Stages Track - Dynamically Scaled to Fit Desktop */}
        <div
          ref={stepperRef}
          aria-label="Seven planning stages"
          className="flex-1 flex items-center justify-between gap-1 overflow-x-auto [scrollbar-width:none] py-1"
        >
          {WORKFLOW_STAGES.map((step) => {
            const isActive = step.id === currentView;
            const isCompleted = isWorkflowStage(currentView) && step.id < currentView;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onViewChange(step.id)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Stage ${step.id}: ${step.label}, ${step.sub}`}
                title={`Stage 0${step.id}: ${step.label} (${step.sub})`}
                className={`relative flex-1 min-w-[70px] px-1.5 sm:px-2 py-1.5 flex items-center justify-center gap-1.5 rounded-lg transition-all duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                  isActive
                    ? 'text-action-link bg-surface-active/80 font-bold shadow-2xs'
                    : isCompleted
                      ? 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle/80 font-medium'
                      : 'text-text-muted hover:text-text-secondary hover:bg-surface-subtle/60 font-medium'
                }`}
              >
                <span
                  className={`flex items-center justify-center font-mono tabular-nums text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors shrink-0 ${
                    isActive
                      ? 'bg-action-primary text-text-inverse shadow-xs'
                      : isCompleted
                        ? 'bg-status-success-bg text-status-success border border-status-success-border/60'
                        : 'bg-surface-subtle text-text-muted border border-border-default'
                  }`}
                >
                  0{step.id}
                </span>

                {/* Full label on wide screens, short label on medium/standard desktop, hidden on tiny screens */}
                <span className="hidden 2xl:inline text-xs truncate">
                  {step.label}
                </span>
                <span className="hidden sm:inline 2xl:hidden text-xs truncate">
                  {SHORT_LABELS[step.id] || step.label}
                </span>

                {isCompleted && (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-status-success shrink-0"
                    aria-hidden="true"
                  />
                )}

                {/* Active indicator line at bottom */}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-action-primary rounded-full shadow-xs"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Divider between Workflow Stages and Export */}
        <div className="h-5 w-px bg-border-default shrink-0 mx-0.5 opacity-70" aria-hidden="true" />

        {/* Export Utility */}
        <div className="shrink-0 flex items-center">
          <button
            type="button"
            onClick={() => onViewChange(EXPORT_VIEW)}
            aria-current={currentView === EXPORT_VIEW ? 'page' : undefined}
            title="Export Planning Briefs and Matrices"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
              currentView === EXPORT_VIEW
                ? 'text-action-link bg-status-info-bg shadow-2xs border border-status-info-border/60'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-subtle'
            }`}
          >
            <FileText size={14} className="shrink-0" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default ModuleTabs;
