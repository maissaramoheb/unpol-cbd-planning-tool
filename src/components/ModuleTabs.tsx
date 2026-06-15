import React from 'react';
import { Shield, Compass, Users, Grid, ListTodo, FileText } from 'lucide-react';

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
    { id: 1, label: 'Profile', sub: 'Context setup', icon: <Shield size={16} /> },
    { id: 2, label: 'PESTEL-S', sub: 'Environment', icon: <Compass size={16} /> },
    { id: 3, label: 'Actors', sub: 'Stakeholders', icon: <Users size={16} /> },
    { id: 4, label: 'CBD Matrix', sub: 'Priorities', icon: <Grid size={16} /> },
    { id: 5, label: 'Sequencing', sub: 'Priority setting', icon: <ListTodo size={16} /> },
    { id: 6, label: 'Export', sub: 'Planning brief', icon: <FileText size={16} /> }
  ];

  return (
    <div className="w-full bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm p-4 overflow-x-auto">
      <div className="min-w-[700px] flex items-center justify-between gap-2">
        {steps.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Stepper Node */}
              <button
                type="button"
                onClick={() => onStepChange(step.id)}
                className={`
                  flex items-center gap-2.5 text-left transition-all px-3 py-2 rounded-xl focus:outline-none shrink-0
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
  );
};
export default ModuleTabs;
