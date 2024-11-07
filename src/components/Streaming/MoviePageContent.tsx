// src/pages/MoviePage/components/MoviePageContent.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, VStack } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoSection } from './VideoSection';
import { WatchPartySection } from './WatchPartySection';
import { MovieDetailsSection } from './MovieDetailsSection';

import { useMovieData } from '../../hooks/useMovieData';
import LoadingSkeleton from '../LoadingSkeleton';
import ErrorFallback from '../UI/ErrorFallback';
import { BackButton } from './BackButton';
import { MovieDetailsSectionProps } from '../../types';

export const MoviePageContent: React.FC = () => {
  const { tmdbId } = useParams<{ tmdbId: string }>();
  const navigate = useNavigate();
  const {
    movie,
    isLoading,
    error,
    videoProps,
    watchPartyProps,
    movieDetailsProps
  } = useMovieData(tmdbId);

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorFallback error={error} resetErrorBoundary={() => navigate('/')} />;
  if (!movie) return <ErrorFallback error={new Error("Movie not found")} resetErrorBoundary={() => navigate('/')} />;

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
            <BackButton onBack={() => navigate(-1)} />
            <VStack spacing={8} align="stretch">
            <VideoSection {...videoProps} movie={videoProps.movie as { title: string; imdb_id?: string | undefined; }} />
              <WatchPartySection movieId={''} movieTitle={''} {...watchPartyProps} />
              <MovieDetailsSection {...movieDetailsProps as MovieDetailsSectionProps} />
            </VStack>
          </Container>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};
