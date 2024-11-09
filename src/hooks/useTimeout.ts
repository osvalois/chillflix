import { useRef, useCallback, useEffect, useState } from 'react';

interface TimeoutConfig {
  callback: () => void;
  delay: number;
  isActive: boolean;
  lastUpdate: number;
}

interface UseTimeoutOptions {
  onTimeoutStart?: () => void;
  onTimeoutClear?: () => void;
  debug?: boolean;
}

export const useTimeout = (options: UseTimeoutOptions = {}) => {
  const { onTimeoutStart, onTimeoutClear, debug = false } = options;
  
  // Refs para almacenar los timeouts y su configuración
  const timeoutRefs = useRef<{ [key: string]: NodeJS.Timeout | null }>({});
  const timeoutConfigs = useRef<{ [key: string]: TimeoutConfig }>({});
  
  // Estado para tracking de timeouts activos
  const [activeTimeouts, setActiveTimeouts] = useState<string[]>([]);

  // Función para loggear en debug mode
  const logDebug = useCallback((message: string, data?: any) => {
    if (debug) {
      console.log(`[useTimeout] ${message}`, data || '');
    }
  }, [debug]);

  // Función mejorada para establecer timeouts
  const setCustomTimeout = useCallback((
    key: string,
    callback: () => void,
    delay: number,
    enforceReset: boolean = false
  ) => {
    const now = Date.now();
    const existingConfig = timeoutConfigs.current[key];

    // Si ya existe un timeout para esta key
    if (existingConfig && !enforceReset) {
      // Si el timeout está activo y la configuración es la misma
      if (existingConfig.isActive && 
          existingConfig.delay === delay &&
          now - existingConfig.lastUpdate < delay) {
        logDebug(`Timeout "${key}" already active with same config, skipping reset`);
        return;
      }
    }

    // Limpiar timeout existente si lo hay
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]!);
      logDebug(`Cleared existing timeout for "${key}"`);
    }

    // Crear nueva configuración
    timeoutConfigs.current[key] = {
      callback,
      delay,
      isActive: true,
      lastUpdate: now
    };

    // Establecer nuevo timeout
    timeoutRefs.current[key] = setTimeout(() => {
      try {
        callback();
        logDebug(`Timeout "${key}" executed successfully`);
      } catch (error) {
        console.error(`Error in timeout "${key}":`, error);
      } finally {
        // Limpiar después de la ejecución
        if (timeoutConfigs.current[key]) {
          timeoutConfigs.current[key].isActive = false;
        }
        timeoutRefs.current[key] = null;
        setActiveTimeouts(prev => prev.filter(t => t !== key));
        onTimeoutClear?.();
      }
    }, delay);

    // Actualizar estado de timeouts activos
    setActiveTimeouts(prev => [...new Set([...prev, key])]);
    onTimeoutStart?.();
    logDebug(`Set new timeout for "${key}" with ${delay}ms delay`);
  }, [logDebug, onTimeoutStart, onTimeoutClear]);

  // Función mejorada para limpiar timeouts específicos
  const clearCustomTimeout = useCallback((key: string) => {
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]!);
      timeoutRefs.current[key] = null;
      
      if (timeoutConfigs.current[key]) {
        timeoutConfigs.current[key].isActive = false;
      }
      
      setActiveTimeouts(prev => prev.filter(t => t !== key));
      onTimeoutClear?.();
      logDebug(`Cleared timeout "${key}"`);
    }
  }, [logDebug, onTimeoutClear]);

  // Función para pausar un timeout
  const pauseTimeout = useCallback((key: string) => {
    const config = timeoutConfigs.current[key];
    if (config && config.isActive) {
      const remainingTime = config.delay - (Date.now() - config.lastUpdate);
      if (remainingTime > 0) {
        clearCustomTimeout(key);
        config.delay = remainingTime;
        config.isActive = false;
        logDebug(`Paused timeout "${key}" with ${remainingTime}ms remaining`);
      }
    }
  }, [clearCustomTimeout, logDebug]);

  // Función para reanudar un timeout
  const resumeTimeout = useCallback((key: string) => {
    const config = timeoutConfigs.current[key];
    if (config && !config.isActive) {
      setCustomTimeout(key, config.callback, config.delay);
      logDebug(`Resumed timeout "${key}"`);
    }
  }, [setCustomTimeout, logDebug]);

  // Función para limpiar todos los timeouts
  const clearAllTimeouts = useCallback(() => {
    Object.keys(timeoutRefs.current).forEach(key => {
      if (timeoutRefs.current[key]) {
        clearTimeout(timeoutRefs.current[key]!);
        timeoutRefs.current[key] = null;
        
        if (timeoutConfigs.current[key]) {
          timeoutConfigs.current[key].isActive = false;
        }
      }
    });
    setActiveTimeouts([]);
    onTimeoutClear?.();
    logDebug('Cleared all timeouts');
  }, [logDebug, onTimeoutClear]);

  // Función para obtener el estado actual de un timeout
  const getTimeoutStatus = useCallback((key: string) => {
    const config = timeoutConfigs.current[key];
    if (config) {
      const remainingTime = config.delay - (Date.now() - config.lastUpdate);
      return {
        isActive: config.isActive,
        remainingTime: Math.max(0, remainingTime),
        totalDelay: config.delay
      };
    }
    return null;
  }, []);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  return {
    setCustomTimeout,
    clearCustomTimeout,
    clearAllTimeouts,
    pauseTimeout,
    resumeTimeout,
    getTimeoutStatus,
    activeTimeouts
  };
};