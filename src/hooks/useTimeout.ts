// src/components/VideoPlayer/hooks/useTimeout.ts
import { useRef, useCallback, useEffect } from 'react';

export const useTimeout = () => {
  const timeoutRefs = useRef<{ [key: string]: NodeJS.Timeout | null }>({});

  const setCustomTimeout = useCallback((key: string, callback: () => void, delay: number) => {
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]!);
    }
    timeoutRefs.current[key] = setTimeout(callback, delay);
  }, []);

  const clearCustomTimeout = useCallback((key: string) => {
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]!);
      timeoutRefs.current[key] = null;
    }
  }, []);

  const clearAllTimeouts = useCallback(() => {
    Object.keys(timeoutRefs.current).forEach(key => {
      if (timeoutRefs.current[key]) {
        clearTimeout(timeoutRefs.current[key]!);
        timeoutRefs.current[key] = null;
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  return { setCustomTimeout, clearCustomTimeout, clearAllTimeouts };
};