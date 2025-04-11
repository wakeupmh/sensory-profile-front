import { SensoryItem } from './types';

// Itens de processamento auditivo
export const auditoryProcessingItems: SensoryItem[] = [
  { id: 1, quadrant: 'RA', description: 'responde negativamente a sons altos ou inesperados (por exemplo, chora ou se esconde ao ouvir o barulho do aspirador de pó, latido de cachorro, secador de cabelo).', response: null },
  { id: 2, quadrant: 'RA', description: 'segura as mãos sobre os ouvidos para se proteger de sons.', response: null },
  { id: 3, quadrant: 'RA', description: 'tem dificuldade para concluir tarefas quando o rádio está ligado.', response: null },
  { id: 4, quadrant: 'RA', description: 'fica distraído ou tem dificuldade para funcionar se houver muito barulho.', response: null },
  { id: 5, quadrant: 'RA', description: 'não consegue trabalhar com barulho de fundo (por exemplo, ventilador, refrigerador).', response: null },
  { id: 6, quadrant: 'BS', description: 'parece não ouvir o que você diz (por exemplo, parece não prestar atenção no que você diz, ou ignora você).', response: null },
  { id: 7, quadrant: 'BS', description: 'não responde quando chamam seu nome, mas você sabe que a audição da criança está normal.', response: null },
  { id: 8, quadrant: 'BS', description: 'gosta de barulhos estranhos/procura fazê-los.', response: null }
];

// Itens de processamento visual
export const visualProcessingItems: SensoryItem[] = [
  { id: 9, quadrant: 'RA', description: 'prefere brincar no escuro.', response: null },
  { id: 10, quadrant: 'RA', description: 'expressa desconforto com ou evita luzes brilhantes (por exemplo, esconde-se da luz do sol através da janela do carro).', response: null },
  { id: 11, quadrant: 'RA', description: 'feliz em estar no escuro.', response: null },
  { id: 12, quadrant: 'RA', description: 'fica frustrada quando tenta encontrar objetos em fundos concorrentes (por exemplo, meias na gaveta de meias).', response: null },
  { id: 13, quadrant: 'BS', description: 'olha cuidadosamente ou intensamente para objetos/pessoas (por exemplo, olha fixamente para objetos).', response: null },
  { id: 14, quadrant: 'BS', description: 'tem dificuldade em encontrar objetos em fundos concorrentes (por exemplo, sapato em um quarto bagunçado, item favorito no mercado).', response: null },
  { id: 15, quadrant: 'BS', description: 'fecha os olhos ou baixa a cabeça quando há luzes brilhantes.', response: null },
  { id: 16, quadrant: 'BS', description: 'tem dificuldade em controlar os olhos durante atividades (por exemplo, controlar o movimento dos olhos durante a leitura ou copiando do quadro).', response: null },
  { id: 17, quadrant: 'SS', description: 'gosta de olhar para objetos brilhantes que giram e se movem.', response: null },
  { id: 18, quadrant: 'SS', description: 'gosta de olhar para objetos/itens que se movem rapidamente (por exemplo, fãs em movimento, brinquedos com peças em movimento, tela de TV).', response: null },
  { id: 19, quadrant: 'SS', description: 'gosta de olhar para objetos visuais brilhantes.', response: null }
];

// Itens de processamento tátil
export const tactileProcessingItems: SensoryItem[] = [
  { id: 20, quadrant: 'RA', description: 'fica angustiada quando tem o rosto lavado.', response: null },
  { id: 21, quadrant: 'RA', description: 'fica angustiada quando tem o cabelo, as unhas ou a cara lavados ou cortados.', response: null },
  { id: 22, quadrant: 'RA', description: 'evita certas gostos ou cheiros de comida que são tipicamente parte da dieta de uma criança.', response: null },
  { id: 23, quadrant: 'RA', description: 'come apenas alimentos com certos sabores.', response: null },
  { id: 24, quadrant: 'RA', description: 'limita-se a determinadas texturas de alimentos.', response: null },
  { id: 25, quadrant: 'RA', description: 'evita brincar com equipamentos de parquinho ou superfícies externas (por exemplo, grama, areia).', response: null },
  { id: 26, quadrant: 'RA', description: 'expressa angústia durante o cuidado com a higiene pessoal (por exemplo, corte de unhas, lavagem do rosto).', response: null },
  { id: 27, quadrant: 'RA', description: 'expressa preferência por certas texturas de roupas ou tecidos.', response: null },
  { id: 28, quadrant: 'RA', description: 'fica irritada com as costuras das meias ou com as etiquetas nas roupas.', response: null },
  { id: 29, quadrant: 'RA', description: 'expressa desconforto ao escovar os dentes.', response: null },
  { id: 30, quadrant: 'RA', description: 'é seletiva quanto aos utensílios a usar para comer.', response: null },
  { id: 31, quadrant: 'BS', description: 'não parece notar quando alguém toca seu braço ou costas (por exemplo, não se vira quando tocada levemente).', response: null },
  { id: 32, quadrant: 'BS', description: 'não parece notar quando o rosto ou as mãos estão sujos.', response: null },
  { id: 33, quadrant: 'BS', description: 'deixa roupas torcidas no corpo.', response: null },
  { id: 34, quadrant: 'SS', description: 'toca pessoas e objetos.', response: null },
  { id: 35, quadrant: 'SS', description: 'não mantém distância adequada das outras pessoas.', response: null },
  { id: 36, quadrant: 'SS', description: 'parece não notar quando as mãos ou o rosto estão sujos.', response: null },
  { id: 37, quadrant: 'SS', description: 'fica excitada durante tarefas de higiene.', response: null },
  { id: 38, quadrant: 'SS', description: 'entra em espaços pessoais.', response: null },
  { id: 39, quadrant: 'SS', description: 'toca pessoas e objetos ao ponto de irritar os outros.', response: null },
  { id: 40, quadrant: 'SS', description: 'parece ter necessidade de tocar certas brinquedos, superfícies ou texturas (por exemplo, quer sentir tudo).', response: null },
  { id: 41, quadrant: 'SS', description: 'não parece notar quando as roupas estão torcidas no corpo.', response: null },
  { id: 42, quadrant: 'SS', description: 'toca pessoas e objetos.', response: null }
];

// Itens de processamento de movimento
export const movementProcessingItems: SensoryItem[] = [
  { id: 43, quadrant: 'RA', description: 'fica ansiosa ou angustiada quando os pés saem do chão.', response: null },
  { id: 44, quadrant: 'RA', description: 'não gosta de atividades em que fica de cabeça para baixo (por exemplo, cambalhota, brincadeiras ásperas).', response: null },
  { id: 45, quadrant: 'RA', description: 'evita brinquedos de parquinho ou movimentos (por exemplo, balanços, escorregadores, carrosséis).', response: null },
  { id: 46, quadrant: 'RA', description: 'não gosta de andar de elevador ou escadas rolantes.', response: null },
  { id: 47, quadrant: 'RA', description: 'tem medo de cair ou de altura.', response: null },
  { id: 48, quadrant: 'RA', description: 'não gosta de atividades em que a cabeça está para baixo.', response: null },
  { id: 49, quadrant: 'SS', description: 'procura todo tipo de movimento e isso interfere com as rotinas diárias (por exemplo, não consegue ficar parada).', response: null },
  { id: 50, quadrant: 'SS', description: 'busca atividades de movimento intenso (por exemplo, girar, saltar, escalar).', response: null },
  { id: 51, quadrant: 'SS', description: 'gira/rodopia mais que outras crianças.', response: null },
  { id: 52, quadrant: 'SS', description: 'balança-se intencionalmente.', response: null },
  { id: 53, quadrant: 'SS', description: 'gosta de cavalgar em brinquedos com movimento rápido ou giratório (por exemplo, carrossel).', response: null }
];

// Itens de processamento de posição do corpo
export const bodyPositionProcessingItems: SensoryItem[] = [
  { id: 54, quadrant: 'BS', description: 'parece hesitante em subir ou descer escadas ou rampas.', response: null },
  { id: 55, quadrant: 'BS', description: 'tem medo de subir ou descer escadas.', response: null },
  { id: 56, quadrant: 'BS', description: 'não percebe quando o corpo está em uma posição estranha.', response: null },
  { id: 57, quadrant: 'BS', description: 'hesita em escalar ou descer equipamentos de playground ou bordas de calçada.', response: null },
  { id: 58, quadrant: 'BS', description: 'parece insegura quando é empurrada ou puxada.', response: null },
  { id: 59, quadrant: 'BS', description: 'frequentemente tropeça ou é desajeitada.', response: null },
  { id: 60, quadrant: 'SS', description: 'toma riscos excessivos durante o brincar (por exemplo, sobe alto em árvores, pula de móveis).', response: null },
  { id: 61, quadrant: 'SS', description: 'toma riscos que comprometem a segurança pessoal.', response: null },
  { id: 62, quadrant: 'SS', description: 'não parece ter medo de cair quando está em alturas.', response: null },
  { id: 63, quadrant: 'SS', description: 'pula de um equipamento para outro.', response: null },
  { id: 64, quadrant: 'SS', description: 'parece gostar de cair.', response: null }
];

// Itens de processamento de sensibilidade oral
export const oralSensitivityProcessingItems: SensoryItem[] = [
  { id: 65, quadrant: 'RA', description: 'fica angustiada com experiências de cuidados dentários.', response: null },
  { id: 66, quadrant: 'RA', description: 'tem preferências fortes por certos sabores.', response: null },
  { id: 67, quadrant: 'RA', description: 'tem preferências fortes por certas temperaturas de alimentos.', response: null },
  { id: 68, quadrant: 'RA', description: 'é seletiva quanto aos sabores que gosta.', response: null },
  { id: 69, quadrant: 'RA', description: 'recusa certas gostos que normalmente as crianças gostam.', response: null },
  { id: 70, quadrant: 'RA', description: 'prefere alguns sabores.', response: null },
  { id: 71, quadrant: 'RA', description: 'limita-se a certas texturas de alimentos.', response: null },
  { id: 72, quadrant: 'RA', description: 'é seletiva quanto às texturas de alimentos.', response: null },
  { id: 73, quadrant: 'SS', description: 'lambe objetos não comestíveis.', response: null },
  { id: 74, quadrant: 'SS', description: 'mastiga ou lambe brinquedos, roupas ou outros objetos não comestíveis.', response: null },
  { id: 75, quadrant: 'SS', description: 'morde objetos não comestíveis.', response: null },
  { id: 76, quadrant: 'SS', description: 'coloca objetos na boca (por exemplo, mãos, brinquedos, tubos).', response: null }
];

// Itens de respostas socioemocionais
export const socialEmotionalResponsesItems: SensoryItem[] = [
  { id: 77, quadrant: 'RA', description: 'parece ter medo em espaços abertos.', response: null },
  { id: 78, quadrant: 'RA', description: 'parece não gostar de atividades sociais.', response: null },
  { id: 79, quadrant: 'RA', description: 'precisa de mais proteção da vida do que outras crianças.', response: null },
  { id: 80, quadrant: 'RA', description: 'expressa angústia durante cortes de cabelo, lavagem do rosto ou corte de unhas.', response: null },
  { id: 81, quadrant: 'RA', description: 'tem medo de multidões ou reuniões em grupo.', response: null },
  { id: 82, quadrant: 'BS', description: 'não interpreta as dicas faciais ou linguagem corporal.', response: null },
  { id: 83, quadrant: 'BS', description: 'não olha para as pessoas quando fala com elas.', response: null },
  { id: 84, quadrant: 'BS', description: 'não se dá conta quando alguém entra na sala.', response: null },
  { id: 85, quadrant: 'BS', description: 'parece não notar quando as pessoas estão próximas.', response: null },
  { id: 86, quadrant: 'BS', description: 'parece não se dar conta quando pessoas entram na sala.', response: null }
];

// Itens de respostas de atenção
export const attentionResponsesItems: SensoryItem[] = [
  { id: 87, quadrant: 'RA', description: 'parece não notar quando as pessoas estão próximas.', response: null },
  { id: 88, quadrant: 'RA', description: 'parece não notar quando as pessoas entram na sala.', response: null },
  { id: 89, quadrant: 'BS', description: 'olha para longe das tarefas para notar todos os outros movimentos na sala.', response: null },
  { id: 90, quadrant: 'BS', description: 'parece não ouvir quando é chamado pelo nome.', response: null },
  { id: 91, quadrant: 'BS', description: 'tem dificuldade em prestar atenção.', response: null },
  { id: 92, quadrant: 'BS', description: 'parece ausente.', response: null }
];
