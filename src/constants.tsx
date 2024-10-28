import { keyframes } from '@emotion/react';

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
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  TIMEOUT: 10000, // 10 seconds
  ENDPOINTS: {
    AUTH: '/auth',
    CONTENT: '/content',
    GENRES: '/genres',
    SEARCH: '/search',
    USER: '/user',
    FAVORITES: '/favorites',
    WATCHLIST: '/watchlist',
  },
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

// Breakpoints
export const BREAKPOINTS = {
  xs: { value: 320, unit: 'px' },
  sm: { value: 576, unit: 'px' },
  md: { value: 768, unit: 'px' },
  lg: { value: 992, unit: 'px' },
  xl: { value: 1200, unit: 'px' },
  xxl: { value: 1400, unit: 'px' },
} as const;

// Grid Configuration
export const GRID_CONFIG = {
  CONTAINER_MAX_WIDTH: '1440px',
  CONTAINER_PADDING: {
    base: '1rem',
    sm: '1.5rem',
    md: '2rem',
    lg: '2.5rem',
    xl: '3rem',
  },
  GAP: {
    base: '1rem',
    sm: '1.5rem',
    md: '2rem',
    lg: '2.5rem',
  },
  COLUMNS: {
    base: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  },
} as const;

// Animation Variants
export const ANIMATION_VARIANTS = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeIn' }
    },
  },
  fadeInUp: {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: 'easeOut'
      }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: { 
        duration: 0.3,
        ease: 'easeIn'
      }
    },
  },
  scale: {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
  },
  slideIn: {
    hidden: { x: '-100%' },
    visible: { 
      x: 0,
      transition: { 
        type: 'spring',
        damping: 25,
        stiffness: 180
      }
    },
    exit: { 
      x: '100%',
      transition: { 
        type: 'spring',
        damping: 25,
        stiffness: 180
      }
    },
  },
  page: {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
        when: 'beforeChildren',
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.3,
        ease: 'easeIn',
        when: 'afterChildren',
        staggerChildren: 0.05
      }
    },
  },
} as const;

// Media Queries
export const MEDIA_QUERIES = {
  MOBILE: `(max-width: ${BREAKPOINTS.sm.value}${BREAKPOINTS.sm.unit})`,
  TABLET: `(min-width: ${BREAKPOINTS.sm.value}${BREAKPOINTS.sm.unit}) and (max-width: ${BREAKPOINTS.lg.value}${BREAKPOINTS.lg.unit})`,
  DESKTOP: `(min-width: ${BREAKPOINTS.lg.value}${BREAKPOINTS.lg.unit})`,
  DARK_MODE: '(prefers-color-scheme: dark)',
  REDUCED_MOTION: '(prefers-reduced-motion: reduce)',
  HIGH_CONTRAST: '(prefers-contrast: high)',
} as const;

// Z-Index Stack
export const Z_INDEX = {
  BACKGROUND: -1,
  DEFAULT: 1,
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
} as const;

// Content Configuration
export const CONTENT_CONFIG = {
  SKELETON: {
    DEFAULT_SPEED: 1.5,
    GRID_MIN_WIDTH: '200px',
    FEATURED_HEIGHT: '60vh',
    GENRE_HEIGHT: '100px',
    CAROUSEL_ITEMS: 6,
    GENRE_ITEMS: 8,
  },
  CAROUSEL: {
    SLIDES_PER_VIEW: {
      base: 1.2,
      sm: 2.2,
      md: 3.2,
      lg: 4.2,
      xl: 5.2,
    },
    SPACE_BETWEEN: 20,
    AUTOPLAY_DELAY: 3000,
  },
  IMAGES: {
    QUALITY: {
      LOW: '40',
      MEDIUM: '70',
      HIGH: '90',
    },
    BLUR_HASH: {
      COMPONENT_X: 4,
      COMPONENT_Y: 3,
    },
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  SERVER: 'Server error. Please try again later.',
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    UNAUTHORIZED: 'You are not authorized to access this resource.',
  },
  CONTENT: {
    NOT_FOUND: 'Content not found.',
    FAILED_TO_LOAD: 'Failed to load content. Please try again.',
    INVALID_FORMAT: 'Invalid content format.',
  },
  FORM: {
    REQUIRED: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    PASSWORD_WEAK: 'Password must be at least 8 characters long and include numbers and special characters.',
    PASSWORDS_DO_NOT_MATCH: 'Passwords do not match.',
  },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  WATCHED_ITEMS: 'watched_items',
  SEARCH_HISTORY: 'search_history',
} as const;

// Event Names
export const EVENTS = {
  AUTH: {
    LOGIN: 'auth_login',
    LOGOUT: 'auth_logout',
    SIGNUP: 'auth_signup',
    PASSWORD_RESET: 'auth_password_reset',
  },
  CONTENT: {
    VIEW: 'content_view',
    LIKE: 'content_like',
    SHARE: 'content_share',
    SAVE: 'content_save',
  },
  USER: {
    PROFILE_UPDATE: 'user_profile_update',
    PREFERENCES_UPDATE: 'user_preferences_update',
  },
} as const;

// Regular Expressions
export const REGEX = {
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  SAFE_STRING: /^[a-zA-Z0-9\s-_]+$/,
} as const;

// Theme Configuration
export const THEME_CONFIG = {
  COLORS: {
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#7c3aed',
      light: '#8b5cf6',
      dark: '#6d28d9',
    },
    success: {
      main: '#16a34a',
      light: '#22c55e',
      dark: '#15803d',
    },
    error: {
      main: '#dc2626',
      light: '#ef4444',
      dark: '#b91c1c',
    },
    warning: {
      main: '#d97706',
      light: '#f59e0b',
      dark: '#b45309',
    },
    info: {
      main: '#0891b2',
      light: '#06b6d4',
      dark: '#0e7490',
    },
    text: {
      primary: '#1f2937',
      secondary: '#4b5563',
      disabled: '#9ca3af',
    },
    background: {
      default: '#ffffff',
      paper: '#f3f4f6',
      dark: '#111827',
    },
  },
  SHADOWS: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  TRANSITIONS: {
    DEFAULT: 'all 0.3s ease',
    FAST: 'all 0.15s ease',
    SLOW: 'all 0.5s ease',
  },
} as const;

// Export all constants
export default {
  APP_CONFIG,
  API_CONFIG,
  BREAKPOINTS,
  GRID_CONFIG,
  ANIMATION_VARIANTS,
  MEDIA_QUERIES,
  Z_INDEX,
  CONTENT_CONFIG,
  ERROR_MESSAGES,
  STORAGE_KEYS,
  EVENTS,
  REGEX,
  THEME_CONFIG,
} as const;