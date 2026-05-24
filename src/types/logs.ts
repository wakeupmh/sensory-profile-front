export type LogType = 'abc' | 'mood' | 'sleep' | 'food' | 'toileting';

export interface AbcData { antecedent: string; behavior: string; consequence: string; intensity?: 1|2|3|4|5; }
export interface MoodData { level: 1|2|3|4|5; tags?: string[]; }
export interface SleepData { bedtime?: string; waketime?: string; wakings?: number; quality?: 1|2|3; }
export interface FoodData { meal?: 'cafe' | 'almoco' | 'jantar' | 'lanche'; accepted?: string[]; refused?: string[]; }
export interface ToiletingData { type?: 'urina' | 'fezes' | 'ambos'; independent?: boolean; }
export type LogData = AbcData | MoodData | SleepData | FoodData | ToiletingData;

export interface DailyLog {
  id: string; childId: string; logType: LogType; occurredAt: string;
  data: LogData; notes?: string | null; createdAt: string; updatedAt: string;
}

export interface CreateLogPayload {
  childId: string; logType: LogType; occurredAt: string; data: LogData; notes?: string | null;
}
