import axios from 'axios';

/**
 * O motivo de uma recusa de validação (400), em uma linha, para mostrar a quem
 * preencheu o formulário. `null` para qualquer outro erro — aí "tente de novo"
 * é o conselho certo; numa recusa de validação, não é.
 */
export function apiErrorDetail(err: unknown): string | null {
  if (!axios.isAxiosError(err) || err.response?.status !== 400) return null;
  const details = (err.response.data as { error?: { details?: Array<{ message?: string }> } })?.error?.details;
  const messages = [...new Set((details ?? []).map((d) => d.message).filter((m): m is string => !!m))];
  return messages.length > 0 ? messages.join('; ') : null;
}
