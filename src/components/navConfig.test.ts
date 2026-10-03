import { describe, it, expect } from 'vitest';
import { PRIMARY_ITEMS, MORE_GROUPS, isNavItemActive } from './navConfig';

const all = [...PRIMARY_ITEMS, ...MORE_GROUPS.flatMap((g) => g.items)];
const activeFor = (pathname: string) => all.filter((i) => isNavItemActive(pathname, i)).map((i) => i.path);

describe('navConfig', () => {
  it('marca apenas um item por rota', () => {
    for (const p of ['/dashboard', '/shared', '/shared/children', '/shared/children/1', '/assessments', '/assessment/new', '/assessment/1/report', '/anamneses', '/anamnese/new']) {
      expect(activeFor(p)).toHaveLength(1);
    }
  });
  it('não confunde /shared com /shared/children', () => {
    expect(activeFor('/shared')).toEqual(['/shared']);
    expect(activeFor('/shared/anamnese/1')).toEqual(['/shared']);
    expect(activeFor('/shared/children/9')).toEqual(['/shared/children']);
  });
  it('avaliações cobre lista, nova e detalhe', () => {
    expect(activeFor('/assessments')).toEqual(['/assessments']);
    expect(activeFor('/assessment/new')).toEqual(['/assessments']);
  });
  it('início só na rota exata', () => {
    expect(activeFor('/dashboard')).toEqual(['/dashboard']);
    expect(activeFor('/dashboardx')).toEqual([]);
  });
  it('tem no máximo 4 abas primárias', () => {
    expect(PRIMARY_ITEMS.length).toBeLessThanOrEqual(4);
  });
});
