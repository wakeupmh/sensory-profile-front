import React from 'react';
import { Flex } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { Pencil2Icon, TrashIcon } from '@radix-ui/react-icons';
import { colors, shadows, radii, fonts } from '../../theme/tokens';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
import type { DevelopmentalMilestone } from '../../types/development';
import {
  MILESTONE_STATUS_LABELS,
  MILESTONE_STATUS_COLORS,
  MILESTONE_CATEGORY_LABELS,
  MILESTONE_CATEGORY_COLORS,
} from '../../types/development';

interface MilestoneCardProps {
  milestone: DevelopmentalMilestone;
  onEdit: (m: DevelopmentalMilestone) => void;
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

const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, onEdit, onDelete }) => {
  const { t, i18n } = useTranslation();
  const statusColors = MILESTONE_STATUS_COLORS[milestone.status];
  const categoryColor = MILESTONE_CATEGORY_COLORS[milestone.category];

  const notesPreview = milestone.notes
    ? milestone.notes.length > 100
      ? milestone.notes.slice(0, 100) + '...'
      : milestone.notes
    : null;

  return (
    <GumroadCard color="white" padding="md" shadow="md">
      <Flex justify="between" align="start">
        <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 0 }}>
          <GumroadHeading level="title-md" style={{ fontWeight: 600, fontFamily: fonts.display }}>
            {milestone.title}
          </GumroadHeading>

          <Flex gap="2" wrap="wrap" style={{ marginTop: '4px' }}>
            {/* Status badge */}
            <span
              style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: '9999px',
                backgroundColor: statusColors.bg,
                color: statusColors.text,
                fontSize: '12px',
                fontFamily: fonts.display,
                fontWeight: 600,
                border: `1.5px solid ${colors.ink}`,
              }}
            >
              {t(`cDevelopment.milestoneStatus.${milestone.status}`, { defaultValue: MILESTONE_STATUS_LABELS[milestone.status] })}
            </span>

            {/* Category badge */}
            <span
              style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: '9999px',
                backgroundColor: categoryColor,
                color: colors.ink,
                fontSize: '12px',
                fontFamily: fonts.display,
                fontWeight: 600,
                border: `1.5px solid ${colors.ink}`,
              }}
            >
              {t(`cDevelopment.milestoneCategory.${milestone.category}`, { defaultValue: MILESTONE_CATEGORY_LABELS[milestone.category] })}
            </span>
          </Flex>

          {milestone.achievedDate && (
            <GumroadText level="body-sm" style={{ color: '#1A7A4A', marginTop: '4px' }}>
              {t('cDevelopment.achievedOn', { date: formatDate(milestone.achievedDate, i18n.language) })}
            </GumroadText>
          )}

          {milestone.targetDate && (
            <GumroadText level="body-sm" style={{ opacity: 0.6, marginTop: '2px' }}>
              {t('cDevelopment.targetOn', { date: formatDate(milestone.targetDate, i18n.language) })}
            </GumroadText>
          )}

          {notesPreview && (
            <GumroadText level="body-sm" style={{ opacity: 0.6, fontStyle: 'italic', marginTop: '4px' }}>
              {notesPreview}
            </GumroadText>
          )}
        </Flex>

        <Flex gap="2" style={{ marginLeft: '12px', flexShrink: 0 }}>
          <button
            type="button"
            style={iconBtnStyle}
            onClick={() => onEdit(milestone)}
            aria-label={t('cDevelopment.editMilestoneAria', { title: milestone.title })}
          >
            <Pencil2Icon aria-hidden="true" />
          </button>
          <button
            type="button"
            style={iconBtnStyle}
            onClick={() => onDelete(milestone.id)}
            aria-label={t('cDevelopment.removeMilestoneAria', { title: milestone.title })}
          >
            <TrashIcon aria-hidden="true" />
          </button>
        </Flex>
      </Flex>
    </GumroadCard>
  );
};

export default MilestoneCard;
