import React from 'react';
import { MissionProfile as ProfileType } from '../types';
import { defaultMissionTemplates } from '../data/defaultMissionTemplates';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { TextInput } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { Shield, BookOpen, Layers, Award, FileText, Globe, Compass } from 'lucide-react';
import { resolvePlanningContext } from '../lib/planningContext';
import { StageLead } from './StageLead';
import { NextStepCue } from './Guidance';
import { NEXT_STEP_CUES } from '../lib/guidance';

interface MissionProfileProps {
  profile: ProfileType;
  onChange: (profile: ProfileType) => void;
  onTemplateChange: (templateId: string) => void;
  onOpenExplorer: () => void;
  onNext: () => void;
}

export const MissionProfile: React.FC<MissionProfileProps> = ({
  profile,
  onChange,
  onTemplateChange,
  onOpenExplorer,
  onNext
}) => {
  const handleInputChange = (field: keyof ProfileType, value: string) => {
    onChange({
      ...profile,
      [field]: value
    });
  };

  const getTemplateIcon = (id: string) => {
    switch (id) {
      case 'peacekeeping':
        return <Shield size={16} className="text-action-primary" />;
      case 'spm':
        return <BookOpen size={16} className="text-action-primary" />;
      case 'ssr':
        return <Layers size={16} className="text-action-primary" />;
      case 'reform':
        return <Award size={16} className="text-action-primary" />;
      case 'capacity':
        return <FileText size={16} className="text-action-primary" />;
      default:
        return <Shield size={16} className="text-text-muted" />;
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      <StageLead stage={1} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Template Selector Column */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Baseline Configuration Templates
            </h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Preloads editable planning prompts, assumptions to verify, and initial PESTEL-S diagnostic starter questions.
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={onOpenExplorer}
            fullWidth
            size="sm"
            className="gap-1.5"
          >
            <Globe size={14} className="text-action-primary" />
            Browse Mission Explorer Map
          </Button>

          <div className="rounded-lg border border-border-strong bg-surface-raised overflow-hidden">
            <div className="divide-y divide-border-default">
              {defaultMissionTemplates.map((template) => {
                const isSelected = profile.templateId === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => onTemplateChange(template.id)}
                    className={`
                      text-left p-3.5 transition-colors duration-150 motion-reduce:transition-none flex items-start gap-3 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-inset
                      ${isSelected
                        ? 'bg-blue-50/70 border-l-2 border-l-action-primary'
                        : 'hover:bg-surface-subtle bg-surface-raised'
                      }
                    `}
                  >
                    <div className="shrink-0 mt-0.5 text-action-primary">
                      {getTemplateIcon(template.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <h4 className={`text-xs font-semibold leading-tight ${isSelected ? 'text-action-primary font-bold' : 'text-text-primary'}`}>
                          {template.name}
                        </h4>
                        {isSelected && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-action-primary bg-blue-100/70 px-1.5 py-0.5 rounded shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                        {template.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Planning Context Guidance Card */}
          {resolvePlanningContext(profile.templateId) && (() => {
            const ctx = resolvePlanningContext(profile.templateId)!;
            const guidance = ctx.planningPrompts.stage1Guidance;
            return (
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Compass size={14} className="text-blue-700 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider text-blue-950">
                      Context Guidance
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-white border border-blue-200 px-1.5 py-0.5 rounded">
                    {ctx.identity.missionAcronym || ctx.identity.countryArea}
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  Active planning context for <strong>{ctx.identity.countryArea}</strong> ({ctx.identity.missionType}).
                </p>
                {guidance.mandateEnvironmentPrompt && (
                  <div className="text-[11px] text-slate-600 bg-white/85 p-2 rounded-lg border border-blue-100 italic">
                    <strong>Investigation cue:</strong> &ldquo;{guidance.mandateEnvironmentPrompt}&rdquo;
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-blue-100 text-[10px] text-slate-500">
                  <span>{ctx.provenance.sources.length} document source(s)</span>
                  <button
                    type="button"
                    onClick={onOpenExplorer}
                    className="font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                  >
                    View in Explorer
                  </button>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Form Fields Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-bold text-text-primary">Country / Mission Profile Editor</h3>
              <p className="text-xs text-text-muted mt-0.5">Define core parameters used across the assessment workflow and custom export planning brief.</p>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  label="Country / Area of Operations"
                  value={profile.countryName}
                  onChange={(e) => handleInputChange('countryName', e.target.value)}
                  placeholder="e.g. South Sudan / Abyei Area"
                />
                <TextInput
                  label="UN Mission Name"
                  value={profile.missionName}
                  onChange={(e) => handleInputChange('missionName', e.target.value)}
                  placeholder="e.g. UNISFA"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  label="Region / Sectors Covered"
                  value={profile.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  placeholder="e.g. Sector North & Sector South"
                />
                <TextInput
                  label="Host-State Police Force"
                  value={profile.hostStatePolice}
                  onChange={(e) => handleInputChange('hostStatePolice', e.target.value)}
                  placeholder="e.g. Abyei Police Service (APS)"
                />
              </div>

              <TextArea
                label="Planning Purpose"
                value={profile.planningPurpose}
                onChange={(e) => handleInputChange('planningPurpose', e.target.value)}
                placeholder="Describe what the assessment aims to achieve (e.g. Align UNPOL co-location advisory with central police headquarters restructuring; sequence training support)..."
                rows={2}
              />

              <TextArea
                label="Mandate Environment & Authorities"
                value={profile.mandateEnvironment}
                onChange={(e) => handleInputChange('mandateEnvironment', e.target.value)}
                placeholder="Detail the governing UN resolutions or advisory boundaries (e.g. UN Security Council Resolution mandate, Chapter VII authorities, non-executive training & mentorship limitations)..."
                rows={2}
              />

              <TextArea
                label="Conflict Context / Threat Backdrop"
                value={profile.conflictContext}
                onChange={(e) => handleInputChange('conflictContext', e.target.value)}
                placeholder="List key security threats and factors (e.g. Dispersed armed groups, seasonal inter-communal migration flashpoints, high crime indices in municipal centers)..."
                rows={2}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <TextInput
                  label="Analyst / Advisory Team"
                  value={profile.analystName}
                  onChange={(e) => handleInputChange('analystName', e.target.value)}
                  placeholder="Participant / Team"
                />
                <TextInput
                  label="Assessment Date"
                  type="date"
                  value={profile.assessmentDate}
                  onChange={(e) => handleInputChange('assessmentDate', e.target.value)}
                />
              </div>

              <NextStepCue {...NEXT_STEP_CUES[1]} />
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <Button variant="primary" onClick={onNext} className="w-full sm:w-auto">
                  Next: Diagnostic Analysis
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
