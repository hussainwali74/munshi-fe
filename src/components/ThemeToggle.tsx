'use client';

import { Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 p-1 bg-surface border border-border rounded-lg">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-md transition-colors ${
          theme === 'light' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background'
        }`}
        title="Light Mode"
      >
        <Sun size={16} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-md transition-colors ${
          theme === 'dark' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background'
        }`}
        title="Dark Mode"
      >
        <Moon size={16} />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-md transition-colors ${
          theme === 'system' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background'
        }`}
        title="System Preference"
      >
        <Laptop size={16} />
      </button>
    </div>
  );
}
