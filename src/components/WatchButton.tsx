import React, { useState, useCallback, memo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Button, Flex, Text, Badge, useColorMode, Tooltip } from '@chakra-ui/react';
import { rgba } from 'polished';
import { useHotkeys } from 'react-hotkeys-hook';
import { DynamicIcon } from './Movie/Icons';
import GlassmorphicButton from './Button/GlassmorphicButton';

type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
type ButtonVariant = 'solid' | 'ghost' | 'outline' | 'gradient' | 'glass' | 'minimal';

interface WatchButtonProps {
  onClick?: (e: React.MouseEvent) => void;
  isLoading?: boolean;
  isPlaying?: boolean;
  hotkey?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  tooltip?: string;
  accentColor?: string;
  icon?: React.ReactNode;
  loadingText?: string;
  customText?: string;
  disabled?: boolean;
  progress?: number;
  rating?: number;
  duration?: string;
  quality?: string;
  className?: string;
  textAlign?: 'left' | 'center' | 'right';
}

const SIZE_MAP = {
  sm: { height: '32px', fontSize: '14px', iconSize: 16, padding: '8px 12px', badgeSize: 12 },
  md: { height: '40px', fontSize: '15px', iconSize: 20, padding: '10px 16px', badgeSize: 14 },
  lg: { height: '48px', fontSize: '16px', iconSize: 24, padding: '12px 20px', badgeSize: 16 },
  xl: { height: '56px', fontSize: '18px', iconSize: 28, padding: '14px 24px', badgeSize: 18 }
} as const;

export const WatchButton = memo(({
  onClick,
  isLoading = false,
  isPlaying = false,
  hotkey = 'space',
  size = 'md',
  variant = 'solid',
  tooltip,
  accentColor = 'blue.500',
  loadingText = 'Loading...',
  customText,
  disabled = false,
  progress,
  rating,
  duration,
  quality,
  className = '',
  textAlign = 'center'
}: WatchButtonProps) => {
  const [rippleEffect, setRippleEffect] = useState({ x: 0, y: 0, show: false });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleTimeoutRef = useRef<NodeJS.Timeout>();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const getVariantStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid',
      transition: 'all 0.2s ease-in-out',
      boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.2)' : '0 2px 6px rgba(0,0,0,0.1)'
    };

    switch (variant) {
      case 'glass':
        return {
          ...baseStyles,
          background: isDark ? rgba(26, 32, 44, 0.7) : rgba(255, 255, 255, 0.7),
          backdropFilter: 'blur(12px)',
          borderColor: isDark ? rgba(255, 255, 255, 0.15) : rgba(255, 255, 255, 0.5)
        };
      case 'gradient':
        return {
          ...baseStyles,
          background: isPlaying
            ? 'linear-gradient(135deg, #FF4B4B 0%, #FF9749 100%)'
            : 'linear-gradient(135deg, #4B7BFF 0%, #49A6FF 100%)',
          color: 'white',
          borderColor: 'transparent'
        };
      default:
        return {
          ...baseStyles,
          background: isDark ? 'gray.800' : 'white',
          borderColor: isDark ? 'whiteAlpha.200' : 'blackAlpha.200'
        };
    }
  };

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (disabled || isLoading) return;

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setRippleEffect({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        show: true
      });

      rippleTimeoutRef.current = setTimeout(() => {
        setRippleEffect(prev => ({ ...prev, show: false }));
      }, 600);
    }

    onClick?.(e);
  }, [onClick, disabled, isLoading]);

  const renderMetadata = () => {
    if (!rating && !duration && !quality) return null;

    return (
      <Flex 
        gap="2" 
        align="center" 
        justify={textAlign === 'center' ? 'center' : 'flex-start'}
        style={{ marginTop: '2px', width: '100%' }}
      >
        {rating && (
          <Badge 
            variant="subtle" 
            colorScheme="yellow"
            display="flex"
            alignItems="center"
            gap="1"
            padding="2px 6px"
            borderRadius="4px"
          >
            <DynamicIcon 
              name="Star" 
              size={SIZE_MAP[size].badgeSize} 
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
            padding="2px 6px"
            borderRadius="4px"
          >
            <DynamicIcon 
              name="Clock" 
              size={SIZE_MAP[size].badgeSize}
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
            padding="2px 6px"
            borderRadius="4px"
          >
            <DynamicIcon 
              name="Play" 
              size={SIZE_MAP[size].badgeSize}
            />
            {quality}
          </Badge>
        )}
      </Flex>
    );
  };

  useHotkeys(hotkey, (e) => {
    e.preventDefault();
    if (!disabled && !isLoading && onClick) {
      onClick(e as any);
    }
  });

  useEffect(() => {
    return () => {
      if (rippleTimeoutRef.current) {
        clearTimeout(rippleTimeoutRef.current);
      }
    };
  }, []);

  const buttonContent = (
    <Button
      ref={buttonRef}
      as={motion.button}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={className}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      style={{
        ...SIZE_MAP[size],
        ...getVariantStyles(),
        position: 'relative',
        overflow: 'hidden',
        minWidth: 'fit-content',
        width: '100%'
      }}
    >
      <Flex 
        align="center" 
        justify={textAlign === 'center' ? 'center' : 'flex-start'}
        gap="3"
        style={{ width: '100%' }}
      >
        
        <Flex 
          direction="column" 
          align={textAlign === 'center' ? 'center' : 'flex-start'}
          style={{ 
            flex: 1,
            width: '100%'
          }}
        >
<GlassmorphicButton
  variant="info"
  size="sm"
  glowIntensity="medium"
  glassFrost="medium"
  iconPosition="right"
  animated={true}
  neonEffect={false}
  textGradient={false}
  glowColor="#2D9CDB"
  sx={{
    fontWeight: '500',
    fontSize: '14px',
    py: '8px',
    px: '16px',
    minHeight: '36px',
    letterSpacing: '0.3px',
    borderRadius: '12px',
    borderColor: 'rgba(45, 156, 219, 0.3)',
    color: '#FFFFFF',
    bg: 'rgba(14, 165, 233, 0.15)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 2px 8px rgba(45, 156, 219, 0.15)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.15)', // Mejora la legibilidad
    WebkitFontSmoothing: 'antialiased', // Mejora el renderizado del texto
    MozOsxFontSmoothing: 'grayscale', // Mejora el renderizado en Firefox
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '& .button-text': {
      color: '#FFFFFF',
      opacity: 1,
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
    },
    '&:hover': {
      bg: 'rgba(14, 165, 233, 0.25)',
      borderColor: 'rgba(45, 156, 219, 0.4)',
      boxShadow: '0 4px 12px rgba(45, 156, 219, 0.25)',
      '& .button-text': {
        color: '#FFFFFF',
        opacity: 1,
      }
    },
    '&:active': {
      bg: 'rgba(14, 165, 233, 0.3)',
      transform: 'translateY(1px)',
      boxShadow: '0 2px 4px rgba(45, 156, 219, 0.2)',
      '& .button-text': {
        color: '#FFFFFF',
        opacity: 0.95,
      }
    },
    // Estado de carga
    '&[data-loading]': {
      '& .loading-spinner': {
        borderColor: '#FFFFFF transparent #FFFFFF #FFFFFF',
      },
      '& .button-text': {
        color: '#FFFFFF',
        opacity: 0.9,
      }
    },
    // Estado deshabilitado
    '&:disabled': {
      bg: 'rgba(14, 165, 233, 0.1)',
      '& .button-text': {
        color: '#FFFFFF',
        opacity: 0.6,
      }
    }
  }}
>
  {isLoading ? loadingText : customText || (isPlaying ? 'Pause' : 'Start Watching')}
</GlassmorphicButton>{renderMetadata()}
        </Flex>
      </Flex>

      {progress !== undefined && (
        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          height="3px"
          bg={isDark ? 'whiteAlpha.200' : 'blackAlpha.100'}
        >
          <Box
            position="absolute"
            left="0"
            top="0"
            height="100%"
            bg={accentColor}
            style={{ 
              width: `${progress}%`,
              transition: 'width 0.3s ease-in-out',
              borderRadius: '0 3px 3px 0'
            }}
          />
        </Box>
      )}

      {rippleEffect.show && (
        <motion.div
          initial={{ scale: 0, opacity: 0.35 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'absolute',
            top: rippleEffect.y,
            left: rippleEffect.x,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'white',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }}
        />
      )}
    </Button>
  );

  return tooltip ? (
    <Tooltip 
      label={tooltip} 
      isDisabled={disabled || isLoading}
      placement="top"
      hasArrow
    >
      {buttonContent}
    </Tooltip>
  ) : buttonContent;
});

WatchButton.displayName = 'WatchButton';