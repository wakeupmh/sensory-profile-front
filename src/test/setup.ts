import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import i18n from '../i18n';

// O detector de idioma escolhe en-US no jsdom; os testes assumem o idioma
// padrão do app.
beforeEach(async () => {
  await i18n.changeLanguage('pt-BR');
});

afterEach(() => {
  cleanup();
});
