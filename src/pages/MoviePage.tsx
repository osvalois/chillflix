import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueries, QueryClient, QueryClientProvider } from 'react-query';
import { Box, Container, VStack, useToast, Button, Skeleton, Spinner } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft } from 'react-icons/fa';
import { useMediaQuery } from 'react-responsive';
import { ErrorBoundary } from 'react-error-boundary';
import { useInView } from 'react-intersection-observer';

import { getTMDBMovieDetails, getMovieCredits, getSimilarMovies } from '../services/tmdbService';
import movieService from '../services/movieService';
import { CombinedContent, MovieCredits } from '../types';

const VideoPlayer = lazy(() => import('../components/VideoPlayer/VideoPlayer'));
const MovieHeader = lazy(() => import('../components/Movie/MovieHeader'));
const CastSection = lazy(() => import('../components/Movie/CastSection'));
const SimilarMoviesSection = lazy(() => import('../components/Movie/SimilarMoviesSection'));
const ErrorFallback = lazy(() => import('../components/UI/ErrorFallback'));
const LoadingSkeleton = lazy(() => import('../components/LoadingSkeleton'));
const ReviewSection = lazy(() => import('../components/ReviewSection/ReviewSection'));

import { useVideoPlayerLogic } from '../hooks/useVideoPlayerLogic';
import { useMirrorLogic } from '../hooks/useMirrorLogic';

const MotionBox = motion(Box);

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 30,
    },
  },
});

const MoviePage: React.FC = () => {
  const { tmdbId } = useParams<{ tmdbId: string }>();
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [selectedLanguage, setSelectedLanguage] = useState('es-MX');
  const [selectedQuality, setSelectedQuality] = useState('1080p');

  const {
    currentMirrorIndex,
    setCurrentMirrorIndex,
    isChangingMirror,
    handleChangeMirror,
  } = useMirrorLogic();

  const {
    isPlaying,
    currentQuality,
    handleQualityChange,
  } = useVideoPlayerLogic();

  const { data: movie, isLoading: isMovieLoading, error: movieError } = useQuery<CombinedContent, Error>(
    ['movie', tmdbId],
    () => getTMDBMovieDetails(parseInt(tmdbId!, 10)),
    { 
      enabled: !!tmdbId,
      onError: (error) => {
        console.error('Error fetching movie details:', error);
        toast({
          title: "Error",
          description: "Failed to load movie details. Please try again.",
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
    { enabled: !!tmdbId }
  );

  const { data: similarMovies, isLoading: isSimilarMoviesLoading } = useQuery<CombinedContent[], Error>(
    ['similarMovies', tmdbId],
    () => getSimilarMovies(parseInt(tmdbId!, 10)),
    { enabled: !!tmdbId }
  );

  const { data: mirrors, isLoading: isMirrorsLoading } = useQuery(
    ['mirrors', tmdbId, selectedLanguage, selectedQuality],
    () => movieService.searchMirrors(tmdbId ?? '', selectedLanguage, selectedQuality),
    { enabled: !!movie }
  );

  const mirrorQueries = useQueries(
    mirrors?.map((mirror, index) => ({
      queryKey: ['movieInfo', mirror.InfoHash],
      queryFn: () => movieService.getMovieInfo(mirror.InfoHash),
      enabled: !!mirrors && index === currentMirrorIndex,
      onError: (error) => {
        console.error(`Error fetching movie info for mirror ${index}:`, error);
        if (mirrors && index < mirrors.length - 1) {
          setCurrentMirrorIndex(index + 1);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to load movie information from all available mirrors.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      },
    })) ?? []
  );

  const { data: movieInfo, isLoading: isMovieInfoLoading } = 
    mirrorQueries[currentMirrorIndex] ?? { data: null, isLoading: false };

  const videoFile = useMemo(() => {
    if (movieInfo) {
      return movieService.findVideoFile(movieInfo);
    }
    return null;
  }, [movieInfo]);

  const streamUrl = useMemo(() => {
    if (movieInfo && videoFile) {
      return movieService.getStreamUrl(videoFile.infoHash, videoFile.index);
    }
    return null;
  }, [movieInfo, videoFile]);

  const posterUrl = useMemo(() => {
    return movie ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';
  }, [movie]);

  const videoJsOptions = useMemo(() => ({
    sources: [{ src: streamUrl ?? "", type: "video/mp4" }],
  }), [streamUrl]);

  useEffect(() => {
    setIsVideoLoading(isMirrorsLoading || isMovieInfoLoading);
  }, [isMirrorsLoading, isMovieInfoLoading]);

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
  };

  const handleQualityChangeWrapper = (newQuality: string) => {
    setSelectedQuality(newQuality);
    handleQualityChange(newQuality);
  };

  if (isMovieLoading || isCreditsLoading || isSimilarMoviesLoading) {
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

              <MotionBox
                {...glassmorphismStyle}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {isVideoLoading ? (
                  <Skeleton height="400px" width="100%" />
                ) : streamUrl ? (
                  <Suspense fallback={<Skeleton height="400px" width="100%" />}>
                    <VideoPlayer 
                      options={videoJsOptions} 
                      title={movie.title}
                      onQualityChange={handleQualityChangeWrapper}
                      onLanguageChange={handleLanguageChange}
                      availableQualities={['720p', '1080p', '4K']}
                      availableLanguages={['en', 'es', 'fr']}
                      imdbId={movie.imdb_id || ''}
                    />
                  </Suspense>
                ) : (
                  <Box 
                    height="400px" 
                    width="100%" 
                    bgImage={`url(${posterUrl})`}
                    bgSize="cover"
                    bgPosition="center"
                  />
                )}
              </MotionBox>

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

              <motion.div
                ref={castRef}
                initial={{ opacity: 0, y: 20 }}
                animate={castInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
              >
                {credits && (
                  <Suspense fallback={<Skeleton height="200px" />}>
                    <CastSection cast={credits.cast} isLoading={false} />
                  </Suspense>
                )}
              </motion.div>

              <motion.div
                ref={similarRef}
                initial={{ opacity: 0, y: 20 }}
                animate={similarInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
              >
                {similarMovies && (
                  <Suspense fallback={<Skeleton height="200px" />}>
                    <SimilarMoviesSection movies={similarMovies} isMobile={isMobile} isLoading={false} />
                  </Suspense>
                )}
              </motion.div>

              <motion.div
                ref={reviewRef}
                initial={{ opacity: 0, y: 20 }}
                animate={reviewInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
              >
                <Suspense fallback={<Spinner size="xl" color="white" />}>
                  <ReviewSection movieId={tmdbId} />
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
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <MoviePage />
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default MoviePageWrapper;