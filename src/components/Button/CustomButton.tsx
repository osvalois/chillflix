import React, { useMemo, useCallback, useState } from 'react';
import {
  Button,
  Box,
  useColorModeValue,
  keyframes,
  chakra,
  SystemStyleObject,
  ChakraProps,
  Tooltip,
} from '@chakra-ui/react';
import { motion, AnimatePresence, MotionProps } from 'framer-motion';
import { Loader2, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const pulseAnimation = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }
  50% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.5); }
  100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }
`;

const spinAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

type ButtonStatus = 'normal' | 'loading' | 'disabled';

const VARIANTS: Record<string, Record<ButtonStatus, SystemStyleObject>> = {
  default: {
    normal: {
      bg: 'blue.500',
      color: 'white',
      _hover: { bg: 'blue.600', transform: 'scale(1.05)' },
      _active: { bg: 'blue.700', transform: 'scale(0.95)' },
    },
    loading: {
      bg: 'gray.500',
      color: 'white',
      animation: `${pulseAnimation} 2s infinite`,
      cursor: 'not-allowed',
    },
    disabled: {
      bg: 'blue.300',
      cursor: 'not-allowed',
      _hover: { transform: 'none' },
    },
  },
  minimal: {
    normal: {
      bg: 'transparent',
      color: 'gray.700',
      _hover: { bg: 'gray.100' },
      _active: { bg: 'gray.200' },
    },
    loading: {
      bg: 'gray.100',
      color: 'gray.500',
      animation: `${pulseAnimation} 2s infinite`,
      cursor: 'not-allowed',
    },
    disabled: {
      color: 'gray.400',
      bg: 'transparent',
      cursor: 'not-allowed',
    },
  },
  glass: {
    normal: {
      bg: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: 'white',
      _hover: { bg: 'rgba(255, 255, 255, 0.15)', transform: 'translateY(-2px)' },
      _active: { transform: 'translateY(0)' },
    },
    loading: {
      bg: 'rgba(128, 128, 128, 0.2)',
      color: 'gray.300',
      animation: `${pulseAnimation} 2s infinite`,
      cursor: 'not-allowed',
    },
    disabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
      _hover: { transform: 'none' },
    },
  },
};

const LoadingSpinner = chakra(Loader2, {
  baseStyle: {
    animation: `${spinAnimation} 1s linear infinite`,
  },
});

const SIZE_STYLES = {
  sm: { padding: '0.5rem', fontSize: 'sm', iconSize: 16, spinnerSize: 14 },
  md: { padding: '0.75rem', fontSize: 'md', iconSize: 20, spinnerSize: 18 },
  lg: { padding: '1rem', fontSize: 'lg', iconSize: 24, spinnerSize: 22 },
} as const;

const PLACEMENT_STYLES = {
  'top-left': { top: 4, left: 4 },
  'top-right': { top: 4, right: 4 },
  'bottom-left': { bottom: 4, left: 4 },
  'bottom-right': { bottom: 4, right: 4 },
  center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
} as const;

const AnimatedBox = chakra(motion(Box));
const AnimatedButton = chakra(motion(Button), {
  shouldForwardProp: (prop) =>
    !['variants', 'initial', 'animate', 'exit', 'whileHover', 'whileTap'].includes(prop),
});

interface FloatingButtonStylesProps {
  variant: keyof typeof VARIANTS;
  size: keyof typeof SIZE_STYLES;
  showGlow: boolean;
  status: ButtonStatus;
}

const useFloatingButtonStyles = ({
  variant,
  size,
  showGlow,
  status,
}: FloatingButtonStylesProps) => {
  const textColor = useColorModeValue('gray.800', 'white');
  
  return useMemo(() => ({
    baseStyle: {
      ...VARIANTS[variant][status],
      opacity: status === 'loading' ? 0.8 : 1,
      animation: showGlow ? `${glowAnimation} 2s infinite` : undefined,
    },
    size: SIZE_STYLES[size],
    textColor: status === 'loading' ? 'gray.500' : textColor,
  }), [variant, size, showGlow, textColor, status]);
};

interface FloatingButtonProps extends Omit<ChakraProps & MotionProps, 'onClick' | 'position'> {
  onClick: () => void | Promise<void>;
  text?: string;
  buttonVariant?: keyof typeof VARIANTS;
  buttonSize?: keyof typeof SIZE_STYLES;
  buttonPlacement?: keyof typeof PLACEMENT_STYLES;
  showIcon?: boolean;
  iconType?: 'arrow' | 'chevron';
  iconPosition?: 'left' | 'right';
  showGlow?: boolean;
  zIndex?: number;
  isLoading?: boolean;
  isDisabled?: boolean;
  loadingMessage?: string;
  loadingTooltip?: string;
}

export const FloatingButton: React.FC<FloatingButtonProps> = React.memo(({
  onClick,
  text = 'Button',
  buttonVariant = 'default',
  buttonSize = 'md',
  buttonPlacement = 'bottom-right',
  showIcon = true,
  iconType = 'arrow',
  iconPosition = 'left',
  showGlow = false,
  zIndex = 1000,
  isLoading = false,
  isDisabled = false,
  loadingMessage = 'Processing...',
  loadingTooltip = 'Please wait while we process your request',
  ...props
}) => {
  const [clickCount, setClickCount] = useState(0);
  const status: ButtonStatus = isDisabled ? 'disabled' : (isLoading ? 'loading' : 'normal');
  
  const { baseStyle, size } = useFloatingButtonStyles({
    variant: buttonVariant,
    size: buttonSize,
    showGlow,
    status,
  });

  const Icon = iconType === 'arrow'
    ? (iconPosition === 'left' ? ArrowLeft : ArrowRight)
    : (iconPosition === 'left' ? ChevronLeft : ChevronRight);

  const buttonMotion = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    whileHover: { scale: (!isLoading && buttonVariant !== 'minimal') ? 1.05 : 1, transition: { duration: 0.2 } },
    whileTap: { scale: !isLoading ? 0.95 : 1, transition: { duration: 0.1 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  };

  const handleClick = useCallback(async () => {
    if (!isLoading && !isDisabled) {
      setClickCount(prev => prev + 1);
      await onClick();
    }
  }, [isLoading, isDisabled, onClick]);

  const button = (
    <AnimatedButton
      onClick={handleClick}
      disabled={isLoading || isDisabled}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        transition: 'all 0.3s ease',
        pointerEvents: isLoading || isDisabled ? 'none' : 'auto',
        ...baseStyle,
      }}
      initial={buttonMotion.initial}
      animate={buttonMotion.animate}
      exit={buttonMotion.exit}
      whileHover={buttonMotion.whileHover}
      whileTap={buttonMotion.whileTap}
      aria-busy={isLoading}
      {...props}
    >
      <Box display="flex" alignItems="center" gap={2} aria-live="polite">
        {isLoading && <LoadingSpinner size={size.spinnerSize} />}
        {showIcon && iconPosition === 'left' && !isLoading && <Icon size={size.iconSize} />}
        <span>{isLoading ? loadingMessage : text}</span>
        {showIcon && iconPosition === 'right' && !isLoading && <Icon size={size.iconSize} />}
      </Box>
    </AnimatedButton>
  );

  return (
    <AnimatePresence>
      <AnimatedBox
        position="fixed"
        {...PLACEMENT_STYLES[buttonPlacement]}
        zIndex={zIndex}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {isLoading ? (
          <Tooltip label={loadingTooltip} hasArrow>
            {button}
          </Tooltip>
        ) : (
          button
        )}
      </AnimatedBox>
    </AnimatePresence>
  );
});

FloatingButton.displayName = 'FloatingButton';

interface ErrorState {
  message: string;
  count: number;
}

export const FloatingButtonWithErrorHandling: React.FC<FloatingButtonProps> = React.memo((props) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);

  const handleClick = async () => {
    if (!props.isLoading && !internalLoading) {
      try {
        setError(null);
        setInternalLoading(true);
        await props.onClick();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(prev => ({
          message,
          count: (prev?.count || 0) + 1
        }));
        console.error('Error:', err);
      } finally {
        setInternalLoading(false);
      }
    }
  };

  return (
    <FloatingButton
      {...props}
      onClick={handleClick}
      isLoading={internalLoading || props.isLoading}
      isDisabled={!!error && error.count >= 3}
      loadingTooltip={error ? `Error: ${error.message}` : props.loadingTooltip}
    />
  );
});

FloatingButtonWithErrorHandling.displayName = 'FloatingButtonWithErrorHandling';

export default FloatingButtonWithErrorHandling;