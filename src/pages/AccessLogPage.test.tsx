/**
 * A trilha de acesso é o que o responsável tem para saber o que terceiros
 * fizeram com os dados da criança. Ela mostrava "Você" em TODA linha — o
 * backend nunca mandou `professionalName`, e o `?? 'Você'` transformava a
 * ausência de nome em uma afirmação de autoria errada. A data tinha o mesmo
 * problema por outro caminho: o campo lido (`occurredAt`) não existia, então
 * toda linha imprimia "Invalid Date".
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { AccessLogEntry } from '../types/accessLog';

const listMock = vi.fn();

vi.mock('../services/api', () => ({
  accessLogApi: { list: (...args: unknown[]) => listMock(...args) },
}));

vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => ({
    getToken: async () => 'token',
    session: { user: { id: 'owner-1' } },
  }),
}));

import AccessLogPage from './AccessLogPage';

function entry(overrides: Partial<AccessLogEntry>): AccessLogEntry {
  return {
    id: 'log-1',
    childId: 'child-1',
    actorUserId: 'owner-1',
    professionalId: null,
    actorName: null,
    resourceType: 'daily_logs',
    resourceId: null,
    action: 'read',
    createdAt: '2026-03-14T15:30:00.000Z',
    ...overrides,
  };
}

function renderPage(entries: AccessLogEntry[]) {
  listMock.mockResolvedValue({ data: entries, total: entries.length, page: 1, limit: 20 });
  return render(
    <MemoryRouter initialEntries={['/children/child-1/access-log']}>
      <Routes>
        <Route path="/children/:childId/access-log" element={<AccessLogPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => listMock.mockReset());

describe('AccessLogPage — quem agiu', () => {
  it('só diz "Você" quando o ator é o usuário logado', async () => {
    renderPage([entry({ id: 'a', actorUserId: 'owner-1' })]);
    expect(await screen.findByText('Você')).toBeInTheDocument();
  });

  it('mostra o nome do terceiro, e nunca "Você", numa ação de outra pessoa', async () => {
    renderPage([entry({ id: 'b', actorUserId: 'caregiver-9', actorName: 'Tia Marta' })]);
    expect(await screen.findByText('Tia Marta')).toBeInTheDocument();
    expect(screen.queryByText('Você')).not.toBeInTheDocument();
  });

  it('ator de terceiro sem nome resolvido não é atribuído ao responsável', async () => {
    renderPage([entry({ id: 'c', actorUserId: 'desconhecido-7', actorName: null })]);
    expect(await screen.findByText('Outro usuário')).toBeInTheDocument();
    expect(screen.queryByText('Você')).not.toBeInTheDocument();
  });
});

describe('AccessLogPage — quando', () => {
  it('formata a data que o backend realmente manda', async () => {
    renderPage([entry({ id: 'd', createdAt: '2026-03-14T15:30:00.000Z' })]);
    expect(await screen.findByText(/14\/03\/2026/)).toBeInTheDocument();
    expect(screen.queryByText(/Invalid Date/)).not.toBeInTheDocument();
  });

  it('data ausente vira "—", não "Invalid Date"', async () => {
    renderPage([entry({ id: 'e', createdAt: undefined as unknown as string })]);
    expect(await screen.findByText('—')).toBeInTheDocument();
    expect(screen.queryByText(/Invalid Date/)).not.toBeInTheDocument();
  });
});

describe('AccessLogPage — o quê', () => {
  it('traduz o tipo de recurso que o middleware de delegação grava', async () => {
    renderPage([entry({ id: 'f', resourceType: 'daily_reports' })]);
    expect(await screen.findByText('Relatos do dia')).toBeInTheDocument();
  });

  it('tipo desconhecido aparece cru em vez de sumir da trilha', async () => {
    renderPage([entry({ id: 'g', resourceType: 'coisa_nova' })]);
    expect(await screen.findByText('coisa_nova')).toBeInTheDocument();
  });
});
