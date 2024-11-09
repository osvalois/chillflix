import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Text,
  Badge,
  Icon,
  VStack,
  HStack,
  Tooltip,
  useColorModeValue,
  Flex,
  Image,
  Skeleton,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import { FaHeart, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Film } from 'lucide-react';
import { CombinedContent } from '../../types';
import WatchButton from '../WatchButton';

interface MovieCardProps {
  movie: CombinedContent;
  onSelect: (movie: CombinedContent) => void;
  onAddToFavorites: (movie: CombinedContent) => void;
  isFavorite?: boolean;
  isLoading?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

const MotionBox = motion(Box as any);
const AnimatedBox = animated(MotionBox);

const POSTER_ASPECT_RATIO = 1.5;

const MovieCard: React.FC<MovieCardProps> = React.memo(({
  movie,
  onSelect,
  onAddToFavorites,
  isFavorite = false,
  isLoading = false,
  variant = 'default'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const navigate = useNavigate();

  // Enhanced color modes
  const textColor = useColorModeValue('gray.800', 'white');
  const placeholderColor = useColorModeValue('gray.600', 'gray.300');
  const glassBgColor = useColorModeValue(
    'rgba(255, 255, 255, 0.8)',
    'rgba(26, 32, 44, 0.8)'
  );
  const glassBoxShadowColor = useColorModeValue(
    '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
  );
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const buttonHoverBg = useColorModeValue('whiteAlpha.300', 'blackAlpha.300');

  const colors = useMemo(() => ({
    text: textColor,
    placeholder: placeholderColor,
    glassBg: glassBgColor,
    glassBoxShadow: glassBoxShadowColor,
    cardBg: cardBgColor,
    hoverBg: hoverBgColor,
    buttonHover: buttonHoverBg,
  }), [textColor, placeholderColor, glassBgColor, glassBoxShadowColor, cardBgColor, hoverBgColor, buttonHoverBg]);

  // Enhanced animations
  const cardSpring = useSpring({
    scale: isHovered ? 1.05 : 1,
    boxShadow: isHovered
      ? '0 20px 40px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.2)'
      : '0 4px 6px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.1)',
    config: { mass: 1, tension: 300, friction: 20 }
  });

  // Enhanced handlers
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

  const handleImageError = useCallback(() => {
    setIsImageError(true);
    setImageLoaded(true);
  }, []);

  // Enhanced memoized values
  const posterUrl = useMemo(() => {
    if (isImageError) return '/default-movie-poster.jpg';
    return movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : '/default-movie-poster.jpg';
  }, [movie.poster_path, isImageError]);

  const title = useMemo(() => movie.title || movie.name || 'Untitled', [movie]);

  const year = useMemo(() => {
    const date = movie.release_date || movie.first_air_date;
    return date?.split('-')[0] || 'N/A';
  }, [movie]);

  const ratingColor = useMemo(() => {
    if (movie.vote_average >= 7.5) return 'green';
    if (movie.vote_average >= 6) return 'yellow';
    if (movie.vote_average >= 4) return 'orange';
    return 'red';
  }, [movie.vote_average]);

  const formattedRating = useMemo(() => {
    return movie.vote_average.toFixed(1);
  }, [movie.vote_average]);

  const runtimeDisplay = useMemo(() => {
    if (!movie.runtime) return null;
    const hours = Math.floor(movie.runtime / 60);
    const minutes = movie.runtime % 60;
    return `${hours}h ${minutes}m`;
  }, [movie.runtime]);

  if (isLoading) {
    return (
      <Skeleton
        height={variant === 'compact' ? "300px" : "400px"}
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
        <Box 
          position="relative" 
          width="100%" 
          paddingBottom={`${100 * POSTER_ASPECT_RATIO}%`} 
          overflow="hidden"
        >
          <Skeleton isLoaded={imageLoaded} height="100%" width="100%">
            <Image
              src={posterUrl}
              alt={title}
              objectFit="cover"
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height="100%"
              transition="transform 0.3s ease"
              onLoad={handleImageLoad}
              onError={handleImageError}
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
                bg="linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.3) 100%)"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                p={4}
              >
                <Flex justify="space-between" align="center">
                  <Badge
                    colorScheme={ratingColor}
                    px={2}
                    py={1}
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    gap={1}
                    backdropFilter="blur(4px)"
                  >
                    <FaStar />
                    {formattedRating}
                  </Badge>
                  {movie.runtime && (
                    <Badge
                      colorScheme="gray"
                      px={2}
                      py={1}
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      gap={1}
                      backdropFilter="blur(4px)"
                    >
                      <Clock size={12} />
                      {runtimeDisplay}
                    </Badge>
                  )}
                </Flex>

                <VStack spacing={3} align="stretch">
                  <Text
                    color="white"
                    fontSize="sm"
                    noOfLines={3}
                    textShadow="0 2px 4px rgba(0,0,0,0.5)"
                  >
                    {movie.overview}
                  </Text>
                  
                  <HStack spacing={2} justify="center">
                  <WatchButton
  onClick={handleDetailClick}
  isLoading={false}
  size="md"
  variant="gradient"
  accentColor="blue"
  animated={true}
  showRipple={true}
  withSound={true}
  customText="Watch" // opcional
  icon={<Film size={20} />} // opcional
/>
                  </HStack>
                </VStack>
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
          <Flex justify="space-between" width="100%" align="center">
            <Text
              fontWeight="bold"
              fontSize="lg"
              color={colors.text}
              noOfLines={1}
              flexGrow={1}
              _groupHover={{ color: 'blue.500' }}
            >
              {title}
            </Text>
            <HStack spacing={1}>
              <Badge
                colorScheme="gray"
                variant="subtle"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <Calendar size={12} />
                {year}
              </Badge>
            </HStack>
          </Flex>

          {movie.genres && (
            <Flex gap={2} flexWrap="wrap">
              {movie.genres.slice(0, 2).map(genre => (
                <Badge
                  key={genre.id}
                  colorScheme="blue"
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
            bg="rgba(0, 0, 0, 0.6)"
            p={2}
            borderRadius="full"
            _hover={{
              bg: 'rgba(0, 0, 0, 0.8)',
              transform: 'scale(1.1)'
            }}
            transition="all 0.2s"
            zIndex={2}
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