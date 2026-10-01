'use client';

import { useSyncExternalStore } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { createThemeStore, type ThemePreference } from '../lib/theme';

let store: ReturnType<typeof createThemeStore> | undefined;
function getStore() {
  if (!store) {
    store = createThemeStore({
      root: document.documentElement,
      // Accessors keep a SecurityError from disabling the UI in restricted browsers.
      storage: {
        getItem: key => window.localStorage.getItem(key),
        setItem: (key, value) => window.localStorage.setItem(key, value)
      },
      media: window.matchMedia('(prefers-color-scheme: dark)'),
      events: window
    });
  }
  return store;
}
const subscribe = (listener: () => void) => getStore().subscribe(listener);
const getSnapshot = () => getStore().getSnapshot();
const getServerSnapshot = (): ThemePreference => 'system';
const modes = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor }
] as const;

export function ThemeControl() {
  const preference = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return (
    <div role="group" aria-label="Appearance" className="theme-control inline-flex shrink-0 gap-0.5 rounded-md border border-border-default bg-surface-subtle p-0.5">
      {modes.map(({ value, label, Icon }) => (
        <button key={value} type="button" aria-label={`${label} theme`} title={`${label} theme`}
          aria-pressed={preference === value} onClick={() => getStore().setPreference(value)}
          className={`inline-flex h-8 w-8 items-center justify-center rounded transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${preference === value ? 'bg-surface-active text-action-link shadow-subtle' : 'text-text-muted hover:bg-surface-hover hover:text-text-primary'}`}>
          <Icon size={15} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
