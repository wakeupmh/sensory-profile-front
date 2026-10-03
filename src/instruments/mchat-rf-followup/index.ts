import type { Instrument, InstrumentSection } from '../types';
import { mchatRFFollowupItems } from './items';
import { FollowupSummary } from './FollowupSummary';

const FOLLOWUP_SCALE = {
  id: 'followup-pass-fail',
  options: [
    { value: 'passou', label: 'Passou', numeric: 0 }, // item reclassified pass = 0 fails
    { value: 'falhou', label: 'Falhou', numeric: 1 }, // item still fails = 1
  ],
};

function dynamicSections(parent: { scores_json: Record<string, unknown> }): InstrumentSection[] {
  const raw = parent.scores_json?.failedItemIds;
  const failedItemIds = Array.isArray(raw) ? (raw as number[]) : [];
  return failedItemIds.map((screenItemId) => {
    // Offset: screen items are 3001-3020, probe items are 4001-4020
    const probeItemId = screenItemId - 3000 + 4000;
    const screenItemNumber = screenItemId - 3000;
    const probeItem = mchatRFFollowupItems.find((item) => item.id === probeItemId);
    return {
      key: `followup_item_${screenItemNumber}`,
      title: `Item ${screenItemNumber}`,
      items: probeItem ? [probeItem] : [],
    };
  });
}

// Itens respondidos (4001-4020) -> seções, na ordem dos itens da triagem
function sectionsForItemIds(itemIds: number[]): InstrumentSection[] {
  const screenIds = [...new Set(itemIds)]
    .filter((id) => id > 4000 && id <= 4020)
    .sort((a, b) => a - b)
    .map((id) => id - 4000 + 3000);
  return dynamicSections({ scores_json: { failedItemIds: screenIds } });
}

export const mchatRFFollowup: Instrument = {
  id: 'mchat-rf-followup',
  name: 'M-CHAT-R/F — Entrevista de Acompanhamento',
  shortName: 'M-CHAT-R/F',
  ageRange: { minMonths: 16, maxMonths: 30 },
  description:
    'Entrevista de acompanhamento para crianças com resultado de risco médio no M-CHAT-R. Sondagem estruturada para reclassificar itens reprovados como passou ou falhou.',
  citation: 'M-CHAT-R/F — Robins, D. L., et al. (2014). Validation of the Modified Checklist for Autism in Toddlers, Revised, with Follow-Up (M-CHAT-R/F). Pediatrics, 133(1), 37–45.',
  disclaimer:
    'A entrevista de acompanhamento M-CHAT-R/F deve ser conduzida por um profissional treinado. O resultado não é diagnóstico — risco alto indica necessidade de avaliação clínica especializada.',
  hasNormalCurve: false,
  hasQuadrants: false,
  parentInstrumentId: 'mchat-r',
  scale: FOLLOWUP_SCALE,
  defaultBands: [],
  sections: [], // static sections empty; always use dynamicSections at runtime
  dynamicSections,
  sectionsForItemIds,
  summaryComponent: FollowupSummary,
};
