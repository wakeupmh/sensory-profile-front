import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { setDelegateChildId } from '../services/api';
import type { DelegateChild } from '../types/caregivers';

interface DelegationContextValue {
  /** The child currently being acted on behalf of, or null when viewing your own children. */
  delegateChild: DelegateChild | null;
  /** Children the current user has accepted a caregiver invite for. */
  caregiverChildren: DelegateChild[];
  startDelegating: (child: DelegateChild) => void;
  stopDelegating: () => void;
  addCaregiverChild: (child: DelegateChild) => void;
}

const DELEGATE_KEY = 'delegateChild';
const CAREGIVER_CHILDREN_KEY = 'caregiverChildren';

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const DelegationContext = createContext<DelegationContextValue | null>(null);

export function DelegationProvider({ children }: { children: ReactNode }) {
  const [delegateChild, setDelegateChildState] = useState<DelegateChild | null>(() => readJSON(DELEGATE_KEY, null));
  const [caregiverChildren, setCaregiverChildren] = useState<DelegateChild[]>(() => readJSON(CAREGIVER_CHILDREN_KEY, []));

  useEffect(() => {
    setDelegateChildId(delegateChild?.id ?? null);
  }, [delegateChild]);

  const startDelegating = useCallback((child: DelegateChild) => {
    setDelegateChildState(child);
    localStorage.setItem(DELEGATE_KEY, JSON.stringify(child));
  }, []);

  const stopDelegating = useCallback(() => {
    setDelegateChildState(null);
    localStorage.removeItem(DELEGATE_KEY);
  }, []);

  const addCaregiverChild = useCallback((child: DelegateChild) => {
    setCaregiverChildren((prev) => {
      if (prev.some((c) => c.id === child.id)) return prev;
      const next = [...prev, child];
      localStorage.setItem(CAREGIVER_CHILDREN_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <DelegationContext.Provider value={{ delegateChild, caregiverChildren, startDelegating, stopDelegating, addCaregiverChild }}>
      {children}
    </DelegationContext.Provider>
  );
}

export function useDelegation() {
  const ctx = useContext(DelegationContext);
  if (!ctx) throw new Error('useDelegation must be used inside DelegationProvider');
  return ctx;
}
