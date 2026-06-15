import { UnpolProjectData, MissionProfile, PestelsItem, Stakeholder, CbdCell } from '../types';
import { MissionExplorerEntry } from '../types/explorer';
import { defaultPestelsData } from '../data/pestelsCategories';
import { emptyPriorityBrief } from './storage';
import { APP_VERSION } from './version';

export function applyMissionSeed(entry: MissionExplorerEntry): UnpolProjectData {
  const profile: MissionProfile = {
    countryName: entry.country,
    missionName: entry.missionAcronym ? `${entry.missionAcronym} - ${entry.missionName}` : entry.missionName,
    region: entry.region,
    mandateEnvironment: entry.starterProfile.mandateEnvironment,
    hostStatePolice: entry.hostStatePoliceInstitution,
    conflictContext: entry.starterProfile.conflictContext,
    planningPurpose: entry.starterProfile.planningPurpose,
    assessmentDate: new Date().toISOString().split('T')[0],
    analystName: '',
    templateId: entry.id,
    sourceCategory: entry.sourceCategory,
    coverageScope: entry.coverageScope,
    sourceUrl: entry.sourceUrl,
    sourceDate: entry.sourceDate,
    profileLastReviewed: entry.profileLastReviewed
  };

  // Populate PESTEL-S with prompts
  const pestels = JSON.parse(JSON.stringify(defaultPestelsData)) as Record<string, PestelsItem>;
  Object.keys(pestels).forEach((key) => {
    const item = pestels[key];
    const promptOverride = entry.starterPestelsPrompts[key];
    if (promptOverride) {
      item.finding = `[VERIFY PROMPT] ${promptOverride.prompt}`;
      item.why = `[ASSUMPTION TO TEST] ${promptOverride.whyPrompt}`;
      item.sequencing = '[PROMPT] Define sequencing only after the contextual assumption and mandate authority are verified.';
      // Set to neutral baseline score
      item.rating = {
        impact: 3,
        urgency: 3,
        confidence: 2, // Low confidence initially since it's a seed prompt to verify
        relevance: 3
      };
    } else {
      item.finding = '';
      item.why = '';
      item.sequencing = '';
      item.rating = { impact: 3, urgency: 3, confidence: 2, relevance: 3 };
    }
    item.evidenceNotes = [];
  });

  // Populate Stakeholders from seed
  const stakeholders: Stakeholder[] = entry.starterStakeholderPrompts.flatMap((item, idx) => {
    return item.suggestedStakeholders.map((name, sIdx) => {
      const stakeholderId = `sh-seed-${idx}-${sIdx}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      return {
        id: stakeholderId,
        name: name,
        category: item.category,
        role: `[VERIFY POSTURE] ${item.rolePrompt}`,
        authority: 'Medium',
        influence: 'Medium',
        position: 'Neutral / unknown',
        legitimacy: 'Medium',
        relevance: 'Medium',
        capacity: 'Medium',
        risk: 'Identify potential risks or spoiler tendencies to verify...',
        entry: 'Identify operational entry points for this actor...',
        engagement: 'Identify the recommended communication or coordination posture...',
        cbdAreas: ['Professionalism & Integrity'],
        isCustom: true,
        evidenceNotes: []
      };
    });
  });

  // Initialize Matrix cells as empty defaults, matching getInitialProjectData('blank')
  const customCells: Record<string, CbdCell> = {};

  return {
    profile,
    pestels,
    stakeholders,
    customCells,
    priorityBrief: {
      ...JSON.parse(JSON.stringify(emptyPriorityBrief)),
      topPriorities: [],
      quickWins: [],
      sensitiveReforms: [],
      longerTermReforms: [],
      risksAssumptions: entry.planningThemes.map((theme) => `Verify operational capacity-building indicators for: ${theme}.`),
      sequencingRecommendation: ''
    },
    version: APP_VERSION
  };
}
