import { useColorModeValue, useTheme } from '@chakra-ui/react';
import { useMemo } from 'react';
import { rgba } from 'polished';
import { DESIGN } from '../theme/design';

// Types for better type safety and documentation
interface GlassStyles {
  background: string;
  backdropFilter: string;
  border: string;
  boxShadow: string;
  transition: string;
  borderRadius: string;
  padding: string;
  position: 'relative';
  overflow: 'hidden';
  '&:hover': {
    transform: string;
    boxShadow: string;
  };
  '&:active': {
    transform: string;
    background: string;
  };
}

// Constants for optimization
const GLASS_CONFIG = {
  borderRadius: '16px',
  padding: '24px',
  hoverTransform: 'translateY(-2px)',
  activeTransform: 'translateY(0)',
  backdropBlur: `blur(${DESIGN.blur.md}) saturate(180%)`,
  position: 'relative' as const,
  overflow: 'hidden' as const,
} as const;

// Helper function to convert easing array to cubic-bezier string
const convertEasingToCubicBezier = (easing: [number, number, number, number]): string => 
  `cubic-bezier(${easing.join(', ')})`;

// Performance optimization: Precompute expensive values
const createGradient = (color: string, alpha: number = 0.7) => 
  `linear-gradient(135deg, ${color} 0%, ${rgba(color, alpha)} 100%)`;

// Mixin for reusable styles
const createTransitionStyle = (duration: number, easing: [number, number, number, number]): string => 
  `all ${duration}s ${convertEasingToCubicBezier(easing)}`;

export const useNavStyles = (): GlassStyles => {
  const theme = useTheme();

  // Move all color mode hooks to the top level
  const backgroundLight = useColorModeValue(
    createGradient(DESIGN.colors.glass.light.background),
    createGradient(DESIGN.colors.glass.dark.background)
  );

  const borderColor = useColorModeValue(
    DESIGN.colors.glass.light.border,
    DESIGN.colors.glass.dark.border
  );

  const defaultShadow = useColorModeValue(
    DESIGN.shadows.glass.md,
    DESIGN.shadows.glass.md
  );

  const hoverShadow = useColorModeValue(
    DESIGN.shadows.glass.lg,
    DESIGN.shadows.glass.lg
  );

  const activeBackground = useColorModeValue(
    DESIGN.colors.glass.light.active,
    DESIGN.colors.glass.dark.active
  );

  // Create transition style once
  const transitionStyle = useMemo(() => 
    createTransitionStyle(
      DESIGN.animation.duration.normal,
      DESIGN.animation.easing.glass
    ),
    []
  );

  // Memoize the entire styles object
  return useMemo(
    () => ({
      background: backgroundLight,
      backdropFilter: GLASS_CONFIG.backdropBlur,
      border: `1px solid ${borderColor}`,
      boxShadow: defaultShadow,
      transition: transitionStyle,
      borderRadius: GLASS_CONFIG.borderRadius,
      padding: GLASS_CONFIG.padding,
      position: GLASS_CONFIG.position,
      overflow: GLASS_CONFIG.overflow,
      '&:hover': {
        transform: GLASS_CONFIG.hoverTransform,
        boxShadow: hoverShadow
      },
      '&:active': {
        transform: GLASS_CONFIG.activeTransform,
        background: activeBackground
      }
    }),
    [
      backgroundLight,
      borderColor,
      defaultShadow,
      hoverShadow,
      activeBackground,
      transitionStyle,
      theme // Include theme in dependencies for safety
    ]
  );
};

// Optional: Performance optimized version for static contexts
export const createStaticNavStyles = (colorMode: 'light' | 'dark'): GlassStyles => {
  const isLight = colorMode === 'light';
  
  // Create transition style once
  const transitionStyle = createTransitionStyle(
    DESIGN.animation.duration.normal,
    DESIGN.animation.easing.glass
  );

  return {
    background: createGradient(
      isLight 
        ? DESIGN.colors.glass.light.background 
        : DESIGN.colors.glass.dark.background
    ),
    backdropFilter: GLASS_CONFIG.backdropBlur,
    border: `1px solid ${
      isLight 
        ? DESIGN.colors.glass.light.border 
        : DESIGN.colors.glass.dark.border
    }`,
    boxShadow: DESIGN.shadows.glass.md,
    transition: transitionStyle,
    borderRadius: GLASS_CONFIG.borderRadius,
    padding: GLASS_CONFIG.padding,
    position: GLASS_CONFIG.position,
    overflow: GLASS_CONFIG.overflow,
    '&:hover': {
      transform: GLASS_CONFIG.hoverTransform,
      boxShadow: DESIGN.shadows.glass.lg
    },
    '&:active': {
      transform: GLASS_CONFIG.activeTransform,
      background: isLight 
        ? DESIGN.colors.glass.light.active 
        : DESIGN.colors.glass.dark.active
    }
  };
};

// Export constants for testing and reuse
export const NAV_STYLES_CONSTANTS = {
  GLASS_CONFIG,
  createGradient,
  createTransitionStyle,
  convertEasingToCubicBezier
};