// hooks/useRecommendationEngine.ts

import { useState, useEffect } from 'react';
import { CombinedContent, UserPreferences } from '../types';
import tmdbService from '../services/tmdbService';

export const useRecommendationEngine = (userId: string) => {
  const [recommendations, setRecommendations] = useState<CombinedContent[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      // In a real app, this would fetch user preferences from a backend
      const preferences = await tmdbService.getUserPreferences();
      setUserPreferences(preferences);
    };

    fetchUserPreferences();
  }, [userId]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (userPreferences) {
        try {
          const recommendedContent = await tmdbService.getRecommendations({
            userId,
            preferences: userPreferences,
            limit: 20
          });
          setRecommendations(recommendedContent);
        } catch (error) {
          console.error('Error fetching recommendations:', error);
        }
      }
    };

    fetchRecommendations();
  }, [userId, userPreferences]);

  return { recommendations, userPreferences, setUserPreferences };
};