import React, { memo } from 'react';
import { Table, Box } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { SensoryItem, FrequencyResponse } from './types';
import FastRadioCards from './FastRadioCards';
import { colors, typography } from '../../theme/tokens';
import type { ResponseScale } from '../../instruments/types';

interface SensoryItemsTableProps {
  items: SensoryItem[];
  onResponseChange: (itemId: number, response: FrequencyResponse) => void;
  disabled?: boolean;
  scale?: ResponseScale;
  allowedValues?: string[];
}

const frequencyOptionKeys = [
  ['não se aplica', 'notApplicable'],
  ['quase nunca', 'almostNever'],
  ['ocasionalmente', 'occasionally'],
  ['metade do tempo', 'halfTheTime'],
  ['frequentemente', 'frequently'],
  ['quase sempre', 'almostAlways'],
] as const;

// Orientação opcional do item (ex.: roteiro de sondagem), legível em telas estreitas
const GuidanceBlock: React.FC<{ lines: string[]; title: string }> = ({ lines, title }) => (
  <div
    style={{
      marginTop: '8px',
      padding: '12px 14px',
      border: `2px solid ${colors.ink}`,
      borderRadius: '8px',
      backgroundColor: colors['surface-cream'],
      color: colors.ink,
      fontFamily: typography['body-sm'].font,
      fontSize: '14px',
      lineHeight: 1.55,
    }}
  >
    <div style={{ fontWeight: 700, marginBottom: '4px', fontFamily: typography['title-sm'].font }}>{title}</div>
    {lines.map((line, i) => (
      <p key={i} style={{ margin: i === 0 ? 0 : '6px 0 0', fontWeight: i === 0 ? 600 : 400 }}>
        {line}
      </p>
    ))}
  </div>
);

const descriptionStyle: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '1.6',
  fontFamily: typography['body-md'].font,
  color: colors.ink,
};

const SensoryItemsTable: React.FC<SensoryItemsTableProps> = memo(({ items, onResponseChange, disabled, scale, allowedValues }) => {
  const { t } = useTranslation();
  const frequencyOptions = frequencyOptionKeys.map(([value, key]) => ({
    value,
    label: t(`assessmentForm.frequency.${key}`),
  }));
  // Escala sim/não ou passou/falhou não é de frequência
  const isBinaryScale = (scale?.options.length ?? 0) > 0 && (scale?.options.length ?? 0) <= 2;
  const guidanceTitle = t('assessmentForm.guidanceTitle');
  return (
    <>
      {/* Mobile: card list */}
      <style>{`
        .sensory-table-desktop { display: none; }
        .sensory-cards-mobile { display: flex; flex-direction: column; gap: 16px; }

        @media (min-width: 768px) {
          .sensory-table-desktop { display: table; width: 100%; }
          .sensory-cards-mobile { display: none; }
        }
      `}</style>

      {/* Mobile cards */}
      <div className="sensory-cards-mobile">
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              border: `2px solid ${colors.ink}`,
              borderRadius: '12px',
              padding: '16px',
              backgroundColor: colors.surface,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{
                fontFamily: typography['title-sm'].font,
                fontWeight: 700,
                fontSize: '14px',
                color: colors.ink,
                minWidth: '24px',
                paddingTop: '2px',
              }}>
                {item.id}.
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={descriptionStyle}>{item.description}</span>
                {item.guidance && item.guidance.length > 0 && (
                  <GuidanceBlock lines={item.guidance} title={guidanceTitle} />
                )}
              </div>
            </div>
            <FastRadioCards
              name={`item-${item.id}`}
              ariaLabel={`${t('assessmentForm.item')} ${item.id}`}
              options={frequencyOptions}
              scale={scale}
              allowedValues={allowedValues}
              initialValue={item.response || ""}
              onValueChange={(_, value) => onResponseChange(item.id, value as FrequencyResponse)}
              disabled={disabled}
              required={true}
            />
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <Table.Root variant="surface" className="sensory-table-desktop">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell width="5%">{t('assessmentForm.item')}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width={isBinaryScale ? '55%' : '35%'}>{t('assessmentForm.description')}</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width={isBinaryScale ? '40%' : '60%'} align="center">
              {isBinaryScale ? t('assessmentForm.answer') : t('assessmentForm.frequency.label')}{' '}
              <span aria-hidden="true" style={{ color: colors.error }}>*</span>
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map((item) => (
            <Table.Row key={item.id}>
              <Table.Cell>{item.id}</Table.Cell>
              <Table.Cell>
                <span style={descriptionStyle}>{item.description}</span>
                {item.guidance && item.guidance.length > 0 && (
                  <GuidanceBlock lines={item.guidance} title={guidanceTitle} />
                )}
              </Table.Cell>
              <Table.Cell>
                <Box>
                  <FastRadioCards
                    name={`item-${item.id}-desktop`}
                    ariaLabel={`${t('assessmentForm.item')} ${item.id}`}
                    options={frequencyOptions}
                    scale={scale}
                    allowedValues={allowedValues}
                    initialValue={item.response || ""}
                    onValueChange={(_, value) => onResponseChange(item.id, value as FrequencyResponse)}
                    disabled={disabled}
                    required={true}
                  />
                </Box>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  );
});

export default SensoryItemsTable;
