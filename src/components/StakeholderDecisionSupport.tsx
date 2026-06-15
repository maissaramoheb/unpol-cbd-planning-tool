import React, { useMemo, useState } from 'react';
import type { Stakeholder, StakeholderPosition } from '../types';
import {
  analyzeStakeholders,
  STAKEHOLDER_RATINGS_CAVEAT,
  type CredibilityQuadrantId,
  type EngagementQuadrantId,
  type StakeholderQuadrant
} from '../lib/stakeholderAnalysis';
import { Badge } from '../ui/Badge';
import {
  AlertTriangle,
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  Scale,
  ShieldCheck,
  Users
} from 'lucide-react';

interface StakeholderDecisionSupportProps {
  stakeholders: Stakeholder[];
}

type QuadrantId = EngagementQuadrantId | CredibilityQuadrantId;

const QUADRANT_TONES: Record<QuadrantId, string> = {
  'high-influence-resistance': 'border-rose-200 bg-rose-50/45',
  'high-influence-allies': 'border-emerald-200 bg-emerald-50/45',
  monitor: 'border-slate-200 bg-slate-50/70',
  'support-base': 'border-blue-200 bg-blue-50/45',
  'legitimacy-voices': 'border-violet-200 bg-violet-50/45',
  'core-partners': 'border-blue-200 bg-blue-50/45',
  'lower-priority-monitoring': 'border-slate-200 bg-slate-50/70',
  'operationally-sensitive': 'border-amber-200 bg-amber-50/50'
};

const POSTURE_STYLES: Record<StakeholderPosition, string> = {
  Enabler: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  Persuadable: 'border-blue-300 bg-blue-50 text-blue-900',
  Blocker: 'border-amber-300 bg-amber-50 text-amber-950',
  'Spoiler risk': 'border-rose-300 bg-rose-50 text-rose-950',
  'Neutral / unknown': 'border-slate-300 bg-white text-slate-800'
};

const POSTURE_DOTS: Record<StakeholderPosition, string> = {
  Enabler: 'bg-emerald-600',
  Persuadable: 'bg-blue-600',
  Blocker: 'bg-amber-600',
  'Spoiler risk': 'bg-rose-600',
  'Neutral / unknown': 'bg-slate-500'
};

interface StakeholderChipProps {
  stakeholder: Stakeholder;
  selected: boolean;
  onSelect: (id: string) => void;
}

const StakeholderChip: React.FC<StakeholderChipProps> = ({
  stakeholder,
  selected,
  onSelect
}) => (
  <button
    type="button"
    onClick={() => onSelect(stakeholder.id)}
    aria-pressed={selected}
    aria-label={`Select ${stakeholder.name}. Posture ${stakeholder.position}; influence ${stakeholder.influence}; legitimacy ${stakeholder.legitimacy}; operational relevance ${stakeholder.relevance}.`}
    className={`inline-flex max-w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[11px] font-semibold leading-tight shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
      POSTURE_STYLES[stakeholder.position]
    } ${selected ? 'ring-2 ring-blue-600 ring-offset-1' : 'hover:border-slate-500'}`}
  >
    <span
      aria-hidden="true"
      className={`h-2 w-2 shrink-0 rounded-full ${POSTURE_DOTS[stakeholder.position]}`}
    />
    <span className="truncate">{stakeholder.name}</span>
  </button>
);

interface QuadrantCardProps<TId extends QuadrantId> {
  quadrant: StakeholderQuadrant<TId>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const QuadrantCard = <TId extends QuadrantId>({
  quadrant,
  selectedId,
  onSelect
}: QuadrantCardProps<TId>) => (
  <section
    aria-labelledby={`${quadrant.id}-title`}
    className={`flex min-h-[230px] flex-col rounded-xl border p-4 ${QUADRANT_TONES[quadrant.id]}`}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <h6 id={`${quadrant.id}-title`} className="text-sm font-extrabold leading-snug text-slate-950">
          {quadrant.title}
        </h6>
        <p className="mt-1 text-xs leading-relaxed text-slate-650">{quadrant.meaning}</p>
      </div>
      <span className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white px-2 text-xs font-black text-slate-800 shadow-sm">
        {quadrant.stakeholders.length}
      </span>
    </div>

    <div className="mt-3 flex flex-1 flex-wrap content-start gap-2">
      {quadrant.stakeholders.length === 0 ? (
        <span className="text-xs italic text-slate-500">No stakeholders currently classified here.</span>
      ) : (
        quadrant.stakeholders.map((stakeholder) => (
          <StakeholderChip
            key={stakeholder.id}
            stakeholder={stakeholder}
            selected={stakeholder.id === selectedId}
            onSelect={onSelect}
          />
        ))
      )}
    </div>

    <div className="mt-4 border-t border-slate-300/60 pt-3 text-xs leading-relaxed">
      <p className="text-slate-800">
        <strong>Recommended posture:</strong> {quadrant.recommendation}
      </p>
      <p className="mt-1 text-slate-600">
        <strong>Review caveat:</strong> {quadrant.caveat}
      </p>
    </div>
  </section>
);

interface QuadrantMatrixProps<TId extends QuadrantId> {
  title: string;
  description: string;
  xAxis: string;
  yAxis: string;
  quadrants: StakeholderQuadrant<TId>[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const QuadrantMatrix = <TId extends QuadrantId>({
  title,
  description,
  xAxis,
  yAxis,
  quadrants,
  selectedId,
  onSelect
}: QuadrantMatrixProps<TId>) => (
  <section aria-labelledby={`${title.replaceAll(' ', '-').toLowerCase()}-title`} className="flex flex-col gap-3">
    <div>
      <h5
        id={`${title.replaceAll(' ', '-').toLowerCase()}-title`}
        className="text-base font-extrabold text-slate-950"
      >
        {title}
      </h5>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">{description}</p>
      <p className="mt-2 text-xs font-semibold text-slate-700">
        <span className="mr-3">Horizontal: {xAxis}</span>
        <span>Vertical: {yAxis}</span>
      </p>
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {quadrants.map((quadrant) => (
        <QuadrantCard
          key={quadrant.id}
          quadrant={quadrant}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  </section>
);

const InsightList: React.FC<{
  title: string;
  stakeholders: Stakeholder[];
  icon: React.ReactNode;
  emptyText: string;
}> = ({ title, stakeholders, icon, emptyText }) => (
  <div className="rounded-xl bg-white p-3.5 shadow-sm ring-1 ring-slate-200">
    <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
      <span className="text-blue-600">{icon}</span>
      {title}
      <span className="ml-auto text-xs font-black text-slate-500">{stakeholders.length}</span>
    </div>
    <p className="mt-2 text-xs leading-relaxed text-slate-600">
      {stakeholders.length > 0
        ? stakeholders.map((stakeholder) => stakeholder.name).join(', ')
        : emptyText}
    </p>
  </div>
);

export const StakeholderDecisionSupport: React.FC<StakeholderDecisionSupportProps> = ({
  stakeholders
}) => {
  const analysis = useMemo(() => analyzeStakeholders(stakeholders), [stakeholders]);
  const [selectedId, setSelectedId] = useState<string | null>(stakeholders[0]?.id ?? null);
  const selectedStakeholder =
    stakeholders.find((stakeholder) => stakeholder.id === selectedId) ?? null;

  if (stakeholders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <Users className="mx-auto text-slate-400" size={28} />
        <h5 className="mt-3 text-sm font-bold text-slate-800">No stakeholders mapped</h5>
        <p className="mt-1 text-xs text-slate-500">
          Add stakeholders and complete their ratings to generate decision-support quadrants.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 shrink-0 text-blue-700" size={18} />
          <div>
            <h5 className="text-sm font-extrabold text-slate-950">What this tells us</h5>
            <p className="mt-1 text-xs leading-relaxed text-slate-700">
              The matrices translate current analyst ratings into engagement priorities. Select an actor in either matrix to review its assumptions, risk note, and recorded engagement approach.
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-blue-200/70 pt-3 text-[11px] font-semibold text-slate-700">
          {(
            [
              ['Enabler', 'Supportive / enabling'],
              ['Persuadable', 'Potentially supportive'],
              ['Blocker', 'Resistance / constraint'],
              ['Spoiler risk', 'Elevated engagement risk'],
              ['Neutral / unknown', 'Posture requires verification']
            ] as const
          ).map(([position, label]) => (
            <span key={position} className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className={`h-2 w-2 rounded-full ${POSTURE_DOTS[position]}`} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <QuadrantMatrix
          title="Stakeholder Engagement Matrix"
          description="Prioritizes how UNPOL planners may engage actors based on their influence and current support posture."
          xAxis="Resistant / uncertain → supportive"
          yAxis="Lower influence → high influence"
          quadrants={analysis.engagementQuadrants}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        <QuadrantMatrix
          title="Operational Credibility Map"
          description="Balances operational relevance with legitimacy and accountability value to identify suitable safeguards and consultation channels."
          xAxis="Lower → higher operational relevance"
          yAxis="Lower → higher legitimacy / accountability"
          quadrants={analysis.credibilityQuadrants}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      <div aria-live="polite" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {selectedStakeholder ? (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="text-xs font-bold text-blue-700">Selected stakeholder</span>
                <h5 className="mt-0.5 text-base font-extrabold text-slate-950">
                  {selectedStakeholder.name}
                </h5>
                <p className="mt-1 text-xs text-slate-600">
                  {selectedStakeholder.category} · {selectedStakeholder.position}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="slate">Influence: {selectedStakeholder.influence}</Badge>
                <Badge variant="slate">Legitimacy: {selectedStakeholder.legitimacy}</Badge>
                <Badge variant="slate">Relevance: {selectedStakeholder.relevance}</Badge>
                <Badge variant="slate">Capacity: {selectedStakeholder.capacity}</Badge>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-xs font-bold text-slate-800">Strategic role</span>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{selectedStakeholder.role}</p>
              </div>
              <div className="rounded-lg bg-rose-50/60 p-3">
                <span className="text-xs font-bold text-rose-900">Risk / review issue</span>
                <p className="mt-1 text-xs leading-relaxed text-rose-800">{selectedStakeholder.risk}</p>
              </div>
              <div className="rounded-lg bg-blue-50/60 p-3">
                <span className="text-xs font-bold text-blue-950">Recorded engagement approach</span>
                <p className="mt-1 text-xs leading-relaxed text-blue-900">{selectedStakeholder.engagement}</p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-xs text-slate-500">Select a stakeholder to review its analytical details.</p>
        )}
      </div>

      <section aria-labelledby="stakeholder-insights-title">
        <div className="mb-3">
          <h5 id="stakeholder-insights-title" className="text-base font-extrabold text-slate-950">
            Recommended engagement posture
          </h5>
          <p className="mt-1 text-xs text-slate-600">
            Derived from current ratings and intended to support review, not replace analyst judgment.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <InsightList
            title="Priority engagement risks"
            stakeholders={analysis.insights.priorityRisks}
            icon={<AlertTriangle size={16} />}
            emptyText="No elevated engagement risks currently derived."
          />
          <InsightList
            title="Leadership-level engagement"
            stakeholders={analysis.insights.leadershipLevel}
            icon={<BriefcaseBusiness size={16} />}
            emptyText="No high-influence actors currently recorded."
          />
          <InsightList
            title="Technical working groups"
            stakeholders={analysis.insights.technicalWorkingGroups}
            icon={<CheckCircle2 size={16} />}
            emptyText="No actors currently meet the suggested working-group criteria."
          />
          <InsightList
            title="Legitimacy consultation"
            stakeholders={analysis.insights.legitimacyConsultation}
            icon={<Scale size={16} />}
            emptyText="No high-legitimacy actors currently recorded."
          />
          <InsightList
            title="Monitoring only"
            stakeholders={analysis.insights.monitoringOnly}
            icon={<Eye size={16} />}
            emptyText="No actors currently fall into both lower-priority categories."
          />
        </div>
      </section>

      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
        <strong>Analytical caveat:</strong> {STAKEHOLDER_RATINGS_CAVEAT}
      </p>
    </div>
  );
};
