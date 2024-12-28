// hooks/useCarouselBreakpoints.ts
import { useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';

export const useCarouselBreakpoints = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
  
  return useMemo(() => ({
    isMobile,
    isTablet,
    slidesPerView: isMobile ? 1 : isTablet ? 1.5 : 2.5,
    navigationSize: isMobile ? "sm" : isTablet ? "md" : "lg",
    gapSize: isMobile ? 16 : isTablet ? 24 : 32,
  }), [isMobile, isTablet]);
};
