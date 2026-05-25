import React from 'react';
import { Box, Flex } from '@radix-ui/themes';

import GumroadCard from './design-system/GumroadCard';
import GumroadButton from './design-system/GumroadButton';
import GumroadHeading, { GumroadText } from './design-system/GumroadHeading';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box p="6" style={{ maxWidth: 600, margin: '80px auto' }}>
          <GumroadCard color="salmon" shadow="md" padding="xl">
            <Flex direction="column" align="center" gap="4" py="6">
              <GumroadHeading level="display-md" as="h1" style={{ textAlign: 'center' }}>
                Algo deu errado
              </GumroadHeading>
              <GumroadText level="body-md" as="p" style={{ textAlign: 'center', opacity: 0.8 }}>
                Ocorreu um erro inesperado. Por favor, tente recarregar a
                página ou voltar para a página inicial.
              </GumroadText>
              {this.state.error && (
                <GumroadText
                  level="caption"
                  as="p"
                  style={{ fontFamily: 'monospace', opacity: 0.6, textAlign: 'center' }}
                >
                  {this.state.error.message}
                </GumroadText>
              )}
              <Flex gap="3" mt="2" wrap="wrap" justify="center">
                <GumroadButton variant="primary" size="md" onClick={() => window.location.reload()}>
                  Recarregar Página
                </GumroadButton>
                <GumroadButton variant="secondary" size="md" onClick={this.handleReset}>
                  Voltar para Início
                </GumroadButton>
              </Flex>
            </Flex>
          </GumroadCard>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
