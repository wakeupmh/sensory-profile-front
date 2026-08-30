import { describe, expect, it, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import i18n from '../i18n';
import CareTeamAcceptPage from './CareTeamAcceptPage';

/**
 * Coverage for CareTeamAcceptPage's error/success states — modeled on
 * CaregiverInviteAcceptPage, whose own accept flow has no test at all. Errors
 * from `careTeamApi.acceptInvite` are deliberately opaque on the backend (see
 * CareTeamService.acceptInvitation: unknown token, expired, revoked,
 * self-accept and "already a member" all return the SAME 400 so a stranger
 * can't use error variety as an oracle) — the page's job is to turn every one
 * of those into the single "invalid/expired/used" message, and turn anything
 * else (network, 500) into a separate generic one.
 */

const getTokenMock = vi.fn().mockResolvedValue('fake-token');
vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => ({ getToken: getTokenMock }),
}));

const acceptInviteMock = vi.fn();
const myChildrenMock = vi.fn();
vi.mock('../services/api', () => ({
  careTeamApi: {
    acceptInvite: (...args: unknown[]) => acceptInviteMock(...args),
    myChildren: (...args: unknown[]) => myChildrenMock(...args),
  },
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/care-team/accept" element={<CareTeamAcceptPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

// i18next-browser-languagedetector falls back to jsdom's navigator.language
// ("en-US") in this environment rather than the app's pt-BR default — pin it
// explicitly so this file's assertions (written against the primary,
// pt-BR copy) aren't hostage to the test runner's locale detection.
beforeAll(() => {
  i18n.changeLanguage('pt-BR');
});

beforeEach(() => {
  getTokenMock.mockClear();
  acceptInviteMock.mockReset();
  myChildrenMock.mockReset();
  myChildrenMock.mockResolvedValue([]);
});

describe('CareTeamAcceptPage', () => {
  it('shows the "paste the code" error for a whitespace-only manual submission, without calling the API', async () => {
    const user = userEvent.setup();
    renderAt('/care-team/accept');

    await user.type(screen.getByLabelText(/Código de convite/), '   ');
    await user.click(screen.getByRole('button', { name: 'Aceitar convite' }));

    expect(await screen.findByText('Cole o código de convite recebido.')).toBeInTheDocument();
    expect(acceptInviteMock).not.toHaveBeenCalled();
  });

  it('shows the invalid/expired/used message on a 400 response, auto-submitting the token from the URL', async () => {
    acceptInviteMock.mockRejectedValue({ response: { status: 400 } });
    renderAt('/care-team/accept?token=tok_expired');

    expect(await screen.findByText('Convite inválido, expirado ou já utilizado.')).toBeInTheDocument();
    expect(acceptInviteMock).toHaveBeenCalledWith('fake-token', 'tok_expired');
  });

  it('shows a generic error for a non-400 failure (e.g. network/500), distinct from the invalid-token message', async () => {
    acceptInviteMock.mockRejectedValue({ response: { status: 500 } });
    renderAt('/care-team/accept?token=tok_x');

    expect(await screen.findByText('Não foi possível aceitar o convite. Tente novamente.')).toBeInTheDocument();
    expect(screen.queryByText('Convite inválido, expirado ou já utilizado.')).not.toBeInTheDocument();
  });

  it('on success, enriches the message with the child name resolved from the caseload', async () => {
    acceptInviteMock.mockResolvedValue({ id: 'ctm-1', childId: 'child-1', role: 'terapia_ocupacional' });
    myChildrenMock.mockResolvedValue([
      { membershipId: 'ctm-1', childId: 'child-1', childName: 'Sofia', childBirthDate: null, role: 'terapia_ocupacional', acceptedAt: '2026-08-30T00:00:00.000Z' },
    ]);
    renderAt('/care-team/accept?token=tok_valid');

    expect(await screen.findByText('Convite aceito')).toBeInTheDocument();
    expect(
      await screen.findByText('Você agora faz parte da equipe de cuidado de Sofia como Terapeuta ocupacional.'),
    ).toBeInTheDocument();
  });

  it('on success, still confirms acceptance (without a child name) when the caseload lookup fails', async () => {
    acceptInviteMock.mockResolvedValue({ id: 'ctm-1', childId: 'child-1', role: 'psicologia' });
    myChildrenMock.mockRejectedValue(new Error('network error'));
    renderAt('/care-team/accept?token=tok_valid');

    expect(await screen.findByText('Convite aceito')).toBeInTheDocument();
    expect(
      await screen.findByText('Você agora faz parte da equipe de cuidado como Psicóloga.'),
    ).toBeInTheDocument();
  });

  it('does not auto-submit twice for the same URL token', async () => {
    acceptInviteMock.mockResolvedValue({ id: 'ctm-1', childId: 'child-1', role: 'outro' });
    renderAt('/care-team/accept?token=tok_once');

    await waitFor(() => expect(acceptInviteMock).toHaveBeenCalledTimes(1));
    await screen.findByText('Convite aceito');
    expect(acceptInviteMock).toHaveBeenCalledTimes(1);
  });
});
