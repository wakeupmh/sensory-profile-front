import { useCallback, useState } from 'react';

interface UseCopyToClipboardResult {
  /** True for ~2s after a successful copy. */
  copied: boolean;
  /** Last copy error message (e.g. clipboard unavailable). Cleared on success. */
  error: string | null;
  /** Copy the given text. Returns true on success. */
  copy: (text: string) => Promise<boolean>;
}

/**
 * Tiny clipboard helper used by ShareLinkBox, SharePanel and InvitationTokenCard.
 * Centralises the `navigator.clipboard?.writeText` check, the timed "Copiado!"
 * flag and the fallback error message so individual call sites can't drift.
 */
export const useCopyToClipboard = (resetMs = 2000): UseCopyToClipboardResult => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        if (!navigator?.clipboard?.writeText) {
          setError('Copie manualmente — clipboard indisponível neste navegador.');
          return false;
        }
        await navigator.clipboard.writeText(text);
        setError(null);
        setCopied(true);
        setTimeout(() => setCopied(false), resetMs);
        return true;
      } catch {
        setError('Não foi possível copiar. Copie manualmente.');
        return false;
      }
    },
    [resetMs],
  );

  return { copied, error, copy };
};

export default useCopyToClipboard;
