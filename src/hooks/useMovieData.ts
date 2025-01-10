// src/pages/MoviePage/hooks/useMovieData.ts
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useToast } from '@chakra-ui/react';
import { useMediaQuery } from 'react-responsive';
import axios from 'axios';

import { useVideoPlayerLogic } from './useVideoPlayerLogic';
import { useMirrorLogic } from './useMirrorLogic';

import { getMovieCredits, getSimilarMovies, getTMDBMovieDetails } from '../services/tmdbService';
import movieService, { Mirror, MovieInfo } from '../services/movieService';
import { CombinedContent, MovieCredits } from '../types';

interface GroupedMirrors {
  [key: string]: {
    [key: string]: Mirror[];
  };
}

export const useMovieData = (tmdbId: string | undefined) => {
  // Estados básicos
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [watchPartyId, setWatchPartyId] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('');
  const [isBackupApiLoading, setIsBackupApiLoading] = useState(false);
  const [hasTriedBackupApi, setHasTriedBackupApi] = useState(false);
  const [failedMirrors, setFailedMirrors] = useState<Set<string>>(new Set());
  const [shouldRefreshMirrors, setShouldRefreshMirrors] = useState(false);
  const [isCustomSearchComplete, setIsCustomSearchComplete] = useState(false);

  // Hooks de React
  const toast = useToast();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Custom hooks
  const {
    currentMirrorIndex,
    isChangingMirror,
    handleChangeMirror,
  } = useMirrorLogic();

  const {
    isPlaying,
    currentQuality,
    handleQualityChange,
  } = useVideoPlayerLogic();

  // Queries principales
  const { data: movie, isLoading: isMovieLoading, error: movieError } = useQuery<CombinedContent, Error>(
    ['movie', tmdbId],
    () => fetchMovieDetails(tmdbId!),
    {
      enabled: !!tmdbId,
      onError: (error) => handleError(error, "loading movie details"),
    }
  );

  const { data: credits, isLoading: isCreditsLoading } = useQuery<MovieCredits, Error>(
    ['credits', tmdbId],
    () => getMovieCredits(parseInt(tmdbId!, 10)),
    {
      enabled: !!tmdbId,
      onError: (error) => handleError(error, "loading movie credits"),
    }
  );

  const { data: similarMovies, isLoading: isSimilarMoviesLoading } = useQuery<CombinedContent[], Error>(
    ['similarMovies', tmdbId],
    () => getSimilarMovies(parseInt(tmdbId!, 10)),
    {
      enabled: !!tmdbId,
      onError: (error) => handleError(error, "loading similar movies"),
    }
  );

  // Query de espejos
  const { data: mirrors, isLoading: isMirrorsLoading, refetch: refetchMirrors } = useQuery<Mirror[], Error>(
    ['mirrors', tmdbId, shouldRefreshMirrors, isCustomSearchComplete],
    () => movieService.searchMirrors(tmdbId ?? ''),
    {
      enabled: !!movie,
      staleTime: 0,
      cacheTime: 0,
      retry: 2,
      onError: (error) => handleError(error, "loading playback options"),
    }
  );

  // Procesamiento de espejos
  const groupedMirrors = useMemo<GroupedMirrors>(() => {
    if (!mirrors) return {};

    return mirrors.reduce((acc, mirror) => {
      const language = mirror.language || 'unknown';
      const quality = mirror.quality || 'unknown';
      const seeds = mirror.seeds || 0;

      if (!acc[language]) {
        acc[language] = {};
      }
      if (!acc[language][quality]) {
        acc[language][quality] = [];
      }

      acc[language][quality].push({
        ...mirror,
        language,
        quality,
        seeds
      });

      acc[language][quality].sort((a: { seeds: any; }, b: { seeds: any; }) => (b.seeds || 0) - (a.seeds || 0));

      return acc;
    }, {} as GroupedMirrors);
  }, [mirrors]);

  // Memos derivados
  const languages = useMemo(() => Object.keys(groupedMirrors), [groupedMirrors]);
  
  const qualities = useMemo(() => {
    if (selectedLanguage && groupedMirrors[selectedLanguage]) {
      return Object.keys(groupedMirrors[selectedLanguage]);
    }

    const allQualities = new Set<string>();
    Object.values(groupedMirrors).forEach(languageGroup => {
      Object.keys(languageGroup).forEach(quality => {
        allQualities.add(quality);
      });
    });

    return Array.from(allQualities);
  }, [groupedMirrors, selectedLanguage]);

  const selectedMirror = useMemo(() => {
    if (Object.keys(groupedMirrors).length === 0) return null;

    const language = selectedLanguage || Object.keys(groupedMirrors)[0];
    const quality = selectedQuality || qualities[0];

    const getNextAvailableMirror = (lang: string, qual: string) => {
      const mirrors = groupedMirrors[lang]?.[qual] || [];
      return mirrors.find(mirror => !failedMirrors.has(mirror.infoHash));
    };

    if (language && quality) {
      const mirror = getNextAvailableMirror(language, quality);
      if (mirror) return mirror;
    }

    for (const lang of Object.keys(groupedMirrors)) {
      for (const qual of qualities) {
        const mirror = getNextAvailableMirror(lang, qual);
        if (mirror) return mirror;
      }
    }

    if (failedMirrors.size === mirrors?.length) {
      setFailedMirrors(new Set());
      return mirrors[0];
    }

    return null;
  }, [groupedMirrors, selectedLanguage, selectedQuality, qualities, mirrors, failedMirrors]);

  // Query de información de película
  const { data: movieInfo, isLoading: isMovieInfoLoading } = useQuery<MovieInfo, Error>(
    ['movieInfo', selectedMirror?.infoHash],
    () => movieService.getMovieInfo(selectedMirror!.infoHash),
    {
      enabled: !!selectedMirror && !failedMirrors.has(selectedMirror.infoHash),
      staleTime: 0,
      cacheTime: 0,
      retry: 2,
      onError: (error) => {
        handleError(error, "loading movie info");
        if (selectedMirror) {
          setFailedMirrors(prev => new Set([...prev, selectedMirror.infoHash]));
          handleMirrorFailure();
        }
      },
      onSettled: () => {
        setIsVideoLoading(false);
      }
    }
  );

  // Backup API query
  const { data: backupMovieInfo, isLoading: isBackupMovieInfoLoading } = useQuery<MovieInfo, Error>(
    ['backupMovieInfo', tmdbId],
    () => axios.get(`https://chillflix-movie-importer.fly.dev/api/movie/${tmdbId}`).then(res => res.data),
    {
      enabled: !!movieError || (!!movieInfo && (!movieInfo.Files || movieInfo.Files.length === 0)),
      retry: false,
      onError: (error) => handleError(error, "loading backup source"),
    }
  );

  // Información final de la película
  const finalMovieInfo = useMemo(() => {
    return backupMovieInfo || movieInfo;
  }, [backupMovieInfo, movieInfo]);

  const videoFile = useMemo(() => {
    if (finalMovieInfo) {
      return movieService.findVideoFile(finalMovieInfo);
    }
    return null;
  }, [finalMovieInfo]);

  const streamUrl = useMemo(() => {
    if (!finalMovieInfo || !videoFile) {
      return null;
    }

    try {
      return movieService.getStreamUrl(videoFile.infoHash, videoFile.index);
    } catch (error) {
      console.error('Error generating stream URL:', error);
      return null;
    }
  }, [finalMovieInfo, videoFile]);

  const posterUrl = useMemo(() => {
    return movie ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';
  }, [movie]);

  const videoJsOptions = useMemo(() => ({
    sources: [{ src: streamUrl ?? "", type: "video/mp4" }],
  }), [streamUrl]);

  // Funciones auxiliares
  const handleError = (error: Error, context: string) => {
    console.error(`Error ${context}:`, error);
    toast({
      title: "Error",
      description: `We encountered an issue while ${context}. Please try again later.`,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  };

  const handleMirrorFailure = () => {
    toast({
      title: "Switching to alternate source",
      description: "Current source failed, trying another one...",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleBackupApiCall = async () => {
    if (!tmdbId || isBackupApiLoading) return;

    const MAX_RETRIES = 2;
    let currentTry = 0;

    setIsBackupApiLoading(true);

    while (currentTry <= MAX_RETRIES) {
      try {
        const response = await axios.get(
          `https://chillflix-movie-importer.fly.dev/api/movie/${tmdbId}`,
          { timeout: 60000 }
        );

        if (response.data) {
          setHasTriedBackupApi(true);
          handleBackupApiSuccess();
          return response.data;
        }
      } catch (error) {
        currentTry++;
        if (currentTry <= MAX_RETRIES) {
          await handleRetry(currentTry, MAX_RETRIES);
        } else {
          handleBackupApiFailure();
        }
      }
    }

    setIsBackupApiLoading(false);
  };

  const handleBackupApiSuccess = () => {
    toast({
      title: "Success",
      description: "Alternative source found!",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    setIsCustomSearchComplete(true);
    setShouldRefreshMirrors(prev => !prev);
    refetchMirrors();
    setFailedMirrors(new Set());
  };

  const handleRetry = async (currentTry: number, maxRetries: number) => {
    toast({
      title: "Retrying...",
      description: `Attempt ${currentTry} of ${maxRetries}`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
    await new Promise(resolve => setTimeout(resolve, 1000 * currentTry));
  };

  const handleBackupApiFailure = () => {
    if (selectedMirror && mirrors && mirrors.length > 0) {
      setFailedMirrors(prev => new Set([...prev, selectedMirror.infoHash]));
      const remainingMirrors = mirrors.filter(m => !failedMirrors.has(m.infoHash));
      
      if (remainingMirrors.length > 0) {
        toast({
          title: "Trying Another Source",
          description: "Switching to next available source...",
          status: "info",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: "No more sources available. Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  // Event handlers
  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    setSelectedQuality('');
  };

  const handleQualityChangeWrapper = (newQuality: any) => {
    setSelectedQuality(newQuality);
    handleQualityChange(newQuality);
  };

  const handleCreateWatchParty = (newPartyId: string) => {
    setWatchPartyId(newPartyId);
    setHasJoined(true);
    toast({
      title: "Watch Party Created",
      description: `Your Watch Party ID is: ${newPartyId}`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  const handleJoinParty = () => {
    setHasJoined(true);
    toast({
      title: "Joined Watch Party",
      description: "You've successfully joined the Watch Party!",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  // Effects
  useEffect(() => {
    queryClient.invalidateQueries(['movie', tmdbId]);
    queryClient.invalidateQueries(['mirrors', tmdbId]);
    queryClient.invalidateQueries(['movieInfo']);
    queryClient.invalidateQueries(['backupMovieInfo']);

    setSelectedLanguage('');
    setSelectedQuality('');
    setFailedMirrors(new Set());
  }, [tmdbId, queryClient]);

  useEffect(() => {
    if (isCustomSearchComplete) {
      refetchMirrors();
    }
  }, [isCustomSearchComplete, refetchMirrors]);

  useEffect(() => {
    setIsVideoLoading(isMirrorsLoading || isMovieInfoLoading || isBackupMovieInfoLoading);
  }, [isMirrorsLoading, isMovieInfoLoading, isBackupMovieInfoLoading]);

  // Return values
  return {
    // Estado base
    movie,
    isLoading: isMovieLoading,
    error: movieError,

    // Props para VideoSection
    videoProps: {
      isVideoLoading,
      streamUrl,
      videoJsOptions,
      movie,
      qualities,
      languages,
      handleQualityChange: handleQualityChangeWrapper,
      handleLanguageChange,
      posterUrl,
      hasTriedBackupApi,
      isBackupApiLoading,
      handleBackupApiCall
    },

    // Props para WatchParty
    watchPartyProps: {
      isVisible,
      watchPartyId,
      hasJoined,
      movie,
      onToggleVisibility: () => setIsVisible(!isVisible),
      onWatchPartyCreated: handleCreateWatchParty,
      onJoinParty: handleJoinParty
    },

    // Props para MovieDetails
    movieDetailsProps: {
      movie,
      credits,
      similarMovies,
      isCreditsLoading,
      isSimilarMoviesLoading,
      headerProps: {
        onTrailerPlay: () => {},
        isMobile,
        isLoading: false,
        onChangeMirror: handleChangeMirror,
        isChangingMirror,
        currentMirrorIndex,
        totalMirrors: mirrors?.length ?? 0,
        onOpenQualitySelector: () => {},
        isPlaying,
        currentQuality
      }
    },

    // Helpers y funciones
    utils: {
      refetchMirrors,
      setFailedMirrors,
      setShouldRefreshMirrors,
      setIsCustomSearchComplete
    },

    // Estado adicional para componentes específicos
    state: {
      selectedLanguage,
      selectedQuality,
      isCustomSearchComplete,
      shouldRefreshMirrors,
      failedMirrors,
      selectedMirror,
      mirrors
    }
};
};
const fetchMovieDetails = async (id: string): Promise<CombinedContent> => {
try {
  const tmdbData = await getTMDBMovieDetails(parseInt(id, 10));
  if (tmdbData && Object.keys(tmdbData).length > 0) {
    return tmdbData;
  } else {
    throw new Error('No TMDB data available or empty result');
  }
} catch (error) {
  console.error('Error fetching movie details from TMDB:', error);
  throw error;
}
};
