import React, { useState, useCallback } from 'react';
import { Box, Text, Badge, Icon, VStack, HStack, Tooltip, Button, useColorModeValue, Flex } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import { FaPlay, FaHeart, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const MotionBox = motion(Box as any);
const AnimatedBox = animated(MotionBox);

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  overview: string;
  media_type: 'movie' | 'tv';
}

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  onAddToFavorites: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = React.memo(({ movie, onSelect, onAddToFavorites }) => {
  const [isHovered, setIsHovered] = useState(false);
  const textColor = useColorModeValue('gray.800', 'white');
  const placeholderColor = useColorModeValue('gray.600', 'gray.300');
  const glassBg = useColorModeValue('rgba(255, 255, 255, 0.7)', 'rgba(26, 32, 44, 0.7)');
  const glassBoxShadow = useColorModeValue(
    '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
  );
  const glassFilter = 'blur(10px) saturate(180%)';

  const navigate = useNavigate();

  const cardSpring = useSpring({
    scale: isHovered ? 1.05 : 1,
    boxShadow: isHovered 
      ? '0 10px 30px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.2)'
      : '0 4px 6px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.1)',
    config: { mass: 1, tension: 300, friction: 20 },
  });

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  const handleClick = useCallback(() => onSelect(movie), [movie, onSelect]);
  const handleAddToFavorites = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToFavorites(movie);
  }, [movie, onAddToFavorites]);

  const handleDetailClick = useCallback(() => {
    const route = movie.media_type === 'movie' ? `/movie/${movie.id}` : `/serie/${movie.id}`;
    navigate(route);
  }, [navigate, movie.id, movie.media_type]);

  return (
    <AnimatedBox
      style={cardSpring}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      bg={glassBg}
      backdropFilter={glassFilter}
      border="1px solid rgba(255, 255, 255, 0.18)"
      borderRadius="16px"
      overflow="hidden"
      height="100%"
      position="relative"
      role="group"
      tabIndex={0}
      _focus={{ outline: 'none', boxShadow: 'outline' }}
      boxShadow={glassBoxShadow}
      transition="all 0.3s ease"
    >
      <VStack spacing={0} align="stretch" height="100%">
        <Box position="relative" width="100%" paddingBottom="150%" overflow="hidden">
          <Box
            as="img"
            src={`https://image.tmdb.org/t/p/w500${movie?.poster_path}`}
            alt={movie.title}
            objectFit="cover"
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            transition="transform 0.3s ease"
            _groupHover={{ transform: 'scale(1.05)' }}
          />
          <AnimatePresence>
            {isHovered && (
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
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
                    leftIcon={<FaInfoCircle />} 
                    onClick={handleDetailClick} 
                    size="sm"
                    bg="rgba(255, 255, 255, 0.2)"
                    color="white"
                    _hover={{ bg: 'rgba(255, 255, 255, 0.3)' }}
                    backdropFilter="blur(5px)"
                  >
                    Details
                  </Button>
                </HStack>
              </MotionBox>
            )}
          </AnimatePresence>
        </Box>
        <VStack spacing={2} align="start" p={4} flexGrow={1} bg={glassBg} backdropFilter={glassFilter}>
          <Text fontWeight="bold" fontSize="lg" color={textColor} noOfLines={1}>
            {movie.title}
          </Text>
          <Flex justify="space-between" width="100%" align="center">
            <Badge 
              colorScheme={movie.vote_average >= 7 ? 'green' : movie.vote_average >= 5 ? 'yellow' : 'red'}
              bg={`${movie.vote_average >= 7 ? 'green' : movie.vote_average >= 5 ? 'yellow' : 'red'}.200`}
              color={`${movie.vote_average >= 7 ? 'green' : movie.vote_average >= 5 ? 'yellow' : 'red'}.800`}
              px={2}
              py={1}
              borderRadius="full"
            >
              {movie.vote_average.toFixed(1)}
            </Badge>
            <Text fontSize="sm" color={placeholderColor}>
              {movie.release_date?.split('-')[0] || 'N/A'}
            </Text>
          </Flex>
          <Text fontSize="sm" color={textColor} noOfLines={2}>
            {movie.overview}
          </Text>
        </VStack>
        <Tooltip label="Add to favorites" placement="top">
          <Box
            as="button"
            position="absolute"
            top={2}
            right={2}
            onClick={handleAddToFavorites}
            bg="rgba(255, 255, 255, 0.2)"
            p={2}
            borderRadius="full"
            _hover={{ bg: 'rgba(255, 255, 255, 0.3)' }}
            backdropFilter="blur(5px)"
            transition="all 0.3s ease"
          >
            <Icon
              as={FaHeart}
              color="red.500"
              opacity={isHovered ? 1 : 0.7}
              transition="all 0.3s"
              _groupHover={{ opacity: 1, transform: 'scale(1.1)' }}
            />
          </Box>
        </Tooltip>
      </VStack>
    </AnimatedBox>
  );
});

MovieCard.displayName = 'MovieCard';

export default MovieCard;