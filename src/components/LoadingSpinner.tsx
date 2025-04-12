import { Box, Flex, Text } from '@radix-ui/themes';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled(Box)<{ size: string; color: string }>`
  width: ${props => 
    props.size === 'small' ? '24px' : 
    props.size === 'large' ? '48px' : '36px'
  };
  height: ${props => 
    props.size === 'small' ? '24px' : 
    props.size === 'large' ? '48px' : '36px'
  };
  border: ${props => 
    props.size === 'small' ? '3px' : 
    props.size === 'large' ? '5px' : '4px'
  } solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: ${props => props.color};
  animation: ${spin} 1s ease-in-out infinite;
`;

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'var(--violet-9)',
  text,
}) => {
  return (
    <Flex direction="column" align="center" justify="center" gap="3">
      <SpinnerContainer size={size} color={color} />
      {text && (
        <Text size="2" color="gray">
          {text}
        </Text>
      )}
    </Flex>
  );
};

export default LoadingSpinner;
