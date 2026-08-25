import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChildSelector } from './ChildSelector';
import type { ChildData } from '../../services/api';

function childFixture(id: string, name: string): ChildData {
  return { id, userId: 'user-1', name, birthDate: '2018-01-01', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' };
}

describe('ChildSelector — nome acessível', () => {
  it('expõe um nome acessível em pt-BR para o campo de seleção', () => {
    render(
      <ChildSelector
        children={[childFixture('ana', 'Ana'), childFixture('bruno', 'Bruno')]}
        selectedChildId=""
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('combobox', { name: 'Selecionar criança' })).toBeInTheDocument();
  });

  it('associa o rótulo ao select via id/htmlFor (não depende só de aria-label)', () => {
    render(
      <ChildSelector
        children={[childFixture('ana', 'Ana')]}
        selectedChildId=""
        onChange={vi.fn()}
      />,
    );
    const label = screen.getByText('Selecionar criança');
    const select = screen.getByRole('combobox');
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', select.id);
    expect(select.id).toBeTruthy();
  });

  it('chama onChange com o id da criança escolhida', async () => {
    const onChange = vi.fn();
    render(
      <ChildSelector
        children={[childFixture('ana', 'Ana'), childFixture('bruno', 'Bruno')]}
        selectedChildId=""
        onChange={onChange}
      />,
    );
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Selecionar criança' }), 'bruno');
    expect(onChange).toHaveBeenCalledWith('bruno');
  });
});
