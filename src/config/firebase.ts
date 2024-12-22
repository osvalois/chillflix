// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, Auth, User } from 'firebase/auth';
import { Analytics, getAnalytics, logEvent } from 'firebase/analytics';

export const firebaseConfig = {
    apiKey: "AIzaSyCULLCCLK40pBUQcxbRzfjZ1KP8vX2ja9A",
    authDomain: "chillflix-media.firebaseapp.com",
    projectId: "chillflix-media",
    storageBucket: "chillflix-media.firebasestorage.app",
    messagingSenderId: "706383741150",
    appId: "1:706383741150:web:e840fedf17b667cb49c24f",
    measurementId: "G-1VSF768QHP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth: Auth = getAuth(app);
export const analytics: Analytics = getAnalytics(app);

// Analytics Service Class
export class AnalyticsService {
    private analytics: Analytics;
    private currentUser: User | null;

    constructor() {
        this.analytics = analytics;
        this.currentUser = null;
        auth.onAuthStateChanged(user => {
            this.currentUser = user;
        });
    }

    // Log page views with user context
    logPageView(pageName: string, additionalParams?: Record<string, any>) {
        try {
            logEvent(this.analytics, 'page_view', {
                page_name: pageName,
                user_id: this.currentUser?.uid || 'anonymous',
                ...additionalParams
            });
        } catch (error) {
            console.error('Error logging page view:', error);
        }
    }

    // Log content views (movies/series)
    logContentView(contentType: 'movie' | 'series', contentId: string, contentName: string) {
        try {
            logEvent(this.analytics, 'content_view', {
                content_type: contentType,
                content_id: contentId,
                content_name: contentName,
                user_id: this.currentUser?.uid || 'anonymous',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error logging content view:', error);
        }
    }

    // Log playback events
    logPlaybackEvent(eventType: 'play' | 'pause' | 'seek' | 'complete', contentId: string, position: number) {
        try {
            logEvent(this.analytics, 'playback_event', {
                event_type: eventType,
                content_id: contentId,
                position_seconds: position,
                user_id: this.currentUser?.uid || 'anonymous',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error logging playback event:', error);
        }
    }

    // Log user interactions
    logUserInteraction(interactionType: string, elementId: string, additionalParams?: Record<string, any>) {
        try {
            logEvent(this.analytics, 'user_interaction', {
                interaction_type: interactionType,
                element_id: elementId,
                user_id: this.currentUser?.uid || 'anonymous',
                ...additionalParams,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error logging user interaction:', error);
        }
    }

    // Log search events
    logSearch(searchQuery: string, resultCount: number) {
        try {
            logEvent(this.analytics, 'search', {
                search_term: searchQuery,
                results_count: resultCount,
                user_id: this.currentUser?.uid || 'anonymous',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error logging search:', error);
        }
    }

    // Log errors
    logError(errorType: string, errorMessage: string, errorContext?: Record<string, any>) {
        try {
            logEvent(this.analytics, 'app_error', {
                error_type: errorType,
                error_message: errorMessage,
                user_id: this.currentUser?.uid || 'anonymous',
                ...errorContext,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error logging app error:', error);
        }
    }

    // Log user preferences
    logUserPreference(preferenceType: string, preferenceValue: any) {
        try {
            logEvent(this.analytics, 'user_preference', {
                preference_type: preferenceType,
                preference_value: preferenceValue,
                user_id: this.currentUser?.uid || 'anonymous',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error logging user preference:', error);
        }
    }

    // Log navigation events
    logNavigation(from: string, to: string, additionalParams?: Record<string, any>) {
        try {
            logEvent(this.analytics, 'navigation', {
                from_path: from,
                to_path: to,
                user_id: this.currentUser?.uid || 'anonymous',
                ...additionalParams,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error logging navigation:', error);
        }
    }

    // Log authentication events
    logAuthEvent(eventType: 'sign_in' | 'sign_out' | 'sign_up', method: string, additionalParams?: Record<string, any>) {
        try {
            logEvent(this.analytics, 'auth_event', {
                event_type: eventType,
                auth_method: method,
                user_id: this.currentUser?.uid || 'anonymous',
                ...additionalParams,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error logging auth event:', error);
        }
    }

    // Log performance metrics
    logPerformance(metricName: string, value: number, additionalParams?: Record<string, any>) {
        try {
            logEvent(this.analytics, 'performance', {
                metric_name: metricName,
                metric_value: value,
                user_id: this.currentUser?.uid || 'anonymous',
                ...additionalParams,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error logging performance metric:', error);
        }
    }
}

// Create instance of Analytics Service
export const analyticsService = new AnalyticsService();

// Export default object with all Firebase services
export default {
    app,
    auth,
    analytics,
    analyticsService,
    firebaseConfig
};