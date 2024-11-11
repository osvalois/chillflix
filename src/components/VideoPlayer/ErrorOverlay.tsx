import React, { useCallback, useState, memo } from 'react';
import { 
  Box,
  Center, 
  Text, 
  VStack, 
  Flex,
  Spinner,
  useToken,
  Button
} from "@chakra-ui/react";
import { motion, AnimatePresence } from 'framer-motion';
import { DynamicIcon } from '../Movie/Icons';

interface ErrorOverlayProps {
  isVisible: boolean;
  onRetry?: () => void;
  onClose?: () => void;
  errorCode?: string;
  errorDetails?: string;
  customMessage?: string;
  retryCount?: number;
  maxRetries?: number;
}

const MotionBox = motion(Box as any);
const MotionFlex = motion(Flex  as any);

export const ErrorOverlay: React.FC<ErrorOverlayProps> = memo(({
  isVisible,
  onRetry,
  onClose,
  errorCode,
  errorDetails,
  customMessage,
  retryCount = 0,
  maxRetries = 3
}) => {
  // Estados locales
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Token de colores para gradiente
  const [red500, red600] = useToken('colors', ['red.500', 'red.600']);

  // Manejador de retry con feedback
  const handleRetry = useCallback(async () => {
    if (onRetry && !isRetrying) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  }, [onRetry, isRetrying]);

  // Determinación del mensaje basado en el número de intentos
  const getMessage = useCallback(() => {
    if (customMessage) return customMessage;
    
    if (retryCount >= maxRetries) {
      return "No se pudo reproducir el video después de varios intentos";
    }
    
    if (errorCode === 'NETWORK_ERROR') {
      return "Hay problemas con tu conexión a internet";
    }
    
    return "Ocurrió un error durante la reproducción";
  }, [customMessage, retryCount, maxRetries, errorCode]);

  // No renderizar si no es visible
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <MotionBox
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        bg="rgba(0, 0, 0, 0.85)"
        backdropFilter="blur(10px)"
        zIndex={10}
      >
        <Center 
          width="100%" 
          height="100%"
          padding={4}
        >
          <MotionFlex
            direction="column"
            align="center"
            maxWidth="400px"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Contenedor principal con efecto glassmorphism */}
            <Box
              bg="rgba(26, 32, 44, 0.85)"
              borderRadius="xl"
              padding={6}
              boxShadow={`
                0 4px 6px -1px rgba(0, 0, 0, 0.1),
                0 2px 4px -1px rgba(0, 0, 0, 0.06),
                inset 0 0 0 1px rgba(255, 255, 255, 0.1)
              `}
              position="relative"
              width="100%"
            >
              {/* Botón de cierre si se proporciona onClose */}
              {onClose && (
                <Box
                  position="absolute"
                  top={2}
                  right={2}
                  cursor="pointer"
                  onClick={onClose}
                  opacity={0.6}
                  _hover={{ opacity: 1 }}
                  transition="opacity 0.2s"
                >
                  <DynamicIcon name="Close" color="white" size={12} />
                </Box>
              )}

              <VStack spacing={5}>
                {/* Icono de error con gradiente */}
                <Box
                  position="relative"
                  padding={3}
                  borderRadius="full"
                  bg={`linear-gradient(135deg, ${red500}, ${red600})`}
                  boxShadow={`0 0 20px ${red500}40`}
                >
                  <DynamicIcon 
                    name="Warning" 
                    color="white" 
                    size={16} 
                  />
                </Box>

                {/* Mensaje principal */}
                <Text 
                  color="white" 
                  fontSize="lg" 
                  fontWeight="semibold"
                  textAlign="center"
                  lineHeight="tall"
                >
                  {getMessage()}
                </Text>

                {/* Mensaje secundario */}
                <Text 
                  color="gray.300" 
                  fontSize="sm"
                  textAlign="center"
                  maxWidth="90%"
                >
                  Por favor, verifica tu conexión a internet e intenta nuevamente
                </Text>

                {/* Botones de acción */}
                <VStack spacing={3} width="100%" pt={2}>
                  {onRetry && retryCount < maxRetries && (
                    <Button
                      width="100%"
                      variant="solid"
                      colorScheme="blue"
                      leftIcon={isRetrying ? <Spinner size="sm" /> : <DynamicIcon name="Repeat" color="white" size={12} />}
                      onClick={handleRetry}
                      isDisabled={isRetrying}
                      _hover={{
                        transform: 'translateY(-1px)',
                        boxShadow: 'lg'
                      }}
                      transition="all 0.2s"
                    >
                      {isRetrying ? 'Reintentando...' : 'Reintentar'}
                    </Button>
                  )}

                  {/* Botón para mostrar detalles del error */}
                  {errorDetails && (
                    <Button
                      width="100%"
                      variant="ghost"
                      size="sm"
                      leftIcon={<DynamicIcon name="Info" color="gray.300" size={12} />}
                      onClick={() => setShowDetails(!showDetails)}
                      color="gray.300"
                      _hover={{
                        bg: 'whiteAlpha.100'
                      }}
                    >
                      {showDetails ? 'Ocultar detalles' : 'Mostrar detalles'}
                    </Button>
                  )}
                </VStack>

                {/* Detalles del error */}
                <AnimatePresence>
                  {showDetails && errorDetails && (
                    <MotionBox
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      overflow="hidden"
                      width="100%"
                    >
                      <Box
                        bg="rgba(0, 0, 0, 0.3)"
                        borderRadius="md"
                        padding={3}
                        mt={2}
                      >
                        <Text
                          color="gray.400"
                          fontSize="xs"
                          fontFamily="mono"
                          whiteSpace="pre-wrap"
                        >
                          {errorCode && `Error Code: ${errorCode}\n`}
                          {errorDetails}
                        </Text>
                      </Box>
                    </MotionBox>
                  )}
                </AnimatePresence>

                {/* Contador de intentos */}
                {retryCount > 0 && (
                  <Text
                    color="gray.500"
                    fontSize="xs"
                    mt={2}
                  >
                    Intento {retryCount} de {maxRetries}
                  </Text>
                )}
              </VStack>
            </Box>
          </MotionFlex>
        </Center>
      </MotionBox>
    </AnimatePresence>
  );
});

// Componente para errores temporales
export const TemporaryErrorOverlay: React.FC<ErrorOverlayProps & { duration?: number }> = memo(({
  duration = 5000,
  ...props
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return <ErrorOverlay {...props} isVisible={isVisible} />;
});