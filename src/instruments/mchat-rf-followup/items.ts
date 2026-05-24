import type { InstrumentItem } from '../types';

// Probe items for M-CHAT-R/F follow-up.
// IDs 4001-4020 correspond to M-CHAT-R screen items 3001-3020.
// One probe item per screen item — dynamicSections picks only the relevant ones.
export const mchatRFFollowupItems: InstrumentItem[] = Array.from({ length: 20 }, (_, i) => {
  const n = i + 1;
  return {
    id: 4000 + n,
    // Follow-up items don't use Dunn quadrants; 'EV' used as a neutral placeholder
    quadrant: 'EV' as const,
    description: `Sondagem — Item ${n} do M-CHAT-R`,
  };
});
