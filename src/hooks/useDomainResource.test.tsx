/**
 * A propriedade que justifica este hook: resposta velha não sobrescreve tela
 * nova.
 *
 * Nenhuma das páginas de domínio protegia contra isso. Trocando de criança
 * rápido, a busca da criança A podia chegar DEPOIS da busca da B e pintar a
 * tela com os dados de A enquanto o seletor dizia B — dados clínicos de uma
 * criança sob o nome de outra.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useDomainResource } from './useDomainResource';

vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => ({
    getToken: async () => 'token',
    isLoaded: true,
    session: { user: { id: 'user-1' } },
  }),
}));

/** Promessas que resolvemos à mão, para controlar a ordem de chegada. */
function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function Probe({ childId, load }: { childId: string; load: (t: string | null) => Promise<string> }) {
  const { data, loading, error, setData } = useDomainResource(load, [childId]);
  return (
    <div>
      <span data-testid="data">{data ?? '-'}</span>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="error">{error ?? '-'}</span>
      <button onClick={() => setData((previous) => `${previous ?? ''}+otimista`)}>escrever</button>
    </div>
  );
}

beforeEach(() => vi.clearAllMocks());

describe('useDomainResource — resposta fora de ordem', () => {
  it('a resposta lenta da criança ANTERIOR não sobrescreve a da atual', async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const load = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

    const view = render(<Probe childId="crianca-A" load={load} />);
    view.rerender(<Probe childId="crianca-B" load={load} />);

    // A segunda busca (B) chega primeiro...
    await act(async () => {
      second.resolve('dados da B');
    });
    expect(screen.getByTestId('data')).toHaveTextContent('dados da B');

    // ...e a primeira (A) chega atrasada. Não pode pintar a tela.
    await act(async () => {
      first.resolve('dados da A');
    });
    expect(screen.getByTestId('data')).toHaveTextContent('dados da B');
  });

  it('o erro de uma busca abandonada não aparece na tela', async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const load = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

    const view = render(<Probe childId="crianca-A" load={load} />);
    view.rerender(<Probe childId="crianca-B" load={load} />);

    await act(async () => {
      second.resolve('dados da B');
    });
    await act(async () => {
      first.reject(new Error('a busca velha falhou'));
    });

    expect(screen.getByTestId('error')).toHaveTextContent('-');
    expect(screen.getByTestId('data')).toHaveTextContent('dados da B');
  });

  it('a busca abandonada também não devolve a tela para "carregando"', async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const load = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

    const view = render(<Probe childId="crianca-A" load={load} />);
    view.rerender(<Probe childId="crianca-B" load={load} />);

    await act(async () => {
      second.resolve('dados da B');
    });
    expect(screen.getByTestId('loading')).toHaveTextContent('false');

    await act(async () => {
      first.resolve('dados da A');
    });
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });
});

describe('useDomainResource — ciclo básico', () => {
  it('expõe o erro quando a busca falha', async () => {
    const load = vi.fn().mockRejectedValue(new Error('falhou'));
    render(<Probe childId="a" load={load} />);
    await act(async () => {});
    expect(screen.getByTestId('error')).toHaveTextContent('Erro ao carregar dados');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('limpa o erro anterior quando uma nova busca dá certo', async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error('falhou'))
      .mockResolvedValueOnce('deu certo');

    const view = render(<Probe childId="a" load={load} />);
    await act(async () => {});
    expect(screen.getByTestId('error')).toHaveTextContent('Erro ao carregar dados');

    view.rerender(<Probe childId="b" load={load} />);
    await act(async () => {});
    expect(screen.getByTestId('error')).toHaveTextContent('-');
    expect(screen.getByTestId('data')).toHaveTextContent('deu certo');
  });
});

describe('useDomainResource — escrita otimista durante uma busca em voo', () => {
  it('a escrita vence a resposta que chega depois, mas o loading BAIXA', async () => {
    // O defeito que isto guarda: a escrita otimista invalidava a busca em voo
    // inteira, inclusive o `finally` que baixa o `loading`. Quem enviasse um
    // documento enquanto a lista ainda carregava ficava no esqueleto para
    // sempre — o registro no servidor, e a tela num spinner até dar refresh.
    const inFlight = deferred<string>();
    const load = vi.fn().mockReturnValue(inFlight.promise);

    render(<Probe childId="crianca-A" load={load} />);
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    await act(async () => {
      screen.getByRole('button', { name: 'escrever' }).click();
    });
    await act(async () => {
      inFlight.resolve('do servidor');
    });

    expect(screen.getByTestId('data')).toHaveTextContent('+otimista');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('uma busca que falha depois da escrita otimista não mostra erro nem trava o loading', async () => {
    const inFlight = deferred<string>();
    const load = vi.fn().mockReturnValue(inFlight.promise);

    render(<Probe childId="crianca-A" load={load} />);
    await act(async () => {
      screen.getByRole('button', { name: 'escrever' }).click();
    });
    await act(async () => {
      inFlight.reject(new Error('falhou tarde'));
    });

    expect(screen.getByTestId('error')).toHaveTextContent('-');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });
});
