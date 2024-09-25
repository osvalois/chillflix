import { useState, useEffect, useMemo } from 'react';
import { CombinedContent, Genre } from '../types';
import tmdbService from '../services/tmdbService';
import { useRecommendationEngine } from './useRecommendationEngine';

export const useContentData = () => {
  const [trendingContent, setTrendingContent] = useState<CombinedContent[]>([]);
  const [featuredContent, setFeaturedContent] = useState<CombinedContent | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [topRated, setTopRated] = useState<CombinedContent[]>([]);
  const [upcoming, setUpcoming] = useState<CombinedContent[]>([]);

  const { recommendations } = useRecommendationEngine();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [trending, genreList, topRatedContent, upcomingContent] = await Promise.all([
          tmdbService.getTrendingContent(),
          tmdbService.getGenres(),
          tmdbService.getTopRated(),
          tmdbService.getUpcoming(),
        ]);
        setTrendingContent(trending);
        setFeaturedContent(trending[0]);
        setGenres(genreList);
        setTopRated(topRatedContent);
        setUpcoming(upcomingContent);
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    fetchContent();
  }, []);

  const personalizedRecommendations = useMemo(() => {
    return recommendations.slice(0, 10);
  }, [recommendations]);

  return {
    featuredContent,
    trendingContent,
    topRated,
    upcoming,
    personalizedRecommendations,
    genres,
  };
};