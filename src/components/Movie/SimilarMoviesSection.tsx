import React, { useState, useCallback, useMemo } from 'react';
import { Box, SimpleGrid, useColorModeValue, Button, useBreakpointValue, Text, VStack } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useSpring, animated } from 'react-spring';
import MovieCard from './MovieCard';
import OptimizedImage from '../UI/OptimizedImage';
import { useNavigate } from 'react-router-dom';
import { CombinedContent } from '../../types';

// Componentes motion optimizados
const MotionBox = motion(Box as any);
const AnimatedBox = animated(MotionBox);

interface SimilarMoviesSectionProps {
  movies: CombinedContent[];
  isLoading: boolean;
}

// Skeleton mejorado con animación de pulso
const LoadingSkeleton = () => {
  const shimmerAnimation = {
    initial: { backgroundPosition: '-400px 0' },
    animate: { 
      backgroundPosition: '400px 0',
      transition: { 
        repeat: Infinity, 
        duration: 1.5, 
        ease: "linear"
      }
    }
  };

  const skeletonItems = useMemo(() => 
    [...Array(6)].map((_, index) => (
      <MotionBox
        key={index}
        height={{ base: "300px", md: "400px" }}
        bg="rgba(255, 255, 255, 0.1)"
        backdropFilter="blur(20px)"
        borderRadius="30px"
        border="1px solid rgba(255, 255, 255, 0.2)"
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        overflow="hidden"
        position="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          ...shimmerAnimation
        }}
      >
        <Box height="100%" position="relative" overflow="hidden">
          <OptimizedImage
            src="/placeholder-poster.jpg"
            alt="Loading"
            objectFit="cover"
            opacity={0.5}
          />
        </Box>
      </MotionBox>
    )), []
  );

  return <>{skeletonItems}</>;
};

const SimilarMoviesSection: React.FC<SimilarMoviesSectionProps> = ({ movies, isLoading }) => {
  const [showAll, setShowAll] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<CombinedContent | null>(null);
  const [ref, inView] = useInView({ 
    threshold: 0.1, 
    triggerOnce: true,
    rootMargin: '50px 0px'
  });

  // Estilos mejorados con hover y focus states
  const styles = useMemo(() => ({
    glassmorphism: {
      bg: "rgba(255, 255, 255, 0.08)",
      backdropFilter: "blur(20px)",
      borderRadius: "30px",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      boxShadow: 
        "0 8px 32px 0 rgba(31, 38, 135, 0.37), " +
        "inset 0 0 30px rgba(255, 255, 255, 0.08)",
      transition: "all 0.3s ease-in-out",
      _hover: {
        boxShadow: 
          "0 12px 48px 0 rgba(31, 38, 135, 0.45), " +
          "inset 0 0 40px rgba(255, 255, 255, 0.1)",
        transform: "translateY(-2px)"
      }
    }
  }), []);

  const fadeIn = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(50px)',
    config: { tension: 280, friction: 20 },
  });

  const buttonBgColor = useColorModeValue('rgba(72, 187, 120, 0.85)', 'rgba(154, 230, 180, 0.85)');
  const buttonTextColor = useColorModeValue('white', 'gray.800');
  const columns = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4, xl: 5 });
  const navigate = useNavigate();

  const handleSelectMovie = useCallback((movie: CombinedContent) => {
    setSelectedMovie(movie);
    setTimeout(() => {
      const route = movie.media_type === 'movie' ? `/movie/${movie.id}` : `/serie/${movie.id}`;
      navigate(route);
    }, 300);
  }, [navigate]);

  const handleAddToFavorites = useCallback((movie: CombinedContent) => {
    // Animación de feedback visual
    console.log('Added to favorites:', movie);
  }, []);

  const displayedMovies = useMemo(() => 
    showAll ? movies : movies.slice(0, 6),
    [showAll, movies]
  );

  const movieCards = useMemo(() => 
    displayedMovies.map((movie, index) => (
      <MotionBox
        key={movie.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ 
          duration: 0.5, 
          delay: index * 0.1,
          ease: "easeOut"
        }}
        whileHover={{ 
          scale: 1.03,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.98 }}
      >
        <MovieCard
          movie={movie}
          onSelect={handleSelectMovie}
          onAddToFavorites={handleAddToFavorites}
          isSelected={selectedMovie?.id === movie.id}
        />
      </MotionBox>
    )),
    [displayedMovies, handleSelectMovie, handleAddToFavorites, selectedMovie]
  );

  return (
    <AnimatedBox 
      ref={ref}
      style={fadeIn} 
      sx={styles.glassmorphism} 
      mt={8} 
      maxWidth="1400px" 
      width="95%" 
      mx="auto"
      p={{ base: 4, md: 6, lg: 8 }}
      role="region"
      aria-label="Similar Movies Section"
    >
      <VStack spacing={8} width="100%">
        {movies.length > 0 && (
          <Text
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            color="white"
            textAlign="center"
            textShadow="0 2px 4px rgba(0,0,0,0.3)"
          >
            Recommendations
          </Text>
        )}
        
        <AnimatePresence mode="wait">
          <SimpleGrid 
            columns={columns} 
            spacing={{ base: 4, md: 6, lg: 8 }}
            width="100%"
          >
            {isLoading ? <LoadingSkeleton /> : movieCards}
          </SimpleGrid>
        </AnimatePresence>

        {movies.length > 6 && (
          <Button
            onClick={() => setShowAll(!showAll)}
            bg={buttonBgColor}
            color={buttonTextColor}
            _hover={{ 
              opacity: 0.95,
              transform: 'translateY(-2px)',
              boxShadow: 'lg'
            }}
            _active={{ 
              transform: 'scale(0.98) translateY(0)',
              boxShadow: 'inner'
            }}
            _focus={{
              boxShadow: `0 0 0 3px ${buttonBgColor}`
            }}
            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            size="lg"
            fontWeight="bold"
            borderRadius="full"
            px={8}
            py={6}
            fontSize={{ base: "lg", md: "xl" }}
            boxShadow="lg"
            backdropFilter="blur(10px)"
            aria-expanded={showAll}
          >
            {showAll ? 'Show Less' : 'Show More'}
          </Button>
        )}
      </VStack>
    </AnimatedBox>
  );
};

export default SimilarMoviesSection;