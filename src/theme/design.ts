export const DESIGN = {
    colors: {
      primary: '#2D3748',
      accent: '#4299E1',
      success: '#48BB78',
      warning: '#ECC94B',
      error: '#F56565',
      glass: {
        light: {
          background: 'rgba(255, 255, 255, 0.1)',
          hover: 'rgba(255, 255, 255, 0.15)',
          active: 'rgba(255, 255, 255, 0.2)',
          border: 'rgba(255, 255, 255, 0.18)'
        },
        dark: {
          background: 'rgba(15, 23, 42, 0.3)',
          hover: 'rgba(15, 23, 42, 0.35)',
          active: 'rgba(15, 23, 42, 0.4)',
          border: 'rgba(15, 23, 42, 0.38)'
        }
      },
      backdrop: {
        light: 'rgba(255, 255, 255, 0.8)',
        dark: 'rgba(15, 23, 42, 0.8)'
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
        sm: `0 2px 8px -1px rgba(0, 0, 0, 0.08), 0 1px 4px -2px rgba(0, 0, 0, 0.02)`,
        md: `0 4px 16px -2px rgba(0, 0, 0, 0.1), 0 2px 8px -3px rgba(0, 0, 0, 0.03)`,
        lg: `0 8px 32px -4px rgba(0, 0, 0, 0.12), 0 4px 16px -6px rgba(0, 0, 0, 0.04)`,
        xl: `0 16px 48px -8px rgba(0, 0, 0, 0.15), 0 8px 24px -12px rgba(0, 0, 0, 0.06)`
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
