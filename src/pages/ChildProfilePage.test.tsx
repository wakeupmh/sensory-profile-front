import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, Link } from 'react-router-dom';
import { Theme } from '@radix-ui/themes';
import '../i18n';
import ChildProfilePage from './ChildProfilePage';

vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => ({ getToken: vi.fn().mockResolvedValue('t') }),
}));
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn(), toast: vi.fn() }),
}));

const profile = (id: string, name: string) => ({
  child: { id, name, dateOfBirth: null, gender: null, nationalIdentity: null, notes: null, createdAt: '2026-01-01' },
  stats: { assessmentCount: 0, logCount: 0, therapySessionCount: 0, activeMedicationCount: 0, achievedMilestoneCount: 0, educationPlanCount: 0 },
});
vi.mock('../services/api', () => ({
  childApi: {
    getProfile: vi.fn((id: string) => Promise.resolve(profile(id, id === 'a' ? 'Ana' : 'Bia'))),
    update: vi.fn(),
  },
  dataExportApi: {},
}));

// O posicionamento do menu (Radix Popper) observa o tamanho do gatilho; o jsdom não tem ResizeObserver.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('ChildProfilePage', () => {
  it('ir para outra criança com o formulário aberto não leva o formulário junto', async () => {
    render(
      <Theme>
      <MemoryRouter initialEntries={['/children/a']}>
        <Link to="/children/b">ir para B</Link>
        <Routes>
          <Route path="/children/:childId" element={<ChildProfilePage />} />
        </Routes>
      </MemoryRouter>
      </Theme>,
    );

    await screen.findByRole('heading', { name: 'Ana' });
    await userEvent.click(screen.getByRole('button', { name: /editar|edit/i }));
    expect(screen.getByDisplayValue('Ana')).toBeInTheDocument();

    await userEvent.click(screen.getByText('ir para B'));

    await screen.findByRole('heading', { name: 'Bia' });
    expect(screen.queryByDisplayValue('Ana')).not.toBeInTheDocument();
  });

  it('keeps Editar on screen and puts the other actions in one menu of 44px items', async () => {
    const user = userEvent.setup();
    render(
      <Theme>
      <MemoryRouter initialEntries={['/children/a']}>
        <Routes>
          <Route path="/children/:childId" element={<ChildProfilePage />} />
        </Routes>
      </MemoryRouter>
      </Theme>,
    );
    await screen.findByRole('heading', { name: 'Ana' });
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Compartilhar' })).not.toBeInTheDocument();

    screen.getByRole('button', { name: 'Mais opções' }).focus();
    await user.keyboard('{Enter}');

    const items = await screen.findAllByRole('menuitem');
    expect(items.map((item) => [item.textContent, item.getAttribute('href')])).toEqual([
      ['Compartilhar', '/children/a/share'],
      ['Cuidadores', '/children/a/caregivers'],
      ['Equipe de cuidado', '/children/a/care-team'],
      ['Notas da equipe', '/children/a/team-notes'],
      ['Histórico de acesso', '/children/a/access-log'],
      ['Ficha da criança', '/children/a/ficha'],
    ]);
    for (const item of items) expect(item.style.minHeight).toBe('44px');
  });
});
