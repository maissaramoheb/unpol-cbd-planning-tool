import { MissionExplorerEntry } from '../types/explorer';
import { resolvePlanningContext } from './planningContext';

export interface MissionExplorerFilters {
  searchQuery: string;
  selectedRegion: string;
  selectedType: string;
  selectedStatus: string;
  showFictional: 'all' | 'real' | 'fictional';
  selectedVerification?: 'all' | 'current-reference' | 'review-required' | 'training-only';
}

export function filterMissionExplorerEntries(
  entries: MissionExplorerEntry[],
  filters: MissionExplorerFilters
): MissionExplorerEntry[] {
  const normalizedQuery = filters.searchQuery.trim().toLowerCase();

  return entries.filter((entry) => {
    // 1. Obvious entity metadata matches
    const matchesBasic =
      entry.country.toLowerCase().includes(normalizedQuery) ||
      entry.missionName.toLowerCase().includes(normalizedQuery) ||
      entry.missionAcronym.toLowerCase().includes(normalizedQuery) ||
      entry.region.toLowerCase().includes(normalizedQuery);

    // 2. Police force & themes
    const matchesPolice =
      Boolean(entry.hostStatePoliceInstitution) &&
      entry.hostStatePoliceInstitution.toLowerCase().includes(normalizedQuery);

    const matchesThemes =
      Array.isArray(entry.planningThemes) &&
      entry.planningThemes.some((theme) =>
        theme.toLowerCase().includes(normalizedQuery)
      );

    // 3. PESTEL-S investigation prompts
    const matchesPestels = Object.values(entry.starterPestelsPrompts || {}).some(
      (p) =>
        (p.prompt && p.prompt.toLowerCase().includes(normalizedQuery)) ||
        (p.whyPrompt && p.whyPrompt.toLowerCase().includes(normalizedQuery))
    );

    // 4. Stakeholder categories and suggested actors
    const matchesStakeholderCategories =
      Array.isArray(entry.suggestedStakeholderCategories) &&
      entry.suggestedStakeholderCategories.some((cat) =>
        cat.toLowerCase().includes(normalizedQuery)
      );

    const matchesStakeholderPrompts =
      Array.isArray(entry.starterStakeholderPrompts) &&
      entry.starterStakeholderPrompts.some(
        (sp) =>
          (sp.category && sp.category.toLowerCase().includes(normalizedQuery)) ||
          (sp.rolePrompt && sp.rolePrompt.toLowerCase().includes(normalizedQuery)) ||
          (Array.isArray(sp.suggestedStakeholders) &&
            sp.suggestedStakeholders.some((sh) =>
              sh.toLowerCase().includes(normalizedQuery)
            ))
      );

    const matchesSearch =
      normalizedQuery === '' ||
      matchesBasic ||
      matchesPolice ||
      matchesThemes ||
      matchesPestels ||
      matchesStakeholderCategories ||
      matchesStakeholderPrompts;

    const matchesRegion =
      filters.selectedRegion === 'all' || entry.region === filters.selectedRegion;
    const matchesType =
      filters.selectedType === 'all' || entry.missionType === filters.selectedType;
    const matchesStatus =
      filters.selectedStatus === 'all' || entry.status === filters.selectedStatus;
    const matchesClassification =
      filters.showFictional === 'all' ||
      (filters.showFictional === 'real' && !entry.isFictionalScenario) ||
      (filters.showFictional === 'fictional' && entry.isFictionalScenario);

    const ctx = resolvePlanningContext(entry.id);
    const verificationStatus =
      ctx?.verificationStatus ?? (entry.isFictionalScenario ? 'training-only' : 'review-required');

    const matchesVerification =
      !filters.selectedVerification ||
      filters.selectedVerification === 'all' ||
      verificationStatus === filters.selectedVerification;

    return (
      matchesSearch &&
      matchesRegion &&
      matchesType &&
      matchesStatus &&
      matchesClassification &&
      matchesVerification
    );
  });
}

/**
 * Returns a subtle match reason when a search query matches a non-obvious planning field.
 * Returns null if the match is on standard identity fields (country, acronym, name, region)
 * or if query is empty.
 */
export function getSearchMatchReason(
  entry: MissionExplorerEntry,
  query: string
): string | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  // Primary identity fields: obvious match, no annotation needed
  if (
    entry.country.toLowerCase().includes(q) ||
    entry.missionAcronym.toLowerCase().includes(q) ||
    entry.missionName.toLowerCase().includes(q) ||
    entry.region.toLowerCase().includes(q)
  ) {
    return null;
  }

  // Check themes
  if (Array.isArray(entry.planningThemes)) {
    const matchedTheme = entry.planningThemes.find((theme) =>
      theme.toLowerCase().includes(q)
    );
    if (matchedTheme) {
      return `Matched theme: ${matchedTheme}`;
    }
  }

  // Check host-state police counterpart
  if (
    entry.hostStatePoliceInstitution &&
    entry.hostStatePoliceInstitution.toLowerCase().includes(q)
  ) {
    return `Matched counterpart: ${entry.hostStatePoliceInstitution}`;
  }

  // Check PESTEL-S questions
  if (entry.starterPestelsPrompts) {
    for (const [factor, p] of Object.entries(entry.starterPestelsPrompts)) {
      if (
        (p.prompt && p.prompt.toLowerCase().includes(q)) ||
        (p.whyPrompt && p.whyPrompt.toLowerCase().includes(q))
      ) {
        return `Matched planning question: ${factor.charAt(0).toUpperCase() + factor.slice(1)}`;
      }
    }
  }

  // Check stakeholder prompts
  if (Array.isArray(entry.starterStakeholderPrompts)) {
    for (const sp of entry.starterStakeholderPrompts) {
      if (sp.category && sp.category.toLowerCase().includes(q)) {
        return `Matched stakeholder category: ${sp.category}`;
      }
      if (Array.isArray(sp.suggestedStakeholders)) {
        const matchedActor = sp.suggestedStakeholders.find((sh) =>
          sh.toLowerCase().includes(q)
        );
        if (matchedActor) {
          return `Matched candidate actor: ${matchedActor}`;
        }
      }
    }
  }

  if (Array.isArray(entry.suggestedStakeholderCategories)) {
    const matchedCat = entry.suggestedStakeholderCategories.find((cat) =>
      cat.toLowerCase().includes(q)
    );
    if (matchedCat) {
      return `Matched stakeholder category: ${matchedCat}`;
    }
  }

  return null;
}
