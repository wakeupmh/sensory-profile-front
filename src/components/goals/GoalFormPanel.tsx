import React, { useState } from 'react';
import GumroadModal from '../design-system/GumroadModal';
import GoalForm from './GoalForm';
import type { Goal, CreateGoalPayload, UpdateGoalPayload } from '../../types/goals';

interface GoalFormPanelProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  goal?: Goal | null;
  onSubmit: (payload: CreateGoalPayload | UpdateGoalPayload) => Promise<void>;
}

const GoalFormPanel: React.FC<GoalFormPanelProps> = ({ isOpen, onClose, childId, goal, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (payload: CreateGoalPayload | UpdateGoalPayload) => {
    setIsLoading(true);
    try {
      await onSubmit(payload);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GumroadModal open={isOpen} onClose={onClose} title={goal ? 'Editar Meta' : 'Nova Meta'}>
      <GoalForm childId={childId} initialValues={goal ?? {}} onSubmit={handleSubmit} onCancel={onClose} loading={isLoading} />
    </GumroadModal>
  );
};

export default GoalFormPanel;
