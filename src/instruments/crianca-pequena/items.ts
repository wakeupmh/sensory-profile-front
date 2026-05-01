/**
 * Itens originais escritos para a triagem "Criança Pequena" (7–36 meses).
 * Organizados conforme o framework público dos quatro quadrantes de processamento
 * sensorial de Winnie Dunn (Busca/EX, Evitação/EV, Sensibilidade/SN, Registro/OB).
 * Não reproduzem itens de instrumentos proprietários — são descrições genéricas
 * de comportamentos observáveis no cotidiano dessa faixa etária.
 */
import type { InstrumentItem } from '../types';

export const toddlerAuditoryItems: InstrumentItem[] = [
  { id: 1001, quadrant: 'EX', description: 'produz barulhos com a boca, brinquedos ou objetos apenas para ouvir o som.' },
  { id: 1002, quadrant: 'EX', description: 'demonstra entusiasmo com músicas, chocalhos ou brinquedos sonoros.' },
  { id: 1003, quadrant: 'SN', description: 'acorda do sono com ruídos baixos do ambiente.' },
  { id: 1004, quadrant: 'SN', description: 'fica irritada quando há várias pessoas conversando ao mesmo tempo.' },
  { id: 1005, quadrant: 'EV', description: 'chora ou se assusta com eletrodomésticos (aspirador, liquidificador, secador).' },
  { id: 1006, quadrant: 'EV', description: 'evita ou pede colo em ambientes cheios e barulhentos.' },
  { id: 1007, quadrant: 'OB', description: 'não vira em direção a sons familiares quando não está distraída.' },
  { id: 1008, quadrant: 'OB', description: 'parece não notar ruídos que chamam a atenção de outras crianças da mesma idade.' },
];

export const toddlerVisualItems: InstrumentItem[] = [
  { id: 1009, quadrant: 'EX', description: 'fixa o olhar de forma prolongada em ventiladores, luzes piscantes ou objetos que giram.' },
  { id: 1010, quadrant: 'EX', description: 'observa com muita atenção detalhes pequenos nas próprias mãos ou em brinquedos.' },
  { id: 1011, quadrant: 'SN', description: 'franze os olhos ou vira o rosto diante de luzes claras ou ambientes muito iluminados.' },
  { id: 1012, quadrant: 'SN', description: 'demonstra desconforto em ambientes com muitos objetos e cores misturadas.' },
  { id: 1013, quadrant: 'EV', description: 'evita sustentar contato visual com rostos desconhecidos.' },
  { id: 1014, quadrant: 'EV', description: 'esconde o rosto ou fecha os olhos quando há muita movimentação visual ao redor.' },
  { id: 1015, quadrant: 'OB', description: 'não demonstra reação quando algo novo aparece no campo de visão.' },
  { id: 1016, quadrant: 'OB', description: 'tem dificuldade para localizar um brinquedo colocado entre outros.' },
];

export const toddlerTactileItems: InstrumentItem[] = [
  { id: 1017, quadrant: 'EX', description: 'toca e esfrega repetidamente diferentes texturas (parede, tapete, cabelo de outras pessoas).' },
  { id: 1018, quadrant: 'EX', description: 'busca abraços apertados ou gosta de ser enrolada em cobertor.' },
  { id: 1019, quadrant: 'SN', description: 'reage com intensidade a toques leves e inesperados.' },
  { id: 1020, quadrant: 'SN', description: 'demonstra incômodo com etiquetas, costuras ou tecidos específicos de roupas.' },
  { id: 1021, quadrant: 'EV', description: 'resiste fortemente a cortar unhas, pentear o cabelo ou lavar o rosto.' },
  { id: 1022, quadrant: 'EV', description: 'recusa pisar descalça em grama, areia, terra ou outras superfícies texturizadas.' },
  { id: 1023, quadrant: 'OB', description: 'não demonstra perceber quando a fralda, a boca ou as mãos estão sujas.' },
  { id: 1024, quadrant: 'OB', description: 'parece não sentir batidas ou pequenos machucados que causariam reação em outras crianças.' },
];

export const toddlerVestibularItems: InstrumentItem[] = [
  { id: 1025, quadrant: 'EX', description: 'gira em torno do próprio corpo por longos períodos sem demonstrar tontura.' },
  { id: 1026, quadrant: 'EX', description: 'procura constantemente escalar móveis, pular de lugares altos ou balançar.' },
  { id: 1027, quadrant: 'SN', description: 'demonstra insegurança em superfícies que se mexem (colchão, almofadas, balanço).' },
  { id: 1028, quadrant: 'SN', description: 'resiste a deitar de costas ou a levar a cabeça para trás (ex.: na hora de lavar o cabelo).' },
  { id: 1029, quadrant: 'EV', description: 'chora em balanços, escorregadores ou ao ser erguida acima da altura do adulto.' },
  { id: 1030, quadrant: 'EV', description: 'evita brinquedos de parquinho que envolvem movimento amplo.' },
  { id: 1031, quadrant: 'OB', description: 'demora a alcançar marcos motores (sentar, engatinhar, andar) em comparação a colegas da mesma idade.' },
  { id: 1032, quadrant: 'OB', description: 'cai com frequência sem demonstrar ter percebido o desequilíbrio.' },
];

export const toddlerOralItems: InstrumentItem[] = [
  { id: 1033, quadrant: 'EX', description: 'leva objetos não alimentares à boca com frequência além do esperado para a idade.' },
  { id: 1034, quadrant: 'EX', description: 'demonstra preferência marcada por sabores intensos (azedo, muito temperado).' },
  { id: 1035, quadrant: 'SN', description: 'recusa alimentos em função da textura (pastoso, grudento, crocante, fibroso).' },
  { id: 1036, quadrant: 'SN', description: 'engasga ou tem ânsia com frequência durante as refeições.' },
  { id: 1037, quadrant: 'EV', description: 'evita experimentar alimentos novos mesmo depois de várias tentativas.' },
  { id: 1038, quadrant: 'EV', description: 'fica aflita durante a escovação dos dentes.' },
  { id: 1039, quadrant: 'OB', description: 'mantém o alimento na boca por muito tempo sem mastigar ou engolir.' },
  { id: 1040, quadrant: 'OB', description: 'não demonstra perceber restos de comida ao redor da boca ou no rosto.' },
];

export const toddlerGeneralItems: InstrumentItem[] = [
  { id: 1041, quadrant: 'EX', description: 'fica bem mais agitada do que o habitual em ambientes novos ou cheios de pessoas.' },
  { id: 1042, quadrant: 'EX', description: 'dorme pouco e acorda várias vezes durante a noite.' },
  { id: 1043, quadrant: 'SN', description: 'se irrita rapidamente quando a rotina muda sem aviso.' },
  { id: 1044, quadrant: 'SN', description: 'leva muito tempo para se acalmar depois de ficar excitada ou chateada.' },
  { id: 1045, quadrant: 'EV', description: 'se retrai ou se isola em situações sociais com outras crianças.' },
  { id: 1046, quadrant: 'EV', description: 'resiste ou chora em transições entre atividades do dia (banho, refeição, sair de casa).' },
  { id: 1047, quadrant: 'OB', description: 'permanece calma e pouco reativa em situações que costumam envolver outras crianças da mesma idade.' },
  { id: 1048, quadrant: 'OB', description: 'parece cansada ou apática em boa parte do dia.' },
];
