import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteAccountModal from './DeleteAccountModal';

const getTokenMock = vi.fn().mockResolvedValue('fake-token');
const signOutMock = vi.fn().mockResolvedValue(undefined);

vi.mock('../../context/AuthContext', () => ({
  useAuthContext: () => ({ getToken: getTokenMock, signOut: signOutMock }),
}));

const eraseAccountMock = vi.fn();
vi.mock('../../services/api', () => ({
  accountApi: { eraseAccount: (...args: unknown[]) => eraseAccountMock(...args) },
}));

describe('DeleteAccountModal', () => {
  beforeEach(() => {
    getTokenMock.mockClear();
    signOutMock.mockClear();
    eraseAccountMock.mockReset();
    eraseAccountMock.mockResolvedValue({ childrenDeleted: 1, storageObjectsDeleted: 0 });
  });

  it('does not render its content when closed', () => {
    render(<DeleteAccountModal open={false} onClose={vi.fn()} />);
    expect(screen.queryByLabelText('Confirmação')).not.toBeInTheDocument();
  });

  it('keeps the delete button disabled until the exact confirmation phrase is typed', async () => {
    const user = userEvent.setup();
    render(<DeleteAccountModal open onClose={vi.fn()} />);

    const deleteButton = screen.getByRole('button', { name: 'Excluir permanentemente' });
    expect(deleteButton).toBeDisabled();

    const input = screen.getByLabelText('Confirmação');
    await user.type(input, 'wrong phrase');
    expect(deleteButton).toBeDisabled();

    await user.clear(input);
    await user.type(input, 'excluir minha conta');
    expect(deleteButton).toBeEnabled();
  });

  it('accepts the confirmation phrase case-insensitively and with surrounding whitespace', async () => {
    const user = userEvent.setup();
    render(<DeleteAccountModal open onClose={vi.fn()} />);

    const input = screen.getByLabelText('Confirmação');
    await user.type(input, '  EXCLUIR MINHA CONTA  ');

    expect(screen.getByRole('button', { name: 'Excluir permanentemente' })).toBeEnabled();
  });

  it('calls eraseAccount and signs out on confirmed delete', async () => {
    const user = userEvent.setup();
    render(<DeleteAccountModal open onClose={vi.fn()} />);

    await user.type(screen.getByLabelText('Confirmação'), 'excluir minha conta');
    await user.click(screen.getByRole('button', { name: 'Excluir permanentemente' }));

    await waitFor(() => expect(eraseAccountMock).toHaveBeenCalledWith('fake-token'));
    await waitFor(() => expect(signOutMock).toHaveBeenCalled());
  });

  it('shows an error and re-enables the form when erasure fails', async () => {
    eraseAccountMock.mockRejectedValue(new Error('network error'));
    const user = userEvent.setup();
    render(<DeleteAccountModal open onClose={vi.fn()} />);

    await user.type(screen.getByLabelText('Confirmação'), 'excluir minha conta');
    await user.click(screen.getByRole('button', { name: 'Excluir permanentemente' }));

    expect(await screen.findByText('Não foi possível excluir a conta agora. Tente novamente.')).toBeInTheDocument();
    expect(signOutMock).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Excluir permanentemente' })).toBeEnabled();
  });

  it('does not call eraseAccount when the confirmation phrase is missing', async () => {
    const user = userEvent.setup();
    render(<DeleteAccountModal open onClose={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Excluir permanentemente' }));

    expect(eraseAccountMock).not.toHaveBeenCalled();
  });
});
