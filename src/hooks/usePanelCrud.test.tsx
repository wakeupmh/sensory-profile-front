import { describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { usePanelCrud } from './usePanelCrud';

type Item = { id: string };

describe('usePanelCrud', () => {
  it('fechar o painel esquece a lista', async () => {
    const fetchFn = async (): Promise<Item[]> => [{ id: 'a1' }];
    const { result, rerender } = renderHook((p: { isOpen: boolean }) => usePanelCrud<Item>({ ...p, childId: 'a', fetchFn }), {
      initialProps: { isOpen: true },
    });
    await waitFor(() => expect(result.current.items).toEqual([{ id: 'a1' }]));
    rerender({ isOpen: false });
    expect(result.current.items).toEqual([]);
  });

  it('a resposta atrasada da criança anterior não substitui a atual', async () => {
    let releaseA!: () => void;
    const fetchA = () => new Promise<Item[]>((resolve) => { releaseA = () => resolve([{ id: 'a1' }]); });
    const fetchB = async (): Promise<Item[]> => [{ id: 'b1' }];
    const { result, rerender } = renderHook(
      (p: { childId: string; fetchFn: () => Promise<Item[]> }) => usePanelCrud<Item>({ isOpen: true, ...p }),
      { initialProps: { childId: 'a', fetchFn: fetchA } },
    );
    rerender({ childId: 'b', fetchFn: fetchB });
    await waitFor(() => expect(result.current.items).toEqual([{ id: 'b1' }]));
    await act(async () => releaseA());
    expect(result.current.items).toEqual([{ id: 'b1' }]);
  });
});
