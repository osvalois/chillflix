// hooks/useMovieInsertion.ts
import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { MovieStorageService } from '../services/movieStorageService';
import { CombinedContent } from '../types';
import { Mirror } from '../services/movieService';

interface MovieInsertionHook {
  insertMovie: (movie: CombinedContent, mirror: Mirror) => Promise<void>;
  isInserting: boolean;
  error: Error | null;
}

export const useMovieInsertion = (): MovieInsertionHook => {
  const [isInserting, setIsInserting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();
  const movieStorage = MovieStorageService.getInstance();

  const insertMovie = useCallback(async (movie: CombinedContent, mirror: Mirror) => {
    setIsInserting(true);
    setError(null);

    try {
      const movieData = {
        movieDuration: 0,
        tmdb_id: movie.id,
        title: movie.title,
        classification: movie.adult ? 'R' : 'PG',
        torrent_hash: mirror.infoHash,
        resource_index: mirror.index || 0
      };

      await movieStorage.saveOrUpdateMovie(movieData);

      toast({
        title: "Success",
        description: `Movie "${movie.title}" has been saved successfully`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: "Error saving movie",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setIsInserting(false);
    }
  }, [toast]);

  return {
    insertMovie,
    isInserting,
    error
  };
};