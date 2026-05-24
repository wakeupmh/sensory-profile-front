import type { ClassificationBand, Instrument } from '../types';
import {
  auditoryProcessingItems,
  visualProcessingItems,
  tactileProcessingItems,
  movementProcessingItems,
  bodyPositionProcessingItems,
  oralSensitivityProcessingItems,
  behavioralResponsesItems,
  socialEmotionalResponsesItems,
  attentionResponsesItems,
} from './items';

const bands = (veryLow: number, low: number, average: number, high: number): ClassificationBand[] => [
  { label: 'Muito menos que outros(as)', maxScoreAbs: veryLow, color: '#4361ee' },
  { label: 'Menos que outros(as)', maxScoreAbs: low, color: '#4895ef' },
  { label: 'Exatamente como a maioria dos(as) outros(as)', maxScoreAbs: average, color: '#6a994e' },
  { label: 'Mais que outros(as)', maxScoreAbs: high, color: '#f4a261' },
  { label: 'Muito mais que outros(as)', maxScoreAbs: Number.POSITIVE_INFINITY, color: '#d62828' },
];

export const crianca3a14: Instrument = {
  id: 'crianca-3-14',
  name: '🧒 Perfil Sensorial — Criança (3 a 14 anos)',
  shortName: 'Criança (3–14)',
  ageRange: { minMonths: 36, maxMonths: 168 },
  description:
    'Questionário de processamento sensorial para crianças de 3 a 14 anos, organizado em 9 áreas de processamento e respostas.',
  hasNormalCurve: true,
  hasQuadrants: true,
  scale: {
    id: 'sp2-likert-5',
    options: [
      { value: 'quase sempre',    label: 'Quase Sempre',     numeric: 5 },
      { value: 'frequentemente',  label: 'Frequentemente',   numeric: 4 },
      { value: 'metade do tempo', label: 'Metade do Tempo',  numeric: 3 },
      { value: 'ocasionalmente',  label: 'Ocasionalmente',   numeric: 2 },
      { value: 'quase nunca',     label: 'Quase Nunca',      numeric: 1 },
      { value: 'não se aplica',   label: 'Não Se Aplica',    numeric: 0 },
    ],
  },
  defaultBands: bands(0, 0, 0, 0),
  sections: [
    {
      key: 'auditoryProcessing',
      title: 'Processamento Auditivo',
      items: auditoryProcessingItems,
      bands: bands(8, 16, 24, 32),
    },
    {
      key: 'visualProcessing',
      title: 'Processamento Visual',
      items: visualProcessingItems,
      bands: bands(11, 22, 33, 44),
    },
    {
      key: 'tactileProcessing',
      title: 'Processamento Tátil',
      items: tactileProcessingItems,
      bands: bands(18, 36, 54, 72),
    },
    {
      key: 'movementProcessing',
      title: 'Processamento de Movimento',
      items: movementProcessingItems,
      bands: bands(16, 32, 48, 64),
    },
    {
      key: 'bodyPositionProcessing',
      title: 'Processamento de Posição do Corpo',
      items: bodyPositionProcessingItems,
      bands: bands(12, 24, 36, 48),
    },
    {
      key: 'oralSensitivityProcessing',
      title: 'Processamento de Sensibilidade Oral',
      items: oralSensitivityProcessingItems,
      bands: bands(12, 24, 36, 48),
    },
    {
      key: 'behavioralResponses',
      title: 'Conduta associada ao processamento sensorial',
      items: behavioralResponsesItems,
      bands: bands(9, 18, 27, 36),
    },
    {
      key: 'socialEmotionalResponses',
      title: 'Respostas Socioemocionais',
      items: socialEmotionalResponsesItems,
      bands: bands(8, 16, 24, 32),
    },
    {
      key: 'attentionResponses',
      title: 'Respostas de Atenção',
      items: attentionResponsesItems,
      bands: bands(7, 14, 21, 28),
    },
  ],
};
