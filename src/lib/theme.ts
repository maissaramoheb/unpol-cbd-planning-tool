export const THEME_STORAGE_KEY = 'unpol-cbd-theme';
export const THEME_MODES = ['light', 'dark', 'system'] as const;
export type ThemePreference = typeof THEME_MODES[number];
export type ResolvedTheme = 'light' | 'dark';

export function parseThemePreference(value: string | null): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'system';
}

export function resolveTheme(preference: ThemePreference, systemDark: boolean): ResolvedTheme {
  return preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;
}

// Runs synchronously in head, before content can paint. Only constants enter this script.
export const THEME_INIT_SCRIPT = `(function(){var p='system';try{var v=localStorage.getItem('${THEME_STORAGE_KEY}');if(v==='light'||v==='dark')p=v}catch(e){}var t=p==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;try{localStorage.setItem('${THEME_STORAGE_KEY}',t)}catch(e){}var r=document.documentElement;r.dataset.theme=t;r.dataset.themePreference=t;r.style.colorScheme=t})()`;

interface ThemeEnvironment {
  root: { dataset: { theme?: string; themePreference?: string; themeChanging?: string }; style: { colorScheme: string }; getBoundingClientRect?: () => unknown };
  storage: Pick<Storage, 'getItem' | 'setItem'>;
  media: Pick<MediaQueryList, 'matches' | 'addEventListener' | 'removeEventListener'>;
  events: Pick<Window, 'addEventListener' | 'removeEventListener'>;
}

export function createThemeStore({ root, storage, media, events }: ThemeEnvironment) {
  let preference: ResolvedTheme = resolveTheme(parseThemePreference(root.dataset.themePreference ?? null), media.matches);
  const listeners = new Set<() => void>();
  const read = () => {
    try { return resolveTheme(parseThemePreference(storage.getItem(THEME_STORAGE_KEY)), media.matches); }
    catch { return preference; }
  };
  preference = read();
  try { storage.setItem(THEME_STORAGE_KEY, preference); } catch { /* Session remains usable. */ }
  const apply = () => {
    const theme = preference;
    // Flush the new palette with control transitions disabled, then restore normal interactions.
    // This prevents in-flight intermediate colors and does not animate document previews.
    root.dataset.themeChanging = 'true';
    root.dataset.theme = theme;
    root.dataset.themePreference = preference;
    root.style.colorScheme = theme;
    root.getBoundingClientRect?.();
    delete root.dataset.themeChanging;
  };
  const emit = () => { apply(); listeners.forEach(listener => listener()); };
  const onStorage = (event: Event) => {
    const storageEvent = event as StorageEvent;
    if (storageEvent.key === THEME_STORAGE_KEY || storageEvent.key === null) {
      preference = read();
      emit();
    }
  };

  const setPreference = (next: ResolvedTheme) => {
    preference = next;
    try { storage.setItem(THEME_STORAGE_KEY, next); } catch { /* Session remains usable. */ }
    emit();
  };

  return {
    getSnapshot: () => preference,
    subscribe(listener: () => void) {
      if (listeners.size === 0) {
        events.addEventListener('storage', onStorage);
        apply();
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          events.removeEventListener('storage', onStorage);
        }
      };
    },
    setPreference,
    toggle() { setPreference(preference === 'light' ? 'dark' : 'light'); }
  };
}
