import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Heading, Text, Button, VStack, useColorModeValue } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // Aquí podrías enviar el error a un servicio de registro de errores
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} onReset={this.handleReload} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  return (
    <Box
      width="100%"
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={bgColor}
      color={textColor}
    >
      <VStack spacing={4} textAlign="center" maxWidth="500px" p={8}>
        <Heading as="h1" size="xl">Oops, algo salió mal</Heading>
        <Text>Lo sentimos, ha ocurrido un error inesperado.</Text>
        {error && (
          <Text fontSize="sm" color="red.500">
            Error: {error.message}
          </Text>
        )}
        <Button colorScheme="blue" onClick={onReset}>
          Reintentar
        </Button>
      </VStack>
    </Box>
  );
};

export default ErrorBoundary;