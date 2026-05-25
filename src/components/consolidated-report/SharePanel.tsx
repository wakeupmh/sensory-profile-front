import React, { useEffect, useState } from 'react';
import { AlertDialog, Flex } from '@radix-ui/themes';
import { consolidatedReportApi } from '../../services/api';
import type { ReportShare } from '../../types/consolidatedReport';
import { useAuthContext } from '../../context/AuthContext';
import { colors, fonts, radii, shadows } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';

interface Props {
  childId: string;
  isPublicView?: boolean;
}

const SharePanel: React.FC<Props> = ({ childId, isPublicView }) => {
  const { getToken } = useAuthContext();
  const [shares, setShares] = useState<ReportShare[]>([]);
  const [creating, setCreating] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [copied, setCopied] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        if (!cancelled) setLoadError('Erro ao carregar links compartilhados.');
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [childId, getToken, isPublicView]);

  if (isPublicView) return null;

  const handleCreate = async () => {
    try {
      setCreating(true);
      setActionError(null);
      const token = await getToken();
      const res = await consolidatedReportApi.createShare(token, { childId, expiresInDays });
      setShares((prev) => [res.share, ...prev]);
      await navigator.clipboard.writeText(res.shareUrl);
      setCopied(res.shareUrl);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setActionError('Erro ao gerar link de compartilhamento.');
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
      setActionError('Erro ao excluir link.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
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
        Compartilhar com Equipe
      </h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
          Validade (dias):
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
          {creating ? 'Gerando...' : 'Gerar Link de Compartilhamento'}
        </button>
      </div>

      {(loadError || actionError) && (
        <p style={{ color: colors['brand-salmon'], fontSize: '0.85rem', marginBottom: '8px' }}>
          {loadError || actionError}
        </p>
      )}

      {shares.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          {shares.map((share) => {
            const expired = isExpired(share.expiresAt);
            const shareUrl = `${window.location.origin}/consolidated/shared/${share.token}`;
            const isCopied = copied === shareUrl;
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
                    <span style={{ fontSize: '0.8rem', opacity: 0.65, wordBreak: 'break-all' }}>
                      {shareUrl}
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
                        Expirado
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', opacity: 0.55 }}>
                    Válido até {new Date(share.expiresAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {!expired && (
                    <button
                      onClick={() => handleCopy(shareUrl)}
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
                      {isCopied ? 'Copiado!' : 'Copiar'}
                    </button>
                  )}
                  <AlertDialog.Root>
                    <AlertDialog.Trigger>
                      <button
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
                        {deletingId === share.id ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Content size="2">
                      <AlertDialog.Title>Excluir link de compartilhamento?</AlertDialog.Title>
                      <AlertDialog.Description size="2">
                        Esta ação não pode ser desfeita.
                      </AlertDialog.Description>
                      <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Cancel>
                          <GumroadButton variant="secondary" size="sm">
                            Cancelar
                          </GumroadButton>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                          <GumroadButton
                            variant="danger"
                            size="sm"
                            disabled={deletingId === share.id}
                            onClick={() => handleDelete(share.id)}
                          >
                            Excluir
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
