import React, { Suspense, lazy, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Text,
  Center,
  Skeleton,
  SkeletonText,
  Stack,
  Grid,
  useBreakpointValue,
  useToken
} from '@chakra-ui/react';
import { ParallaxProvider } from 'react-scroll-parallax';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import { useContentData } from '../hooks/useContentData';
import { useDynamicBackground } from '../hooks/useDynamicBackground';
import GlassmorphicBox from '../components/UI/GlassmorphicBox';
import ContentCarousel from '../components/Home/ContentCarousel';

const FeaturedContent = lazy(() => import('../components/Home/FeaturedContent'));
const SimilarMoviesSection = lazy(() => import('../components/Movie/SimilarMoviesSection'));

// Animations
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5 }
};

// Enhanced Skeleton Components
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

const ContentCarouselSkeleton: React.FC = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  return (
    <Box p={6}>
      <SkeletonText noOfLines={1} width="200px" mb={6} />
      <Grid 
        templateColumns={{
          base: "repeat(auto-fill, minmax(140px, 1fr))",
          md: "repeat(auto-fill, minmax(200px, 1fr))"
        }} 
        gap={6}
      >
        {[...Array(isMobile ? 4 : 6)].map((_, i) => (
          <Box key={i}>
            <Skeleton 
              height={{ base: "200px", md: "250px" }} 
              mb={3} 
              borderRadius="xl"
            />
            <SkeletonText noOfLines={2} spacing="2" />
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

const SectionContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  
  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={inView ? "animate" : "initial"}
      variants={fadeInUp}
    >
      {children}
    </motion.div>
  );
};

export const Home: React.FC = () => {
  const {
    featuredContent,
    trendingContent,
    topRated,
    genres,
    isLoading,
    error,
    refreshContent
  } = useContentData();

  const { bgGradient, textColor } = useDynamicBackground();

  useEffect(() => {
    if (error) {
      console.error('Error loading content:', error);
      const retryTimer = setTimeout(refreshContent, 5000);
      return () => clearTimeout(retryTimer);
    }
  }, [error, refreshContent]);

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
          <GlassmorphicBox>
            <Text color={textColor} p={8} textAlign="center">
              Error: {error}
              <br />
              <Text fontSize="sm" mt={2} opacity={0.8}>
                Retrying automatically...
              </Text>
            </Text>
          </GlassmorphicBox>
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
        <AnimatePresence mode="wait">
          {/* Featured Content Section */}
          <Suspense fallback={<FeaturedContentSkeleton />}>
            {featuredContent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <FeaturedContent 
                  content={{ 
                    ...featuredContent, 
                    backdrop_path: featuredContent.backdrop_path ?? '' 
                  }} 
                  genres={genres} 
                />
              </motion.div>
            )}
          </Suspense>

          {/* Main Content Container */}
          <Container maxW="container.xl" py={12}>
            <VStack spacing={16} align="stretch">
              {/* Top Rated Section */}
              {!isLoading && topRated && topRated.length > 0 && (
                <SectionContainer>
                  <GlassmorphicBox>
                    <ContentCarousel
                      title="Top Rated"
                      content={topRated}
                      autoplay={true}
                      interval={5000}
                    />
                  </GlassmorphicBox>
                </SectionContainer>
              )}

              {/* Trending Content Section */}
              {!isLoading && trendingContent && trendingContent.length > 0 && (
                <SectionContainer>
                  <Suspense fallback={
                    <GlassmorphicBox>
                      <ContentCarouselSkeleton />
                    </GlassmorphicBox>
                  }>
                    <SimilarMoviesSection 
                      movies={trendingContent} 
                      isLoading={false}
                    />
                  </Suspense>
                </SectionContainer>
              )}

              {/* Loading States */}
              {isLoading && (
                <VStack spacing={12}>
                  <GlassmorphicBox>
                    <ContentCarouselSkeleton />
                  </GlassmorphicBox>
                  <GlassmorphicBox>
                    <ContentCarouselSkeleton />
                  </GlassmorphicBox>
                </VStack>
              )}
            </VStack>
          </Container>
        </AnimatePresence>
      </Box>
    </ParallaxProvider>
  );
};

export default React.memo(Home, (prevProps, nextProps) => {
  // Implementar lógica de comparación personalizada si es necesario
  return true;
});