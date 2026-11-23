import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ConsentGate from './ConsentGate';
import { accountApi, type ConsentStatus } from '../services/api';

let userId = 'u0';
const signOut = vi.fn(() => Promise.resolve());
const getToken = () => Promise.resolve('tok');
vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => ({ session: { user: { id: userId } }, getToken, signOut }),
}));
vi.mock('../services/api', () => ({ accountApi: { getConsent: vi.fn(), acceptConsent: vi.fn() } }));

const getConsent = vi.mocked(accountApi.getConsent);
const acceptConsent = vi.mocked(accountApi.acceptConsent);
const notAccepted: ConsentStatus = { currentVersion: '2026-11', acceptedVersion: null, acceptedAt: null };
const accepted: ConsentStatus = { currentVersion: '2026-11', acceptedVersion: '2026-11', acceptedAt: '2026-11-23T10:00:00Z' };

function renderGate() {
  return render(
    <MemoryRouter>
      <ConsentGate><p>pagina protegida</p></ConsentGate>
    </MemoryRouter>,
  );
}

describe('ConsentGate', () => {
  let n = 0;
  beforeEach(() => {
    userId = `u${++n}`; // o gate lembra quem já aceitou; cada teste é outro usuário
    vi.clearAllMocks();
  });

  it('shows the consent screen instead of the page when consent is missing', async () => {
    getConsent.mockResolvedValue(notAccepted);
    renderGate();
    expect(await screen.findByRole('heading', { name: 'Antes de começar' })).toBeInTheDocument();
    expect(screen.queryByText('pagina protegida')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Política de Privacidade' })).toHaveAttribute('href', '/privacidade');
    expect(screen.getByRole('link', { name: 'Termos de Uso' })).toHaveAttribute('href', '/termos');
  });

  it('asks again when the accepted version is older than the current one', async () => {
    getConsent.mockResolvedValue({ ...accepted, acceptedVersion: '2025-01' });
    renderGate();
    expect(await screen.findByText(/Leia e confirme de novo/)).toBeInTheDocument();
    expect(screen.queryByText('pagina protegida')).not.toBeInTheDocument();
  });

  it('keeps continue disabled until the box is ticked, then posts the current version and opens the page', async () => {
    getConsent.mockResolvedValue(notAccepted);
    acceptConsent.mockResolvedValue(accepted);
    const user = userEvent.setup();
    renderGate();

    const box = await screen.findByRole('checkbox', { name: /Sou o responsável legal pela criança/ });
    const proceed = screen.getByRole('button', { name: 'Concordar e continuar' });
    expect(box).not.toBeChecked();
    expect(proceed).toBeDisabled();

    await user.click(box);
    expect(proceed).toBeEnabled();
    await user.click(proceed);

    expect(acceptConsent).toHaveBeenCalledWith('tok', '2026-11');
    expect(await screen.findByText('pagina protegida')).toBeInTheDocument();
  });

  it('renders the page straight away when consent is current', async () => {
    getConsent.mockResolvedValue(accepted);
    renderGate();
    expect(await screen.findByText('pagina protegida')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('offers a retry when the check fails on the network', async () => {
    getConsent.mockRejectedValueOnce(new Error('Network Error')).mockResolvedValueOnce(accepted);
    const user = userEvent.setup();
    renderGate();
    await user.click(await screen.findByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByText('pagina protegida')).toBeInTheDocument();
  });

  it('signs out from the consent screen', async () => {
    getConsent.mockResolvedValue(notAccepted);
    const user = userEvent.setup();
    renderGate();
    await user.click(await screen.findByRole('button', { name: 'Sair' }));
    expect(signOut).toHaveBeenCalled();
  });
});
