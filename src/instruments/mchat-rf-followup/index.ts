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
  const failedItemIds = (parent.scores_json.failedItemIds as number[]) ?? [];
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

export const mchatRFFollowup: Instrument = {
  id: 'mchat-rf-followup',
  name: 'M-CHAT-R/F — Entrevista de Acompanhamento',
  shortName: 'M-CHAT-R/F',
  ageRange: { minMonths: 16, maxMonths: 30 },
  description:
    'Entrevista de acompanhamento para crianças com resultado de risco médio no M-CHAT-R. Sondagem estruturada para reclassificar itens reprovados como passou ou falhou.',
  disclaimer:
    'A entrevista de acompanhamento M-CHAT-R/F deve ser conduzida por um profissional treinado. O resultado não é diagnóstico — risco alto indica necessidade de avaliação clínica especializada.',
  hasNormalCurve: false,
  hasQuadrants: false,
  parentInstrumentId: 'mchat-r',
  scale: FOLLOWUP_SCALE,
  defaultBands: [],
  sections: [], // static sections empty; always use dynamicSections at runtime
  dynamicSections,
  summaryComponent: FollowupSummary,
};
