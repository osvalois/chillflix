// src/components/BackButton/BackButton.tsx
import React from 'react';
import { Button, ButtonProps, Box, Text, keyframes } from '@chakra-ui/react';
import { FaChevronLeft } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }
  50% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.5); }
  100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }
`;

interface BackButtonProps extends Omit<ButtonProps, 'onClick'> {
  onBack: () => void;
  showLabel?: boolean;
  label?: string;
  variant?: 'default' | 'minimal' | 'glassmorphic';
  position?: 'fixed' | 'absolute' | 'relative';
  showGlow?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
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
};

const sizeStyles = {
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
};

export const BackButton: React.FC<BackButtonProps> = ({
  onBack,
  showLabel = true,
  label = "Back",
  variant = "default",
  position = "fixed",
  showGlow = false,
  size = "md",
  ...props
}) => {
  const buttonVariants = {
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
    },
    hover: {
      scale: variant === 'minimal' ? 1 : 1.05,
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  };

  const currentVariant = variants[variant];
  const currentSize = sizeStyles[size];

  return (
    <AnimatePresence>
      <Box
        as={motion.div}
        position={position}
        top={position === 'fixed' ? 12 : undefined}
        left={position === 'fixed' ? 4 : undefined}
        zIndex={10}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={buttonVariants}
        {...props}
      >
        <Button
          as={motion.button}
          leftIcon={<FaChevronLeft size={currentSize.iconSize} />}
          onClick={onBack}
          display="flex"
          alignItems="center"
          justifyContent="center"
          padding={currentSize.padding}
          fontSize={currentSize.fontSize}
          borderRadius="lg"
          color="white"
          transition="all 0.3s ease"
          whileHover="hover"
          whileTap="tap"
          animation={showGlow ? `${glowAnimation} 2s infinite` : undefined}
          {...currentVariant}
          {...props}
        >
          {showLabel && (
            <Text
              as={motion.span}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              ml={1}
            >
              {label}
            </Text>
          )}
        </Button>
      </Box>
    </AnimatePresence>
  );
};

// HOC para manejar estados de error
export const BackButtonWithErrorHandling: React.FC<BackButtonProps> = (props) => {
  const handleClick = () => {
    try {
      props.onBack();
    } catch (error) {
      console.error('Error navigating back:', error);
      // Aquí podrías mostrar un toast o alguna notificación de error
    }
  };

  return <BackButton {...props} onBack={handleClick} />;
};

// Componente de pruebas para documentación y desarrollo
export const BackButtonStory: React.FC = () => {
  return (
    <Box p={4} bg="gray.900" minH="100vh">
      <BackButton
        onBack={() => console.log('Navigating back...')}
        variant="glassmorphic"
        showGlow
        size="lg"
      />
    </Box>
  );
};

export default BackButtonWithErrorHandling;