import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertDialog, Flex } from '@radix-ui/themes';
import { consolidatedReportApi } from '../../services/api';
import type { ReportShare } from '../../types/consolidatedReport';
import { useAuthContext } from '../../context/AuthContext';
import { colors, fonts, radii, shadows } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';

interface Props {
  childId: string;
  periodDays?: number;
  isPublicView?: boolean;
}

const SharePanel: React.FC<Props> = ({ childId, periodDays = 90, isPublicView }) => {
  const { t, i18n } = useTranslation();
  const { getToken } = useAuthContext();
  const [shares, setShares] = useState<ReportShare[]>([]);
  const [creating, setCreating] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isPublicView) return;
    let cancelled = false;
    const load = async () => {
      try {
        const token = await getToken();
        const res = await consolidatedReportApi.listShares(token, childId);
        if (!cancelled) {
          setShares(res.shares);
          setLoadError(null);
        }
      } catch {
        if (!cancelled) setLoadError(t('cConsolidated.share.loadError'));
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [childId, getToken, isPublicView, t]);

  if (isPublicView) return null;

  const handleCreate = async () => {
    try {
      setCreating(true);
      setActionError(null);
      const token = await getToken();
      const res = await consolidatedReportApi.createShare(token, { childId, expiresInDays, periodDays });
      setShares((prev) => [res.share, ...prev]);
      try {
        await navigator.clipboard.writeText(res.shareUrl);
        setCopiedId(res.share.id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch {
        // O link foi criado; só a cópia automática falhou — "Copiar" na lista funciona
        setActionError(t('cConsolidated.share.copyAfterCreateError'));
      }
    } catch {
      setActionError(t('cConsolidated.share.createError'));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const token = await getToken();
      await consolidatedReportApi.deleteShare(token, id);
      setShares((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setActionError(t('cConsolidated.share.deleteError'));
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Busca o token deste compartilhamento e copia o link.
   *
   * A listagem não traz mais o token — ele é a capacidade de ler o relatório
   * da criança sem login, e vinha em toda linha de todo `GET /shares`. Agora
   * sai um de cada vez, no clique.
   */
  const handleCopyShare = async (id: string) => {
    try {
      setCopyingId(id);
      setActionError(null);
      const auth = await getToken();
      const shareToken = await consolidatedReportApi.revealShareToken(auth, id);
      await handleCopy(`${window.location.origin}/consolidated/shared/${shareToken}`);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setActionError(t('cConsolidated.share.copyError'));
    } finally {
      setCopyingId(null);
    }
  };

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  return (
    <div
      style={{
        background: '#fff',
        border: `2px solid ${colors.ink}`,
        borderRadius: radii.lg,
        boxShadow: shadows.card,
        padding: '20px',
        marginBottom: '20px',
      }}
    >
      <h2
        style={{
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: '1.05rem',
          marginBottom: '14px',
          color: colors.ink,
        }}
      >
        {t('cConsolidated.share.title')}
      </h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
          {t('cConsolidated.share.validity')}
          <input
            type="number"
            min={1}
            max={365}
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(Math.min(365, Math.max(1, Number(e.target.value) || 1)))}
            style={{
              marginLeft: '8px',
              width: '70px',
              padding: '4px 8px',
              border: `2px solid ${colors.ink}`,
              borderRadius: '8px',
              boxShadow: '2px 2px 0px #0A0A1A',
              background: 'transparent',
              fontFamily: fonts.body,
              fontSize: '0.85rem',
            }}
          />
        </label>
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          style={{
            background: colors['brand-cyan'],
            border: `2px solid ${colors.ink}`,
            borderRadius: '10px',
            boxShadow: creating ? 'none' : '2px 2px 0px #0A0A1A',
            padding: '6px 16px',
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: creating ? 'not-allowed' : 'pointer',
            transform: creating ? 'translate(2px,2px)' : undefined,
            opacity: creating ? 0.7 : 1,
          }}
        >
          {creating ? t('cConsolidated.summary.generating') : t('cConsolidated.share.create')}
        </button>
      </div>

      {(loadError || actionError) && (
        <p role="alert" style={{ color: colors['brand-salmon'], fontSize: '0.85rem', marginBottom: '8px' }}>
          {loadError || actionError}
        </p>
      )}

      {shares.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          {shares.map((share) => {
            const expired = isExpired(share.expiresAt);
            const isCopied = copiedId === share.id;
            return (
              <div
                key={share.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: expired ? '#f9f9f9' : colors.canvas,
                  border: `2px solid ${colors.ink}`,
                  borderRadius: '10px',
                  gap: '8px',
                  flexWrap: 'wrap',
                  opacity: expired ? 0.65 : 1,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', opacity: 0.65 }}>
                      {t('cConsolidated.share.lastDays', { count: share.periodDays })}
                    </span>
                    {expired && (
                      <span
                        style={{
                          background: colors['brand-salmon'],
                          border: `1px solid ${colors.ink}`,
                          borderRadius: '6px',
                          padding: '0 6px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                        }}
                      >
                        {t('cConsolidated.share.expired')}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', opacity: 0.55 }}>
                    {t('cConsolidated.share.validUntil', { date: new Date(share.expiresAt).toLocaleDateString(i18n.language) })}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {!expired && (
                    <button
                      type="button"
                      aria-live="polite"
                      onClick={() => handleCopyShare(share.id)}
                      disabled={copyingId === share.id}
                      style={{
                        background: isCopied ? colors['brand-yellow'] : colors.canvas,
                        border: `2px solid ${colors.ink}`,
                        borderRadius: '8px',
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '1px 1px 0px #0A0A1A',
                      }}
                    >
                      {copyingId === share.id ? t('cConsolidated.share.copying') : isCopied ? t('cConsolidated.share.copied') : t('cConsolidated.share.copy')}
                    </button>
                  )}
                  <AlertDialog.Root>
                    <AlertDialog.Trigger>
                      <button
                        type="button"
                        disabled={deletingId === share.id}
                        style={{
                          background: colors['brand-salmon'],
                          border: `2px solid ${colors.ink}`,
                          borderRadius: '8px',
                          padding: '4px 10px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: deletingId === share.id ? 'not-allowed' : 'pointer',
                          boxShadow: '1px 1px 0px #0A0A1A',
                          opacity: deletingId === share.id ? 0.7 : 1,
                        }}
                      >
                        {deletingId === share.id ? t('cConsolidated.share.deleting') : t('cConsolidated.share.delete')}
                      </button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Content size="2">
                      <AlertDialog.Title>{t('cConsolidated.share.deleteTitle')}</AlertDialog.Title>
                      <AlertDialog.Description size="2">
                        {t('cConsolidated.share.deleteDesc')}
                      </AlertDialog.Description>
                      <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Cancel>
                          <GumroadButton variant="secondary" size="sm">
                            {t('cConsolidated.share.cancel')}
                          </GumroadButton>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                          <GumroadButton
                            variant="danger"
                            size="sm"
                            disabled={deletingId === share.id}
                            onClick={() => handleDelete(share.id)}
                          >
                            {t('cConsolidated.share.delete')}
                          </GumroadButton>
                        </AlertDialog.Action>
                      </Flex>
                    </AlertDialog.Content>
                  </AlertDialog.Root>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SharePanel;
