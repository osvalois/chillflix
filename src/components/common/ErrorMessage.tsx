import { memo, useCallback } from 'react';
import { Box, Text, Button } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Icons from '../Movie/Icons';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  variant?: 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

// Constantes
const VARIANTS = {
  warning: {
    icon: 'Warning',
    color: 'orange.300',
    gradient: 'linear(to-r, orange.400, orange.500, orange.600)',
  },
  error: {
    icon: 'Error',
    color: 'red.300',
    gradient: 'linear(to-r, red.400, red.500, red.600)',
  },
  info: {
    icon: 'Info',
    color: 'blue.300',
    gradient: 'linear(to-r, blue.400, blue.500, blue.600)',
  },
} as const;

const SIZES = {
  sm: {
    iconSize: 30,
    fontSize: 'md',
    padding: 4,
  },
  md: {
    iconSize: 50,
    fontSize: 'lg',
    padding: 6,
  },
  lg: {
    iconSize: 70,
    fontSize: 'xl',
    padding: 8,
  },
} as const;

// Componentes Memoizados
const ErrorIcon = memo(({ variant = 'warning', size = 'md' }: Pick<ErrorMessageProps, 'variant' | 'size'>) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
  >
    <Icons.Warning 
      size={SIZES[size].iconSize} 
      className={`text-${VARIANTS[variant].color}`}
    />
  </motion.div>
));

ErrorIcon.displayName = 'ErrorIcon';

const ErrorText = memo(({ 
  message, 
  size = 'md' 
}: { 
  message: string; 
  size?: ErrorMessageProps['size'];
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
  >
    <Text 
      mt={4} 
      mb={4} 
      fontSize={SIZES[size].fontSize}
      color="gray.700"
      fontWeight="medium"
      lineHeight="tall"
    >
      {message}
    </Text>
  </motion.div>
));

ErrorText.displayName = 'ErrorText';

const RetryButton = memo(({ 
  onRetry, 
  variant = 'warning' 
}: { 
  onRetry: () => void;
  variant: ErrorMessageProps['variant'];
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
  >
    <Button
      colorScheme={variant}
      bgGradient={VARIANTS[variant].gradient}
      color="white"
      variant="solid"
      onClick={onRetry}
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'lg',
      }}
      _active={{
        transform: 'translateY(0)',
        boxShadow: 'none',
      }}
    >
      Intentar de nuevo
    </Button>
  </motion.div>
));

RetryButton.displayName = 'RetryButton';

// Componente Principal
const ErrorMessage = memo(({ 
  message, 
  onRetry, 
  variant = 'warning',
  size = 'md',
}: ErrorMessageProps) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry();
    }
  }, [onRetry]);

  return (
    <Box 
      ref={ref} 
      textAlign="center" 
      py={SIZES[size].padding} 
      px={SIZES[size].padding}
    >
      <AnimatePresence mode="sync">
        {inView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ErrorIcon variant={variant} size={size} />
            <ErrorText message={message} size={size} />
            {onRetry && <RetryButton onRetry={handleRetry} variant={variant} />}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
});

ErrorMessage.displayName = 'ErrorMessage';

export default ErrorMessage;