import { clearLogQueue } from './offlineLogQueue';

// Chaves com dados de saúde da criança guardadas no aparelho: rascunhos de
// formulário (useDraftPersistence, Home) e a criança selecionada por usuário
// (useDomainPage). Apagadas de todos os usuários, não só de quem sai: num
// aparelho compartilhado a sobra de outra conta também não deve ficar.
const HEALTH_KEY_PREFIXES = ['draft:', 'sensory-profile-selected-child:'];

export function clearHealthDataFromDevice(): void {
  clearLogQueue();
  try {
    const keys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i) ?? '');
    for (const key of keys) {
      if (HEALTH_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))) localStorage.removeItem(key);
    }
  } catch {
    // armazenamento indisponível: não há o que apagar
  }
}
