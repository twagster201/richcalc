import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { detectDefaults } from './settings-data';

const SettingsContext = createContext(null);
const STORAGE_KEY = 'richcalc:settings';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

const locale = typeof navigator !== 'undefined' ? navigator.language || 'en-US' : 'en-US';

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => ({
    theme: 'system',
    ...detectDefaults(locale),
    ...load(),
  }));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* storage unavailable: settings just won't persist */
    }
  }, [settings]);

  // Apply the theme to <html> and follow the OS when set to "system".
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = settings.theme === 'dark' || (settings.theme === 'system' && media.matches);
      document.documentElement.classList.toggle('dark', dark);
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [settings.theme]);

  const update = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), []);

  const value = useMemo(() => {
    const { currency } = settings;
    const moneyFmt = {};
    const money = (v, { decimals, compact } = {}) => {
      if (!Number.isFinite(v)) return '—';
      const key = `${decimals}-${compact}`;
      moneyFmt[key] ??= new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        ...(compact ? { notation: 'compact', maximumFractionDigits: 1 } : {}),
        ...(decimals !== undefined ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals } : {}),
      });
      return moneyFmt[key].format(v);
    };
    const number = (v, decimals = 0) =>
      Number.isFinite(v)
        ? v.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : '—';
    const date = (d, opts = { day: 'numeric', month: 'long', year: 'numeric' }) =>
      d ? d.toLocaleDateString(locale, opts) : '—';
    const currencySymbol =
      new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' })
        .formatToParts(0)
        .find((p) => p.type === 'currency')?.value ?? currency;

    return {
      ...settings,
      locale,
      currencySymbol,
      imperial: settings.units === 'imperial',
      setCurrency: (currency) => update({ currency }),
      setUnits: (units) => update({ units }),
      setTheme: (theme) => update({ theme }),
      money,
      number,
      date,
    };
  }, [settings, update]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
