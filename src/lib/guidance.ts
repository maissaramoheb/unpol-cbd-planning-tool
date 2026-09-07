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
  { title: 'Establish Context & Mandate', description: 'Define the planning purpose, scope and operating context.' },
  { title: 'Diagnose the Environment', description: 'Examine evidence and conditions affecting police capacity and reform.' },
  { title: 'Understand Stakeholders & Ownership', description: 'Identify actors who influence, enable, own, resist or sustain change.' },
  { title: 'Synthesize the Analysis', description: 'Turn evidence and stakeholder understanding into SWOT findings and strategic options.' },
  { title: 'Define CBD Priorities', description: 'Identify capacity problems, objectives and appropriate intervention packages.' },
  { title: 'Prioritize & Sequence', description: 'Determine what matters most, who should lead, and what should happen first.' },
  { title: 'Design for Results & Implementation', description: 'Review how selected interventions translate into responsibilities, milestones, indicators and implementation conditions.' }
] as const;

export type GuidanceStage = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface StageGuidanceContent {
  title: string;
  doing: string;
  why: string;
  next: string;
}

export const STAGE_GUIDANCE: Record<GuidanceStage, StageGuidanceContent> = {
  1: {
    title: 'Context & Mandate · Planning Context',
    doing: 'Define the planning context, mandate and purpose of the CBD exercise.',
    why: 'Capacity-building priorities should respond to a clearly understood operating and institutional context.',
    next: 'This context will help frame the evidence, actors and priorities that follow.'
  },
  2: {
    title: 'Diagnostic Analysis · Context & Evidence',
    doing: 'Identify the external and institutional conditions that could enable, constrain or shape CBD.',
    why: 'CBD priorities should be grounded in the environment in which police institutions operate.',
    next: 'These findings will help you identify relevant actors and justify later CBD priorities.'
  },
  3: {
    title: 'Stakeholders & Ownership · Actors & Ownership',
    doing: 'Identify the actors who can influence, enable, resist, own or sustain the proposed CBD response.',
    why: 'CBD depends on ownership, authority, legitimacy, capacity and stakeholder support—not only technical solutions.',
    next: 'These actors and evidence will support SWOT findings and strategic options in the next stage.'
  },
  4: {
    title: 'Analysis Synthesis · SWOT & Strategic Options',
    doing: 'Turn recorded evidence and stakeholder understanding into analyst-written SWOT findings and strategic options.',
    why: 'Synthesis makes the reasoning between diagnosis and proposed CBD priorities visible without determining the response automatically.',
    next: 'These optional findings and options can be linked to the CBD priorities you define next.'
  },
  5: {
    title: 'CBD Priorities · Capacity Problems & Responses',
    doing: 'Translate evidence and analysis into specific capacity problems, objectives and intervention packages.',
    why: 'This is where analysis becomes a concrete CBD planning proposition.',
    next: 'These priorities will later be sequenced, assigned and included in the planning brief.'
  },
  6: {
    title: 'Prioritization & Sequencing · Implementation Path',
    doing: 'Decide which interventions matter most, what should happen first, and who should lead.',
    why: 'Not every valid intervention can or should happen at the same time.',
    next: 'These decisions become the implementation logic presented in the final brief.'
  },
  7: {
    title: 'Results & Implementation · Results & Delivery',
    doing: 'Turning selected CBD priorities into measurable and implementable results plans.',
    why: 'A valid capacity-building priority needs a credible path from intervention to results, implementation, monitoring, ownership and sustainability.',
    next: 'This structured data will support professional results frameworks, Logframes, M&E matrices and implementation workplans. These are future output types.'
  }
};

export const NEXT_STEP_CUES: Record<Exclude<GuidanceStage, 7>, { title: string; description: string }> = {
  1: { title: 'Next: Diagnose the environment', description: 'Use the planning context to assess the evidence and conditions that could shape or constrain CBD.' },
  2: { title: 'Next: Understand stakeholders and ownership', description: 'Examine who can enable, influence, own, resist or sustain the response.' },
  3: { title: 'Next: Synthesize the analysis', description: 'Bring together evidence, operating-environment findings and stakeholder analysis before defining CBD priorities.' },
  4: { title: 'Next: Define CBD priorities', description: 'Use the optional SWOT findings and Strategic Options to inform capacity problems, objectives and responses.' },
  5: { title: 'Next: Prioritize and sequence', description: 'Now decide what matters most, who should lead and what should happen first.' },
  6: { title: 'Next: Review results and implementation', description: 'Review how recorded priorities, responsibilities, timing, indicators and conditions come together before producing an output.' }
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
