import React from 'react';
import { Flex, Box } from '@radix-ui/themes';
import { colors, spacing, radii } from '../../theme/tokens';
import GumroadHeading, { GumroadText } from '../design-system/GumroadHeading';
import type { TimelineEvent } from '../../types/child';
import { TIMELINE_TYPE_LABELS, TIMELINE_TYPE_COLORS } from '../../types/child';

interface TimelineEventCardProps {
  event: TimelineEvent;
}

const TimelineEventCard: React.FC<TimelineEventCardProps> = ({ event }) => {
  const colorConfig = TIMELINE_TYPE_COLORS[event.type];
  const label = TIMELINE_TYPE_LABELS[event.type];
  const dateStr = new Date(event.occurredAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      style={{
        display: 'flex',
        backgroundColor: colors.surface,
        border: `2px solid ${colors.ink}`,
        borderRadius: radii.md,
        boxShadow: '2px 2px 0px #0A0A1A',
        overflow: 'hidden',
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          width: '6px',
          flexShrink: 0,
          backgroundColor: colorConfig.bg,
        }}
      />

      {/* Content */}
      <Flex direction="column" gap="1" style={{ padding: `${spacing.sm} ${spacing.md}`, flex: 1, minWidth: 0 }}>
        <Flex align="center" gap="2" wrap="wrap">
          {/* Type badge */}
          <span
            style={{
              backgroundColor: colorConfig.bg,
              color: colorConfig.text,
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '9999px',
              border: `1.5px solid ${colors.ink}`,
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </span>
          {/* Date */}
          <GumroadText level="body-sm" as="span" style={{ opacity: 0.6, whiteSpace: 'nowrap' }}>
            {dateStr}
          </GumroadText>
        </Flex>

        <GumroadHeading level="title-sm" as="p" style={{ fontWeight: 700, wordBreak: 'break-word' }}>
          {event.title}
        </GumroadHeading>

        {event.subtitle && (
          <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, wordBreak: 'break-word' }}>
            {event.subtitle}
          </GumroadText>
        )}
      </Flex>
    </div>
  );
};

export default TimelineEventCard;
