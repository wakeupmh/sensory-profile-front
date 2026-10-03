// Roteiros de sondagem da entrevista M-CHAT-R/F, um por item da triagem.
// Texto próprio (não reproduz a entrevista oficial). Cada roteiro sonda exatamente
// o item de mesma posição em mchat-r/items.ts.
import { MCHAT_REVERSE_ITEMS } from '../mchat-r/scoring';

export interface ProbeEntry {
  screenItemNumber: number; // 1-20
  probeItemId: number;      // 4001-4020 (= 3000 + N + 1000)
  /** true: resposta "sim" do cuidador é sinal de alerta (itens com pontuação invertida). */
  failOnYes: boolean;
  /** Pergunta a fazer ao cuidador. */
  question: string;
  /** Como aprofundar: pedidos de exemplo e situações típicas. */
  guidance: string;
  /** Regra explícita de PASSOU/FALHOU. */
  rule: string;
  /** Roteiro completo (pergunta + orientação + regra) em um único texto. */
  probeScript: string;
}

const build = (
  n: number,
  question: string,
  guidance: string,
  rule: string,
): ProbeEntry => ({
  screenItemNumber: n,
  probeItemId: 4000 + n,
  failOnYes: MCHAT_REVERSE_ITEMS.includes(n),
  question,
  guidance,
  rule,
  probeScript: `${question}\n${guidance}\n${rule}`,
});

export const probes: ProbeEntry[] = [
  build(
    1,
    'Quando você aponta para algo do outro lado do quarto, seu filho(a) olha para o que você apontou?',
    'Peça ao cuidador que descreva a última vez em que isso aconteceu e que demonstre como aponta. Considere apenas olhar para o objeto, e não para a mão ou para o rosto do cuidador.',
    'PASSOU se a criança olha para o objeto apontado na maior parte das vezes. FALHOU se raramente ou nunca olha.',
  ),
  build(
    2,
    'Você já teve dúvida sobre a audição do seu filho(a)? O que fez você pensar nisso?',
    'Pergunte se a criança reage a sons fora do campo de visão (porta batendo, brinquedo que toca, chamado vindo de outro cômodo) e se já foi feito algum exame de audição. Esclareça se a dúvida vem da falta de resposta a sons em geral ou apenas de distração durante brincadeiras.',
    'Item de pontuação invertida. FALHOU se a preocupação com a audição persiste, ou se a criança frequentemente não reage a sons do dia a dia. PASSOU se o cuidador não tem preocupação real e a criança reage a sons de forma consistente.',
  ),
  build(
    3,
    'Seu filho(a) brinca de faz-de-conta? Dê exemplos do que ele(a) costuma fingir.',
    'Peça exemplos concretos dos últimos dois meses: fingir beber de um copo vazio, falar ao telefone de brinquedo, dar comida a boneca ou bicho de pelúcia, empurrar um carrinho fazendo barulho.',
    'PASSOU se o cuidador descreve pelo menos dois tipos diferentes de brincadeira de faz-de-conta. FALHOU se não há exemplos ou apenas um tipo, raramente.',
  ),
  build(
    4,
    'Seu filho(a) gosta de subir em coisas?',
    'Pergunte onde sobe (sofá, cama, escada, brinquedos de parquinho) e se faz isso por conta própria. Subir com muito apoio do adulto não conta.',
    'PASSOU se a criança sobe em móveis ou estruturas com interesse e por iniciativa própria. FALHOU se evita subir ou não demonstra interesse.',
  ),
  build(
    5,
    'Seu filho(a) faz movimentos incomuns com os dedos perto dos olhos? Como são esses movimentos?',
    'Peça ao cuidador que demonstre. Diferencie olhar ou explorar as próprias mãos de forma passageira, comum nessa idade, de mexer os dedos de modo repetido, perto do rosto, por períodos que chamam atenção.',
    'Item de pontuação invertida. FALHOU se o movimento ocorre com frequência ou por períodos prolongados. PASSOU se é raro, breve ou apenas exploração normal das mãos.',
  ),
  build(
    6,
    'Seu filho(a) aponta com o dedo indicador para pedir algo ou para pedir ajuda?',
    'Peça exemplos: apontar para um biscoito, brinquedo ou objeto fora do alcance. Gestos de puxar a mão do adulto, esticar o braço com a mão aberta ou apontar com a mão toda não contam.',
    'PASSOU se a criança aponta com o dedo indicador para pedir coisas de forma regular. FALHOU se nunca ou raramente faz isso.',
  ),
  build(
    7,
    'Seu filho(a) aponta com o dedo indicador para mostrar algo interessante, sem querer ganhar nada?',
    'Foque em apontar para compartilhar interesse: um avião no céu, um cachorro, um caminhão na rua. Se a criança aponta apenas para pedir algo, isso não conta aqui.',
    'PASSOU se aponta para mostrar coisas de forma regular, às vezes olhando para o cuidador. FALHOU se nunca ou raramente faz isso.',
  ),
  build(
    8,
    'Seu filho(a) se interessa por outras crianças? O que ele(a) faz quando há crianças por perto?',
    'Pergunte se observa, se aproxima, sorri, imita ou tenta brincar com crianças que não conhece. Considere interesse por crianças, e não apenas por adultos.',
    'PASSOU se demonstra interesse claro por outras crianças em mais de uma ocasião. FALHOU se as ignora ou reage com pouco ou nenhum interesse.',
  ),
  build(
    9,
    'Seu filho(a) traz ou levanta objetos para mostrar a você, só para você ver?',
    'Diferencie mostrar para compartilhar (flor, pedrinha, brinquedo novo) de entregar o objeto para pedir ajuda ou para que o adulto o abra ou ligue. Peça exemplos recentes.',
    'PASSOU se mostra coisas para compartilhar de forma regular. FALHOU se nunca ou raramente faz isso.',
  ),
  build(
    10,
    'Quando você chama o nome do seu filho(a), ele(a) responde?',
    'Considere um ambiente sem barulho, quando a criança não está absorvida em uma atividade. Resposta vale: olhar para você, falar ou balbuciar, parar o que faz. Pergunte se isso acontece quando a criança está de costas e se chamar mais de uma vez é necessário.',
    'PASSOU se responde ao nome na maioria das vezes. FALHOU se raramente ou nunca responde, mesmo sem distrações.',
  ),
  build(
    11,
    'Quando você sorri para o seu filho(a), ele(a) sorri de volta?',
    'Pergunte se o sorriso de volta acontece em situações do dia a dia, não só quando há cócegas ou brincadeira física. Peça um exemplo recente.',
    'PASSOU se devolve o sorriso na maioria das vezes. FALHOU se raramente ou nunca sorri em resposta.',
  ),
  build(
    12,
    'Seu filho(a) fica muito incomodado(a) com barulhos comuns do dia a dia? Com quais?',
    'Exemplos: aspirador, liquidificador, secador, buzina, música alta. Pergunte se chora, tampa os ouvidos, foge ou fica muito agitado(a), e se a reação é bem mais forte do que a de outras crianças da mesma idade.',
    'Item de pontuação invertida. FALHOU se há reação de desconforto intenso a vários sons comuns, com frequência. PASSOU se a reação é rara, leve ou limitada a sons realmente muito altos.',
  ),
  build(
    13,
    'Seu filho(a) anda sozinho(a)?',
    'Considere andar sem apoio, por vários passos seguidos. Andar segurando em móveis ou na mão do adulto, e engatinhar, não contam. Pergunte desde quando e se anda com segurança.',
    'PASSOU se anda de forma independente. FALHOU se ainda não anda sem apoio.',
  ),
  build(
    14,
    'Seu filho(a) olha nos seus olhos quando você fala com ele(a), brinca ou troca a roupa dele(a)?',
    'Pergunte por quanto tempo e em quais momentos o olhar acontece (mamadeira, troca de fralda, brincadeira face a face). Peça exemplos de situações em que a criança busca o olhar do adulto.',
    'PASSOU se olha nos seus olhos regularmente nessas situações. FALHOU se raramente ou nunca faz contato visual.',
  ),
  build(
    15,
    'Seu filho(a) tenta imitar o que você faz?',
    'Peça exemplos recentes: dar tchau, bater palmas, fazer caretas ou sons, copiar uma tarefa da casa. Vale imitação espontânea, não apenas quando é ensinada.',
    'PASSOU se imita ações ou sons com regularidade. FALHOU se raramente ou nunca imita.',
  ),
  build(
    16,
    'Quando você vira a cabeça para olhar para alguma coisa, seu filho(a) olha na mesma direção para ver o que é?',
    'Pergunte o que acontece quando o cuidador olha para algo (janela, porta, brinquedo no chão) sem apontar nem falar. Considere se a criança procura na mesma direção para onde você olha.',
    'PASSOU se acompanha o seu olhar na maioria das vezes. FALHOU se raramente ou nunca acompanha.',
  ),
  build(
    17,
    'Seu filho(a) tenta fazer você olhar para ele(a)?',
    'Exemplos: dizer "olha!", mostrar o que está fazendo, olhar para você esperando um elogio, repetir uma gracinha para chamar atenção. Pergunte com que frequência isso acontece nas brincadeiras.',
    'PASSOU se procura sua atenção para ser observado(a) de forma regular. FALHOU se raramente ou nunca faz isso.',
  ),
  build(
    18,
    'Seu filho(a) entende quando você pede para ele(a) fazer algo, sem você apontar ou mostrar?',
    'Exemplos: "põe o livro na mesa", "traz o cobertor", "pega o sapato". A criança deve entender só pelas palavras, sem apoio de gestos ou da situação. Peça exemplos recentes.',
    'PASSOU se cumpre pedidos simples só pelas palavras, com regularidade. FALHOU se só entende com gestos, demonstração ou rotina, ou raramente atende.',
  ),
  build(
    19,
    'Quando acontece algo novo ou estranho, seu filho(a) olha para o seu rosto para ver como você reage?',
    'Exemplos: um barulho inesperado, um brinquedo desconhecido, uma pessoa nova, algo que assusta. Pergunte se a criança confere sua expressão antes de decidir como reagir.',
    'PASSOU se olha para o seu rosto nessas situações na maioria das vezes. FALHOU se raramente ou nunca confere a sua reação.',
  ),
  build(
    20,
    'Seu filho(a) gosta de brincadeiras de movimento, como ser balançado(a), jogado(a) para o alto ou pulado(a) no joelho?',
    'Pergunte como a criança reage: se sorri, ri, pede mais ou procura repetir a brincadeira. Considere também outras atividades como balanço e gira-gira.',
    'PASSOU se demonstra prazer e pede mais com frequência. FALHOU se NÃO gosta, mostra pouco interesse ou fica incomodado(a) com essas brincadeiras.',
  ),
];

/** Look up a probe entry by screen item number (1-based). */
export function getProbeByScreenItem(screenItemNumber: number): ProbeEntry | undefined {
  return probes.find((p) => p.screenItemNumber === screenItemNumber);
}
