import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, BookOpen, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { APP_VERSION_LABEL } from '../lib/version';

interface HeaderProps {
  onReset: () => void;
  missionName?: string;
  analystName?: string;
}

export const Header: React.FC<HeaderProps> = ({ onReset, missionName, analystName }) => {
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Title / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="bg-action-primary p-1.5 rounded-md text-white flex items-center justify-center shrink-0">
            <BookOpen size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white">
                UNPOL CBD <span className="text-blue-400 font-semibold">Planning Tool</span>
              </h1>
              <span className="hidden md:inline-flex items-center rounded border border-slate-700 bg-slate-800 px-1.5 py-0.2 text-[11px] font-medium text-slate-400">
                Prototype
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Integrated Capacity-Building & Development Planning Framework
            </p>
          </div>
        </div>

        {/* Status / Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {missionName && (
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-md text-xs text-slate-300">
              <User size={13} className="text-blue-400 shrink-0" />
              <span className="truncate max-w-[200px]">{missionName} {analystName ? `(${analystName})` : ''}</span>
            </div>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsDisclaimerOpen(true)}
            aria-label="Open disclaimer and rules of use"
            className="border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 h-8 text-xs"
          >
            <ShieldAlert size={14} className="mr-1.5 text-amber-400" />
            <span className="hidden sm:inline">Disclaimer</span>
          </Button>

          <Button
            variant="tertiary"
            size="sm"
            onClick={onReset}
            aria-label="Reset entire planning workspace to blank slate"
            className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 text-xs"
            title="Reset entire planning workspace to blank slate"
          >
            <RefreshCw size={14} className="mr-1.5" />
            <span className="hidden sm:inline">Reset Workspace</span>
          </Button>
        </div>
      </div>

      {/* Disclaimer Modal */}
      <Modal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
        title="Disclaimer & Rules of Use"
        footer={
          <Button onClick={() => setIsDisclaimerOpen(false)} variant="primary">
            I Understand
          </Button>
        }
      >
        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-amber-800 flex items-start gap-3">
            <ShieldAlert size={24} className="shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold text-sm mb-1">Planning Support Disclaimer</p>
              <p>This tool is an educational and planning-support prototype. It is not official United Nations doctrine and does not replace mission mandate, official guidance, host-state law, human rights due diligence, command approval, or verified country analysis. Users should verify all context-specific findings through official and current sources before operational or policy use.</p>
            </div>
          </div>

          <p>
            <strong>Data Privacy & Classification:</strong> Planning workspace content is processed in the browser and stored in browser storage; export/import operations are local file actions. Public hosting and the existing deployment analytics may process request or usage metadata. Do not enter sensitive, classified, or restricted host-state security or mission details into this tool.
          </p>
          <p>
            <strong>Current version:</strong> {APP_VERSION_LABEL}. Developed by <strong>Lt.Col Maissara Selim</strong> to visualize capacity-building prioritization.
          </p>
        </div>
      </Modal>
    </header>
  );
};
