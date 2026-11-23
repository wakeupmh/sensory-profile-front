import { Box, Flex, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/tokens';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}

// Diâmetro e espessura da borda por tamanho; a rotação usa @keyframes spin do index.css.
const dimensions = { small: [24, 3], medium: [36, 4], large: [48, 5] } as const;

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = colors['brand-cyan'],
  text,
}) => {
  const { t } = useTranslation();
  return (
    <Flex direction="column" align="center" justify="center" gap="3" role="status">
      <Box
        aria-hidden="true"
        style={{
          width: dimensions[size][0],
          height: dimensions[size][0],
          border: `${dimensions[size][1]}px solid rgba(0, 0, 0, 0.1)`,
          borderTopColor: color,
          borderRadius: '50%',
          animation: 'spin 1s ease-in-out infinite',
        }}
      />
      {text ? (
        <Text size="2" color="gray">
          {text}
        </Text>
      ) : (
        <span className="sr-only">{t('p2Common.loading')}</span>
      )}
    </Flex>
  );
};

export default LoadingSpinner;
