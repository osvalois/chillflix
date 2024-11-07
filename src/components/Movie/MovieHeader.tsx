import { memo, useMemo } from 'react';
import { Box, Flex, Text, VStack, HStack, Icon, Tag, Tooltip, Skeleton } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaCalendar, FaClock, FaDollarSign, FaBuilding } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';
import { useSpring, animated } from 'react-spring';

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

// Optimized image component with lazy loading and blur effect
const OptimizedImage = memo(({ src, alt, ...props }: { src: string; alt: string; [key: string]: any }) => {
  return (
    <Box
      as="img"
      loading="lazy"
      decoding="async"
      {...props}
      src={src}
      alt={alt}
      style={{
        opacity: 0,
        animation: 'fadeIn 0.5s ease-in-out forwards',
      }}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Memoized sub-components
const GlassmorphicBox = memo(({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => {
  const glassEffect = useSpring({
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 280, friction: 20 },
  });

  return (
    <animated.div style={glassEffect}>
      <Box
        bg="rgba(255, 255, 255, 0.05)"
        backdropFilter="blur(10px) saturate(180%)"
        borderRadius="3xl"
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        border="1px solid rgba(255, 255, 255, 0.18)"
        p={{ base: 4, md: 6, lg: 8 }}
        transition="all 0.3s ease"
        _hover={{
          transform: "translateY(-5px)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.47)",
        }}
        {...props}
      >
        {children}
      </Box>
    </animated.div>
  );
});

GlassmorphicBox.displayName = 'GlassmorphicBox';

const MovieInfoItem = memo(({ icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <Tooltip label={label} hasArrow>
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
      <Icon as={icon} color="gray.300" />
      <Text color="gray.300">{value}</Text>
    </HStack>
  </Tooltip>
));

MovieInfoItem.displayName = 'MovieInfoItem';

const ProductionCompanyLogo = memo(({ company }: { company: ProductionCompany }) => (
  <Tooltip label={`${company.name} (${company.origin_country})`} hasArrow placement="top">
    <Box
      bg="rgba(255, 255, 255, 0.1)"
      backdropFilter="blur(5px)"
      borderRadius="xl"
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
        <OptimizedImage
          src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
          alt={company.name}
          style={{
            width: '80%',
            height: '80%',
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)',
            opacity: 0.8,
            transition: 'opacity 0.2s',
          }}
        />
      ) : (
        <Text color="gray.300" fontSize="sm" textAlign="center" fontWeight="medium">
          {company.name}
        </Text>
      )}
    </Box>
  </Tooltip>
));

ProductionCompanyLogo.displayName = 'ProductionCompanyLogo';

// Main component
const MovieHeader = memo(({ movie, isLoading }: MovieHeaderProps) => {
  const [headerRef, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '50px',
  });

  const fadeIn = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(50px)',
    config: { tension: 280, friction: 20 },
  });

  // Memoize formatted data
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

  return (
    <animated.div ref={headerRef} style={fadeIn}>
      <GlassmorphicBox 
        maxWidth="1200px" 
        width="100%"
        mx="auto"
      >
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
              <OptimizedImage
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                  transition: 'transform 0.3s ease',
                }}
              />
            )}
          </Box>

          {/* Content Section */}
          <VStack 
            align="flex-start" 
            spacing={{ base: 4, md: 6 }} 
            flex={1}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <VStack align="flex-start" spacing={4} width="100%">
                    <Skeleton height="50px" width="80%" />
                    <Skeleton height="30px" width="60%" />
                    <Skeleton height="120px" width="100%" />
                  </VStack>
                </motion.div>
              ) : movie && formattedData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  style={{ width: '100%' }}
                >
                  <VStack align="flex-start" spacing={{ base: 3, md: 4 }} width="100%">
                    <Text
                      fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                      fontWeight="bold"
                      bgGradient="linear(to-r, red.400, pink.500)"
                      bgClip="text"
                      lineHeight="shorter"
                    >
                      {movie.title}
                    </Text>

                    <HStack spacing={4} flexWrap="wrap">
                      <HStack
                        bg="rgba(255, 255, 255, 0.1)"
                        borderRadius="full"
                        px={3}
                        py={1}
                      >
                        <Icon as={FaStar} color="yellow.400" />
                        <Text fontSize="lg" fontWeight="semibold">
                          {movie.vote_average.toFixed(1)}
                        </Text>
                      </HStack>
                      <Text color="gray.300">
                        ({movie.vote_count.toLocaleString()} votes)
                      </Text>
                    </HStack>

                    <Text 
                      fontSize={{ base: "sm", md: "md" }} 
                      color="gray.300" 
                      lineHeight="tall"
                    >
                      {movie.overview}
                    </Text>

                    <Box width="100%">
                      <HStack flexWrap="wrap" spacing={2} mb={4}>
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

                      <HStack 
                        spacing={{ base: 2, md: 4 }} 
                        flexWrap="wrap"
                        gap={2}
                      >
                        <MovieInfoItem 
                          icon={FaCalendar} 
                          label="Release Date" 
                          value={formattedData.releaseDate} 
                        />
                        <MovieInfoItem 
                          icon={FaClock} 
                          label="Runtime" 
                          value={formattedData.runtime} 
                        />
                        <MovieInfoItem
                          icon={FaDollarSign}
                          label="Budget"
                          value={formattedData.budget}
                        />
                      </HStack>
                    </Box>

                    {movie.production_companies?.length > 0 && (
                      <VStack align="flex-start" spacing={4} width="100%" mt={4}>
                        <HStack spacing={2}>
                          <Icon as={FaBuilding} color="gray.300" />
                          <Text color="gray.300" fontSize="lg" fontWeight="medium">
                            Production Companies
                          </Text>
                        </HStack>
                        <Flex 
                          flexWrap="wrap" 
                          gap={4} 
                          justify={{ base: "center", md: "flex-start" }}
                          width="100%"
                        >
                          {movie.production_companies.map((company) => (
                            <ProductionCompanyLogo 
                              key={company.id} 
                              company={company} 
                            />
                          ))}
                        </Flex>
                      </VStack>
                    )}
                  </VStack>
                </motion.div>
              )}
            </AnimatePresence>
          </VStack>
        </Flex>
      </GlassmorphicBox>
    </animated.div>
  );
});

MovieHeader.displayName = 'MovieHeader';

export default MovieHeader;