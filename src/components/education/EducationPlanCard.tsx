import React, { useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { Pencil2Icon, TrashIcon } from '@radix-ui/react-icons';
import { colors, shadows, radii, fonts } from '../../theme/tokens';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
import GumroadButton from '../design-system/GumroadButton';
import type { EducationPlan } from '../../types/education';
import {
  EDUCATION_PLAN_TYPE_LABELS,
  EDUCATION_PLAN_TYPE_COLORS,
} from '../../types/education';

interface EducationPlanCardProps {
  plan: EducationPlan;
  onEdit: (plan: EducationPlan) => void;
  onDelete: (id: string) => void;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const iconBtnStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  border: `2px solid ${colors.ink}`,
  borderRadius: radii.md,
  backgroundColor: colors.canvas,
  boxShadow: shadows['card-sm'],
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
};

const EducationPlanCard: React.FC<EducationPlanCardProps> = ({ plan, onEdit, onDelete }) => {
  const [confirming, setConfirming] = useState(false);

  const planTypeColors = EDUCATION_PLAN_TYPE_COLORS[plan.planType];

  const goalsPreview = plan.goals
    ? plan.goals.length > 100
      ? plan.goals.slice(0, 100) + '...'
      : plan.goals
    : null;

  if (confirming) {
    return (
      <GumroadCard color="salmon" padding="md" shadow="md">
        <GumroadText level="body-md">
          Remover plano "{plan.schoolName} — {plan.academicYear}"?
        </GumroadText>
        <Flex gap="2" mt="2">
          <GumroadButton
            variant="primary"
            size="sm"
            onClick={() => onDelete(plan.id)}
          >
            Confirmar
          </GumroadButton>
          <GumroadButton
            variant="ghost"
            size="sm"
            onClick={() => setConfirming(false)}
          >
            Cancelar
          </GumroadButton>
        </Flex>
      </GumroadCard>
    );
  }

  return (
    <GumroadCard color="white" padding="md" shadow="md">
      <Flex justify="between" align="start">
        <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 0 }}>
          <GumroadHeading level="title-md" style={{ fontWeight: 600, fontFamily: fonts.display }}>
            {plan.schoolName}
          </GumroadHeading>

          <Flex gap="2" wrap="wrap" style={{ marginTop: '4px' }}>
            {/* Academic year badge */}
            <span
              style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: '9999px',
                backgroundColor: colors['brand-yellow'],
                color: colors.ink,
                fontSize: '12px',
                fontFamily: fonts.display,
                fontWeight: 600,
                border: `1.5px solid ${colors.ink}`,
              }}
            >
              {plan.academicYear}
            </span>

            {/* Plan type badge */}
            <span
              style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: '9999px',
                backgroundColor: planTypeColors.bg,
                color: planTypeColors.text,
                fontSize: '12px',
                fontFamily: fonts.display,
                fontWeight: 600,
                border: `1.5px solid ${colors.ink}`,
              }}
            >
              {EDUCATION_PLAN_TYPE_LABELS[plan.planType]}
            </span>
          </Flex>

          <Flex gap="3" wrap="wrap" style={{ marginTop: '6px' }}>
            <GumroadText level="body-sm" style={{ opacity: 0.7 }}>
              <strong>Início:</strong> {formatDate(plan.startDate)}
            </GumroadText>
            {plan.reviewDate && (
              <GumroadText level="body-sm" style={{ opacity: 0.7 }}>
                <strong>Revisão:</strong> {formatDate(plan.reviewDate)}
              </GumroadText>
            )}
            {plan.endDate && (
              <GumroadText level="body-sm" style={{ opacity: 0.7 }}>
                <strong>Encerramento:</strong> {formatDate(plan.endDate)}
              </GumroadText>
            )}
          </Flex>

          {goalsPreview && (
            <GumroadText level="body-sm" style={{ opacity: 0.6, fontStyle: 'italic', marginTop: '4px' }}>
              {goalsPreview}
            </GumroadText>
          )}
        </Flex>

        <Flex gap="2" style={{ marginLeft: '12px', flexShrink: 0 }}>
          <button
            style={iconBtnStyle}
            onClick={() => onEdit(plan)}
            aria-label="Editar plano"
          >
            <Pencil2Icon />
          </button>
          <button
            style={iconBtnStyle}
            onClick={() => setConfirming(true)}
            aria-label="Remover plano"
          >
            <TrashIcon />
          </button>
        </Flex>
      </Flex>
    </GumroadCard>
  );
};

export default EducationPlanCard;
