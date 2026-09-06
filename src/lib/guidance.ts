export const WELCOME_ACTIONS = [
  { id: 'start', label: 'Start a New CBD Plan' },
  { id: 'carana', label: 'Explore CARANA' },
  { id: 'how-it-works', label: 'How It Works' }
] as const;

export const HOW_IT_WORKS_DEFAULT_OPEN = false;

export function shouldShowBlankWelcome(isWorkspaceEmpty: boolean): boolean {
  return isWorkspaceEmpty;
}

export const ORIENTATION_STEPS = [
  { title: 'Understand the Context', description: 'Define the mission environment, mandate and planning purpose.' },
  { title: 'Examine Evidence', description: 'Identify relevant political, security, institutional and operating conditions.' },
  { title: 'Understand the Actors', description: 'Map who has authority, influence, legitimacy, capacity and interest.' },
  { title: 'Define the Capacity Problem', description: 'Identify what needs to change—not simply what activity should be delivered.' },
  { title: 'Design the CBD Response', description: 'Set an objective and consider interventions at the individual, organizational and enabling-environment levels.' },
  { title: 'Prioritize & Sequence', description: 'Decide what matters, who should lead, and what should happen NOW, NEXT or LATER.' },
  { title: 'Produce the Planning Brief', description: 'Turn the analysis into a structured, reviewable professional document.' }
] as const;

export type GuidanceStage = 2 | 3 | 4 | 5 | 6 | 7;

export interface StageGuidanceContent {
  title: string;
  doing: string;
  why: string;
  next: string;
}

export const STAGE_GUIDANCE: Record<GuidanceStage, StageGuidanceContent> = {
  2: {
    title: 'Profile · Context',
    doing: 'Define the planning context, mandate and purpose of the CBD exercise.',
    why: 'Capacity-building priorities should respond to a clearly understood operating and institutional context.',
    next: 'This context will help frame the evidence, actors and priorities that follow.'
  },
  3: {
    title: 'PESTEL-S · Context & Evidence',
    doing: 'Identify the external and institutional conditions that could enable, constrain or shape CBD.',
    why: 'CBD priorities should be grounded in the environment in which police institutions operate.',
    next: 'These findings will help you identify relevant actors and justify later CBD priorities.'
  },
  4: {
    title: 'Actors · Stakeholders',
    doing: 'Identify the actors who can influence, enable, resist, own or sustain the proposed CBD response.',
    why: 'CBD depends on ownership, authority, legitimacy, capacity and stakeholder support—not only technical solutions.',
    next: 'These actors can later be linked to priorities as leads, supporters or stakeholders requiring engagement.'
  },
  5: {
    title: 'CBD Matrix · Capacity Priorities',
    doing: 'Translate evidence and analysis into specific capacity problems, objectives and intervention packages.',
    why: 'This is where analysis becomes a concrete CBD planning proposition.',
    next: 'These priorities will later be sequenced, assigned and included in the planning brief.'
  },
  6: {
    title: 'Priority & Sequencing · Implementation Path',
    doing: 'Decide which interventions matter most, what should happen first, and who should lead.',
    why: 'Not every valid intervention can or should happen at the same time.',
    next: 'These decisions become the implementation logic presented in the final brief.'
  },
  7: {
    title: 'Export · Planning Brief',
    doing: 'Review the complete planning logic and produce a structured planning brief.',
    why: 'The value of the tool is not only the analysis—it is making the reasoning visible, reviewable and transferable.',
    next: 'The exported brief can support discussion, review, refinement and further planning.'
  }
};

export const NEXT_STEP_CUES: Record<Exclude<GuidanceStage, 7>, { title: string; description: string }> = {
  2: { title: 'Next: Examine the context and evidence', description: 'Use the profile to assess the conditions that could shape or constrain CBD.' },
  3: { title: 'Next: Understand the actors', description: 'You have identified conditions affecting CBD. Next, examine who can enable, influence, resist or sustain the response.' },
  4: { title: 'Next: Synthesize the analysis', description: 'Bring together evidence, operating-environment findings and stakeholder analysis before defining CBD priorities.' },
  5: { title: 'Next: Prioritize and sequence', description: 'Now decide what matters most, who should lead and what should happen first.' },
  6: { title: 'Next: Produce the planning brief', description: 'Review how the recorded priorities, responsibilities and sequencing come together in a transferable output.' }
};

export const FIELD_GUIDANCE = {
  capacityProblem: {
    help: 'What is not working, missing or insufficient?',
    example: 'Kantara stations lack a consistent, safeguarded process for recording, referring, reviewing and following up complaints and detention concerns.'
  },
  planningObjective: {
    help: 'What should become different if the intervention succeeds?',
    example: 'Establish and test a traceable complaint and detention-review workflow in selected Kantara stations with documented inspectorate follow-up.'
  },
  individual: {
    help: 'What should personnel know, do or perform differently?',
    example: 'Coach relevant personnel to document allegations, preserve evidence and apply complaint-review procedures consistently.'
  },
  organizational: {
    help: 'What system, process, structure or management practice should improve?',
    example: 'Pilot a traceable complaint and detention-review workflow linking selected Kantara stations with the police inspectorate.'
  },
  enablingEnvironment: {
    help: 'What policy, legal, institutional, oversight or external condition may need to change?',
    example: 'Clarify referral and review relationships among police headquarters, the inspectorate, justice actors and the mission human rights component.'
  },
  leadActor: { help: 'Who should carry primary responsibility for advancing this intervention?' },
  supportingActors: { help: 'Who else needs to contribute, enable or support implementation?' },
  implementationPhase: { help: 'Use NOW, NEXT or LATER to express relative sequencing. This is a planning judgement, not an automatic recommendation.' },
  evidenceConfidence: { help: 'How confident are you in the evidence supporting this conclusion? This does not determine the priority score.' },
  indicativeScore: { help: 'This heuristic supports discussion. It does not represent UN methodology and does not make the decision for you.' },
  indicator: {
    help: 'What observable sign would show that the intended change is happening?',
    example: 'Monthly inspectorate review completed and referral outcomes recorded.'
  }
} as const;

export const STAGE_GUIDANCE_SESSION_PREFIX = 'unpol-cbd-guidance-v1:collapsed:';

export function getStageGuidanceSessionKey(stage: GuidanceStage): string {
  return `${STAGE_GUIDANCE_SESSION_PREFIX}${stage}`;
}

export function isStageGuidanceCollapsed(rawValue: string | null): boolean {
  return rawValue === 'true';
}
