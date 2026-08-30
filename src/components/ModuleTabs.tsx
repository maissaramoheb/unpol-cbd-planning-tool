import React from 'react';

interface ModuleTabsProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

interface StepItem {
  id: number;
  label: string;
  sub: string;
}

export const ModuleTabs: React.FC<ModuleTabsProps> = ({
  currentStep,
  onStepChange
}) => {
  const steps: StepItem[] = [
    { id: 1, label: 'Planning Overview', sub: 'Start page' },
    { id: 2, label: 'Profile', sub: 'Context' },
    { id: 3, label: 'PESTEL-S', sub: 'Context & Evidence' },
    { id: 4, label: 'Actors', sub: 'Stakeholders' },
    { id: 5, label: 'CBD Matrix', sub: 'Capacity Priorities' },
    { id: 6, label: 'Priority & Sequencing', sub: 'Implementation Path' },
    { id: 7, label: 'Export', sub: 'Planning Brief' }
  ];
  const activeStep = steps.find((step) => step.id === currentStep) ?? steps[0];

  return (
    <nav
      aria-label="Planning workflow"
      className="w-full bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm p-3 sm:p-4"
    >
      <div className="mb-3 flex min-w-0 items-baseline gap-1.5 px-1 text-xs">
        <span className="shrink-0 font-black text-blue-300">Step {activeStep.id} of {steps.length}</span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span className="truncate font-bold text-slate-200">{activeStep.sub}</span>
      </div>

      <div className="overflow-x-auto pb-1 [scrollbar-width:thin]">
        <div className="relative grid min-w-[910px] grid-cols-7 gap-1.5 lg:min-w-0">
          <div aria-hidden="true" className="absolute left-[7%] right-[7%] top-[17px] h-px bg-slate-700" />
          {steps.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepChange(step.id)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Step ${step.id}: ${step.label}, ${step.sub}`}
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
