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

export interface TermPresence {
  term: string;
  contextIds: string[];
  count: number;
}

export interface ComparisonTermGroups {
  sharedAll: TermPresence[];
  sharedSome: TermPresence[];
  uniqueByContext: Array<{ contextId: string; terms: string[] }>;
}

/**
 * Validates whether the given list of context IDs meets comparison bounds (2 to 3 DISTINCT contexts).
 */
export function canCompareContexts(ids: string[]): boolean {
  if (!Array.isArray(ids) || ids.length < 2 || ids.length > 3) {
    return false;
  }
  const uniqueIds = new Set(ids);
  return uniqueIds.size === ids.length;
}

/**
 * Normalizes a string term for exact, deterministic matching without semantic drift.
 */
export function normalizeComparisonTerm(term: string): string {
  return term.trim().toLowerCase();
}

/**
 * Generic term presence extractor across a list of contexts.
 * Preserves original display casing from the first context where the term occurs.
 * Results are sorted deterministically by term.
 */
export function getTermPresence(
  contexts: PlanningContext[],
  extractor: (ctx: PlanningContext) => string[]
): TermPresence[] {
  if (!contexts || contexts.length === 0) return [];

  const presenceMap = new Map<string, { term: string; contextIds: string[] }>();

  for (const ctx of contexts) {
    const rawTerms = extractor(ctx) || [];
    const seenInContext = new Set<string>();

    for (const raw of rawTerms) {
      if (!raw || typeof raw !== 'string') continue;
      const norm = normalizeComparisonTerm(raw);
      if (seenInContext.has(norm)) continue;
      seenInContext.add(norm);

      const existing = presenceMap.get(norm);
      if (existing) {
        existing.contextIds.push(ctx.id);
      } else {
        presenceMap.set(norm, {
          term: raw.trim(),
          contextIds: [ctx.id]
        });
      }
    }
  }

  const results: TermPresence[] = Array.from(presenceMap.values()).map((entry) => ({
    term: entry.term,
    contextIds: entry.contextIds,
    count: entry.contextIds.length
  }));

  results.sort((a, b) => a.term.localeCompare(b.term));
  return results;
}

/**
 * Groups term presence into three exact-match sets:
 * A. Shared Across All: present in every compared context (count === contexts.length)
 * B. Shared Across Some: present in at least 2 contexts but not all (relevant when 3 contexts compared)
 * C. Unique by Context: present in exactly 1 context (count === 1)
 */
export function groupTermPresence(
  presenceList: TermPresence[],
  contexts: PlanningContext[]
): ComparisonTermGroups {
  const total = contexts.length;
  const sharedAll: TermPresence[] = [];
  const sharedSome: TermPresence[] = [];

  for (const p of presenceList) {
    if (total >= 2 && p.count === total) {
      sharedAll.push(p);
    } else if (p.count > 1 && p.count < total) {
      sharedSome.push(p);
    }
  }

  const uniqueByContext = contexts.map((ctx) => {
    const terms = presenceList
      .filter((p) => p.count === 1 && p.contextIds.includes(ctx.id))
      .map((p) => p.term);
    return {
      contextId: ctx.id,
      terms
    };
  });

  return {
    sharedAll,
    sharedSome,
    uniqueByContext
  };
}

/**
 * Returns planning theme presence records across contexts.
 */
export function getPlanningThemePresence(contexts: PlanningContext[]): TermPresence[] {
  return getTermPresence(contexts, (ctx) => ctx.reference.planningThemes || []);
}

/**
 * Returns 3-tier planning theme groups: shared all, shared some (partial), and unique by context.
 */
export function getPlanningThemeGroups(contexts: PlanningContext[]): ComparisonTermGroups {
  const presence = getPlanningThemePresence(contexts);
  return groupTermPresence(presence, contexts);
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
 * Returns stakeholder category presence records across contexts.
 */
export function getStakeholderCategoryPresence(contexts: PlanningContext[]): TermPresence[] {
  return getTermPresence(contexts, extractStakeholderCategories);
}

/**
 * Returns 3-tier stakeholder category groups: shared all, shared some (partial), and unique by context.
 */
export function getStakeholderCategoryGroups(contexts: PlanningContext[]): ComparisonTermGroups {
  const presence = getStakeholderCategoryPresence(contexts);
  return groupTermPresence(presence, contexts);
}

/**
 * Backward-compatible helper: returns planning themes present in all contexts.
 */
export function getSharedPlanningThemes(contexts: PlanningContext[]): string[] {
  return getPlanningThemeGroups(contexts).sharedAll.map((p) => p.term);
}

/**
 * Helper: returns planning themes unique to each context.
 */
export function getContextSpecificThemes(
  contexts: PlanningContext[]
): Array<{ contextId: string; themes: string[] }> {
  return getPlanningThemeGroups(contexts).uniqueByContext.map((u) => ({
    contextId: u.contextId,
    themes: u.terms
  }));
}

/**
 * Backward-compatible helper: returns stakeholder categories present in all contexts.
 */
export function getSharedStakeholderCategories(contexts: PlanningContext[]): string[] {
  return getStakeholderCategoryGroups(contexts).sharedAll.map((p) => p.term);
}

/**
 * Helper: returns stakeholder categories unique to each context.
 */
export function getContextSpecificStakeholderCategories(
  contexts: PlanningContext[]
): Array<{ contextId: string; categories: string[] }> {
  return getStakeholderCategoryGroups(contexts).uniqueByContext.map((u) => ({
    contextId: u.contextId,
    categories: u.terms
  }));
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
