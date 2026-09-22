import { CANONICAL_PLANNING_CONTEXTS } from './planningContexts';
import { ContextGeography } from '../types/explorer';

export type MissionMapPosition = ContextGeography;

// Approximate planning-orientation coordinates derived from canonical PlanningContext geography.
// Label offsets prevent overlap without moving the geographic anchor away from the mission location.
export const MISSION_MAP_POSITIONS: Record<string, MissionMapPosition> = {};

CANONICAL_PLANNING_CONTEXTS.forEach((context) => {
  if (context.geography) {
    MISSION_MAP_POSITIONS[context.id] = context.geography;
    context.legacyIds.forEach((alias) => {
      MISSION_MAP_POSITIONS[alias] = context.geography!;
    });
  }
});
