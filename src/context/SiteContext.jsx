import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../config/api';
import { defaultSiteSettings } from '../data/defaultSiteSettings';

const SiteContext = createContext(null);

const STORAGE_KEYS = {
  language: 'omio-language',
  theme: 'omio-theme',
};

export function SiteProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem(STORAGE_KEYS.language) || 'en');
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.theme) || 'light');
  const [siteSettings, setSiteSettings] = useState(defaultSiteSettings);
  const [siteSettingsLoading, setSiteSettingsLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.language, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSiteSettings() {
      try {
        const response = await fetch(`${API_BASE}/api/site-settings`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Unable to load site settings');
        }

        const data = await response.json();
        setSiteSettings({
          ...defaultSiteSettings,
          ...data,
          heroStats: Array.isArray(data.heroStats) ? data.heroStats : defaultSiteSettings.heroStats,
          aboutPage: {
            ...defaultSiteSettings.aboutPage,
            ...(data.aboutPage || {}),
            values: Array.isArray(data.aboutPage?.values) ? data.aboutPage.values : defaultSiteSettings.aboutPage.values,
            expertise: Array.isArray(data.aboutPage?.expertise) ? data.aboutPage.expertise : defaultSiteSettings.aboutPage.expertise,
          },
          aiBot: {
            ...defaultSiteSettings.aiBot,
            ...(data.aiBot || {}),
          },
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.warn('Using default site settings because the API is unavailable:', error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSiteSettingsLoading(false);
        }
      }
    }

    loadSiteSettings();
    return () => controller.abort();
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      siteSettings,
      siteSettingsLoading,
      theme,
      toggleTheme: () => setTheme((current) => (current === 'light' ? 'dark' : 'light')),
    }),
    [language, siteSettings, siteSettingsLoading, theme],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const context = useContext(SiteContext);

  if (!context) {
    throw new Error('useSite must be used within a SiteProvider');
  }

  return context;
}
