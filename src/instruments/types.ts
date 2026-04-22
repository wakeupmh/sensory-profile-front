import type { SensoryItem } from '../components/sensory-profile/types';

export type Quadrant = 'EV' | 'SN' | 'EX' | 'OB';

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
}

export interface Instrument {
  id: string;
  name: string;
  shortName: string;
  ageRange: { minMonths: number; maxMonths: number };
  description: string;
  disclaimer?: string;
  sections: InstrumentSection[];
  defaultBands: ClassificationBand[];
  /**
   * When true, ReportContent renders the bell-curve chart (5-tier distribution).
   * When false, only the summary table is shown.
   */
  hasNormalCurve?: boolean;
}

/** Build the initial SensoryItem[] for a section from its instrument definition. */
export const toSensoryItems = (items: InstrumentItem[]): SensoryItem[] =>
  items.map((i) => ({
    id: i.id,
    quadrant: i.quadrant,
    description: i.description,
    response: null,
  }));
