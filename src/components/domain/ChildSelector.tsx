import { useId } from 'react';
import { Box } from '@radix-ui/themes';
import { colors, shadows, radii, fonts } from '../../theme/tokens';
import type { ChildData } from '../../services/api';
import { NoChildrenPrompt } from './NoChildrenPrompt';

interface ChildSelectorProps {
  children: ChildData[];
  selectedChildId: string;
  onChange: (childId: string) => void;
  emptyLabel?: string;
}

export function ChildSelector({ children, selectedChildId, onChange, emptyLabel = 'Todas as crianças' }: ChildSelectorProps) {
  const selectId = useId();
  if (children.length === 0) return <NoChildrenPrompt />;
  return (
    <Box mb="4">
      {/* Visível apenas para leitores de tela: o filtro por criança é o
          controle mais importante destas páginas, mas seu visual (borda +
          opções) já comunica o propósito para quem enxerga a tela. */}
      <label htmlFor={selectId} className="sr-only">
        Selecionar criança
      </label>
      <select
        id={selectId}
        value={selectedChildId}
        onChange={(e) => onChange(e.target.value)}
        style={{
          height: '44px',
          padding: '0 12px',
          backgroundColor: colors.surface,
          border: `2px solid ${colors.ink}`,
          borderRadius: radii.md,
          fontFamily: fonts.display,
          fontSize: '14px',
          fontWeight: 500,
          color: colors.ink,
          cursor: 'pointer',
          boxShadow: shadows['card-sm'],
          minWidth: '200px',
        }}
      >
        <option value="">{emptyLabel}</option>
        {children.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </Box>
  );
}
