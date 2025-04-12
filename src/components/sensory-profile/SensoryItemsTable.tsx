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
    { value: "rarely", label: "Raramente" },
    { value: "almost_never", label: "Quase Nunca" },
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
          <Table.ColumnHeaderCell width="60%" align="center">Frequência</Table.ColumnHeaderCell>
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
                  color="violet"
                  columns={{ initial: "1", xs: "1", sm: "3", md: "5" }}
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
