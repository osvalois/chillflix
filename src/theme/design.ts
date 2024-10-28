// Types for strict type checking and better documentation
type ColorValue = string;
type BlurValue = string;
type ShadowValue = string;
type DurationValue = number;
type EasingValue = [number, number, number, number];

interface GlassConfig {
  background: ColorValue;
  hover: ColorValue;
  active: ColorValue;
  border: ColorValue;
}

interface ColorSystem {
  readonly primary: ColorValue;
  readonly accent: ColorValue;
  readonly success: ColorValue;
  readonly warning: ColorValue;
  readonly error: ColorValue;
  readonly glass: {
    readonly light: GlassConfig;
    readonly dark: GlassConfig;
  };
  readonly backdrop: {
    readonly light: ColorValue;
    readonly dark: ColorValue;
  };
}

interface DesignSystem {
  readonly colors: ColorSystem;
  readonly blur: {
    readonly sm: BlurValue;
    readonly md: BlurValue;
    readonly lg: BlurValue;
    readonly xl: BlurValue;
  };
  readonly shadows: {
    readonly glass: {
      readonly sm: ShadowValue;
      readonly md: ShadowValue;
      readonly lg: ShadowValue;
      readonly xl: ShadowValue;
    };
  };
  readonly animation: {
    readonly duration: {
      readonly fast: DurationValue;
      readonly normal: DurationValue;
      readonly slow: DurationValue;
    };
    readonly easing: {
      readonly smooth: EasingValue;
      readonly bounce: EasingValue;
      readonly glass: EasingValue;
    };
  };
}

// Utility function to create RGBA values
const rgba = (r: number, g: number, b: number, a: number): ColorValue => 
  `rgba(${r}, ${g}, ${b}, ${a})`;

// Constants for common values
const GLASS_OPACITY = {
  BACKGROUND: 0.1,
  HOVER: 0.15,
  ACTIVE: 0.2,
  BORDER: 0.18
} as const;

const DARK_GLASS_OPACITY = {
  BACKGROUND: 0.3,
  HOVER: 0.35,
  ACTIVE: 0.4,
  BORDER: 0.38
} as const;

const BACKDROP_OPACITY = {
  LIGHT: 0.8,
  DARK: 0.8
} as const;

// Shadow configuration for better performance
const createGlassShadow = (
  blur: number, 
  spread: number, 
  opacity1: number, 
  offsetY1: number,
  blur2: number, 
  spread2: number, 
  opacity2: number, 
  offsetY2: number
): ShadowValue => 
  `0 ${offsetY1}px ${blur}px ${spread}px rgba(0, 0, 0, ${opacity1}), ` +
  `0 ${offsetY2}px ${blur2}px ${spread2}px rgba(0, 0, 0, ${opacity2})`;

// Design system implementation with performance optimizations
export const DESIGN: DesignSystem = {
  colors: {
    primary: '#2D3748',
    accent: '#4299E1',
    success: '#48BB78',
    warning: '#ECC94B',
    error: '#F56565',
    glass: {
      light: {
        background: rgba(255, 255, 255, GLASS_OPACITY.BACKGROUND),
        hover: rgba(255, 255, 255, GLASS_OPACITY.HOVER),
        active: rgba(255, 255, 255, GLASS_OPACITY.ACTIVE),
        border: rgba(255, 255, 255, GLASS_OPACITY.BORDER)
      },
      dark: {
        background: rgba(15, 23, 42, DARK_GLASS_OPACITY.BACKGROUND),
        hover: rgba(15, 23, 42, DARK_GLASS_OPACITY.HOVER),
        active: rgba(15, 23, 42, DARK_GLASS_OPACITY.ACTIVE),
        border: rgba(15, 23, 42, DARK_GLASS_OPACITY.BORDER)
      }
    },
    backdrop: {
      light: rgba(255, 255, 255, BACKDROP_OPACITY.LIGHT),
      dark: rgba(15, 23, 42, BACKDROP_OPACITY.DARK)
    }
  },
  blur: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px'
  },
  shadows: {
    glass: {
      sm: createGlassShadow(8, -1, 0.08, 2, 4, -2, 0.02, 1),
      md: createGlassShadow(16, -2, 0.1, 4, 8, -3, 0.03, 2),
      lg: createGlassShadow(32, -4, 0.12, 8, 16, -6, 0.04, 4),
      xl: createGlassShadow(48, -8, 0.15, 16, 24, -12, 0.06, 8)
    }
  },
  animation: {
    duration: {
      fast: 0.2,
      normal: 0.3,
      slow: 0.5
    },
    easing: {
      smooth: [0.4, 0, 0.2, 1],
      bounce: [0.175, 0.885, 0.32, 1.275],
      glass: [0.22, 1, 0.36, 1]
    }
  }
} as const;

// Type-safe utility functions
type BaseColors = 'primary' | 'accent' | 'success' | 'warning' | 'error';
export const getColor = (path: BaseColors): ColorValue => DESIGN.colors[path];
export const getGlassColors = (mode: 'light' | 'dark'): GlassConfig => DESIGN.colors.glass[mode];
export const getBackdropColor = (mode: 'light' | 'dark'): ColorValue => DESIGN.colors.backdrop[mode];
export const getBlur = (size: keyof typeof DESIGN.blur): BlurValue => DESIGN.blur[size];
export const getShadow = (size: keyof typeof DESIGN.shadows.glass): ShadowValue => DESIGN.shadows.glass[size];
export const getDuration = (speed: keyof typeof DESIGN.animation.duration): DurationValue => DESIGN.animation.duration[speed];
export const getEasing = (curve: keyof typeof DESIGN.animation.easing): EasingValue => DESIGN.animation.easing[curve];

// CSS custom properties generator for runtime optimization
export const generateCSSVariables = (): Record<string, string> => ({
  '--color-primary': DESIGN.colors.primary,
  '--color-accent': DESIGN.colors.accent,
  '--color-success': DESIGN.colors.success,
  '--color-warning': DESIGN.colors.warning,
  '--color-error': DESIGN.colors.error,
  '--blur-sm': DESIGN.blur.sm,
  '--blur-md': DESIGN.blur.md,
  '--blur-lg': DESIGN.blur.lg,
  '--blur-xl': DESIGN.blur.xl,
  '--duration-fast': `${DESIGN.animation.duration.fast}s`,
  '--duration-normal': `${DESIGN.animation.duration.normal}s`,
  '--duration-slow': `${DESIGN.animation.duration.slow}s`
});

// Theme configuration helper for framework integration
export const createThemeConfig = (overrides: Partial<DesignSystem> = {}): DesignSystem => ({
  ...DESIGN,
  ...overrides
});

// Export constants for testing and reuse
export const DESIGN_CONSTANTS = {
  GLASS_OPACITY,
  DARK_GLASS_OPACITY,
  BACKDROP_OPACITY
};