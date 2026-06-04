import type { ComponentType } from 'react';
import type { SensoryItem } from '../components/sensory-profile/types';

export type Quadrant = 'EV' | 'SN' | 'EX' | 'OB';

export interface ResponseOption {
  value: string;
  label: string;
  numeric: number;
}

export interface ResponseScale {
  id: string;
  options: ResponseOption[];
}

export type ResponseValue = string;
// Backward-compat alias
export type FrequencyResponse = ResponseValue;

export interface InstrumentItem {
  id: number;
  quadrant: Quadrant;
  description: string;
}

export interface ClassificationBand {
  label: string;
  /** Absolute raw-score threshold (inclusive upper bound). Mutually exclusive with `maxScorePct`. */
  maxScoreAbs?: number;
  /** Proportional threshold, 0..1, applied to the section's max possible score. */
  maxScorePct?: number;
  /** CSS color used in the report (e.g. '#6a994e' or 'var(--jade-9)'). */
  color: string;
}

export interface InstrumentSection {
  key: string;
  title: string;
  items: InstrumentItem[];
  /** Overrides the instrument's defaultBands for this section. */
  bands?: ClassificationBand[];
  allowedValues?: string[];
}

export interface Instrument {
  id: string;
  name: string;
  shortName: string;
  ageRange: { minMonths: number; maxMonths: number };
  description: string;
  disclaimer?: string;
  /** Academic / clinical citation rendered in the report header for trust/provenance. */
  citation?: string;
  sections: InstrumentSection[];
  defaultBands: ClassificationBand[];
  /**
   * When true, ReportContent renders the bell-curve chart (5-tier distribution).
   * When false, only the summary table is shown.
   */
  hasNormalCurve?: boolean;
  /** Response scale definition for this instrument. */
  scale?: ResponseScale;
  /** When true, instrument uses Dunn's four-quadrant model. */
  hasQuadrants?: boolean;
  /** When true, instrument items may have linked follow-up items. */
  allowsLinkedFollowup?: boolean;
  /** ID of a parent instrument (for follow-up/linked instruments). */
  parentInstrumentId?: string;
  /** Dynamic sections derived from parent instrument scores. */
  dynamicSections?: (parent: { scores_json: Record<string, unknown> }) => InstrumentSection[];
  /**
   * Optional per-instrument summary block rendered near the top of the report,
   * before the per-section breakdown. Receives the computed scoreData array and
   * the instrument definition.
   */
  summaryComponent?: ComponentType<{ scores: unknown; instrument: Instrument; assessmentId?: string }>;
}

/** Build the initial SensoryItem[] for a section from its instrument definition. */
export const toSensoryItems = (items: InstrumentItem[]): SensoryItem[] =>
  items.map((i) => ({
    id: i.id,
    quadrant: i.quadrant,
    description: i.description,
    response: null,
  }));
