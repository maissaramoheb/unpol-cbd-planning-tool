import { MissionProfile } from '../types';

export interface ValidationError {
  field: keyof MissionProfile | 'general';
  message: string;
}

export function validateMissionProfile(profile: MissionProfile): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!profile.countryName.trim()) {
    errors.push({ field: 'countryName', message: 'Country/Mission name is required.' });
  }
  if (!profile.missionName.trim()) {
    errors.push({ field: 'missionName', message: 'Mission name/type is required.' });
  }
  if (!profile.hostStatePolice.trim()) {
    errors.push({ field: 'hostStatePolice', message: 'Host-state police institution name is required.' });
  }

  return errors;
}
