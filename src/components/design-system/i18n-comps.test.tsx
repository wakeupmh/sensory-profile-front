import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from '../../i18n';
import ptExtra from '../../i18n/locales/extra/comps.pt-BR.json';
import enExtra from '../../i18n/locales/extra/comps.en-US.json';
import GumroadStepper from './GumroadStepper';
import GumroadModal from './GumroadModal';

function keys(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

describe('traduções extras (comps)', () => {
  it('pt-BR e en-US têm o mesmo conjunto de chaves', () => {
    expect(keys(ptExtra).sort()).toEqual(keys(enExtra).sort());
  });

  it('plural com zero mantém o texto original em pt-BR', async () => {
    await i18n.changeLanguage('pt-BR');
    expect(i18n.t('cConsolidated.logsTotal', { count: 0 })).toBe('registros totais');
    expect(i18n.t('cConsolidated.logsTotal', { count: 1 })).toBe('registro total');
    expect(i18n.t('cInsights.weekday.0')).toBe('Dom');
  });
});

describe('design system i18n/a11y', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en-US');
  });

  it('GumroadModal traduz o botão de fechar', () => {
    render(
      <GumroadModal open onClose={() => {}} title="Title">
        <p>body</p>
      </GumroadModal>,
    );
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('GumroadStepper marca a etapa atual e expõe botões nomeados para etapas navegáveis', async () => {
    const onStepClick = vi.fn();
    render(
      <GumroadStepper
        steps={[{ key: 'a', label: 'One' }, { key: 'b', label: 'Two' }]}
        current={1}
        completed={new Set([0])}
        onStepClick={onStepClick}
      />,
    );
    expect(screen.getByRole('button', { name: 'Go to step 2: Two' })).toHaveAttribute('aria-current', 'step');
    await userEvent.click(screen.getByRole('button', { name: 'Go to step 1: One' }));
    expect(onStepClick).toHaveBeenCalledWith(0);
  });
});
