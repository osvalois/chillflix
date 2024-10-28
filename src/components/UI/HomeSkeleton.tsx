import React from 'react';
import {
  Box,
  Container,
  Skeleton,
  SkeletonText,
  Grid,
  useBreakpointValue,
} from '@chakra-ui/react';
import { CONTENT_CONFIG } from '../../constants';

const { SKELETON } = CONTENT_CONFIG;

export const FeaturedContentSkeleton: React.FC = () => {
  return (
    <Box height={SKELETON.FEATURED_HEIGHT} position="relative" overflow="hidden">
      <Skeleton
        height="100%"
        startColor="purple.500"
        endColor="pink.500"
        opacity={0.3}
      />
      <Box
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        padding="6"
        background="linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)"
      >
        <SkeletonText
          noOfLines={3}
          spacing="4"
          startColor="purple.200"
          endColor="pink.200"
        />
      </Box>
    </Box>
  );
};

export const ContentCarouselSkeleton: React.FC = () => {
  const columns = useBreakpointValue({
    base: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  }) || 1;

  return (
    <Box py={4}>
      <Skeleton height="2rem" width="200px" mb={4} />
      <Grid
        templateColumns={`repeat(${columns}, 1fr)`}
        gap={4}
        overflow="hidden"
      >
        {Array.from({ length: SKELETON.CAROUSEL_ITEMS }).map((_, index) => (
          <Box key={index}>
            <Skeleton height="200px" mb={2} borderRadius="md" />
            <SkeletonText noOfLines={2} spacing={2} />
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

export const GenreExplorerSkeleton: React.FC = () => {
  const columns = useBreakpointValue({
    base: 1,
    sm: 2,
    md: 3,
    lg: 4,
  }) || 1;

  return (
    <Container maxW="container.xl" py={8}>
      <Skeleton height="2rem" width="200px" mb={6} />
      <Grid templateColumns={`repeat(${columns}, 1fr)`} gap={4}>
        {Array.from({ length: SKELETON.GENRE_ITEMS }).map((_, index) => (
          <Skeleton
            key={index}
            height={SKELETON.GENRE_HEIGHT}
            borderRadius="lg"
          />
        ))}
      </Grid>
    </Container>
  );
};

// Export all skeletons as named exports
export { FeaturedContentSkeleton as default };