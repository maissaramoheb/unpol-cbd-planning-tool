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
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-800 flex items-start gap-2.5">
            <ShieldAlert size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Important Notice for Operations</p>
              <p className="text-xs mt-0.5">This application is entirely client-side. No data is sent to external servers. All custom planning configurations remain in your browser storage.</p>
            </div>
          </div>

          <p>
            <strong>1. Educational Framework:</strong> This tool is developed for training support and educational visualization of the UNPOL Capacity-Building and Development (CBD) Guidelines. It is not official United Nations doctrine, operational command directive, or formal policy.
          </p>
          <p>
            <strong>2. Vetting and Mandates:</strong> Using this framework does not replace the requirement for formal Human Rights Due Diligence Policy (HRDDP) reviews, host-state legal assessments, or mission command review.
          </p>
          <p>
            <strong>3. Validation:</strong> All pre-loaded templates contain generic planning guidance and placeholder assertions. Country and mission analysis must be verified by qualified intelligence officers and planning advisors using current, verified operational sources.
          </p>
          <p>
            <strong>4. Data Classification:</strong> Do not enter sensitive, classified, or restricted host-state security or mission details into public web deployments of this tool.
          </p>
        </div>
      </Modal>
    </header>
  );
};
