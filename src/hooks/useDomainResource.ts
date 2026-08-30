import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';

/**
 * O ciclo buscar / carregando / erro / recarregar que todas as páginas de
 * domínio repetiam — Educação, Desenvolvimento, Saúde, Terapia, Objetivos,
 * Registros, Documentos. Eram as mesmas vinte linhas em cada uma, com o mesmo
 * `try/catch/finally` e a mesma frase de erro.
 *
 * Vale por si só pelo que apaga, mas o motivo de existir é uma correção que
 * nenhuma das páginas fazia: NENHUMA delas protegia contra resposta fora de
 * ordem. Trocando de criança rápido, a busca da criança A podia chegar depois
 * da busca da B e sobrescrever a tela — os dados clínicos de uma criança
 * aparecendo sob o nome de outra. Num app de registro clínico infantil isso
 * não é um detalhe de UX.
 *
 * A guarda é o `sequence`: cada busca leva um número, e só a mais recente tem
 * permissão de escrever no estado. Resolvido uma vez, aqui, para todas as
 * páginas — que é a razão de extrair, e não de copiar mais uma vez.
 */
export interface DomainResource<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Rebusca agora. Usado depois de criar, editar ou apagar um registro. */
  reload: () => void;
  /**
   * Escreve no estado local sem ir ao servidor — para a atualização otimista
   * que algumas páginas fazem (o documento recém-enviado aparece na hora).
   *
   * Também invalida qualquer busca em voo: sem isso, uma resposta que já
   * estava a caminho chegaria depois e apagaria a alteração otimista, que é
   * o mesmo defeito de ordem que este hook existe para fechar.
   */
  setData: (update: T | ((previous: T | null) => T)) => void;
}

export interface DomainResourceOptions {
  /** Mensagem mostrada quando a busca falha. */
  errorMessage?: string;
  /**
   * Quando `false`, não busca e fica em `loading: false`. Serve para as
   * páginas que só têm o que buscar depois de uma criança ser escolhida.
   */
  enabled?: boolean;
}

const DEFAULT_ERROR = 'Erro ao carregar dados. Por favor, tente novamente.';

export function useDomainResource<T>(
  load: (token: string | null) => Promise<T>,
  deps: unknown[],
  options: DomainResourceOptions = {},
): DomainResource<T> {
  const { errorMessage = DEFAULT_ERROR, enabled = true } = options;
  const { getToken, isLoaded, session } = useAuthContext();
  // O id, e não o objeto `session`: depender da identidade do objeto faz o
  // efeito disparar a cada render em que o contexto devolva um objeto novo,
  // o que vira uma tempestade de buscas. A string só muda quando muda mesmo
  // quem está logado.
  const userId = session?.user?.id ?? null;

  // `load` e `getToken` mudam de identidade a cada render; guardar em ref
  // mantém o efeito preso às `deps` que a página declarou, em vez de rodar
  // em toda renderização.
  const loadRef = useRef(load);
  loadRef.current = load;
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  // Dois contadores, e não um. `fetchSequence` diz qual busca é a mais
  // recente; `localWrites` diz se alguém escreveu à mão desde que a busca
  // começou. Com um contador só, uma escrita otimista invalidava a busca em
  // voo INTEIRA — inclusive o `finally` que baixa o `loading`, e a tela ficava
  // no esqueleto para sempre. São perguntas diferentes: "posso escrever este
  // dado?" e "sou eu quem manda no loading?".
  const fetchSequence = useRef(0);
  const localWrites = useRef(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    const mine = ++fetchSequence.current;
    const localWritesAtStart = localWrites.current;

    /** Sou a busca mais recente, e a página ainda existe? Manda no `loading`. */
    const ownsLoading = () => mounted.current && mine === fetchSequence.current;
    /** E, além disso, ninguém escreveu à mão no meio? Aí posso escrever o dado. */
    const mayWriteData = () => ownsLoading() && localWrites.current === localWritesAtStart;

    setLoading(true);
    try {
      const token = await getTokenRef.current();
      const result = await loadRef.current(token);
      if (mayWriteData()) {
        setData(result);
        setError(null);
      }
    } catch {
      if (mayWriteData()) setError(errorMessage);
    } finally {
      // Repare que aqui é `ownsLoading`, não `mayWriteData`: uma escrita
      // otimista descarta o DADO desta busca, mas quem começou o `loading`
      // tem de terminá-lo de qualquer jeito.
      if (ownsLoading()) setLoading(false);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (!isLoaded || !userId || !enabled) {
      // Descarta qualquer busca em voo: o que chegar agora é de um estado
      // que a página já não está mostrando.
      fetchSequence.current++;
      setLoading(false);
      return;
    }
    run();
    // `deps` é a lista que a página declara (childId, filtros, página...).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, isLoaded, userId, enabled, ...deps]);

  const setLocalData = useCallback((update: T | ((previous: T | null) => T)) => {
    localWrites.current++;
    setData((previous) => (typeof update === 'function'
      ? (update as (p: T | null) => T)(previous)
      : update));
  }, []);

  return { data, loading, error, reload: run, setData: setLocalData };
}
