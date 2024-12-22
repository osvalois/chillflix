// hooks/useAnalytics.ts
import { getAnalytics, logEvent, Analytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../config/firebase';
// Configuración de Firebase (reemplazar con tus credenciales)

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

interface TrackingEvent {
  eventName: string;
  params?: Record<string, any>;
}

export const useAnalytics = () => {
  const trackEvent = (event: TrackingEvent) => {
    try {
      logEvent(analytics, event.eventName, event.params);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  const trackPageView = (pageName: string, additionalParams?: Record<string, any>) => {
    trackEvent({
      eventName: 'page_view',
      params: {
        page_name: pageName,
        ...additionalParams,
      },
    });
  };

  const trackContentInteraction = (contentId: string, contentType: string, action: string) => {
    trackEvent({
      eventName: 'content_interaction',
      params: {
        content_id: contentId,
        content_type: contentType,
        action: action,
        timestamp: new Date().toISOString(),
      },
    });
  };

  const trackError = (errorMessage: string, errorCode?: string) => {
    trackEvent({
      eventName: 'error_occurred',
      params: {
        error_message: errorMessage,
        error_code: errorCode,
        timestamp: new Date().toISOString(),
      },
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackContentInteraction,
    trackError,
  };
};
