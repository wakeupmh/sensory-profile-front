import { describe, expect, it } from 'vitest';
import { probes, getProbeByScreenItem } from './probes';
import { mchatRFFollowupItems } from './items';
import { mchatRItems } from '../mchat-r/items';
import { MCHAT_REVERSE_ITEMS, screenItemFails } from '../mchat-r/scoring';
import { mchatRFFollowup } from './index';

describe('probes M-CHAT-R/F', () => {
  it('cobrem os itens 1..20 em ordem, com IDs 4000+N', () => {
    expect(probes.map((p) => p.screenItemNumber)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    probes.forEach((p) => expect(p.probeItemId).toBe(4000 + p.screenItemNumber));
  });

  it('itens invertidos {2,5,12} coincidem com a pontuação da triagem', () => {
    const reverse = probes.filter((p) => p.failOnYes).map((p) => p.screenItemNumber);
    expect(reverse).toEqual([2, 5, 12]);
    expect([...MCHAT_REVERSE_ITEMS]).toEqual(reverse);
    probes.forEach((p) => {
      expect(screenItemFails(p.screenItemNumber, p.failOnYes ? 'sim' : 'nao')).toBe(true);
      expect(screenItemFails(p.screenItemNumber, p.failOnYes ? 'nao' : 'sim')).toBe(false);
    });
  });

  it('o item 20 reprova quando a criança NÃO gosta de movimento', () => {
    const p = getProbeByScreenItem(20)!;
    expect(p.failOnYes).toBe(false);
    expect(p.rule).toMatch(/FALHOU se NÃO gosta/);
  });

  it('cada roteiro tem pergunta, orientação e regra explícita', () => {
    probes.forEach((p) => {
      expect(p.question.length).toBeGreaterThan(10);
      expect(p.guidance.length).toBeGreaterThan(10);
      expect(p.rule).toMatch(/PASSOU/);
      expect(p.rule).toMatch(/FALHOU/);
    });
  });

  it('os itens de sondagem exibem a pergunta original da triagem e o roteiro', () => {
    expect(mchatRFFollowupItems).toHaveLength(20);
    mchatRFFollowupItems.forEach((item, i) => {
      expect(item.description).toBe(mchatRItems[i].description);
      expect(item.guidance?.length).toBe(3);
    });
  });

  it('seções dinâmicas trazem só os itens reprovados', () => {
    const sections = mchatRFFollowup.dynamicSections!({ scores_json: { failedItemIds: [3002, 3020] } });
    expect(sections.map((s) => s.key)).toEqual(['followup_item_2', 'followup_item_20']);
    expect(sections[1].items[0].id).toBe(4020);
    const derived = mchatRFFollowup.sectionsForItemIds!([4020, 4002, 4002]);
    expect(derived.map((s) => s.key)).toEqual(['followup_item_2', 'followup_item_20']);
  });
});
