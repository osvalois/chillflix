// hooks/useEventLogger.ts
import { useCallback } from 'react';

export interface Logger {
  error: (message: string, error: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  debug: (message: string, data?: unknown) => void;
}

export const useEventLogger = (): Logger => {
  const formatError = useCallback((error: unknown): string => {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}\nStack: ${error.stack}`;
    }
    return String(error);
  }, []);

  const formatData = useCallback((data: unknown): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }, []);

  const error = useCallback((message: string, error: unknown) => {
    console.error(`[VideoPlayer] ${message}`, formatError(error));
  }, [formatError]);

  const warn = useCallback((message: string, data?: unknown) => {
    console.warn(`[VideoPlayer] ${message}`, data ? formatData(data) : '');
  }, [formatData]);

  const info = useCallback((message: string, data?: unknown) => {
    console.info(`[VideoPlayer] ${message}`, data ? formatData(data) : '');
  }, [formatData]);

  const debug = useCallback((message: string, data?: unknown) => {
    console.debug(`[VideoPlayer] ${message}`, data ? formatData(data) : '');
  }, [formatData]);

  return {
    error,
    warn,
    info,
    debug
  };
};
