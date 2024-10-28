import { useColorModeValue } from '@chakra-ui/react';
import { useMemo } from 'react';
import { rgba } from 'polished';
import { DESIGN } from '../theme/design';

export const useNavStyles = () => {
  return useMemo(() => ({
    background: useColorModeValue(
      `linear-gradient(135deg, ${DESIGN.colors.glass.light.background} 0%, ${rgba(DESIGN.colors.glass.light.background, 0.7)} 100%)`,
      `linear-gradient(135deg, ${DESIGN.colors.glass.dark.background} 0%, ${rgba(DESIGN.colors.glass.dark.background, 0.7)} 100%)`
    ),
    backdropFilter: `blur(${DESIGN.blur.md}) saturate(180%)`,
    border: useColorModeValue(
      `1px solid ${DESIGN.colors.glass.light.border}`,
      `1px solid ${DESIGN.colors.glass.dark.border}`
    ),
    boxShadow: useColorModeValue(
      DESIGN.shadows.glass.md,
      DESIGN.shadows.glass.md
    ),
    transition: `all ${DESIGN.animation.duration.normal}s ${DESIGN.animation.easing.glass}`,
    borderRadius: '16px',
    padding: '24px',
    position: 'relative' as const,
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: useColorModeValue(
        DESIGN.shadows.glass.lg,
        DESIGN.shadows.glass.lg
      )
    },
    '&:active': {
      transform: 'translateY(0)',
      background: useColorModeValue(
        DESIGN.colors.glass.light.active,
        DESIGN.colors.glass.dark.active
      )
    }
  }), []);
};
