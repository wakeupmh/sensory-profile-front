import React from 'react';
import { Box, Card, Flex, Text, Button, Heading } from '@radix-ui/themes';

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
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box p="6" style={{ maxWidth: 600, margin: '80px auto' }}>
          <Card>
            <Flex direction="column" align="center" gap="4" p="6">
              <Heading size="6" color="crimson">
                Algo deu errado
              </Heading>
              <Text size="3" color="gray" align="center">
                Ocorreu um erro inesperado. Por favor, tente recarregar a
                página ou voltar para a página inicial.
              </Text>
              {this.state.error && (
                <Text size="1" color="gray" style={{ fontFamily: 'monospace' }}>
                  {this.state.error.message}
                </Text>
              )}
              <Flex gap="3" mt="2">
                <Button
                  variant="solid"
                  color="violet"
                  onClick={() => window.location.reload()}
                >
                  Recarregar Página
                </Button>
                <Button
                  variant="outline"
                  color="gray"
                  onClick={this.handleReset}
                >
                  Voltar para Início
                </Button>
              </Flex>
            </Flex>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
