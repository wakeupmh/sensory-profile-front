export interface ProbeEntry {
  screenItemNumber: number; // 1-20
  probeItemId: number;      // 4001-4020
  probeScript: string;      // scripted follow-up question (PT-BR)
}

export const probes: ProbeEntry[] = [
  {
    screenItemNumber: 1,
    probeItemId: 4001,
    probeScript:
      'Se você apontar para algo do outro lado do quarto, seu filho(a) olha para esse objeto? Peça ao cuidador para demonstrar como aponta. Pergunte se a criança olha para o objeto apontado, mesmo que não olhe para o rosto do cuidador. Se a criança olhar para o objeto em pelo menos uma das tentativas, marque PASSOU.',
  },
  {
    screenItemNumber: 2,
    probeItemId: 4002,
    probeScript:
      'Você já reparou se seu filho(a) olha para as coisas que você está olhando? Pergunte se a criança segue o olhar do cuidador em situações do cotidiano. Se o cuidador não tiver certeza, peça exemplos. Se a criança seguir o olhar pelo menos algumas vezes, marque PASSOU.',
  },
  {
    screenItemNumber: 3,
    probeItemId: 4003,
    probeScript:
      'Seu filho(a) gosta de brincar de "faz-de-conta" (ex: falar ao telefone, cuidar de bonecas, fingir que dirige)? Pergunte exemplos específicos de brincadeiras de faz-de-conta nos últimos dois meses. Se o cuidador relatar pelo menos uma brincadeira imaginativa, marque PASSOU.',
  },
  {
    screenItemNumber: 4,
    probeItemId: 4004,
    probeScript:
      'Seu filho(a) gosta de subir em coisas? (ex: escada, móveis, playground) Pergunte se a criança sobe sozinha em objetos ou estruturas de brincar. Se o cuidador relatar que a criança sobe em pelo menos um tipo de estrutura com frequência, marque PASSOU.',
  },
  {
    screenItemNumber: 5,
    probeItemId: 4005,
    probeScript:
      'Seu filho(a) gosta de fazer movimentos com os dedos perto dos olhos? Pergunte se a criança movimenta os dedos ou as mãos de forma repetitiva perto do rosto ou dos olhos. Se o cuidador não tiver certeza, peça para demonstrar. Se o cuidador confirmar que a criança faz isso com frequência, marque FALHOU.',
  },
  {
    screenItemNumber: 6,
    probeItemId: 4006,
    probeScript:
      'Seu filho(a) aponta com um dedo para pedir algo ou para mostrar algo interessante? Diferencie apontar para PEDIR (protoimperativo) e apontar para MOSTRAR (protodeclarativo). Se a criança apontar com o dedo indicador estendido em pelo menos uma dessas situações, marque PASSOU.',
  },
  {
    screenItemNumber: 7,
    probeItemId: 4007,
    probeScript:
      'Seu filho(a) aponta com um dedo para mostrar algo interessante para você? Foque especificamente no apontar protodeclarativo (compartilhar interesse). Pergunte se a criança aponta para objetos, aviões, cachorros, etc., apenas para mostrar. Se sim, marque PASSOU.',
  },
  {
    screenItemNumber: 8,
    probeItemId: 4008,
    probeScript:
      'Seu filho(a) se interessa por outras crianças? Pergunte se a criança observa, aproxima-se, tenta brincar junto ou reage quando outras crianças estão por perto. Se houver algum interesse demonstrado, mesmo que mínimo, marque PASSOU.',
  },
  {
    screenItemNumber: 9,
    probeItemId: 4009,
    probeScript:
      'Seu filho(a) mostra ou oferece objetos para você, não porque precisa de ajuda, mas para compartilhar? Pergunte se a criança traz brinquedos, flores, pedras ou outros objetos apenas para mostrar, sem pedir nada em troca. Se sim, marque PASSOU.',
  },
  {
    screenItemNumber: 10,
    probeItemId: 4010,
    probeScript:
      'Seu filho(a) olha para o seu rosto para verificar a sua reação quando algo inesperado acontece? (ex: cair um objeto, barulho estranho) Pergunte se a criança busca o olhar do cuidador em situações de incerteza ou surpresa. Se sim, marque PASSOU.',
  },
  {
    screenItemNumber: 11,
    probeItemId: 4011,
    probeScript:
      'Seu filho(a) reage de forma exagerada a sons comuns do ambiente? (ex: secador de cabelo, aspirador, alarme) Pergunte se a criança se assusta, chora, tampa os ouvidos ou reage fortemente a sons que outras crianças toleram. Se o cuidador confirmar reações excessivas frequentes, marque FALHOU.',
  },
  {
    screenItemNumber: 12,
    probeItemId: 4012,
    probeScript:
      'Seu filho(a) consegue andar sozinho(a)? Pergunte se a criança anda de forma independente, sem precisar segurar em móveis ou paredes (não conta engatinhar). Se a criança já anda com autonomia, marque PASSOU.',
  },
  {
    screenItemNumber: 13,
    probeItemId: 4013,
    probeScript:
      'Seu filho(a) olha para o seu rosto quando você chamar o nome dele(a)? Pergunte se a criança vira a cabeça ou olha para o cuidador quando o nome é chamado em um ambiente sem distrações. Se isso acontecer pelo menos algumas vezes, marque PASSOU.',
  },
  {
    screenItemNumber: 14,
    probeItemId: 4014,
    probeScript:
      'Seu filho(a) sorri quando você sorri para ele(a)? Pergunte se a criança devolve o sorriso em resposta ao sorriso do cuidador ou de outras pessoas familiares. Se sim, marque PASSOU.',
  },
  {
    screenItemNumber: 15,
    probeItemId: 4015,
    probeScript:
      'Seu filho(a) imita o que você faz? (ex: imitar caretas, barulhos, gestos simples) Pergunte exemplos recentes de imitação espontânea. Se a criança imitar pelo menos uma ação ou som, marque PASSOU.',
  },
  {
    screenItemNumber: 16,
    probeItemId: 4016,
    probeScript:
      'Seu filho(a) responde quando você fala de algo entediante, como "vamos para o carro" ou "quer leite"? Pergunte se a criança reage a frases comuns do cotidiano, mesmo que não sejam brincadeiras. Se houver alguma resposta (olhar, obedecer, gesticular), marque PASSOU.',
  },
  {
    screenItemNumber: 17,
    probeItemId: 4017,
    probeScript:
      'Se você virar a cabeça para olhar para algo, seu filho(a) vira a cabeça para ver o que você está olhando? Pergunte se a criança segue o olhar do cuidador em situações naturais. Se sim, marque PASSOU.',
  },
  {
    screenItemNumber: 18,
    probeItemId: 4018,
    probeScript:
      'Seu filho(a) entende o que as outras pessoas querem dizer apenas pelo tom de voz? (ex: reconhecer quando alguém está com medo, bravo ou feliz) Pergunte se a criança reage diferentemente a vozes alegres, bravas ou assustadas. Se sim, marque PASSOU.',
  },
  {
    screenItemNumber: 19,
    probeItemId: 4019,
    probeScript:
      'Seu filho(a) já tenta chamar a sua atenção para mostrar alguma coisa que ele(a) está fazendo? (ex: "mãe, olha!", levantar um brinquedo para mostrar) Pergunte se a criança inicia interação apenas para compartilhar atenção. Se sim, marque PASSOU.',
  },
  {
    screenItemNumber: 20,
    probeItemId: 4020,
    probeScript:
      'Seu filho(a) gosta de movimentos repetitivos? (ex: balançar o corpo, girar, bater as mãos repetidamente) Pergunte se a criança realiza movimentos estereotipados com frequência e se isso interfere nas atividades diárias. Se o cuidador confirmar movimentos repetitivos frequentes, marque FALHOU.',
  },
];

/** Look up a probe entry by screen item number (1-based). */
export function getProbeByScreenItem(screenItemNumber: number): ProbeEntry | undefined {
  return probes.find((p) => p.screenItemNumber === screenItemNumber);
}
