import { careTeamApi } from '../services/api';
import { createAccountFlag } from './createAccountFlag';

/** A conta atende ao menos uma criança pelo care team: mostra "Meus atendimentos". */
const caseload = createAccountFlag(async (token) => (await careTeamApi.myChildren(token)).length > 0);

export const useCareTeamCaseload = caseload.useFlag;
export const resetCareTeamCaseloadCache = caseload.reset;
