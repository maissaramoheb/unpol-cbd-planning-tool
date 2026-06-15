import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, BookOpen, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface HeaderProps {
  onReset: () => void;
  missionName?: string;
  analystName?: string;
}

export const Header: React.FC<HeaderProps> = ({ onReset, missionName, analystName }) => {
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Title / Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white font-bold flex items-center justify-center">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-md sm:text-lg font-extrabold tracking-tight">
              UNPOL CBD <span className="text-blue-400">Integrated Planning Tool</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider hidden sm:block">
              Educational & Planning-Support Framework
            </p>
          </div>
        </div>

        {/* Status / Actions */}
        <div className="flex items-center gap-3">
          {missionName && (
            <div className="hidden md:flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-xs text-slate-300">
              <User size={12} className="text-blue-400" />
              <span>{missionName} {analystName ? `(${analystName})` : ''}</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDisclaimerOpen(true)}
            className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <ShieldAlert size={16} className="mr-1.5 text-amber-400" />
            <span className="hidden sm:inline">Disclaimer</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
            title="Reset current planning module to defaults"
          >
            <RefreshCw size={16} className="mr-1.5" />
            <span className="hidden sm:inline">Reset Module</span>
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
            <strong>Data Privacy & Classification:</strong> This application runs entirely client-side in your browser. No data is sent to external servers. Custom configurations are stored locally in your browser storage. Do not enter sensitive, classified, or restricted host-state security or mission details into public web deployments of this tool.
          </p>
          <p>
            <strong>Version History:</strong> Version 0.1 — Planning Support Prototype. Developed by <strong>Lt.Col Maissara Selim</strong> to visualize capacity-building prioritization.
          </p>
        </div>
      </Modal>
    </header>
  );
};
