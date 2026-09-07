import type { UnpolProjectData } from '../types';
import { emptyResultsPlan, normalizeResultsReferences, structuredIndicators } from '../lib/resultsPlanning';

// Fictional exercise extensions only. Existing objectives, interventions and indicator statements are preserved.
export function addCaranaResults(data: UnpolProjectData): UnpolProjectData {
  const examples = [
    { key: 'Accountability Mechanisms|Human Rights', owner: 'sh-inspectorate', output: 'Safeguarded complaint register and inspectorate review procedure ready for the two-station pilot.', detail: 'Agree access safeguards and rehearse one complaint referral with station supervisors.', baseline: 'Fictional baseline: complaint recording and follow-up are inconsistent.', target: 'By the 90-day pilot review, both stations can trace recorded complaints through referral and follow-up.', verification: 'Pilot complaint registers and inspectorate review notes, with protected access.', assumption: 'National and regional command permit safeguarded inspectorate access.', mitigation: 'Limit access to sensitive records and review unresolved referrals through the Inspectorate.', resource: 'Protected record storage and designated inspectorate review time.', sustainability: 'Assign routine review responsibility and maintain safeguards in station procedures.' },
    { key: 'Stakeholder Engagement|Gender', owner: 'sh-local-command', output: 'Protected liaison arrangements and a usable referral directory for the Kantara pilot.', detail: 'Review safe contact and referral routes with women’s networks before public engagement.', baseline: 'Fictional baseline: access barriers are reported but not reviewed systematically.', target: 'At the 12-week review, focal points can demonstrate safe referral routes informed by participant feedback.', verification: 'Anonymized consultation notes and referral-directory reviews; avoid identifying participants.', assumption: 'Representatives can participate without heightened protection risks.', mitigation: 'Use discreet consultation and stop activities that expose participants to harm.', resource: 'Private consultation space and protected focal-point time.', sustainability: 'Maintain safe feedback channels and update referral contacts through regional supervision.' },
    { key: 'Administrative Systems|Police Practice', owner: 'sh-local-command', output: 'One minimum incident and handover register with a supervisory-review checklist.', detail: 'Map duplicate station records and test the minimum register with the duty supervisor.', baseline: 'Fictional baseline: supervisory review and register completion are not standardized.', target: 'At the first review within 30 days, pilot supervisors can demonstrate consistent register checks and action carry-forward.', verification: 'Sample station registers and weekly supervisory-review notes.', assumption: 'Supervisors have time and authority to simplify duplicate recording.', mitigation: 'Retire duplicate forms only after agreement and keep basic stationery available.', resource: 'Register supplies and supervisor coaching time.', sustainability: 'Embed the minimum register and review routine in station induction and supervision.' }
  ];
  const customCells = { ...data.customCells };
  examples.forEach((e, index) => {
    const cell = customCells[e.key];
    if (!cell) return;
    const prefix = 'carana-results-' + (index + 1);
    const output = prefix + '-out1', activity = prefix + '-act1', assumption = prefix + '-ass1', dependency = prefix + '-dep1', resource = prefix + '-res1';
    const p = emptyResultsPlan();
    p.outputs = [{ id: output, reference: 'OUT-01', statement: e.output, interventionLevels: ['organizational'], note: 'Fictional exercise material; pilot design requires counterpart review.' }];
    p.activities = [{ id: activity, reference: 'ACT-01', statement: e.detail, interventionLevel: 'organizational', outputIds: [output], implementingActorId: e.owner, supportingActorIds: ['sh-unpol-lead'], timeframe: '', milestone: '', dependencyIds: [dependency], resourceIds: [resource] }];
    p.assumptions = [{ id: assumption, statement: e.assumption, importance: 'Critical', reviewNote: index === 1 ? '' : 'Confirm the exercise assumption with the designated counterpart before starting.' }];
    p.changeLogic = { interventionLevels: ['organizational'], activityIds: [activity], because: 'Fictional planning rationale: a limited, supervised pilot can reveal whether the agreed process works in routine practice before wider adoption.', assumptionIds: [assumption] };
    p.dependencies = [{ id: dependency, type: 'Policy approval', statement: 'Counterpart authorization of pilot scope and safeguards is required.', linkedPriorityKey: null, linkedRecordId: null, status: 'Required' }];
    p.resources = [{ id: resource, category: index === 2 ? 'Logistics / Equipment' : 'Human Resources', statement: e.resource, availability: 'Unknown' }];
    p.riskManagement = { mitigation: e.mitigation, responsibleActorId: e.owner, reviewNote: 'Review at the existing priority milestone; fictional exercise material.' };
    p.ownership = { counterpartActorId: e.owner, status: 'Consulted', note: 'Fictional consultation identifies a possible owner; support and authorization remain to be established.' };
    p.sustainability = [{ id: prefix + '-sus1', dimension: 'Institutional responsibility', requirement: e.sustainability }];
    const indicators = structuredIndicators(cell).map((i, n) => ({ ...i,
      resultLevel: n === 0 ? 'Intended Result / Outcome' as const : n === 1 ? 'Output' as const : n === 2 ? 'Activity / Process' as const : 'Not assigned' as const,
      linkedRecordId: n === 0 ? cell.key : n === 1 ? output : n === 2 ? activity : null,
      baseline: n === 0 ? e.baseline : '', target: n === 0 ? e.target : '',
      verification: n < 2 ? e.verification : '', frequency: n === 0 ? 'At milestone' as const : n === 1 ? 'Monthly' as const : 'Not assigned' as const,
      responsibleActorId: n < 2 ? e.owner : null, note: 'Fictional exercise material; refine the measure before use.'
    }));
    customCells[e.key] = { ...cell, indicators, resultsPlan: p };
  });
  return normalizeResultsReferences({ ...data, customCells });
}
