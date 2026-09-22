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
  const caption = activeStep
    ? `Stage ${activeStep.id} of ${WORKFLOW_STAGES.length} · ${activeStep.sub}`
    : currentView === EXPORT_VIEW
      ? 'Workspace output · Professional Outputs'
      : 'Home · Planning Overview';

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
      className="w-full bg-surface-raised rounded-lg border border-border-default p-2.5 sm:p-3"
    >
      <div className="mb-2.5 flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="truncate text-xs font-semibold text-text-secondary">{caption}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onViewChange(HOME_VIEW)}
            aria-current={currentView === HOME_VIEW ? 'page' : undefined}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1 ${
              currentView === HOME_VIEW
                ? 'border-action-primary/40 bg-blue-50/80 text-action-primary font-bold'
                : 'border-border-default bg-surface-raised text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
            }`}
          >
            <Home size={13} />Home
          </button>
          <button
            type="button"
            onClick={() => onViewChange(EXPORT_VIEW)}
            aria-current={currentView === EXPORT_VIEW ? 'page' : undefined}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1 ${
              currentView === EXPORT_VIEW
                ? 'border-action-primary/40 bg-blue-50/80 text-action-primary font-bold'
                : 'border-border-default bg-surface-raised text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
            }`}
          >
            <FileText size={13} />Export
          </button>
        </div>
      </div>

      <div ref={stepperRef} className="overflow-x-auto pb-0.5 [scrollbar-width:thin]">
        <div className="grid min-w-[840px] grid-cols-7 gap-1.5 lg:min-w-0">
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
                className={`flex min-w-0 flex-col rounded-md border p-2 text-left transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1 ${
                  isActive
                    ? 'border-action-primary/40 bg-blue-50/80 text-action-primary font-semibold'
                    : isCompleted
                      ? 'border-border-default bg-surface-subtle text-text-primary hover:border-slate-300 hover:bg-slate-100/80'
                      : 'border-transparent bg-transparent text-text-muted hover:border-border-default hover:bg-surface-subtle hover:text-text-primary'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`font-mono tabular-nums text-xs font-bold ${
                    isActive ? 'text-action-primary' : isCompleted ? 'text-emerald-700' : 'text-text-muted'
                  }`}>
                    0{step.id}
                  </span>
                  {isCompleted && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" aria-hidden="true" />
                  )}
                </div>
                <span className={`mt-1 truncate text-xs leading-snug ${
                  isActive ? 'font-bold text-action-primary' : 'font-semibold text-text-primary'
                }`}>
                  {step.label}
                </span>
                <span className={`mt-0.5 hidden truncate text-[11px] leading-tight xl:block ${
                  isActive ? 'text-blue-900/80' : 'text-text-muted'
                }`}>
                  {step.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
export default ModuleTabs;
