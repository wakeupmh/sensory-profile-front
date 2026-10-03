// Pontuação do M-CHAT-R no cliente. Usada como reserva quando a API não devolve
// os scores calculados (scores_json) junto da avaliação.

/** Itens com pontuação invertida: resposta "sim" é sinal de alerta. */
export const MCHAT_REVERSE_ITEMS: readonly number[] = [2, 5, 12];

const SCREEN_BASE = 3000;
const PROBE_BASE = 4000;

export type MchatRisk = 'baixo' | 'medio' | 'alto';

export interface MchatScores {
  failCount: number;
  failedItemIds: number[];
  risk: MchatRisk;
}

export interface FollowupPerItem {
  probeItemId: number;
  screenItemId: number;
  result: 'passou' | 'falhou';
}

export interface FollowupScores {
  failCount: number;
  finalRisk: 'baixo' | 'alto';
  perItem: FollowupPerItem[];
}

export interface ScoredResponse {
  id: number;
  response: string | null;
}

/** Um item da triagem reprova quando a resposta indica sinal de alerta. */
export function screenItemFails(screenItemNumber: number, response: string): boolean {
  const reverse = MCHAT_REVERSE_ITEMS.includes(screenItemNumber);
  return reverse ? response === 'sim' : response === 'nao';
}

export function riskFromFailCount(failCount: number): MchatRisk {
  if (failCount <= 2) return 'baixo';
  if (failCount <= 7) return 'medio';
  return 'alto';
}

export function computeMchatScores(items: ScoredResponse[]): MchatScores {
  const failedItemIds = items
    .filter((i) => i.response && screenItemFails(i.id - SCREEN_BASE, i.response))
    .map((i) => i.id)
    .sort((a, b) => a - b);
  return {
    failCount: failedItemIds.length,
    failedItemIds,
    risk: riskFromFailCount(failedItemIds.length),
  };
}

export function computeFollowupScores(items: ScoredResponse[]): FollowupScores {
  const perItem: FollowupPerItem[] = items
    .filter((i) => i.response === 'passou' || i.response === 'falhou')
    .map((i) => ({
      probeItemId: i.id,
      screenItemId: i.id - PROBE_BASE + SCREEN_BASE,
      result: i.response as 'passou' | 'falhou',
    }));
  const failCount = perItem.filter((p) => p.result === 'falhou').length;
  return { failCount, finalRisk: failCount >= 2 ? 'alto' : 'baixo', perItem };
}
