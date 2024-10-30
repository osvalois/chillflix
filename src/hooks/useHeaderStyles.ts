// hooks/useHeaderStyles.ts
import { useColorMode } from "@chakra-ui/react";
import { rgba, lighten } from 'polished';
import { HeaderGradients, ThemeColors } from "../types";

export const useHeaderStyles = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const themeColors: ThemeColors = {
    primary: isDark ? '#4299E1' : '#3182CE',
    secondary: isDark ? '#9F7AEA' : '#805AD5',
    accent: isDark ? '#F6AD55' : '#ED8936',
    background: isDark ? '#1A202C' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1A202C',
    border: isDark ? rgba('#FFFFFF', 0.1) : rgba('#000000', 0.1),
  };

  const gradients: HeaderGradients = {
    primary: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
    accent: `linear-gradient(45deg, ${themeColors.accent} 0%, ${lighten(0.1, themeColors.accent)} 100%)`,
    glass: isDark
      ? `linear-gradient(135deg, ${rgba('#1A202C', 0.85)} 0%, ${rgba('#2D3748', 0.9)} 100%)`
      : `linear-gradient(135deg, ${rgba('#FFFFFF', 0.85)} 0%, ${rgba('#F7FAFC', 0.9)} 100%)`,
  };

  return {
    isDark,
    themeColors,
    gradients,
  };
};
