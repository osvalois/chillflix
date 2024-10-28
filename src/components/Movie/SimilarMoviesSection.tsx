import React, { useState, useCallback } from 'react';
import { Box, SimpleGrid, useColorModeValue, Button, Heading, useBreakpointValue } from '@chakra-ui/react';
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
  isLoading: boolean;
}

const glassmorphismStyle = {
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(20px)",
  borderRadius: "30px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: 
    "0 8px 32px 0 rgba(31, 38, 135, 0.37), " +
    "inset 0 0 30px rgba(255, 255, 255, 0.1), " +
    "0 0 0 2px rgba(255, 255, 255, 0.1)",
  overflow: "hidden",
};

const SimilarMoviesSection: React.FC<SimilarMoviesSectionProps> = ({ movies, isLoading }) => {
  const [similarRef, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  const fadeIn = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(50px)',
    config: { tension: 300, friction: 10 },
  });

  const [showAll, setShowAll] = useState(false);
  const displayedMovies = showAll ? movies : movies.slice(0, 6);

  const buttonBgColor = useColorModeValue('rgba(72, 187, 120, 0.7)', 'rgba(154, 230, 180, 0.7)');
  const buttonTextColor = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('gray.800', 'white');

  const columns = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4, xl: 5 });

  const handleSelectMovie = useCallback((movie: Movie) => {
    console.log('Selected movie:', movie);
  }, []);

  const handleAddToFavorites = useCallback((movie: Movie) => {
    console.log('Added to favorites:', movie);
  }, []);

  return (
    <AnimatedBox 
      ref={similarRef} 
      style={fadeIn} 
      sx={glassmorphismStyle} 
      mt={8} 
      maxWidth="1400px" 
      width="95%" 
      mx="auto"
      p={{ base: 4, md: 6, lg: 8 }}
    >
      <Heading as="h2" size="2xl" mb={8} color={headingColor} textAlign="center" fontWeight="bold">
        Similar Movies
      </Heading>
      <SimpleGrid columns={columns} spacing={{ base: 4, md: 6, lg: 8 }}>
        {isLoading ? (
          [...Array(6)].map((_, index) => (
            <MotionBox
              key={index}
              height={{ base: "300px", md: "400px" }}
              sx={glassmorphismStyle}
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
        <Box textAlign="center" mt={10}>
          <Button
            onClick={() => setShowAll(!showAll)}
            bg={buttonBgColor}
            color={buttonTextColor}
            _hover={{ opacity: 0.9 }}
            _active={{ transform: 'scale(0.98)' }}
            transition="all 0.3s"
            size="lg"
            fontWeight="bold"
            borderRadius="full"
            px={8}
            py={6}
            fontSize="xl"
            boxShadow="lg"
            backdropFilter="blur(10px)"
          >
            {showAll ? 'Show Less' : 'Show More'}
          </Button>
        </Box>
      )}
    </AnimatedBox>
  );
};

export default SimilarMoviesSection;