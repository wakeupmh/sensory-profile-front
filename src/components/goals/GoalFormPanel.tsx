import React, { useState, useEffect } from 'react';
import { Flex } from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';
import { colors, shadows, radii, fonts, spacing, zIndex } from '../../theme/tokens';
import GoalForm from './GoalForm';
import type { Goal, CreateGoalPayload, UpdateGoalPayload } from '../../types/goals';

interface GoalFormPanelProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  goal?: Goal | null;
  onSubmit: (payload: CreateGoalPayload | UpdateGoalPayload) => Promise<void>;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(10,10,26,0.5)',
  zIndex: zIndex.modal,
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

const GoalFormPanel: React.FC<GoalFormPanelProps> = ({ isOpen, onClose, childId, goal, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (payload: CreateGoalPayload | UpdateGoalPayload) => {
    setIsLoading(true);
    try {
      await onSubmit(payload);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={sheetStyle}>
        <Flex justify="between" align="center" mb="4">
          <span style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '18px', color: colors.ink }}>
            {goal ? 'Editar Meta' : 'Nova Meta'}
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
        <GoalForm childId={childId} initialValues={goal ?? {}} onSubmit={handleSubmit} onCancel={onClose} loading={isLoading} />
      </div>
    </div>
  );
};

export default GoalFormPanel;
