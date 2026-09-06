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
      ? 'Workspace output · Planning Brief'
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
      className="w-full bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm p-3 sm:p-4"
    >
      <div className="mb-3 flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="truncate text-xs font-bold text-slate-200">{caption}</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => onViewChange(HOME_VIEW)} aria-current={currentView === HOME_VIEW ? 'page' : undefined} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${currentView === HOME_VIEW ? 'border-blue-400 bg-blue-600 text-white' : 'border-slate-700 text-slate-200 hover:bg-slate-800'}`}><Home size={13} />Home</button>
          <button type="button" onClick={() => onViewChange(EXPORT_VIEW)} aria-current={currentView === EXPORT_VIEW ? 'page' : undefined} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${currentView === EXPORT_VIEW ? 'border-blue-400 bg-blue-600 text-white' : 'border-slate-700 text-slate-200 hover:bg-slate-800'}`}><FileText size={13} />Export</button>
        </div>
      </div>

      <div ref={stepperRef} className="overflow-x-auto pb-1 [scrollbar-width:thin]">
        <div className="relative grid min-w-[910px] grid-cols-7 gap-1.5 lg:min-w-0">
          <div aria-hidden="true" className="absolute left-[7%] right-[7%] top-[17px] h-px bg-slate-700" />
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
                className={`relative z-10 flex min-w-0 flex-col items-center rounded-xl border px-2 pb-2.5 pt-1.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                  isActive
                    ? 'border-blue-400 bg-blue-600 text-white shadow-sm shadow-blue-950/40'
                    : isCompleted
                      ? 'border-slate-700 bg-slate-900 text-slate-100 hover:border-emerald-700 hover:bg-slate-800'
                      : 'border-transparent bg-slate-900 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-black ${
                  isActive
                    ? 'border-blue-200 bg-blue-700 text-white'
                    : isCompleted
                      ? 'border-emerald-700 bg-emerald-950 text-emerald-300'
                      : 'border-slate-600 bg-slate-800 text-slate-300'
                }`}>{step.id}</span>
                <span className="mt-2 w-full text-[10px] font-black uppercase leading-tight tracking-[0.04em] lg:text-[11px]">{step.label}</span>
                <span className={`mt-1 hidden w-full text-[9px] font-semibold leading-tight xl:block ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>{step.sub}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
export default ModuleTabs;
