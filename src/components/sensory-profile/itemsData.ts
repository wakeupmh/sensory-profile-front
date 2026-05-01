/**
 * Legacy re-export — the items moved to src/instruments/crianca-3-14/items.ts
 * as part of the multi-instrument refactor. Kept here so any external import
 * still resolves. Prefer importing from `src/instruments/*` in new code.
 */
import type { SensoryItem } from './types';
import type { InstrumentItem } from '../../instruments/types';
import {
  auditoryProcessingItems as _audio,
  visualProcessingItems as _visual,
  tactileProcessingItems as _tactile,
  movementProcessingItems as _movement,
  bodyPositionProcessingItems as _bodyPos,
  oralSensitivityProcessingItems as _oral,
  behavioralResponsesItems as _behavior,
  socialEmotionalResponsesItems as _social,
  attentionResponsesItems as _attention,
} from '../../instruments/crianca-3-14/items';

const toSensoryItems = (items: InstrumentItem[]): SensoryItem[] =>
  items.map((i) => ({ id: i.id, quadrant: i.quadrant, description: i.description, response: null }));

export const auditoryProcessingItems = toSensoryItems(_audio);
export const visualProcessingItems = toSensoryItems(_visual);
export const tactileProcessingItems = toSensoryItems(_tactile);
export const movementProcessingItems = toSensoryItems(_movement);
export const bodyPositionProcessingItems = toSensoryItems(_bodyPos);
export const oralSensitivityProcessingItems = toSensoryItems(_oral);
export const behavioralResponsesItems = toSensoryItems(_behavior);
export const socialEmotionalResponsesItems = toSensoryItems(_social);
export const attentionResponsesItems = toSensoryItems(_attention);
