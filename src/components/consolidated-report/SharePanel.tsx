import React, { useEffect, useRef, useState } from 'react';
import { consolidatedReportApi } from '../../services/api';
import type { ReportShare } from '../../types/consolidatedReport';
import { useAuthContext } from '../../context/AuthContext';
import { colors, fonts, radii, shadows } from '../../theme/tokens';

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
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (isPublicView) return;
    if (fetchedRef.current) return;
    const load = async () => {
      try {
        const token = await getToken();
        const res = await consolidatedReportApi.listShares(token, childId);
        setShares(res.shares);
        fetchedRef.current = true;
      } catch {
        setLoadError('Erro ao carregar links compartilhados.');
      }
    };
    load();
  }, [childId, getToken, isPublicView]);

  if (isPublicView) return null;

  const handleCreate = async () => {
    try {
      setCreating(true);
      const token = await getToken();
      const res = await consolidatedReportApi.createShare(token, { childId, expiresInDays });
      setShares((prev) => [res.share, ...prev]);
      await navigator.clipboard.writeText(res.shareUrl);
      setCopied(res.shareUrl);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      alert('Erro ao gerar link de compartilhamento.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = await getToken();
      await consolidatedReportApi.deleteShare(token, id);
      setShares((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert('Erro ao excluir link.');
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
            onChange={(e) => setExpiresInDays(Number(e.target.value))}
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

      {loadError && (
        <p style={{ color: colors['brand-salmon'], fontSize: '0.85rem', marginBottom: '8px' }}>{loadError}</p>
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
                  <button
                    onClick={() => handleDelete(share.id)}
                    style={{
                      background: colors['brand-salmon'],
                      border: `2px solid ${colors.ink}`,
                      borderRadius: '8px',
                      padding: '4px 10px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '1px 1px 0px #0A0A1A',
                    }}
                  >
                    Excluir
                  </button>
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
