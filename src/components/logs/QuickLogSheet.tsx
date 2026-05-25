import React, { useState, useEffect, useRef } from 'react';
import { Flex, Box } from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';
import { colors, shadows, radii, fonts, spacing } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import GumroadHeading from '../design-system/GumroadHeading';
import LogTypeSelector from './LogTypeSelector';
import AbcLogForm from './AbcLogForm';
import MoodLogForm from './MoodLogForm';
import SleepLogForm from './SleepLogForm';
import FoodLogForm from './FoodLogForm';
import ToiletingLogForm from './ToiletingLogForm';
import type { LogType, LogData, CreateLogPayload } from '../../types/logs';

const LOG_TYPE_LABELS: Record<LogType, string> = {
  abc: 'ABC (Comportamento)',
  mood: 'Humor / Regulação',
  sleep: 'Sono',
  food: 'Alimentação',
  toileting: 'Banheiro',
};

interface QuickLogSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateLogPayload) => Promise<void>;
  childId: string;
  defaultLogType?: LogType;
}

export default function QuickLogSheet({
  isOpen,
  onClose,
  onSubmit,
  childId,
  defaultLogType,
}: QuickLogSheetProps) {
  const [step, setStep] = useState<'type' | 'form'>('type');
  const [selectedType, setSelectedType] = useState<LogType | null>(defaultLogType ?? null);
  const [occurredAt, setOccurredAt] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;
      const now = new Date();
      const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setOccurredAt(local);
      setStep(defaultLogType ? 'form' : 'type');
      setSelectedType(defaultLogType ?? null);
      setNotes('');
      setError(null);
    } else if (previousFocus.current) {
      previousFocus.current.focus();
      previousFocus.current = null;
    }
  }, [isOpen, defaultLogType]);

  useEffect(() => {
    if (!isOpen || !sheetRef.current) return;

    const sheet = sheetRef.current;

    // Auto-focus first focusable element
    const focusables = sheet.querySelectorAll<HTMLElement>(
      'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length > 0) focusables[0].focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;
      const focusableEls = sheet.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
      );
      if (focusableEls.length === 0) return;
      const first = focusableEls[0];
      const last = focusableEls[focusableEls.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleTypeSelect = (type: LogType) => {
    setSelectedType(type);
    setStep('form');
  };

  const handleDataSubmit = async (data: LogData) => {
    if (!selectedType) return;
    setIsLoading(true);
    setError(null);
    try {
      await onSubmit({
        childId,
        logType: selectedType,
        occurredAt: new Date(occurredAt).toISOString(),
        data,
        notes: notes.trim() || null,
      });
      onClose();
    } catch {
      setError('Erro ao salvar registro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(10,10,26,0.5)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  };

  const sheetStyle: React.CSSProperties = {
    backgroundColor: colors.canvas,
    border: `2px solid ${colors.ink}`,
    borderBottom: 'none',
    borderRadius: `${radii.xl} ${radii.xl} 0 0`,
    boxShadow: shadows['card-hover'],
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: spacing.xl,
    paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
  };

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={sheetRef} style={sheetStyle}>
        <Flex justify="between" align="center" mb="4">
          <GumroadHeading level="title-lg" as="h2">
            {step === 'form' && selectedType ? LOG_TYPE_LABELS[selectedType] : 'Registrar'}
          </GumroadHeading>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: `2px solid ${colors.ink}`,
              borderRadius: radii.md,
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: shadows.button,
            }}
          >
            <Cross2Icon width={16} height={16} />
          </button>
        </Flex>

        <Box mb="4">
          <label
            style={{
              display: 'block',
              fontFamily: fonts.display,
              fontSize: '13px',
              fontWeight: 600,
              color: colors.ink,
              marginBottom: '6px',
            }}
          >
            Data e hora <span style={{ color: colors['brand-salmon'] }}>*</span>
          </label>
          <input
            type="datetime-local"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            style={{
              width: '100%',
              height: '44px',
              padding: '0 12px',
              backgroundColor: colors.surface,
              border: `2px solid ${colors.ink}`,
              borderRadius: radii.md,
              fontFamily: fonts.display,
              fontSize: '14px',
              color: colors.ink,
              boxSizing: 'border-box',
              boxShadow: shadows['card-sm'],
            }}
          />
        </Box>

        {step === 'type' && (
          <LogTypeSelector selected={selectedType} onSelect={handleTypeSelect} />
        )}

        {step === 'form' && selectedType && (
          <>
            {selectedType === 'abc' && <AbcLogForm onSubmit={handleDataSubmit} isLoading={isLoading} />}
            {selectedType === 'mood' && <MoodLogForm onSubmit={handleDataSubmit} isLoading={isLoading} />}
            {selectedType === 'sleep' && <SleepLogForm onSubmit={handleDataSubmit} isLoading={isLoading} />}
            {selectedType === 'food' && <FoodLogForm onSubmit={handleDataSubmit} isLoading={isLoading} />}
            {selectedType === 'toileting' && <ToiletingLogForm onSubmit={handleDataSubmit} isLoading={isLoading} />}
            <Box mt="3">
              <label
                style={{
                  display: 'block',
                  fontFamily: fonts.display,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.ink,
                  marginBottom: '6px',
                }}
              >
                Observações
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 200))}
                maxLength={200}
                rows={2}
                placeholder="Anotações adicionais (opcional)..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'transparent',
                  border: `2px solid ${colors.ink}`,
                  borderRadius: radii.md,
                  fontFamily: fonts.display,
                  fontSize: '14px',
                  color: colors.ink,
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  boxShadow: shadows.input,
                  outline: 'none',
                }}
              />
              <div style={{ fontFamily: fonts.display, fontSize: '11px', color: colors.ink, opacity: 0.5, textAlign: 'right', marginTop: '4px' }}>
                {notes.length}/200
              </div>
            </Box>
          </>
        )}

        {step === 'form' && (
          <Box mt="3">
            <button
              type="button"
              onClick={() => setStep('type')}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: fonts.display,
                fontSize: '13px',
                fontWeight: 600,
                color: colors.ink,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              ← Voltar
            </button>
          </Box>
        )}

        {error && (
          <Box
            mt="3"
            style={{
              padding: `${spacing.sm} ${spacing.md}`,
              backgroundColor: colors['brand-salmon'],
              border: `2px solid ${colors.ink}`,
              borderRadius: radii.md,
            }}
          >
            <p style={{ fontFamily: fonts.display, fontSize: '13px', color: colors.ink, margin: 0 }}>
              {error}
            </p>
          </Box>
        )}
      </div>
    </div>
  );
}
