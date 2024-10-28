import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Box, Container, VStack, useToast, Button, Skeleton, HStack, Text } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft } from 'react-icons/fa';
import { useMediaQuery } from 'react-responsive';
import { ErrorBoundary } from 'react-error-boundary';
import { useInView } from 'react-intersection-observer';

import { getTMDBMovieDetails, getMovieCredits, getSimilarMovies } from '../services/tmdbService';
import movieService, { Mirror, MovieInfo } from '../services/movieService';
import { CombinedContent, MovieCredits } from '../types';

import VideoPlayer from '../components/VideoPlayer/VideoPlayer';
import MovieHeader from '../components/Movie/MovieHeader';
import CastSection from '../components/Movie/CastSection';
import SimilarMoviesSection from '../components/Movie/SimilarMoviesSection';
import ErrorFallback from '../components/UI/ErrorFallback';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ReviewSection from '../components/ReviewSection/ReviewSection';

import { useVideoPlayerLogic } from '../hooks/useVideoPlayerLogic';
import { useMirrorLogic } from '../hooks/useMirrorLogic';

import { CreateWatchParty } from '../components/WatchParty/CreateWatchParty';
import { InviteFriends } from '../components/WatchParty/InviteFriends';
import { JoinWatchParty } from '../components/WatchParty/JoinWatchParty';
import { ChatRoom } from '../components/WatchParty/ChatRoom';
import LoadingMessage from '../components/common/LoadingMessage';

const MotionBox = motion(Box as any);

const glassmorphismStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(10px)",
  borderRadius: "20px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: 
    "0 4px 30px rgba(0, 0, 0, 0.1), " +
    "inset 0 0 20px rgba(255, 255, 255, 0.05), " +
    "0 0 0 1px rgba(255, 255, 255, 0.1)",
  overflow: "hidden",
};

interface GroupedMirrors {
  [key: string]: {
    [key: string]: Mirror[];
  };
}

const MoviePage: React.FC = () => {
  const { tmdbId } = useParams<{ tmdbId: string }>();
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [watchPartyId, setWatchPartyId] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('');

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

  // Fetch current user ID (you'll need to implement this based on your auth system)
  const { data: userId } = useQuery('userId', () => "movieService.getCurrentUserId()");

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

  const { data: movie, isLoading: isMovieLoading, error: movieError } = useQuery<CombinedContent, Error>(
    ['movie', tmdbId],
    () => fetchMovieDetails(tmdbId!),
    { 
      enabled: !!tmdbId,
      onError: (error) => {
        console.error('Error fetching movie details:', error);
        toast({
          title: "Error",
          description: "We're having trouble loading the movie details. Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  );

  const { data: credits, isLoading: isCreditsLoading } = useQuery<MovieCredits, Error>(
    ['credits', tmdbId],
    () => getMovieCredits(parseInt(tmdbId!, 10)),
    { 
      enabled: !!tmdbId,
      onError: (error) => {
        console.error('Error fetching movie credits:', error);
      }
    }
  );

  const { data: similarMovies, isLoading: isSimilarMoviesLoading } = useQuery<CombinedContent[], Error>(
    ['similarMovies', tmdbId],
    () => getSimilarMovies(parseInt(tmdbId!, 10)),
    { 
      enabled: !!tmdbId,
      onError: (error) => {
        console.error('Error fetching similar movies:', error);
      }
    }
  );

  const { data: mirrors, isLoading: isMirrorsLoading } = useQuery<Mirror[], Error>(
    ['mirrors', tmdbId],
    () => movieService.searchMirrors(tmdbId ?? ''),
    { 
      enabled: !!movie,
      onError: (error) => {
        console.error('Error fetching mirrors:', error);
        toast({
          title: "Playback Options Unavailable",
          description: "We couldn't load the playback options. Please try again later.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  );

  const groupedMirrors = useMemo<GroupedMirrors>(() => {
    if (!mirrors) return {};
    return mirrors.reduce((acc, mirror) => {
      if (!acc[mirror.language]) {
        acc[mirror.language] = {};
      }
      if (!acc[mirror.language][mirror.quality]) {
        acc[mirror.language][mirror.quality] = [];
      }
      acc[mirror.language][mirror.quality].push(mirror);
      return acc;
    }, {} as GroupedMirrors);
  }, [mirrors]);

  const languages = useMemo(() => {
    return Object.keys(groupedMirrors);
  }, [groupedMirrors]);

  const qualities = useMemo(() => {
    if (selectedLanguage) {
      return Object.keys(groupedMirrors[selectedLanguage] || {});
    }
    return [];
  }, [groupedMirrors, selectedLanguage]);

  const selectedMirror = useMemo(() => {
    if (!selectedLanguage || !selectedQuality) return null;
    return groupedMirrors[selectedLanguage]?.[selectedQuality]?.[0] ?? null;
  }, [groupedMirrors, selectedLanguage, selectedQuality]);

  const { data: movieInfo, isLoading: isMovieInfoLoading, error: movieInfoError } = useQuery<MovieInfo, Error>(
    ['movieInfo', selectedMirror?.infoHash],
    () => movieService.getMovieInfo(selectedMirror!.infoHash),
    { 
      enabled: !!selectedMirror,
      retry: false,
      onError: (error) => {
        console.error('Error fetching movie info:', error);
      }
    }
  );

  const { data: backupMovieInfo, isLoading: isBackupMovieInfoLoading } = useQuery<MovieInfo, Error>(
    ['backupMovieInfo', tmdbId],
    () => axios.get(`https://chillflix-movie-importer.fly.dev/api/movie/${tmdbId}`).then(res => res.data),
    {
      enabled: !!movieInfoError || (!!movieInfo && (!movieInfo.Files || movieInfo.Files.length === 0)),
      retry: false,
      onError: (error) => {
        console.error('Error fetching backup movie info:', error);
        toast({
          title: 'Playback Error',
          description: 'We encountered an issue preparing your video. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  );

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
    if (finalMovieInfo && videoFile) {
      return movieService.getStreamUrl(videoFile.infoHash, videoFile.index);
    }
    return null;
  }, [finalMovieInfo, videoFile]);
  const posterUrl = useMemo(() => {
    return movie ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';
  }, [movie]);

  const videoJsOptions = useMemo(() => ({
    sources: [{ src: streamUrl ?? "", type: "video/mp4" }],
  }), [streamUrl]);

  useEffect(() => {
    setIsVideoLoading(isMirrorsLoading || isMovieInfoLoading || isBackupMovieInfoLoading);
  }, [isMirrorsLoading, isMovieInfoLoading, isBackupMovieInfoLoading]);

  useEffect(() => {
    if (languages.length > 0 && !selectedLanguage) {
      setSelectedLanguage(languages[0]);
    }
  }, [languages, selectedLanguage]);

  useEffect(() => {
    if (qualities.length > 0 && !selectedQuality) {
      setSelectedQuality(qualities[0]);
    }
  }, [qualities, selectedQuality]);

  const [headerRef, headerInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [castRef, castInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [similarRef, similarInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [reviewRef, reviewInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

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

  const handleJoinWatchParty = () => {
    setHasJoined(true);
    toast({
      title: "Joined Watch Party",
      description: "You've successfully joined the Watch Party!",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  if (isMovieLoading) {
    return <LoadingSkeleton />;
  }

  if (movieError) {
    return <ErrorFallback error={movieError} resetErrorBoundary={() => navigate('/')} />;
  }

  if (!movie) {
    return <ErrorFallback error={new Error("Movie not found")} resetErrorBoundary={() => navigate('/')} />;
  }

  return (
    <Box
      minHeight="100vh"
      bgImage={`linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`}
      bgSize="cover"
      bgPosition="center"
      bgAttachment="fixed"
      color="white"
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
              <Button
                leftIcon={<FaChevronLeft />}
                onClick={() => navigate(-1)}
                position="fixed"
                top={12}
                left={4}
                zIndex={10}
                bg="rgba(255, 255, 255, 0.1)"
                backdropFilter="blur(5px)"
                _hover={{
                  bg: "rgba(255, 255, 255, 0.2)",
                  transform: "scale(1.05)"
                }}
                transition="all 0.3s ease"
              >
                Back
              </Button>
              
              {/* Video Player */}
              <MotionBox
                {...glassmorphismStyle}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {isVideoLoading ? (
                  <Box height="400px" width="100%" display="flex" justifyContent="center" alignItems="center">
                    <LoadingMessage />
                  </Box>
                ) : streamUrl ? (
                  <Suspense fallback={<Skeleton height="400px" width="100%" />}>
                    <VideoPlayer 
                        options={videoJsOptions}
                        title={movie.title}
                        onQualityChange={handleQualityChangeWrapper}
                        onLanguageChange={handleLanguageChange}
                        availableQualities={qualities}
                        availableLanguages={languages}
                        imdbId={movie.imdb_id || ''} posterUrl={''}                    />
                  </Suspense>
                ) : (
                  <Box 
                    height="400px" 
                    width="100%" 
                    bgImage={`url(${posterUrl})`}
                    bgSize="cover"
                    bgPosition="center"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text fontSize="xl" fontWeight="bold" bg="rgba(0,0,0,0.7)" p={4} borderRadius="md">
                      No playback options available
                    </Text>
                  </Box>
                )}
              </MotionBox>

              {/* Watch Party Section */}
              <MotionBox
                {...glassmorphismStyle}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                p={4}
              >
                <Text fontSize="xl" fontWeight="bold" mb={4}>Watch Party</Text>
                {!watchPartyId && !hasJoined && (
                  <HStack spacing={4} justifyContent="space-between">
                    <CreateWatchParty 
                      movieId={tmdbId!} 
                      onWatchPartyCreated={handleCreateWatchParty} 
                    />
                    <JoinWatchParty onJoin={handleJoinWatchParty} />
                  </HStack>
                )}
                {watchPartyId && (
                  <VStack spacing={4} align="stretch">
                    <Text>Watch Party ID: {watchPartyId}</Text>
                    <InviteFriends partyId={watchPartyId} />
                  </VStack>
                )}
                {hasJoined && userId && (
                  <Box mt={4}>
                    <ChatRoom partyId={watchPartyId || ''} userId={userId} />
                  </Box>
                )}
              </MotionBox>

              {/* Movie Header */}
              <motion.div
                ref={headerRef}
                initial={{ opacity: 0, y: 20 }}
                animate={headerInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
              >
                <Suspense fallback={<Skeleton height="200px" />}>
                  <MovieHeader 
                    movie={movie} 
                    onTrailerPlay={() => {}} 
                    isMobile={isMobile} 
                    isLoading={false}
                    onChangeMirror={handleChangeMirror}
                    isChangingMirror={isChangingMirror}
                    currentMirrorIndex={currentMirrorIndex}
                    totalMirrors={mirrors?.length ?? 0}
                    onOpenQualitySelector={() => {}}
                    isPlaying={isPlaying}
                    currentQuality={currentQuality}
                  />
                </Suspense>
              </motion.div>

              {/* Cast Section */}
              <motion.div
                ref={castRef}
                initial={{ opacity: 0, y: 20 }}
                animate={castInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
              >
                {credits && (
                  <Suspense fallback={<Skeleton height="200px" />}>
                    <CastSection cast={credits.cast} isLoading={isCreditsLoading} />
                  </Suspense>
                )}
              </motion.div>

              {/* Similar Movies Section */}
              <motion.div
                ref={similarRef}
                initial={{ opacity: 0, y: 20 }}
                animate={similarInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
              >
                {similarMovies && (
                  <Suspense fallback={<Skeleton height="200px" />}>
                    <SimilarMoviesSection movies={similarMovies} isLoading={isSimilarMoviesLoading} />
                  </Suspense>
                )}
              </motion.div>

              {/* Review Section */}
              <motion.div
                ref={reviewRef}
                initial={{ opacity: 0, y: 20 }}
                animate={reviewInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
              >
                <Suspense fallback={<Skeleton height="200px" />}>
                  <ReviewSection movieId={tmdbId ?? ''} />
                </Suspense>
              </motion.div>
            </VStack>
          </Container>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

const MoviePageWrapper: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <MoviePage />
    </ErrorBoundary>
  );
};

export default MoviePageWrapper;