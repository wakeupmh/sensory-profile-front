import { useEffect, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { clinicApi } from '../services/api';

/**
 * Se esta conta faz parte de alguma clínica — só para decidir se a entrada
 * "Clínicas" aparece na navegação, e nada além disso.
 *
 * Mesmo desenho de `useCareTeamCaseload`: uma busca só, em cache no escopo do
 * módulo, porque `Menu` e `BottomNav` montam o hook ao mesmo tempo e nenhum
 * dos dois deve disparar a própria requisição. Falha fechada — um erro aqui
 * apenas mantém o link escondido, nunca vira erro de página.
 */
let cached: boolean | null = null;
let inFlight: Promise<boolean> | null = null;

export function resetClinicMembershipCache(): void {
  cached = null;
  inFlight = null;
}

export function useClinicMembership(): boolean {
  const { getToken, isLoaded, session } = useAuthContext();
  const [belongs, setBelongs] = useState<boolean>(cached ?? false);

  useEffect(() => {
    if (!isLoaded || !session) return;

    if (cached !== null) {
      setBelongs(cached);
      return;
    }

    let cancelled = false;
    if (!inFlight) {
      inFlight = (async () => {
        try {
          const token = await getToken();
          return (await clinicApi.listMine(token)).length > 0;
        } catch {
          return false;
        }
      })();
    }

    inFlight.then((result) => {
      cached = result;
      inFlight = null;
      if (!cancelled) setBelongs(result);
    });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, session, getToken]);

  return belongs;
}
