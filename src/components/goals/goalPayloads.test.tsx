import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '../../i18n';
import GoalForm from './GoalForm';
import GoalProgressForm from './GoalProgressForm';

/**
 * Os nomes dos campos são o contrato com o backend (goalValidation.ts): o zod
 * de lá descarta chaves desconhecidas em silêncio, então um nome errado não
 * dá erro — a linha de base e o alvo simplesmente nunca eram gravados.
 */

vi.mock('../../context/AuthContext', () => ({
  useAuthContext: () => ({ getToken: vi.fn().mockResolvedValue('t') }),
}));
vi.mock('../../services/api', () => ({
  therapyApi: { getSessions: vi.fn().mockResolvedValue({ data: [] }) },
}));

describe('payloads de metas', () => {
  it('a meta envia baselineValue, targetValue e masteryCriteria', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<GoalForm childId="c1" onSubmit={onSubmit} onCancel={() => {}} />);

    await userEvent.type(screen.getByLabelText(/título|title/i), 'Pedir água');
    await userEvent.type(screen.getByLabelText(/critério|criteria/i), '3 de 5 tentativas');
    await userEvent.clear(screen.getByLabelText(/baseline/i));
    await userEvent.type(screen.getByLabelText(/baseline/i), '2');
    await userEvent.type(screen.getByLabelText(/^(meta|target)/i), '10');
    await userEvent.click(screen.getByRole('button', { name: /salvar|save/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ baselineValue: 2, targetValue: 10, masteryCriteria: '3 de 5 tentativas' }),
    );
  });

  it('o progresso envia recordedAt no dia escolhido', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<GoalProgressForm isOpen onClose={() => {}} childId="c1" onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/valor|value/i), '4');
    const date = screen.getByLabelText(/data|date/i);
    await userEvent.clear(date);
    await userEvent.type(date, '2026-11-21');
    await userEvent.click(screen.getByRole('button', { name: /salvar|save|registrar/i }));

    const payload = onSubmit.mock.calls[0][0];
    expect(payload).toMatchObject({ value: 4 });
    // O dia local escolhido, em qualquer fuso de -11h a +11h.
    expect(new Date(payload.recordedAt).getDate()).toBe(21);
    expect(payload.recordedAt).toMatch(/Z$/);
  });
});
