import React, { memo } from 'react';
import { Table, Box } from '@radix-ui/themes';
import { SensoryItem, FrequencyResponse } from './types';
import FastRadioCards from './FastRadioCards';

interface SensoryItemsTableProps {
  items: SensoryItem[];
  onResponseChange: (itemId: number, response: FrequencyResponse) => void;
  disabled?: boolean;
}

const SensoryItemsTable: React.FC<SensoryItemsTableProps> = memo(({ items, onResponseChange, disabled }) => {
  const frequencyOptions = [
    { value: "not_applied", label: "Não se aplica" },
    { value: "almost_never", label: "Quase Nunca" },
    { value: "half_time", label: "Metade do Tempo" },
    { value: "occasionally", label: "Ocasionalmente" },
    { value: "almost_always", label: "Quase Sempre" },
    { value: "frequently", label: "Frequentemente" }
  ];

  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell width="5%">Item</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="35%">Descrição</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="60%" align="center">Frequência <span style={{ color: 'red' }}>*</span></Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {items.map((item) => (
          <Table.Row key={item.id}>
            <Table.Cell>{item.id}</Table.Cell>
            <Table.Cell>{item.description}</Table.Cell>
            <Table.Cell>
              <Box>
                <FastRadioCards
                  name={`item-${item.id}`}
                  options={frequencyOptions}
                  initialValue={item.response || ""}
                  onValueChange={(_, value) => onResponseChange(item.id, value as FrequencyResponse)}
                  disabled={disabled}
                  required={true}
                  color="violet"
                />
              </Box>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
});

export default SensoryItemsTable;
