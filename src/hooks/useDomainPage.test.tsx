import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { ChildData } from '../services/api';

const list = vi.fn();
vi.mock('../services/api', () => ({
  childApi: {
    list: (...args: unknown[]) => list(...args),
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => ({
    getToken: async () => 'token',
    isLoaded: true,
    session: { user: { id: currentUserId } },
  }),
}));

// Trocável pelos testes que simulam outra conta no mesmo aparelho.
let currentUserId = 'user-1';

const { useDomainPage, selectedChildStorageKey } = await import('./useDomainPage');

// A chave é por usuário: uma sobra de outra conta no mesmo aparelho não pode
// ser lida por quem loga depois.
const SELECTED_CHILD_STORAGE_KEY = selectedChildStorageKey('user-1');

function childFixture(id: string, name: string): ChildData {
  return { id, userId: 'user-1', name, birthDate: '2018-01-01', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' };
}

function renderAt(url: string) {
  return renderHook(() => useDomainPage(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
    ),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe('useDomainPage — seleção de criança persiste entre páginas', () => {
  it('mantém a criança escolhida ao montar o hook em outra página (sem ?childId na URL)', async () => {
    list.mockResolvedValue([childFixture('ana', 'Ana'), childFixture('bruno', 'Bruno')]);

    const logsPage = renderAt('/logs');
    await waitFor(() => expect(logsPage.result.current.children).toHaveLength(2));
    act(() => logsPage.result.current.setSelectedChildId('bruno'));
    expect(logsPage.result.current.selectedChildId).toBe('bruno');

    // "Navega" para outra página: novo mount do hook, sem childId na URL —
    // antes da correção isso silenciosamente voltava para a primeira criança.
    const medicalPage = renderAt('/medical');
    await waitFor(() => expect(medicalPage.result.current.children).toHaveLength(2));
    expect(medicalPage.result.current.selectedChildId).toBe('bruno');
    expect(medicalPage.result.current.effectiveChildId).toBe('bruno');
  });

  it('um ?childId= explícito na URL vence o valor persistido (link direto)', async () => {
    list.mockResolvedValue([childFixture('ana', 'Ana'), childFixture('bruno', 'Bruno')]);
    localStorage.setItem(SELECTED_CHILD_STORAGE_KEY, 'bruno');

    const { result } = renderAt('/medical?childId=ana');
    await waitFor(() => expect(result.current.children).toHaveLength(2));
    expect(result.current.selectedChildId).toBe('ana');
  });

  it('descarta uma criança persistida que não existe mais nesta conta e usa a primeira disponível', async () => {
    // Simula: criança excluída, ou sobra de outra conta no mesmo aparelho.
    localStorage.setItem(SELECTED_CHILD_STORAGE_KEY, 'ghost-child');
    list.mockResolvedValue([childFixture('ana', 'Ana'), childFixture('bruno', 'Bruno')]);

    const { result } = renderAt('/logs');
    await waitFor(() => expect(result.current.effectiveChildId).toBe('ana'));
    expect(result.current.selectedChildId).toBe('');
    // A seleção inválida também é limpa do armazenamento, não só do estado.
    expect(localStorage.getItem(SELECTED_CHILD_STORAGE_KEY)).toBe('');
  });

  it('não descarta a seleção persistida enquanto a lista de crianças ainda não chegou', async () => {
    localStorage.setItem(SELECTED_CHILD_STORAGE_KEY, 'bruno');
    let resolveList: (children: ChildData[]) => void = () => {};
    list.mockImplementation(() => new Promise((resolve) => { resolveList = resolve; }));

    const { result } = renderAt('/logs');
    // Antes da resposta da API, a seleção persistida deve permanecer intacta.
    expect(result.current.selectedChildId).toBe('bruno');

    // Espera a busca de fato chamar a API (passa pelo await do token
    // primeiro) antes de resolver — só então `resolveList` aponta para a
    // promise pendente real.
    await waitFor(() => expect(list).toHaveBeenCalled());
    act(() => {
      resolveList([childFixture('ana', 'Ana'), childFixture('bruno', 'Bruno')]);
    });
    await waitFor(() => expect(result.current.children).toHaveLength(2));
    expect(result.current.selectedChildId).toBe('bruno');
  });

  it('preserva "Todas as crianças" (string vazia) como escolha explícita entre páginas', async () => {
    list.mockResolvedValue([childFixture('ana', 'Ana'), childFixture('bruno', 'Bruno')]);

    const logsPage = renderAt('/logs');
    await waitFor(() => expect(logsPage.result.current.children).toHaveLength(2));
    act(() => logsPage.result.current.setSelectedChildId('bruno'));
    act(() => logsPage.result.current.setSelectedChildId(''));
    expect(logsPage.result.current.selectedChildId).toBe('');

    const medicalPage = renderAt('/medical');
    await waitFor(() => expect(medicalPage.result.current.children).toHaveLength(2));
    expect(medicalPage.result.current.selectedChildId).toBe('');
    // effectiveChildId continua caindo na primeira criança (comportamento
    // pré-existente do formulário de criação) — "Todas" não quebra isso.
    expect(medicalPage.result.current.effectiveChildId).toBe('ana');
  });

  it('effectiveChildId cai para a primeira criança quando nada foi selecionado ainda', async () => {
    list.mockResolvedValue([childFixture('ana', 'Ana')]);
    const { result } = renderAt('/logs');
    await waitFor(() => expect(result.current.effectiveChildId).toBe('ana'));
    expect(result.current.selectedChildId).toBe('');
  });
});

describe('useDomainPage — aparelho compartilhado', () => {
  afterEach(() => {
    currentUserId = 'user-1';
  });

  it("does not hand one account's stored child to the next user who logs in", async () => {
    // Reproduz o caminho real: user-1 ESCOLHE a criança (é o setter que
    // persiste), depois outra conta entra no mesmo aparelho. Com uma chave
    // global, a sessão nova leria essa escolha — e como `effectiveChildId`
    // passa a valer antes de a lista chegar, buscaria dados com o id alheio.
    list.mockResolvedValue([childFixture('bruno', 'Bruno')]);
    const first = renderAt('/logs');
    await waitFor(() => expect(first.result.current.children).toHaveLength(1));
    act(() => first.result.current.setSelectedChildId('bruno'));
    await waitFor(() => expect(first.result.current.selectedChildId).toBe('bruno'));
    cleanup();

    currentUserId = 'user-2';
    list.mockResolvedValue([childFixture('carla', 'Carla')]);
    const { result } = renderAt('/logs');

    // Em nenhum momento — nem antes de a lista chegar — o id do outro usuário
    // pode aparecer como seleção efetiva.
    expect(result.current.effectiveChildId).not.toBe('bruno');
    await waitFor(() => expect(result.current.children).toHaveLength(1));
    expect(result.current.selectedChildId).not.toBe('bruno');
    expect(result.current.effectiveChildId).toBe('carla');
  });

  it('each account keeps its own selection', async () => {
    localStorage.setItem(selectedChildStorageKey('user-1'), 'bruno');
    localStorage.setItem(selectedChildStorageKey('user-2'), 'carla');
    currentUserId = 'user-2';
    list.mockResolvedValue([childFixture('bruno', 'Bruno'), childFixture('carla', 'Carla')]);

    const { result } = renderAt('/logs');

    await waitFor(() => expect(result.current.selectedChildId).toBe('carla'));
  });
});
