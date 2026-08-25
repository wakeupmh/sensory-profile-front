import React from 'react';
import { Flex, Box } from '@radix-ui/themes';
import {colors, shadows, radii, fonts } from '../../theme/tokens';
import type { LogType } from '../../types/logs';

/**
 * Edita os valores (`data`) de um registro *sugerido* pela IA antes da
 * confirmação — ver DailyReportPage. Os componentes de `src/components/logs/`
 * (MoodLogForm, SleepLogForm, ...) não aceitam valor inicial: são feitos para
 * criar um registro do zero, sempre partindo em branco. Reescrever a sugestão
 * neles apagaria justamente o que a IA acertou, obrigando o cuidador a
 * redigitar tudo por causa de um único campo errado (o "sono 3 que devia ser
 * 1" do relato). Por isso este editor é novo e compacto — mesma forma dos
 * dados (`AbcData`/`MoodData`/`SleepData`/`FoodData`/`ToiletingData`), só que
 * controlado a partir do valor que já existe.
 */
interface SuggestedLogValuesEditorProps {
  logType: LogType;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: fonts.display,
  fontSize: '12px',
  fontWeight: 600,
  color: colors.ink,
  marginBottom: '4px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  backgroundColor: 'transparent',
  border: `2px solid ${colors.ink}`,
  borderRadius: radii.sm,
  boxShadow: shadows.input,
  fontFamily: fonts.body,
  fontSize: '14px',
  color: colors.ink,
  boxSizing: 'border-box',
};

function chipStyle(active: boolean): React.CSSProperties {
  return {
    padding: '6px 12px',
    backgroundColor: active ? colors['brand-cyan'] : colors.surface,
    border: `2px solid ${colors.ink}`,
    borderRadius: radii.pill,
    boxShadow: active ? shadows['button-active'] : shadows.button,
    cursor: 'pointer',
    fontFamily: fonts.display,
    fontSize: '12px',
    fontWeight: 600,
    color: colors.ink,
    transform: active ? 'translate(1px, 1px)' : 'translate(0, 0)',
    transition: 'transform 0.1s ease, background-color 0.1s ease',
  };
}

function parseList(raw: string): string[] {
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function joinList(value: unknown): string {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string').join(', ') : '';
}

function numberField(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function stringField(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function ChipRow<T extends string | number>({
  options,
  value,
  onSelect,
}: {
  options: { value: T; label: string }[];
  value: T | undefined;
  onSelect: (value: T) => void;
}) {
  return (
    <Flex gap="2" wrap="wrap">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          className="press-in"
          style={chipStyle(value === opt.value)}
          onClick={() => onSelect(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </Flex>
  );
}

function MoodEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const level = numberField(data.level);
  return (
    <Flex direction="column" gap="3">
      <Box>
        <label style={labelStyle}>Como estava</label>
        <ChipRow
          options={[1, 2, 3, 4, 5].map((v) => ({ value: v, label: String(v) }))}
          value={level}
          onSelect={(v) => onChange({ ...data, level: v })}
        />
      </Box>
      <Box>
        <label style={labelStyle}>Marcadores (separados por vírgula)</label>
        <input
          type="text"
          style={inputStyle}
          defaultValue={joinList(data.tags)}
          onBlur={(e) => onChange({ ...data, tags: parseList(e.target.value) })}
          placeholder="Ex: calmo, feliz"
        />
      </Box>
    </Flex>
  );
}

const SLEEP_QUALITY: { value: 1 | 2 | 3; label: string }[] = [
  { value: 1, label: 'Ruim' },
  { value: 2, label: 'Razoável' },
  { value: 3, label: 'Boa' },
];

function SleepEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const quality = numberField(data.quality) as 1 | 2 | 3 | undefined;
  return (
    <Flex direction="column" gap="3">
      <Flex gap="3">
        <Box style={{ flex: 1 }}>
          <label style={labelStyle}>Dormiu</label>
          <input
            type="time"
            style={inputStyle}
            defaultValue={stringField(data.bedtime)}
            onBlur={(e) => onChange({ ...data, bedtime: e.target.value || undefined })}
          />
        </Box>
        <Box style={{ flex: 1 }}>
          <label style={labelStyle}>Acordou</label>
          <input
            type="time"
            style={inputStyle}
            defaultValue={stringField(data.waketime)}
            onBlur={(e) => onChange({ ...data, waketime: e.target.value || undefined })}
          />
        </Box>
        <Box style={{ width: '90px' }}>
          <label style={labelStyle}>Vezes acordou</label>
          <input
            type="number"
            min={0}
            max={20}
            style={inputStyle}
            defaultValue={numberField(data.wakings) ?? ''}
            onBlur={(e) => onChange({ ...data, wakings: e.target.value === '' ? undefined : parseInt(e.target.value, 10) })}
          />
        </Box>
      </Flex>
      <Box>
        <label style={labelStyle}>Qualidade</label>
        <ChipRow options={SLEEP_QUALITY} value={quality} onSelect={(v) => onChange({ ...data, quality: v })} />
      </Box>
    </Flex>
  );
}

const MEAL_OPTIONS: { value: string; label: string }[] = [
  { value: 'cafe', label: 'Café da manhã' },
  { value: 'almoco', label: 'Almoço' },
  { value: 'jantar', label: 'Jantar' },
  { value: 'lanche', label: 'Lanche' },
];

function FoodEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const meal = typeof data.meal === 'string' ? data.meal : undefined;
  return (
    <Flex direction="column" gap="3">
      <Box>
        <label style={labelStyle}>Refeição</label>
        <ChipRow options={MEAL_OPTIONS} value={meal} onSelect={(v) => onChange({ ...data, meal: v })} />
      </Box>
      <Box>
        <label style={labelStyle}>Aceitou (separados por vírgula)</label>
        <input
          type="text"
          style={inputStyle}
          defaultValue={joinList(data.accepted)}
          onBlur={(e) => onChange({ ...data, accepted: parseList(e.target.value) })}
          placeholder="Ex: arroz, frango"
        />
      </Box>
      <Box>
        <label style={labelStyle}>Recusou (separados por vírgula)</label>
        <input
          type="text"
          style={inputStyle}
          defaultValue={joinList(data.refused)}
          onBlur={(e) => onChange({ ...data, refused: parseList(e.target.value) })}
          placeholder="Ex: brócolis"
        />
      </Box>
    </Flex>
  );
}

const TOILETING_TYPE: { value: string; label: string }[] = [
  { value: 'urina', label: 'Urina' },
  { value: 'fezes', label: 'Fezes' },
  { value: 'ambos', label: 'Ambos' },
];

function ToiletingEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const type = typeof data.type === 'string' ? data.type : undefined;
  const independent = data.independent === true;
  return (
    <Flex direction="column" gap="3">
      <Box>
        <label style={labelStyle}>Tipo</label>
        <ChipRow options={TOILETING_TYPE} value={type} onSelect={(v) => onChange({ ...data, type: v })} />
      </Box>
      <button
        type="button"
        className="press-in"
        style={{ ...chipStyle(independent), width: 'fit-content' }}
        onClick={() => onChange({ ...data, independent: !independent })}
      >
        {independent ? '✓ Independente' : 'Independente?'}
      </button>
    </Flex>
  );
}

function AbcEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const intensity = numberField(data.intensity);
  return (
    <Flex direction="column" gap="3">
      <Box>
        <label style={labelStyle}>Antes</label>
        <textarea
          style={{ ...inputStyle, minHeight: '52px', resize: 'vertical' }}
          defaultValue={stringField(data.antecedent)}
          onBlur={(e) => onChange({ ...data, antecedent: e.target.value })}
        />
      </Box>
      <Box>
        <label style={labelStyle}>Comportamento</label>
        <textarea
          style={{ ...inputStyle, minHeight: '52px', resize: 'vertical' }}
          defaultValue={stringField(data.behavior)}
          onBlur={(e) => onChange({ ...data, behavior: e.target.value })}
        />
      </Box>
      <Box>
        <label style={labelStyle}>Depois</label>
        <textarea
          style={{ ...inputStyle, minHeight: '52px', resize: 'vertical' }}
          defaultValue={stringField(data.consequence)}
          onBlur={(e) => onChange({ ...data, consequence: e.target.value })}
        />
      </Box>
      <Box>
        <label style={labelStyle}>Intensidade</label>
        <ChipRow
          options={[1, 2, 3, 4, 5].map((v) => ({ value: v, label: String(v) }))}
          value={intensity}
          onSelect={(v) => onChange({ ...data, intensity: v })}
        />
      </Box>
    </Flex>
  );
}

export default function SuggestedLogValuesEditor({ logType, data, onChange }: SuggestedLogValuesEditorProps) {
  switch (logType) {
    case 'mood':
      return <MoodEditor data={data} onChange={onChange} />;
    case 'sleep':
      return <SleepEditor data={data} onChange={onChange} />;
    case 'food':
      return <FoodEditor data={data} onChange={onChange} />;
    case 'toileting':
      return <ToiletingEditor data={data} onChange={onChange} />;
    case 'abc':
      return <AbcEditor data={data} onChange={onChange} />;
    default:
      return null;
  }
}
