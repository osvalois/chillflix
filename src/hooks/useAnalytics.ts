// hooks/useAnalytics.ts
import { getAnalytics, logEvent, Analytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../config/firebase';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Definir los tipos de eventos permitidos como const para garantizar literales
export const VIDEO_EVENTS = {
  VIDEO_ERROR: 'video_error',
  PLAY_ERROR_AFTER_RETRY: 'play_error_after_retry',
  AUDIO_TRACKS_ERROR: 'audio_tracks_error',
  LONG_BUFFERING: 'long_buffering',
  VIDEO_PLAY: 'video_play',
  VIDEO_PAUSE: 'video_pause',
  VIDEO_LOADED: 'video_loaded',
  VIDEO_ENDED: 'video_ended',
  SUBTITLE_FETCH_ERROR: 'subtitle_fetch_error',
  DOUBLE_CLICK_FULLSCREEN_TOGGLE: 'double_click_fullscreen_toggle',
  SINGLE_CLICK_INTERACTION: 'single_click_interaction',
  SUBTITLE_CHANGED: 'subtitle_changed',
  SUBTITLES_DISABLED: 'subtitles_disabled',
  SUBTITLE_ERROR: 'subtitle_error',
  VOLUME_CHANGE: 'volume_change',
  QUALITY_CHANGE: 'quality_change',
  LANGUAGE_CHANGE: 'language_change',
  HOTKEY_PLAY_PAUSE: 'hotkey_play_pause',
  HOTKEY_MUTE_TOGGLE: 'hotkey_mute_toggle',
  HOTKEY_FULLSCREEN_TOGGLE: 'hotkey_fullscreen_toggle',
  HOTKEY_REWIND: 'hotkey_rewind',
  HOTKEY_FAST_FORWARD: 'hotkey_fast_forward',
  PAGE_VIEW: 'page_view',
  CONTENT_INTERACTION: 'content_interaction',
  ERROR_OCCURRED: 'error_occurred'
} as const;

// Tipo que representa todos los valores posibles de VIDEO_EVENTS
type VideoEventTypes = typeof VIDEO_EVENTS[keyof typeof VIDEO_EVENTS];

export const useAnalytics = () => {
  const logVideoEvent = (analytics: Analytics, eventName: string, params?: Record<string, any>) => {
    try {
      logEvent(analytics, eventName, params);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  const trackEvent = (eventName: VideoEventTypes, params?: Record<string, any>) => {
    logVideoEvent(analytics, eventName, params);
  };

  const trackPageView = (pageName: string, additionalParams?: Record<string, any>) => {
    logVideoEvent(analytics, VIDEO_EVENTS.PAGE_VIEW, {
      page_name: pageName,
      ...additionalParams,
    });
  };

  const trackContentInteraction = (contentId: string, contentType: string, action: string) => {
    logVideoEvent(analytics, VIDEO_EVENTS.CONTENT_INTERACTION, {
      content_id: contentId,
      content_type: contentType,
      action: action,
      timestamp: new Date().toISOString(),
    });
  };

  const trackError = (errorMessage: string, errorCode?: string) => {
    logVideoEvent(analytics, VIDEO_EVENTS.ERROR_OCCURRED, {
      error_message: errorMessage,
      error_code: errorCode,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackContentInteraction,
    trackError,
  };
};