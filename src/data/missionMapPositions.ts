export interface MissionMapPosition {
  longitude: number;
  latitude: number;
  labelOffset: {
    x: number;
    y: number;
  };
}

// Approximate planning-orientation coordinates. Label offsets prevent overlap
// without moving the geographic anchor away from the mission location.
export const MISSION_MAP_POSITIONS: Record<string, MissionMapPosition> = {
  'seed-unisfa': {
    longitude: 28.45,
    latitude: 9.6,
    labelOffset: { x: -86, y: -48 }
  },
  'seed-unmiss': {
    longitude: 31.58,
    latitude: 4.85,
    labelOffset: { x: 76, y: 42 }
  },
  'seed-monusco': {
    longitude: 29.22,
    latitude: -1.68,
    labelOffset: { x: -92, y: 58 }
  },
  'seed-untmis': {
    longitude: 45.32,
    latitude: 2.05,
    labelOffset: { x: 92, y: -34 }
  },
  'seed-binuh': {
    longitude: -72.34,
    latitude: 18.54,
    labelOffset: { x: 0, y: -42 }
  }
};
