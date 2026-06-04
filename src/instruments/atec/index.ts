import type { ClassificationBand, Instrument } from '../types';
import {
  speechItems,
  sociabilityItems,
  sensoryCognitiveItems,
  healthBehaviorItems,
} from './items';

/**
 * Traffic-light 4-band helper.
 * Colors: green (baixo) → yellow (médio-baixo) → orange (médio-alto) → red (alto)
 */
const trafficBands = (
  low: number,
  medLow: number,
  medHigh: number,
  high: number,
): ClassificationBand[] => [
  { label: 'Baixo', maxScoreAbs: low, color: '#4ade80' },
  { label: 'Médio-Baixo', maxScoreAbs: medLow, color: '#fbbf24' },
  { label: 'Médio-Alto', maxScoreAbs: medHigh, color: '#f97316' },
  { label: 'Alto', maxScoreAbs: high, color: '#ef4444' },
];

// Subscale 1: Speech/Language/Communication — 14 items × max 3 = 42
// Bands: 0-9 excellent, 10-20 mild, 21-31 moderate, 32-42 severe
const speechBands: ClassificationBand[] = trafficBands(9, 20, 31, 42);

// Subscale 2: Sociability — 20 items × max 2 = 40
const sociabilityBands: ClassificationBand[] = trafficBands(9, 19, 29, 40);

// Subscale 3: Sensory/Cognitive Awareness — 18 items × max 2 = 36
const sensoryCognitiveBands: ClassificationBand[] = trafficBands(8, 17, 26, 36);

// Subscale 4: Health/Physical/Behavior — 25 items × max 3 = 75
const healthBehaviorBands: ClassificationBand[] = trafficBands(18, 37, 56, 75);

// Default bands for total score (max 193)
const atecDefaultBands: ClassificationBand[] = trafficBands(48, 96, 144, 193);

const ATEC_SCALE = {
  id: 'atec-4pt',
  options: [
    { value: '0', label: '0', numeric: 0 },
    { value: '1', label: '1', numeric: 1 },
    { value: '2', label: '2', numeric: 2 },
    { value: '3', label: '3', numeric: 3 },
  ],
};

export const atec: Instrument = {
  id: 'atec',
  name: 'ATEC — Autism Treatment Evaluation Checklist',
  shortName: 'ATEC',
  // No strict age range; can be used from early childhood onward
  ageRange: { minMonths: 0, maxMonths: 9999 },
  description:
    'Lista de verificação para avaliar o tratamento do autismo, composta por 77 itens distribuídos em 4 subescalas.',
  citation: 'ATEC — Rimland, B., & Edelson, S. M. (1999). Autism Treatment Evaluation Checklist. Autism Research Institute.',
  disclaimer:
    'O ATEC é um instrumento de avaliação e não deve ser usado como ferramenta de diagnóstico. ' +
    'Pontuações mais altas indicam maior severidade de sintomas.',
  scale: ATEC_SCALE,
  hasNormalCurve: false,
  sections: [
    {
      key: 'fala',
      title: 'Fala/Linguagem/Comunicação',
      items: speechItems,
      bands: speechBands,
    },
    {
      key: 'sociabilidade',
      title: 'Sociabilidade',
      items: sociabilityItems,
      bands: sociabilityBands,
      allowedValues: ['0', '1', '2'],
    },
    {
      key: 'conscienciaSensorial',
      title: 'Consciência Sensorial/Cognitiva',
      items: sensoryCognitiveItems,
      bands: sensoryCognitiveBands,
      allowedValues: ['0', '1', '2'],
    },
    {
      key: 'saudeComportamento',
      title: 'Saúde/Comportamento Físico',
      items: healthBehaviorItems,
      bands: healthBehaviorBands,
    },
  ],
  defaultBands: atecDefaultBands,
};
