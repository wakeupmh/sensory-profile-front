import type { Instrument } from './types';
import { crianca3a14 } from './crianca-3-14';
import { criancaPequena } from './crianca-pequena';

export const instruments: Record<string, Instrument> = {
  [crianca3a14.id]: crianca3a14,
  [criancaPequena.id]: criancaPequena,
};

export type InstrumentId = string;

export const DEFAULT_INSTRUMENT_ID: InstrumentId = crianca3a14.id;

export const getInstrument = (id?: string | null): Instrument => {
  if (id && instruments[id]) return instruments[id];
  return instruments[DEFAULT_INSTRUMENT_ID];
};

export const listInstruments = (): Instrument[] => Object.values(instruments);

export const findSectionByItemId = (
  instrument: Instrument,
  itemId: number,
): string | null => {
  for (const section of instrument.sections) {
    if (section.items.some((i) => i.id === itemId)) return section.key;
  }
  return null;
};

export * from './types';
