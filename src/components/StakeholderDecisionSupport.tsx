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
  'high-influence-resistance': 'bg-rose-50/25',
  'high-influence-allies': 'bg-emerald-50/25',
  monitor: 'bg-amber-50/20',
  'support-base': 'bg-blue-50/20',
  'legitimacy-voices': 'bg-indigo-50/20',
  'core-partners': 'bg-blue-50/25',
  'lower-priority-monitoring': 'bg-surface-subtle/30',
  'operationally-sensitive': 'bg-amber-50/25'
};

const POSTURE_STYLES: Record<StakeholderPosition, string> = {
  Enabler: 'border-emerald-300 bg-emerald-50/70 text-emerald-900',
  Persuadable: 'border-blue-300 bg-blue-50/70 text-blue-900',
  Blocker: 'border-amber-300 bg-amber-50/70 text-amber-950',
  'Spoiler risk': 'border-rose-300 bg-rose-50/70 text-rose-950',
  'Neutral / unknown': 'border-border-default bg-surface-raised text-text-default'
};

const POSTURE_DOTS: Record<StakeholderPosition, string> = {
  Enabler: 'bg-emerald-600',
  Persuadable: 'bg-institutional',
  Blocker: 'bg-amber-600',
  'Spoiler risk': 'bg-rose-600',
  'Neutral / unknown': 'bg-text-muted'
};

const getRatingBadgeVariant = (val?: string): 'blue' | 'amber' | 'slate' => {
  if (val === 'High') return 'blue';
  if (val === 'Medium') return 'amber';
  return 'slate';
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
    className={`inline-flex max-w-full items-center gap-1.5 rounded-md border px-2.5 py-1 text-left text-xs font-medium leading-tight transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
      POSTURE_STYLES[stakeholder.position]
    } ${selected ? 'ring-2 ring-institutional border-institutional font-semibold shadow-subtle' : 'hover:border-border-muted'}`}
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
  yLabel: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const QuadrantCard = <TId extends QuadrantId>({
  quadrant,
  yLabel,
  selectedId,
  onSelect
}: QuadrantCardProps<TId>) => (
  <section
    aria-labelledby={`${quadrant.id}-title`}
    className={`flex min-h-[220px] flex-col p-4 ${QUADRANT_TONES[quadrant.id]}`}
  >
    <div className="flex items-start justify-between gap-2.5">
      <div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted block mb-0.5">
          {yLabel}
        </span>
        <h6 id={`${quadrant.id}-title`} className="text-xs font-bold leading-snug text-text-default">
          {quadrant.title}
        </h6>
        <p className="mt-1 text-xs leading-relaxed text-text-muted">{quadrant.meaning}</p>
      </div>
      <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md border border-border-default bg-surface-card px-1.5 text-xs font-mono font-semibold text-text-secondary shadow-subtle">
        {quadrant.stakeholders.length}
      </span>
    </div>

    <div className="mt-3 flex flex-1 flex-wrap content-start gap-1.5">
      {quadrant.stakeholders.length === 0 ? (
        <span className="text-xs italic text-text-muted">No stakeholders currently classified here.</span>
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

    <div className="mt-3 border-t border-border-default pt-2.5 text-xs leading-relaxed text-text-muted flex flex-col gap-1">
      <p className="text-text-default">
        <strong className="font-semibold text-text-secondary">Posture:</strong> {quadrant.recommendation}
      </p>
      <p className="text-[11px] text-text-muted">
        <strong className="font-semibold text-text-secondary">Caveat:</strong> {quadrant.caveat}
      </p>
    </div>
  </section>
);

interface QuadrantMatrixProps<TId extends QuadrantId> {
  title: string;
  description: string;
  xAxis: string;
  yAxis: string;
  xLabels: [string, string]; // [left, right]
  yLabels: [string, string]; // [top, bottom]
  quadrants: StakeholderQuadrant<TId>[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const QuadrantMatrix = <TId extends QuadrantId>({
  title,
  description,
  xAxis,
  yAxis,
  xLabels,
  yLabels,
  quadrants,
  selectedId,
  onSelect
}: QuadrantMatrixProps<TId>) => {
  const getQuadrant = (idx: number) => quadrants[idx] ?? {
    id: `q-${idx}` as TId,
    title: 'Unassigned',
    meaning: '',
    recommendation: '',
    caveat: '',
    stakeholders: []
  };

  const topLeft = getQuadrant(0);
  const topRight = getQuadrant(1);
  const bottomLeft = getQuadrant(2);
  const bottomRight = getQuadrant(3);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h5 className="text-xs font-semibold uppercase tracking-wider text-text-default">
          {title}
        </h5>
        <p className="mt-0.5 text-xs text-text-muted">{description}</p>
      </div>

      {/* Outer Shell: Shared Boundary with 1px Hairline Grid */}
      <div className="rounded-lg border border-border-default bg-surface-card overflow-hidden shadow-subtle flex flex-col">
        {/* Horizontal Axis Header Bar */}
        <div className="border-b border-border-default bg-surface-subtle px-4 py-2 flex items-center justify-between text-[11px] font-mono font-medium text-text-muted">
          <span>&larr; {xLabels[0]}</span>
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">
            {xAxis}
          </span>
          <span>{xLabels[1]} &rarr;</span>
        </div>

        {/* 2x2 Analytical Grid with hairline dividers */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border-default">
          {/* Top Row: Left vs Right */}
          <div className="divide-y divide-border-default flex flex-col">
            <QuadrantCard
              quadrant={topLeft}
              yLabel={`${yLabels[0]} \u2191`}
              selectedId={selectedId}
              onSelect={onSelect}
            />
            <QuadrantCard
              quadrant={bottomLeft}
              yLabel={`${yLabels[1]} \u2193`}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          </div>

          <div className="divide-y divide-border-default flex flex-col">
            <QuadrantCard
              quadrant={topRight}
              yLabel={`${yLabels[0]} \u2191`}
              selectedId={selectedId}
              onSelect={onSelect}
            />
            <QuadrantCard
              quadrant={bottomRight}
              yLabel={`${yLabels[1]} \u2193`}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          </div>
        </div>

        {/* Vertical Axis Footer Note */}
        <div className="border-t border-border-default bg-surface-subtle px-4 py-1.5 text-[10px] font-mono text-text-muted text-center uppercase tracking-wider">
          Vertical Axis: {yAxis}
        </div>
      </div>
    </div>
  );
};

const InsightList: React.FC<{
  title: string;
  stakeholders: Stakeholder[];
  icon: React.ReactNode;
  iconColor?: string;
  badgeVariant?: 'rose' | 'blue' | 'green' | 'amber' | 'slate';
  emptyText: string;
}> = ({
  title,
  stakeholders,
  icon,
  iconColor = 'text-institutional',
  badgeVariant = 'slate',
  emptyText
}) => (
  <div className="rounded-lg bg-surface-card p-3.5 border border-border-default shadow-subtle">
    <div className="flex items-center gap-2 text-xs font-semibold text-text-default">
      <span className={iconColor}>{icon}</span>
      <span>{title}</span>
      <span className="ml-auto">
        <Badge variant={stakeholders.length > 0 ? badgeVariant : 'slate'}>
          {stakeholders.length}
        </Badge>
      </span>
    </div>
    <p className="mt-2 text-xs leading-relaxed text-text-muted">
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
      <div className="rounded-lg border border-dashed border-border-default bg-surface-subtle p-6 text-center">
        <Users className="mx-auto text-text-muted" size={28} />
        <h5 className="mt-3 text-xs font-semibold text-text-default uppercase tracking-wider">No stakeholders mapped</h5>
        <p className="mt-1 text-xs text-text-muted">
          Add stakeholders and complete their ratings to generate decision-support quadrants.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="rounded-lg border border-institutional/20 bg-institutional-subtle p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 shrink-0 text-institutional" size={18} />
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-text-default">Analytical Framing</h5>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary">
              The matrices translate current analyst ratings into engagement priorities. Select an actor in either matrix to review its assumptions, risk note, and recorded engagement approach.
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-institutional/15 pt-3 text-[11px] font-medium text-text-secondary">
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
          xLabels={['Resistant / Uncertain', 'Supportive / Enabling']}
          yLabels={['High Influence', 'Lower Influence']}
          quadrants={analysis.engagementQuadrants}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        <QuadrantMatrix
          title="Operational Credibility Map"
          description="Balances operational relevance with legitimacy and accountability value to identify suitable safeguards and consultation channels."
          xAxis="Lower → higher operational relevance"
          yAxis="Lower → higher legitimacy / accountability"
          xLabels={['Lower Relevance', 'High Relevance']}
          yLabels={['High Legitimacy', 'Lower Legitimacy']}
          quadrants={analysis.credibilityQuadrants}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      <div aria-live="polite" className="rounded-lg border border-border-default bg-surface-card p-4 shadow-subtle">
        {selectedStakeholder ? (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="text-xs font-semibold text-institutional uppercase tracking-wider">Selected stakeholder</span>
                <h5 className="mt-0.5 text-sm font-bold text-text-default">
                  {selectedStakeholder.name}
                </h5>
                <p className="mt-1 text-xs text-text-muted">
                  {selectedStakeholder.category} · {selectedStakeholder.position}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant={getRatingBadgeVariant(selectedStakeholder.influence)}>Influence: {selectedStakeholder.influence}</Badge>
                <Badge variant={getRatingBadgeVariant(selectedStakeholder.legitimacy)}>Legitimacy: {selectedStakeholder.legitimacy}</Badge>
                <Badge variant={getRatingBadgeVariant(selectedStakeholder.relevance)}>Relevance: {selectedStakeholder.relevance}</Badge>
                <Badge variant={getRatingBadgeVariant(selectedStakeholder.capacity)}>Capacity: {selectedStakeholder.capacity}</Badge>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
              <div className="rounded-md border border-border-default bg-surface-subtle p-3">
                <span className="text-xs font-semibold text-text-default">Strategic role</span>
                <p className="mt-1 text-xs leading-relaxed text-text-muted">{selectedStakeholder.role}</p>
              </div>
              <div className="rounded-md border border-rose-200 bg-rose-50/30 p-3">
                <span className="text-xs font-semibold text-rose-900">Risk / review issue</span>
                <p className="mt-1 text-xs leading-relaxed text-rose-800">{selectedStakeholder.risk}</p>
              </div>
              <div className="rounded-md border border-institutional/20 bg-institutional-subtle p-3">
                <span className="text-xs font-semibold text-institutional">Recorded engagement approach</span>
                <p className="mt-1 text-xs leading-relaxed text-text-default">{selectedStakeholder.engagement}</p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-xs text-text-muted">Select a stakeholder to review its analytical details.</p>
        )}
      </div>

      <section aria-labelledby="stakeholder-insights-title">
        <div className="mb-3">
          <h5 id="stakeholder-insights-title" className="text-xs font-semibold uppercase tracking-wider text-text-default">
            Recommended engagement posture
          </h5>
          <p className="mt-0.5 text-xs text-text-muted">
            Derived from current ratings and intended to support review, not replace analyst judgment.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <InsightList
            title="Priority engagement risks"
            stakeholders={analysis.insights.priorityRisks}
            icon={<AlertTriangle size={15} />}
            iconColor="text-rose-600"
            badgeVariant="rose"
            emptyText="No elevated engagement risks currently derived."
          />
          <InsightList
            title="Leadership-level engagement"
            stakeholders={analysis.insights.leadershipLevel}
            icon={<BriefcaseBusiness size={15} />}
            iconColor="text-institutional"
            badgeVariant="blue"
            emptyText="No high-influence actors currently recorded."
          />
          <InsightList
            title="Technical working groups"
            stakeholders={analysis.insights.technicalWorkingGroups}
            icon={<CheckCircle2 size={15} />}
            iconColor="text-emerald-600"
            badgeVariant="green"
            emptyText="No actors currently meet the suggested working-group criteria."
          />
          <InsightList
            title="Legitimacy consultation"
            stakeholders={analysis.insights.legitimacyConsultation}
            icon={<Scale size={15} />}
            iconColor="text-indigo-600"
            badgeVariant="blue"
            emptyText="No high-legitimacy actors currently recorded."
          />
          <InsightList
            title="Monitoring only"
            stakeholders={analysis.insights.monitoringOnly}
            icon={<Eye size={15} />}
            iconColor="text-text-muted"
            badgeVariant="slate"
            emptyText="No actors currently fall into both lower-priority categories."
          />
        </div>
      </section>

      <p className="rounded-md border border-border-default bg-surface-subtle px-3 py-2.5 text-xs leading-relaxed text-text-muted">
        <strong className="font-semibold text-text-default">Analytical caveat:</strong> {STAKEHOLDER_RATINGS_CAVEAT}
      </p>
    </div>
  );
};
