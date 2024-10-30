// src/constants/index.ts

import { Variants } from 'framer-motion';
import { mix, rgba, lighten, darken, transparentize } from 'polished';
// Constants for better performance and maintainability
export const VIEWPORT_SIZES = {
  base: '70vw',
  sm: '85vw',
  md: '80vw',
  lg: '75vw',
  xl: '70vw'
} as const;
// Enhanced animation variants
export const enhancedContainerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
      staggerChildren: 0.1
    }
  }
};

export const RESPONSIVE_SPACING = {
  padding: {
    base: 1,
    sm: 1,
    md: 1.5,
    lg: 2,
    xl: 1.5
  },
  margin: {
    base: 2,
    sm: 3,
    md: 4,
    lg: 5,
    xl: 6
  },
  itemSpacing: {
    base: 0.5,
    sm: 1,
    md: 1.5,
    lg: 2,
    xl: 2.5
  }
} as const;

export const INTERSECTION_OPTIONS = {
  threshold: 0.2,
  triggerOnce: true
} as const;
// Types
export interface Breakpoint {
  value: number;
  unit: 'px' | 'em' | 'rem';
}

export interface AnimationVariant {
  hidden: object;
  visible: object;
  exit?: object;
}

// App Configuration
export const APP_CONFIG = {
  NAME: 'ChillFlix',
  VERSION: '1.0.0',
  API_VERSION: 'v1',
  DEFAULT_LOCALE: 'en-US',
  DEFAULT_THEME: 'dark',
  CACHE_TTL: 1000 * 60 * 5, // 5 minutes
  MAX_RETRY_ATTEMPTS: 3,
  DEBOUNCE_DELAY: 150, // ms
  THROTTLE_DELAY: 100, // ms
  ROUTES: {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    CONTENT: '/content',
    NOT_FOUND: '/404',
  },
  FEATURES: {
    DARK_MODE: true,
    ANIMATIONS: true,
    SOUND_EFFECTS: true,
    OFFLINE_SUPPORT: true,
    PUSH_NOTIFICATIONS: true,
  },
} as const;

// Enhanced API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  TIMEOUT: 10000, // 10 seconds
  RETRY_DELAY: 1000,
  MAX_RETRIES: 3,
  BATCH_SIZE: 50,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      VERIFY: '/auth/verify',
      RESET_PASSWORD: '/auth/reset-password',
    },
    CONTENT: {
      LIST: '/content',
      DETAIL: '/content/:id',
      SEARCH: '/content/search',
      TRENDING: '/content/trending',
      RECOMMENDED: '/content/recommended',
    },
    USER: {
      PROFILE: '/user/profile',
      PREFERENCES: '/user/preferences',
      HISTORY: '/user/history',
      FAVORITES: '/user/favorites',
      WATCHLIST: '/user/watchlist',
    },
  },
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-App-Version': APP_CONFIG.VERSION,
    'X-Api-Version': APP_CONFIG.API_VERSION,
  },
  RESPONSE_CODES: {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
  },
} as const;

// Enhanced Layout Configuration
export const LAYOUT_CONFIG = {
  container: {
    base: {
      px: 4,
      py: 2,
      maxW: '440px',
      mx: 'auto',
      borderRadius: '24px 24px 0 0'
    }
  },
  item: {
    base: {
      minW: '64px',
      height: '64px',
      p: 2,
      borderRadius: '16px'
    },
    md: {
      minW: '72px',
      height: '72px',
      p: 3,
      borderRadius: '18px'
    },
    lg: {
      minW: '80px',
      height: '80px',
      p: 4,
      borderRadius: '20px'
    }
  },
  icon: {
    base: { size: '24px' },
    md: { size: '28px' },
    lg: { size: '32px' }
  },
  label: {
    base: {
      fontSize: '11px',
      mt: 1,
      fontWeight: '500'
    },
    md: {
      fontSize: '12px',
      mt: 1.5,
      fontWeight: '600'
    },
    lg: {
      fontSize: '14px',
      mt: 2,
      fontWeight: '600'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
} as const;

// Enhanced Breakpoints Configuration
export const BREAKPOINTS = {
  xs: { value: 320, unit: 'px' },
  sm: { value: 576, unit: 'px' },
  md: { value: 768, unit: 'px' },
  lg: { value: 992, unit: 'px' },
  xl: { value: 1200, unit: 'px' },
  xxl: { value: 1400, unit: 'px' },
  mobile: { max: 576 },
  tablet: { min: 577, max: 991 },
  desktop: { min: 992 },
} as const;

// Enhanced Animation Configuration
export const ANIMATION_PRESETS = {
  gentle: {
    type: 'spring',
    stiffness: 170,
    damping: 26,
    mass: 1
  },
  elastic: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
    mass: 0.8
  },
  bouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
    mass: 1
  },
  smooth: {
    type: 'keyframes',
    duration: 0.6,
    ease: [0.32, 0.72, 0, 1]
  },
  snappy: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
    mass: 0.8
  }
} as const;

export const ANIMATION_VARIANTS = {
  container: {
    initial: { 
      y: 20, 
      opacity: 0,
      scale: 0.95,
      rotateX: -15,
      perspective: 1000
    },
    animate: { 
      y: 0, 
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transition: ANIMATION_PRESETS.gentle
    }
  },
  item: {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      y: -2,
      transition: ANIMATION_PRESETS.bouncy
    },
    tap: {
      scale: 0.95,
      transition: ANIMATION_PRESETS.smooth
    }
  },
  icon: {
    initial: { 
      scale: 1, 
      y: 0,
      rotate: 0
    },
    hover: {
      scale: 1.1,
      y: -2,
      rotate: 5,
      transition: ANIMATION_PRESETS.elastic
    },
    active: {
      scale: 1.15,
      y: -3,
      rotate: 0,
      transition: ANIMATION_PRESETS.bouncy
    }
  },
  label: {
    initial: { 
      opacity: 0, 
      y: 5, 
      scale: 0.9 
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: ANIMATION_PRESETS.gentle
    },
    exit: { 
      opacity: 0, 
      y: -5, 
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  },
  page: {
    enter: {
      opacity: 0,
      x: 20,
    },
    center: {
      opacity: 1,
      x: 0,
      transition: ANIMATION_PRESETS.smooth
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2 }
    }
  }
} as const;

// Enhanced Visual Effects
export const VISUAL_EFFECTS = {
  glassmorphism: (color: string, intensity: number = 1, isHovered: boolean = false) => ({
    background: `
      linear-gradient(
        135deg,
        ${rgba(color, 0.15 * intensity)} 0%,
        ${rgba(color, 0.08 * intensity)} 50%,
        ${rgba(color, 0.12 * intensity)} 100%
      )
    `,
    border: `1px solid ${rgba(color, (0.2 + (isHovered ? 0.1 : 0)) * intensity)}`,
    backdropFilter: 'blur(12px) saturate(180%)',
    boxShadow: `
      0 4px 24px ${rgba(color, 0.15 * intensity)},
      0 1px 6px ${rgba(color, 0.1 * intensity)},
      inset 0 1px 1px ${rgba('white', 0.1 * intensity)},
      ${isHovered ? `0 8px 32px ${rgba(color, 0.25 * intensity)}` : ''}
    `
  }),
  item: {
    glass: (color: string, intensity: number = 1, isHovered: boolean = false) => ({
      background: `
        linear-gradient(
          135deg,
          ${rgba(mix(0.92, '#ffffff', color), 0.85)} 0%,
          ${rgba(mix(0.96, '#ffffff', color), 0.75)} 50%,
          ${rgba(mix(0.92, '#ffffff', color), 0.85)} 100%
        )
      `,
      backdropFilter: 'blur(8px) saturate(160%)',
      border: `1px solid ${rgba(color, (0.15 + (isHovered ? 0.08 : 0)) * intensity)}`,
      boxShadow: `
        0 4px 20px ${rgba(color, 0.12 * intensity)},
        0 1px 5px ${rgba(color, 0.08 * intensity)},
        inset 0 1px 1px ${rgba(color, 0.08 * intensity)},
        ${isHovered ? `0 8px 28px ${rgba(color, 0.2 * intensity)}` : ''}
      `
    }),
    gradient: (color: string, isActive: boolean = false) => ({
      background: isActive 
        ? `linear-gradient(
            135deg,
            ${lighten(0.1, color)} 0%,
            ${color} 50%,
            ${darken(0.1, color)} 100%
          )`
        : `linear-gradient(
            135deg,
            ${mix(0.8, '#666666', color)} 0%,
            ${mix(0.9, '#444444', color)} 50%,
            ${mix(0.8, '#666666', color)} 100%
          )`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }),
    glow: (color: string, intensity: number = 1) => ({
      filter: `drop-shadow(0 0 8px ${rgba(color, 0.4 * intensity)})`
    }),
    activeIndicator: (color: string) => ({
      background: `linear-gradient(
        to right,
        ${transparentize(0.8, color)} 0%,
        ${color} 50%,
        ${transparentize(0.8, color)} 100%
      )`,
      boxShadow: `
        0 0 10px ${rgba(color, 0.5)},
        0 0 20px ${rgba(color, 0.3)}
      `
    })
  },
  text: {
    gradient: (color: string, intensity: number = 1) => ({
      background: `linear-gradient(
        135deg,
        ${lighten(0.2, color)} 0%,
        ${color} 50%,
        ${darken(0.1, color)} 100%
      )`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      filter: `drop-shadow(0 0 2px ${rgba(color, 0.3 * intensity)})`
    }),
    glow: (color: string, intensity: number = 1) => ({
      textShadow: `0 0 8px ${rgba(color, 0.4 * intensity)}`
    })
  }
} as const;

// Enhanced Sound Configuration
export const SOUND_EFFECTS = {
  hover: {
    src: '/sounds/hover.mp3',
    volume: 0.2,
    playbackRate: 1.2,
    sprite: {
      light: [0, 100],
      medium: [100, 200],
      heavy: [200, 300]
    }
  },
  click: {
    src: '/sounds/click.mp3',
    volume: 0.3,
    playbackRate: 1,
    sprite: {
      soft: [0, 100],
      hard: [100, 200]
    }
  },
  activate: {
    src: '/sounds/activate.mp3',
    volume: 0.4,
    playbackRate: 0.9,
    sprite: {
      short: [0, 200],
      long: [200, 500]
    }
  },
  success: {
    src: '/sounds/success.mp3',
    volume: 0.4,
    playbackRate: 1
  },
  error: {
    src: '/sounds/error.mp3',
    volume: 0.4,
    playbackRate: 1
  },
  
  notification: {
    src: '/sounds/notification.mp3',
    volume: 0.3,
    playbackRate: 1
  }
} as const;

// Enhanced Theme Configuration
export const THEME_CONFIG = {
  COLORS: {
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
    secondary: {
      50: '#f3e5f5',
      100: '#e1bee7',
      200: '#ce93d8',
      300: '#ba68c8',
      400: '#ab47bc',
      500: '#9c27b0',
      600: '#8e24aa',
      700: '#7b1fa2',
      800: '#6a1b9a',
      900: '#4a148c',
    },
    success: {
      50: '#e8f5e9',
      100: '#c8e6c9',
      200: '#a5d6a7',
      300: '#81c784',
      400: '#66bb6a',
      500: '#4caf50',
      600: '#43a047',
      700: '#388e3c',
      800: '#2e7d32',
      900: '#1b5e20',
    },
    error: {
      50: '#ffebee',
      100: '#ffcdd2',
      200: '#ef9a9a',
      300: '#e57373',
      400: '#ef5350',
      500: '#f44336',
      600: '#e53935',
      700: '#d32f2f',
      800: '#c62828',
      900: '#b71c1c',
    },
    warning: {
      50: '#fff3e0',
      100: '#ffe0b2',
      200: '#ffcc80',
      300: '#ffb74d',
      400: '#ffa726',
      500: '#ff9800',
      600: '#fb8c00',
      700: '#f57c00',
      800: '#ef6c00',
      900: '#e65100',
    },
    info: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
      hint: 'rgba(0, 0, 0, 0.38)',
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
      dark: '#121212',
    },
    action: {
      active: 'rgba(0, 0, 0, 0.54)',
      hover: 'rgba(0, 0, 0, 0.04)',
      selected: 'rgba(0, 0, 0, 0.08)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
    },
  },
  SHADOWS: {
    xs: '0 2px 4px rgba(0,0,0,0.05)',
    sm: '0 4px 6px rgba(0,0,0,0.1)',
    md: '0 8px 12px rgba(0,0,0,0.15)',
    lg: '0 12px 24px rgba(0,0,0,0.2)',
    xl: '0 20px 32px rgba(0,0,0,0.25)',
    inner: 'inset 0 2px 4px rgba(0,0,0,0.05)',
    outline: '0 0 0 3px rgba(66,153,225,0.5)',
    none: 'none',
  },
  TRANSITIONS: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
  TYPOGRAPHY: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
      mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      hairline: 100,
      thin: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  BORDER_RADIUS: {
    none: '0',
    sm: '0.125rem',
    default: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
} as const;

// Enhanced Grid Configuration
export const GRID_CONFIG = {
  container: {
    maxWidth: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    padding: {
      base: '1rem',
      sm: '2rem',
      md: '3rem',
      lg: '4rem',
      xl: '5rem',
    },
  },
  columns: {
    base: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  gutter: {
    base: '1rem',
    sm: '1.5rem',
    md: '2rem',
    lg: '2.5rem',
    xl: '3rem',
  },
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
} as const;

// Media Queries Configuration
export const MEDIA_QUERIES = {
  dark: '(prefers-color-scheme: dark)',
  light: '(prefers-color-scheme: light)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  highContrast: '(prefers-contrast: high)',
  lowContrast: '(prefers-contrast: low)',
  screen: {
    xs: `(min-width: ${BREAKPOINTS.xs.value}${BREAKPOINTS.xs.unit})`,
    sm: `(min-width: ${BREAKPOINTS.sm.value}${BREAKPOINTS.sm.unit})`,
    md: `(min-width: ${BREAKPOINTS.md.value}${BREAKPOINTS.md.unit})`,
    lg: `(min-width: ${BREAKPOINTS.lg.value}${BREAKPOINTS.lg.unit})`,
    xl: `(min-width: ${BREAKPOINTS.xl.value}${BREAKPOINTS.xl.unit})`,
    xxl: `(min-width: ${BREAKPOINTS.xxl.value}${BREAKPOINTS.xxl.unit})`,
  },
  orientation: {
    portrait: '(orientation: portrait)',
    landscape: '(orientation: landscape)',
  },
  pointer: {
    fine: '(pointer: fine)',
    coarse: '(pointer: coarse)',
  },
  hover: {
    none: '(hover: none)',
    hover: '(hover: hover)',
  },
} as const;

// Z-Index Stack Configuration
export const Z_INDEX = {
  hide: -1,
  auto: 'auto',
  base: 0,
  normal: 1,
  lifting: 2,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
  loader: 1900,
  alert: 2000,
} as const;

// Enhanced responsive configuration
export const RESPONSIVE_CONFIG = {
  container: {
    base: { p: 2, minW: '100px', maxW: '200px' },
    md: { p: 3, minW: '120px', maxW: '240px' },
    lg: { p: 4, minW: '150px', maxW: '280px' }
  },
  icon: {
    base: { size: 20, strokeWidth: 2 },
    md: { size: 24, strokeWidth: 1.75 },
    lg: { size: 28, strokeWidth: 1.5 }
  },
  text: {
    base: { size: 'sm', spacing: '0.5px' },
    md: { size: 'md', spacing: '0.75px' },
    lg: { size: 'lg', spacing: '1px' }
  },
  animation: {
    base: { duration: 0.2, scale: 1.05 },
    md: { duration: 0.3, scale: 1.08 },
    lg: { duration: 0.4, scale: 1.1 }
  }
} as const;
// Rich animation presets
export const ANIMATION_PRESENTS = {
  gentle: {
    type: 'spring',
    stiffness: 170,
    damping: 26,
    mass: 1
  },
  bouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
    mass: 1
  },
  smooth: {
    type: 'keyframes',
    duration: 0.6,
    ease: [0.32, 0.72, 0, 1]
  }
} as const;
// Export default configuration
export const CONTENT_CONFIG = {
  // Skeleton configurations
  SKELETON: {
    FEATURED_HEIGHT: '500px',
    CAROUSEL_ITEMS: 5,
    GENRE_ITEMS: 8,
    GENRE_HEIGHT: '160px',
    ANIMATION_SPEED: '0.8s',
    GRADIENT: {
      START_COLOR: 'purple.500',
      END_COLOR: 'pink.500',
      TEXT_START: 'purple.200',
      TEXT_END: 'pink.200',
    },
  },

  // Layout configurations
  LAYOUT: {
    CONTAINER: {
      maxWidth: 'container.xl',
      px: { base: 4, md: 6, lg: 8 },
      py: { base: 4, md: 6 },
    },
    SPACING: {
      VERTICAL: { base: 4, md: 6, lg: 8 },
      HORIZONTAL: { base: 4, md: 6 },
      GRID: { base: 4, md: 6 },
    },
  },

  // Breakpoint-specific configurations
  RESPONSIVE: {
    GRID_COLUMNS: {
      base: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5,
    },
    CARD_HEIGHT: {
      base: '200px',
      md: '220px',
      lg: '240px',
    },
    FEATURED_HEIGHT: {
      base: '300px',
      md: '400px',
      lg: '500px',
    },
  },

  // Visual style configurations
  STYLES: {
    BORDER_RADIUS: {
      sm: 'md',
      default: 'lg',
      large: 'xl',
    },
    SHADOWS: {
      light: '0 2px 8px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 12px rgba(0, 0, 0, 0.15)',
      strong: '0 8px 24px rgba(0, 0, 0, 0.2)',
    },
    GRADIENTS: {
      overlay: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
      featured: 'linear-gradient(45deg, var(--chakra-colors-purple-500), var(--chakra-colors-pink-500))',
      skeleton: 'linear-gradient(90deg, var(--chakra-colors-gray-100), var(--chakra-colors-gray-200))',
    },
  },

  // Animation configurations
  ANIMATION: {
    DURATION: {
      fast: 0.2,
      normal: 0.3,
      slow: 0.5,
    },
    EASING: {
      default: 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    VARIANTS: {
      fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      },
      slideUp: {
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -20, opacity: 0 },
      },
      scale: {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
      },
    },
  },

  // Content display configurations
  DISPLAY: {
    TRUNCATE: {
      title: 2,
      description: 3,
      subtitle: 1,
    },
    ASPECT_RATIO: {
      poster: 2/3,
      landscape: 16/9,
      square: 1,
    },
    TEXT: {
      sizes: {
        title: { base: 'xl', md: '2xl', lg: '3xl' },
        subtitle: { base: 'md', md: 'lg' },
        body: { base: 'sm', md: 'md' },
      },
      weights: {
        light: 300,
        regular: 400,
        medium: 500,
        bold: 700,
      },
    },
  },

  // Theme color combinations
  COLORS: {
    schemes: {
      primary: {
        bg: 'purple.500',
        hover: 'purple.600',
        text: 'white',
      },
      secondary: {
        bg: 'pink.500',
        hover: 'pink.600',
        text: 'white',
      },
      accent: {
        bg: 'teal.500',
        hover: 'teal.600',
        text: 'white',
      },
    },
    skeleton: {
      start: 'purple.500',
      end: 'pink.500',
      textStart: 'purple.200',
      textEnd: 'pink.200',
    },
  },
} as const;
export default {
  APP_CONFIG,
  API_CONFIG,
  LAYOUT_CONFIG,
  BREAKPOINTS,
  ANIMATION_PRESETS,
  ANIMATION_VARIANTS,
  RESPONSIVE_CONFIG,
  VISUAL_EFFECTS,
  ANIMATION_PRESENTS,
  SOUND_EFFECTS,
  THEME_CONFIG,
  GRID_CONFIG,
  MEDIA_QUERIES,
  CONTENT_CONFIG,
  Z_INDEX,
} as const;
// Rich animation presets

