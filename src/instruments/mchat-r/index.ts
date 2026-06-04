import type { Instrument } from '../types';
import { mchatRItems } from './items';
import { MchatRSummary } from './MchatRSummary';

export const mchatR: Instrument = {
  id: 'mchat-r',
  name: 'M-CHAT-R — Triagem de Autismo em Toddlers (Revisado)',
  shortName: 'M-CHAT-R',
  ageRange: { minMonths: 16, maxMonths: 30 },
  description:
    'Instrumento de triagem para autismo em crianças de 16 a 30 meses. Composto por 20 perguntas sim/não respondidas pelo cuidador.',
  citation: 'M-CHAT-R — Robins, D. L., et al. (2014). Validation of the Modified Checklist for Autism in Toddlers, Revised (M-CHAT-R). Pediatrics, 133(1), 37–45.',
  disclaimer:
    'O M-CHAT-R é uma ferramenta de triagem, não um instrumento diagnóstico. Resultado de risco médio ou alto indica necessidade de avaliação clínica especializada.',
  hasNormalCurve: false,
  hasQuadrants: false,
  allowsLinkedFollowup: true,
  scale: {
    id: 'yes-no',
    options: [
      { value: 'sim', label: 'Sim', numeric: 1 },
      { value: 'nao', label: 'Não', numeric: 0 },
    ],
  },
  // No band-based classification — risk is computed directly by scoring strategy
  defaultBands: [],
  sections: [
    {
      key: 'triagem',
      title: 'Triagem M-CHAT-R',
      items: mchatRItems,
    },
  ],
  summaryComponent: MchatRSummary,
};
