import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import {
  Box,
  Text,
  Badge,
  VStack,
  HStack,
  Tooltip,
  useColorModeValue,
  Flex,
  Image,
  Skeleton,
  chakra,
} from '@chakra-ui/react';
import { CombinedContent } from '../../types';
import WatchButton from '../WatchButton';
import { DynamicIcon } from './Icons';

// Constants
const POSTER_ASPECT_RATIO = 1.5;

// Types
interface MovieCardProps {
  movie: CombinedContent;
  onSelect: (movie: CombinedContent) => void;
  onAddToFavorites: (movie: CombinedContent) => void;
  isFavorite?: boolean;
  isLoading?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

// Styled Components
const MotionBox = motion(Box as any);
const AnimatedBox = animated(MotionBox);

// Helper Components
const RatingBadge = React.memo(({ rating }: { rating: number }) => {
  const ratingColor = useMemo(() => {
    if (rating >= 7.5) return 'green';
    if (rating >= 6) return 'yellow';
    if (rating >= 4) return 'orange';
    return 'red';
  }, [rating]);

  return (
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
      <DynamicIcon name="Star" size={12} />
      {rating.toFixed(1)}
    </Badge>
  );
});

RatingBadge.displayName = 'RatingBadge';

const RuntimeBadge = React.memo(({ runtime }: { runtime: number }) => {
  const runtimeDisplay = useMemo(() => {
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return `${hours}h ${minutes}m`;
  }, [runtime]);

  return (
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
      <DynamicIcon name="Clock" size={12} />
      {runtimeDisplay}
    </Badge>
  );
});

RuntimeBadge.displayName = 'RuntimeBadge';

const FavoriteButton = React.memo(({ 
  isFavorite, 
  onClick,
}: { 
  isFavorite: boolean;
  onClick: (e: React.MouseEvent) => void;
  isHovered: boolean;
}) => (
  <Tooltip
    label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    placement="top"
  >
    <chakra.button
      position="absolute"
      top={2}
      right={2}
      onClick={onClick}
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
      <DynamicIcon 
        name="Heart" 
        size={20}
        color={isFavorite ? "red.500" : "white"}
        style={isFavorite ? "error" : "default"}
        variant={isFavorite ? "solid" : "outline"}
      />
    </chakra.button>
  </Tooltip>
));

FavoriteButton.displayName = 'FavoriteButton';

// Custom Hooks
const useMovieCardColors = () => {
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

  return useMemo(() => ({
    text: textColor,
    placeholder: placeholderColor,
    glassBg: glassBgColor,
    glassBoxShadow: glassBoxShadowColor,
    cardBg: cardBgColor,
    hoverBg: hoverBgColor,
    buttonHover: buttonHoverBg,
  }), [textColor, placeholderColor, glassBgColor, glassBoxShadowColor, cardBgColor, hoverBgColor, buttonHoverBg]);
};

const useMovieDetails = (movie: CombinedContent) => {
  return useMemo(() => ({
    title: movie.title || movie.name || 'Untitled',
    year: (movie.release_date || movie.first_air_date)?.split('-')[0] || 'N/A',
    overview: movie.overview,
    genres: movie.genres || [],
  }), [movie]);
};

// Main Component
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
  const colors = useMovieCardColors();
  const { title, year, overview, genres } = useMovieDetails(movie);

  // Animations
  const cardSpring = useSpring({
    scale: isHovered ? 1.05 : 1,
    boxShadow: isHovered
      ? '0 20px 40px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.2)'
      : '0 4px 6px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.1)',
    config: { mass: 1, tension: 300, friction: 20 }
  });

  // Event Handlers
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoading) onSelect(movie);
  }, [movie, onSelect, isLoading]);

  const handleAddToFavorites = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isLoading) onAddToFavorites(movie);
  }, [movie, onAddToFavorites, isLoading]);

  const handleDetailClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isLoading) {
      const route = movie.media_type === 'movie' ? `/movie/${movie.id}` : `/serie/${movie.id}`;
      navigate(route);
    }
  }, [navigate, movie.id, movie.media_type, isLoading]);

  const handleImageLoad = useCallback(() => setImageLoaded(true), []);
  const handleImageError = useCallback(() => {
    setIsImageError(true);
    setImageLoaded(true);
  }, []);

  // Memoized Values
  const posterUrl = useMemo(() => {
    if (isImageError) return '/default-movie-poster.jpg';
    return movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : '/default-movie-poster.jpg';
  }, [movie.poster_path, isImageError]);

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
                  <RatingBadge rating={movie.vote_average} />
                  {movie.runtime && <RuntimeBadge runtime={movie.runtime} />}
                </Flex>

                <VStack spacing={3} align="stretch">
                  <Text
                    color="white"
                    fontSize="sm"
                    noOfLines={3}
                    textShadow="0 2px 4px rgba(0,0,0,0.5)"
                  >
                    {overview}
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
                      icon={<DynamicIcon name="Play" size={20} />}
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
                <DynamicIcon name="Calendar" size={12} />
                {year}
              </Badge>
            </HStack>
          </Flex>

          {genres.length > 0 && (
            <Flex gap={2} flexWrap="wrap">
              {genres.slice(0, 2).map(genre => (
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

        <FavoriteButton 
          isFavorite={isFavorite}
          onClick={handleAddToFavorites}
          isHovered={isHovered}
        />
      </VStack>
    </AnimatedBox>
  );
});

MovieCard.displayName = 'MovieCard';

export default MovieCard;