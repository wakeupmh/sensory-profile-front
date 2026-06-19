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

const proportionalBands: ClassificationBand[] = [
  { label: 'Típico', maxScorePct: 0.4, color: '#2f7a3d' },
  { label: 'Atípico leve', maxScorePct: 0.7, color: '#e08e0b' },
  { label: 'Atípico marcado', maxScorePct: 1.01, color: '#d62828' },
];

export const crianca3a14: Instrument = {
  id: 'crianca-3-14',
  name: 'Triagem Sensorial — Criança (3 a 14 anos)',
  shortName: 'Criança (3–14)',
  ageRange: { minMonths: 36, maxMonths: 168 },
  description:
    'Triagem de processamento sensorial para crianças de 3 a 14 anos, organizada em 9 áreas e classificada pelos quatro quadrantes de processamento sensorial (Busca, Evitação, Sensibilidade, Registro).',
  disclaimer:
    'Triagem interna inspirada no modelo de processamento sensorial dos quatro quadrantes (Dunn). Não substitui instrumentos normativos padronizados — o resultado deve ser interpretado como apoio à observação clínica.',
  hasNormalCurve: false,
  hasQuadrants: true,
  scale: {
    id: 'sensory-likert-5',
    options: [
      { value: 'quase sempre',    label: 'Quase Sempre',     numeric: 5 },
      { value: 'frequentemente',  label: 'Frequentemente',   numeric: 4 },
      { value: 'metade do tempo', label: 'Metade do Tempo',  numeric: 3 },
      { value: 'ocasionalmente',  label: 'Ocasionalmente',   numeric: 2 },
      { value: 'quase nunca',     label: 'Quase Nunca',      numeric: 1 },
      { value: 'não se aplica',   label: 'Não Se Aplica',    numeric: 0 },
    ],
  },
  defaultBands: proportionalBands,
  sections: [
    { key: 'auditoryProcessing',       title: 'Processamento Auditivo',                       items: auditoryProcessingItems },
    { key: 'visualProcessing',         title: 'Processamento Visual',                         items: visualProcessingItems },
    { key: 'tactileProcessing',        title: 'Processamento Tátil',                          items: tactileProcessingItems },
    { key: 'movementProcessing',       title: 'Processamento de Movimento',                   items: movementProcessingItems },
    { key: 'bodyPositionProcessing',   title: 'Processamento de Posição do Corpo',            items: bodyPositionProcessingItems },
    { key: 'oralSensitivityProcessing', title: 'Processamento de Sensibilidade Oral',         items: oralSensitivityProcessingItems },
    { key: 'behavioralResponses',      title: 'Respostas Comportamentais',                    items: behavioralResponsesItems },
    { key: 'socialEmotionalResponses', title: 'Respostas Socioemocionais',                    items: socialEmotionalResponsesItems },
    { key: 'attentionResponses',       title: 'Respostas de Atenção',                         items: attentionResponsesItems },
  ],
};
