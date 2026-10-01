/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { createThemeStore, parseThemePreference, resolveTheme, THEME_INIT_SCRIPT, THEME_STORAGE_KEY } = require('../.test-dist/lib/theme.js');
const { getInitialProjectData } = require('../.test-dist/lib/storage.js');
const { buildCaranaDemoData } = require('../.test-dist/data/caranaDemo.js');
const { buildExecutiveBriefModel, executiveBriefMarkdown } = require('../.test-dist/lib/executiveBrief.js');
const { buildPlanningBriefModel } = require('../.test-dist/lib/reportModel.js');
const { generateMarkdownBrief } = require('../.test-dist/lib/exportMarkdown.js');
const { buildPlanningOutput, planningOutputMarkdown } = require('../.test-dist/lib/planningOutputs.js');

function environment(saved = null, dark = false, blocked = false) {
  const values = new Map(saved ? [[THEME_STORAGE_KEY, saved]] : []);
  const mediaListeners = new Set(), storageListeners = new Set();
  const root = { dataset: {}, style: { colorScheme: '' } };
  const storage = {
    getItem: key => { if (blocked) throw Error('Storage blocked'); return values.get(key) ?? null; },
    setItem: (key, value) => { if (blocked) throw Error('Storage blocked'); values.set(key, value); }
  };
  const media = { matches: dark, addEventListener: (_, fn) => mediaListeners.add(fn), removeEventListener: (_, fn) => mediaListeners.delete(fn) };
  const events = { addEventListener: (_, fn) => storageListeners.add(fn), removeEventListener: (_, fn) => storageListeners.delete(fn) };
  const env = { root, storage, media, events };
  return { ...env, values, mediaListeners, storageListeners,
    store: createThemeStore(env),
    os(next) { media.matches = next; mediaListeners.forEach(fn => fn()); },
    otherTab(value, key = THEME_STORAGE_KEY) { storage.setItem(key, value); storageListeners.forEach(fn => fn({ key })); }
  };
}
for (const preference of ['light', 'dark', 'system']) {
  test(`${preference} preference applies, persists and restores independently`, () => {
    const e = environment(null, true); const off = e.store.subscribe(() => {});
    e.store.setPreference(preference);
    assert.equal(e.store.getSnapshot(), preference);
    assert.equal(e.root.dataset.theme, preference === 'system' ? 'dark' : preference);
    assert.equal(e.root.style.colorScheme, e.root.dataset.theme);
    assert.equal(e.values.get(THEME_STORAGE_KEY), preference);
    const restored = environment(e.values.get(THEME_STORAGE_KEY), true); restored.store.subscribe(() => {});
    assert.equal(restored.store.getSnapshot(), preference); off();
    assert.equal(e.mediaListeners.size, 0); assert.equal(e.storageListeners.size, 0);
  });
  for (const dark of [false, true]) test(`first paint: ${preference} with ${dark ? 'dark' : 'light'} OS`, () => {
    const e = environment(preference, dark);
    vm.runInNewContext(THEME_INIT_SCRIPT, { localStorage: e.storage, window: { matchMedia: () => e.media }, document: { documentElement: e.root } });
    assert.equal(e.root.dataset.theme, resolveTheme(preference, dark));
    assert.equal(e.root.dataset.themePreference, preference);
  });
}
test('system follows OS changes immediately without notifying React project consumers', () => {
  const e = environment('system'); let notifications = 0; e.store.subscribe(() => notifications++);
  e.os(true); assert.equal(e.root.dataset.theme, 'dark'); e.os(false); assert.equal(e.root.dataset.theme, 'light');
  assert.equal(e.store.getSnapshot(), 'system'); assert.equal(notifications, 0);
});
for (const preference of ['light', 'dark']) test(`explicit ${preference} ignores OS changes`, () => {
  const e = environment(preference); e.store.subscribe(() => {});
  e.os(true); e.os(false); assert.equal(e.root.dataset.theme, preference);
});
test('invalid/missing preferences resolve to System', () => {
  for (const value of [null, '', 'invalid', 'DARK']) assert.equal(parseThemePreference(value), 'system');
  assert.equal(resolveTheme('system', true), 'dark'); assert.equal(resolveTheme('system', false), 'light');
});
test('blocked storage does not prevent first-paint resolution or explicit session choice', () => {
  const e = environment(null, true, true);
  vm.runInNewContext(THEME_INIT_SCRIPT, { localStorage: e.storage, window: { matchMedia: () => e.media }, document: { documentElement: e.root } });
  assert.equal(e.root.dataset.theme, 'dark'); e.store.subscribe(() => {}); e.store.setPreference('light');
  assert.equal(e.root.dataset.theme, 'light'); e.os(true); assert.equal(e.root.dataset.theme, 'light');
});
test('cross-tab preferences synchronize; project storage events do not affect theme', () => {
  const e = environment('light'); let n = 0; e.store.subscribe(() => n++);
  e.otherTab('dark'); assert.equal(e.root.dataset.theme, 'dark'); assert.equal(n, 1);
  e.otherTab('project-data', 'unpol-project'); assert.equal(e.store.getSnapshot(), 'dark'); assert.equal(n, 1);
});
test('theme changes leave canonical project, JSON and every professional output unchanged', () => {
  const project = buildCaranaDemoData(getInitialProjectData());
  const json = JSON.stringify(project);
  const outputs = () => [generateMarkdownBrief(buildPlanningBriefModel(project)), executiveBriefMarkdown(buildExecutiveBriefModel(project)), ...['logframe', 'monitoring', 'workplan'].map(kind => planningOutputMarkdown(buildPlanningOutput(project, kind)))];
  const before = outputs(); const e = environment(); e.values.set('unpol-project', json); e.store.subscribe(() => {});
  for (const mode of ['dark', 'light', 'system']) { e.store.setPreference(mode); e.os(true); assert.equal(JSON.stringify(project), json); assert.equal(e.values.get('unpol-project'), json); assert.deepEqual(outputs(), before); }
  assert.deepEqual([...e.values.keys()].sort(), [THEME_STORAGE_KEY, 'unpol-project'].sort());
});
