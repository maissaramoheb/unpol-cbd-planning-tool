import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, BookOpen, Globe2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { APP_VERSION_LABEL } from '../lib/version';
import { ThemeControl } from '../ui/ThemeControl';

interface HeaderProps {
  onReset: () => void;
  missionName?: string;
  analystName?: string;
  countryName?: string;
  templateId?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  missionName,
  analystName,
  countryName,
  templateId
}) => {
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  const isFictionalDemo =
    templateId === 'peacekeeping' ||
    templateId === 'fictional-carana-demo' ||
    countryName?.toLowerCase().includes('carana');

  const contextTitle = countryName || missionName || 'UN Mission Planning Context';

  return (
    <header className="sticky top-0 z-40 w-full bg-surface-base/95 backdrop-blur-md border-b border-border-default text-text-primary shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Title / Logo - Restored Original Product Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-action-primary p-2 rounded-lg text-text-inverse flex items-center justify-center shrink-0 shadow-xs ring-1 ring-border-default/40">
            <BookOpen size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-text-primary">
                UNPOL CBD <span className="text-action-link font-semibold">Planning Tool</span>
              </span>
            </div>
            <p className="text-xs text-text-muted hidden sm:block font-normal">
              Integrated Capacity-Building &amp; Development Planning Framework
            </p>
          </div>
        </div>

        {/* Center: Mission Context Presentation (Balanced, Uncramped, High Clarity) */}
        {(missionName || countryName) && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-default bg-surface-subtle/80 shadow-2xs text-xs">
            <Globe2 size={14} className="text-action-link shrink-0" />
            <div className="flex items-center gap-1.5 max-w-[340px] xl:max-w-[460px]">
              <span className="font-semibold text-text-primary truncate">{contextTitle}</span>
              {analystName && (
                <span className="text-text-muted text-[11px] shrink-0">({analystName})</span>
              )}
            </div>
            <span
              className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                isFictionalDemo
                  ? 'bg-status-warning-bg text-status-warning border-status-warning-border'
                  : 'bg-status-info-bg text-action-link border-status-info-border'
              }`}
            >
              {isFictionalDemo ? 'Training Scenario' : 'Planning Context'}
            </span>
          </div>
        )}

        {/* Status / Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeControl />

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsDisclaimerOpen(true)}
            aria-label="Open disclaimer and rules of use"
            className="h-8 text-xs font-medium shadow-2xs"
          >
            <ShieldAlert size={14} className="sm:me-1.5 text-status-warning shrink-0" />
            <span className="hidden sm:inline">Disclaimer</span>
          </Button>

          <Button
            variant="tertiary"
            size="sm"
            onClick={onReset}
            aria-label="Reset entire planning workspace to blank slate"
            className="h-8 text-xs font-medium"
            title="Reset entire planning workspace to blank slate"
          >
            <RefreshCw size={14} className="sm:me-1.5 shrink-0" />
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
        <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
          <div className="bg-status-warning-bg border border-status-warning-border p-4 rounded-lg text-status-warning flex items-start gap-3">
            <ShieldAlert size={24} className="shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold text-sm mb-1">Planning Support Disclaimer</p>
              <p>
                This tool is an educational and planning-support prototype. It is not official United
                Nations doctrine and does not replace mission mandate, official guidance, host-state
                law, human rights due diligence, command approval, or verified country analysis. Users
                should verify all context-specific findings through official and current sources before
                operational or policy use.
              </p>
            </div>
          </div>

          <p>
            <strong>Data Privacy &amp; Classification:</strong> Planning workspace content is processed
            in the browser and stored in browser storage; export/import operations are local file
            actions. Public hosting and the existing deployment analytics may process request or usage
            metadata. Do not enter sensitive, classified, or restricted host-state security or
            mission details into this tool.
          </p>
          <p>
            <strong>Current version:</strong> {APP_VERSION_LABEL}. Developed by{' '}
            <strong>Lt.Col Maissara Selim</strong> to visualize capacity-building prioritization.
          </p>
        </div>
      </Modal>
    </header>
  );
};
