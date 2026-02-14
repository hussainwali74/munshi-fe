import { translations, type Language } from '@/lib/translations';

export type TranslationVars = Record<string, string | number>;
export type Translator = (path: string, vars?: TranslationVars) => string;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

export const createTranslator = (lang: Language): Translator => {
    const applyVars = (value: string, vars?: TranslationVars) => {
        if (!vars) return value;
        return value.replace(/\{(\w+)\}/g, (_, key: string) => {
            const replacement = vars[key];
            return replacement === undefined ? `{${key}}` : String(replacement);
        });
    };

    return (path: string, vars?: TranslationVars) => {
        const keys = path.split('.');
        let current: unknown = translations[lang];

        for (const key of keys) {
            if (!isRecord(current) || !(key in current)) {
                return applyVars(path, vars);
            }
            current = current[key];
        }

        if (typeof current !== 'string') {
            return applyVars(path, vars);
        }

        return applyVars(current, vars);
    };
};
