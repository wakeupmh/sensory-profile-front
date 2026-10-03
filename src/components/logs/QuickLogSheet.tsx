import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from '@radix-ui/themes';
import { colors, shadows, radii, fonts, spacing } from '../../theme/tokens';
import GumroadModal from '../design-system/GumroadModal';
import { useToast } from '../../context/ToastContext';
import DictateButton from '../design-system/DictateButton';
import LogTypeSelector from './LogTypeSelector';
import AbcLogForm from './AbcLogForm';
import MoodLogForm from './MoodLogForm';
import SleepLogForm from './SleepLogForm';
import FoodLogForm from './FoodLogForm';
import ToiletingLogForm from './ToiletingLogForm';
import type { LogType, LogData, CreateLogPayload } from '../../types/logs';

interface QuickLogSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateLogPayload, photo?: File | null) => Promise<void>;
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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  // Espelho em ref para que a limpeza no desmonte alcance a URL atual sem
  // precisar dela nas dependências do efeito.
  const photoPreviewUrlRef = useRef<string | null>(null);
  const toast = useToast();
  const { t } = useTranslation();

  /**
   * Toda troca da pré-visualização passa por aqui. Uma URL de blob não é
   * coletada pelo garbage collector: ela só some com `revokeObjectURL` ou com
   * o descarregamento do documento — que num PWA instalado pode não acontecer
   * por dias. Uma foto de celular são 2-5 MB, e salvar um registro e sair da
   * tela deixava isso retido para sempre, acumulando a cada registro.
   */
  const setPhotoPreview = (url: string | null) => {
    if (photoPreviewUrlRef.current) URL.revokeObjectURL(photoPreviewUrlRef.current);
    photoPreviewUrlRef.current = url;
    setPhotoPreviewUrl(url);
  };

  const handlePhotoSelect = (file: File | null) => {
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
    setPhotoFile(file);
  };

  // Desmonte: o QuickLogSheet é montado pela LogsPage o tempo todo, então sem
  // isto a última pré-visualização sobrevive à navegação para fora da tela.
  useEffect(() => () => {
    if (photoPreviewUrlRef.current) URL.revokeObjectURL(photoPreviewUrlRef.current);
    photoPreviewUrlRef.current = null;
  }, []);

  const appendDictation = (text: string) =>
    setNotes((prev) => (prev ? `${prev} ${text}` : text).slice(0, 200));

  // Reinicia o formulário a cada abertura (foco/trap/Escape são do GumroadModal)
  useEffect(() => {
    if (!isOpen) {
      // Fechar conta como descartar: o caminho de sucesso chama onClose(), e
      // antes ele saía por aqui sem liberar nada.
      setPhotoPreview(null);
      return;
    }
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setOccurredAt(local);
    setStep(defaultLogType ? 'form' : 'type');
    setSelectedType(defaultLogType ?? null);
    setNotes('');
    setError(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, defaultLogType]);

  const handleTypeSelect = (type: LogType) => {
    setSelectedType(type);
    setStep('form');
  };

  const handleDataSubmit = async (data: LogData) => {
    if (!selectedType) return;
    const when = new Date(occurredAt);
    if (Number.isNaN(when.getTime())) {
      setError(t('p2Logs.quick.invalidDate'));
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onSubmit({
        childId,
        logType: selectedType,
        occurredAt: when.toISOString(),
        data,
        notes: notes.trim() || null,
      }, photoFile);
      toast.success(t('p2Logs.quick.saved'));
      onClose();
    } catch {
      setError(t('p2Logs.quick.saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GumroadModal
      open={isOpen}
      onClose={onClose}
      title={step === 'form' && selectedType ? t(`p2Logs.types.${selectedType}`) : t('p2Logs.quick.title')}
    >
        <Box mb="4">
          <label
            htmlFor="quicklog-data-hora"
            style={{
              display: 'block',
              fontFamily: fonts.display,
              fontSize: '13px',
              fontWeight: 600,
              color: colors.ink,
              marginBottom: '6px',
            }}
          >
            {t('p2Logs.quick.dateTime')} <span style={{ color: colors.error }} aria-hidden="true">*</span>
          </label>
          <input
            id="quicklog-data-hora"
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
              <Flex align="center" justify="between" mb="1">
                <label
                  htmlFor="quicklog-observacoes"
                  style={{
                    display: 'block',
                    fontFamily: fonts.display,
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.ink,
                  }}
                >
                  {t('p2Logs.quick.notes')}
                </label>
                <DictateButton onText={appendDictation} fieldLabel={t('p2Logs.quick.notesField')} />
              </Flex>
              <textarea
                id="quicklog-observacoes"
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 200))}
                maxLength={200}
                rows={2}
                placeholder={t('p2Logs.quick.notesPlaceholder')}
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
                }}
              />
              <div style={{ fontFamily: fonts.display, fontSize: '11px', color: colors['ink-muted'], textAlign: 'right', marginTop: '4px' }}>
                {notes.length}/200
              </div>
            </Box>

            <Box mt="3">
              <div
                style={{
                  display: 'block',
                  fontFamily: fonts.display,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.ink,
                  marginBottom: '6px',
                }}
              >
                {t('p2Logs.quick.photo')}
              </div>
              {photoPreviewUrl ? (
                <Flex align="center" gap="3">
                  <img
                    src={photoPreviewUrl}
                    alt={t('p2Logs.quick.photoPreview')}
                    style={{
                      width: '64px',
                      height: '64px',
                      objectFit: 'cover',
                      borderRadius: radii.md,
                      border: `2px solid ${colors.ink}`,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handlePhotoSelect(null)}
                    className="press-in"
                    style={{
                      fontFamily: fonts.display,
                      fontSize: '13px',
                      fontWeight: 600,
                      color: colors.ink,
                      background: colors.surface,
                      border: `2px solid ${colors.ink}`,
                      borderRadius: radii.md,
                      padding: '6px 12px',
                      cursor: 'pointer',
                    }}
                  >
                    {t('p2Logs.quick.removePhoto')}
                  </button>
                </Flex>
              ) : (
                <label
                  className="press-in"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: fonts.display,
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.ink,
                    background: colors.surface,
                    border: `2px solid ${colors.ink}`,
                    borderRadius: radii.md,
                    padding: '8px 14px',
                    cursor: 'pointer',
                  }}
                >
                  <span aria-hidden="true">📷</span>
                  {t('p2Logs.quick.addPhoto')}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoSelect(e.target.files?.[0] ?? null)}
                    style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
                  />
                </label>
              )}
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
              {t('p2Logs.quick.back')}
            </button>
          </Box>
        )}

        {error && (
          <Box
            mt="3"
            role="alert"
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
