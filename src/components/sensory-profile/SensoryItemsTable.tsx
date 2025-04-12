import React from 'react';
import { Table, Text, Box, RadioCards } from '@radix-ui/themes';
import { SensoryItem, FrequencyResponse } from './types';

interface SensoryItemsTableProps {
  items: SensoryItem[];
  onResponseChange: (itemId: number, response: FrequencyResponse) => void;
  disabled?: boolean;
}

const SensoryItemsTable: React.FC<SensoryItemsTableProps> = ({ items, onResponseChange, disabled }) => {
  const frequencyOptions = [
    { value: "almost_never", label: "Quase Nunca" },
    { value: "rarely", label: "Raramente" },
    { value: "occasionally", label: "Ocasionalmente" },
    { value: "frequently", label: "Frequentemente" },
    { value: "almost_always", label: "Quase Sempre" }
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
                <RadioCards.Root 
                  value={item.response || ""}
                  onValueChange={(value) => onResponseChange(item.id, value as FrequencyResponse)}
                  disabled={disabled}
                  color="purple"
                  variant="classic"
                  columns={{ initial: "1", xs: "1", sm: "3", md: "5" }}
                  size="2"
                >
                  {frequencyOptions.map(option => (
                    <RadioCards.Item key={option.value} value={option.value}>
                      <Text size="1" weight="medium">{option.label}</Text>
                    </RadioCards.Item>
                  ))}
                </RadioCards.Root>
              </Box>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};

export default SensoryItemsTable;
