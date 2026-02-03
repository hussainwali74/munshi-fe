'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { translations, Language } from '@/lib/translations';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Always start with the same default for both SSR and client to avoid hydration mismatch
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);
  const [customTranslations, setCustomTranslations] = useState<Record<string, string>>({});

  // Load from localStorage after component mounts
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language') as Language | null;
      if (savedLang) {
        setLanguageState(savedLang);
      }
    }

    // Load merged translations (System + Custom)
    import('@/app/settings/translation-actions').then(({ getMergedTranslations }) => {
      getMergedTranslations().then(({ system, custom }) => {
        const map: Record<string, string> = {};

        // System defaults first
        system.forEach(item => {
          map[`${item.lang}:${item.key}`] = item.value;
        });

        // Custom overrides second
        custom.forEach(item => {
          map[`${item.lang}:${item.key}`] = item.value;
        });

        setCustomTranslations(map);
      }).catch(console.error);
    });
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  // Update DOM when language changes (only on client after mount)
  useEffect(() => {
    if (!mounted) return;

    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;

    // IMPORTANT: Apply urdu-text to html element, NOT body
    // Applying to body causes hydration mismatch which breaks all event handlers
    if (language === 'ur') {
      document.documentElement.classList.add('urdu-text');
    } else {
      document.documentElement.classList.remove('urdu-text');
    }
  }, [language, mounted]);

  const t = (path: string, vars?: Record<string, string | number>) => {
    const applyVars = (value: string) => {
      if (!vars) return value;
      return value.replace(/\{(\w+)\}/g, (_, key: string) => {
        const replacement = vars[key];
        return replacement === undefined ? `{${key}}` : String(replacement);
      });
    };

    // Check custom translation first
    const customKey = `${language}:${path}`;
    if (customTranslations[customKey]) {
      return applyVars(customTranslations[customKey]);
    }

    const keys = path.split('.');
    let current: unknown = translations[language] as Record<string, unknown>;

    for (const key of keys) {
      if (!isRecord(current) || current[key] === undefined) {
        // console.warn(`Translation missing for key: ${path} in language: ${language}`);
        return applyVars(path);
      }
      current = current[key];
    }

    return applyVars(typeof current === 'string' ? current : path);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, dir: language === 'ur' ? 'rtl' : 'ltr' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
