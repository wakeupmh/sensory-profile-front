// TODO: Replace with official M-CHAT-R/F probe scripts (see Robins et al. 2014)

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
      'Acompanhamento para o item 1: Faça as perguntas de sondagem relacionadas a este comportamento e determine se o item passa ou falha.',
  },
  {
    screenItemNumber: 2,
    probeItemId: 4002,
    probeScript:
      'Acompanhamento para o item 2: Faça as perguntas de sondagem relacionadas a este comportamento e determine se o item passa ou falha.',
  },
  {
    screenItemNumber: 3,
    probeItemId: 4003,
    probeScript:
      'Acompanhamento para o item 3: Faça as perguntas de sondagem relacionadas a este comportamento e determine se o item passa ou falha.',
  },
  {
    screenItemNumber: 4,
    probeItemId: 4004,
    probeScript:
      'Acompanhamento para o item 4: Faça as perguntas de sondagem relacionadas a este comportamento e determine se o item passa ou falha.',
  },
  {
    screenItemNumber: 5,
    probeItemId: 4005,
    probeScript:
      'Acompanhamento para o item 5: Faça as perguntas de sondagem relacionadas a este comportamento e determine se o item passa ou falha.',
  },
  {
    screenItemNumber: 6,
    probeItemId: 4006,
    probeScript:
      'Acompanhamento para o item 6: Faça as perguntas de sondagem relacionadas a este comportamento e determine se o item passa ou falha.',
  },
  {
    screenItemNumber: 7,
    probeItemId: 4007,
    probeScript:
      'Acompanhamento para o item 7: Faça as perguntas de sondagem relacionadas a este comportamento e determine se o item passa ou falha.',
  },
  {
    screenItemNumber: 8,
    probeItemId: 4008,
    probeScript:
      'Acompanhamento para o item 8: Faça as perguntas de sondagem relacionadas a este comportamento e determine se o item passa ou falha.',
  },
  {
    screenItemNumber: 9,
    probeItemId: 4009,
    probeScript:
      'Acompanhamento para o item 9: Faça as perguntas de sondagem relacionadas a este comportamento e determine se o item passa ou falha.',
  },
  {
    screenItemNumber: 10,
    probeItemId: 4010,
    probeScript:
      'Acompanhamento para o item 10: Faça as perguntas de sondagem relacionadas a este comportamento e determine se o item passa ou falha.',
  },
  {
    screenItemNumber: 11,
    probeItemId: 4011,
    probeScript:
      'Acompanhamento para o item 11: Faça as perguntas de sondagem relacionadas a este comportamento e determine se o item passa ou falha.',
  },
  {
    screenItemNumber: 12,
    probeItemId: 4012,
    probeScript:
      'Acompanhamento para o item 12: Faça as perguntas de sondagem relacionadas a este comportamento e determine se o item passa ou falha.',
  },
  {
    screenItemNumber: 13,
    probeItemId: 4013,
    probeScript:
      'Acompanhamento para o item 13: Faça as perguntas de sondagem relacionadas a este comportamento e determine se o item passa ou falha.',
  },
  {
    screenItemNumber: 14,
    probeItemId: 4014,
    probeScript:
      'Acompanhamento para o item 14: Faça as perguntas de sondagem relacionadas a este comportamento e determine se o item passa ou falha.',
  },
  {
    screenItemNumber: 15,
    probeItemId: 4015,
    probeScript:
      'Acompanhamento para o item 15: Faça as perguntas de sondagem relacionadas a este comportamento e determine se o item passa ou falha.',
  },
  {
    screenItemNumber: 16,
    probeItemId: 4016,
    probeScript:
      'Acompanhamento para o item 16: Faça as perguntas de sondagem relacionadas a este comportamento e determine se o item passa ou falha.',
  },
  {
    screenItemNumber: 17,
    probeItemId: 4017,
    probeScript:
      'Acompanhamento para o item 17: Faça as perguntas de sondagem relacionadas a este comportamento e determine se o item passa ou falha.',
  },
  {
    screenItemNumber: 18,
    probeItemId: 4018,
    probeScript:
      'Acompanhamento para o item 18: Faça as perguntas de sondagem relacionadas a este comportamento e determine se o item passa ou falha.',
  },
  {
    screenItemNumber: 19,
    probeItemId: 4019,
    probeScript:
      'Acompanhamento para o item 19: Faça as perguntas de sondagem relacionadas a este comportamento e determine se o item passa ou falha.',
  },
  {
    screenItemNumber: 20,
    probeItemId: 4020,
    probeScript:
      'Acompanhamento para o item 20: Faça as perguntas de sondagem relacionadas a este comportamento e determine se o item passa ou falha.',
  },
];

/** Look up a probe entry by screen item number (1-based). */
export function getProbeByScreenItem(screenItemNumber: number): ProbeEntry | undefined {
  return probes.find((p) => p.screenItemNumber === screenItemNumber);
}
