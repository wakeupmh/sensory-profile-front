import type { InstrumentItem } from '../types';
import { mchatRItems } from '../mchat-r/items';
import { probes } from './probes';

// Probe items for M-CHAT-R/F follow-up.
// IDs 4001-4020 correspond to M-CHAT-R screen items 3001-3020.
// One probe item per screen item — dynamicSections picks only the relevant ones.
// A descrição é a pergunta original da triagem; a orientação traz o roteiro da sondagem.
export const mchatRFFollowupItems: InstrumentItem[] = probes.map((probe) => {
  const screenItem = mchatRItems.find((i) => i.id === 3000 + probe.screenItemNumber);
  return {
    id: probe.probeItemId,
    // Follow-up items don't use Dunn quadrants; 'EV' used as a neutral placeholder
    quadrant: 'EV' as const,
    description: screenItem?.description ?? `Item ${probe.screenItemNumber} do M-CHAT-R`,
    guidance: [`Pergunte: ${probe.question}`, probe.guidance, probe.rule],
  };
});
