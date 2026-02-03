import fs from 'fs';
import path from 'path';
import { translations } from '@/lib/translations';

type TranslationTree = Record<string, string | TranslationTree>;

const flattenKeys = (obj: TranslationTree, prefix = ''): string[] => {
  const keys: string[] = [];
  Object.entries(obj).forEach(([key, value]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as TranslationTree, next));
    } else {
      keys.push(next);
    }
  });
  return keys;
};

const walkFiles = (dir: string, files: string[] = []) => {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, files);
      return;
    }
    if (entry.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  });
  return files;
};

const extractTKeys = (content: string) => {
  const keys = new Set<string>();
  const regex = /\bt\(\s*(['"`])([^'"`]+)\1/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    keys.add(match[2]);
  }
  return Array.from(keys);
};

describe('translations coverage', () => {
  it('all t() keys exist in both languages', () => {
    const srcDir = path.join(__dirname, '..');
    const files = walkFiles(srcDir);

    const usedKeys = new Set<string>();
    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf8');
      extractTKeys(content).forEach((key) => usedKeys.add(key));
    });

    const enKeys = new Set(flattenKeys(translations.en as TranslationTree));
    const urKeys = new Set(flattenKeys(translations.ur as TranslationTree));

    const missingEn: string[] = [];
    const missingUr: string[] = [];

    usedKeys.forEach((key) => {
      if (key.includes('${')) return; // Dynamic keys are validated elsewhere
      if (!enKeys.has(key)) missingEn.push(key);
      if (!urKeys.has(key)) missingUr.push(key);
    });

    if (missingEn.length || missingUr.length) {
      throw new Error(
        [
          'Missing translations:',
          missingEn.length ? `EN:\n${missingEn.sort().join('\n')}` : 'EN: none',
          missingUr.length ? `UR:\n${missingUr.sort().join('\n')}` : 'UR: none',
        ].join('\n\n')
      );
    }
  });
});
