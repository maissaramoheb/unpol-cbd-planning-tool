'use client';

import React, { useEffect, useRef } from 'react';
import { FileText, Home } from 'lucide-react';
import { EXPORT_VIEW, HOME_VIEW, isWorkflowStage, WORKFLOW_STAGES } from '../lib/workflow';

interface ModuleTabsProps {
  currentView: number;
  onViewChange: (view: number) => void;
}

export const ModuleTabs: React.FC<ModuleTabsProps> = ({
  currentView,
  onViewChange
}) => {
  const stepperRef = useRef<HTMLDivElement>(null);
  const activeStep = WORKFLOW_STAGES.find((step) => step.id === currentView);

  useEffect(() => {
    if (!activeStep) return;
    const container = stepperRef.current;
    const active = container?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!container || !active) return;
    container.scrollTo({ left: active.offsetLeft - (container.clientWidth - active.offsetWidth) / 2 });
  }, [activeStep]);

  return (
    <nav
      aria-label="Planning workflow"
      className="w-full bg-surface-raised border-b border-border-default px-2 sm:px-3"
    >
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 h-11 sm:h-12">
        {/* Home Utility */}
        <div className="shrink-0 flex items-center">
          <button
            type="button"
            onClick={() => onViewChange(HOME_VIEW)}
            aria-current={currentView === HOME_VIEW ? 'page' : undefined}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
              currentView === HOME_VIEW
                ? 'text-action-primary bg-blue-50/80 font-bold'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-subtle'
            }`}
          >
            <Home size={14} className="shrink-0" />
            <span>Home</span>
          </button>
        </div>

        {/* Divider between Utilities and Workflow Stages */}
        <div className="h-5 w-px bg-border-default shrink-0 mx-1" aria-hidden="true" />

        {/* Continuous Workflow Stages Track */}
        <div
          ref={stepperRef}
          className="flex-1 flex items-center gap-1 sm:gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1"
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
                className={`relative px-2 sm:px-2.5 py-1.5 flex items-center gap-1.5 shrink-0 rounded transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                  isActive
                    ? 'text-action-primary font-bold'
                    : isCompleted
                      ? 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle/70'
                      : 'text-text-muted hover:text-text-secondary hover:bg-surface-subtle/50'
                }`}
              >
                <span className={`font-mono tabular-nums text-xs ${
                  isActive
                    ? 'text-action-primary font-bold'
                    : isCompleted
                      ? 'text-text-primary font-semibold'
                      : 'text-text-muted'
                }`}>
                  0{step.id}
                </span>

                <span className="text-xs whitespace-nowrap">
                  {step.label}
                </span>

                {isCompleted && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600/80 shrink-0" aria-hidden="true" />
                )}

                {/* Active indicator line at bottom */}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-action-primary rounded-full"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Divider between Workflow Stages and Export */}
        <div className="h-5 w-px bg-border-default shrink-0 mx-1" aria-hidden="true" />

        {/* Export Utility */}
        <div className="shrink-0 flex items-center">
          <button
            type="button"
            onClick={() => onViewChange(EXPORT_VIEW)}
            aria-current={currentView === EXPORT_VIEW ? 'page' : undefined}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
              currentView === EXPORT_VIEW
                ? 'text-action-primary bg-blue-50/80 font-bold'
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
