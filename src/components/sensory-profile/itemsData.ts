import { SensoryItem } from './types';

// Itens de processamento auditivo
export const auditoryProcessingItems: SensoryItem[] = [
  { id: 1, quadrant: 'EV', description: 'reage intensamente a sons inesperados ou barulhentos (por exemplo, sirenes, cachorro latindo, secador de cabelo).', response: null },
  { id: 2, quadrant: 'EV', description: 'coloca as mãos sobre os ouvidos para protegê-los do som.', response: null },
  { id: 3, quadrant: 'SN', description: 'tem dificuldade em concluir tarefas quando há música tocando ou a TV está ligada.', response: null },
  { id: 4, quadrant: 'SN', description: 'se distrai quando há muito barulho ao redor.', response: null },
  { id: 5, quadrant: 'EV', description: 'torna-se improdutivo(a) com ruídos de fundo (por exemplo, ventilador, geladeira).', response: null },
  { id: 6, quadrant: 'SN', description: 'para de prestar atenção em mim ou parece que me ignora.', response: null },
  { id: 7, quadrant: 'SN', description: 'parece não ouvir quando eu o(a) chamo por seu nome (mesmo com sua audição sendo normal).', response: null },
  { id: 8, quadrant: 'OB', description: 'gosta de barulhos estranhos ou faz barulho(s) para se divertir.', response: null }
];

// Itens de processamento visual
export const visualProcessingItems: SensoryItem[] = [
  { id: 9, quadrant: 'SN', description: 'prefere brincar ou fazer tarefas em condições de pouca luz.', response: null },
  { id: 10, quadrant: 'SN', description: 'prefere vestir-se com roupas de cores brilhantes ou estampadas.', response: null },
  { id: 11, quadrant: 'OB', description: 'se diverte ao olhar para detalhes visuais em objetos.', response: null },
  { id: 12, quadrant: 'OB', description: 'precisa de ajuda para encontrar objetos que são óbvios para outros.', response: null },
  { id: 13, quadrant: 'SN', description: 'se incomoda mais com luzes brilhantes do que outras crianças da mesma idade.', response: null },
  { id: 14, quadrant: 'EX', description: 'observa as pessoas conforme elas se movem ao redor da sala.', response: null },
  { id: 15, quadrant: 'EV', description: 'se incomoda com luzes brilhantes (por exemplo, se esconde da luz solar que reluz através da janela do carro).', response: null }
];

// Itens de processamento do tato
export const tactileProcessingItems: SensoryItem[] = [
  { id: 16, quadrant: 'SN', description: 'mostra desconforto durante momentos de cuidado pessoal (por exemplo, briga ou chora durante o corte de cabelo, lavagem do rosto, corte das unhas das mãos).', response: null },
  { id: 17, quadrant: 'SN', description: 'se irrita com o uso de sapatos ou meias.', response: null },
  { id: 18, quadrant: 'EV', description: 'mostra uma resposta emocional ou agressiva ao ser tocado(a).', response: null },
  { id: 19, quadrant: 'SN', description: 'fica ansioso(a) quando fica de pé em proximidade a outros (por exemplo, em uma fila).', response: null },
  { id: 20, quadrant: 'SN', description: 'esfrega ou coça uma parte do corpo que foi tocada.', response: null },
  { id: 21, quadrant: 'EX', description: 'toca as pessoas ou objetos a ponto de incomodar outros.', response: null },
  { id: 22, quadrant: 'EX', description: 'exibe a necessidade de tocar brinquedos, superfícies ou texturas (por exemplo, quer obter a sensação de tudo ao redor).', response: null },
  { id: 23, quadrant: 'OB', description: 'parece não ter consciência quanto à dor.', response: null },
  { id: 24, quadrant: 'OB', description: 'parece não ter consciência quanto a mudanças de temperatura.', response: null },
  { id: 25, quadrant: 'EX', description: 'toca pessoas e objetos mais do que crianças da mesma idade.', response: null },
  { id: 26, quadrant: 'OB', description: 'parece alheio(a) quanto ao fato de suas mãos ou face estarem sujas.', response: null }
];

// Itens de processamento de movimento
export const movementProcessingItems: SensoryItem[] = [
  { id: 27, quadrant: 'EX', description: 'busca movimentar-se até o ponto que interfere com rotinas diárias (por exemplo, não consegue ficar quieto, demonstra inquietude).', response: null },
  { id: 28, quadrant: 'EX', description: 'faz movimento de balançar na cadeira, no chão ou enquanto está em pé.', response: null },
  { id: 29, quadrant: 'OB', description: 'hesita subir ou descer calçadas ou degraus (por exemplo, é cauteloso, para antes de se movimentar).', response: null },
  { id: 30, quadrant: 'EX', description: 'fica animado(a) durante tarefas que envolvem movimento.', response: null },
  { id: 31, quadrant: 'EX', description: 'se arrisca ao se movimentar ou escalar de modo perigoso.', response: null },
  { id: 32, quadrant: 'EX', description: 'procura oportunidades para cair sem se importar com a própria segurança (por exemplo, cai de propósito).', response: null },
  { id: 33, quadrant: 'OB', description: 'perde o equilíbrio inesperadamente ao caminhar sobre uma superfície irregular.', response: null },
  { id: 34, quadrant: 'OB', description: 'esbarra em coisas, sem conseguir notar objetos ou pessoas no caminho.', response: null }
];

// Itens de processamento de posição do corpo
export const bodyPositionProcessingItems: SensoryItem[] = [
  { id: 35, quadrant: 'OB', description: 'move-se de modo rígido.', response: null },
  { id: 36, quadrant: 'OB', description: 'fica cansado(a) facilmente, principalmente quando está em pé ou mantendo o corpo em uma posição.', response: null },
  { id: 37, quadrant: 'OB', description: 'parece ter músculos fracos.', response: null },
  { id: 38, quadrant: 'OB', description: 'se apoia para se sustentar (por exemplo, segura a cabeça com as mãos, apoia-se em uma parede).', response: null },
  { id: 39, quadrant: 'OB', description: 'se segura a objetos, paredes ou corrimões mais do que as crianças da mesma idade.', response: null },
  { id: 40, quadrant: 'OB', description: 'ao andar, faz barulho, como se os pés fossem pesados.', response: null },
  { id: 41, quadrant: 'EX', description: 'se inclina para se apoiar em móveis ou em outras pessoas.', response: null },
  { id: 42, quadrant: 'EX', description: 'precisa de cobertores pesados para dormir.', response: null }
];

// Itens de processamento de sensibilidade oral
export const oralSensitivityProcessingItems: SensoryItem[] = [
  { id: 43, quadrant: 'SN', description: 'fica com ânsia de vômito facilmente com certas texturas de alimentos ou utensílios alimentares na boca.', response: null },
  { id: 44, quadrant: 'SN', description: 'rejeita certos gostos ou cheiros de comida que são, normalmente, parte de dietas de crianças.', response: null },
  { id: 45, quadrant: 'SN', description: 'se alimenta somente de certos sabores (por exemplo, doce, salgado).', response: null },
  { id: 46, quadrant: 'SN', description: 'limita-se quanto a certas texturas de alimentos.', response: null },
  { id: 47, quadrant: 'SN', description: 'é exigente para comer, principalmente com relação às texturas de alimentos.', response: null },
  { id: 48, quadrant: 'EX', description: 'cheira objetos não comestíveis.', response: null },
  { id: 49, quadrant: 'EX', description: 'mostra uma forte preferência por certos sabores.', response: null },
  { id: 50, quadrant: 'EX', description: 'deseja intensamente certos alimentos, gostos ou cheiros.', response: null },
  { id: 51, quadrant: 'EX', description: 'coloca objetos na boca (por exemplo, lápis, mãos).', response: null },
  { id: 52, quadrant: 'SN', description: 'morde a língua ou lábios mais do que as crianças da mesma idade.', response: null }
];

// Itens de conduta associada ao processamento sensorial
export const conductProcessingItems: SensoryItem[] = [
  { id: 53, quadrant: 'OB', description: 'parece propenso(a) a acidentes.', response: null },
  { id: 54, quadrant: 'OB', description: 'se apressa em atividades de colorir, escrever ou desenhar.', response: null },
  { id: 55, quadrant: 'EX', description: 'se expõe a riscos excessivos (por exemplo, sobe alto em uma árvore, salta de móveis altos) que comprometem sua própria segurança.', response: null },
  { id: 56, quadrant: 'EX', description: 'parece ser mais ativo(a) do que crianças da mesma idade.', response: null },
  { id: 57, quadrant: 'OB', description: 'faz as coisas de uma maneira mais difícil do que necessário (por exemplo, perde tempo, move-se lentamente).', response: null },
  { id: 58, quadrant: 'EV', description: 'pode ser teimoso(a) e não cooperativo(a).', response: null },
  { id: 59, quadrant: 'EV', description: 'faz birra.', response: null },
  { id: 60, quadrant: 'EX', description: 'parece se divertir quando cai.', response: null },
  { id: 61, quadrant: 'EV', description: 'resiste ao contato visual comigo ou com outros.', response: null }
];

// Itens de respostas de atenção associadas ao processamento sensorial
export const attentionResponsesItems: SensoryItem[] = [
  { id: 76, quadrant: 'OB', description: 'não faz contato visual comigo durante interações no dia a dia.', response: null },
  { id: 77, quadrant: 'SN', description: 'tem dificuldade para prestar atenção.', response: null },
  { id: 78, quadrant: 'SN', description: 'se desvia de tarefas para observar todas as ações na sala.', response: null },
  { id: 79, quadrant: 'OB', description: 'parece alheio(a) dentro de um ambiente ativo (por exemplo, não tem consciência quanto à atividade).', response: null },
  { id: 80, quadrant: 'OB', description: 'olha fixamente, de maneira intensa, para objetos.', response: null },
  { id: 81, quadrant: 'EV', description: 'olha fixamente, de maneira intensa, para as pessoas.', response: null },
  { id: 82, quadrant: 'EX', description: 'observa a todos conforme se movem ao redor da sala.', response: null },
  { id: 83, quadrant: 'EX', description: 'muda de uma coisa para outra de modo a interferir com as atividades.', response: null },
  { id: 84, quadrant: 'SN', description: 'se perde facilmente.', response: null },
  { id: 85, quadrant: 'OB', description: 'tem dificuldade para encontrar objetos em espaços cheios de coisas (por exemplo, sapatos em um quarto bagunçado, lápis na “gaveta de bagunças”).', response: null },
  { id: 86, quadrant: 'OB', description: 'parece não se dar conta quando pessoas entram na sala.', response: null }
];

// Itens de respostas socioemocionais associadas ao processamento sensorial
export const socialEmotionalResponsesItems: SensoryItem[] = [
  { id: 62, quadrant: 'OB', description: 'parece ter baixa autoestima (por exemplo, dificuldade de gostar de si mesmo(a)).', response: null },
  { id: 63, quadrant: 'EV', description: 'precisa de apoio positivo para enfrentar situações desafiadoras.', response: null },
  { id: 64, quadrant: 'EV', description: 'é sensível às críticas.', response: null },
  { id: 65, quadrant: 'EV', description: 'possui medos definidos e previsíveis.', response: null },
  { id: 66, quadrant: 'EV', description: 'se expressa sentindo-se como um fracasso.', response: null },
  { id: 67, quadrant: 'EV', description: 'é demasiadamente sério(a).', response: null },
  { id: 68, quadrant: 'EV', description: 'tem fortes explosões emocionais quando não consegue concluir uma tarefa.', response: null },
  { id: 69, quadrant: 'SN', description: 'tem dificuldade de interpretar linguagem corporal ou expressões faciais.', response: null },
  { id: 70, quadrant: 'EV', description: 'fica frustrado(a) facilmente.', response: null },
  { id: 71, quadrant: 'EV', description: 'possui medos que interferem nas rotinas diárias.', response: null },
  { id: 72, quadrant: 'EV', description: 'fica angustiado(a) com mudanças nos planos, rotinas ou expectativas.', response: null },
  { id: 73, quadrant: 'SN', description: 'precisa de mais proteção contra acontecimentos da vida do que crianças da mesma idade (por exemplo, é indefeso(a) física ou emocionalmente).', response: null },
  { id: 74, quadrant: 'EV', description: 'interage ou participa em grupos menos que crianças da mesma idade.', response: null },
  { id: 75, quadrant: 'EV', description: 'tem dificuldade com amizades (por exemplo, fazer ou manter amigos).', response: null }
];
