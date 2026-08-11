/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');

const { calculatePriorityScore, getCbdScoringInputs } = require('../.test-dist/lib/scoring.js');

const neutral = {
  impact: 3,
  urgency: 3,
  feasibility: 3,
  risk: 3,
  stakeholderSupport: 3,
  mandateRelevance: 3,
  confidenceLevel: 3
};

test('neutral ratings produce a neutral indicative score', () => {
  assert.equal(calculatePriorityScore(neutral), 3);
});

test('impact, urgency, and mandate relevance affect the score independently', () => {
  assert.equal(calculatePriorityScore({ ...neutral, impact: 5 }), 3.5);
  assert.equal(calculatePriorityScore({ ...neutral, urgency: 5 }), 3.4);
  assert.equal(calculatePriorityScore({ ...neutral, mandateRelevance: 5 }), 3.4);
});

test('evidence confidence qualifies the assessment but does not change priority', () => {
  const lowConfidence = calculatePriorityScore({ ...neutral, confidenceLevel: 1 });
  const highConfidence = calculatePriorityScore({ ...neutral, confidenceLevel: 5 });
  assert.equal(lowConfidence, highConfidence);
});

test('legacy workspaces map stored priority to impact without duplicating urgency', () => {
  const inputs = getCbdScoringInputs({
    key: 'Area|Lens',
    why: '',
    individual: '',
    organizational: '',
    environment: '',
    indicators: [],
    drivers: [],
    stakeholders: [],
    risks: '',
    sequencing: '',
    confidence: 2,
    priorityScore: 5,
    result: '',
    engagement: ''
  });

  assert.equal(inputs.impact, 5);
  assert.equal(inputs.urgency, 3);
  assert.equal(inputs.mandateRelevance, 3);
});
