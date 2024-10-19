// useContentData.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { CombinedContent, Genre } from '../types';
import tmdbService from '../services/tmdbService';
import { useRecommendationEngine } from './useRecommendationEngine';

export const useContentData = () => {
  const [trendingContent, setTrendingContent] = useState<CombinedContent[]>([]);
  const [featuredContent, setFeaturedContent] = useState<CombinedContent | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [topRated, setTopRated] = useState<CombinedContent[]>([]);
  const [upcoming, setUpcoming] = useState<CombinedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { recommendations } = useRecommendationEngine('');

  const validateContent = useCallback((content: CombinedContent): boolean => {
    return !!(content && content.id && (content.title || content.name) && content.poster_path);
  }, []);

  const filterValidContent = useCallback((contentList: CombinedContent[]): CombinedContent[] => {
    return contentList.filter(validateContent);
  }, [validateContent]);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [trending, genreList, topRatedContent, upcomingContent] = await Promise.all([
        tmdbService.getTrendingContent(),
        tmdbService.getGenres(),
        tmdbService.getTopRated(),
        tmdbService.getUpcoming(),
      ]);

      const validTrending = filterValidContent(trending);
      setTrendingContent(validTrending);
      setFeaturedContent(validTrending[0] || null);
      setGenres(genreList.filter(genre => genre && genre.id && genre.name));
      setTopRated(filterValidContent(topRatedContent));
      setUpcoming(filterValidContent(upcomingContent));
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Failed to fetch content. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [filterValidContent]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const personalizedRecommendations = useMemo(() => {
    return filterValidContent(recommendations).slice(0, 10);
  }, [recommendations, filterValidContent]);

  const getContentByGenre = useCallback(async (genreId: number) => {
    try {
      const contentByGenre = await tmdbService.getMoviesByGenre(genreId);
      return filterValidContent(contentByGenre);
    } catch (error) {
      console.error(`Error fetching content for genre ${genreId}:`, error);
      return [];
    }
  }, [filterValidContent]);

  return {
    featuredContent,
    trendingContent,
    topRated,
    upcoming,
    personalizedRecommendations,
    genres,
    isLoading,
    error,
    getContentByGenre,
    refreshContent: fetchContent,
  };
};