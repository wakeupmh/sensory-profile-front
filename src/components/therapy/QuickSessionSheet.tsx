import React, { useState, useEffect } from 'react';
import { Flex } from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';
import { colors, shadows, radii, fonts, spacing } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import TherapyTypeSelector from './TherapyTypeSelector';
import type { TherapyType, Therapist, CreateSessionPayload } from '../../types/therapy';

interface QuickSessionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSessionPayload) => Promise<void>;
  childId: string;
  therapists: Therapist[];
  defaultTherapyType?: TherapyType;
}

const THERAPY_TYPE_LABELS: Record<TherapyType, string> = {
  aba: 'ABA',
  ot: 'OT',
  fonoaudiologia: 'Fonoaudiologia',
  psicologia: 'Psicologia',
  fisioterapia: 'Fisioterapia',
};

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

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '44px',
  padding: '0 12px',
  border: `2px solid ${colors.ink}`,
  borderRadius: radii.md,
  fontFamily: fonts.display,
  fontSize: '14px',
  color: colors.ink,
  backgroundColor: 'transparent',
  boxSizing: 'border-box',
  boxShadow: shadows.input,
};

const labelStyle: React.CSSProperties = {
  fontFamily: fonts.display,
  fontSize: '13px',
  fontWeight: 600,
  color: colors.ink,
  marginBottom: '6px',
  display: 'block',
};

const QuickSessionSheet: React.FC<QuickSessionSheetProps> = ({
  isOpen,
  onClose,
  onSubmit,
  childId,
  therapists,
  defaultTherapyType,
}) => {
  const [step, setStep] = useState<'type' | 'form'>('type');
  const [selectedType, setSelectedType] = useState<TherapyType | null>(null);
  const [occurredAt, setOccurredAt] = useState('');
  const [therapistId, setTherapistId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setOccurredAt(local);
      setStep(defaultTherapyType ? 'form' : 'type');
      setSelectedType(defaultTherapyType ?? null);
      setTherapistId('');
      setDurationMinutes('');
      setNotes('');
      setError(null);
    }
  }, [isOpen, defaultTherapyType]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async () => {
    if (!selectedType) return;
    setIsLoading(true);
    setError(null);
    try {
      const dur = durationMinutes ? parseInt(durationMinutes, 10) : null;
      await onSubmit({
        childId,
        therapistId: therapistId || null,
        therapyType: selectedType,
        occurredAt: new Date(occurredAt).toISOString(),
        durationMinutes: dur && !isNaN(dur) ? dur : null,
        notes: notes.trim() || null,
      });
      onClose();
    } catch {
      setError('Erro ao salvar sessão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const title = step === 'form' && selectedType
    ? THERAPY_TYPE_LABELS[selectedType]
    : 'Nova Sessão';

  return (
    <div
      style={overlayStyle}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={sheetStyle}>
        {/* Header */}
        <Flex justify="between" align="center" mb="4">
          <span style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '18px', color: colors.ink }}>
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              border: `2px solid ${colors.ink}`,
              borderRadius: radii.md,
              backgroundColor: colors.canvas,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Cross2Icon />
          </button>
        </Flex>

        {/* DateTime Picker (shown on both steps) */}
        <div style={{ marginBottom: spacing.md }}>
          <label style={labelStyle}>Data e hora</label>
          <input
            type="datetime-local"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            style={inputStyle}
          />
        </div>

        {step === 'type' && (
          <TherapyTypeSelector
            selected={selectedType}
            onSelect={(t) => { setSelectedType(t); setStep('form'); }}
          />
        )}

        {step === 'form' && (
          <Flex direction="column" gap="3">
            {/* Therapist select */}
            <div>
              <label style={labelStyle}>Terapeuta</label>
              <select
                value={therapistId}
                onChange={(e) => setTherapistId(e.target.value)}
                style={{
                  height: '44px',
                  padding: '0 12px',
                  border: `2px solid ${colors.ink}`,
                  borderRadius: radii.md,
                  fontFamily: fonts.display,
                  fontSize: '14px',
                  color: colors.ink,
                  backgroundColor: colors.surface,
                  width: '100%',
                  boxSizing: 'border-box',
                  boxShadow: shadows['card-sm'],
                }}
              >
                <option value="">Sem terapeuta</option>
                {therapists.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label style={labelStyle}>Duração (minutos)</label>
              <input
                type="number"
                min="1"
                max="480"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="Ex: 50"
                style={inputStyle}
              />
            </div>

            {/* Notes */}
            <div>
              <label style={labelStyle}>Observações</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Observações sobre a sessão..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `2px solid ${colors.ink}`,
                  borderRadius: radii.md,
                  fontFamily: fonts.display,
                  fontSize: '14px',
                  color: colors.ink,
                  backgroundColor: 'transparent',
                  boxSizing: 'border-box',
                  boxShadow: shadows.input,
                  resize: 'vertical',
                }}
              />
              <div style={{ fontFamily: fonts.body, fontSize: '11px', color: colors.ink, opacity: 0.5, textAlign: 'right' }}>
                {notes.length}/500
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '10px 14px',
                backgroundColor: colors['brand-salmon'],
                border: `2px solid ${colors.ink}`,
                borderRadius: radii.md,
                fontFamily: fonts.display,
                fontSize: '13px',
                color: colors.ink,
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <GumroadButton
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={isLoading}
              style={{ width: '100%' }}
            >
              {isLoading ? 'Salvando...' : 'Salvar Sessão'}
            </GumroadButton>

            {/* Back link */}
            <button
              onClick={() => setStep('type')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: fonts.display,
                fontSize: '13px',
                color: colors.ink,
                opacity: 0.7,
                textAlign: 'center',
                padding: '4px',
              }}
            >
              ← Voltar
            </button>
          </Flex>
        )}
      </div>
    </div>
  );
};

export default QuickSessionSheet;
