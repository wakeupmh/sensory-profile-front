/**
 * O status que a tela mostra não é o que o backend devolve: um convite
 * pendente cujo prazo já passou continua `pending` no banco, e mostrar
 * "Convite pendente" para um link que não funciona mais faz o admin ficar
 * esperando alguém que não consegue entrar.
 */
import { describe, expect, it } from 'vitest';
import { getClinicDisplayStatus } from './clinic';

const NOW = new Date('2026-06-15T12:00:00.000Z');

describe('getClinicDisplayStatus', () => {
  it('desligado vence tudo, mesmo com convite ainda no prazo', () => {
    expect(
      getClinicDisplayStatus({ status: 'revoked', invitationExpiresAt: '2026-12-01T00:00:00.000Z' }, NOW),
    ).toBe('revoked');
  });

  it('aceito é ativo, e o prazo do convite deixa de importar', () => {
    expect(
      getClinicDisplayStatus({ status: 'accepted', invitationExpiresAt: '2026-01-01T00:00:00.000Z' }, NOW),
    ).toBe('active');
  });

  it('pendente dentro do prazo é pendente', () => {
    expect(
      getClinicDisplayStatus({ status: 'pending', invitationExpiresAt: '2026-06-20T00:00:00.000Z' }, NOW),
    ).toBe('pending');
  });

  it('pendente com o prazo vencido aparece como expirado', () => {
    expect(
      getClinicDisplayStatus({ status: 'pending', invitationExpiresAt: '2026-06-01T00:00:00.000Z' }, NOW),
    ).toBe('expired');
  });

  it('no instante exato do vencimento já conta como expirado', () => {
    // A fronteira, escrita de propósito: `<=`, não `<`.
    expect(
      getClinicDisplayStatus({ status: 'pending', invitationExpiresAt: NOW.toISOString() }, NOW),
    ).toBe('expired');
  });

  it('pendente sem prazo nenhum continua pendente', () => {
    expect(getClinicDisplayStatus({ status: 'pending', invitationExpiresAt: null }, NOW)).toBe('pending');
  });
});
