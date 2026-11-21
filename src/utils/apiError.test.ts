import { describe, expect, it } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { apiErrorDetail } from './apiError';

const axiosError = (status: number, data: unknown) =>
  new AxiosError('x', 'ERR', undefined, undefined, { status, data, statusText: '', headers: {}, config: { headers: new AxiosHeaders() } });

describe('apiErrorDetail', () => {
  it('junta as mensagens de uma recusa de validação, sem repetir', () => {
    const err = axiosError(400, { error: { details: [{ field: 'a', message: 'Parentesco inválido' }, { field: 'b', message: 'Parentesco inválido' }, { field: 'c', message: 'Data inválida' }] } });
    expect(apiErrorDetail(err)).toBe('Parentesco inválido; Data inválida');
  });
  it('outro erro não tem detalhe', () => {
    expect(apiErrorDetail(axiosError(500, {}))).toBeNull();
    expect(apiErrorDetail(new Error('rede'))).toBeNull();
  });
});
