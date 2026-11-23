import type { SupabaseClient } from '@supabase/supabase-js';

// O cliente do Supabase (~200KB) só baixa quando há sessão a restaurar ou
// alguém vai entrar. Visitante de "/", "/privacidade" ou "/termos" não paga
// por ele. Todo acesso ao cliente passa por aqui, para o AuthProvider saber
// quando ele existe e começar a ouvir login e logout.
let client: Promise<SupabaseClient> | null = null;
const waiting = new Set<(c: SupabaseClient) => void>();

export function loadSupabase(): Promise<SupabaseClient> {
  if (!client) {
    client = import('./supabase').then((m) => m.supabase);
    void client.then((c) => waiting.forEach((cb) => cb(c)));
  }
  return client;
}

/** Chama `cb` quando o cliente carregar (ou já, se carregou). Devolve o cancelamento. */
export function onSupabaseLoaded(cb: (c: SupabaseClient) => void): () => void {
  if (client) {
    let active = true;
    void client.then((c) => active && cb(c));
    return () => {
      active = false;
    };
  }
  waiting.add(cb);
  return () => waiting.delete(cb);
}

/**
 * Há sessão para restaurar? O supabase-js guarda a sessão em
 * `sb-<projeto>-auth-token`; um retorno de link de e-mail traz os tokens na URL.
 */
export function hasSessionToRestore(): boolean {
  if (/access_token=|refresh_token=|[?&]code=|error_description=/.test(window.location.hash + window.location.search)) return true;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      if (/^sb-.+-auth-token$/.test(localStorage.key(i) ?? '')) return true;
    }
    return false;
  } catch {
    return true;
  }
}
