export type LogType = 'abc' | 'mood' | 'sleep' | 'food' | 'toileting';

/**
 * Nome de cada tipo de registro, em um lugar só.
 *
 * Existiam cinco cópias desta tabela, e elas discordavam: `toileting` era
 * "Higiene" no relatório consolidado e "Banheiro" em todo o resto; `abc` era
 * "ABC", "ABC (Comportamento)" ou "Comportamento (ABC)" conforme a tela;
 * `mood` era "Humor" ou "Humor / Regulação". O cuidador via o mesmo tipo com
 * três nomes diferentes dependendo de onde estivesse.
 *
 * Tipado como `Record<LogType, string>` — e não `Record<string, string>`, que
 * era o que deixava uma chave faltando passar pelo compilador e renderizar
 * `undefined`.
 */
export const LOG_TYPE_LABELS: Record<LogType, string> = {
  abc: 'ABC (Comportamento)',
  mood: 'Humor',
  sleep: 'Sono',
  food: 'Alimentação',
  toileting: 'Banheiro',
};

/** Emoji de cada tipo, usado no seletor. Mesma razão de existir num lugar só. */
export const LOG_TYPE_EMOJI: Record<LogType, string> = {
  abc: '🔄',
  mood: '😊',
  sleep: '🌙',
  food: '🍽️',
  toileting: '🚿',
};

export const LOG_TYPES: LogType[] = ['abc', 'mood', 'sleep', 'food', 'toileting'];

export interface AbcData { antecedent: string; behavior: string; consequence: string; intensity?: 1|2|3|4|5; }
export interface MoodData { level: 1|2|3|4|5; tags?: string[]; }
export interface SleepData { bedtime?: string; waketime?: string; wakings?: number; quality?: 1|2|3; }
export interface FoodData { meal?: 'cafe' | 'almoco' | 'jantar' | 'lanche'; accepted?: string[]; refused?: string[]; }
export interface ToiletingData { type?: 'urina' | 'fezes' | 'ambos'; independent?: boolean; }
export type LogData = AbcData | MoodData | SleepData | FoodData | ToiletingData;

export interface LogAttachment {
  id: string;
  logId: string;
  mimeType: string;
  sizeBytes: number | null;
  createdAt: string;
  url: string;
}

export interface DailyLog {
  id: string; childId: string; logType: LogType; occurredAt: string;
  data: LogData; notes?: string | null; createdAt: string; updatedAt: string;
  attachments?: LogAttachment[];
}

export interface CreateLogPayload {
  childId: string; logType: LogType; occurredAt: string; data: LogData; notes?: string | null;
}

export interface CreateLogAttachmentPayload {
  mimeType: string;
  sizeBytes?: number | null;
}

export interface CreateLogAttachmentResponse {
  attachment: { id: string; logId: string; mimeType: string; sizeBytes: number | null; createdAt: string };
  uploadUrl: string;
}
