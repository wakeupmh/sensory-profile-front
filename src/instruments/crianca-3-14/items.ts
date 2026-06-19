/**
 * Itens originais escritos para a triagem "Criança (3 a 14 anos)".
 * Organizados conforme o framework público dos quatro quadrantes de
 * processamento sensorial de Winnie Dunn (Busca/EX, Evitação/EV,
 * Sensibilidade/SN, Registro/OB). Não reproduzem itens de instrumentos
 * proprietários — descrevem comportamentos genéricos observáveis nessa
 * faixa etária. IDs preservados do código anterior para manter
 * compatibilidade com avaliações já salvas no backend (mesmas seções).
 */
import type { InstrumentItem } from '../types';

export const auditoryProcessingItems: InstrumentItem[] = [
  { id: 1, quadrant: 'EV', description: 'demonstra desconforto e procura sair de ambientes como refeitórios, festas ou shoppings.' },
  { id: 2, quadrant: 'EV', description: 'reclama de barulhos cotidianos que outras crianças parecem ignorar (ar-condicionado, vizinhos, geladeira).' },
  { id: 3, quadrant: 'SN', description: 'tem dificuldade de concentração quando há conversas paralelas, mesmo em volume baixo.' },
  { id: 4, quadrant: 'SN', description: 'leva tempo para se acalmar depois de um susto sonoro.' },
  { id: 5, quadrant: 'EX', description: 'aumenta o volume da TV, do tablet ou da música além do necessário para ouvir bem.' },
  { id: 6, quadrant: 'EX', description: 'produz sons com a boca ou bate em objetos para se entreter, mesmo durante outras atividades.' },
  { id: 7, quadrant: 'OB', description: 'não responde à fala dirigida a ele(a) em situações cotidianas, sem que esteja claramente distraído(a).' },
  { id: 8, quadrant: 'OB', description: 'demora a perceber sinais sonoros do ambiente que costumam chamar atenção (alguém chamando de outro cômodo, campainha).' },
];

export const visualProcessingItems: InstrumentItem[] = [
  { id: 9, quadrant: 'EV', description: 'evita ambientes muito iluminados ou ensolarados, procurando sombra ou cantos menos claros.' },
  { id: 10, quadrant: 'SN', description: 'reclama de luzes fluorescentes em sala de aula ou de iluminação piscante.' },
  { id: 11, quadrant: 'SN', description: 'demonstra incômodo com cores muito contrastantes ou padrões visuais carregados.' },
  { id: 12, quadrant: 'EX', description: 'aproxima muito o rosto de objetos para observar detalhes mínimos.' },
  { id: 13, quadrant: 'OB', description: 'não localiza imediatamente um item específico em livros ilustrados ou cenas com vários elementos.' },
  { id: 14, quadrant: 'OB', description: 'não percebe alterações no ambiente que outras pessoas notam rapidamente (móvel mudado de lugar, roupa nova de alguém próximo).' },
];

export const tactileProcessingItems: InstrumentItem[] = [
  { id: 16, quadrant: 'EV', description: 'resiste a momentos de cuidado pessoal (banho, corte de cabelo, escovação) ao ponto de gerar conflito.' },
  { id: 17, quadrant: 'EV', description: 'recusa contato físico próximo em atividades de grupo (fila, dança de roda).' },
  { id: 18, quadrant: 'EV', description: 'reage com irritação ou fuga ao ser tocado(a) de surpresa ou por trás.' },
  { id: 19, quadrant: 'SN', description: 'pede para trocar de roupa por incômodo com tecidos, etiquetas ou costuras.' },
  { id: 20, quadrant: 'SN', description: 'demonstra desconforto com roupas molhadas, suadas ou apertadas.' },
  { id: 21, quadrant: 'EX', description: 'toca constantemente em superfícies, tecidos ou cabelos durante atividades do dia.' },
  { id: 22, quadrant: 'EX', description: 'procura abraços longos e apertados com adultos próximos.' },
  { id: 23, quadrant: 'EX', description: 'brinca com prazer em massinha, slime, areia ou tinta e tende a continuar mesmo sujo(a).' },
  { id: 24, quadrant: 'OB', description: 'permanece com mãos, rosto ou roupas sujas sem demonstrar que percebeu.' },
  { id: 25, quadrant: 'OB', description: 'não reage proporcionalmente a quedas ou batidas que costumam causar choro em outras crianças.' },
  { id: 26, quadrant: 'OB', description: 'demora a perceber se o ambiente está mais frio ou mais quente do que o confortável para ele(a).' },
];

export const movementProcessingItems: InstrumentItem[] = [
  { id: 27, quadrant: 'EV', description: 'demonstra medo de brinquedos que envolvem girar ou ficar de cabeça para baixo.' },
  { id: 28, quadrant: 'EV', description: 'evita atividades com mudanças bruscas de direção (correr em ziguezague, brincadeiras de pegar rápidas).' },
  { id: 29, quadrant: 'SN', description: 'fica enjoado(a) ou pálido(a) em carros, ônibus ou após brincadeiras com muito movimento.' },
  { id: 30, quadrant: 'EX', description: 'procura constantemente correr, pular do sofá, escalar móveis e dar cambalhotas.' },
  { id: 31, quadrant: 'EX', description: 'balança o tronco, bate os pés ou pula no lugar quando precisa ficar sentado(a) por muito tempo.' },
  { id: 32, quadrant: 'OB', description: 'demora a ajustar o corpo quando perde o equilíbrio, caindo com mais facilidade que outras crianças.' },
  { id: 33, quadrant: 'OB', description: 'hesita antes de subir escadas, calçadas ou rampas, mesmo as familiares.' },
  { id: 34, quadrant: 'OB', description: 'esbarra em pessoas e móveis ao caminhar por espaços já conhecidos.' },
];

export const bodyPositionProcessingItems: InstrumentItem[] = [
  { id: 35, quadrant: 'OB', description: 'apresenta postura "molenga" ao sentar para realizar atividades de mesa.' },
  { id: 36, quadrant: 'OB', description: 'demonstra cansaço físico em tarefas que outras crianças realizam sem queixa (carregar mochila, segurar livro aberto).' },
  { id: 37, quadrant: 'OB', description: 'apoia o corpo em paredes, móveis ou no chão durante atividades em pé.' },
  { id: 38, quadrant: 'OB', description: 'aplica força desproporcional ao manusear lápis ou talheres (aperta demais ou deixa cair).' },
  { id: 39, quadrant: 'OB', description: 'tem caligrafia variável ao longo da página conforme se cansa.' },
  { id: 40, quadrant: 'EX', description: 'procura abraços apertados ou brincadeiras de "esmagar" almofadas.' },
  { id: 41, quadrant: 'EX', description: 'dorme melhor com cobertor pesado ou enrolando-se firmemente em lençóis.' },
  { id: 42, quadrant: 'SN', description: 'demonstra desconforto em posições que exigem manter o corpo parado por muito tempo (jantar à mesa, aula).' },
];

export const oralSensitivityProcessingItems: InstrumentItem[] = [
  { id: 43, quadrant: 'SN', description: 'recusa alimentos pela textura, mesmo quando aceita o sabor isolado.' },
  { id: 44, quadrant: 'SN', description: 'tem ânsia de vômito com facilidade ao experimentar alimentos novos ou ao escovar os dentes.' },
  { id: 45, quadrant: 'SN', description: 'demonstra forte rejeição a misturas (caldos com pedaços, arroz com legumes integrados).' },
  { id: 46, quadrant: 'SN', description: 'reclama de cheiros de comida em ambientes como cozinha ou restaurante.' },
  { id: 47, quadrant: 'EX', description: 'procura alimentos com sabores muito marcados (azedos, picantes, ácidos, muito doces).' },
  { id: 48, quadrant: 'EX', description: 'mantém objetos não alimentares na boca com frequência (lápis, manga da blusa, dedos) além do esperado para a idade.' },
  { id: 49, quadrant: 'EX', description: 'cheira alimentos ou objetos antes de tocá-los ou consumi-los.' },
  { id: 50, quadrant: 'EX', description: 'demonstra forte preferência por um pequeno grupo de sabores e resiste a sair desse repertório.' },
  { id: 51, quadrant: 'OB', description: 'mantém comida nas bochechas por longos períodos sem mastigar ou engolir.' },
  { id: 52, quadrant: 'OB', description: 'não percebe restos de comida ao redor da boca após as refeições, mesmo quando apontados.' },
];

export const behavioralResponsesItems: InstrumentItem[] = [
  { id: 53, quadrant: 'EX', description: 'apresenta nível de atividade física consistentemente maior do que crianças da mesma idade ao longo do dia.' },
  { id: 54, quadrant: 'EX', description: 'engaja-se em comportamentos de risco físico (escalar, pular de altura) com baixa percepção de perigo.' },
  { id: 55, quadrant: 'EX', description: 'acelera tarefas finas (escrever, recortar, montar) sacrificando a precisão.' },
  { id: 56, quadrant: 'OB', description: 'realiza atividades rotineiras com lentidão acentuada, mesmo conhecendo bem o que precisa fazer.' },
  { id: 57, quadrant: 'OB', description: 'sofre quedas e batidas com mais frequência que outras crianças em situações cotidianas.' },
  { id: 58, quadrant: 'OB', description: 'demora a iniciar uma tarefa solicitada, mesmo demonstrando entender o pedido.' },
  { id: 59, quadrant: 'EV', description: 'resiste ativamente a pedidos cotidianos (escovar os dentes, vestir-se) com choro ou negociação prolongada.' },
  { id: 60, quadrant: 'EV', description: 'evita contato visual ao ser corrigido(a) ou orientado(a) por um adulto.' },
  { id: 61, quadrant: 'EV', description: 'apresenta explosões de raiva ou desorganização emocional diante de pequenas frustrações.' },
];

export const socialEmotionalResponsesItems: InstrumentItem[] = [
  { id: 62, quadrant: 'OB', description: 'verbaliza dúvidas sobre a própria capacidade ("não sei", "vou errar") antes mesmo de tentar.' },
  { id: 63, quadrant: 'EV', description: 'precisa de incentivo verbal constante para enfrentar tarefas que considera difíceis.' },
  { id: 64, quadrant: 'EV', description: 'reage com tristeza prolongada a observações ou correções, mesmo construtivas.' },
  { id: 65, quadrant: 'EV', description: 'apresenta medos persistentes (escuro, animais, ficar sozinho) que limitam atividades cotidianas.' },
  { id: 66, quadrant: 'OB', description: 'tem dificuldade de nomear o que está sentindo quando perguntado(a) sobre suas emoções.' },
  { id: 67, quadrant: 'EV', description: 'manifesta postura emocional mais séria do que a maioria das crianças da mesma idade.' },
  { id: 68, quadrant: 'EV', description: 'demonstra frustração intensa ao não conseguir realizar algo de primeira tentativa.' },
  { id: 69, quadrant: 'SN', description: 'tem dificuldade de ler expressões faciais ou tom de voz das pessoas próximas.' },
  { id: 70, quadrant: 'EV', description: 'frustra-se com pequenos obstáculos (um brinquedo que não encaixa, esperar a vez).' },
  { id: 71, quadrant: 'EV', description: 'manifesta angústia ao ser deixado(a) em ambientes habituais (escola, casa de avós).' },
  { id: 72, quadrant: 'EV', description: 'reage com raiva ou choro quando os planos do dia mudam de última hora.' },
  { id: 73, quadrant: 'SN', description: 'demonstra precisar de mais proteção emocional do adulto do que outras crianças da mesma idade.' },
  { id: 74, quadrant: 'EV', description: 'mantém-se afastado(a) de grupos de crianças, preferindo brincar sozinho(a) ou apenas observar.' },
  { id: 75, quadrant: 'EV', description: 'tem dificuldade de iniciar ou manter amizades duradouras.' },
];

export const attentionResponsesItems: InstrumentItem[] = [
  { id: 76, quadrant: 'OB', description: 'demonstra pouco contato visual em conversas do dia a dia, sem distração externa aparente.' },
  { id: 77, quadrant: 'SN', description: 'tem dificuldade de manter a atenção em uma tarefa por períodos compatíveis com a idade.' },
  { id: 78, quadrant: 'SN', description: 'interrompe atividades para observar tudo que acontece ao redor.' },
  { id: 79, quadrant: 'OB', description: 'parece distante ou "no mundo da lua" em ambientes movimentados.' },
  { id: 80, quadrant: 'OB', description: 'fica olhando fixamente para um objeto por longos períodos.' },
  { id: 81, quadrant: 'EV', description: 'observa pessoas de forma fixa e prolongada, mesmo após chamadas de atenção.' },
  { id: 82, quadrant: 'EX', description: 'acompanha visualmente todos os movimentos das pessoas no ambiente.' },
  { id: 83, quadrant: 'EX', description: 'muda rapidamente entre atividades sem concluir nenhuma.' },
  { id: 84, quadrant: 'SN', description: 'tem dificuldade de retomar uma tarefa após qualquer interrupção sonora ou visual.' },
  { id: 85, quadrant: 'OB', description: 'tem dificuldade de localizar um objeto entre vários itens visíveis em uma mesa ou gaveta.' },
];
