import React from 'react';
import { Box, Flex, Text, VStack, HStack, Icon, Tag, Tooltip, Skeleton } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaCalendar, FaClock, FaDollarSign } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';
import { useSpring, animated, config } from 'react-spring';
import { CombinedContent } from '../../types';
import OptimizedImage from '../UI/OptimizedImage';
import { VideoQuality } from '../../services/movieService';

interface MovieHeaderProps {
  movie: CombinedContent | undefined;
  onTrailerPlay: () => void;
  isMobile: boolean;
  isLoading: boolean;
  onChangeMirror: (totalMirrors: number) => void; // Add this line
  isChangingMirror: boolean;
  currentMirrorIndex: number;
  totalMirrors: number;
  onOpenQualitySelector: () => void;
  isPlaying: boolean;
  currentQuality: VideoQuality;
}

const GlassmorphicBox: React.FC<{ children: React.ReactNode; [key: string]: any }> = ({ children, ...props }) => {
  const glassEffect = useSpring({
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: config.gentle,
  });

  return (
    <animated.div style={glassEffect}>
      <Box
        bg="rgba(255, 255, 255, 0.05)"
        backdropFilter="blur(10px) saturate(180%)"
        borderRadius="3xl"
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        border="1px solid rgba(255, 255, 255, 0.18)"
        p={8}
        transition="all 0.3s ease"
        _hover={{
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.47)",
          transform: "translateY(-5px)"
        }}
        {...props}
      >
        {children}
      </Box>
    </animated.div>
  );
};

const MovieHeader: React.FC<MovieHeaderProps> = ({ movie, isMobile, isLoading }) => {
  const [headerRef, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  const fadeIn = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(50px)',
    config: config.gentle,
  });

  return (
    <animated.div ref={headerRef} style={fadeIn}>
      <GlassmorphicBox maxWidth="1200px" width="100%">
        <Flex direction={isMobile ? 'column' : 'row'} align="center" justify="space-between">
          <Box position="relative" mb={isMobile ? 6 : 0} mr={isMobile ? 0 : 6} flexShrink={0} width={300} height={450}>
            {isLoading ? (
              <Skeleton width="100%" height="100%" startColor="rgba(255, 255, 255, 0.1)" endColor="rgba(255, 255, 255, 0.2)" borderRadius="xl" />
            ) : (
              <OptimizedImage
                src={`https://image.tmdb.org/t/p/w500${movie?.poster_path}`}
                alt={movie?.title || 'Movie poster'}
                blurhash="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
                borderRadius="xl"
                boxShadow="lg"
                width={300} 
                height={450}
                transition="transform 0.3s ease"
                _hover={{
                  transform: "scale(1.05)",
                  boxShadow: "xl"
                }}
              />
            )}
          </Box>
          <VStack align="flex-start" spacing={6} flex={1}>
            <AnimatePresence>
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <VStack align="flex-start" spacing={4} width="100%">
                    <Skeleton height="50px" width="80%" startColor="rgba(255, 255, 255, 0.1)" endColor="rgba(255, 255, 255, 0.2)" />
                    <Skeleton height="30px" width="60%" startColor="rgba(255, 255, 255, 0.1)" endColor="rgba(255, 255, 255, 0.2)" />
                    <Skeleton height="120px" width="100%" startColor="rgba(255, 255, 255, 0.1)" endColor="rgba(255, 255, 255, 0.2)" />
                  </VStack>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <VStack align="flex-start" spacing={4}>
                    <Text
                      fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
                      fontWeight="bold"
                      bgGradient="linear(to-r, red.400, pink.500)"
                      bgClip="text"
                      letterSpacing="wide"
                    >
                      {movie?.title}
                    </Text>
                    <HStack spacing={4} flexWrap="wrap">
                      <HStack
                        bg="rgba(255, 255, 255, 0.1)"
                        backdropFilter="blur(5px)"
                        borderRadius="full"
                        px={3}
                        py={1}
                      >
                        <Icon as={FaStar} color="yellow.400" boxSize={5} />
                        <Text fontSize="xl" fontWeight="semibold">{movie?.vote_average.toFixed(1)}</Text>
                      </HStack>
                      <Text color="gray.300">({movie?.vote_count.toLocaleString()} votes)</Text>
                    </HStack>
                    <Text fontSize={{ base: "md", md: "lg" }} color="gray.300" lineHeight="tall">
                      {movie?.overview}
                    </Text>
                    <HStack flexWrap="wrap" spacing={2}>
                      {movie?.genres.map((genre: { id: React.Key | null | undefined; name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }) => (
                        <Tag
                          key={genre.id}
                          size="md"
                          variant="subtle"
                          colorScheme="pink"
                          mb={2}
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontWeight="medium"
                          bg="rgba(236, 64, 122, 0.2)"
                          color="pink.200"
                          backdropFilter="blur(5px)"
                          _hover={{
                            transform: "translateY(-2px)",
                            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)"
                          }}
                          transition="all 0.2s"
                        >
                          {genre.name}
                        </Tag>
                      ))}
                    </HStack>
                    <HStack spacing={6} flexWrap="wrap">
                      <MovieInfoItem icon={FaCalendar} label="Release Date" value={new Date(movie?.release_date || '').toLocaleDateString()} />
                      <MovieInfoItem icon={FaClock} label="Runtime" value={`${Math.floor((movie?.runtime || 0) / 60)}h ${(movie?.runtime || 0) % 60}m`} />
                      <MovieInfoItem
                          icon={FaDollarSign}
                          label="Budget"
                          value={(movie?.budget || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        />
                    </HStack>
                  </VStack>
                </motion.div>
              )}
            </AnimatePresence>
          </VStack>
        </Flex>
      </GlassmorphicBox>
    </animated.div>
  );
};

const MovieInfoItem: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({ icon, label, value }) => (
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
        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)"
      }}
    >
      <Icon as={icon} color="gray.300" />
      <Text color="gray.300">{value}</Text>
    </HStack>
  </Tooltip>
);

export default MovieHeader;