import type { Stakeholder } from '../types';

export type EngagementQuadrantId =
  | 'high-influence-resistance'
  | 'high-influence-allies'
  | 'monitor'
  | 'support-base';

export type CredibilityQuadrantId =
  | 'legitimacy-voices'
  | 'core-partners'
  | 'lower-priority-monitoring'
  | 'operationally-sensitive';

export interface QuadrantDefinition<TId extends string> {
  id: TId;
  title: string;
  meaning: string;
  recommendation: string;
  caveat: string;
}

export interface StakeholderQuadrant<TId extends string>
  extends QuadrantDefinition<TId> {
  stakeholders: Stakeholder[];
}

export interface StakeholderDecisionInsights {
  leadershipLevel: Stakeholder[];
  technicalWorkingGroups: Stakeholder[];
  legitimacyConsultation: Stakeholder[];
  monitoringOnly: Stakeholder[];
  priorityRisks: Stakeholder[];
}

export interface StakeholderAnalysis {
  engagementQuadrants: StakeholderQuadrant<EngagementQuadrantId>[];
  credibilityQuadrants: StakeholderQuadrant<CredibilityQuadrantId>[];
  insights: StakeholderDecisionInsights;
}

export const STAKEHOLDER_RATINGS_CAVEAT =
  'Stakeholder ratings and derived engagement recommendations are analytical judgments. Review them against current evidence, mandate authority, and counterpart consultation before professional use.';

export const ENGAGEMENT_QUADRANT_DEFINITIONS: QuadrantDefinition<EngagementQuadrantId>[] = [
  {
    id: 'high-influence-resistance',
    title: 'High-influence resistance / sensitive engagement',
    meaning: 'Influential actors who are resistant, blocking, spoiler risks, or whose posture remains uncertain.',
    recommendation: 'Use leadership-level bilateral engagement, political-risk management, and carefully sequenced confidence building.',
    caveat: 'Do not interpret resistance as fixed. Verify interests, incentives, authority, and room for negotiated movement.'
  },
  {
    id: 'high-influence-allies',
    title: 'High-influence allies',
    meaning: 'Influential actors currently assessed as enabling or persuadable toward the planning objective.',
    recommendation: 'Use as strategic sponsors, steering-group members, and sources of institutional or political cover.',
    caveat: 'Confirm that stated support is matched by authority, capacity, and sustained implementation behavior.'
  },
  {
    id: 'monitor',
    title: 'Monitor / low immediate engagement',
    meaning: 'Lower-influence actors with resistant, spoiler-risk, or unverified support postures.',
    recommendation: 'Maintain proportionate monitoring, targeted consultation, and clear triggers for reassessment.',
    caveat: 'Low current influence does not mean low future risk. Reassess after political, security, or leadership changes.'
  },
  {
    id: 'support-base',
    title: 'Potential support base',
    meaning: 'Lower- or medium-influence actors assessed as enabling or persuadable.',
    recommendation: 'Use technical working groups, coalition building, pilots, and structured feedback mechanisms.',
    caveat: 'Avoid symbolic consultation. Define how participation will influence design, implementation, or oversight.'
  }
];

export const CREDIBILITY_QUADRANT_DEFINITIONS: QuadrantDefinition<CredibilityQuadrantId>[] = [
  {
    id: 'legitimacy-voices',
    title: 'Legitimacy / accountability voices',
    meaning: 'Actors with high legitimacy or accountability value but lower immediate operational relevance.',
    recommendation: 'Use structured consultation, safeguards review, community feedback, and accountability dialogue.',
    caveat: 'Lower operational relevance should not exclude these actors from decisions affecting rights, trust, or legitimacy.'
  },
  {
    id: 'core-partners',
    title: 'Core institutional partners',
    meaning: 'Actors assessed as both highly legitimate/accountable and highly relevant to implementation.',
    recommendation: 'Use joint planning, formal coordination, implementation review, and shared accountability checkpoints.',
    caveat: 'Verify that formal legitimacy is matched by practical access, capability, and representative decision making.'
  },
  {
    id: 'lower-priority-monitoring',
    title: 'Lower-priority monitoring',
    meaning: 'Actors with lower current legitimacy/accountability standing and lower operational relevance.',
    recommendation: 'Maintain situational awareness and reassess if authority, relevance, or risk exposure changes.',
    caveat: 'This is a prioritization judgment, not a finding that the actor is unimportant or illegitimate.'
  },
  {
    id: 'operationally-sensitive',
    title: 'Operationally relevant but sensitive actors',
    meaning: 'Actors with high operational relevance but legitimacy or accountability concerns requiring safeguards.',
    recommendation: 'Use conditional engagement, documented boundaries, risk controls, and enhanced oversight.',
    caveat: 'Operational necessity does not remove human-rights, accountability, reputational, or political risks.'
  }
];

const isSupportive = (stakeholder: Stakeholder) =>
  stakeholder.position === 'Enabler' || stakeholder.position === 'Persuadable';

const byInfluenceThenName = (left: Stakeholder, right: Stakeholder) => {
  const weights = { High: 3, Medium: 2, Low: 1 };
  return weights[right.influence] - weights[left.influence] || left.name.localeCompare(right.name);
};

const uniqueStakeholders = (stakeholders: Stakeholder[]) => {
  const seen = new Set<string>();
  return stakeholders.filter((stakeholder) => {
    if (seen.has(stakeholder.id)) return false;
    seen.add(stakeholder.id);
    return true;
  });
};

export function getEngagementQuadrantId(stakeholder: Stakeholder): EngagementQuadrantId {
  if (stakeholder.influence === 'High') {
    return isSupportive(stakeholder)
      ? 'high-influence-allies'
      : 'high-influence-resistance';
  }

  return isSupportive(stakeholder) ? 'support-base' : 'monitor';
}

export function getCredibilityQuadrantId(stakeholder: Stakeholder): CredibilityQuadrantId {
  if (stakeholder.relevance === 'High') {
    return stakeholder.legitimacy === 'High'
      ? 'core-partners'
      : 'operationally-sensitive';
  }

  return stakeholder.legitimacy === 'High'
    ? 'legitimacy-voices'
    : 'lower-priority-monitoring';
}

function populateQuadrants<TId extends string>(
  definitions: QuadrantDefinition<TId>[],
  stakeholders: Stakeholder[],
  classify: (stakeholder: Stakeholder) => TId
): StakeholderQuadrant<TId>[] {
  return definitions.map((definition) => ({
    ...definition,
    stakeholders: stakeholders
      .filter((stakeholder) => classify(stakeholder) === definition.id)
      .sort(byInfluenceThenName)
  }));
}

export function analyzeStakeholders(stakeholders: Stakeholder[]): StakeholderAnalysis {
  const engagementQuadrants = populateQuadrants(
    ENGAGEMENT_QUADRANT_DEFINITIONS,
    stakeholders,
    getEngagementQuadrantId
  );
  const credibilityQuadrants = populateQuadrants(
    CREDIBILITY_QUADRANT_DEFINITIONS,
    stakeholders,
    getCredibilityQuadrantId
  );

  const priorityRisks = uniqueStakeholders(
    stakeholders
      .filter(
        (stakeholder) =>
          stakeholder.position === 'Blocker' ||
          stakeholder.position === 'Spoiler risk' ||
          (
            stakeholder.relevance === 'High' &&
            stakeholder.legitimacy === 'Low' &&
            stakeholder.influence === 'High'
          )
      )
      .sort(byInfluenceThenName)
  );

  return {
    engagementQuadrants,
    credibilityQuadrants,
    insights: {
      leadershipLevel: stakeholders
        .filter((stakeholder) => stakeholder.influence === 'High')
        .sort(byInfluenceThenName),
      technicalWorkingGroups: stakeholders
        .filter(
          (stakeholder) =>
            isSupportive(stakeholder) &&
            stakeholder.relevance !== 'Low' &&
            stakeholder.capacity !== 'Low'
        )
        .sort(byInfluenceThenName),
      legitimacyConsultation: stakeholders
        .filter((stakeholder) => stakeholder.legitimacy === 'High')
        .sort(byInfluenceThenName),
      monitoringOnly: stakeholders
        .filter(
          (stakeholder) =>
            getEngagementQuadrantId(stakeholder) === 'monitor' &&
            getCredibilityQuadrantId(stakeholder) === 'lower-priority-monitoring'
        )
        .sort(byInfluenceThenName),
      priorityRisks
    }
  };
}

export function formatStakeholderNames(stakeholders: Stakeholder[]): string {
  return stakeholders.map((stakeholder) => stakeholder.name).join(', ') || 'None currently identified';
}
