import { describe, expect, it } from 'vitest';
import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';

function collectKeys(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([key, value]) =>
    collectKeys(value, prefix ? `${prefix}.${key}` : key),
  );
}

function collectInterpolationVars(value: unknown): Set<string> {
  const vars = new Set<string>();
  const walk = (v: unknown) => {
    if (typeof v === 'string') {
      for (const match of v.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g)) vars.add(match[1]);
    } else if (v !== null && typeof v === 'object') {
      Object.values(v as Record<string, unknown>).forEach(walk);
    }
  };
  walk(value);
  return vars;
}

describe('locale resource parity (pt-BR vs en-US)', () => {
  it('has exactly the same set of keys in both locales', () => {
    const ptKeys = collectKeys(ptBR).sort();
    const enKeys = collectKeys(enUS).sort();

    const missingFromEn = ptKeys.filter((k) => !enKeys.includes(k));
    const missingFromPt = enKeys.filter((k) => !ptKeys.includes(k));

    expect(missingFromEn, 'keys present in pt-BR.json but missing from en-US.json').toEqual([]);
    expect(missingFromPt, 'keys present in en-US.json but missing from pt-BR.json').toEqual([]);
  });

  it('has no empty string values in either locale', () => {
    const emptyIn = (resource: Record<string, unknown>, name: string) => {
      const empties = collectKeys(resource).filter((key) => {
        const value = key.split('.').reduce<unknown>((acc, part) => (acc as Record<string, unknown>)?.[part], resource);
        return value === '';
      });
      expect(empties, `empty string values in ${name}`).toEqual([]);
    };
    emptyIn(ptBR, 'pt-BR.json');
    emptyIn(enUS, 'en-US.json');
  });

  it('uses the same {{interpolation}} variables on both sides of every key', () => {
    const mismatches: string[] = [];
    for (const key of collectKeys(ptBR)) {
      const ptValue = key.split('.').reduce<unknown>((acc, part) => (acc as Record<string, unknown>)?.[part], ptBR);
      const enValue = key.split('.').reduce<unknown>((acc, part) => (acc as Record<string, unknown>)?.[part], enUS);
      const ptVars = collectInterpolationVars(ptValue);
      const enVars = collectInterpolationVars(enValue);
      const same = ptVars.size === enVars.size && [...ptVars].every((v) => enVars.has(v));
      if (!same) mismatches.push(`${key}: pt-BR=[${[...ptVars]}] en-US=[${[...enVars]}]`);
    }
    expect(mismatches).toEqual([]);
  });
});
