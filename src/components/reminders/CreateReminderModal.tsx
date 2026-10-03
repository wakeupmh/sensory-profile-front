import React, { useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import { colors, shadows, radii, fonts } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import GumroadModal from '../design-system/GumroadModal';
import type { CreateReminderPayload } from '../../types/reminders';

interface CreateReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  onSubmit: (payload: CreateReminderPayload) => Promise<void>;
}

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

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  height: 'auto',
  padding: '10px 12px',
  resize: 'vertical',
  minHeight: '72px',
};

const labelStyle: React.CSSProperties = {
  fontFamily: fonts.display,
  fontSize: '13px',
  fontWeight: 600,
  color: colors.ink,
  marginBottom: '6px',
  display: 'block',
};

const CreateReminderModal: React.FC<CreateReminderModalProps> = ({ isOpen, onClose, childId, onSubmit }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTitle('');
    setDueAt('');
    setNotes('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueAt) return;
    setSubmitting(true);
    try {
      await onSubmit({
        childId,
        title: title.trim(),
        dueAt: new Date(dueAt).toISOString(),
        notes: notes.trim() || undefined,
      });
      reset();
      onClose();
    } catch {
      toast.error(t('p2Reminders.modal.saveError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GumroadModal
      open={isOpen}
      onClose={handleClose}
      title={t('p2Reminders.modal.title')}
      variant="center"
      maxWidth="440px"
    >
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="3">
            <div>
              <label style={labelStyle} htmlFor="reminder-titulo">
                {t('p2Reminders.modal.titleField')} <span style={{ color: colors.error }} aria-hidden="true">*</span>
              </label>
              <input id="reminder-titulo"
                type="text"
                maxLength={255}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('p2Reminders.modal.titlePh')}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="reminder-data">
                {t('p2Reminders.modal.date')} <span style={{ color: colors.error }} aria-hidden="true">*</span>
              </label>
              <input id="reminder-data"
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="reminder-observacoes-500">
                {t('p2Reminders.modal.notes')}
                <span style={{ fontWeight: 400, color: colors['ink-muted'], marginLeft: '6px' }}>
                  ({notes.length}/500)
                </span>
              </label>
              <textarea id="reminder-observacoes-500"
                maxLength={500}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('p2Reminders.modal.notesPh')}
                style={textareaStyle}
              />
            </div>
            <Flex gap="2" mt="2">
              <GumroadButton variant="primary" size="md" type="submit" disabled={submitting || !title.trim() || !dueAt}>
                {submitting ? t('p2Reminders.modal.saving') : t('p2Reminders.modal.save')}
              </GumroadButton>
              <GumroadButton variant="secondary" size="md" type="button" onClick={handleClose}>
                {t('p2Reminders.modal.cancel')}
              </GumroadButton>
            </Flex>
          </Flex>
        </form>
    </GumroadModal>
  );
};

export default CreateReminderModal;
