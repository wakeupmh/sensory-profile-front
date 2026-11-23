import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { hasSessionToRestore, loadSupabase, onSupabaseLoaded } from '../lib/loadSupabase';
import { clearHealthDataFromDevice } from '../services/deviceData';

interface AuthContextValue {
  session: Session | null;
  isLoaded: boolean;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe = () => {};

    const stopWaiting = onSupabaseLoaded((supabase) => {
      supabase.auth.getSession()
        .then(({ data }) => {
          if (isMounted) setSession(data.session);
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setIsLoaded(true);
        });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        // Sessão encerrada por outra aba ou por expiração também limpa o aparelho.
        if (event === 'SIGNED_OUT') clearHealthDataFromDevice();
        if (isMounted) setSession(session);
      });
      unsubscribe = () => subscription.unsubscribe();
    });

    // Sem sessão guardada não há o que restaurar: as páginas públicas abrem
    // sem baixar o cliente, e a tela de login o carrega quando abrir.
    if (hasSessionToRestore()) void loadSupabase();
    else setIsLoaded(true);

    return () => {
      isMounted = false;
      stopWaiting();
      unsubscribe();
    };
  }, []);

  // Referências estáveis: consumidores usam getToken em deps de efeitos (ex.: busca global)
  const getToken = useCallback(async (): Promise<string | null> => {
    const { data } = await (await loadSupabase()).auth.getSession();
    return data.session?.access_token ?? null;
  }, []);

  // LGPD: ao sair, nada de saúde da criança fica no aparelho, mesmo se o
  // servidor de autenticação estiver fora do ar.
  const signOut = useCallback(async () => {
    try {
      await (await loadSupabase()).auth.signOut();
    } finally {
      clearHealthDataFromDevice();
    }
  }, []);

  const value = useMemo(() => ({ session, isLoaded, getToken, signOut }), [session, isLoaded, getToken, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}
