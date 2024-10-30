import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Text,
  Badge,
  Icon,
  VStack,
  HStack,
  Tooltip,
  Button,
  useColorModeValue,
  Flex,
  Image,
  Skeleton
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import { FaHeart} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  overview: string;
  media_type: 'movie' | 'tv';
  genres?: { id: number; name: string }[];
  runtime?: number;
  status?: string;
}

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  onAddToFavorites: (movie: Movie) => void;
  isFavorite?: boolean;
  isLoading?: boolean;
}

const MotionBox = motion(Box as any);
const AnimatedBox = animated(MotionBox);

const MovieCard: React.FC<MovieCardProps> = React.memo(({
  movie,
  onSelect,
  onAddToFavorites,
  isFavorite = false,
  isLoading = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();

  // Mover los useColorModeValue fuera del useMemo
  const textColor = useColorModeValue('gray.800', 'white');
  const placeholderColor = useColorModeValue('gray.600', 'gray.300');
  const glassBgColor = useColorModeValue('rgba(255, 255, 255, 0.7)', 'rgba(26, 32, 44, 0.7)');
  const glassBoxShadowColor = useColorModeValue(
    '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
  );
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');

  // Ahora useMemo solo usa los valores ya calculados
  const colors = useMemo(() => ({
    text: textColor,
    placeholder: placeholderColor,
    glassBg: glassBgColor,
    glassBoxShadow: glassBoxShadowColor,
    cardBg: cardBgColor,
    hoverBg: hoverBgColor
  }), [textColor, placeholderColor, glassBgColor, glassBoxShadowColor, cardBgColor, hoverBgColor]);

  const cardSpring = useSpring({
    scale: isHovered ? 1.05 : 1,
    boxShadow: isHovered
      ? '0 20px 40px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.2)'
      : '0 4px 6px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.1)',
    config: { mass: 1, tension: 300, friction: 20 }
  });

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onSelect(movie);
    }
  }, [movie, onSelect, isLoading]);

  const handleAddToFavorites = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isLoading) {
      onAddToFavorites(movie);
    }
  }, [movie, onAddToFavorites, isLoading]);

  const handleDetailClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isLoading) {
      const route = movie.media_type === 'movie' ? `/movie/${movie.id}` : `/serie/${movie.id}`;
      navigate(route);
    }
  }, [navigate, movie.id, movie.media_type, isLoading]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const posterUrl = useMemo(() => {
    return movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : '/default-movie-poster.jpg';
  }, [movie.poster_path]);

  const ratingColor = useMemo(() => {
    if (movie.vote_average >= 7) return 'green';
    if (movie.vote_average >= 5) return 'yellow';
    return 'red';
  }, [movie.vote_average]);

  const year = useMemo(() => {
    return movie.release_date?.split('-')[0] || 'N/A';
  }, [movie.release_date]);

  if (isLoading) {
    return (
      <Skeleton
        height="400px"
        borderRadius="16px"
        startColor={colors.cardBg}
        endColor={colors.hoverBg}
      />
    );
  }

  return (
    <AnimatedBox
      style={cardSpring}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      bg={colors.glassBg}
      backdropFilter="blur(10px) saturate(180%)"
      border="1px solid rgba(255, 255, 255, 0.18)"
      borderRadius="16px"
      overflow="hidden"
      height="100%"
      position="relative"
      role="group"
      tabIndex={0}
      _focus={{ outline: 'none', boxShadow: 'outline' }}
      boxShadow={colors.glassBoxShadow}
      transition="all 0.3s ease"
      cursor="pointer"
    >
      <VStack spacing={0} align="stretch" height="100%">
        <Box position="relative" width="100%" paddingBottom="150%" overflow="hidden">
          <Skeleton isLoaded={imageLoaded} height="100%" width="100%">
            <Image
              src={posterUrl}
              alt={movie.title}
              objectFit="cover"
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height="100%"
              transition="transform 0.3s ease"
              onLoad={handleImageLoad}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.src = '/default-movie-poster.jpg';
              }}
              _groupHover={{ transform: 'scale(1.05)' }}
            />
          </Skeleton>

          <AnimatePresence>
            {isHovered && (
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)"
                display="flex"
                flexDirection="column"
                justifyContent="flex-end"
                p={4}
              >
                <HStack spacing={2} justify="center">
                  <Button
                    leftIcon={<Play />}
                    onClick={handleDetailClick}
                    size="sm"
                    bg="rgba(255, 255, 255, 0.15)"
                    backdropFilter="blur(10px)"
                    border="1px solid rgba(255, 255, 255, 0.18)"
                    color="white"
                    _hover={{
                      bg: "rgba(255, 255, 255, 0.25)",
                      transform: 'translateY(-2px)',
                      boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
                    }}
                    _active={{
                      bg: "rgba(255, 255, 255, 0.2)"
                    }}
                    transition="all 0.3s ease"
                  >
                    watch
                  </Button>
                </HStack>
              </MotionBox>
            )}
          </AnimatePresence>
        </Box>

        <VStack
          spacing={2}
          align="start"
          p={4}
          flexGrow={1}
          bg={colors.glassBg}
          backdropFilter="blur(10px)"
        >
          <Text
            fontWeight="bold"
            fontSize="lg"
            color={colors.text}
            noOfLines={1}
            _groupHover={{ color: 'blue.500' }}
          >
            {movie.title}
          </Text>

          <Flex justify="space-between" width="100%" align="center">
            <Badge
              colorScheme={ratingColor}
              px={2}
              py={1}
              borderRadius="full"
              variant="subtle"
            >
              ★ {movie.vote_average.toFixed(1)}
            </Badge>
            <Text fontSize="sm" color={colors.placeholder}>
              {year}
            </Text>
          </Flex>

          <Text
            fontSize="sm"
            color={colors.text}
            noOfLines={2}
            opacity={0.8}
          >
            {movie.overview || 'No description available.'}
          </Text>

          {movie.genres && (
            <Flex gap={2} flexWrap="wrap">
              {movie.genres.slice(0, 2).map(genre => (
                <Badge
                  key={genre.id}
                  colorScheme="gray"
                  variant="subtle"
                  fontSize="xs"
                >
                  {genre.name}
                </Badge>
              ))}
            </Flex>
          )}
        </VStack>

        <Tooltip
          label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          placement="top"
        >
          <Box
            as="button"
            position="absolute"
            top={2}
            right={2}
            onClick={handleAddToFavorites}
            bg="rgba(0, 0, 0, 0.5)"
            p={2}
            borderRadius="full"
            _hover={{
              bg: 'rgba(0, 0, 0, 0.7)',
              transform: 'scale(1.1)'
            }}
            transition="all 0.2s"
          >
            <Icon
              as={FaHeart}
              color={isFavorite ? "red.500" : "white"}
              opacity={isHovered || isFavorite ? 1 : 0.7}
              transition="all 0.3s"
              _groupHover={{
                opacity: 1,
                transform: 'scale(1.1)'
              }}
            />
          </Box>
        </Tooltip>
      </VStack>
    </AnimatedBox>
  );
});

MovieCard.displayName = 'MovieCard';

export default MovieCard;