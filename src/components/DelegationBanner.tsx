import { useTranslation } from 'react-i18next';
import { Flex } from '@radix-ui/themes';
import { GroupIcon, ExitIcon } from '@radix-ui/react-icons';
import { useDelegation } from '../context/DelegationContext';
import { colors } from '../theme/tokens';
import { GumroadText } from './design-system/GumroadHeading';

const DelegationBanner: React.FC = () => {
  const { t } = useTranslation();
  const { delegateChild, stopDelegating } = useDelegation();

  if (!delegateChild) return null;

  return (
    <Flex
      role="status"
      align="center"
      justify="center"
      gap="3"
      wrap="wrap"
      style={{
        backgroundColor: colors['brand-peach'],
        borderBottom: `2px solid ${colors.ink}`,
        padding: '8px 16px',
      }}
    >
      <GroupIcon aria-hidden="true" />
      <GumroadText level="caption-uppercase" as="span" style={{ fontWeight: 700 }}>
        {t('delegation.banner', { name: delegateChild.name })}
      </GumroadText>
      <button
        type="button"
        onClick={stopDelegating}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          border: `1.5px solid ${colors.ink}`,
          borderRadius: '9999px',
          padding: '2px 10px',
          background: colors.canvas,
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        <ExitIcon width={12} height={12} aria-hidden="true" />
        {t('delegation.exit')}
      </button>
    </Flex>
  );
};

export default DelegationBanner;
