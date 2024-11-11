import React, { memo, useState, useCallback } from 'react';
import { Box, Flex, Text, useColorModeValue, useTheme, useBreakpointValue } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { rgba } from 'polished';

const DIMENSIONS = {
  base: {
    icon: { width: '40px', height: '40px' },
    text: { fontSize: 'lg', spacing: '2' }
  },
  sm: {
    icon: { width: '45px', height: '45px' },
    text: { fontSize: 'xl', spacing: '3' }
  },
  md: {
    icon: { width: '50px', height: '50px' },
    text: { fontSize: '2xl', spacing: '4' }
  },
  lg: {
    icon: { width: '55px', height: '55px' },
    text: { fontSize: '3xl', spacing: '4' }
  },
  xl: {
    icon: { width: '60px', height: '60px' },
    text: { fontSize: '4xl', spacing: '5' }
  }
} as const;

// Optimized motion components
const MotionBox = motion.create(Box as any);
const MotionFlex = motion.create(Flex as any);

// Types
interface LogoProps {
  className?: string;
  onClick?: () => void;
}

// Utility hook for theme colors
const useThemeColors = () => {
  const theme = useTheme();
  
  return {
    base: useColorModeValue(theme.colors.blue[500], theme.colors.purple[400]),
    accent: useColorModeValue(theme.colors.purple[500], theme.colors.pink[300]),
    text: useColorModeValue('gray.800', 'whiteAlpha.900'),
    border: useColorModeValue('whiteAlpha.300', 'whiteAlpha.200')
  };
};

// Main Logo Component
const Logo = memo(({ className, onClick }: LogoProps) => {
  // State
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Theme and colors
  const colors = useThemeColors();
  const dimensions = useBreakpointValue(DIMENSIONS) ?? DIMENSIONS.base;
  
  // Handlers
  const handleHover = useCallback((hover: boolean) => setIsHovered(hover), []);
  const handleLoad = useCallback(() => setIsLoaded(true), []);
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
  }, [onClick]);

  // Memoized styles
  const containerStyles = {
    background: `linear-gradient(135deg, ${rgba(colors.base, 0.05)} 0%, ${rgba(colors.accent, 0.05)} 100%)`,
    backdropFilter: 'blur(8px)',
    boxShadow: `0 4px 12px ${rgba(colors.base, 0.15)}`,
    borderRadius: 'xl',
    overflow: 'hidden',
    transition: 'all 0.2s ease-out',
    willChange: 'transform',
    cursor: onClick ? 'pointer' : 'default'
  };

  const imageStyles = {
    opacity: isLoaded ? 1 : 0,
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
    transition: 'opacity 0.3s ease, transform 0.2s ease',
    willChange: 'transform, opacity'
  };

  // Animations
  const containerAnimation = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2 }
  };

  const textAnimation = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
    transition: { duration: 0.2, delay: 0.1 }
  };

  return (
    <MotionFlex
      className={className}
      direction="row"
      alignItems="center"
      justifyContent="flex-start"
      gap={dimensions.text.spacing}
      {...containerAnimation}
    >
      <AnimatePresence mode="sync">
        <MotionBox
          width={dimensions.icon.width}
          height={dimensions.icon.height}
          sx={containerStyles}
          onHoverStart={() => handleHover(true)}
          onHoverEnd={() => handleHover(false)}
          onClick={handleClick}
          layoutId="logo-container"
        >
          <Box
            as="img"
            src="/chillflix.png"
            alt="Logo"
            width="100%"
            height="100%"
            objectFit="cover"
            loading="eager"
            decoding="async"
            draggable={false}
            onLoad={handleLoad}
            style={imageStyles}
          />
        </MotionBox>

        {/* Text appears on larger screens */}
        {dimensions.text.fontSize !== 'lg' && (
          <MotionBox {...textAnimation}>
            <Text
              fontSize={dimensions.text.fontSize}
              fontWeight="bold"
              bgGradient={`linear(to-r, ${colors.base}, ${colors.accent})`}
              bgClip="text"
              letterSpacing="tight"
              whiteSpace="nowrap"
            >
              Chillflix
            </Text>
          </MotionBox>
        )}
      </AnimatePresence>
    </MotionFlex>
  );
});

// Performance optimization
Logo.displayName = 'Logo';

export default Logo;