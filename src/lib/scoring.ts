import type { CbdCell } from '../types';

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
 * Prototype planning heuristic — not UN doctrine.
 * Calculates an indicative priority score on a 1.0 - 5.0 scale.
 * Weighted formula:
 * - Impact: 25%
 * - Urgency: 20%
 * - Mandate Relevance: 20%
 * - Feasibility: 15%
 * - Stakeholder Support: 10%
 * - Implementation Risk (inverse): 10%
 *
 * Evidence confidence is deliberately excluded from the arithmetic: it qualifies
 * how strongly the assessment is supported and is surfaced as a caution instead.
 */
export function calculatePriorityScore(inputs: ScoringInputs): number {
  const {
    impact,
    urgency,
    feasibility,
    risk,
    stakeholderSupport,
    mandateRelevance
  } = inputs;

  const score =
    impact * 0.25 +
    urgency * 0.20 +
    mandateRelevance * 0.20 +
    feasibility * 0.15 +
    stakeholderSupport * 0.10 +
    (6 - risk) * 0.10; // 6 - risk maps 1->5, 5->1

  return Math.round(score * 10) / 10;
}

export type PriorityType = 'Quick Win' | 'Sensitive Reform' | 'Long-Term Reform' | 'Standard Priority';
export type CbdHeatmapTag =
  | 'Priority'
  | 'Quick Win'
  | 'Sensitive Reform'
  | 'Long-Term Reform'
  | 'Low Confidence';

export interface CbdPriorityAssessment {
  inputs: ScoringInputs;
  score: number;
  classification: PriorityType;
  tags: CbdHeatmapTag[];
}

const DEFAULT_RATING = 3;

export function getCbdScoringInputs(cell: CbdCell): ScoringInputs {
  return {
    impact: cell.impact ?? cell.priorityScore,
    urgency: cell.urgency ?? DEFAULT_RATING,
    feasibility: cell.feasibility ?? DEFAULT_RATING,
    risk: cell.riskRating ?? DEFAULT_RATING,
    stakeholderSupport: cell.stakeholderSupport ?? DEFAULT_RATING,
    mandateRelevance: cell.mandateRelevance ?? DEFAULT_RATING,
    confidenceLevel: cell.confidence
  };
}

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

export function evaluateCbdCell(cell: CbdCell): CbdPriorityAssessment {
  const inputs = getCbdScoringInputs(cell);
  const score = calculatePriorityScore(inputs);
  const classification = classifyPriority(inputs);
  const tags: CbdHeatmapTag[] = [];

  if (inputs.impact >= 4) {
    tags.push(classification === 'Standard Priority' ? 'Priority' : classification);
  }
  if (inputs.confidenceLevel <= 2) {
    tags.push('Low Confidence');
  }

  return { inputs, score, classification, tags };
}
