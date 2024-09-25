import React, { useState, useCallback } from 'react';
import { Box, Text, SimpleGrid, useColorModeValue, Button, VStack, Heading } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useSpring, animated } from 'react-spring';
import MovieCard from './MovieCard';
import OptimizedImage from '../UI/OptimizedImage';

const MotionBox = motion(Box as any);
const AnimatedBox = animated(MotionBox);

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  poster_blurhash?: string;
  vote_average: number;
  release_date?: string;
  overview: string;
  media_type: 'movie' | 'tv';
}

interface SimilarMoviesSectionProps {
  movies: Movie[];
  isMobile: boolean;
  isLoading: boolean;
}

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

const SimilarMoviesSection: React.FC<SimilarMoviesSectionProps> = ({ movies, isMobile, isLoading }) => {
  const [similarRef, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  const fadeIn = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(50px)',
    config: { tension: 300, friction: 10 },
  });

  const [showAll, setShowAll] = useState(false);
  const displayedMovies = showAll ? movies : movies.slice(0, 6);

  const buttonBgColor = useColorModeValue('green.500', 'green.200');
  const buttonTextColor = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('gray.800', 'white');

  const handleSelectMovie = useCallback((movie: Movie) => {
    console.log('Selected movie:', movie);
  }, []);

  const handleAddToFavorites = useCallback((movie: Movie) => {
    console.log('Added to favorites:', movie);
  }, []);

  return (
    <AnimatedBox ref={similarRef} style={fadeIn} {...glassmorphismStyle} mt={8} maxWidth="1200px" width="100%" p={6}>
      <Heading as="h2" size="xl" mb={6} color={headingColor} textAlign="center">
        Similar Movies
      </Heading>
      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={6}>
        {isLoading ? (
          [...Array(6)].map((_, index) => (
            <MotionBox
              key={index}
              height="400px"
              {...glassmorphismStyle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Box height="100%" position="relative" overflow="hidden">
                <OptimizedImage
                  src="/placeholder-poster.jpg"
                  alt="Loading"
                  objectFit="cover"
                />
              </Box>
            </MotionBox>
          ))
        ) : (
          displayedMovies.map((movie, index) => (
            <MotionBox
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <MovieCard
                movie={movie}
                onSelect={handleSelectMovie}
                onAddToFavorites={handleAddToFavorites}
              />
            </MotionBox>
          ))
        )}
      </SimpleGrid>
      {movies.length > 6 && (
        <Box textAlign="center" mt={8}>
          <Button
            onClick={() => setShowAll(!showAll)}
            bg={buttonBgColor}
            color={buttonTextColor}
            _hover={{ opacity: 0.8 }}
            transition="all 0.3s"
            size="lg"
            fontWeight="bold"
            boxShadow="md"
          >
            {showAll ? 'Show Less' : 'Show More'}
          </Button>
        </Box>
      )}
    </AnimatedBox>
  );
};

export default SimilarMoviesSection;