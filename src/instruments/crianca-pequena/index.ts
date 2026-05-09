import type { ClassificationBand, Instrument } from '../types';
import {
  toddlerAuditoryItems,
  toddlerVisualItems,
  toddlerTactileItems,
  toddlerVestibularItems,
  toddlerOralItems,
  toddlerGeneralItems,
} from './items';

const proportionalBands: ClassificationBand[] = [
  { label: 'Típico', maxScorePct: 0.4, color: '#2f7a3d' },
  { label: 'Atípico leve', maxScorePct: 0.7, color: '#e08e0b' },
  { label: 'Atípico marcado', maxScorePct: 1.01, color: '#d62828' },
];

export const criancaPequena: Instrument = {
  id: 'crianca-pequena',
  name: '👶 Perfil Sensorial — Criança Pequena (7 a 36 meses)',
  shortName: 'Criança Pequena (7–36m)',
  ageRange: { minMonths: 7, maxMonths: 36 },
  description:
    'Triagem de processamento sensorial para crianças pequenas (7 a 36 meses), organizada em 6 áreas e 48 itens. Cada item representa um dos quatro quadrantes de processamento sensorial (Busca, Evitação, Sensibilidade, Registro).',
  disclaimer:
    'Triagem interna inspirada no modelo de processamento sensorial dos quatro quadrantes (Dunn). Não substitui instrumentos normativos padronizados — o resultado deve ser interpretado como apoio à observação clínica.',
  hasNormalCurve: false,
  defaultBands: proportionalBands,
  sections: [
    { key: 'toddlerAuditory',   title: 'Processamento Auditivo',             items: toddlerAuditoryItems },
    { key: 'toddlerVisual',     title: 'Processamento Visual',               items: toddlerVisualItems },
    { key: 'toddlerTactile',    title: 'Processamento Tátil',                items: toddlerTactileItems },
    { key: 'toddlerVestibular', title: 'Processamento Vestibular / Movimento', items: toddlerVestibularItems },
    { key: 'toddlerOral',       title: 'Processamento Oral',                 items: toddlerOralItems },
    { key: 'toddlerGeneral',    title: 'Comportamento Geral / Regulação',   items: toddlerGeneralItems },
  ],
};
