import type { Instrument } from '../../instruments/types';
import { toSensoryItems } from '../../instruments/types';
import { getSectionsForItemIds } from '../../instruments';
import type { SensoryItem, SensorySection } from './types';

interface RawResponse {
  itemId: number;
  response: string;
  id?: string;
}

/**
 * Monta as seções preenchidas de uma avaliação carregada da API.
 * Seções dinâmicas (M-CHAT-R/F) são derivadas dos itens respondidos.
 */
export function buildSectionsFromResponses(
  instrument: Instrument,
  responses: RawResponse[] | unknown,
): { sections: Record<string, SensorySection>; sectionKeys: string[] } {
  const list: RawResponse[] = Array.isArray(responses) ? responses : [];
  const defs = getSectionsForItemIds(instrument, list.map((r) => r.itemId));
  const sections: Record<string, SensorySection> = Object.fromEntries(
    defs.map((s) => [
      s.key,
      { items: toSensoryItems(s.items) as SensoryItem[], rawScore: 0, comments: '' },
    ]),
  );
  list.forEach((r) => {
    for (const section of Object.values(sections)) {
      const target = section.items.find((it) => it.id === r.itemId);
      if (target) {
        target.response = r.response as SensoryItem['response'];
        if (r.id) target.responseId = r.id;
        return;
      }
    }
  });
  return { sections, sectionKeys: defs.map((s) => s.key) };
}
