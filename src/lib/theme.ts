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
export const THEME_INIT_SCRIPT = `(function(){var p='system';try{var v=localStorage.getItem('${THEME_STORAGE_KEY}');if(v==='light'||v==='dark')p=v}catch(e){}var t=p==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;var r=document.documentElement;r.dataset.theme=t;r.dataset.themePreference=p;r.style.colorScheme=t})()`;

interface ThemeEnvironment {
  root: { dataset: { theme?: string; themePreference?: string }; style: { colorScheme: string } };
  storage: Pick<Storage, 'getItem' | 'setItem'>;
  media: Pick<MediaQueryList, 'matches' | 'addEventListener' | 'removeEventListener'>;
  events: Pick<Window, 'addEventListener' | 'removeEventListener'>;
}

export function createThemeStore({ root, storage, media, events }: ThemeEnvironment) {
  let preference = parseThemePreference(root.dataset.themePreference ?? null);
  const listeners = new Set<() => void>();
  const read = () => {
    try { return parseThemePreference(storage.getItem(THEME_STORAGE_KEY)); }
    catch { return preference; }
  };
  preference = read();
  const apply = () => {
    const theme = resolveTheme(preference, media.matches);
    root.dataset.theme = theme;
    root.dataset.themePreference = preference;
    root.style.colorScheme = theme;
  };
  const emit = () => { apply(); listeners.forEach(listener => listener()); };
  const onMediaChange = () => { if (preference === 'system') apply(); };
  const onStorage = (event: Event) => {
    const storageEvent = event as StorageEvent;
    if (storageEvent.key === THEME_STORAGE_KEY || storageEvent.key === null) {
      preference = read();
      emit();
    }
  };

  return {
    getSnapshot: () => preference,
    subscribe(listener: () => void) {
      if (listeners.size === 0) {
        media.addEventListener('change', onMediaChange);
        events.addEventListener('storage', onStorage);
        apply();
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          media.removeEventListener('change', onMediaChange);
          events.removeEventListener('storage', onStorage);
        }
      };
    },
    setPreference(next: ThemePreference) {
      preference = next;
      try { storage.setItem(THEME_STORAGE_KEY, next); } catch { /* Session remains usable. */ }
      emit();
    }
  };
}
