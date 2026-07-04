import React from 'react';
import { Link } from 'react-router-dom';
import { Flex, Box } from '@radix-ui/themes';
import GumroadCard from '../design-system/GumroadCard';
import GumroadBadge from '../design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../design-system/GumroadHeading';
import GoalProgressBar from './GoalProgressBar';
import type { Goal, GoalProgressSummary } from '../../types/goals';
import { GOAL_DOMAIN_LABELS, GOAL_STATUS_LABELS, GOAL_STATUS_COLORS } from '../../types/goals';

interface GoalCardProps {
  goal: Goal;
  summary?: GoalProgressSummary;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, summary }) => {
  const current = summary?.lastValue ?? goal.baseline;
  const delta = summary?.delta ?? 0;
  const isAchieved = goal.status === 'achieved';

  return (
    <Link to={`/goals/${goal.id}`} style={{ textDecoration: 'none' }}>
      <GumroadCard color={isAchieved ? 'mint' : 'white'} shadow="md" padding="lg" style={{ height: '100%' }}>
        <Flex direction="column" gap="3" style={{ height: '100%' }}>
          <Flex justify="between" align="start" gap="2">
            <GumroadHeading level="title-sm" as="h3" style={{ wordBreak: 'break-word', flex: 1 }}>
              {isAchieved && '🏆 '}
              {goal.title}
            </GumroadHeading>
            <GumroadBadge color={GOAL_STATUS_COLORS[goal.status]}>
              {GOAL_STATUS_LABELS[goal.status]}
            </GumroadBadge>
          </Flex>

          <GumroadBadge color="lavender" style={{ alignSelf: 'flex-start' }}>
            {GOAL_DOMAIN_LABELS[goal.domain]}
          </GumroadBadge>

          <Box style={{ marginTop: 'auto' }}>
            <GoalProgressBar baseline={goal.baseline} target={goal.target} current={current} unit={goal.unit} />
            {summary && (
              <GumroadText level="caption" as="p" style={{ marginTop: '6px', opacity: 0.75 }}>
                {delta >= 0 ? '+' : ''}
                {delta} desde o início ({summary.entriesCount} registro{summary.entriesCount === 1 ? '' : 's'})
              </GumroadText>
            )}
          </Box>
        </Flex>
      </GumroadCard>
    </Link>
  );
};

export default GoalCard;
