import React from 'react';
import { Flex } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { Pencil2Icon, TrashIcon } from '@radix-ui/react-icons';
import { colors, shadows, radii, fonts } from '../../theme/tokens';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
import GumroadBadge from '../design-system/GumroadBadge';
import type { Comorbidity } from '../../types/medical';

interface ComorbidityCardProps {
  comorbidity: Comorbidity;
  onEdit: (c: Comorbidity) => void;
  onDelete: (id: string) => void;
}

function formatDate(isoDate: string, lang: string): string {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString(lang);
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

const ComorbidityCard: React.FC<ComorbidityCardProps> = ({ comorbidity, onEdit, onDelete }) => {
  const { t, i18n } = useTranslation();
  const notesPreview = comorbidity.notes
    ? comorbidity.notes.length > 60
      ? comorbidity.notes.slice(0, 60) + '…'
      : comorbidity.notes
    : null;

  return (
    <GumroadCard color="white" padding="md" shadow="md">
      <Flex justify="between" align="start">
        <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 0 }}>
          <Flex align="center" gap="2" style={{ flexWrap: 'wrap' }}>
            <GumroadHeading level="title-md" style={{ fontFamily: fonts.display }}>
              {comorbidity.conditionName}
            </GumroadHeading>
            {comorbidity.icdCode && (
              <GumroadBadge color="lavender">{comorbidity.icdCode}</GumroadBadge>
            )}
          </Flex>

          {(comorbidity.diagnosisDate || comorbidity.diagnosingDoctor) && (
            <GumroadText level="body-sm" style={{ opacity: 0.7 }}>
              {comorbidity.diagnosisDate && formatDate(comorbidity.diagnosisDate, i18n.language)}
              {comorbidity.diagnosisDate && comorbidity.diagnosingDoctor && ' · '}
              {comorbidity.diagnosingDoctor && t('p2Medical.doctorPrefix', { name: comorbidity.diagnosingDoctor })}
            </GumroadText>
          )}

          {notesPreview && (
            <GumroadText level="body-sm" style={{ opacity: 0.6, fontStyle: 'italic' }}>
              {notesPreview}
            </GumroadText>
          )}
        </Flex>

        <Flex gap="2" style={{ marginLeft: '12px', flexShrink: 0 }}>
          <button
            style={iconBtnStyle}
            onClick={() => onEdit(comorbidity)}
            type="button"
            aria-label={t('p2Medical.comorb.editAria')}
          >
            <Pencil2Icon />
          </button>
          <button
            style={iconBtnStyle}
            onClick={() => onDelete(comorbidity.id)}
            type="button"
            aria-label={t('p2Medical.comorb.removeAria')}
          >
            <TrashIcon />
          </button>
        </Flex>
      </Flex>
    </GumroadCard>
  );
};

export default ComorbidityCard;
