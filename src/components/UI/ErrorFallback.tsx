import React, { useCallback, useEffect, useMemo } from 'react';
import { Box, Button, Container, Heading, Text, VStack, useToast, Flex, useColorMode } from '@chakra-ui/react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FallbackProps } from 'react-error-boundary';
import { useInView } from 'react-intersection-observer';
import useSound from 'use-sound';
import { useDebounce } from 'use-debounce';
import { useHotkeys } from 'react-hotkeys-hook';
import { 
  RefreshCw, 
  AlertTriangle, 
  Wifi, 
  Database, 
  Server, 
  Shield 
} from 'lucide-react';

// Correct type definitions for motion components
const MotionBox = motion(Box as typeof motion.div ) ;
const MotionFlex = motion(Flex as typeof motion.div) ;

// Enhanced glass style with performance considerations
const glassStyle = {
  background: "rgba(15, 23, 42, 0.75)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  borderRadius: "24px",
  border: "1px solid rgba(148, 163, 184, 0.1)",
  boxShadow: 
    "0 8px 32px rgba(0, 0, 0, 0.1), " +
    "inset 0 2px 4px rgba(255, 255, 255, 0.05)",
  overflow: "hidden",
  position: "relative" as const,
  transform: "translateZ(0)",
  willChange: "transform, opacity",
} as const;

// Error categories with specific handling
const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  API: 'API',
  AUTHENTICATION: 'AUTH',
  PERMISSION: 'PERMISSION',
  PLAYBACK: 'PLAYBACK',
  UNKNOWN: 'UNKNOWN',
} as const;

type ErrorType = typeof ERROR_TYPES[keyof typeof ERROR_TYPES];

// Error configuration for different scenarios
const errorConfig = {
  [ERROR_TYPES.NETWORK]: {
    icon: Wifi,
    title: 'Connection Error',
    description: 'Please check your internet connection',
    color: 'orange.400',
    action: 'Retry Connection'
  },
  [ERROR_TYPES.API]: {
    icon: Server,
    title: 'Service Unavailable',
    description: 'Our services are temporarily unavailable',
    color: 'red.400',
    action: 'Try Again'
  },
  [ERROR_TYPES.AUTHENTICATION]: {
    icon: Shield,
    title: 'Authentication Error',
    description: 'Please log in again to continue',
    color: 'purple.400',
    action: 'Login'
  },
  [ERROR_TYPES.PERMISSION]: {
    icon: Database,
    title: 'Permission Denied',
    description: 'You don\'t have access to this resource',
    color: 'yellow.400',
    action: 'Request Access'
  },
  [ERROR_TYPES.PLAYBACK]: {
    icon: AlertTriangle,
    title: 'Playback Error',
    description: 'Unable to play the requested content',
    color: 'blue.400',
    action: 'Try Again'
  },
  [ERROR_TYPES.UNKNOWN]: {
    icon: AlertTriangle,
    title: 'Unexpected Error',
    description: 'An unknown error occurred',
    color: 'gray.400',
    action: 'Retry'
  },
} as const;

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const toast = useToast();
  const { colorMode } = useColorMode();
  const prefersReducedMotion = useReducedMotion();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // Sound effects with lazy loading
  const [playError] = useSound('/error.mp3', { 
    volume: 0.5,
    sprite: {
      error: [0, 1000],
      retry: [1000, 2000]
    }
  });

  const getErrorType = useCallback((error: Error): ErrorType => {
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('connection')) return ERROR_TYPES.NETWORK;
    if (message.includes('api') || message.includes('service')) return ERROR_TYPES.API;
    if (message.includes('authentication') || message.includes('login')) return ERROR_TYPES.AUTHENTICATION;
    if (message.includes('permission') || message.includes('access')) return ERROR_TYPES.PERMISSION;
    if (message.includes('playback') || message.includes('media')) return ERROR_TYPES.PLAYBACK;
    return ERROR_TYPES.UNKNOWN;
  }, []);

  const currentError = useMemo(() => {
    const type = getErrorType(error);
    return errorConfig[type];
  }, [error, getErrorType]);

  const [debouncedReportError] = useDebounce(
    () => {
      console.error('Error reported:', error);
      toast({
        title: "Error Report Sent",
        description: "We'll investigate and fix this issue.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    1000
  );

  useHotkeys('r', () => handleRetry(), { enableOnFormTags: true });
  useHotkeys('esc', () => handleClose(), { enableOnFormTags: true });

  const handleRetry = useCallback(() => {
    playError({ id: 'retry' });
    resetErrorBoundary();
  }, [playError, resetErrorBoundary]);

  const handleClose = useCallback(() => {
    window.history.back();
  }, []);

  useEffect(() => {
    if (inView) {
      playError({ id: 'error' });
    }
  }, [inView, playError]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.3
      }
    }
  };

  const IconComponent = currentError.icon;

  return (
    <Container 
      maxW="container.xl" 
      h="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}
    >
      <AnimatePresence mode="wait">
        <MotionBox
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={glassStyle}
        >
          <VStack spacing={6} align="stretch">
            <Flex align="center" justify="center" mb={2}>
              <MotionFlex
                animate={prefersReducedMotion ? {} : { 
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity }
                }}
              >
                <IconComponent size={32} color={currentError.color} />
              </MotionFlex>
              <Heading 
                as="h1" 
                size="lg" 
                bgGradient={`linear(to-r, ${currentError.color}, ${colorMode === 'dark' ? 'pink.500' : 'purple.500'})`}
                bgClip="text"
              >
                {currentError.title}
              </Heading>
            </Flex>

            <Text 
              color={colorMode === 'dark' ? 'whiteAlpha.800' : 'gray.600'} 
              textAlign="center"
            >
              {currentError.description}
            </Text>

            <Box 
              bg={colorMode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'}
              p={4}
              borderRadius="lg"
              fontFamily="mono"
              fontSize="sm"
              color={colorMode === 'dark' ? 'red.300' : 'red.500'}
              boxShadow="inset 0 2px 4px rgba(0,0,0,0.1)"
              wordBreak="break-word"
            >
              {error.message || "An unknown error occurred"}
              {error.stack && (
                <Text 
                  mt={2} 
                  fontSize="xs" 
                  color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
                >
                  {error.stack.split('\n')[1]}
                </Text>
              )}
            </Box>

            <VStack spacing={4}>
              <Button
                leftIcon={<RefreshCw />}
                onClick={handleRetry}
                width="full"
                bgGradient={`linear(to-r, ${currentError.color}, ${colorMode === 'dark' ? 'blue.600' : 'blue.400'})`}
                color="white"
                _hover={{
                  bgGradient: `linear(to-r, ${colorMode === 'dark' ? 'blue.500' : 'blue.600'}, ${colorMode === 'dark' ? 'purple.500' : 'purple.400'})`,
                }}
                transition="all 0.3s"
              >
                {currentError.action}
              </Button>
              <Button
                onClick={debouncedReportError}
                width="full"
                variant="outline"
                borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.200'}
                color={colorMode === 'dark' ? 'white' : 'gray.800'}
                _hover={{
                  bg: colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.50',
                }}
                transition="all 0.3s"
              >
                Report Issue
              </Button>
            </VStack>

            <Text 
              fontSize="sm" 
              color={colorMode === 'dark' ? 'whiteAlpha.600' : 'gray.500'} 
              textAlign="center"
            >
              Press 'R' to retry or 'ESC' to go back
            </Text>
          </VStack>
        </MotionBox>
      </AnimatePresence>
    </Container>
  );
};

export default React.memo(ErrorFallback);