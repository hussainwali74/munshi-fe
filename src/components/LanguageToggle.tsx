'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 text-sm font-medium transition-colors ${
          language === 'en' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background'
        }`}
      >
        English
      </button>
      <button
        onClick={() => setLanguage('ur')}
        className={`px-3 py-1.5 text-sm font-medium transition-colors urdu-text ${
          language === 'ur' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background'
        }`}
      >
        اردو
      </button>
    </div>
  );
}
