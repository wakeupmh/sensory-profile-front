import { afterEach, beforeAll, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import i18n, { loadAppStrings } from '../i18n';

// No app as telas internas baixam esses textos sob demanda; nos testes, já.
beforeAll(() => loadAppStrings(['pt-BR', 'en-US']));

// O detector de idioma escolhe en-US no jsdom; os testes assumem o idioma
// padrão do app.
beforeEach(async () => {
  await i18n.changeLanguage('pt-BR');
});

afterEach(() => {
  cleanup();
});
