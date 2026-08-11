/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');

const { getDashboardContinueStep } = require('../.test-dist/lib/workflow.js');

test('dashboard Continue follows the seven-step workflow', () => {
  assert.equal(getDashboardContinueStep({ isProfileEmpty: true, isPestelsEmpty: true, isStakeholdersEmpty: true, isCustomCellsEmpty: true }), 2);
  assert.equal(getDashboardContinueStep({ isProfileEmpty: false, isPestelsEmpty: true, isStakeholdersEmpty: true, isCustomCellsEmpty: true }), 3);
  assert.equal(getDashboardContinueStep({ isProfileEmpty: false, isPestelsEmpty: false, isStakeholdersEmpty: true, isCustomCellsEmpty: true }), 4);
  assert.equal(getDashboardContinueStep({ isProfileEmpty: false, isPestelsEmpty: false, isStakeholdersEmpty: false, isCustomCellsEmpty: true }), 5);
  assert.equal(getDashboardContinueStep({ isProfileEmpty: false, isPestelsEmpty: false, isStakeholdersEmpty: false, isCustomCellsEmpty: false }), 6);
});
