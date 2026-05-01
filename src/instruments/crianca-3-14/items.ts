import type { InstrumentItem } from '../types';

export const auditoryProcessingItems: InstrumentItem[] = [
  { id: 1, quadrant: 'EV', description: 'reage intensamente a sons inesperados ou barulhentos (por exemplo, sirenes, cachorro latindo, secador de cabelo).' },
  { id: 2, quadrant: 'EV', description: 'coloca as mãos sobre os ouvidos para protegê-los do som.' },
  { id: 3, quadrant: 'SN', description: 'tem dificuldade em concluir tarefas quando há música tocando ou a TV está ligada.' },
  { id: 4, quadrant: 'SN', description: 'se distrai quando há muito barulho ao redor.' },
  { id: 5, quadrant: 'EV', description: 'torna-se improdutivo(a) com ruídos de fundo (por exemplo, ventilador, geladeira).' },
  { id: 6, quadrant: 'SN', description: 'para de prestar atenção em mim ou parece que me ignora.' },
  { id: 7, quadrant: 'SN', description: 'parece não ouvir quando eu o(a) chamo por seu nome (mesmo com sua audição sendo normal).' },
  { id: 8, quadrant: 'OB', description: 'gosta de barulhos estranhos ou faz barulho(s) para se divertir.' },
];

export const visualProcessingItems: InstrumentItem[] = [
  { id: 9, quadrant: 'SN', description: 'prefere brincar ou fazer tarefas em condições de pouca luz.' },
  { id: 10, quadrant: 'SN', description: 'prefere vestir-se com roupas de cores brilhantes ou estampadas.' },
  { id: 11, quadrant: 'OB', description: 'se diverte ao olhar para detalhes visuais em objetos.' },
  { id: 12, quadrant: 'OB', description: 'precisa de ajuda para encontrar objetos que são óbvios para outros.' },
  { id: 13, quadrant: 'SN', description: 'se incomoda mais com luzes brilhantes do que outras crianças da mesma idade.' },
  { id: 14, quadrant: 'EX', description: 'observa as pessoas conforme elas se movem ao redor da sala.' },
];

export const tactileProcessingItems: InstrumentItem[] = [
  { id: 16, quadrant: 'SN', description: 'mostra desconforto durante momentos de cuidado pessoal (por exemplo, briga ou chora durante o corte de cabelo, lavagem do rosto, corte das unhas das mãos).' },
  { id: 17, quadrant: 'SN', description: 'se irrita com o uso de sapatos ou meias.' },
  { id: 18, quadrant: 'EV', description: 'mostra uma resposta emocional ou agressiva ao ser tocado(a).' },
  { id: 19, quadrant: 'SN', description: 'fica ansioso(a) quando fica de pé em proximidade a outros (por exemplo, em uma fila).' },
  { id: 20, quadrant: 'SN', description: 'esfrega ou coça uma parte do corpo que foi tocada.' },
  { id: 21, quadrant: 'EX', description: 'toca as pessoas ou objetos a ponto de incomodar outros.' },
  { id: 22, quadrant: 'EX', description: 'exibe a necessidade de tocar brinquedos, superfícies ou texturas (por exemplo, quer obter a sensação de tudo ao redor).' },
  { id: 23, quadrant: 'OB', description: 'parece não ter consciência quanto à dor.' },
  { id: 24, quadrant: 'OB', description: 'parece não ter consciência quanto a mudanças de temperatura.' },
  { id: 25, quadrant: 'EX', description: 'toca pessoas e objetos mais do que crianças da mesma idade.' },
  { id: 26, quadrant: 'OB', description: 'parece alheio(a) quanto ao fato de suas mãos ou face estarem sujas.' },
];

export const movementProcessingItems: InstrumentItem[] = [
  { id: 27, quadrant: 'EX', description: 'busca movimentar-se até o ponto que interfere com rotinas diárias (por exemplo, não consegue ficar quieto, demonstra inquietude).' },
  { id: 28, quadrant: 'EX', description: 'faz movimento de balançar na cadeira, no chão ou enquanto está em pé.' },
  { id: 29, quadrant: 'OB', description: 'hesita subir ou descer calçadas ou degraus (por exemplo, é cauteloso, para antes de se movimentar).' },
  { id: 30, quadrant: 'EX', description: 'fica animado(a) durante tarefas que envolvem movimento.' },
  { id: 31, quadrant: 'EX', description: 'se arrisca ao se movimentar ou escalar de modo perigoso.' },
  { id: 32, quadrant: 'EX', description: 'procura oportunidades para cair sem se importar com a própria segurança (por exemplo, cai de propósito).' },
  { id: 33, quadrant: 'OB', description: 'perde o equilíbrio inesperadamente ao caminhar sobre uma superfície irregular.' },
  { id: 34, quadrant: 'OB', description: 'esbarra em coisas, sem conseguir notar objetos ou pessoas no caminho.' },
];

export const bodyPositionProcessingItems: InstrumentItem[] = [
  { id: 35, quadrant: 'OB', description: 'move-se de modo rígido.' },
  { id: 36, quadrant: 'OB', description: 'fica cansado(a) facilmente, principalmente quando está em pé ou mantendo o corpo em uma posição.' },
  { id: 37, quadrant: 'OB', description: 'parece ter músculos fracos.' },
  { id: 38, quadrant: 'OB', description: 'se apoia para se sustentar (por exemplo, segura a cabeça com as mãos, apoia-se em uma parede).' },
  { id: 39, quadrant: 'OB', description: 'se segura a objetos, paredes ou corrimões mais do que as crianças da mesma idade.' },
  { id: 40, quadrant: 'OB', description: 'ao andar, faz barulho, como se os pés fossem pesados.' },
  { id: 41, quadrant: 'EX', description: 'se inclina para se apoiar em móveis ou em outras pessoas.' },
  { id: 42, quadrant: 'EX', description: 'precisa de cobertores pesados para dormir.' },
];

export const oralSensitivityProcessingItems: InstrumentItem[] = [
  { id: 43, quadrant: 'SN', description: 'fica com ânsia de vômito facilmente com certas texturas de alimentos ou utensílios alimentares na boca.' },
  { id: 44, quadrant: 'SN', description: 'rejeita certos gostos ou cheiros de comida que são, normalmente, parte de dietas de crianças.' },
  { id: 45, quadrant: 'SN', description: 'se alimenta somente de certos sabores (por exemplo, doce, salgado).' },
  { id: 46, quadrant: 'SN', description: 'limita-se quanto a certas texturas de alimentos.' },
  { id: 47, quadrant: 'SN', description: 'é exigente para comer, principalmente com relação às texturas de alimentos.' },
  { id: 48, quadrant: 'EX', description: 'cheira objetos não comestíveis.' },
  { id: 49, quadrant: 'EX', description: 'mostra uma forte preferência por certos sabores.' },
  { id: 50, quadrant: 'EX', description: 'deseja intensamente certos alimentos, gostos ou cheiros.' },
  { id: 51, quadrant: 'EX', description: 'coloca objetos na boca (por exemplo, lápis, mãos).' },
  { id: 52, quadrant: 'SN', description: 'morde a língua ou lábios mais do que as crianças da mesma idade.' },
];

export const behavioralResponsesItems: InstrumentItem[] = [
  { id: 53, quadrant: 'OB', description: 'parece propenso(a) a acidentes.' },
  { id: 54, quadrant: 'OB', description: 'se apressa em atividades de colorir, escrever ou desenhar.' },
  { id: 55, quadrant: 'EX', description: 'se expõe a riscos excessivos (por exemplo, sobe alto em uma árvore, salta de móveis altos) que comprometem sua própria segurança.' },
  { id: 56, quadrant: 'EX', description: 'parece ser mais ativo(a) do que crianças da mesma idade.' },
  { id: 57, quadrant: 'OB', description: 'faz as coisas de uma maneira mais difícil do que necessário (por exemplo, perde tempo, move-se lentamente).' },
  { id: 58, quadrant: 'EV', description: 'pode ser teimoso(a) e não cooperativo(a).' },
  { id: 59, quadrant: 'EV', description: 'faz birra.' },
  { id: 60, quadrant: 'EX', description: 'parece se divertir quando cai.' },
  { id: 61, quadrant: 'EV', description: 'resiste ao contato visual comigo ou com outros.' },
];

export const socialEmotionalResponsesItems: InstrumentItem[] = [
  { id: 62, quadrant: 'OB', description: 'parece ter baixa autoestima (por exemplo, dificuldade de gostar de si mesmo(a)).' },
  { id: 63, quadrant: 'EV', description: 'precisa de apoio positivo para enfrentar situações desafiadoras.' },
  { id: 64, quadrant: 'EV', description: 'é sensível às críticas.' },
  { id: 65, quadrant: 'EV', description: 'possui medos definidos e previsíveis.' },
  { id: 66, quadrant: 'EV', description: 'se expressa sentindo-se como um fracasso.' },
  { id: 67, quadrant: 'EV', description: 'é demasiadamente sério(a).' },
  { id: 68, quadrant: 'EV', description: 'tem fortes explosões emocionais quando não consegue concluir uma tarefa.' },
  { id: 69, quadrant: 'SN', description: 'tem dificuldade de interpretar linguagem corporal ou expressões faciais.' },
  { id: 70, quadrant: 'EV', description: 'fica frustrado(a) facilmente.' },
  { id: 71, quadrant: 'EV', description: 'possui medos que interferem nas rotinas diárias.' },
  { id: 72, quadrant: 'EV', description: 'fica angustiado(a) com mudanças nos planos, rotinas ou expectativas.' },
  { id: 73, quadrant: 'SN', description: 'precisa de mais proteção contra acontecimentos da vida do que crianças da mesma idade (por exemplo, é indefeso(a) física ou emocionalmente).' },
  { id: 74, quadrant: 'EV', description: 'interage ou participa em grupos menos que crianças da mesma idade.' },
  { id: 75, quadrant: 'EV', description: 'tem dificuldade com amizades (por exemplo, fazer ou manter amigos).' },
];

export const attentionResponsesItems: InstrumentItem[] = [
  { id: 76, quadrant: 'OB', description: 'não faz contato visual comigo durante interações no dia a dia.' },
  { id: 77, quadrant: 'SN', description: 'tem dificuldade para prestar atenção.' },
  { id: 78, quadrant: 'SN', description: 'se desvia de tarefas para observar todas as ações na sala.' },
  { id: 79, quadrant: 'OB', description: 'parece alheio(a) dentro de um ambiente ativo (por exemplo, não tem consciência quanto à atividade).' },
  { id: 80, quadrant: 'OB', description: 'olha fixamente, de maneira intensa, para objetos.' },
  { id: 81, quadrant: 'EV', description: 'olha fixamente, de maneira intensa, para as pessoas.' },
  { id: 82, quadrant: 'EX', description: 'observa a todos conforme se movem ao redor da sala.' },
  { id: 83, quadrant: 'EX', description: 'muda de uma coisa para outra de modo a interferir com as atividades.' },
  { id: 84, quadrant: 'SN', description: 'se perde facilmente.' },
  { id: 85, quadrant: 'OB', description: 'tem dificuldade para encontrar objetos em espaços cheios de coisas (por exemplo, sapatos em um quarto bagunçado, lápis na "gaveta de bagunças").' },
];
