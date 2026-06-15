import { MissionExplorerEntry } from '../types/explorer';

export interface MissionExplorerFilters {
  searchQuery: string;
  selectedRegion: string;
  selectedType: string;
  selectedStatus: string;
  showFictional: 'all' | 'real' | 'fictional';
}

export function filterMissionExplorerEntries(
  entries: MissionExplorerEntry[],
  filters: MissionExplorerFilters
): MissionExplorerEntry[] {
  const normalizedQuery = filters.searchQuery.trim().toLowerCase();

  return entries.filter((entry) => {
    const matchesSearch =
      normalizedQuery === '' ||
      entry.country.toLowerCase().includes(normalizedQuery) ||
      entry.missionName.toLowerCase().includes(normalizedQuery) ||
      entry.missionAcronym.toLowerCase().includes(normalizedQuery);

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

    return (
      matchesSearch &&
      matchesRegion &&
      matchesType &&
      matchesStatus &&
      matchesClassification
    );
  });
}
