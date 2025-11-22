'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { translations, Language } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Always start with the same default for both SSR and client to avoid hydration mismatch
  const [language, setLanguageState] = useState<Language>('ur');
  const [mounted, setMounted] = useState(false);

  // Load from localStorage after component mounts
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language') as Language | null;
      if (savedLang) {
        setLanguageState(savedLang);
      }
    }
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
    if (language === 'ur') {
      document.body.classList.add('urdu-text');
    } else {
      document.body.classList.remove('urdu-text');
    }
  }, [language, mounted]);

  const t = (path: string) => {
    const keys = path.split('.');
    let current: any = translations[language];

    for (const key of keys) {
      if (current[key] === undefined) {
        console.warn(`Translation missing for key: ${path} in language: ${language}`);
        return path;
      }
      current = current[key];
    }

    return current;
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
