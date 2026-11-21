import { describe, expect, it } from 'vitest';
import i18n from '../i18n';
import { logSummary } from './logSummary';

const t = i18n.getFixedT('pt-BR');

describe('logSummary', () => {
  it('humor: nível e marcadores', () => {
    expect(logSummary({ logType: 'mood', data: { level: 5, tags: ['agitado'] } }, t)).toBe('😊 Muito Calmo · agitado');
  });
  it('sono: horário, despertares e qualidade', () => {
    expect(logSummary({ logType: 'sleep', data: { bedtime: '21:00', waketime: '06:30', wakings: 2, quality: 3 } }, t))
      .toBe('21:00 → 06:30 · acordou 2 vezes · Boa');
  });
  it('ABC: o comportamento', () => {
    expect(logSummary({ logType: 'abc', data: { antecedent: 'a', behavior: 'Cobriu os ouvidos', consequence: 'c' } }, t)).toBe('Cobriu os ouvidos');
  });
  it('registro sem dados não quebra', () => {
    expect(logSummary({ logType: 'food', data: undefined as never }, t)).toBe('');
  });
});
