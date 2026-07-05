import { useState, useEffect } from 'react';
import { Box } from '@radix-ui/themes';
import { colors, shadows, radii, fonts, spacing } from '../../theme/tokens';
import GumroadModal from '../design-system/GumroadModal';
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

  // Reinicia o formulário a cada abertura (foco/trap/Escape são do GumroadModal)
  useEffect(() => {
    if (!isOpen) return;
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setOccurredAt(local);
    setStep(defaultLogType ? 'form' : 'type');
    setSelectedType(defaultLogType ?? null);
    setNotes('');
    setError(null);
  }, [isOpen, defaultLogType]);

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

  return (
    <GumroadModal
      open={isOpen}
      onClose={onClose}
      title={step === 'form' && selectedType ? LOG_TYPE_LABELS[selectedType] : 'Registrar'}
    >
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
    </GumroadModal>
  );
}
