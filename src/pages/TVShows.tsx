// Home.tsx
import React, { Suspense, lazy, useEffect } from 'react';
import { Box, Container, VStack, Text, Spinner, Center } from '@chakra-ui/react';
import { ParallaxProvider } from 'react-scroll-parallax';

import { useContentData } from '../hooks/useContentData';
import { useDynamicBackground } from '../hooks/useDynamicBackground';
import GlassmorphicBox from '../components/UI/GlassmorphicBox';
const GenreExplorer = lazy(() => import('../components/Home/GenreExplorer'));
const ContentCarousel = lazy(() => import('../components/Home/ContentCarousel'));

export const TVShows: React.FC = () => {
  const { 
    topRated, 
    upcoming, 
    genres,
    isLoading,
    error,
    refreshContent
  } = useContentData();
  
  const { bgGradient, textColor } = useDynamicBackground();

  useEffect(() => {
    if (error) {
      console.error('Error loading content:', error);
      // Intenta cargar el contenido nuevamente después de un breve retraso
      const retryTimer = setTimeout(() => {
        refreshContent();
      }, 5000);

      return () => clearTimeout(retryTimer);
    }
  }, [error, refreshContent]);

  if (isLoading) {
    return (
      <Center minHeight="100vh" bgGradient={bgGradient}>
        <Spinner size="xl" color={textColor} />
      </Center>
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
        <Container maxW="container.xl" py={12}>
          <VStack spacing={16} align="stretch">
            <Suspense fallback={<Spinner size="xl" color={textColor} />}>
              {topRated.length > 0 && (
                <GlassmorphicBox>
                  <ContentCarousel title="Top Rated" content={topRated} icon="FaStar" />
                </GlassmorphicBox>
              )}
              {upcoming.length > 0 && (
                <GlassmorphicBox>
                  <ContentCarousel title="Upcoming" content={upcoming} icon="FaCalendar" />
                </GlassmorphicBox>
              )}
              {genres.length > 0 && <GenreExplorer genres={genres} />}
            </Suspense>
          </VStack>
        </Container>
      </Box>
    </ParallaxProvider>
  );
};

export default TVShows;