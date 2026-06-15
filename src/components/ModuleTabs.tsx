import React from 'react';
import { Shield, Compass, Users, Grid, ListTodo, FileText, LayoutDashboard } from 'lucide-react';

interface ModuleTabsProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

interface StepItem {
  id: number;
  label: string;
  sub: string;
  icon: React.ReactNode;
}

export const ModuleTabs: React.FC<ModuleTabsProps> = ({
  currentStep,
  onStepChange
}) => {
  const steps: StepItem[] = [
    { id: 1, label: 'Dashboard', sub: 'Overview', icon: <LayoutDashboard size={16} /> },
    { id: 2, label: 'Profile', sub: 'Context setup', icon: <Shield size={16} /> },
    { id: 3, label: 'PESTEL-S', sub: 'Environment', icon: <Compass size={16} /> },
    { id: 4, label: 'Actors', sub: 'Stakeholders', icon: <Users size={16} /> },
    { id: 5, label: 'CBD Matrix', sub: 'Priorities', icon: <Grid size={16} /> },
    { id: 6, label: 'Sequencing', sub: 'Priority setting', icon: <ListTodo size={16} /> },
    { id: 7, label: 'Export', sub: 'Planning brief', icon: <FileText size={16} /> }
  ];
  const activeStep = steps.find((step) => step.id === currentStep) ?? steps[0];

  return (
    <nav
      aria-label="Planning workflow"
      className="w-full bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm p-3 sm:p-4"
    >
      <div className="sm:hidden">
        <div className="mb-3 rounded-xl border border-blue-500/50 bg-blue-600 px-3 py-2.5">
          <span className="text-[11px] font-bold text-blue-100">Step {activeStep.id} of {steps.length}</span>
          <div className="mt-0.5 flex items-center gap-2">
            {activeStep.icon}
            <span className="text-sm font-extrabold">{activeStep.label}</span>
            <span className="text-xs text-blue-100">· {activeStep.sub}</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {steps.map((step) => {
            const isActive = step.id === currentStep;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepChange(step.id)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Step ${step.id}: ${step.label}, ${step.sub}`}
                className={`flex min-w-0 flex-col items-center gap-1 rounded-lg border px-1.5 py-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                  isActive
                    ? 'border-blue-400 bg-blue-950 text-white'
                    : 'border-slate-700 bg-slate-850 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-xs font-black">{step.id}</span>
                <span className="w-full truncate text-[10px] font-bold">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <div className="flex min-w-[700px] items-center justify-between gap-2">
          {steps.map((step, idx) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <React.Fragment key={step.id}>
                {/* Stepper Node */}
                <button
                  type="button"
                  onClick={() => onStepChange(step.id)}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`Step ${step.id}: ${step.label}, ${step.sub}`}
                  className={`
                    flex items-center gap-2.5 text-left transition-colors px-3 py-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 shrink-0
                    ${isActive
                      ? 'bg-blue-600 border border-blue-500 text-white shadow shadow-blue-500/20'
                      : isCompleted
                        ? 'text-emerald-400 hover:bg-slate-800'
                        : 'text-slate-400 hover:bg-slate-800'
                    }
                  `}
                >
                  <div
                    className={`
                      w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-inner
                      ${isActive
                        ? 'bg-blue-700 text-white border border-blue-400'
                        : isCompleted
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-850 text-slate-400 border border-slate-700'
                      }
                    `}
                  >
                    {step.id}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-wider">{step.label}</h4>
                    <p className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5">{step.sub}</p>
                  </div>
                </button>

                {/* Stepper Connector Line */}
                {idx < steps.length - 1 && (
                  <div
                    className={`
                      h-0.5 flex-1 min-w-[20px] rounded-full
                      ${isCompleted ? 'bg-emerald-600' : 'bg-slate-800'}
                    `}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
export default ModuleTabs;
