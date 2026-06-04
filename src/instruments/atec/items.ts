import type { InstrumentItem } from '../types';

// Subscale 1: Speech/Language/Communication — 14 items (0-3 scale)
// 0 = Não é um problema; 1 = Problema leve; 2 = Problema moderado; 3 = Problema sério
export const speechItems: InstrumentItem[] = [
  { id: 2001, quadrant: 'EV', description: 'Sabe o próprio nome (responde quando chamado pelo nome)' },
  { id: 2002, quadrant: 'EV', description: 'Responde aos comandos "não" ou "pare"' },
  { id: 2003, quadrant: 'EV', description: 'Consegue seguir comandos simples (ex: "venha aqui", "pegue o sapato")' },
  { id: 2004, quadrant: 'EV', description: 'Consegue seguir comandos complexos (ex: "pegue a toalha e coloque na pia")' },
  { id: 2005, quadrant: 'EV', description: 'Expressa desejos e necessidades de forma verbal apropriada' },
  { id: 2006, quadrant: 'EV', description: 'Repete palavras ou frases incessantemente (ecolalia imediata ou tardia)' },
  { id: 2007, quadrant: 'EV', description: 'Diz palavras ou frases inapropriadas ou fora de contexto' },
  { id: 2008, quadrant: 'EV', description: 'Apresenta fala conversacional dentro da normalidade para a idade' },
  { id: 2009, quadrant: 'EV', description: 'Envolve-se em conversas significativas com outras pessoas' },
  { id: 2010, quadrant: 'EV', description: 'Inicia conversas espontaneamente' },
  { id: 2011, quadrant: 'EV', description: 'Usa pronomes de forma apropriada (eu, meu, ele, dela, etc.)' },
  { id: 2012, quadrant: 'EV', description: 'Fala sozinho(a) ou murmura para si mesmo(a) com frequência' },
  { id: 2013, quadrant: 'EV', description: 'Apresenta ecolalia (repete o que ouve de forma imediata ou tardia)' },
  { id: 2014, quadrant: 'EV', description: 'Comunica-se por meios não verbais (gestos, apontar, expressões faciais) quando necessário' },
];

// Subscale 2: Sociability — 20 items (0-2 scale)
// 0 = Não é um problema; 1 = Problema leve/moderado; 2 = Problema sério
export const sociabilityItems: InstrumentItem[] = [
  { id: 2015, quadrant: 'EV', description: 'Presta atenção quando chamado ou quando alguém fala com ele(a)' },
  { id: 2016, quadrant: 'EV', description: 'Olha para as pessoas no rosto durante a conversa ou interação' },
  { id: 2017, quadrant: 'EV', description: 'Demonstra interesse por outras crianças (observa, aproxima-se, tenta brincar)' },
  { id: 2018, quadrant: 'EV', description: 'Está atento(a) ao ambiente e ao que acontece ao redor' },
  { id: 2019, quadrant: 'EV', description: 'Ignora ou "se fecha" para as pessoas ao redor (tune out)' },
  { id: 2020, quadrant: 'EV', description: 'Brinca com outras crianças de forma interativa' },
  { id: 2021, quadrant: 'EV', description: 'Compartilha brinquedos, objetos ou atividades com outras crianças' },
  { id: 2022, quadrant: 'EV', description: 'Demonstra afeto (abraços, carinho, beijos) de forma apropriada' },
  { id: 2023, quadrant: 'EV', description: 'Sorri de forma apropriada e em resposta a situações sociais' },
  { id: 2024, quadrant: 'EV', description: 'Compreende expressões faciais e emoções de outras pessoas' },
  { id: 2025, quadrant: 'EV', description: 'Demonstra imaginação durante as brincadeiras (faz de conta, cria histórias)' },
  { id: 2026, quadrant: 'EV', description: 'Participa de brincadeiras interativas e jogos com regras' },
  { id: 2027, quadrant: 'EV', description: 'Está ciente de perigos no ambiente (fogo, rua, objetos cortantes)' },
  { id: 2028, quadrant: 'EV', description: 'Demonstra medo ou cautela de forma apropriada em situações de risco' },
  { id: 2029, quadrant: 'EV', description: 'Fica olhando fixamente para o vazio ou para um ponto distante por longos períodos' },
  { id: 2030, quadrant: 'EV', description: 'Gosta de ser pegado(a) no colo ou de contato físico próximo' },
  { id: 2031, quadrant: 'EV', description: 'É impaciente quando tem que esperar por algo que deseja' },
  { id: 2032, quadrant: 'EV', description: 'É tímido(a) ou reservado(a) em situações sociais novas' },
  { id: 2033, quadrant: 'EV', description: 'Tolera erros ou frustrações sem reações extremas' },
  { id: 2034, quadrant: 'EV', description: 'É amigável e receptivo(a) com pessoas novas' },
];

// Subscale 3: Sensory/Cognitive Awareness — 18 items (0-2 scale)
// 0 = Não é um problema; 1 = Problema leve/moderado; 2 = Problema sério
export const sensoryCognitiveItems: InstrumentItem[] = [
  { id: 2035, quadrant: 'EV', description: 'Responde a estímulos verbais e sons do ambiente' },
  { id: 2036, quadrant: 'EV', description: 'É sensível a ruídos (tampa os ouvidos, se irrita com sons comuns)' },
  { id: 2037, quadrant: 'EV', description: 'É sensível ao toque (evita certas texturas, roupas, abraços)' },
  { id: 2038, quadrant: 'EV', description: 'É sensível a sabores, cheiros ou temperaturas extremas' },
  { id: 2039, quadrant: 'EV', description: 'Olha atentamente para objetos e examina detalhes' },
  { id: 2040, quadrant: 'EV', description: 'Olha para as pessoas no rosto durante interações' },
  { id: 2041, quadrant: 'EV', description: 'Mantém contato visual adequado durante a conversa' },
  { id: 2042, quadrant: 'EV', description: 'Consegue identificar cores básicas de forma consistente' },
  { id: 2043, quadrant: 'EV', description: 'Consegue identificar formas geométricas simples' },
  { id: 2044, quadrant: 'EV', description: 'Consegue identificar números ou quantidades simples' },
  { id: 2045, quadrant: 'EV', description: 'Consegue identificar letras do alfabeto' },
  { id: 2046, quadrant: 'EV', description: 'Tem bom senso de direção e orientação espacial' },
  { id: 2047, quadrant: 'EV', description: 'Consegue escrever letras, números ou traçar formas' },
  { id: 2048, quadrant: 'EV', description: 'Consegue ler palavras simples ou reconhecer palavras vistas com frequência' },
  { id: 2049, quadrant: 'EV', description: 'Consegue soletrar palavras simples de forma correta' },
  { id: 2050, quadrant: 'EV', description: 'Sabe usar caneta, lápis ou giz de forma apropriada' },
  { id: 2051, quadrant: 'EV', description: 'Consegue vestir-se sozinho(a) (roupas simples, botões, zíperes)' },
  { id: 2052, quadrant: 'EV', description: 'Sabe usar o banheiro de forma independente (quando apropriado à idade)' },
];

// Subscale 4: Health/Physical/Behavior — 25 items (0-3 scale)
// 0 = Não é um problema; 1 = Problema leve; 2 = Problema moderado; 3 = Problema sério
export const healthBehaviorItems: InstrumentItem[] = [
  { id: 2053, quadrant: 'EV', description: 'Apresenta crises convulsivas ou episódios de perda de consciência' },
  { id: 2054, quadrant: 'EV', description: 'Tem problemas alimentares (seletividade extrema, recusa alimentar, engasgos frequentes)' },
  { id: 2055, quadrant: 'EV', description: 'Apresenta constipação intestinal (intestino preso com frequência)' },
  { id: 2056, quadrant: 'EV', description: 'Apresenta diarreia frequente ou alterações no hábito intestinal' },
  { id: 2057, quadrant: 'EV', description: 'Tem dificuldades para dormir (acorda frequentemente, insônia, resistência para deitar)' },
  { id: 2058, quadrant: 'EV', description: 'Faz xixi na cama (enurese noturna fora da faixa etária esperada)' },
  { id: 2059, quadrant: 'EV', description: 'É hiperativo(a) (agitação constante, dificuldade de ficar parado)' },
  { id: 2060, quadrant: 'EV', description: 'É hipoativo(a) (letargia, falta de energia, pouca iniciativa motora)' },
  { id: 2061, quadrant: 'EV', description: 'Apresenta birras intensas, crises de choro ou explosões de humor frequentes' },
  { id: 2062, quadrant: 'EV', description: 'É agressivo(a) (bate, morde, empurra, arremessa objetos contra pessoas)' },
  { id: 2063, quadrant: 'EV', description: 'Causa ferimentos a si mesmo(a) (bate a cabeça, arranha, morde o próprio braço)' },
  { id: 2064, quadrant: 'EV', description: 'Grita alto de forma repetitiva e sem motivo aparente' },
  { id: 2065, quadrant: 'EV', description: 'Exige rotina rígida e reage mal a pequenas mudanças no ambiente ou na agenda' },
  { id: 2066, quadrant: 'EV', description: 'Gira objetos ou parte de objetos repetidamente (rodas, tampas, cordas)' },
  { id: 2067, quadrant: 'EV', description: 'Fica balançando o corpo para frente e para trás repetidamente (rocking)' },
  { id: 2068, quadrant: 'EV', description: 'Bate palmas ou balança as mãos de forma repetitiva e estereotipada' },
  { id: 2069, quadrant: 'EV', description: 'Anda na ponta dos pés com frequência' },
  { id: 2070, quadrant: 'EV', description: 'Morde a si mesmo(a) ou a outras pessoas' },
  { id: 2071, quadrant: 'EV', description: 'Bate em si mesmo(a) (tapa no rosto, soco na coxa, bater a cabeça)' },
  { id: 2072, quadrant: 'EV', description: 'Ignora dor ou lesões aparentemente dolorosas' },
  { id: 2073, quadrant: 'EV', description: 'É extremamente energético(a) ou inquieto(a) de forma anormal' },
  { id: 2074, quadrant: 'EV', description: 'É extremamente letárgico(a) ou sonolento(a) de forma anormal' },
  { id: 2075, quadrant: 'EV', description: 'Ingerir objetos não comestíveis (pica: papel, terra, pedras, tinta, etc.)' },
  { id: 2076, quadrant: 'EV', description: 'Apresenta comportamentos compulsivos (organizar, alinhar, contar, repetir ritualisticamente)' },
  { id: 2077, quadrant: 'EV', description: 'É obcecado(a) por objetos específicos, temas ou rotinas de forma exagerada' },
];

export const items = [
  ...speechItems,
  ...sociabilityItems,
  ...sensoryCognitiveItems,
  ...healthBehaviorItems,
];
