import React, { Suspense, lazy, useEffect, useState, useCallback } from 'react';
import {
  Box,
  Container,
  VStack,
  Text,
  Center,
  Skeleton,
  SkeletonText,
  Stack,
  IconButton,
  HStack,
  CircularProgress,
  useToken
} from '@chakra-ui/react';
import { ParallaxProvider } from 'react-scroll-parallax';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useContentData } from '../hooks/useContentData';
import { useDynamicBackground } from '../hooks/useDynamicBackground';

const FeaturedContent = lazy(() => import('../components/Home/FeaturedContent'));
const SimilarMoviesSection = lazy(() => import('../components/Movie/SimilarMoviesSection'));

const AUTOPLAY_INTERVAL = 10000;

const FeaturedContentSkeleton: React.FC = () => {
  const [purple100, purple200] = useToken('colors', ['purple.100', 'purple.200']);
  
  return (
    <Box width="100%" height="70vh" position="relative" overflow="hidden">
      <Skeleton 
        height="100%" 
        width="100%" 
        startColor={purple100}
        endColor={purple200}
      />
      <Box 
        position="absolute" 
        bottom="10%" 
        left="5%" 
        width={{ base: "90%", md: "40%" }}
        backdropFilter="blur(8px)"
        borderRadius="xl"
        p={6}
      >
        <SkeletonText noOfLines={3} spacing="4" />
        <Stack direction="row" spacing={4} mt={6}>
          <Skeleton height="40px" width="120px" borderRadius="full" />
          <Skeleton height="40px" width="120px" borderRadius="full" />
        </Stack>
      </Box>
    </Box>
  );
};

const NavigationControls: React.FC<{
  autoplay: boolean;
  progress: number;
  onPrev: () => void;
  onNext: () => void;
  onToggleAutoplay: () => void;
}> = ({ autoplay, progress, onPrev, onNext, onToggleAutoplay }) => (
  <Box
    position="absolute"
    bottom={{ base: "3%", md: "5%" }}
    right={{ base: "3%", md: "5%" }}
    zIndex={2}
  >
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <HStack
        spacing={4}
        bg="rgba(0, 0, 0, 0.3)"
        backdropFilter="blur(12px)"
        borderRadius="full"
        p={2}
        boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
        border="1px solid rgba(255, 255, 255, 0.1)"
      >
        <IconButton
          aria-label="Previous"
          icon={<ChevronLeft size={24} />}
          onClick={onPrev}
          variant="ghost"
          color="white"
          size="lg"
          _hover={{ bg: 'whiteAlpha.200' }}
          _active={{ bg: 'whiteAlpha.300' }}
        />
        
        <Box position="relative">
          <CircularProgress
            value={progress}
            color="blue.400"
            trackColor="whiteAlpha.200"
            size="50px"
            thickness="4px"
            capIsRound
          />
          <IconButton
            aria-label={autoplay ? 'Pause' : 'Play'}
            icon={autoplay ? <Pause size={18} /> : <Play size={18} />}
            onClick={onToggleAutoplay}
            variant="ghost"
            color="white"
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            size="sm"
            _hover={{ bg: 'whiteAlpha.200' }}
            _active={{ bg: 'whiteAlpha.300' }}
          />
        </Box>

        <IconButton
          aria-label="Next"
          icon={<ChevronRight size={24} />}
          onClick={onNext}
          variant="ghost"
          color="white"
          size="lg"
          _hover={{ bg: 'whiteAlpha.200' }}
          _active={{ bg: 'whiteAlpha.300' }}
        />
      </HStack>
    </motion.div>
  </Box>
);

export const Home: React.FC = () => {
  const {
    trendingContent,
    topRated,
    genres,
    isLoading,
    error,
  } = useContentData();

  const [currentTopRatedIndex, setCurrentTopRatedIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [progress, setProgress] = useState(0);
  const { bgGradient, textColor } = useDynamicBackground();

  const resetProgress = useCallback(() => {
    setProgress(0);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let animationId: number;
    let startTime: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const newProgress = (elapsed / AUTOPLAY_INTERVAL) * 100;

      if (newProgress <= 100) {
        setProgress(newProgress);
        animationId = requestAnimationFrame(animate);
      }
    };

    if (autoplay && topRated && topRated.length > 0) {
      startTime = performance.now();
      animationId = requestAnimationFrame(animate);

      intervalId = setInterval(() => {
        setCurrentTopRatedIndex((prev) => 
          prev === topRated.length - 1 ? 0 : prev + 1
        );
        startTime = performance.now();
      }, AUTOPLAY_INTERVAL);
    }

    return () => {
      clearInterval(intervalId);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [autoplay, topRated, currentTopRatedIndex]);

  const handleNext = useCallback(() => {
    if (topRated) {
      setCurrentTopRatedIndex((prev) => 
        prev === topRated.length - 1 ? 0 : prev + 1
      );
      resetProgress();
    }
  }, [topRated, resetProgress]);

  const handlePrev = useCallback(() => {
    if (topRated) {
      setCurrentTopRatedIndex((prev) => 
        prev === 0 ? topRated.length - 1 : prev - 1
      );
      resetProgress();
    }
  }, [topRated, resetProgress]);

  const toggleAutoplay = useCallback(() => {
    setAutoplay(prev => !prev);
    resetProgress();
  }, [resetProgress]);

  if (isLoading) {
    return (
      <Box minHeight="100vh" bgGradient={bgGradient}>
        <FeaturedContentSkeleton />
      </Box>
    );
  }

  if (error) {
    return (
      <Center 
        minHeight="100vh" 
        bgGradient={bgGradient}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            bg="rgba(255, 255, 255, 0.1)"
            backdropFilter="blur(16px)"
            borderRadius="xl"
            p={8}
            boxShadow="lg"
            border="1px solid rgba(255, 255, 255, 0.1)"
          >
            <Text color={textColor} textAlign="center">
              {error}
              <Text fontSize="sm" mt={2} opacity={0.8}>
                Retrying automatically...
              </Text>
            </Text>
          </Box>
        </motion.div>
      </Center>
    );
  }

  return (
    <ParallaxProvider>
      <Box
        minHeight="100vh"
        bgGradient={bgGradient}
        backgroundAttachment="fixed"
        color={textColor}
        overflow="hidden"
      >
        <Suspense fallback={<FeaturedContentSkeleton />}>
          <AnimatePresence mode="wait">
            {topRated && topRated.length > 0 && (
              <Box position="relative" key={currentTopRatedIndex}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <FeaturedContent 
                    content={{ 
                      ...topRated[currentTopRatedIndex], 
                      backdrop_path: topRated[currentTopRatedIndex].backdrop_path ?? '' 
                    }} 
                    genres={genres} 
                  />
                </motion.div>
                
                <NavigationControls
                  autoplay={autoplay}
                  progress={progress}
                  onPrev={handlePrev}
                  onNext={handleNext}
                  onToggleAutoplay={toggleAutoplay}
                />
              </Box>
            )}
          </AnimatePresence>
        </Suspense>
        
        <Container maxW="container.xl" py={12}>
          <VStack spacing={16} align="stretch">
            <Suspense fallback={<Skeleton height="200px" />}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Box
                  bg="rgba(255, 255, 255, 0.1)"
                  backdropFilter="blur(16px)"
                  borderRadius="xl"
                  p={6}
                  boxShadow="lg"
                  border="1px solid rgba(255, 255, 255, 0.1)"
                >
                  <SimilarMoviesSection 
                    movies={trendingContent} 
                    isLoading={trendingContent.length === 0} 
                  />
                </Box>
              </motion.div>
            </Suspense>
          </VStack>
        </Container>
      </Box>
    </ParallaxProvider>
  );
};

export default Home;