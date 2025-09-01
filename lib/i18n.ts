import fr from '@/locales/fr';
import en from '@/locales/en';

const translations = { fr, en };

export type Lang = keyof typeof translations;

export function t(key: string, lang: Lang = 'fr'): string {
  return translations[lang][key] || key;
}
