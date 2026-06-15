import React from 'react';
import { MissionProfile as ProfileType } from '../types';
import { defaultMissionTemplates } from '../data/defaultMissionTemplates';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { TextInput } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { Shield, BookOpen, Layers, Award, FileText } from 'lucide-react';

interface MissionProfileProps {
  profile: ProfileType;
  onChange: (profile: ProfileType) => void;
  onTemplateChange: (templateId: string) => void;
  onNext: () => void;
}

export const MissionProfile: React.FC<MissionProfileProps> = ({
  profile,
  onChange,
  onTemplateChange,
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
        return <Shield size={18} className="text-blue-600" />;
      case 'spm':
        return <BookOpen size={18} className="text-indigo-600" />;
      case 'ssr':
        return <Layers size={18} className="text-emerald-600" />;
      case 'reform':
        return <Award size={18} className="text-amber-600" />;
      case 'capacity':
        return <FileText size={18} className="text-teal-600" />;
      default:
        return <Shield size={18} className="text-slate-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Template Selector Card */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950">1. Context Template</h3>
          <p className="text-sm text-slate-500 mt-1">
            Choose a baseline configuration template. Selecting a template will preload matching planning assumptions and PESTEL-S findings.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {defaultMissionTemplates.map((template) => {
            const isSelected = profile.templateId === template.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onTemplateChange(template.id)}
                className={`
                  text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 w-full focus:outline-none
                  ${isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                  }
                `}
              >
                <div className={`p-2 rounded-lg bg-white border border-slate-200 shadow-sm mt-0.5`}>
                  {getTemplateIcon(template.id)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{template.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {template.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Fields Card */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <h3 className="text-base font-bold text-slate-950">Country / Mission Profile Editor</h3>
            <p className="text-xs text-slate-500 mt-0.5">Define core parameters used across the assessment workflow and custom export planning brief.</p>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Country / Area of Operations"
                value={profile.countryName}
                onChange={(e) => handleInputChange('countryName', e.target.value)}
                placeholder="e.g. South Sudan / Abyei Box"
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
              placeholder="e.g. Establish structural alignment of UNPOL co-location mentorship..."
              rows={2}
            />

            <TextArea
              label="Mandate Environment & Authorities"
              value={profile.mandateEnvironment}
              onChange={(e) => handleInputChange('mandateEnvironment', e.target.value)}
              placeholder="e.g. Chapter VII authority, Protection of Civilians, capacity building advice..."
              rows={2}
            />

            <TextArea
              label="Conflict Context / Threat Backdrop"
              value={profile.conflictContext}
              onChange={(e) => handleInputChange('conflictContext', e.target.value)}
              placeholder="e.g. High small-arms proliferation, seasonal migration skirmishes..."
              rows={2}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <TextInput
                label="Analyst / Advisory Team"
                value={profile.analystName}
                onChange={(e) => handleInputChange('analystName', e.target.value)}
                placeholder="e.g. Lt.Col Maissara Selim"
              />
              <TextInput
                label="Assessment Date"
                type="date"
                value={profile.assessmentDate}
                onChange={(e) => handleInputChange('assessmentDate', e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
              <Button variant="primary" onClick={onNext} className="w-full sm:w-auto">
                Next: Situational Analysis
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
