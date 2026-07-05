import React, { useState } from 'react';
import { Flex } from '@radix-ui/themes';
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GumroadModal
      open={isOpen}
      onClose={handleClose}
      title="Novo lembrete"
      variant="center"
      maxWidth="440px"
    >
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="3">
            <div>
              <label style={labelStyle} htmlFor="reminder-titulo">
                Título <span style={{ color: colors.error }} aria-hidden="true">*</span>
              </label>
              <input id="reminder-titulo"
                type="text"
                maxLength={255}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Levar exame para a fono"
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="reminder-data">
                Data <span style={{ color: colors.error }} aria-hidden="true">*</span>
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
                Observações
                <span style={{ fontWeight: 400, color: colors['ink-muted'], marginLeft: '6px' }}>
                  ({notes.length}/500)
                </span>
              </label>
              <textarea id="reminder-observacoes-500"
                maxLength={500}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalhes adicionais..."
                style={textareaStyle}
              />
            </div>
            <Flex gap="2" mt="2">
              <GumroadButton variant="primary" size="md" type="submit" disabled={submitting || !title.trim() || !dueAt}>
                {submitting ? 'Salvando...' : 'Salvar'}
              </GumroadButton>
              <GumroadButton variant="secondary" size="md" type="button" onClick={handleClose}>
                Cancelar
              </GumroadButton>
            </Flex>
          </Flex>
        </form>
    </GumroadModal>
  );
};

export default CreateReminderModal;
