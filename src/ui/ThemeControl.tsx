'use client';

import { useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';
import { createThemeStore, type ResolvedTheme } from '../lib/theme';

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
const getServerSnapshot = (): ResolvedTheme => 'light';

export function useTheme(): ResolvedTheme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function ThemeControl() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const label = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
  const Icon = theme === 'light' ? Moon : Sun;
  return (
    <div className="theme-control inline-flex shrink-0 rounded-lg border border-border-default bg-surface-subtle p-0.5 shadow-2xs">
      <button type="button" aria-label={label} title={label} onClick={() => getStore().toggle()}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring active:scale-95">
        <Icon size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
