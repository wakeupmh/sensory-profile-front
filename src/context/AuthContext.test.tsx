import { describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { AuthProvider, useAuthContext } from './AuthContext';
import { queueLog, getQueuedLogs } from '../services/offlineLogQueue';
import { selectedChildStorageKey } from '../hooks/useDomainPage';

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: () => Promise.resolve({ error: null }),
    },
  },
}));

describe('signOut', () => {
  it('removes the offline log queue, form drafts and the selected child from the device', async () => {
    queueLog({ childId: 'c1' } as never, { userId: 'u1', delegateChildId: null });
    localStorage.setItem('draft:sensory_assessment:u1', '{"payload":{}}');
    localStorage.setItem('draft:anamnese:u1', '{"payload":{}}');
    localStorage.setItem(selectedChildStorageKey('u1'), 'c1');
    localStorage.setItem('sensory-profile-theme', 'dark');

    let signOut: () => Promise<void> = async () => {};
    function Grab() {
      signOut = useAuthContext().signOut;
      return null;
    }
    render(<AuthProvider><Grab /></AuthProvider>);
    await act(() => signOut());

    expect(getQueuedLogs()).toEqual([]);
    expect(localStorage.getItem('offline-log-queue')).toBeNull();
    expect(localStorage.getItem('draft:sensory_assessment:u1')).toBeNull();
    expect(localStorage.getItem('draft:anamnese:u1')).toBeNull();
    expect(localStorage.getItem(selectedChildStorageKey('u1'))).toBeNull();
    expect(localStorage.getItem('sensory-profile-theme')).toBe('dark');
  });
});
