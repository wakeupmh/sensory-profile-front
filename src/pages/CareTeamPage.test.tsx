/**
 * O convite expirado era um beco sem saída.
 *
 * Ele aparecia na lista com o selo "Expirado" e nenhuma ação: não dava para
 * limpar nem para reenviar, e reconvidar a mesma pessoa exigia redigitar nome
 * e especialidade no formulário lá em cima. Um convite vence sozinho, depois
 * de 14 dias — não é caso raro, é o caminho comum de quem demorou a aceitar.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const getTokenMock = vi.fn().mockResolvedValue('fake-token');
vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => ({ getToken: getTokenMock, session: { user: { id: 'user-1' } }, isLoaded: true }),
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}));

const listMock = vi.fn();
const inviteMock = vi.fn();
const revokeMock = vi.fn();
const getChildMock = vi.fn();
vi.mock('../services/api', () => ({
  careTeamApi: {
    list: (...a: unknown[]) => listMock(...a),
    invite: (...a: unknown[]) => inviteMock(...a),
    revoke: (...a: unknown[]) => revokeMock(...a),
  },
  childApi: { get: (...a: unknown[]) => getChildMock(...a) },
}));

import CareTeamPage from './CareTeamPage';

const EXPIRED = {
  id: 'ct2', childId: 'child-1', memberName: 'Pendente Silva', role: 'psicologia',
  status: 'pending' as const, invitationExpiresAt: '2020-01-01T00:00:00.000Z',
  acceptedAt: null, revokedAt: null, createdAt: '2019-12-01T00:00:00.000Z',
};
const ACTIVE = {
  id: 'ct1', childId: 'child-1', memberName: 'Dra. Helena', role: 'fonoaudiologia',
  status: 'accepted' as const, invitationExpiresAt: null,
  acceptedAt: '2026-02-01T00:00:00.000Z', revokedAt: null, createdAt: '2026-01-05T00:00:00.000Z',
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/children/child-1/care-team']}>
      <Routes>
        <Route path="/children/:childId/care-team" element={<CareTeamPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  getChildMock.mockResolvedValue({ id: 'child-1', name: 'Ana' });
});

describe('convite expirado', () => {
  it('oferece reenviar em vez de ficar sem ação nenhuma', async () => {
    listMock.mockResolvedValue([EXPIRED]);
    renderPage();
    expect(await screen.findByRole('button', { name: /convidar de novo|invite again/i })).toBeInTheDocument();
  });

  it('reenvia com o MESMO nome e especialidade, sem redigitar', async () => {
    listMock.mockResolvedValue([EXPIRED]);
    inviteMock.mockResolvedValue({
      ...EXPIRED, id: 'novo', invitationToken: 'tok_novo',
      invitationExpiresAt: '2030-01-01T00:00:00.000Z',
    });

    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: /convidar de novo|invite again/i }));

    await waitFor(() => expect(inviteMock).toHaveBeenCalledTimes(1));
    expect(inviteMock).toHaveBeenCalledWith('fake-token', 'child-1', {
      memberName: 'Pendente Silva',
      role: 'psicologia',
    });
  });

  it('mostra o link novo, porque um convite sem link não serve para nada', async () => {
    listMock.mockResolvedValue([EXPIRED]);
    inviteMock.mockResolvedValue({
      ...EXPIRED, id: 'novo', invitationToken: 'tok_novo',
      invitationExpiresAt: '2030-01-01T00:00:00.000Z',
    });

    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: /convidar de novo|invite again/i }));

    await waitFor(() => {
      const values = screen.getAllByRole('textbox').map((el) => (el as HTMLInputElement).value);
      expect(values.some((v) => v.includes('tok_novo'))).toBe(true);
    });
  });
});

describe('quem não está expirado não ganha o botão de reenviar', () => {
  it('participação ativa oferece revogar, e não reenviar', async () => {
    listMock.mockResolvedValue([ACTIVE]);
    renderPage();
    await screen.findByText('Dra. Helena');
    expect(screen.queryByRole('button', { name: /convidar de novo|invite again/i })).not.toBeInTheDocument();
  });
});
