import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Clock, Star } from 'lucide-react';
import useSound from 'use-sound';
import { Box, Button, Flex, Text, Badge, useColorMode, Tooltip } from '@chakra-ui/react';
import { rgba } from 'polished';
import { useHotkeys } from 'react-hotkeys-hook';

// Types
type GlassMorphismIntensity = 'light' | 'medium' | 'heavy';

interface GlassMorphismConfig {
  blur?: number;
  opacity?: number;
  border?: boolean;
  intensity?: GlassMorphismIntensity;
}

interface PositionConfig {
  floating?: boolean;
  offset?: { x?: number; y?: number };
  zIndex?: number;
}

interface WatchButtonProps {
  onClick?: (e: React.MouseEvent) => void;
  isLoading?: boolean;
  isPlaying?: boolean;
  hotkey?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'ghost' | 'outline' | 'gradient' | 'glass';
  withSound?: boolean;
  tooltip?: string;
  showRipple?: boolean;
  accentColor?: string;
  icon?: React.ReactNode;
  loadingText?: string;
  customText?: string;
  animated?: boolean;
  disabled?: boolean;
  progress?: number;
  rating?: number;
  duration?: string;
  glassMorphism?: GlassMorphismConfig;
  position?: PositionConfig;
  className?: string;
}

// Constants
const INTENSITY_MAP: Record<GlassMorphismIntensity, { blur: number; opacity: number }> = {
  light: { blur: 5, opacity: 0.5 },
  medium: { blur: 10, opacity: 0.7 },
  heavy: { blur: 15, opacity: 0.8 }
};

const SIZE_MAP = {
  sm: {
    iconSize: 16,
    fontSize: 'sm',
    padding: '2',
    height: '8'
  },
  md: {
    iconSize: 20,
    fontSize: 'md',
    padding: '3',
    height: '10'
  },
  lg: {
    iconSize: 24,
    fontSize: 'lg',
    padding: '4',
    height: '12'
  }
};

// Animations
const buttonVariants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -2,
    transition: { type: 'spring', stiffness: 400, damping: 10 }
  },
  tap: { scale: 0.98, y: 0 }
};

const glowVariants = {
  initial: { opacity: 0, scale: 0.5 },
  hover: {
    opacity: 0.5,
    scale: 1.2,
    transition: { duration: 0.3 }
  }
};

// Component
export const WatchButton = React.memo(({
  onClick,
  isLoading = false,
  isPlaying = false,
  hotkey = 'space',
  size = 'md',
  withSound = true,
  tooltip,
  showRipple = true,
  accentColor = 'blue.500',
  icon,
  loadingText = 'Loading...',
  customText,
  animated = true,
  disabled = false,
  progress,
  rating,
  duration,
  glassMorphism = {
    blur: 10,
    opacity: 0.7,
    border: true,
    intensity: 'medium'
  },
  position = {
    floating: false,
    offset: { x: 0, y: 0 },
    zIndex: 10
  },
  className = '',
}: WatchButtonProps) => {
  // State
  const [isHovered, setIsHovered] = useState(false);
  const [ripple, setRipple] = useState({ x: 0, y: 0, show: false });
  
  // Hooks
  const { colorMode } = useColorMode();
  
  // Sound effects
  const [playHover] = useSound('/hover.mp3', { 
    volume: 0.5,
    sprite: { hover: [0, 300] }
  });
  const [playClick] = useSound('/click.mp3', { 
    volume: 0.7,
    sprite: { click: [0, 200] }
  });

  // Hotkey handling
  useHotkeys(hotkey, (e) => {
    e.preventDefault();
    if (!disabled && !isLoading && onClick) {
      onClick(e as any);
      withSound && playClick();
    }
  }, [onClick, disabled, isLoading, withSound]);

  // Styles
  const glassStyles = useMemo(() => {
    const intensity = INTENSITY_MAP[glassMorphism.intensity || 'medium'];
    const baseOpacity = glassMorphism.opacity || intensity.opacity;
    const baseBlur = glassMorphism.blur || intensity.blur;

    return {
      backdropFilter: `blur(${baseBlur}px)`,
      backgroundColor: colorMode === 'light'
        ? rgba(255, 255, 255, baseOpacity * 0.8)
        : rgba(26, 32, 44, baseOpacity * 0.9),
      borderColor: colorMode === 'light'
        ? rgba(255, 255, 255, 0.5)
        : rgba(255, 255, 255, 0.1),
      boxShadow: colorMode === 'light'
        ? '0 8px 32px rgba(31, 38, 135, 0.15)'
        : '0 8px 32px rgba(0, 0, 0, 0.3)',
      border: glassMorphism.border ? '1px solid' : 'none',
    };
  }, [glassMorphism, colorMode]);

  // Event Handlers
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    withSound && playHover();
  }, [withSound]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (showRipple) {
      const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
      setRipple({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        show: true
      });
      setTimeout(() => setRipple(prev => ({ ...prev, show: false })), 500);
    }
    withSound && playClick();
    onClick?.(e);
  }, [onClick, showRipple, withSound]);

  // Render helpers
  const renderIcon = () => icon || (isPlaying ? 
    <Pause size={SIZE_MAP[size].iconSize} /> : 
    <Play size={SIZE_MAP[size].iconSize} />
  );

  const renderMetadata = () => (
    <Flex gap={2} align="center">
      {rating && (
        <Badge variant="subtle" colorScheme="yellow" fontSize="xs">
          <Flex align="center" gap={1}>
            <Star size={12} />
            {rating.toFixed(1)}
          </Flex>
        </Badge>
      )}
      {duration && (
        <Badge variant="subtle" colorScheme="gray" fontSize="xs">
          <Flex align="center" gap={1}>
            <Clock size={12} />
            {duration}
          </Flex>
        </Badge>
      )}
    </Flex>
  );

  const button = (
    <Box
      as={motion.div}
      position="relative"
      className={className}
      style={{
        transform: position.floating ? 
          `translate(${position.offset?.x || 0}px, ${position.offset?.y || 0}px)` : 
          undefined,
        zIndex: position.zIndex
      }}
    >
      <AnimatePresence>
        {isHovered && !disabled && !isLoading && (
          <Box
            as={motion.div}
            position="absolute"
            inset={0}
            variants={glowVariants}
            initial="initial"
            animate="hover"
            exit="initial"
            bg={accentColor}
            filter="blur(20px)"
            opacity={0.2}
            borderRadius="xl"
          />
        )}
      </AnimatePresence>

      <Button
        as={motion.button}
        variants={animated ? buttonVariants : undefined}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        position="relative"
        overflow="hidden"
        px={SIZE_MAP[size].padding}
        height={SIZE_MAP[size].height}
        borderRadius="xl"
        disabled={disabled || isLoading}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...glassStyles}
      >
        <Flex align="center" gap={3}>
          {renderIcon()}
          
          <Flex direction="column" align="start" gap={1}>
            <Text
              fontWeight="semibold"
              fontSize={SIZE_MAP[size].fontSize}
              color={colorMode === 'light' ? 'gray.800' : 'white'}
            >
              {isLoading ? loadingText : customText || (isPlaying ? 'Pause' : 'Watch Now')}
            </Text>
            {(rating || duration) && renderMetadata()}
          </Flex>
        </Flex>

        {progress !== undefined && (
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            height="2px"
            bg={colorMode === 'light' ? 'blackAlpha.100' : 'whiteAlpha.100'}
          >
            <Box
              as={motion.div}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              height="100%"
              bg={accentColor}
            />
          </Box>
        )}

        {ripple.show && (
          <Box
            as={motion.div}
            position="absolute"
            top={ripple.y}
            left={ripple.x}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            rounded="full"
            bg="white"
            w="20px"
            h="20px"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </Button>
    </Box>
  );

  return tooltip ? (
    <Tooltip
      label={tooltip}
      isDisabled={disabled || isLoading}
      hasArrow
      placement="top"
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
      color={colorMode === 'light' ? 'gray.800' : 'white'}
      px={3}
      py={2}
      borderRadius="md"
    >
      {button}
    </Tooltip>
  ) : button;
});

WatchButton.displayName = 'WatchButton';

export default WatchButton;