import { useCallback, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAnalytics, 
  logEvent, 
  setUserProperties,
  Analytics 
} from 'firebase/analytics';
import { firebaseConfig } from '../config/firebase';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    // Initialize analytics in useEffect to ensure window is available
    if (typeof window !== 'undefined') {
      try {
        const analyticsInstance = getAnalytics(app);
        setAnalytics(analyticsInstance);
      } catch (error) {
        console.error('Failed to initialize Firebase Analytics:', error);
      }
    }
  }, []);

  const trackEvent = useCallback((
    eventName: string, 
    eventProperties?: Record<string, any>
  ) => {
    if (!analytics) {
      console.warn('Analytics not initialized');
      return;
    }

    try {
      // Log event to Firebase Analytics
      logEvent(analytics, eventName, {
        ...eventProperties,
        timestamp: new Date().toISOString(),
      });

      // Optional: Log to console in development
      if (import.meta.env.DEV) {
        console.log('Analytics event tracked:', { 
          eventName, 
          eventProperties 
        });
      }
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, [analytics]);

  const setUserProps = useCallback((
    properties: Record<string, any>
  ) => {
    if (!analytics) {
      console.warn('Analytics not initialized');
      return;
    }

    try {
      setUserProperties(analytics, properties);
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }, [analytics]);

  return { 
    trackEvent,
    setUserProps,
    isInitialized: !!analytics 
  };
};