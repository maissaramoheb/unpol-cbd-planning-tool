import React from 'react';
import { ArrowLeft, FileText, Flag, Users } from 'lucide-react';
import type { CbdCell, UnpolProjectData } from '../types';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { StageGuide } from './Guidance';

interface ResultsImplementationProps {
  data: UnpolProjectData;
  onPrev: () => void;
  onExport: () => void;
}

function hasRecordedImplementationData(cell: CbdCell): boolean {
  return Boolean(
    cell.capacityProblem.trim() ||
    cell.planningObjective.trim() ||
    cell.individual.trim() ||
    cell.organizational.trim() ||
    cell.environment.trim() ||
    cell.leadStakeholderId ||
    cell.supportingStakeholderIds.length ||
    cell.implementationPhase ||
    cell.milestoneTimeframe.trim() ||
    cell.indicators.some(Boolean) ||
    cell.risks.trim()
  );
}

const RecordedValue = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <dt className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</dt>
    <dd className="mt-1 text-xs leading-relaxed text-slate-700">{value?.trim() || 'Not recorded.'}</dd>
  </div>
);

export const ResultsImplementation: React.FC<ResultsImplementationProps> = ({ data, onPrev, onExport }) => {
  const stakeholderNames = new Map(data.stakeholders.map(stakeholder => [stakeholder.id, stakeholder.name]));
  const priorities = Object.entries(data.customCells).filter(([, cell]) => hasRecordedImplementationData(cell));

  return (
    <div className="flex flex-col gap-6">
      <StageGuide stage={7} />

      <header>
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">Stage 7 · Results &amp; Delivery</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Results &amp; Implementation</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">Review the implementation information already recorded for each configured CBD priority. This view consolidates existing planning data; it does not add a Theory of Change, Logframe or M&amp;E methodology.</p>
      </header>

      <Card className="border-blue-100 bg-blue-50/30">
        <CardHeader className="border-b border-blue-100 pb-3">
          <h3 className="flex items-center gap-2 text-sm font-black text-slate-950"><Flag size={16} className="text-blue-700" />Currently recorded</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">Objectives, intervention packages, responsibilities, timing, indicators and implementation conditions entered in the CBD Priorities stage.</p>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          {priorities.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm font-bold text-slate-800">No configured CBD priorities to summarize.</p>
              <p className="mt-1 text-xs text-slate-500">Record a capacity problem or implementation detail in Stage 5, then return here to review it.</p>
            </div>
          ) : priorities.map(([key, cell]) => {
            const [area, lens] = key.split('|');
            const lead = cell.leadStakeholderId ? stakeholderNames.get(cell.leadStakeholderId) : null;
            const supporters = cell.supportingStakeholderIds.map(id => stakeholderNames.get(id)).filter(Boolean).join(', ');
            const interventionPackage = [cell.individual, cell.organizational, cell.environment].filter(value => value.trim()).join(' · ');
            return (
              <article key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-start sm:justify-between">
                  <div><h3 className="text-sm font-black text-slate-950">{area}</h3><p className="mt-0.5 text-[11px] font-semibold text-slate-500">Analytical lens: {lens}</p></div>
                  <span className="w-fit rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-800">{cell.implementationPhase || 'Phase not recorded'}</span>
                </div>
                <dl className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <RecordedValue label="Planning objective" value={cell.planningObjective} />
                  <RecordedValue label="Intervention package" value={interventionPackage} />
                  <RecordedValue label="Lead actor" value={lead} />
                  <RecordedValue label="Supporting actors" value={supporters} />
                  <RecordedValue label="Milestone / timeframe" value={cell.milestoneTimeframe} />
                  <RecordedValue label="Indicators" value={cell.indicators.filter(Boolean).join('; ')} />
                  <RecordedValue label="Risks / implementation conditions" value={cell.risks} />
                </dl>
              </article>
            );
          })}
        </CardBody>
      </Card>

      <aside className="rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-600">
        <p className="flex items-center gap-2 font-black uppercase tracking-wider text-slate-800"><Users size={15} className="text-slate-500" />Future results-planning capability</p>
        <p className="mt-2">Deeper results chains, baselines and targets, assumptions and dependencies, resources, sustainability, ownership validation and M&amp;E remain future methodology. They are not represented or inferred in this version.</p>
      </aside>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={onPrev}><ArrowLeft size={15} className="mr-2" />Back: Prioritization &amp; Sequencing</Button>
        <Button onClick={onExport}>Open Planning Brief<FileText size={15} className="ml-2" /></Button>
      </div>
    </div>
  );
};
