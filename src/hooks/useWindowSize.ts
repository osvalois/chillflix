import { useState, useEffect, useCallback } from 'react';

interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
}

interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
}

const BREAKPOINTS: BreakpointConfig = {
  mobile: 768,    // 0-767px = mobile
  tablet: 1024,   // 768-1023px = tablet
  desktop: 1920,  // 1024px+ = desktop
};

const getDeviceConfig = (width: number): { 
  isMobile: boolean; 
  isTablet: boolean; 
  isDesktop: boolean; 
} => {
  if (width < BREAKPOINTS.mobile) {
    return {
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    };
  } else if (width < BREAKPOINTS.tablet) {
    return {
      isMobile: false,
      isTablet: true,
      isDesktop: false,
    };
  }
  return {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  };
};

const getOrientation = (width: number, height: number): 'portrait' | 'landscape' => 
  height > width ? 'portrait' : 'landscape';

const getInitialSize = (): WindowSize => {
  // Check if window is defined (browser) or not (SSR)
  const isClient = typeof window === 'object';

  if (!isClient) {
    return {
      width: 0,
      height: 0,
      isMobile: false,
      isTablet: false,
      isDesktop: false,
      orientation: 'landscape'
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const deviceConfig = getDeviceConfig(width);

  return {
    width,
    height,
    ...deviceConfig,
    orientation: getOrientation(width, height),
  };
};

const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>(getInitialSize);

  const handleResize = useCallback(() => {
    if (typeof window !== 'object') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const deviceConfig = getDeviceConfig(width);

    setWindowSize({
      width,
      height,
      ...deviceConfig,
      orientation: getOrientation(width, height),
    });
  }, []);

  useEffect(() => {
    if (typeof window !== 'object') return;

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Optional: Add orientation change listener for mobile devices
    window.addEventListener('orientationchange', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [handleResize]);

  // Debounce the resize handler for better performance
  useEffect(() => {
    if (typeof window !== 'object') return;

    let timeoutId: NodeJS.Timeout;

    const debouncedHandleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedHandleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, [handleResize]);

  // Media Query Listeners for more accurate breakpoint detection
  useEffect(() => {
    if (typeof window !== 'object') return;

    const mediaQueries = {
      mobile: window.matchMedia(`(max-width: ${BREAKPOINTS.mobile - 1}px)`),
      tablet: window.matchMedia(
        `(min-width: ${BREAKPOINTS.mobile}px) and (max-width: ${BREAKPOINTS.tablet - 1}px)`
      ),
      desktop: window.matchMedia(`(min-width: ${BREAKPOINTS.tablet}px)`),
    };

    const updateSizeFromMQ = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize(prev => ({
        ...prev,
        width,
        height,
        isMobile: mediaQueries.mobile.matches,
        isTablet: mediaQueries.tablet.matches,
        isDesktop: mediaQueries.desktop.matches,
        orientation: getOrientation(width, height),
      }));
    };

    // Add listeners for each media query
    Object.values(mediaQueries).forEach(mq => {
      if (mq.addListener) {
        mq.addListener(updateSizeFromMQ);
      } else {
        // Modern browsers
        mq.addEventListener('change', updateSizeFromMQ);
      }
    });

    // Initial check
    updateSizeFromMQ();

    // Cleanup
    return () => {
      Object.values(mediaQueries).forEach(mq => {
        if (mq.removeListener) {
          mq.removeListener(updateSizeFromMQ);
        } else {
          // Modern browsers
          mq.removeEventListener('change', updateSizeFromMQ);
        }
      });
    };
  }, []);

  return windowSize;
};

// Custom type guard
export const isClient = (): boolean => {
  return typeof window === 'object';
};

// Utility functions for common checks
export const isBreakpoint = (width: number, breakpoint: keyof BreakpointConfig): boolean => {
  return width < BREAKPOINTS[breakpoint];
};

export const getBreakpointValue = (
  breakpoint: keyof BreakpointConfig
): number => {
  return BREAKPOINTS[breakpoint];
};

export const isMobileDevice = (): boolean => {
  if (!isClient()) return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Export everything
export { BREAKPOINTS, type WindowSize, type BreakpointConfig };
export default useWindowSize;