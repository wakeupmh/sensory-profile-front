import { beforeAll, describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { MchatRSummary } from './MchatRSummary';
import { mchatR } from './index';
import { computeMchatScores, riskFromFailCount } from './scoring';

const Where = () => {
  const loc = useLocation();
  return <div data-testid="where">{loc.pathname + loc.search}</div>;
};

const renderSummary = (scores: unknown) =>
  render(
    <MemoryRouter initialEntries={['/report']}>
      <Routes>
        <Route path="/report" element={<MchatRSummary scores={scores} instrument={mchatR} assessmentId="abc" />} />
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  );

describe('MchatRSummary', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('risco médio inicia o acompanhamento na rota /assessment/new', () => {
    renderSummary({ failCount: 4, failedItemIds: [3001, 3002, 3003, 3004], risk: 'medio' });
    fireEvent.click(screen.getByRole('button', { name: /Entrevista de Acompanhamento/ }));
    expect(screen.getByTestId('where').textContent).toBe(
      '/assessment/new?instrument=mchat-rf-followup&parent=abc',
    );
  });

  it('risco alto mostra o próximo passo e não oferece acompanhamento', () => {
    renderSummary({ failCount: 9, failedItemIds: [3001], risk: 'alto' });
    expect(screen.getByText(/Próximo passo: avaliação especializada/)).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('risco baixo não oferece acompanhamento', () => {
    renderSummary({ failCount: 1, failedItemIds: [3001], risk: 'baixo' });
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('scoring M-CHAT-R', () => {
  it('faixas de risco', () => {
    expect([0, 2, 3, 7, 8, 20].map(riskFromFailCount)).toEqual(['baixo', 'baixo', 'medio', 'medio', 'alto', 'alto']);
  });

  it('itens invertidos reprovam com "sim"', () => {
    const s = computeMchatScores([
      { id: 3001, response: 'nao' },
      { id: 3002, response: 'sim' },
      { id: 3003, response: 'sim' },
      { id: 3012, response: 'nao' },
    ]);
    expect(s.failedItemIds).toEqual([3001, 3002]);
    expect(s.risk).toBe('baixo');
  });
});
