import React, { memo, useMemo, useCallback } from 'react';
import { Box, Flex, Text, VStack, HStack, Tag, Tooltip, Skeleton } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useSpring, animated } from 'react-spring';

// Importamos nuestros SVG Icons optimizados
import { Icons } from './Icons';

// Types
interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

interface Genre {
  id: number;
  name: string;
}

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  runtime: number;
  budget: number;
  genres: Genre[];
  production_companies: ProductionCompany[];
}

interface MovieHeaderProps {
  movie: Movie | null;
  isLoading: boolean;
}

interface FormattedData {
  releaseDate: string;
  runtime: string;
  budget: string;
}

// Constants
const ANIMATION_CONFIG = {
  tension: 280,
  friction: 20,
} as const;

const GLASS_STYLES = {
  bg: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(10px) saturate(180%)",
  borderRadius: "3xl",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
} as const;

// Optimized image component
const OptimizedImage = memo(({ src, alt, ...props }: { src: string; alt: string; [key: string]: any }) => (
  <Box
    position="relative"
    width="100%"
    height="100%"
    overflow="hidden"
    borderRadius="xl"
    transition="transform 0.3s ease"
    _hover={{ transform: 'scale(1.02)' }}
  >
    <Box
      as="img"
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      width="100%"
      height="100%"
      objectFit="cover"
      transition="transform 0.3s ease"
      {...props}
    />
  </Box>
));

OptimizedImage.displayName = 'OptimizedImage';

// Memoized components
const LoadingContent = memo(() => (
  <VStack align="flex-start" spacing={4} width="100%">
    <Skeleton height="50px" width="80%" />
    <Skeleton height="30px" width="60%" />
    <Skeleton height="120px" width="100%" />
  </VStack>
));

LoadingContent.displayName = 'LoadingContent';

const MovieInfoItem = memo(({ 
  icon: IconComponent, 
  label, 
  value 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string;
}) => (
  <Tooltip label={label} hasArrow placement="top">
    <HStack
      bg="rgba(255, 255, 255, 0.1)"
      backdropFilter="blur(5px)"
      borderRadius="full"
      px={3}
      py={1}
      transition="all 0.2s"
      _hover={{
        bg: "rgba(255, 255, 255, 0.2)",
        transform: "translateY(-2px)",
      }}
    >
      <IconComponent size={16} className="text-gray-300" />
      <Text color="gray.300">{value}</Text>
    </HStack>
  </Tooltip>
));

MovieInfoItem.displayName = 'MovieInfoItem';

const ProductionCompanyLogo = memo(({ company }: { company: ProductionCompany }) => (
  <Tooltip label={`${company.name} (${company.origin_country})`} hasArrow placement="top">
    <Box
      {...GLASS_STYLES}
      p={3}
      height={{ base: "60px", md: "80px" }}
      width={{ base: "120px", md: "150px" }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      transition="all 0.2s"
      _hover={{
        bg: "rgba(255, 255, 255, 0.2)",
        transform: "translateY(-2px)",
      }}
    >
      {company.logo_path ? (
        <Box
          position="relative"
          width="80%"
          height="80%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <OptimizedImage
            src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
            alt={company.name}
            style={{
              filter: 'brightness(0) invert(1)',
              opacity: 0.8,
              objectFit: 'contain'
            }}
          />
        </Box>
      ) : (
        <Text color="gray.300" fontSize="sm" textAlign="center" fontWeight="medium">
          {company.name}
        </Text>
      )}
    </Box>
  </Tooltip>
));

ProductionCompanyLogo.displayName = 'ProductionCompanyLogo';

const MovieContentHeader = memo(({ 
  title, 
  voteAverage, 
  voteCount 
}: { 
  title: string;
  voteAverage: number;
  voteCount: number;
}) => (
  <>
    <Text
      fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
      fontWeight="bold"
      bgGradient="linear(to-r, red.400, pink.500)"
      bgClip="text"
      lineHeight="shorter"
    >
      {title}
    </Text>

    <HStack spacing={4}>
      <HStack
        bg="rgba(255, 255, 255, 0.1)"
        borderRadius="full"
        px={3}
        py={1}
      >
        <Icons.Star size={16} className="text-yellow-400" />
        <Text fontSize="lg" fontWeight="semibold">
          {voteAverage.toFixed(1)}
        </Text>
      </HStack>
      <Text color="gray.300">
        ({voteCount.toLocaleString()} votes)
      </Text>
    </HStack>
  </>
));

MovieContentHeader.displayName = 'MovieContentHeader';

const MovieContent = memo(({ 
  movie, 
  formattedData 
}: { 
  movie: Movie;
  formattedData: FormattedData;
}) => (
  <VStack align="flex-start" spacing={{ base: 3, md: 4 }} width="100%">
    <MovieContentHeader 
      title={movie.title}
      voteAverage={movie.vote_average}
      voteCount={movie.vote_count}
    />

    <Text
      fontSize={{ base: "sm", md: "md" }}
      color="gray.300"
      lineHeight="tall"
    >
      {movie.overview}
    </Text>

    <Box width="100%">
      <HStack spacing={2} mb={4} flexWrap="wrap">
        {movie.genres.map((genre) => (
          <Tag
            key={genre.id}
            size="md"
            variant="subtle"
            colorScheme="pink"
            borderRadius="full"
          >
            {genre.name}
          </Tag>
        ))}
      </HStack>

      <HStack spacing={{ base: 2, md: 4 }} flexWrap="wrap" gap={2}>
        <MovieInfoItem
          icon={Icons.Calendar}
          label="Release Date"
          value={formattedData.releaseDate}
        />
        <MovieInfoItem
          icon={Icons.Clock}
          label="Runtime"
          value={formattedData.runtime}
        />
        <MovieInfoItem
          icon={Icons.Money}
          label="Budget"
          value={formattedData.budget}
        />
      </HStack>
    </Box>

    {movie.production_companies?.length > 0 && (
      <Flex wrap="wrap" gap={4} mt={4}>
        {movie.production_companies.map((company) => (
          <ProductionCompanyLogo key={company.id} company={company} />
        ))}
      </Flex>
    )}
  </VStack>
));

MovieContent.displayName = 'MovieContent';

// Main component
const MovieHeader = memo(({ movie, isLoading }: MovieHeaderProps) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '50px',
  });

  const fadeIn = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(50px)',
    config: ANIMATION_CONFIG,
  });

  const formattedData = useMemo(() => {
    if (!movie) return null;
    return {
      releaseDate: new Date(movie.release_date).toLocaleDateString(),
      runtime: `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`,
      budget: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(movie.budget),
    };
  }, [movie]);

  const renderContent = useCallback(() => {
    if (isLoading) return <LoadingContent />;
    if (!movie || !formattedData) return null;
    return <MovieContent movie={movie} formattedData={formattedData} />;
  }, [isLoading, movie, formattedData]);

  return (
    <animated.div ref={ref} style={fadeIn}>
      <Box {...GLASS_STYLES} maxWidth="1200px" width="100%" mx="auto" p={{ base: 4, md: 6, lg: 8 }}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'center', md: 'flex-start' }}
          justify="space-between"
          gap={{ base: 6, md: 8 }}
        >
          {/* Poster Section */}
          <Box
            position="relative"
            width={{ base: "280px", md: "300px" }}
            height={{ base: "420px", md: "450px" }}
            flexShrink={0}
          >
            {isLoading ? (
              <Skeleton
                width="100%"
                height="100%"
                startColor="rgba(255, 255, 255, 0.1)"
                endColor="rgba(255, 255, 255, 0.2)"
                borderRadius="xl"
              />
            ) : movie?.poster_path && (
              <Box
                overflow="hidden"
                borderRadius="xl"
                boxShadow="lg"
                height="100%"
                width="100%"
              >
                <OptimizedImage
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                />
              </Box>
            )}
          </Box>

          {/* Content Section */}
          <VStack align="flex-start" spacing={{ base: 4, md: 6 }} flex={1}>
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                key={isLoading ? 'loading' : 'content'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%' }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </VStack>
        </Flex>
      </Box>
    </animated.div>
  );
});

MovieHeader.displayName = 'MovieHeader';

export default MovieHeader;