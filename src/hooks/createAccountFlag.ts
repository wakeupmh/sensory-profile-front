import { useEffect, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';

/**
 * Um sim/não da conta que decide se um link aparece na navegação ("tem
 * atendimentos", "faz parte de clínica").
 *
 * - Uma busca só, em cache no módulo: `Menu` e `BottomNav` montam o hook ao
 *   mesmo tempo e nenhum dos dois deve disparar a própria requisição.
 * - O cache é da conta: trocar de usuário na mesma aba busca de novo.
 * - Falha fechada e sem cache: erro de rede só mantém o link escondido.
 * - `reset()` (depois de aceitar um convite) faz os hooks MONTADOS buscarem
 *   de novo — o link aparece sem recarregar a página.
 */
export function createAccountFlag(load: (token: string | null) => Promise<boolean>) {
  let cached: boolean | null = null;
  let inFlight: Promise<boolean | null> | null = null;
  let cachedFor: string | null = null;
  const listeners = new Set<() => void>();

  function reset(): void {
    cached = null;
    inFlight = null;
    cachedFor = null;
    listeners.forEach((refetch) => refetch());
  }

  function useFlag(): boolean {
    const { getToken, isLoaded, session } = useAuthContext();
    const userId = session?.user?.id ?? null;
    const [value, setValue] = useState<boolean>(cached ?? false);
    const [generation, setGeneration] = useState(0);

    useEffect(() => {
      const refetch = () => setGeneration((g) => g + 1);
      listeners.add(refetch);
      return () => {
        listeners.delete(refetch);
      };
    }, []);

    useEffect(() => {
      if (!isLoaded || !userId) return;
      if (cachedFor !== userId) {
        cached = null;
        inFlight = null;
        cachedFor = userId;
      }
      if (cached !== null) {
        setValue(cached);
        return;
      }

      let cancelled = false;
      if (!inFlight) {
        inFlight = getToken().then(load).catch(() => null);
      }
      const request = inFlight;
      request.then((result) => {
        if (request === inFlight) {
          if (result !== null && cachedFor === userId) cached = result;
          inFlight = null;
        }
        if (!cancelled) setValue(result ?? false);
      });
      return () => {
        cancelled = true;
      };
    }, [isLoaded, userId, getToken, generation]);

    return value;
  }

  return { useFlag, reset };
}
