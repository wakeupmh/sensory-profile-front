import type { TFunction } from 'i18next';
import type { AbcData, DailyLog, FoodData, MoodData, SleepData, ToiletingData } from '../types/logs';

export const MOOD_EMOJI = { 1: '😣', 2: '😟', 3: '😐', 4: '🙂', 5: '😊' } as const;

/** Uma linha com o que foi registrado — o cartão da lista mostra isto, não só a data. */
export function logSummary(log: Pick<DailyLog, 'logType' | 'data'>, t: TFunction): string {
  const parts: string[] = [];
  switch (log.logType) {
    case 'mood': {
      const d = (log.data ?? {}) as MoodData;
      if (d.level) parts.push(`${MOOD_EMOJI[d.level]} ${t(`p2Logs.mood.l${d.level}`)}`);
      if (d.tags?.length) parts.push(d.tags.map((tag) => t(`p2Logs.mood.tag.${tag}`, { defaultValue: tag })).join(', '));
      break;
    }
    case 'sleep': {
      const d = (log.data ?? {}) as SleepData;
      if (d.bedtime || d.waketime) parts.push(`${d.bedtime ?? '?'} → ${d.waketime ?? '?'}`);
      if (d.wakings != null) parts.push(t('p2Logs.summary.wakings', { count: d.wakings }));
      if (d.quality) parts.push(t(`p2Logs.sleep.q${d.quality}`));
      break;
    }
    case 'food': {
      const d = (log.data ?? {}) as FoodData;
      if (d.meal) parts.push(t(`p2Logs.food.${d.meal}`));
      if (d.accepted?.length) parts.push(t('p2Logs.summary.accepted', { list: d.accepted.join(', ') }));
      if (d.refused?.length) parts.push(t('p2Logs.summary.refused', { list: d.refused.join(', ') }));
      break;
    }
    case 'toileting': {
      const d = (log.data ?? {}) as ToiletingData;
      if (d.type) parts.push(t(`p2Logs.toilet.${d.type}`));
      if (d.independent) parts.push(t('p2Logs.toilet.independent'));
      break;
    }
    case 'abc': {
      const d = (log.data ?? {}) as AbcData;
      if (d.behavior) parts.push(d.behavior);
      break;
    }
  }
  return parts.join(' · ');
}
