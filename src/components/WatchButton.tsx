import React, { useState, useMemo, useCallback, memo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';
import { Box, Button, Flex, Text, Badge, useColorMode, Tooltip } from '@chakra-ui/react';
import { rgba } from 'polished';
import { useHotkeys } from 'react-hotkeys-hook';
import { DynamicIcon } from './Movie/Icons';
import { useMemoOne } from 'use-memo-one';

// Refined types
type ButtonState = 'idle' | 'loading' | 'success' | 'error';
type GlassMorphismIntensity = 'light' | 'medium' | 'heavy';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
type ButtonVariant = 'solid' | 'ghost' | 'outline' | 'gradient' | 'glass' | 'minimal';

interface GlassMorphismConfig {
  readonly blur?: number;
  readonly opacity?: number;
  readonly border?: boolean;
  readonly intensity?: GlassMorphismIntensity;
  readonly borderGlow?: boolean;
}

interface WatchButtonProps {
  readonly onClick?: (e: React.MouseEvent) => void;
  readonly isLoading?: boolean;
  readonly isPlaying?: boolean;
  readonly hotkey?: string;
  readonly size?: ButtonSize;
  readonly variant?: ButtonVariant;
  readonly withSound?: boolean;
  readonly tooltip?: string;
  readonly showRipple?: boolean;
  readonly accentColor?: string;
  readonly icon?: React.ReactNode;
  readonly loadingText?: string;
  readonly customText?: string;
  readonly animated?: boolean;
  readonly disabled?: boolean;
  readonly progress?: number;
  readonly rating?: number;
  readonly duration?: string;
  readonly quality?: string;
  readonly glassMorphism?: Readonly<GlassMorphismConfig>;
  readonly className?: string;
  readonly showMetadata?: boolean;
  readonly elevation?: 'none' | 'low' | 'medium' | 'high';
}

// Enhanced size configurations
const SIZE_CONFIG = {
  sm: {
    height: '32px',
    fontSize: '14px',
    iconSize: 16,
    padding: '12px',
    gap: '8px',
    borderRadius: '8px',
    metadataSize: '12px'
  },
  md: {
    height: '40px',
    fontSize: '15px',
    iconSize: 20,
    padding: '16px',
    gap: '10px',
    borderRadius: '10px',
    metadataSize: '13px'
  },
  lg: {
    height: '48px',
    fontSize: '16px',
    iconSize: 24,
    padding: '20px',
    gap: '12px',
    borderRadius: '12px',
    metadataSize: '14px'
  },
  xl: {
    height: '56px',
    fontSize: '18px',
    iconSize: 28,
    padding: '24px',
    gap: '14px',
    borderRadius: '14px',
    metadataSize: '15px'
  }
} as const;

// Enhanced animations
const buttonAnimations = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -2,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
      mass: 0.8
    }
  },
  tap: { 
    scale: 0.98,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15
    }
  },
  disabled: {
    scale: 1,
    opacity: 0.6
  }
} as const;

const glowAnimations = {
  initial: { 
    opacity: 0,
    scale: 0.8
  },
  hover: {
    opacity: 0.6,
    scale: 1.1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
} as const;

// Component implementation
export const WatchButton = memo(({
  onClick,
  isLoading = false,
  isPlaying = false,
  hotkey = 'space',
  size = 'md',
  variant = 'solid',
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
  quality,
  showMetadata = true,
  elevation = 'medium',
  glassMorphism = {
    blur: 12,
    opacity: 0.7,
    border: true,
    intensity: 'medium',
    borderGlow: true
  },
  className = ''
}: WatchButtonProps) => {
  // States and refs
  const [isHovered, setIsHovered] = useState(false);
  const [rippleEffect, setRippleEffect] = useState({ x: 0, y: 0, show: false });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleTimeoutRef = useRef<NodeJS.Timeout>();
  const { colorMode } = useColorMode();

  // Sound effects
  const [playHover] = useSound('/hover.mp3', useMemoOne(() => ({
    volume: 0.4,
    sprite: { hover: [0, 150] }
  }), []));

  const [playClick] = useSound('/click.mp3', useMemoOne(() => ({
    volume: 0.6,
    sprite: { click: [0, 200] }
  }), []));

  // Memoized styles
  const computedStyles = useMemoOne(() => {
    const sizeConfig = SIZE_CONFIG[size];
    const isDark = colorMode === 'dark';
    
    const getElevation = () => {
      const elevationMap = {
        none: 'none',
        low: isDark 
          ? '0 2px 4px rgba(0,0,0,0.2)'
          : '0 2px 4px rgba(0,0,0,0.1)',
        medium: isDark
          ? '0 4px 12px rgba(0,0,0,0.3)'
          : '0 4px 12px rgba(0,0,0,0.15)',
        high: isDark
          ? '0 8px 24px rgba(0,0,0,0.4)'
          : '0 8px 24px rgba(0,0,0,0.2)'
      };
      return elevationMap[elevation];
    };

    const getVariantStyles = () => {
      switch (variant) {
        case 'glass':
          return {
            background: isDark
              ? rgba(26, 32, 44, glassMorphism.opacity || 0.7)
              : rgba(255, 255, 255, glassMorphism.opacity || 0.7),
            backdropFilter: `blur(${glassMorphism.blur}px)`,
            border: glassMorphism.border ? '1px solid' : 'none',
            borderColor: isDark
              ? rgba(255, 255, 255, 0.1)
              : rgba(255, 255, 255, 0.5),
          };
        case 'gradient':
          return {
            background: isPlaying
              ? 'linear-gradient(135deg, #FF4B4B 0%, #FF9749 100%)'
              : 'linear-gradient(135deg, #4B7BFF 0%, #49A6FF 100%)',
            color: 'white',
          };
        case 'minimal':
          return {
            background: 'transparent',
            border: '1px solid',
            borderColor: isDark ? 'whiteAlpha.200' : 'blackAlpha.200',
          };
        default:
          return {
            background: isDark ? 'gray.800' : 'white',
            border: '1px solid',
            borderColor: isDark ? 'whiteAlpha.100' : 'blackAlpha.100',
          };
      }
    };

    return {
      button: {
        height: sizeConfig.height,
        fontSize: sizeConfig.fontSize,
        padding: sizeConfig.padding,
        borderRadius: sizeConfig.borderRadius,
        boxShadow: getElevation(),
        ...getVariantStyles(),
      },
      metadata: {
        fontSize: sizeConfig.metadataSize,
        gap: sizeConfig.gap,
      }
    };
  }, [size, variant, colorMode, glassMorphism, isPlaying, elevation]);

  // Event handlers
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    withSound && playHover();
  }, [withSound, playHover]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (disabled || isLoading) return;

    if (showRipple && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setRippleEffect({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        show: true
      });

      if (rippleTimeoutRef.current) {
        clearTimeout(rippleTimeoutRef.current);
      }
      
      rippleTimeoutRef.current = setTimeout(() => {
        setRippleEffect(prev => ({ ...prev, show: false }));
      }, 600);
    }

    withSound && playClick();
    onClick?.(e);
  }, [onClick, disabled, isLoading, showRipple, withSound, playClick]);

  // Metadata rendering
  const renderMetadata = useMemo(() => {
    if (!showMetadata || (!rating && !duration && !quality)) return null;

    return (
      <Flex gap="2" align="center" style={{ fontSize: computedStyles.metadata.fontSize }}>
        {rating && (
          <Badge 
            variant="subtle" 
            colorScheme="yellow"
            display="flex"
            alignItems="center"
            gap="1"
          >
            <DynamicIcon 
              name="Star" 
              size={SIZE_CONFIG[size].iconSize - 4}
              color={colorMode === 'light' ? 'black' : 'white'}
            />
            {rating.toFixed(1)}
          </Badge>
        )}
        
        {duration && (
          <Badge 
            variant="subtle" 
            colorScheme="gray"
            display="flex"
            alignItems="center"
            gap="1"
          >
            <DynamicIcon 
              name="Clock" 
              size={SIZE_CONFIG[size].iconSize - 4}
              color={colorMode === 'light' ? 'black' : 'white'}
            />
            {duration}
          </Badge>
        )}

        {quality && (
          <Badge 
            variant="subtle" 
            colorScheme="blue"
            display="flex"
            alignItems="center"
            gap="1"
          >
            <DynamicIcon 
              name="Play" 
              size={SIZE_CONFIG[size].iconSize - 4}
              color={colorMode === 'light' ? 'black' : 'white'}
            />
            {quality}
          </Badge>
        )}
      </Flex>
    );
  }, [rating, duration, quality, size, colorMode, computedStyles.metadata.fontSize, showMetadata]);

  // Main button content
  const buttonContent = (
    <Box
      as={motion.div}
      position="relative"
      className={className}
      initial={false}
    >
      <AnimatePresence>
        {isHovered && !disabled && !isLoading && (
          <Box
            as={motion.div}
            position="absolute"
            inset={0}
            variants={glowAnimations}
            initial="initial"
            animate="hover"
            exit="initial"
            style={{
              background: variant === 'gradient' 
                ? 'inherit'
                : accentColor,
              filter: 'blur(20px)',
              borderRadius: computedStyles.button.borderRadius,
            }}
          />
        )}
      </AnimatePresence>

      <Button
        ref={buttonRef}
        as={motion.button}
        variants={animated ? buttonAnimations : undefined}
        initial="initial"
        animate={disabled ? 'disabled' : 'initial'}
        whileHover={disabled ? undefined : 'hover'}
        whileTap={disabled ? undefined : 'tap'}
        disabled={disabled || isLoading}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          ...computedStyles.button,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: computedStyles.metadata.gap,
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <Flex align="center" gap={computedStyles.metadata.gap}>
          {icon || (
            <DynamicIcon
              name={isPlaying ? "Pause" : "Play"}
              size={SIZE_CONFIG[size].iconSize}
              color={colorMode === 'light' ? 'black' : 'white'}
            />
          )}
          
          <Flex direction="column" align="start" gap="1">
            <Text
              fontWeight="600"
              style={{ fontSize: computedStyles.button.fontSize }}
              color={colorMode === 'light' ? 'gray.800' : 'white'}
            >
              {isLoading ? loadingText : customText || (isPlaying ? 'Pause' : 'Watch Now')}
            </Text>
            {renderMetadata}
          </Flex>
        </Flex>

        {progress !== undefined && (
          <Box
            position="absolute"
            bottom="0"
            left="0"
            right="0"
            height="3px"
            bg={colorMode === 'light' ? 'blackAlpha.100' : 'whiteAlpha.100'}
          >
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              style={{
                height: '100%',
                background: accentColor,
                borderRadius: '0 3px 3px 0'
              }}
            />
          </Box>
        )}

        {rippleEffect.show && (
          <motion.div
            initial={{ scale: 0, opacity: 0.35 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: rippleEffect.y,
              left: rippleEffect.x,
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: 'white',
              pointerEvents: 'none',
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
      </Button>
    </Box>
  );

  // Tooltip wrapper
  const wrappedButton = useMemo(() => {
    if (!tooltip) return buttonContent;

    return (
      <Tooltip
        label={tooltip}
        isDisabled={disabled || isLoading}
        hasArrow
        placement="top"
        bg={colorMode === 'light' ? 'white' : 'gray.800'}
        color={colorMode === 'light' ? 'gray.800' : 'white'}
        px={4}
        py={2}
        borderRadius="md"
        boxShadow="lg"
        opacity={0.95}
        transition="opacity 0.2s ease-in-out"
        _hover={{ opacity: 1 }}
      >
        {buttonContent}
      </Tooltip>
    );
  }, [tooltip, disabled, isLoading, colorMode, buttonContent]);

  // Hotkey handling
  useHotkeys(hotkey, useCallback((e) => {
    e.preventDefault();
    if (!disabled && !isLoading && onClick) {
      onClick(e as any);
      withSound && playClick();
    }
  }, [onClick, disabled, isLoading, withSound, playClick]));

  // Cleanup
  useEffect(() => {
    return () => {
      if (rippleTimeoutRef.current) {
        clearTimeout(rippleTimeoutRef.current);
      }
    };
  }, []);

  return wrappedButton;
});

WatchButton.displayName = 'WatchButton';

export default WatchButton;