export interface ScoringInputs {
  impact: number;            // 1-5
  urgency: number;           // 1-5
  feasibility: number;       // 1-5
  risk: number;              // 1-5
  stakeholderSupport: number;// 1-5
  mandateRelevance: number;  // 1-5
  confidenceLevel: number;   // 1-5
}

/**
 * Calculates priority score on a 1.0 - 5.0 scale.
 * Weighted formula:
 * - Impact: 20%
 * - Urgency: 20%
 * - Feasibility: 20%
 * - Stakeholder Support: 15%
 * - Mandate Relevance: 15%
 * - Risk (inverse): 5% (higher risk reduces score)
 * - Confidence Level: 5%
 */
export function calculatePriorityScore(inputs: ScoringInputs): number {
  const {
    impact,
    urgency,
    feasibility,
    risk,
    stakeholderSupport,
    mandateRelevance,
    confidenceLevel
  } = inputs;

  const score =
    impact * 0.20 +
    urgency * 0.20 +
    feasibility * 0.20 +
    stakeholderSupport * 0.15 +
    mandateRelevance * 0.15 +
    (6 - risk) * 0.05 + // 6 - risk maps 1->5, 5->1
    confidenceLevel * 0.05;

  return Math.round(score * 100) / 100;
}

export type PriorityType = 'Quick Win' | 'Sensitive Reform' | 'Long-Term Reform' | 'Standard Priority';

/**
 * Classifies a capacity building activity based on its parameters.
 */
export function classifyPriority(inputs: ScoringInputs): PriorityType {
  const { impact, feasibility, risk } = inputs;

  if (feasibility >= 4 && impact >= 4 && risk <= 2) {
    return 'Quick Win';
  }
  if (impact >= 4 && risk >= 4) {
    return 'Sensitive Reform';
  }
  if (impact >= 4 && feasibility <= 2) {
    return 'Long-Term Reform';
  }
  return 'Standard Priority';
}
