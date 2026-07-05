import React, { useEffect, useState } from 'react';
import { Box, Flex } from '@radix-ui/themes';
import { CheckIcon, CopyIcon, Cross2Icon, FileTextIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { consultationBriefApi, AIRateLimitError } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';
import type { ConsultationBrief } from '../../types/consultationBrief';
import { colors, shadows, radii, fonts, spacing, zIndex } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../design-system/GumroadHeading';

interface ConsultationBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  childName?: string;
}

const PERIOD_OPTIONS = [
  { label: '30 dias', value: 30 },
  { label: '60 dias', value: 60 },
  { label: '90 dias', value: 90 },
];

function useCountdown(retryAt: number | null) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!retryAt) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [retryAt]);
  if (!retryAt) return 0;
  return Math.max(0, Math.ceil((retryAt - now) / 1000));
}

function buildPlainText(brief: ConsultationBrief, childName?: string): string {
  const lines = [
    childName ? `Pauta de consulta — ${childName}` : 'Pauta de consulta',
    '',
    'O QUE MUDOU DESDE A ÚLTIMA CONSULTA',
    brief.whatChanged || '—',
    '',
    'MEDICAMENTOS / TRATAMENTOS ATUAIS',
    brief.currentTreatments || '—',
    '',
    'PERGUNTAS SUGERIDAS PARA O MÉDICO',
    ...(brief.suggestedQuestions.length > 0 ? brief.suggestedQuestions.map((q, i) => `${i + 1}. ${q}`) : ['—']),
  ];
  return lines.join('\n');
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(10,10,26,0.5)',
  zIndex: zIndex.modal,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: spacing.md,
};

const cardStyle: React.CSSProperties = {
  backgroundColor: colors.canvas,
  border: `2px solid ${colors.ink}`,
  borderRadius: radii.xl,
  boxShadow: shadows['card-hover'],
  width: '100%',
  maxWidth: '560px',
  maxHeight: '90vh',
  overflowY: 'auto',
  padding: spacing.xl,
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: fonts.display,
  fontWeight: 700,
  fontSize: '13px',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: '6px',
};

const ConsultationBriefModal: React.FC<ConsultationBriefModalProps> = ({ isOpen, onClose, childId, childName }) => {
  const { getToken } = useAuthContext();
  const [periodDays, setPeriodDays] = useState(60);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brief, setBrief] = useState<ConsultationBrief | null>(null);
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const retrySeconds = useCountdown(retryAt);

  useEffect(() => {
    if (retryAt && retrySeconds === 0) setRetryAt(null);
  }, [retryAt, retrySeconds]);

  useEffect(() => {
    if (!isOpen) {
      setBrief(null);
      setError(null);
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const token = await getToken();
      const { brief: result } = await consultationBriefApi.generate(token, { childId, periodDays });
      setBrief(result);
    } catch (err) {
      if (err instanceof AIRateLimitError) {
        if (err.info.retryAfterSeconds) {
          setRetryAt(Date.now() + err.info.retryAfterSeconds * 1000);
        } else {
          setError('Limite de 5 gerações por hora atingido. Tente novamente mais tarde.');
        }
      } else {
        setError('Erro ao gerar a pauta de consulta. Tente novamente.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!brief) return;
    try {
      await navigator.clipboard.writeText(buildPlainText(brief, childName));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Não foi possível copiar automaticamente. Selecione o texto manualmente.');
    }
  };

  const handlePrint = () => {
    const styleId = 'consultation-brief-print-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @media print {
          body * { visibility: hidden !important; }
          #consultation-brief-print, #consultation-brief-print * { visibility: visible !important; }
          #consultation-brief-print {
            position: absolute !important;
            left: 0; top: 0; width: 100%;
            padding: 24px;
            background: white !important;
            color: black !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
    window.print();
  };

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={cardStyle}>
        <Flex justify="between" align="center" mb="4">
          <GumroadHeading level="title-md" as="h3">Preparar consulta</GumroadHeading>
          <button
            onClick={onClose}
            style={{ width: '36px', height: '36px', border: `2px solid ${colors.ink}`, borderRadius: radii.md, backgroundColor: colors.canvas, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Cross2Icon />
          </button>
        </Flex>

        {!brief && (
          <>
            <GumroadText level="body-sm" as="p" style={{ opacity: 0.75, marginBottom: spacing.md }}>
              Gera uma pauta curta para levar impressa (ou ler) na consulta médica: o que mudou, tratamentos atuais e
              perguntas sugeridas.
            </GumroadText>

            <Flex align="center" gap="2" wrap="wrap" mb="4">
              <GumroadText level="caption" as="span" style={{ opacity: 0.65 }}>Período:</GumroadText>
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPeriodDays(opt.value)}
                  style={{
                    padding: '4px 14px',
                    border: `2px solid ${colors.ink}`,
                    borderRadius: radii.pill,
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 700,
                    backgroundColor: periodDays === opt.value ? colors.ink : colors.canvas,
                    color: periodDays === opt.value ? colors.canvas : colors.ink,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </Flex>

            {error && (
              <GumroadText level="body-sm" as="p" style={{ color: colors['brand-salmon'], marginBottom: spacing.sm }}>
                {error}
              </GumroadText>
            )}
            {retryAt && (
              <GumroadText level="body-sm" as="p" style={{ color: colors.ink, opacity: 0.75, marginBottom: spacing.sm }}>
                Você já gerou muitas pautas nesta hora. Tente novamente em {retrySeconds}s.
              </GumroadText>
            )}

            <GumroadButton variant="primary" size="md" onClick={handleGenerate} disabled={generating || retrySeconds > 0}>
              {generating ? 'Gerando...' : retrySeconds > 0 ? `Tente em ${retrySeconds}s` : 'Gerar pauta'}
            </GumroadButton>
          </>
        )}

        {brief && (
          <>
            <Flex gap="2" mb="4" wrap="wrap">
              <GumroadButton variant="secondary" size="sm" onClick={handlePrint}>
                <FileTextIcon /> Imprimir
              </GumroadButton>
              <GumroadButton variant="secondary" size="sm" onClick={handleCopy}>
                {copied ? <CheckIcon /> : <CopyIcon />} {copied ? 'Copiado!' : 'Copiar texto'}
              </GumroadButton>
              <GumroadButton variant="secondary" size="sm" onClick={() => setBrief(null)}>
                Gerar novamente
              </GumroadButton>
            </Flex>

            <Box
              id="consultation-brief-print"
              style={{
                border: `2px solid ${colors.ink}`,
                borderRadius: radii.md,
                padding: spacing.lg,
                backgroundColor: colors.surface,
                fontFamily: "'Space Mono', ui-monospace, monospace",
              }}
            >
              <GumroadHeading level="title-md" as="h2" style={{ marginBottom: spacing.md, fontFamily: 'inherit' }}>
                {childName ? `Pauta de consulta — ${childName}` : 'Pauta de consulta'}
              </GumroadHeading>

              <Box style={{ marginBottom: spacing.md }}>
                <div style={sectionTitleStyle}>O que mudou desde a última consulta</div>
                <GumroadText level="body-sm" as="p" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {brief.whatChanged || '—'}
                </GumroadText>
              </Box>

              <Box style={{ marginBottom: spacing.md }}>
                <div style={sectionTitleStyle}>Medicamentos / tratamentos atuais</div>
                <GumroadText level="body-sm" as="p" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {brief.currentTreatments || '—'}
                </GumroadText>
              </Box>

              <Box>
                <div style={sectionTitleStyle}>Perguntas sugeridas para o médico</div>
                {brief.suggestedQuestions.length > 0 ? (
                  <ol style={{ margin: 0, paddingLeft: '20px', fontFamily: 'inherit' }}>
                    {brief.suggestedQuestions.map((q, i) => (
                      <li key={i} style={{ marginBottom: '4px', fontSize: '14px' }}>{q}</li>
                    ))}
                  </ol>
                ) : (
                  <GumroadText level="body-sm" as="p" style={{ fontFamily: 'inherit' }}>—</GumroadText>
                )}
              </Box>
            </Box>

            <Flex align="center" gap="2" mt="3" style={{ opacity: 0.65 }}>
              <InfoCircledIcon />
              <GumroadText level="caption" as="span">
                Gerado por IA a partir dos seus dados — revise antes de usar na consulta.
              </GumroadText>
            </Flex>
          </>
        )}
      </div>
    </div>
  );
};

export default ConsultationBriefModal;
