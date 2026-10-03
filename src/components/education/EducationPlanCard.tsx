import React, { useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
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

function formatDate(isoDate: string, lang: string): string {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString(lang, {
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
  const { t, i18n } = useTranslation();
  const [confirming, setConfirming] = useState(false);

  const planTypeColors = EDUCATION_PLAN_TYPE_COLORS[plan.planType];

  const goalsPreview = plan.goals
    ? plan.goals.length > 100
      ? plan.goals.slice(0, 100) + '...'
      : plan.goals
    : null;

  if (confirming) {
    return (
      <GumroadCard color="salmon" padding="md" shadow="md" role="alert">
        <GumroadText level="body-md">
          {t('cEducation.removePlanConfirm', { school: plan.schoolName, year: plan.academicYear })}
        </GumroadText>
        <Flex gap="2" mt="2">
          <GumroadButton
            variant="primary"
            size="sm"
            onClick={() => onDelete(plan.id)}
          >
            {t('cEducation.confirm')}
          </GumroadButton>
          <GumroadButton
            variant="ghost"
            size="sm"
            onClick={() => setConfirming(false)}
          >
            {t('cEducation.cancel')}
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
              {t(`cEducation.planType.${plan.planType}`, { defaultValue: EDUCATION_PLAN_TYPE_LABELS[plan.planType] })}
            </span>
          </Flex>

          <Flex gap="3" wrap="wrap" style={{ marginTop: '6px' }}>
            <GumroadText level="body-sm" style={{ opacity: 0.7 }}>
              <strong>{t('cEducation.start')}:</strong> {formatDate(plan.startDate, i18n.language)}
            </GumroadText>
            {plan.reviewDate && (
              <GumroadText level="body-sm" style={{ opacity: 0.7 }}>
                <strong>{t('cEducation.review')}:</strong> {formatDate(plan.reviewDate, i18n.language)}
              </GumroadText>
            )}
            {plan.endDate && (
              <GumroadText level="body-sm" style={{ opacity: 0.7 }}>
                <strong>{t('cEducation.end')}:</strong> {formatDate(plan.endDate, i18n.language)}
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
            type="button"
            style={iconBtnStyle}
            onClick={() => onEdit(plan)}
            aria-label={t('cEducation.editPlanAria', { school: plan.schoolName })}
          >
            <Pencil2Icon aria-hidden="true" />
          </button>
          <button
            type="button"
            style={iconBtnStyle}
            onClick={() => setConfirming(true)}
            aria-label={t('cEducation.removePlanAria', { school: plan.schoolName })}
          >
            <TrashIcon aria-hidden="true" />
          </button>
        </Flex>
      </Flex>
    </GumroadCard>
  );
};

export default EducationPlanCard;
