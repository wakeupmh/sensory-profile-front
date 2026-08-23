/**
 * `new Date('2020-08-24')` é interpretado como meia-noite **UTC**; no Brasil
 * (UTC-3) isso volta um dia, para 23/08 local. Como o cálculo de idade compara
 * mês e dia, a criança aparece um ano mais velha na véspera do aniversário —
 * e o app fazia isso em três telas e não numa quarta, então a mesma criança
 * tinha idades diferentes dependendo de onde se olhava.
 *
 * Datas de nascimento são datas civis, não instantes: o parse tem que ser local.
 */
export function parseLocalDate(date: string): Date {
  return new Date(`${date.slice(0, 10)}T00:00:00`);
}

/** Idade em anos completos, a partir de uma data civil `YYYY-MM-DD`. */
export function calculateAgeYears(birthDate: string, now: Date = new Date()): number {
  const birth = parseLocalDate(birthDate);
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}
