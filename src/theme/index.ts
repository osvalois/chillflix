import { extendTheme, theme as baseTheme, StyleFunctionProps } from "@chakra-ui/react";
import { mode, transparentize } from "@chakra-ui/theme-tools";

// Design tokens
const tokens = {
  blur: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px'
  },
  animation: {
    duration: {
      fastest: '0.05s',
      faster: '0.1s',
      fast: '0.2s',
      normal: '0.3s',
      slow: '0.4s',
      slower: '0.5s',
      slowest: '0.6s'
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
    }
  },
  glassMorphism: {
    light: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.18)',
      hover: 'rgba(255, 255, 255, 0.15)',
      active: 'rgba(255, 255, 255, 0.2)'
    },
    dark: {
      background: 'rgba(15, 23, 42, 0.3)',
      border: 'rgba(15, 23, 42, 0.38)',
      hover: 'rgba(15, 23, 42, 0.35)',
      active: 'rgba(15, 23, 42, 0.4)'
    }
  }
};

const theme = extendTheme({
  colors: {
    brand: {
      50: "#e3f2fd",
      100: "#bbdefb",
      200: "#90caf9",
      300: "#64b5f6",
      400: "#42a5f5",
      500: "#2196f3",
      600: "#1e88e5",
      700: "#1976d2",
      800: "#1565c0",
      900: "#0d47a1",
    },
    accent: {
      50: '#fff1f2',
      100: '#ffe4e6',
      200: '#fecdd3',
      300: '#fda4af',
      400: '#fb7185',
      500: '#f43f5e',
      600: '#e11d48',
      700: '#be123c',
      800: '#9f1239',
      900: '#881337'
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    }
  },
  fonts: {
    heading: "Poppins, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
    mono: "JetBrains Mono, monospace",
  },
  fontSizes: {
    '3xs': '0.45rem',
    '2xs': '0.625rem',
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
  },
  shadows: {
    xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    outline: '0 0 0 3px rgba(66, 153, 225, 0.6)',
    inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
    none: 'none',
    'dark-lg': '0 0 0 1px rgba(0, 0, 0, 0.1), 0 5px 10px rgba(0, 0, 0, 0.2), 0 15px 40px rgba(0, 0, 0, 0.4)',
    glass: {
      sm: '0 2px 8px -1px rgba(0, 0, 0, 0.08), 0 1px 4px -2px rgba(0, 0, 0, 0.02)',
      md: '0 4px 16px -2px rgba(0, 0, 0, 0.1), 0 2px 8px -3px rgba(0, 0, 0, 0.03)',
      lg: '0 8px 32px -4px rgba(0, 0, 0, 0.12), 0 4px 16px -6px rgba(0, 0, 0, 0.04)',
      xl: '0 16px 48px -8px rgba(0, 0, 0, 0.15), 0 8px 24px -12px rgba(0, 0, 0, 0.06)'
    }
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: mode('gray.50', 'gray.900')(props),
        color: mode('gray.800', 'whiteAlpha.900')(props),
        transition: 'background-color 0.2s ease-in-out',
        lineHeight: 'tall',
        overflowX: 'hidden'
      },
      '*::placeholder': {
        color: mode('gray.400', 'whiteAlpha.400')(props),
      },
      '*, *::before, &::after': {
        borderColor: mode('gray.200', 'whiteAlpha.300')(props),
        wordWrap: 'break-word',
      },
      '::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '::-webkit-scrollbar-track': {
        bg: mode('gray.100', 'gray.800')(props),
      },
      '::-webkit-scrollbar-thumb': {
        bg: mode('gray.300', 'gray.600')(props),
        borderRadius: '8px',
        '&:hover': {
          bg: mode('gray.400', 'gray.500')(props),
        },
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "600",
        borderRadius: "lg",
        transition: `all ${tokens.animation.duration.normal} ${tokens.animation.easing.easeInOut}`,
      },
      variants: {
        solid: (props: StyleFunctionProps) => ({
          bg: mode('brand.500', 'brand.400')(props),
          color: 'white',
          _hover: {
            bg: mode('brand.600', 'brand.500')(props),
            transform: 'translateY(-1px)',
            boxShadow: 'lg',
          },
          _active: {
            bg: mode('brand.700', 'brand.600')(props),
            transform: 'translateY(0)',
            boxShadow: 'md',
          },
        }),
        outline: (props: StyleFunctionProps) => ({
          borderColor: mode('brand.500', 'brand.400')(props),
          color: mode('brand.500', 'brand.400')(props),
          _hover: {
            bg: mode(
              transparentize('brand.500', 0.1)(baseTheme),
              transparentize('brand.400', 0.1)(baseTheme)
            )(props),
            transform: 'translateY(-1px)',
            boxShadow: 'md',
          },
          _active: {
            bg: mode(
              transparentize('brand.600', 0.2)(baseTheme),
              transparentize('brand.500', 0.2)(baseTheme)
            )(props),
            transform: 'translateY(0)',
            boxShadow: 'sm',
          },
        }),
        glass: (props: StyleFunctionProps) => ({
          bg: mode(
            tokens.glassMorphism.light.background,
            tokens.glassMorphism.dark.background
          )(props),
          backdropFilter: `blur(${tokens.blur.md})`,
          border: '1px solid',
          borderColor: mode(
            tokens.glassMorphism.light.border,
            tokens.glassMorphism.dark.border
          )(props),
          color: mode('gray.800', 'whiteAlpha.900')(props),
          transition: `all ${tokens.animation.duration.normal} ${tokens.animation.easing.easeOut}`,
          _hover: {
            bg: mode(
              tokens.glassMorphism.light.hover,
              tokens.glassMorphism.dark.hover
            )(props),
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          _active: {
            bg: mode(
              tokens.glassMorphism.light.active,
              tokens.glassMorphism.dark.active
            )(props),
            transform: 'translateY(0)',
            boxShadow: 'md',
          },
        }),
        gradient: (props: StyleFunctionProps) => ({
          bg: mode(
            'linear-gradient(135deg, brand.400 0%, accent.400 100%)',
            'linear-gradient(135deg, brand.500 0%, accent.500 100%)'
          )(props),
          color: 'white',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 15px ${mode(
              transparentize('brand.400', 0.3)(baseTheme),
              transparentize('brand.500', 0.3)(baseTheme)
            )(props)}`,
          },
          _active: {
            transform: 'translateY(0)',
            boxShadow: `0 2px 8px ${mode(
              transparentize('brand.400', 0.4)(baseTheme),
              transparentize('brand.500', 0.4)(baseTheme)
            )(props)}`,
          },
        }),
      },
    },
    Card: {
      baseStyle: (props: StyleFunctionProps) => ({
        container: {
          bg: mode('white', 'gray.800')(props),
          borderRadius: 'xl',
          boxShadow: mode('md', 'dark-lg')(props),
          transition: `all ${tokens.animation.duration.normal} ${tokens.animation.easing.easeInOut}`,
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: mode('lg', 'dark-xl')(props),
          },
        },
      }),
      variants: {
        glass: (props: StyleFunctionProps) => ({
          container: {
            bg: mode(
              tokens.glassMorphism.light.background,
              tokens.glassMorphism.dark.background
            )(props),
            backdropFilter: `blur(${tokens.blur.md})`,
            border: '1px solid',
            borderColor: mode(
              tokens.glassMorphism.light.border,
              tokens.glassMorphism.dark.border
            )(props),
            _hover: {
              bg: mode(
                tokens.glassMorphism.light.hover,
                tokens.glassMorphism.dark.hover
              )(props),
            },
          },
        }),
      },
    },
    Input: {
      variants: {
        glass: (props: StyleFunctionProps) => ({
          field: {
            bg: mode(
              tokens.glassMorphism.light.background,
              tokens.glassMorphism.dark.background
            )(props),
            backdropFilter: `blur(${tokens.blur.md})`,
            border: '1px solid',
            borderColor: mode(
              tokens.glassMorphism.light.border,
              tokens.glassMorphism.dark.border
            )(props),
            _hover: {
              borderColor: mode('brand.400', 'brand.500')(props),
            },
            _focus: {
              borderColor: mode('brand.500', 'brand.400')(props),
              boxShadow: `0 0 0 1px ${mode('brand.500', 'brand.400')(props)}`,
            },
          },
        }),
      },
    },
    Modal: {
      baseStyle: (props: StyleFunctionProps) => ({
        overlay: {
          backdropFilter: `blur(${tokens.blur.sm})`,
        },
        dialog: {
          bg: mode('white', 'gray.800')(props),
          boxShadow: 'xl',
        },
      }),
      variants: {
        glass: (props: StyleFunctionProps) => ({
          dialog: {
            bg: mode(
              tokens.glassMorphism.light.background,
              tokens.glassMorphism.dark.background
            )(props),
            backdropFilter: `blur(${tokens.blur.lg})`,
            border: '1px solid',
            borderColor: mode(
              tokens.glassMorphism.light.border,
              tokens.glassMorphism.dark.border
            )(props),
          },
        }),
      },
    },
    Tooltip: {
      baseStyle: (props: StyleFunctionProps) => ({
        bg: mode('gray.700', 'gray.300')(props),
        color: mode('white', 'gray.900')(props),
        fontSize: 'sm',
        px: 3,
        py: 2,
        borderRadius: 'md',
        boxShadow: 'md',
        maxW: '320px',
        animation: `${tokens.animation.duration.fast} ${tokens.animation.easing.easeOut}`,
      }),
      variants: {
        glass: (props: StyleFunctionProps) => ({
          bg: mode(
            tokens.glassMorphism.light.background,
            tokens.glassMorphism.dark.background
          )(props),
          backdropFilter: `blur(${tokens.blur.md})`,
          border: '1px solid',
          borderColor: mode(
            tokens.glassMorphism.light.border,
            tokens.glassMorphism.dark.border
          )(props),
        }),
      },
    },
    Menu: {
      baseStyle: (props: StyleFunctionProps) => ({
        list: {
          bg: mode('white', 'gray.800')(props),
          boxShadow: mode('lg', 'dark-lg')(props),
          borderRadius: 'xl',
          border: '1px solid',
          borderColor: mode('gray.100', 'whiteAlpha.100')(props),
          p: 2,
        },
        item: {
          borderRadius: 'lg',
          transition: `all ${tokens.animation.duration.fast} ${tokens.animation.easing.easeInOut}`,
          _hover: {
            bg: mode('gray.100', 'whiteAlpha.200')(props),
          },
          _focus: {
            bg: mode('gray.100', 'whiteAlpha.200')(props),
          },
        },
      }),
      variants: {
        glass: (props: StyleFunctionProps) => ({
          list: {
            bg: mode(
              tokens.glassMorphism.light.background,
              tokens.glassMorphism.dark.background
            )(props),
            backdropFilter: `blur(${tokens.blur.md})`,
            borderColor: mode(
              tokens.glassMorphism.light.border,
              tokens.glassMorphism.dark.border
            )(props),
          },
          item: {
            _hover: {
              bg: mode(
                tokens.glassMorphism.light.hover,
                tokens.glassMorphism.dark.hover
              )(props),
            },
            _focus: {
              bg: mode(
                tokens.glassMorphism.light.hover,
                tokens.glassMorphism.dark.hover
              )(props),
            },
          },
        }),
      },
    },
    Drawer: {
      variants: {
        glass: (props: StyleFunctionProps) => ({
          dialog: {
            bg: mode(
              tokens.glassMorphism.light.background,
              tokens.glassMorphism.dark.background
            )(props),
            backdropFilter: `blur(${tokens.blur.lg})`,
            borderLeft: '1px solid',
            borderColor: mode(
              tokens.glassMorphism.light.border,
              tokens.glassMorphism.dark.border
            )(props),
          },
          overlay: {
            backdropFilter: `blur(${tokens.blur.sm})`,
          },
        }),
      },
    },
    Tabs: {
      variants: {
        glass: (props: StyleFunctionProps) => ({
          tab: {
            borderRadius: 'lg',
            transition: `all ${tokens.animation.duration.fast} ${tokens.animation.easing.easeInOut}`,
            _selected: {
              bg: mode(
                tokens.glassMorphism.light.hover,
                tokens.glassMorphism.dark.hover
              )(props),
              color: mode('brand.600', 'brand.200')(props),
            },
            _hover: {
              bg: mode(
                tokens.glassMorphism.light.hover,
                tokens.glassMorphism.dark.hover
              )(props),
            },
          },
          tabpanel: {
            bg: mode(
              tokens.glassMorphism.light.background,
              tokens.glassMorphism.dark.background
            )(props),
            backdropFilter: `blur(${tokens.blur.md})`,
            borderRadius: 'xl',
            p: 4,
          },
        }),
      },
    },
    Popover: {
      variants: {
        glass: (props: StyleFunctionProps) => ({
          content: {
            bg: mode(
              tokens.glassMorphism.light.background,
              tokens.glassMorphism.dark.background
            )(props),
            backdropFilter: `blur(${tokens.blur.md})`,
            border: '1px solid',
            borderColor: mode(
              tokens.glassMorphism.light.border,
              tokens.glassMorphism.dark.border
            )(props),
            boxShadow: 'xl',
          },
        }),
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: 'full',
        px: 3,
        py: 1,
        textTransform: 'none',
        fontWeight: 'medium',
      },
      variants: {
        glass: (props: StyleFunctionProps) => ({
          bg: mode(
            tokens.glassMorphism.light.background,
            tokens.glassMorphism.dark.background
          )(props),
          backdropFilter: `blur(${tokens.blur.sm})`,
          border: '1px solid',
          borderColor: mode(
            tokens.glassMorphism.light.border,
            tokens.glassMorphism.dark.border
          )(props),
        }),
        subtle: (props: StyleFunctionProps) => ({
          bg: mode(
            transparentize('brand.500', 0.15)(baseTheme),
            transparentize('brand.200', 0.15)(baseTheme)
          )(props),
          color: mode('brand.700', 'brand.200')(props),
        }),
      },
    },
    Table: {
      variants: {
        glass: (props: StyleFunctionProps) => ({
          th: {
            bg: mode(
              tokens.glassMorphism.light.background,
              tokens.glassMorphism.dark.background
            )(props),
            backdropFilter: `blur(${tokens.blur.sm})`,
            borderColor: mode(
              tokens.glassMorphism.light.border,
              tokens.glassMorphism.dark.border
            )(props),
          },
          td: {
            borderColor: mode(
              tokens.glassMorphism.light.border,
              tokens.glassMorphism.dark.border
            )(props),
          },
        }),
      },
    },
    Link: {
      baseStyle: (props: StyleFunctionProps) => ({
        transition: `all ${tokens.animation.duration.fast} ${tokens.animation.easing.easeInOut}`,
        _hover: {
          textDecoration: 'none',
          color: mode('brand.600', 'brand.300')(props),
        },
      }),
      variants: {
        gradient: (props: StyleFunctionProps) => ({
          bgGradient: mode(
            'linear(to-r, brand.500, accent.500)',
            'linear(to-r, brand.200, accent.200)'
          )(props),
          bgClip: 'text',
          _hover: {
            bgGradient: mode(
              'linear(to-r, brand.600, accent.600)',
              'linear(to-r, brand.300, accent.300)'
            )(props),
            transform: 'translateY(-1px)',
          },
        }),
      },
    },
    Divider: {
      variants: {
        gradient: (props: StyleFunctionProps) => ({
          borderWidth: '1px',
          borderStyle: 'solid',
          borderImage: mode(
            'linear-gradient(to right, brand.500, accent.500) 1',
            'linear-gradient(to right, brand.200, accent.200) 1'
          )(props),
        }),
      },
    },
  },
  layerStyles: {
    glass: (props: StyleFunctionProps) => ({
      bg: mode(
        tokens.glassMorphism.light.background,
        tokens.glassMorphism.dark.background
      )(props),
      backdropFilter: `blur(${tokens.blur.md})`,
      border: '1px solid',
      borderColor: mode(
        tokens.glassMorphism.light.border,
        tokens.glassMorphism.dark.border
      )(props),
      transition: `all ${tokens.animation.duration.normal} ${tokens.animation.easing.easeInOut}`,
    }),
    gradientBorder: (props: StyleFunctionProps) => ({
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: -1,
        padding: '1px',
        borderRadius: 'inherit',
        background: mode(
          'linear-gradient(135deg, brand.400 0%, accent.400 100%)',
          'linear-gradient(135deg, brand.500 0%, accent.500 100%)'
        )(props),
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
      },
    }),
  },
  textStyles: {
    gradient: (props: StyleFunctionProps) => ({
      bgGradient: mode(
        'linear(to-r, brand.500, accent.500)',
        'linear(to-r, brand.200, accent.200)'
      )(props),
      bgClip: 'text',
      fontWeight: 'bold',
    }),
    subtle: {
      fontSize: 'sm',
      color: 'gray.500',
    },
  },
});

export default theme;