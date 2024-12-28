import React, { useState, useCallback, useMemo } from 'react';
import { Box, SimpleGrid, useColorModeValue, Button, useBreakpointValue, Text, VStack, useToast } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useSpring, animated } from 'react-spring';
import MovieCard from './MovieCard';
import OptimizedImage from '../UI/OptimizedImage';
import { useNavigate } from 'react-router-dom';
import { CombinedContent } from '../../types';

// Optimized motion components
const MotionBox = motion(Box as any);
const AnimatedBox = animated(MotionBox);

interface SimilarMoviesSectionProps {
  movies: CombinedContent[];
  isLoading: boolean;
}

// Enhanced loading skeleton with pulse animation
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
        borderRadius="xl"
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
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Enhanced InView with mobile optimization
  const [ref, inView] = useInView({ 
    threshold: 0.1, 
    triggerOnce: true,
    rootMargin: isMobile ? '0px' : '50px 0px',
    initialInView: isMobile
  });

  // Enhanced glassmorphism styles
  const styles = useMemo(() => ({
    glassmorphism: {
      bg: useColorModeValue("rgba(255, 255, 255, 0.08)", "rgba(0, 0, 0, 0.3)"),
      backdropFilter: "blur(20px)",
      borderRadius: "xl",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      boxShadow: 
        "0 8px 32px 0 rgba(31, 38, 135, 0.37), " +
        "inset 0 0 30px rgba(255, 255, 255, 0.08)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      _hover: {
        boxShadow: 
          "0 12px 48px 0 rgba(31, 38, 135, 0.45), " +
          "inset 0 0 40px rgba(255, 255, 255, 0.1)",
        transform: "translateY(-2px)"
      }
    }
  }), []);

  // Refined animation config
  const fadeIn = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(30px)',
    config: { 
      tension: 280, 
      friction: 20,
      duration: isMobile ? 300 : 500
    },
  });

  const buttonBgColor = useColorModeValue('rgba(72, 187, 120, 0.9)', 'rgba(154, 230, 180, 0.9)');
  const buttonTextColor = useColorModeValue('white', 'gray.800');
  const columns = useBreakpointValue({ base: 2, sm: 3, md: 4, lg: 5, xl: 6 });
  const navigate = useNavigate();

  const handleSelectMovie = useCallback((movie: CombinedContent) => {
    setSelectedMovie(movie);
    const route = movie.media_type === 'movie' ? `/movie/${movie.id}` : `/serie/${movie.id}`;
    
    // Enhanced transition animation
    setTimeout(() => {
      navigate(route);
    }, 200);
  }, [navigate]);

  const handleAddToFavorites = useCallback((movie: CombinedContent) => {
    toast({
      title: "Added to favorites",
      description: `${movie.title || movie.name} has been added to your favorites`,
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "bottom-right"
    });
  }, [toast]);

  const displayedMovies = useMemo(() => 
    showAll ? movies : movies.slice(0, isMobile ? 4 : 6),
    [showAll, movies, isMobile]
  );

  const movieCards = useMemo(() => 
    displayedMovies.map((movie, index) => (
      <MotionBox
        key={movie.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ 
          duration: 0.4, 
          delay: index * 0.08,
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
      mt={{ base: 4, md: 8 }}
      maxWidth="1600px" 
      width="95%" 
      mx="auto"
      p={{ base: 3, md: 6, lg: 8 }}
      role="region"
      aria-label="Similar Movies Section"
    >
      <VStack spacing={{ base: 4, md: 8 }} width="100%">
        {movies.length > 0 && (
          <Text
            fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
            fontWeight="bold"
            bgGradient="linear(to-r, teal.200, blue.500)"
            bgClip="text"
            textAlign="center"
            textShadow="0 2px 4px rgba(0,0,0,0.3)"
          >
            Recommended For You
          </Text>
        )}
        
        <AnimatePresence mode="wait">
          <SimpleGrid 
            columns={columns} 
            spacing={{ base: 3, md: 4, lg: 6 }}
            width="100%"
          >
            {isLoading ? <LoadingSkeleton /> : movieCards}
          </SimpleGrid>
        </AnimatePresence>

        {movies.length > (isMobile ? 4 : 6) && (
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
            fontSize={{ base: "md", md: "lg" }}
            boxShadow="lg"
            backdropFilter="blur(10px)"
            aria-expanded={showAll}
          >
            {showAll ? 'Show Less' : 'View All Recommendations'}
          </Button>
        )}
      </VStack>
    </AnimatedBox>
  );
};

export default SimilarMoviesSection;