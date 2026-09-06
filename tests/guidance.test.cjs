/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');

const {
  FIELD_GUIDANCE,
  HOW_IT_WORKS_DEFAULT_OPEN,
  ORIENTATION_STEPS,
  STAGE_GUIDANCE,
  WELCOME_ACTIONS,
  getStageGuidanceSessionKey,
  isStageGuidanceCollapsed,
  shouldShowBlankWelcome
} = require('../.test-dist/lib/guidance.js');
const { getInitialProjectData } = require('../.test-dist/lib/storage.js');

test('blank welcome has three distinct actions and never represents an existing workspace', () => {
  assert.deepEqual(WELCOME_ACTIONS.map(action => action.label), [
    'Start a New CBD Plan',
    'Explore CARANA',
    'How It Works'
  ]);
  assert.equal(shouldShowBlankWelcome(true), true);
  assert.equal(shouldShowBlankWelcome(false), false);
});

test('How It Works is initially collapsed and contains the seven ordered planning steps', () => {
  assert.equal(HOW_IT_WORKS_DEFAULT_OPEN, false);
  assert.equal(ORIENTATION_STEPS.length, 7);
  assert.equal(ORIENTATION_STEPS[0].title, 'Establish Context & Mandate');
  assert.equal(ORIENTATION_STEPS[3].title, 'Synthesize the Analysis');
  assert.equal(ORIENTATION_STEPS[6].title, 'Design for Results & Implementation');
});

test('stage guidance covers all seven planning stages with complete content', () => {
  assert.deepEqual(Object.keys(STAGE_GUIDANCE), ['1', '2', '3', '4', '5', '6', '7']);
  Object.values(STAGE_GUIDANCE).forEach(content => {
    assert.ok(content.doing);
    assert.ok(content.why);
    assert.ok(content.next);
  });
  assert.match(STAGE_GUIDANCE[2].title, /Context & Evidence/);
  assert.match(STAGE_GUIDANCE[4].title, /SWOT & Strategic Options/);
  assert.match(STAGE_GUIDANCE[7].title, /Results & Implementation/);
});

test('collapsed stage state is isolated per stage and fails safely', () => {
  assert.notEqual(getStageGuidanceSessionKey(2), getStageGuidanceSessionKey(3));
  assert.equal(isStageGuidanceCollapsed('true'), true);
  assert.equal(isStageGuidanceCollapsed('false'), false);
  assert.equal(isStageGuidanceCollapsed('{bad json'), false);
  assert.equal(isStageGuidanceCollapsed(null), false);
});

test('only the approved fields expose CARANA examples', () => {
  const fieldsWithExamples = Object.entries(FIELD_GUIDANCE)
    .filter(([, content]) => 'example' in content)
    .map(([key]) => key);
  assert.deepEqual(fieldsWithExamples, [
    'capacityProblem',
    'planningObjective',
    'individual',
    'organizational',
    'enablingEnvironment',
    'indicator'
  ]);
});

test('presentation guidance remains outside persisted project data', () => {
  const serializedProject = JSON.stringify(getInitialProjectData('blank'));
  assert.equal(serializedProject.includes('guidance'), false);
  assert.equal(serializedProject.includes('unpol-cbd-guidance-v1'), false);
});
