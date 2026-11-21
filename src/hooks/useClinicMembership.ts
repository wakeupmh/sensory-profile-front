import { clinicApi } from '../services/api';
import { createAccountFlag } from './createAccountFlag';

/** A conta faz parte de alguma clínica: mostra "Clínicas". */
const membership = createAccountFlag(async (token) => (await clinicApi.listMine(token)).length > 0);

export const useClinicMembership = membership.useFlag;
export const resetClinicMembershipCache = membership.reset;
