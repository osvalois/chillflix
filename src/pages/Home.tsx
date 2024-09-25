import React from 'react';
import { Box, Container, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ParallaxProvider } from 'react-scroll-parallax';

import { useContentData } from '../hooks/useContentData';
import { useDynamicBackground } from '../hooks/useDynamicBackground';
import FeaturedContent from '../components/Home/FeaturedContent';
import GlassmorphicBox from '../components/UI/GlassmorphicBox';
import GenreExplorer from '../components/Home/GenreExplorer';
import ContentCarousel from '../components/Home/ContentCarousel';


const MotionBox = motion(Box as any);

export const Home: React.FC = () => {
  const { 
    featuredContent, 
    trendingContent, 
    topRated, 
    upcoming, 
    personalizedRecommendations, 
    genres 
  } = useContentData();

  const { bgGradient, textColor } = useDynamicBackground();

  return (
    <ParallaxProvider>
      <Box
        minHeight="100vh"
        bgGradient={bgGradient}
        backgroundAttachment="fixed"
        color={textColor}
      >
        {featuredContent && <FeaturedContent content={featuredContent} genres={genres} />}
        
        <Container maxW="container.xl" py={12}>
          <VStack spacing={16} align="stretch">

              <GlassmorphicBox p={6} borderRadius="xl">
                <ContentCarousel title="Trending Now" content={trendingContent} icon="FaFire" />
              </GlassmorphicBox>

              <GlassmorphicBox p={6} borderRadius="xl" mt={8}>
                <ContentCarousel title="Top Rated" content={topRated} icon="FaStar" />
              </GlassmorphicBox>

              <GlassmorphicBox p={6} borderRadius="xl" mt={8}>
                <ContentCarousel title="Upcoming" content={upcoming} icon="FaCalendar" />
              </GlassmorphicBox>

              {personalizedRecommendations.length > 0 && (
                <GlassmorphicBox p={6} borderRadius="xl" mt={8}>
                  <ContentCarousel title="Recommended for You" content={personalizedRecommendations} icon="FaHeart" />
                </GlassmorphicBox>
              )}
     
            <GenreExplorer genres={genres} />
          </VStack>
        </Container>
      </Box>
    </ParallaxProvider>
  );
};

export default Home;