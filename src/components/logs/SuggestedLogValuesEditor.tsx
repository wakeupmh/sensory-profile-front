import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';
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
  labelledBy,
}: {
  options: { value: T; label: string }[];
  value: T | undefined;
  onSelect: (value: T) => void;
  labelledBy?: string;
}) {
  return (
    <Flex gap="2" wrap="wrap" role="group" aria-labelledby={labelledBy}>
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          className="press-in"
          style={chipStyle(value === opt.value)}
          aria-pressed={value === opt.value}
          onClick={() => onSelect(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </Flex>
  );
}

function MoodEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const { t } = useTranslation();
  const uid = useId();
  const level = numberField(data.level);
  return (
    <Flex direction="column" gap="3">
      <Box>
        <div id={`${uid}-l`} style={labelStyle}>{t('p2Logs.sug.mood')}</div>
        <ChipRow
          labelledBy={`${uid}-l`}
          options={[1, 2, 3, 4, 5].map((v) => ({ value: v, label: String(v) }))}
          value={level}
          onSelect={(v) => onChange({ ...data, level: v })}
        />
      </Box>
      <Box>
        <label htmlFor={`${uid}-t`} style={labelStyle}>{t('p2Logs.sug.tagsList')}</label>
        <input
          id={`${uid}-t`}
          type="text"
          style={inputStyle}
          defaultValue={joinList(data.tags)}
          onBlur={(e) => onChange({ ...data, tags: parseList(e.target.value) })}
          placeholder={t('p2Logs.sug.tagsPh')}
        />
      </Box>
    </Flex>
  );
}

function SleepEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const { t } = useTranslation();
  const uid = useId();
  const SLEEP_QUALITY = ([1, 2, 3] as const).map((value) => ({ value, label: t(`p2Logs.sleep.q${value}`) }));
  const quality = numberField(data.quality) as 1 | 2 | 3 | undefined;
  return (
    <Flex direction="column" gap="3">
      <Flex gap="3">
        <Box style={{ flex: 1 }}>
          <label htmlFor={`${uid}-bed`} style={labelStyle}>{t('p2Logs.sug.slept')}</label>
          <input
            id={`${uid}-bed`}
            type="time"
            style={inputStyle}
            defaultValue={stringField(data.bedtime)}
            onBlur={(e) => onChange({ ...data, bedtime: e.target.value || undefined })}
          />
        </Box>
        <Box style={{ flex: 1 }}>
          <label htmlFor={`${uid}-wake`} style={labelStyle}>{t('p2Logs.sug.woke')}</label>
          <input
            id={`${uid}-wake`}
            type="time"
            style={inputStyle}
            defaultValue={stringField(data.waketime)}
            onBlur={(e) => onChange({ ...data, waketime: e.target.value || undefined })}
          />
        </Box>
        <Box style={{ width: '90px' }}>
          <label htmlFor={`${uid}-n`} style={labelStyle}>{t('p2Logs.sug.wakings')}</label>
          <input
            id={`${uid}-n`}
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
        <div id={`${uid}-q`} style={labelStyle}>{t('p2Logs.sleep.quality')}</div>
        <ChipRow labelledBy={`${uid}-q`} options={SLEEP_QUALITY} value={quality} onSelect={(v) => onChange({ ...data, quality: v })} />
      </Box>
    </Flex>
  );
}

function FoodEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const { t } = useTranslation();
  const uid = useId();
  const MEAL_OPTIONS = (['cafe', 'almoco', 'jantar', 'lanche'] as const).map((value) => ({ value: value as string, label: t(`p2Logs.food.${value}`) }));
  const meal = typeof data.meal === 'string' ? data.meal : undefined;
  return (
    <Flex direction="column" gap="3">
      <Box>
        <div id={`${uid}-m`} style={labelStyle}>{t('p2Logs.food.meal')}</div>
        <ChipRow labelledBy={`${uid}-m`} options={MEAL_OPTIONS} value={meal} onSelect={(v) => onChange({ ...data, meal: v })} />
      </Box>
      <Box>
        <label htmlFor={`${uid}-a`} style={labelStyle}>{t('p2Logs.sug.acceptedList')}</label>
        <input
          id={`${uid}-a`}
          type="text"
          style={inputStyle}
          defaultValue={joinList(data.accepted)}
          onBlur={(e) => onChange({ ...data, accepted: parseList(e.target.value) })}
          placeholder={t('p2Logs.sug.acceptedPh')}
        />
      </Box>
      <Box>
        <label htmlFor={`${uid}-r`} style={labelStyle}>{t('p2Logs.sug.refusedList')}</label>
        <input
          id={`${uid}-r`}
          type="text"
          style={inputStyle}
          defaultValue={joinList(data.refused)}
          onBlur={(e) => onChange({ ...data, refused: parseList(e.target.value) })}
          placeholder={t('p2Logs.sug.refusedPh')}
        />
      </Box>
    </Flex>
  );
}

function ToiletingEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const { t } = useTranslation();
  const uid = useId();
  const TOILETING_TYPE = (['urina', 'fezes', 'ambos'] as const).map((value) => ({ value: value as string, label: t(`p2Logs.toilet.${value}`) }));
  const type = typeof data.type === 'string' ? data.type : undefined;
  const independent = data.independent === true;
  return (
    <Flex direction="column" gap="3">
      <Box>
        <div id={`${uid}-t`} style={labelStyle}>{t('p2Logs.toilet.type')}</div>
        <ChipRow labelledBy={`${uid}-t`} options={TOILETING_TYPE} value={type} onSelect={(v) => onChange({ ...data, type: v })} />
      </Box>
      <button
        type="button"
        className="press-in"
        style={{ ...chipStyle(independent), width: 'fit-content' }}
        aria-pressed={independent}
        onClick={() => onChange({ ...data, independent: !independent })}
      >
        {independent ? t('p2Logs.sug.independentYes') : t('p2Logs.sug.independentAsk')}
      </button>
    </Flex>
  );
}

function AbcEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const { t } = useTranslation();
  const uid = useId();
  const intensity = numberField(data.intensity);
  return (
    <Flex direction="column" gap="3">
      <Box>
        <label htmlFor={`${uid}-a`} style={labelStyle}>{t('p2Logs.sug.before')}</label>
        <textarea
          id={`${uid}-a`}
          style={{ ...inputStyle, minHeight: '52px', resize: 'vertical' }}
          defaultValue={stringField(data.antecedent)}
          onBlur={(e) => onChange({ ...data, antecedent: e.target.value })}
        />
      </Box>
      <Box>
        <label htmlFor={`${uid}-b`} style={labelStyle}>{t('p2Logs.sug.behavior')}</label>
        <textarea
          id={`${uid}-b`}
          style={{ ...inputStyle, minHeight: '52px', resize: 'vertical' }}
          defaultValue={stringField(data.behavior)}
          onBlur={(e) => onChange({ ...data, behavior: e.target.value })}
        />
      </Box>
      <Box>
        <label htmlFor={`${uid}-c`} style={labelStyle}>{t('p2Logs.sug.after')}</label>
        <textarea
          id={`${uid}-c`}
          style={{ ...inputStyle, minHeight: '52px', resize: 'vertical' }}
          defaultValue={stringField(data.consequence)}
          onBlur={(e) => onChange({ ...data, consequence: e.target.value })}
        />
      </Box>
      <Box>
        <div id={`${uid}-i`} style={labelStyle}>{t('p2Logs.abc.intensity')}</div>
        <ChipRow
          labelledBy={`${uid}-i`}
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
