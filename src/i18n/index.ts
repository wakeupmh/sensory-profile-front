import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';

// Traduções extras por área do app (locales/extra/<área>.<idioma>.json),
// mescladas por cima dos arquivos principais. Cada área usa chaves de topo
// próprias, então os arquivos não colidem.
type Dict = Record<string, unknown>;
const extras = import.meta.glob<Dict>('./locales/extra/*.json', { eager: true, import: 'default' });

function deepMerge(target: Dict, source: Dict): Dict {
  for (const [key, value] of Object.entries(source)) {
    const current = target[key];
    if (value && typeof value === 'object' && !Array.isArray(value) && current && typeof current === 'object') {
      deepMerge(current as Dict, value as Dict);
    } else {
      target[key] = value;
    }
  }
  return target;
}

function withExtras(base: Dict, lang: string): Dict {
  const merged = structuredClone(base);
  for (const [path, dict] of Object.entries(extras)) {
    if (path.endsWith(`.${lang}.json`)) deepMerge(merged, dict);
  }
  return merged;
}

export const SUPPORTED_LANGUAGES = ['pt-BR', 'en-US'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { translation: withExtras(ptBR, 'pt-BR') },
      'en-US': { translation: withExtras(enUS, 'en-US') },
    },
    fallbackLng: 'pt-BR',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'sensory-profile-language',
    },
  });

// Mantém o atributo lang do <html> em sincronia — importa para leitores de
// tela e para o navegador escolher a ortografia/tradução corretas.
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});
document.documentElement.lang = i18n.language;

export default i18n;
