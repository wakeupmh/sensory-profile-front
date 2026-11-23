import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';

// Traduções extras por área do app (locales/extra/<área>.<idioma>.json),
// mescladas por cima dos arquivos principais. Cada área usa chaves de topo
// próprias, então os arquivos não colidem. Só as telas internas as usam, então
// elas baixam sob demanda (loadAppStrings) e "/", login e páginas legais abrem
// só com os arquivos principais. O que aparece antes de qualquer tela interna
// (ErrorBoundary, LoadingSpinner, toasts) tem de estar nos arquivos principais.
type Dict = Record<string, unknown>;
const extras = import.meta.glob<Dict>('./locales/extra/*.json', { import: 'default' });
const loaded = new Map<string, Promise<void>>();

function loadExtras(lang: string): Promise<void> {
  let done = loaded.get(lang);
  if (!done) {
    const files = Object.entries(extras).filter(([path]) => path.endsWith(`.${lang}.json`));
    done = Promise.all(files.map(([, load]) => load())).then((dicts) => {
      for (const dict of dicts) i18n.addResourceBundle(lang, 'translation', dict, true, true);
    });
    loaded.set(lang, done);
  }
  return done;
}

/** Textos das telas internas no idioma atual (e no de reserva, pt-BR). */
export function loadAppStrings(langs: readonly string[] = [i18n.resolvedLanguage ?? 'pt-BR', 'pt-BR']): Promise<void> {
  return Promise.all([...new Set(langs)].map(loadExtras)).then(() => undefined);
}

export const SUPPORTED_LANGUAGES = ['pt-BR', 'en-US'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { translation: ptBR },
      'en-US': { translation: enUS },
    },
    fallbackLng: 'pt-BR',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: { escapeValue: false },
    // Re-renderiza quando loadAppStrings acrescenta textos.
    react: { bindI18nStore: 'added' },
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
  // Trocar de idioma dentro do app traz os textos do novo idioma.
  if (loaded.size > 0) void loadAppStrings([lng]);
});
document.documentElement.lang = i18n.language;

export default i18n;
