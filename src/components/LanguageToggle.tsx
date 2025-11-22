'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 p-1 bg-background border border-border rounded-xl">
      <button
        onClick={() => setLanguage('en')}
        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${language === 'en'
          ? 'bg-primary text-white shadow-md transform scale-105'
          : 'text-text-secondary hover:bg-surface hover:text-text-primary'
          }`}
        aria-label="Switch to English"
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('ur')}
        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 urdu-text ${language === 'ur'
          ? 'bg-primary text-white shadow-md transform scale-105'
          : 'text-text-secondary hover:bg-surface hover:text-text-primary'
          }`}
        aria-label="Switch to Urdu"
        aria-pressed={language === 'ur'}
      >
        اردو
      </button>
    </div>
  );
}
