// Home.tsx
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
  Grid
} from '@chakra-ui/react';
import { ParallaxProvider } from 'react-scroll-parallax';

import { useContentData } from '../hooks/useContentData';
import { useDynamicBackground } from '../hooks/useDynamicBackground';
import GlassmorphicBox from '../components/UI/GlassmorphicBox';
import ContentCarousel from '../components/Home/ContentCarousel';
import SimilarMoviesSection from '../components/Movie/SimilarMoviesSection';

const FeaturedContent = lazy(() => import('../components/Home/FeaturedContent'));
// Componentes Skeleton
const FeaturedContentSkeleton: React.FC = () => (
  <Box width="100%" height="60vh" position="relative">
    <Skeleton height="100%" width="100%" />
    <Box position="absolute" bottom="10%" left="5%" width="40%">
      <SkeletonText noOfLines={3} spacing="4" />
      <Stack direction="row" spacing={4} mt={4}>
        <Skeleton height="40px" width="120px" />
        <Skeleton height="40px" width="120px" />
      </Stack>
    </Box>
  </Box>
);

const ContentCarouselSkeleton: React.FC = () => (
  <Box p={6}>
    <SkeletonText noOfLines={1} width="200px" mb={6} />
    <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={6}>
      {[...Array(6)].map((_, i) => (
        <Box key={i}>
          <Skeleton height="250px" mb={3} />
          <SkeletonText noOfLines={2} spacing="2" />
        </Box>
      ))}
    </Grid>
  </Box>
);

const GenreExplorerSkeleton: React.FC = () => (
  <Grid templateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap={6} p={6}>
    {[...Array(8)].map((_, i) => (
      <Skeleton key={i} height="100px" borderRadius="md" />
    ))}
  </Grid>
);

export const Home: React.FC = () => {
  const {
    featuredContent,
    trendingContent,
    genres,
    isLoading,
    error,
    refreshContent
  } = useContentData();

  const { bgGradient, textColor } = useDynamicBackground();

  useEffect(() => {
    if (error) {
      console.error('Error loading content:', error);
      const retryTimer = setTimeout(() => {
        refreshContent();
      }, 5000);

      return () => clearTimeout(retryTimer);
    }
  }, [error, refreshContent]);

  if (isLoading) {
    return (
      <Box minHeight="100vh" bgGradient={bgGradient}>
        <FeaturedContentSkeleton />
        <Container maxW="container.xl" py={12}>
          <VStack spacing={16} align="stretch">
            <GlassmorphicBox>
              <ContentCarouselSkeleton />
            </GlassmorphicBox>
            <GenreExplorerSkeleton />
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Center minHeight="100vh" bgGradient={bgGradient}>
        <Text color={textColor}>Error: {error}. Retrying...</Text>
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
      >
        <Suspense fallback={<FeaturedContentSkeleton />}>
          {featuredContent && <FeaturedContent content={{ ...featuredContent, backdrop_path: featuredContent.backdrop_path ?? '' }} genres={genres} />}
        </Suspense>

         {trendingContent.length > 0 && (
           <Suspense fallback={<Skeleton height="200px" />}>
           <SimilarMoviesSection movies={trendingContent} isLoading={trendingContent.length == 0} />
         </Suspense>
        )}
      </Box>
    </ParallaxProvider>
  );
};

export default Home;