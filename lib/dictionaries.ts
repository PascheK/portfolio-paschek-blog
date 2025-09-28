import 'server-only';

const dictionaries = {
  en: () => import('../app/[lang]/dictionaries/en.json').then(m => m.default),
  fr: () => import('../app/[lang]/dictionaries/fr.json').then(m => m.default),
};

export async function getDictionary(lang: 'en' | 'fr') {
  const loader = dictionaries[lang as keyof typeof dictionaries];
  if (!loader) throw new Error(`No dictionary for locale "${lang}"`);
  return loader();
}