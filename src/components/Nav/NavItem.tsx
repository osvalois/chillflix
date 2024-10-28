import React, { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  HStack, 
  Text, 
  useColorModeValue, 
  useBreakpointValue,
  useTheme
} from '@chakra-ui/react';
import { rgba } from 'polished';
import { itemVariants } from '../../theme/animations';
import { NavItem } from '../../types';
import { DESIGN } from '../../theme/design';

// Optimized motion components with proper typing
const MotionBox = motion(Box as any);
const MotionText = motion(Text as any);

// Constants for performance optimization
const ANIMATION_CONFIG = {
  duration: DESIGN.animation.duration.normal,
  ease: DESIGN.animation.easing.smooth
} as const;

const HOVER_SCALE = 1.1;
const ROTATION_DEGREES = 360;
const BACKDROP_BLUR = '8px';

// Responsive configuration for better maintainability
const RESPONSIVE_CONFIG = {
  paddings: {
    base: '0.25rem',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem'
  },
  spacings: {
    base: '0.25rem',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.625rem',
    xl: '0.75rem'
  },
  fontSizes: {
    base: 'xs',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl'
  },
  maxWidths: {
    base: '60px',
    sm: '80px',
    md: '100px',
    lg: '120px',
    xl: '150px'
  },
  indicators: {
    width: {
      base: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px'
    },
    height: {
      base: '2px',
      md: '3px'
    },
    bottom: {
      base: '-8px',
      md: '-12px'
    }
  }
} as const;

interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

export const NavItemEnhanced = React.memo(({ 
  item, 
  isActive, 
  isHovered, 
  onClick, 
  onHoverStart, 
  onHoverEnd 
}: NavItemProps) => {
  const theme = useTheme();
  
  // Moving all hooks to the top level
  const textColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const iconSize = useBreakpointValue({
    base: 16,
    sm: 18,
    md: 20,
    lg: 24,
    xl: 28
  }) ?? 20;

  const isHighlighted = isActive || isHovered;

  // Memoized style computations
  const backgroundStyle = useMemo(() => ({
    backdropFilter: `blur(${BACKDROP_BLUR})`,
    boxShadow: `
      0 4px 15px ${rgba(item.pulseColor, 0.3)},
      0 1px 3px ${rgba(item.pulseColor, 0.2)},
      inset 0 0 0 1px ${rgba(item.pulseColor, 0.1)}
    `,
  }), [item.pulseColor]);

  const iconStyle = useMemo(() => ({
    filter: isHighlighted 
      ? `drop-shadow(0 0 8px ${rgba(item.pulseColor, 0.6)})`
      : 'none',
    transition: `filter ${theme.transition.duration.normal}`,
  }), [isHighlighted, item.pulseColor, theme.transition.duration.normal]);

  const textStyle = useMemo(() => ({
    textShadow: isHighlighted 
      ? `0 2px 4px ${rgba(item.pulseColor, 0.3)}`
      : 'none',
    transition: `all ${theme.transition.duration.normal}`,
  }), [isHighlighted, item.pulseColor, theme.transition.duration.normal]);

  // Optimized animation variants
  const highlightAnimationVariants = useMemo(() => ({
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.15 }
    }
  }), []);

  const iconAnimationVariants = useMemo(() => ({
    scale: isHighlighted ? HOVER_SCALE : 1,
    rotate: isHovered ? ROTATION_DEGREES : 0,
  }), [isHighlighted, isHovered]);

  // Memoized handlers
  const handleClick = useCallback(() => {
    requestAnimationFrame(onClick);
  }, [onClick]);

  const handleHoverStart = useCallback(() => {
    requestAnimationFrame(onHoverStart);
  }, [onHoverStart]);

  const handleHoverEnd = useCallback(() => {
    requestAnimationFrame(onHoverEnd);
  }, [onHoverEnd]);

  // Render optimization for active indicator
  const ActiveIndicator = useMemo(() => {
    if (!isActive) return null;

    return (
      <Box
        position="absolute"
        bottom={RESPONSIVE_CONFIG.indicators.bottom}
        left="50%"
        transform="translateX(-50%)"
        height={RESPONSIVE_CONFIG.indicators.height}
        width={RESPONSIVE_CONFIG.indicators.width}
        borderRadius="full"
        bg={`linear-gradient(to right, ${rgba(item.pulseColor, 0.8)}, ${rgba(item.pulseColor, 0.4)})`}
        boxShadow={`0 0 10px ${rgba(item.pulseColor, 0.4)}, 0 0 5px ${rgba(item.pulseColor, 0.2)}`}
      >
        <Box
          position="absolute"
          inset={0}
          borderRadius="full"
          bg={`linear-gradient(to right, ${rgba(item.pulseColor, 1)}, ${rgba(item.pulseColor, 0.6)})`}
          animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
          opacity={0.6}
        />
      </Box>
    );
  }, [isActive, item.pulseColor]);

  return (
    <MotionBox
      variants={itemVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={handleClick}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      position="relative"
      px={RESPONSIVE_CONFIG.paddings}
      py={{ base: '0.25rem', md: '0.5rem' }}
      role="button"
      aria-pressed={isActive}
      transition={`all ${theme.transition.duration.normal}`}
      _hover={{ transform: 'translateY(-1px)' }}
      style={{ willChange: 'transform' }}
    >
      <AnimatePresence>
        {isHighlighted && (
          <MotionBox
            position="absolute"
            inset={0}
            variants={highlightAnimationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            borderRadius="full"
            bg={item.gradient}
            style={backgroundStyle}
          />
        )}
      </AnimatePresence>

      <HStack 
        spacing={RESPONSIVE_CONFIG.spacings}
        position="relative" 
        zIndex={1}
        justify="center"
        align="center"
      >
        <MotionBox
          animate={iconAnimationVariants}
          transition={ANIMATION_CONFIG}
        >
          <Box
            color={isHighlighted ? 'white' : textColor}
            style={iconStyle}
          >
            <item.icon size={iconSize} />
          </Box>
        </MotionBox>

        <MotionText
          initial="hidden"
          animate="visible"
          exit="exit"
          className="text-white font-semibold tracking-wider whitespace-nowrap overflow-hidden"
          fontSize={RESPONSIVE_CONFIG.fontSizes}
          style={textStyle}
          maxW={RESPONSIVE_CONFIG.maxWidths}
          isTruncated
        >
          {item.label}
        </MotionText>
      </HStack>

      {ActiveIndicator}

      <style>
        {`
          @keyframes pulse {
            0%, 100% { 
              transform: scale(1); 
              opacity: 0.6; 
            }
            50% { 
              transform: scale(1.5); 
              opacity: 0; 
            }
          }
        `}
      </style>
    </MotionBox>
  );
});

NavItemEnhanced.displayName = 'NavItemEnhanced';

export default NavItemEnhanced;