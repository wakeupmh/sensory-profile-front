import { useEffect, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { careTeamApi } from '../services/api';

/**
 * Whether the current user has an accepted, non-revoked care-team
 * membership on at least one child — gates the "Meus atendimentos" nav
 * entry so a parent-only account never sees a dead link into an empty
 * caseload.
 *
 * Fetched once and cached at module scope (not per-component state): Menu
 * and BottomNav both mount this hook simultaneously, and neither should
 * fire its own request, nor should navigating around the app re-fetch on
 * every remount. Nothing here polls — a stale "no caseload" only clears
 * once `resetCareTeamCaseloadCache` is called (done right after a
 * successful accept, see CareTeamAcceptPage) or the app reloads.
 */
let cachedHasCaseload: boolean | null = null;
let inFlight: Promise<boolean | null> | null = null;
// De quem é o valor em cache: sem isso, trocar de conta na mesma aba herdava o
// resultado da conta anterior (links de navegação errados) até recarregar.
let cachedFor: string | null = null;

export function resetCareTeamCaseloadCache(): void {
  cachedHasCaseload = null;
  inFlight = null;
  cachedFor = null;
}

export function useCareTeamCaseload(): boolean {
  const { getToken, isLoaded, session } = useAuthContext();
  const [hasCaseload, setHasCaseload] = useState<boolean>(cachedHasCaseload ?? false);

  useEffect(() => {
    if (!isLoaded || !session) return;
    const userId = session.user?.id ?? null;
    if (cachedFor !== userId) {
      cachedHasCaseload = null;
      inFlight = null;
      cachedFor = userId;
    }

    if (cachedHasCaseload !== null) {
      setHasCaseload(cachedHasCaseload);
      return;
    }

    let cancelled = false;
    if (!inFlight) {
      inFlight = (async () => {
        try {
          const token = await getToken();
          const caseload = await careTeamApi.myChildren(token);
          return caseload.length > 0;
        } catch {
          // Nav gating fails closed: an error here just keeps the link
          // hidden, it never surfaces as a page error. Falha não é cacheada,
          // para uma queda de rede não esconder o link até recarregar.
          return null;
        }
      })();
    }

    inFlight.then((result) => {
      if (result !== null && cachedFor === userId) cachedHasCaseload = result;
      inFlight = null;
      if (!cancelled) setHasCaseload(result ?? false);
    });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, session, getToken]);

  return hasCaseload;
}
