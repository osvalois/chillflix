import React, { Suspense, lazy, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  VStack, 
  useBreakpointValue, 
  type ResponsiveValue,
  useToast
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

// Custom hooks and services
import { useMovieData } from '../../hooks/useMovieData';

// Components
import LoadingSkeleton from '../LoadingSkeleton';
import ErrorFallback from '../UI/ErrorFallback';
import { BackButton } from './BackButton';
import MirrorTable from '../../components/MirrorTable';

// Types and constants
import type { MovieDetailsSectionProps } from '../../types';

import { APP_NAME } from '../../constants';
import { Mirror } from '../../services/movieService';

// Lazy-loaded components with error boundaries
const VideoSection = lazy(() => {
  return import('./VideoSection')
    .catch(err => {
      console.error('Error loading VideoSection:', err);
      return { default: () => <div>Error loading video section</div> };
    });
});

const WatchPartySection = lazy(() => {
  const component = import('./WatchPartySection');
  component.then(); // Trigger prefetch
  return component;
});

const MovieDetailsSection = lazy(() => {
  const component = import('./MovieDetailsSection');
  component.then(); // Trigger prefetch
  return component;
});

// Types
interface Movie {
  id: number;
  title: string;
  overview?: string;
  backdrop_path?: string;
  poster_path?: string;
  runtime?: number;
  imdb_id?: string;
}

interface PageMetadata {
  title: string;
  description: string;
  image?: string;
}

interface BackgroundStyle {
  minHeight: ResponsiveValue<string>;
  bgImage: string;
  bgSize: ResponsiveValue<string>;
  bgPosition: ResponsiveValue<string>;
  bgAttachment: ResponsiveValue<string>;
  color: ResponsiveValue<string>;
  overflow: ResponsiveValue<string>;
}

// Animation configuration
const ANIMATION_CONFIG = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.5 }
} as const;

// Custom hooks
const usePageMetadata = (movie: Movie | null): PageMetadata => {
  return useMemo(() => ({
    title: movie ? `${movie.title} | ${APP_NAME}` : APP_NAME,
    description: movie?.overview ?? `Watch ${movie?.title} on ${APP_NAME}`,
    image: movie?.backdrop_path 
      ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
      : undefined
  }), [movie]);
};

const useBackgroundStyle = (backdropPath: string | undefined): BackgroundStyle => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  return useMemo(() => ({
    minHeight: "100vh",
    bgImage: backdropPath 
      ? `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url(https://image.tmdb.org/t/p/${isMobile ? 'w780' : 'original'}${backdropPath})`
      : "linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9))",
    bgSize: "cover",
    bgPosition: "center",
    bgAttachment: isMobile ? "scroll" : "fixed",
    color: "white",
    overflow: "hidden"
  }), [backdropPath, isMobile]);
};

// Error Boundary
class MoviePageErrorBoundary extends React.Component<{ children: React.ReactNode }> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MoviePage Error:', error, errorInfo);
  }

  render() {
    return this.props.children;
  }
}

// Memoized components
const MemoizedErrorFallback = React.memo(ErrorFallback);
const MemoizedLoadingSkeleton = React.memo(LoadingSkeleton);

const MoviePageContent: React.FC = () => {
  const { tmdbId } = useParams<{ tmdbId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const {
    movie,
    isLoading,
    error,
    videoProps,
    watchPartyProps,
    movieDetailsProps,
    utils: { 
      setFailedMirrors,
      refetchMirrors,
      setShouldRefreshMirrors 
    },
    state: { 
      selectedMirror,
      mirrors,
      failedMirrors 
    }
  } = useMovieData(tmdbId);

  const metadata = usePageMetadata(movie as any);
  const backgroundStyle = useBackgroundStyle(movie?.backdrop_path ?? '');

  // Handlers
  const handleBack = useMemo(() => () => navigate(-1), [navigate]);
  const handleError = useMemo(() => () => navigate('/'), [navigate]);

  const handleMirrorSelect = (mirror: Mirror) => {
    try {
      setFailedMirrors(new Set()); // Reset failed mirrors
      videoProps.handleQualityChange(mirror.quality);
      videoProps.handleLanguageChange(mirror.language);
      
      toast({
        title: "Source Changed",
        description: `Switching to ${mirror.quality} quality in ${mirror.language}`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });

      // Refresh mirrors list after selection
      setShouldRefreshMirrors(true);
      refetchMirrors();
    } catch (error) {
      console.error('Error switching mirror:', error);
      toast({
        title: "Error",
        description: "Failed to switch source. Please try another one.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Effects
  useEffect(() => {
    const originalTitle = document.title;
    document.title = metadata.title;
    return () => {
      document.title = originalTitle;
    };
  }, [metadata.title]);

  // Loading and error states
  if (isLoading) return <MemoizedLoadingSkeleton />;
  if (error) return <MemoizedErrorFallback error={error} resetErrorBoundary={handleError} />;
  if (!movie) return <MemoizedErrorFallback error={new Error("Movie not found")} resetErrorBoundary={handleError} />;

  return (
    <MoviePageErrorBoundary>
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        {metadata.image && <meta property="og:image" content={metadata.image} />}
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        {metadata.image && <meta name="twitter:image" content={metadata.image} />}
      </Helmet>

      <Box {...backgroundStyle}>
        <AnimatePresence mode="wait">
          <motion.div {...ANIMATION_CONFIG}>
            <Container 
              maxW="container.xl" 
              py={{ base: 4, md: 6, lg: 8 }}
              px={{ base: 4, md: 6, lg: 8 }}
            >
              <BackButton onBack={handleBack} />
              
              <VStack 
                spacing={{ base: 4, md: 6, lg: 8 }}
                align="stretch"
              >
                <Suspense fallback={<MemoizedLoadingSkeleton />}>
                  {/* Video Player Section */}
                  <VideoSection 
                    {...videoProps} 
                    movie={videoProps.movie as { title: string; imdb_id?: string }}
                  />
                  
                  {/* Mirror Table Section */}
                  {mirrors && mirrors.length > 0 && (
                    <MirrorTable
                      mirrors={mirrors.filter(mirror => !failedMirrors.has(mirror.infoHash))}
                      onMirrorSelect={handleMirrorSelect}
                      selectedMirrorId={selectedMirror?.id}
                    />
                  )}

                  {/* Watch Party Section */}
                  <WatchPartySection 
                    movieId={movie.id.toString()} 
                    movieTitle={movie.title}
                    movieDuration={movie.runtime}
                    movieThumbnail={movie.poster_path ?? ''}
                    {...watchPartyProps} 
                  />
                  
                  {/* Movie Details Section */}
                  <MovieDetailsSection 
                    {...movieDetailsProps as MovieDetailsSectionProps}
                  />
                </Suspense>
              </VStack>
            </Container>
          </motion.div>
        </AnimatePresence>
      </Box>
    </MoviePageErrorBoundary>
  );
};

export default React.memo(MoviePageContent);