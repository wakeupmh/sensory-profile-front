import React, { memo } from 'react';
import { Table, Box } from '@radix-ui/themes';
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

const frequencyOptions = [
  { value: "não se aplica", label: "Não se aplica" },
  { value: "quase nunca", label: "Quase Nunca" },
  { value: "ocasionalmente", label: "Ocasionalmente" },
  { value: "metade do tempo", label: "Metade do Tempo" },
  { value: "frequentemente", label: "Frequentemente" },
  { value: "quase sempre", label: "Quase Sempre" },
];

const descriptionStyle: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '1.6',
  fontFamily: typography['body-md'].font,
  color: colors.ink,
};

const SensoryItemsTable: React.FC<SensoryItemsTableProps> = memo(({ items, onResponseChange, disabled, scale, allowedValues }) => {
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
              backgroundColor: '#FFFFFF',
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
              <span style={descriptionStyle}>{item.description}</span>
            </div>
            <FastRadioCards
              name={`item-${item.id}`}
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
            <Table.ColumnHeaderCell width="5%">Item</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="35%">Descrição</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="60%" align="center">
              Frequência <span style={{ color: 'red' }}>*</span>
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map((item) => (
            <Table.Row key={item.id}>
              <Table.Cell>{item.id}</Table.Cell>
              <Table.Cell>
                <span style={descriptionStyle}>{item.description}</span>
              </Table.Cell>
              <Table.Cell>
                <Box>
                  <FastRadioCards
                    name={`item-${item.id}-desktop`}
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
