import React, { useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';
import { colors, shadows, radii, fonts, spacing, zIndex } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import GumroadHeading from '../design-system/GumroadHeading';
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
  maxWidth: '440px',
  maxHeight: '90vh',
  overflowY: 'auto',
  padding: spacing.xl,
};

const CreateReminderModal: React.FC<CreateReminderModalProps> = ({ isOpen, onClose, childId, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

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
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div style={cardStyle}>
        <Flex justify="between" align="center" mb="4">
          <GumroadHeading level="title-md" as="h3">Novo lembrete</GumroadHeading>
          <button
            onClick={handleClose}
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
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="3">
            <div>
              <label style={labelStyle}>
                Título <span style={{ color: colors['brand-salmon'] }}>*</span>
              </label>
              <input
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
              <label style={labelStyle}>
                Data <span style={{ color: colors['brand-salmon'] }}>*</span>
              </label>
              <input
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>
                Observações
                <span style={{ fontWeight: 400, opacity: 0.6, marginLeft: '6px' }}>
                  ({notes.length}/500)
                </span>
              </label>
              <textarea
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
      </div>
    </div>
  );
};

export default CreateReminderModal;
