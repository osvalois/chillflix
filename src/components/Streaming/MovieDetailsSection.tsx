import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Box, Container, VStack, Text } from '@chakra-ui/react';
import { useInView } from 'react-intersection-observer';
import MovieHeader from '../Movie/MovieHeader';
import LoadingSpinner from '../UI/LoadingSpinner';
import CastSection from '../Movie/CastSection';
import ReviewSection from '../ReviewSection/ReviewSection';
import ErrorBoundary from '../ErrorHandling/ErrorBoundary';
import { ContentType, MovieDetailsSectionProps } from '../../types';
import SimilarMoviesSection from '../Movie/SimilarMoviesSection';

const glassEffect = {
  background: "rgba(255, 255, 255, 0.07)",
  backdropFilter: "blur(12px)",
  borderRadius: "24px",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  boxShadow: `
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 0 32px rgba(255, 255, 255, 0.05)
  `,
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  _hover: {
    transform: "translateY(-4px)",
    boxShadow: `
      0 12px 48px rgba(0, 0, 0, 0.2),
      inset 0 0 32px rgba(255, 255, 255, 0.07)
    `
  }
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text
    fontSize={{ base: "xl", md: "2xl" }}
    fontWeight="bold"
    mb={6}
    bgGradient="linear(to-r, cyan.400, blue.500, purple.600)"
    bgClip="text"
    letterSpacing="wide"
  >
    {children}
  </Text>
);


export const MovieDetailsSection: React.FC<MovieDetailsSectionProps> = ({
  movie,
  credits,
  similarMovies,
  isCreditsLoading,
  isSimilarMoviesLoading,
  headerProps,
}) => {
  const observerOptions = { threshold: 0.1, triggerOnce: true };
  const [headerRef, headerInView] = useInView(observerOptions);
  const [castRef, castInView] = useInView(observerOptions);
  const [similarRef, similarInView] = useInView(observerOptions);
  const [reviewRef, reviewInView] = useInView(observerOptions);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.7,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const movieData = useMemo(() => ({
    ...movie,
    primary_color: '',
    genre_ids: [],
    type: ContentType.Movie,
    media_type: '',
    year: new Date(movie.release_date).getFullYear(),
    vote_count: movie.vote_count || 0,
    popularity: movie.popularity || 0,
    original_language: movie.original_language || '',
  }), [movie]);

  const HeaderSection = useMemo(() => (
    <motion.div
      ref={headerRef}
      initial="hidden"
      animate={headerInView ? "visible" : "hidden"}
      variants={itemVariants}
    >
      <Box {...glassEffect} p={{ base: 1, md: 1 }} mb={1}>
        <MovieHeader movie={movieData} {...headerProps} />
      </Box>
    </motion.div>
  ), [movieData, headerProps, headerInView]);

  const CastContent = useMemo(() => (
    <motion.div
      ref={castRef}
      initial="hidden"
      animate={castInView ? "visible" : "hidden"}
      variants={itemVariants}
      className="w-full"
    >
      <Box {...glassEffect} p={{ base: 4, md: 6 }} mb={6}>
        <SectionTitle>Cast</SectionTitle>
        <Box maxW="full" overflowX="auto" pb={4}>
          {isCreditsLoading ? (
            <LoadingSpinner />
          ) : (
            <CastSection cast={credits.cast} isLoading={false} />
          )}
        </Box>
      </Box>
    </motion.div>
  ), [credits, isCreditsLoading, castInView]);

  const SimilarContent = useMemo(() => (
    <motion.div
      ref={similarRef}
      initial="hidden"
      animate={similarInView ? "visible" : "hidden"}
      variants={itemVariants}
      className="w-full"
    >
      <Box {...glassEffect} p={{ base: 4, md: 6 }} mb={6}>
        <SectionTitle>Similar Movies</SectionTitle>
        <Box maxW="full" overflowX="auto" pb={4}>
          {isSimilarMoviesLoading ? (
            <LoadingSpinner />
          ) : (
            <SimilarMoviesSection movies={similarMovies} isLoading={false} />
          )}
        </Box>
      </Box>
    </motion.div>
  ), [similarMovies, isSimilarMoviesLoading, similarInView]);

  const ReviewContent = useMemo(() => (
    <motion.div
      ref={reviewRef}
      initial="hidden"
      animate={reviewInView ? "visible" : "hidden"}
      variants={itemVariants}
    >
      <Box {...glassEffect} p={{ base: 4, md: 6 }} w="full">
        <SectionTitle>Reviews</SectionTitle>
        <ReviewSection movieId={movie.id} />
      </Box>
    </motion.div>
  ), [movie.id, reviewInView]);

  return (
    <ErrorBoundary>
      <Container maxW="container.xl" px={{ base: 1, md: 1 }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <VStack spacing={{ base: 1, md: 1 }} align="stretch">
            {HeaderSection}
            
            {/* Cast Section en su propia fila */}
            {CastContent}
            
            {/* Similar Movies en su propia fila */}
            {SimilarContent}
            
            {/* Reviews Section */}
            {ReviewContent}
          </VStack>
        </motion.div>
      </Container>
    </ErrorBoundary>
  );
};

export default React.memo(MovieDetailsSection);