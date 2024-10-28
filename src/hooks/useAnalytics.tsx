import { useCallback } from 'react';

export const useAnalytics = () => {
  const trackEvent = useCallback((eventName: string, eventProperties?: Record<string, any>) => {
    // This is a placeholder for actual analytics tracking
    // In a real-world scenario, you would integrate with your analytics service here
    console.log('Analytics event tracked:', { eventName, eventProperties });

    // Example integration with Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, eventProperties);
    }

    // Example integration with Mixpanel
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track(eventName, eventProperties);
    }
  }, []);

  return { trackEvent };
};