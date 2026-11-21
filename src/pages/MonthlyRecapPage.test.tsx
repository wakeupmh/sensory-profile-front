import { describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import '../i18n';
import MonthlyRecapPage from './MonthlyRecapPage';

/**
 * Trocar de criança com a busca da anterior ainda em voo: a resposta velha,
 * que chega depois, não pode pintar a tela da criança nova.
 */

const session = { user: { id: 'u1' } };
vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => ({ getToken: async () => 't', isLoaded: true, session }),
}));

let childId = 'a';
vi.mock('../hooks/useDomainPage', () => ({
  useDomainPage: () => ({
    children: [{ id: 'a' }, { id: 'b' }],
    childrenLoaded: true,
    selectedChildId: childId,
    setSelectedChildId: () => {},
    effectiveChildId: childId,
    getTokenRef: { current: async () => 't' },
  }),
}));

let releaseA: (() => void) | undefined;
const goalsFor = (id: string) => [{ id: `g-${id}`, title: `Meta da ${id.toUpperCase()}`, status: 'active', domain: 'motor' }];
vi.mock('../services/api', () => ({
  logApi: { getLogs: async () => ({ data: [] }) },
  milestoneApi: { list: async () => [] },
  goalApi: {
    list: (_t: unknown, { childId: id }: { childId: string }) =>
      id === 'a'
        ? new Promise((resolve) => { releaseA = () => resolve(goalsFor('a')); })
        : Promise.resolve(goalsFor('b')),
  },
  goalProgressApi: { list: async () => [{ id: 'e', value: 1, recordedAt: new Date().toISOString() }] },
}));

describe('MonthlyRecapPage', () => {
  it('a resposta atrasada da criança anterior não substitui a atual', async () => {
    const { rerender } = render(<MonthlyRecapPage />);
    await waitFor(() => expect(releaseA).toBeDefined()); // a busca da A está em voo

    childId = 'b';
    rerender(<MonthlyRecapPage />);
    await screen.findByText('Meta da B');

    await act(async () => releaseA!());
    expect(screen.queryByText('Meta da A')).not.toBeInTheDocument();
    expect(screen.getByText('Meta da B')).toBeInTheDocument();
  });
});
