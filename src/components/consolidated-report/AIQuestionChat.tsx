import React, { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DictateButton from '../design-system/DictateButton';
import { Box, Flex } from '@radix-ui/themes';
import { ChatBubbleIcon, InfoCircledIcon, PaperPlaneIcon } from '@radix-ui/react-icons';
import { aiQuestionApi, AIRateLimitError } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';
import { colors, spacing, radii, shadows, fonts } from '../../theme/tokens';
import GumroadHeading, { GumroadText } from '../design-system/GumroadHeading';

interface Props {
  childId: string;
  periodDays?: number;
}

interface ChatMessage {
  id: string;
  question: string;
  answer: string | null;
  error: string | null;
  loading: boolean;
}

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

const AIQuestionChat: React.FC<Props> = ({ childId, periodDays = 90 }) => {
  const { t } = useTranslation();
  const inputId = useId();
  const { getToken } = useAuthContext();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const retrySeconds = useCountdown(retryAt);

  useEffect(() => {
    if (retryAt && retrySeconds === 0) setRetryAt(null);
  }, [retryAt, retrySeconds]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || sending || retrySeconds > 0) return;

    const id = `${Date.now()}`;
    setMessages((prev) => [...prev, { id, question: trimmed, answer: null, error: null, loading: true }]);
    setQuestion('');
    setSending(true);
    try {
      const token = await getToken();
      const { answer } = await aiQuestionApi.ask(token, { childId, question: trimmed, periodDays });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, answer, loading: false } : m)));
    } catch (err) {
      if (err instanceof AIRateLimitError) {
        if (err.info.retryAfterSeconds) setRetryAt(Date.now() + err.info.retryAfterSeconds * 1000);
        setMessages((prev) => prev.map((m) => (m.id === id ? {
          ...m,
          loading: false,
          error: err.info.retryAfterSeconds
            ? t('cConsolidated.chat.rateLimitSeconds', { seconds: err.info.retryAfterSeconds })
            : t('cConsolidated.chat.rateLimitHour'),
        } : m)));
      } else {
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, loading: false, error: t('cConsolidated.chat.error') } : m)));
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <Box>
      <Flex align="center" gap="2" mb="2">
        <ChatBubbleIcon aria-hidden="true" />
        <GumroadHeading level="title-lg" as="h2">{t('cConsolidated.chat.title')}</GumroadHeading>
      </Flex>
      <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginBottom: spacing.md }}>
        {t('cConsolidated.chat.intro')}
      </GumroadText>

      {messages.length > 0 && (
        <Flex direction="column" gap="3" mb="4" role="log" aria-live="polite" aria-label={t('cConsolidated.chat.logAria')}>
          {messages.map((m) => (
            <Flex key={m.id} direction="column" gap="2">
              <Box
                style={{
                  alignSelf: 'flex-end',
                  maxWidth: '85%',
                  backgroundColor: colors.ink,
                  color: colors.canvas,
                  borderRadius: `${radii.lg} ${radii.lg} ${radii.xs} ${radii.lg}`,
                  padding: '10px 16px',
                  fontFamily: fonts.body,
                  fontSize: '14px',
                }}
              >
                {m.question}
              </Box>
              <Box
                style={{
                  alignSelf: 'flex-start',
                  maxWidth: '85%',
                  backgroundColor: colors.surface,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: shadows['card-sm'],
                  borderRadius: `${radii.lg} ${radii.lg} ${radii.lg} ${radii.xs}`,
                  padding: '10px 16px',
                  fontFamily: fonts.body,
                  fontSize: '14px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.loading ? t('cConsolidated.chat.thinking') : m.error ? <span style={{ color: colors['brand-salmon'] }}>{m.error}</span> : m.answer}
              </Box>
            </Flex>
          ))}
        </Flex>
      )}

      <form onSubmit={handleAsk}>
        <Flex gap="2">
          <label htmlFor={inputId} className="sr-only">{t('cConsolidated.chat.inputLabel')}</label>
          <input
            id={inputId}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={retrySeconds > 0 ? t('cConsolidated.chat.wait', { seconds: retrySeconds }) : t('cConsolidated.chat.placeholder')}
            maxLength={500}
            disabled={sending || retrySeconds > 0}
            style={{
              flex: 1,
              height: '44px',
              padding: '0 14px',
              border: `2px solid ${colors.ink}`,
              borderRadius: radii.pill,
              fontFamily: fonts.body,
              fontSize: '14px',
              boxShadow: shadows.input,
            }}
          />
          <button
            type="submit"
            disabled={sending || retrySeconds > 0 || !question.trim()}
            aria-label={t('cConsolidated.chat.send')}
            style={{
              width: '44px',
              height: '44px',
              flexShrink: 0,
              borderRadius: radii.full,
              border: `2px solid ${colors.ink}`,
              backgroundColor: colors['brand-cyan'],
              cursor: sending || retrySeconds > 0 ? 'not-allowed' : 'pointer',
              opacity: sending || retrySeconds > 0 || !question.trim() ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PaperPlaneIcon aria-hidden="true" />
          </button>
        </Flex>
        <Flex justify="end" mt="2">
          {/* Perguntar em voz alta costuma ser mais natural que digitar uma
              pergunta longa; o texto é acrescentado para poder ser revisado
              antes de enviar. */}
          <DictateButton
            onText={(text) => setQuestion((prev) => (prev ? `${prev} ${text}` : text).slice(0, 500))}
            fieldLabel={t('cConsolidated.chat.fieldLabel')}
          />
        </Flex>
      </form>

      <Flex align="center" gap="2" mt="3" style={{ opacity: 0.7 }}>
        <InfoCircledIcon aria-hidden="true" />
        <GumroadText level="caption" as="span">
          {t('cConsolidated.chat.disclaimer')}
        </GumroadText>
      </Flex>
    </Box>
  );
};

export default AIQuestionChat;
