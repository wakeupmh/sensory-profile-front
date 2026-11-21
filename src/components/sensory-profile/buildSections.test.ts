import { describe, expect, it } from 'vitest';
import { assessmentToFormData } from './buildSections';

describe('assessmentToFormData', () => {
  it('gênero não informado continua não informado', () => {
    const form = assessmentToFormData({ instrumentId: 'crianca-3-14', childName: 'Ana Souza', childGender: null }, []);
    expect(form.child.gender).toBe('');
  });

  it('gênero informado é mantido', () => {
    const form = assessmentToFormData({ instrumentId: 'crianca-3-14', childName: 'Ana Souza', childGender: 'female' }, []);
    expect(form.child.gender).toBe('female');
  });
});
