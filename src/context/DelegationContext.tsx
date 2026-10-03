import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { setDelegateChildId } from '../services/delegateChild';
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

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage indisponível/cheio: segue só em memória
  }
}

const DelegationContext = createContext<DelegationContextValue | null>(null);

export function DelegationProvider({ children }: { children: ReactNode }) {
  const [delegateChild, setDelegateChildState] = useState<DelegateChild | null>(() => readJSON(DELEGATE_KEY, null));
  const [caregiverChildren, setCaregiverChildren] = useState<DelegateChild[]>(() => readJSON(CAREGIVER_CHILDREN_KEY, []));

  const { session, isLoaded } = useAuthContext();

  // Ao sair da conta, não deixa o modo cuidador (nem a lista) para o próximo usuário do aparelho
  useEffect(() => {
    if (isLoaded && !session) {
      setDelegateChildState(null);
      setCaregiverChildren([]);
      try {
        localStorage.removeItem(DELEGATE_KEY);
        localStorage.removeItem(CAREGIVER_CHILDREN_KEY);
      } catch {
        // storage indisponível
      }
    }
  }, [isLoaded, session]);

  useEffect(() => {
    setDelegateChildId(delegateChild?.id ?? null);
  }, [delegateChild]);

  const startDelegating = useCallback((child: DelegateChild) => {
    setDelegateChildState(child);
    writeStorage(DELEGATE_KEY, JSON.stringify(child));
  }, []);

  const stopDelegating = useCallback(() => {
    setDelegateChildState(null);
    try {
      localStorage.removeItem(DELEGATE_KEY);
    } catch {
      // storage indisponível (modo privado): o estado em memória continua valendo
    }
  }, []);

  const addCaregiverChild = useCallback((child: DelegateChild) => {
    setCaregiverChildren((prev) => {
      if (prev.some((c) => c.id === child.id)) return prev;
      const next = [...prev, child];
      writeStorage(CAREGIVER_CHILDREN_KEY, JSON.stringify(next));
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
