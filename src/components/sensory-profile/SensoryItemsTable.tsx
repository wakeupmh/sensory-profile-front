import React from 'react';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { CheckIcon } from '@radix-ui/react-icons';
import { SensoryItem, FrequencyResponse } from './types';

interface SensoryItemsTableProps {
  items: SensoryItem[];
  updateItemResponse: (itemId: number, response: FrequencyResponse) => void;
}

const SensoryItemsTable: React.FC<SensoryItemsTableProps> = ({ items, updateItemResponse }) => {
  return (
    <table className="sensory-table">
      <thead>
        <tr>
          <th className="quadrant-column">Quadrante</th>
          <th className="item-column">Item</th>
          <th className="description-column">Descrição</th>
          <th className="response-column">Sempre (5)</th>
          <th className="response-column">Frequentemente (4)</th>
          <th className="response-column">Ocasionalmente (3)</th>
          <th className="response-column">Raramente (2)</th>
          <th className="response-column">Nunca (1)</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td className="quadrant-column">{item.quadrant}</td>
            <td className="item-column">{item.id}</td>
            <td className="description-column">{item.description}</td>
            <td className="response-column">
              <RadioGroup.Root
                value={item.response || ''}
                onValueChange={(value) => updateItemResponse(item.id, value as FrequencyResponse)}
              >
                <div className="radio-option">
                  <RadioGroup.Item className="radio-item" value="always" id={`always-${item.id}`}>
                    <RadioGroup.Indicator className="radio-indicator">
                      <CheckIcon />
                    </RadioGroup.Indicator>
                  </RadioGroup.Item>
                </div>
              </RadioGroup.Root>
            </td>
            <td className="response-column">
              <RadioGroup.Root
                value={item.response || ''}
                onValueChange={(value) => updateItemResponse(item.id, value as FrequencyResponse)}
              >
                <div className="radio-option">
                  <RadioGroup.Item className="radio-item" value="frequently" id={`frequently-${item.id}`}>
                    <RadioGroup.Indicator className="radio-indicator">
                      <CheckIcon />
                    </RadioGroup.Indicator>
                  </RadioGroup.Item>
                </div>
              </RadioGroup.Root>
            </td>
            <td className="response-column">
              <RadioGroup.Root
                value={item.response || ''}
                onValueChange={(value) => updateItemResponse(item.id, value as FrequencyResponse)}
              >
                <div className="radio-option">
                  <RadioGroup.Item className="radio-item" value="occasionally" id={`occasionally-${item.id}`}>
                    <RadioGroup.Indicator className="radio-indicator">
                      <CheckIcon />
                    </RadioGroup.Indicator>
                  </RadioGroup.Item>
                </div>
              </RadioGroup.Root>
            </td>
            <td className="response-column">
              <RadioGroup.Root
                value={item.response || ''}
                onValueChange={(value) => updateItemResponse(item.id, value as FrequencyResponse)}
              >
                <div className="radio-option">
                  <RadioGroup.Item className="radio-item" value="rarely" id={`rarely-${item.id}`}>
                    <RadioGroup.Indicator className="radio-indicator">
                      <CheckIcon />
                    </RadioGroup.Indicator>
                  </RadioGroup.Item>
                </div>
              </RadioGroup.Root>
            </td>
            <td className="response-column">
              <RadioGroup.Root
                value={item.response || ''}
                onValueChange={(value) => updateItemResponse(item.id, value as FrequencyResponse)}
              >
                <div className="radio-option">
                  <RadioGroup.Item className="radio-item" value="never" id={`never-${item.id}`}>
                    <RadioGroup.Indicator className="radio-indicator">
                      <CheckIcon />
                    </RadioGroup.Indicator>
                  </RadioGroup.Item>
                </div>
              </RadioGroup.Root>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SensoryItemsTable;
