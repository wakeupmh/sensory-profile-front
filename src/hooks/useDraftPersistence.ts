import { useEffect, useRef, useCallback } from 'react';
import { draftApi, DraftData } from '../services/api';
import { useAuthContext } from '../context/AuthContext';

interface UseDraftPersistenceOptions {
  formType: 'sensory_assessment' | 'anamnese';
  formData: Record<string, unknown>;
  currentStep: number;
  instrumentId?: string | null;
  enabled: boolean;
}

export function useDraftPersistence({
  formType,
  formData,
  currentStep,
  instrumentId,
  enabled,
}: UseDraftPersistenceOptions) {
  const { getToken, session } = useAuthContext();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');
  const savingRef = useRef(false);

  const localKey = session?.user?.id
    ? `draft:${formType}:${session.user.id}`
    : null;

  const saveNow = useCallback(
    async (data: Record<string, unknown>, step: number, instId?: string | null) => {
      if (!enabled || savingRef.current) return;
      const snapshot = JSON.stringify({ data, step, instId });
      if (snapshot === lastSavedRef.current) return;
      savingRef.current = true;
      try {
        const token = await getToken();
        await draftApi.saveDraft(formType, data, step, instId, token);
        lastSavedRef.current = snapshot;
        if (localKey) {
          localStorage.setItem(
            localKey,
            JSON.stringify({ payload: data, currentStep: step, instrumentId: instId })
          );
        }
      } catch {
        // silent — next autosave will retry
      } finally {
        savingRef.current = false;
      }
    },
    [enabled, formType, getToken, localKey]
  );

  // Debounced save on formData change
  useEffect(() => {
    if (!enabled) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveNow(formData, currentStep, instrumentId);
    }, 2000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formData, enabled, saveNow, currentStep, instrumentId]);

  // Eager save on step change (immediate)
  const saveOnStepChange = useCallback(
    (newStep: number) => {
      if (!enabled) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return saveNow(formData, newStep, instrumentId);
    },
    [enabled, formData, instrumentId, saveNow]
  );

  const loadDraft = useCallback(async (): Promise<DraftData | null> => {
    // Try server first; fall back to localStorage
    try {
      const token = await getToken();
      const serverDraft = await draftApi.getDraft(formType, token);
      if (serverDraft) return serverDraft;
    } catch {
      // server unreachable — try cache
    }
    if (localKey) {
      const cached = localStorage.getItem(localKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as {
            payload: Record<string, unknown>;
            currentStep: number;
            instrumentId: string | null;
          };
          return {
            id: '',
            formType,
            payload: parsed.payload,
            currentStep: parsed.currentStep,
            instrumentId: parsed.instrumentId,
            createdAt: '',
            updatedAt: '',
          };
        } catch {
          // malformed cache — ignore
        }
      }
    }
    return null;
  }, [formType, getToken, localKey]);

  const clearDraft = useCallback(async () => {
    try {
      const token = await getToken();
      await draftApi.deleteDraft(formType, token);
    } catch {
      // ignore
    }
    if (localKey) localStorage.removeItem(localKey);
    lastSavedRef.current = '';
  }, [formType, getToken, localKey]);

  return { loadDraft, clearDraft, saveOnStepChange };
}
