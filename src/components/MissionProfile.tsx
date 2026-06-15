import React from 'react';
import { MissionProfile as ProfileType } from '../types';
import { defaultMissionTemplates } from '../data/defaultMissionTemplates';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { TextInput } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Shield, BookOpen, Layers, Award, FileText, Globe } from 'lucide-react';

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
    <div className="flex flex-col gap-6 w-full">
      {/* Intro Banner */}
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardBody className="p-6 md:p-8 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="blue" className="bg-blue-900 text-blue-100 border-blue-800">v0.3.0</Badge>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Visual Workspace & Mission Explorer Upgrade</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black uppercase text-blue-400 tracking-tight mt-1.5">
              UNPOL Capacity-Building & Development (CBD) Integrated Planning Tool
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
              This application helps UNPOL Advisory Teams, Security Sector Reform (SSR) specialists, and peace operations planning officers diagnose host-state environmental constraints, map critical stakeholders, and prioritize capacity-building interventions across key operational dimensions. It is an educational planning-support framework and does **not** constitute official United Nations doctrine.
            </p>
          </div>

          {/* Workflow Stepper */}
          <div className="mt-2 pt-4 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Recommended Planning Workflow</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 text-xs text-slate-300">
              <div><span className="text-blue-400 font-bold block mb-0.5">1. Profile Setup</span> Select a template or start blank to define the host-state context parameters.</div>
              <div><span className="text-blue-400 font-bold block mb-0.5">2. PESTEL-S Diagnosis</span> Assess and rate 7 categories of environmental challenges affecting policing.</div>
              <div><span className="text-blue-400 font-bold block mb-0.5">3. Actor Assessment</span> Define and map enablers, blockers, and spoilers, rating their reform posture.</div>
              <div><span className="text-blue-400 font-bold block mb-0.5">4. CBD Matrix Grid</span> Map intersections across 5 Key Areas and 6 Dimensions to configure targeted actions.</div>
              <div><span className="text-blue-400 font-bold block mb-0.5">5. Sequencing Priorities</span> Formulate Quick Wins, sensitive reforms, and long-term sequencing pathways.</div>
              <div><span className="text-blue-400 font-bold block mb-0.5">6. Brief & Export</span> Export clean Markdown reports, print PDF-ready briefs, or backup JSON configs.</div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selector Card */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-950">1. Context Template</h3>
            <p className="text-sm text-slate-500 mt-1">
              Choose a baseline configuration template. Selecting a template will preload matching planning assumptions and PESTEL-S findings.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={onOpenExplorer}
            className="w-full py-2.5 font-bold flex items-center justify-center gap-1.5 text-xs text-blue-600 border-blue-200 bg-blue-50/20 hover:bg-blue-50/40 rounded-xl"
          >
            <Globe size={14} className="text-blue-500" />
            Browse Mission Explorer Map
          </Button>

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
    </div>
  );
};
