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
  'pk-minurso': {
    longitude: -13.2,
    latitude: 24.5,
    labelOffset: { x: -72, y: -36 }
  },
  'pk-minusca': {
    longitude: 20.94,
    latitude: 6.61,
    labelOffset: { x: -92, y: 12 }
  },
  'pk-monusco': {
    longitude: 29.22,
    latitude: -1.68,
    labelOffset: { x: -88, y: 54 }
  },
  'pk-undof': {
    longitude: 35.82,
    latitude: 33.05,
    labelOffset: { x: 86, y: -54 }
  },
  'pk-unficyp': {
    longitude: 33.38,
    latitude: 35.18,
    labelOffset: { x: -92, y: -62 }
  },
  'pk-unifil': {
    longitude: 35.42,
    latitude: 33.22,
    labelOffset: { x: -94, y: 18 }
  },
  'pk-unisfa': {
    longitude: 28.45,
    latitude: 9.6,
    labelOffset: { x: -92, y: -46 }
  },
  'pk-unmik': {
    longitude: 20.9,
    latitude: 42.6,
    labelOffset: { x: -82, y: -36 }
  },
  'pk-unmiss': {
    longitude: 31.58,
    latitude: 4.85,
    labelOffset: { x: 80, y: 42 }
  },
  'pk-unmogip': {
    longitude: 74.0,
    latitude: 34.0,
    labelOffset: { x: 96, y: -30 }
  },
  'pk-untso': {
    longitude: 35.22,
    latitude: 31.78,
    labelOffset: { x: 94, y: 44 }
  },
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
