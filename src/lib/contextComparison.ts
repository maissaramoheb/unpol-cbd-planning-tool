import { PlanningContext, ContextSource, ContextVerificationStatus } from '../types/explorer';

export interface ContextSourceCoverage {
  sourceCount: number;
  lastReviewed: string | null;
  verificationStatus: ContextVerificationStatus;
  limitationsCount: number;
  supportedStatementsCount: number;
  unsupportedStatementsCount: number;
  sources: ContextSource[];
}

export interface ContextDifferences {
  statusDiffers: boolean;
  typeDiffers: boolean;
  verificationDiffers: boolean;
  regionDiffers: boolean;
}

export interface TransferCheckQuestion {
  id: string;
  category: string;
  question: string;
}

/**
 * Validates whether the given list of context IDs meets comparison bounds (2 to 3 contexts).
 */
export function canCompareContexts(ids: string[]): boolean {
  return ids.length >= 2 && ids.length <= 3;
}

/**
 * Normalizes a string term for exact, deterministic matching without semantic drift.
 */
export function normalizeComparisonTerm(term: string): string {
  return term.trim().toLowerCase();
}

/**
 * Returns planning themes present in all of the provided contexts (exact normalized match).
 * Preserves the original casing from the first context where the theme occurs.
 */
export function getSharedPlanningThemes(contexts: PlanningContext[]): string[] {
  if (contexts.length === 0) return [];
  if (contexts.length === 1) return [...(contexts[0].reference.planningThemes || [])];

  const firstThemes = contexts[0].reference.planningThemes || [];
  const shared: string[] = [];

  for (const theme of firstThemes) {
    const norm = normalizeComparisonTerm(theme);
    const inAll = contexts.slice(1).every((ctx) =>
      (ctx.reference.planningThemes || []).some(
        (t) => normalizeComparisonTerm(t) === norm
      )
    );
    if (inAll && !shared.some((s) => normalizeComparisonTerm(s) === norm)) {
      shared.push(theme);
    }
  }

  return shared;
}

/**
 * Returns planning themes specific to each context (i.e. not shared across all contexts).
 */
export function getContextSpecificThemes(
  contexts: PlanningContext[]
): Array<{ contextId: string; themes: string[] }> {
  const sharedNormalized = new Set(
    getSharedPlanningThemes(contexts).map(normalizeComparisonTerm)
  );

  return contexts.map((ctx) => {
    const themes = (ctx.reference.planningThemes || []).filter(
      (theme) => !sharedNormalized.has(normalizeComparisonTerm(theme))
    );
    return {
      contextId: ctx.id,
      themes
    };
  });
}

/**
 * Extracts normalized stakeholder categories from a context's planningPrompts.
 */
function extractStakeholderCategories(context: PlanningContext): string[] {
  const cats: string[] = [];
  const suggested = context.planningPrompts.suggestedStakeholderCategories || [];
  for (const s of suggested) {
    if (s && !cats.some((c) => normalizeComparisonTerm(c) === normalizeComparisonTerm(s))) {
      cats.push(s);
    }
  }
  const prompts = context.planningPrompts.stakeholderPrompts || [];
  for (const p of prompts) {
    if (p.category && !cats.some((c) => normalizeComparisonTerm(c) === normalizeComparisonTerm(p.category))) {
      cats.push(p.category);
    }
  }
  return cats;
}

/**
 * Returns stakeholder categories present in all of the provided contexts.
 */
export function getSharedStakeholderCategories(contexts: PlanningContext[]): string[] {
  if (contexts.length === 0) return [];
  if (contexts.length === 1) return extractStakeholderCategories(contexts[0]);

  const firstCats = extractStakeholderCategories(contexts[0]);
  const shared: string[] = [];

  for (const cat of firstCats) {
    const norm = normalizeComparisonTerm(cat);
    const inAll = contexts.slice(1).every((ctx) =>
      extractStakeholderCategories(ctx).some(
        (c) => normalizeComparisonTerm(c) === norm
      )
    );
    if (inAll && !shared.some((s) => normalizeComparisonTerm(s) === norm)) {
      shared.push(cat);
    }
  }

  return shared;
}

/**
 * Returns stakeholder categories specific to each context.
 */
export function getContextSpecificStakeholderCategories(
  contexts: PlanningContext[]
): Array<{ contextId: string; categories: string[] }> {
  const sharedNormalized = new Set(
    getSharedStakeholderCategories(contexts).map(normalizeComparisonTerm)
  );

  return contexts.map((ctx) => {
    const categories = extractStakeholderCategories(ctx).filter(
      (cat) => !sharedNormalized.has(normalizeComparisonTerm(cat))
    );
    return {
      contextId: ctx.id,
      categories
    };
  });
}

/**
 * Calculates descriptive source and statement coverage indicators for a context.
 * Strictly descriptive — does NOT calculate any trust, evidence, or confidence score.
 */
export function getContextSourceCoverage(context: PlanningContext): ContextSourceCoverage {
  const statements = [
    context.reference.mandateSummary,
    context.reference.policeRelevance,
    context.reference.hostStatePolice
  ];

  let supportedStatementsCount = 0;
  let unsupportedStatementsCount = 0;

  for (const stmt of statements) {
    if (stmt && Array.isArray(stmt.sourceIds) && stmt.sourceIds.length > 0) {
      supportedStatementsCount++;
    } else {
      unsupportedStatementsCount++;
    }
  }

  return {
    sourceCount: context.provenance.sources.length,
    lastReviewed: context.provenance.profileLastReviewed,
    verificationStatus: context.verificationStatus,
    limitationsCount: (context.provenance.limitations || []).length,
    supportedStatementsCount,
    unsupportedStatementsCount,
    sources: context.provenance.sources
  };
}

/**
 * Checks whether the comparison set mixes reference/starter contexts with fictional training material.
 */
export function hasMixedOperationalStatus(contexts: PlanningContext[]): boolean {
  if (contexts.length < 2) return false;

  const hasFictional = contexts.some(
    (c) =>
      c.operationalStatus === 'fictional' ||
      c.verificationStatus === 'training-only' ||
      Boolean(c.scenarioNarrative)
  );

  const hasReal = contexts.some(
    (c) =>
      c.operationalStatus !== 'fictional' &&
      c.verificationStatus !== 'training-only' &&
      !c.scenarioNarrative
  );

  return hasFictional && hasReal;
}

/**
 * Checks for differences in categorical fields across the compared contexts.
 */
export function getContextDifferences(contexts: PlanningContext[]): ContextDifferences {
  if (contexts.length < 2) {
    return {
      statusDiffers: false,
      typeDiffers: false,
      verificationDiffers: false,
      regionDiffers: false
    };
  }

  const statuses = new Set(contexts.map((c) => c.operationalStatus));
  const types = new Set(contexts.map((c) => c.identity.missionType));
  const verifications = new Set(contexts.map((c) => c.verificationStatus));
  const regions = new Set(contexts.map((c) => c.identity.region));

  return {
    statusDiffers: statuses.size > 1,
    typeDiffers: types.size > 1,
    verificationDiffers: verifications.size > 1,
    regionDiffers: regions.size > 1
  };
}

/**
 * Static methodological checklist questions before applying lessons across contexts.
 * Static and descriptive — questions are never auto-answered or scored.
 */
export function getTransferCheckQuestions(): TransferCheckQuestion[] {
  return [
    {
      id: 'tc-mandate',
      category: 'Mandate Authority',
      question: 'Are the mandate authorities comparable?'
    },
    {
      id: 'tc-component',
      category: 'Component Roles',
      question: 'Are police/component roles comparable?'
    },
    {
      id: 'tc-institutional',
      category: 'Institutional Arrangements',
      question: 'Are host-state institutional arrangements comparable?'
    },
    {
      id: 'tc-security',
      category: 'Security Environment',
      question: 'Are conflict/security conditions comparable?'
    },
    {
      id: 'tc-governance',
      category: 'Governance & Politics',
      question: 'Are political/governance constraints comparable?'
    },
    {
      id: 'tc-resources',
      category: 'Resources & Logistics',
      question: 'Are resource/logistics conditions comparable?'
    },
    {
      id: 'tc-accountability',
      category: 'Legal & Accountability',
      question: 'Are accountability/legal arrangements comparable?'
    },
    {
      id: 'tc-stakeholders',
      category: 'Stakeholder Landscape',
      question: 'Are stakeholder structures comparable?'
    },
    {
      id: 'tc-currency',
      category: 'Source Currency',
      question: 'Are source records current enough for comparison?'
    }
  ];
}
