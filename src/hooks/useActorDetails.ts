
// hooks/useActorDetails.ts
import { useState, useCallback } from 'react';
import axios from 'axios';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../config/constants';
import { ActorDetails, MovieCredit } from '../types';

export const useActorDetails = (memberId: number) => {
  const [actorDetails, setActorDetails] = useState<ActorDetails | null>(null);
  const [actorCredits, setActorCredits] = useState<MovieCredit[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchActorDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const [detailsResponse, creditsResponse] = await Promise.all([
        axios.get(`${TMDB_BASE_URL}/person/${memberId}`, {
          params: { api_key: TMDB_API_KEY }
        }),
        axios.get(`${TMDB_BASE_URL}/person/${memberId}/combined_credits`, {
          params: { api_key: TMDB_API_KEY }
        })
      ]);
      setActorDetails(detailsResponse.data);
      setActorCredits(creditsResponse.data.cast
        .sort((a: MovieCredit, b: MovieCredit) => b.vote_average - a.vote_average)
        .slice(0, 20)
      );
    } catch (error) {
      console.error('Error fetching actor details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [memberId]);

  return { actorDetails, actorCredits, isLoading, fetchActorDetails };
};
