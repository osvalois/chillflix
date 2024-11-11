import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Button,
  ButtonProps,
  Box,
  Text,
  keyframes,
  useColorModeValue,
  chakra
} from '@chakra-ui/react';
import { DynamicIcon } from '../Movie/Icons';

// Types
interface BackButtonProps extends Omit<ButtonProps, 'onClick'> {
  onBack: () => void;
  showLabel?: boolean;
  label?: string;
  variant?: 'default' | 'minimal' | 'glassmorphic';
  position?: 'fixed' | 'absolute' | 'relative';
  showGlow?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Constants and Styles
const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }
  50% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.5); }
  100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }
`;

const VARIANTS = {
  default: {
    bg: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(5px)",
    _hover: {
      bg: "rgba(255, 255, 255, 0.2)",
      transform: "scale(1.05)"
    },
    _active: {
      bg: "rgba(255, 255, 255, 0.15)",
      transform: "scale(0.95)"
    }
  },
  minimal: {
    bg: "transparent",
    _hover: {
      bg: "rgba(255, 255, 255, 0.1)"
    },
    _active: {
      bg: "rgba(255, 255, 255, 0.05)"
    }
  },
  glassmorphic: {
    bg: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
    _hover: {
      bg: "rgba(255, 255, 255, 0.15)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      transform: "translateY(-2px)"
    },
    _active: {
      transform: "translateY(0)"
    }
  }
} as const;

const SIZE_STYLES = {
  sm: {
    padding: "0.5rem",
    fontSize: "sm",
    iconSize: 12
  },
  md: {
    padding: "0.75rem",
    fontSize: "md",
    iconSize: 14
  },
  lg: {
    padding: "1rem",
    fontSize: "lg",
    iconSize: 16
  }
} as const;

// Animation variants
const MOTION_VARIANTS = {
  initial: { 
    opacity: 0,
    x: -20 
  },
  animate: { 
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
} as const;

// Helper Components
const AnimatedBox = chakra(motion(Box as any));
const AnimatedButton = chakra(motion(Button as any));
const AnimatedText = chakra(motion(Text as any));

const ButtonLabel: React.FC<{ label: string }> = React.memo(({ label }) => (
  <AnimatedText
    as="span"
    initial={{ opacity: 0, x: -5 }}
    animate={{ opacity: 1, x: 0 }}
    ml={1}
  >
    {label}
  </AnimatedText>
));

ButtonLabel.displayName = 'ButtonLabel';

// Custom Hooks
const useBackButtonStyles = (
  variant: keyof typeof VARIANTS,
  size: keyof typeof SIZE_STYLES,
  showGlow: boolean
) => {
  const textColor = useColorModeValue('gray.800', 'white');

  return useMemo(() => ({
    variant: VARIANTS[variant],
    size: SIZE_STYLES[size],
    animation: showGlow ? `${glowAnimation} 2s infinite` : undefined,
    color: textColor,
  }), [variant, size, showGlow, textColor]);
};

// Main Component
export const BackButton: React.FC<BackButtonProps> = React.memo(({
  onBack,
  showLabel = true,
  label = "Back",
  variant = "default",
  position = "fixed",
  showGlow = false,
  size = "md",
  ...props
}) => {
  const styles = useBackButtonStyles(variant, size, showGlow);

  const buttonHoverVariants = useMemo(() => ({
    hover: {
      scale: variant === 'minimal' ? 1 : 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  }), [variant]);

  return (
    <AnimatePresence>
      <AnimatedBox
        position={position}
        top={position === 'fixed' ? 12 : undefined}
        left={position === 'fixed' ? 4 : undefined}
        zIndex={10}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={MOTION_VARIANTS}
        {...props}
      >
        <AnimatedButton
          leftIcon={<DynamicIcon name="ChevronDown" size={styles.size.iconSize} style="default" />}
          onClick={onBack}
          display="flex"
          alignItems="center"
          justifyContent="center"
          padding={styles.size.padding}
          fontSize={styles.size.fontSize}
          borderRadius="lg"
          color={styles.color}
          transition="all 0.3s ease"
          whileHover="hover"
          whileTap="tap"
          animation={styles.animation}
          variants={buttonHoverVariants}
          {...styles.variant}
          {...props}
        >
          {showLabel && <ButtonLabel label={label} />}
        </AnimatedButton>
      </AnimatedBox>
    </AnimatePresence>
  );
});

BackButton.displayName = 'BackButton';

// Error Boundary HOC
export const BackButtonWithErrorHandling: React.FC<BackButtonProps> = React.memo((props) => {
  const handleClick = () => {
    try {
      props.onBack();
    } catch (error) {
      console.error('Error navigating back:', error);
    }
  };

  return <BackButton {...props} onBack={handleClick} />;
});

BackButtonWithErrorHandling.displayName = 'BackButtonWithErrorHandling';

// Development/Testing Component
export const BackButtonStory: React.FC = () => (
  <Box p={4} bg="gray.900" minH="100vh">
    <BackButton
      onBack={() => console.log('Navigating back...')}
      variant="glassmorphic"
      showGlow
      size="lg"
    />
  </Box>
);

export default BackButtonWithErrorHandling;