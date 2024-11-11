import React, { useState } from 'react';
import { Box, Text, Flex, Badge, IconButton, Tooltip, useDisclosure } from '@chakra-ui/react';
import { motion } from 'framer-motion';

import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { CombinedContent } from '../types';
import DetailModal from './DetailModal';
import { DynamicIcon } from './Movie/Icons';

interface RecommendationCardProps {
  movie: CombinedContent;
  onPlay?: (movie: CombinedContent) => void;
}

// Helper function to safely get year from date string
const getYearFromDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    return new Date(dateString).getFullYear().toString();
  } catch (error) {
    return 'N/A';
  }
};

const MotionBox = motion(Box as any);

const RecommendationCard: React.FC<RecommendationCardProps> = ({ movie, onPlay }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isOpen, onClose } = useDisclosure();
  const [detailContent] = useState<CombinedContent | null>(null);

  const handlePlayClick = () => {
    if (onPlay) {
      onPlay(movie);
    }
  };

  // Get the year safely
  const releaseYear = getYearFromDate(movie.release_date || movie.first_air_date);
  
  return (
    <>
      <MotionBox
        maxW="sm"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        position="relative"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <LazyLoadImage
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title || movie.name}
          effect="blur"
          width="100%"
          height="auto"
        />
        <Box p="6">
          <Flex align="baseline">
            <Badge borderRadius="full" px="2" colorScheme="teal">
              {movie.type === 'movie' ? 'Movie' : 'TV Series'}
            </Badge>
            <Text
              ml={2}
              textTransform="uppercase"
              fontSize="sm"
              fontWeight="bold"
              color="gray.500"
            >
              {releaseYear}
            </Text>
          </Flex>
          <Text mt="1" fontWeight="semibold" as="h4" lineHeight="tight" noOfLines={1}>
            {movie.title || movie.name}
          </Text>
          <Flex mt="2" align="center">
          <DynamicIcon name="Star" color="gold" size={16} />
            <Text ml={1} fontSize="sm">
              {movie.vote_average.toFixed(1)}
            </Text>
          </Flex>
        </Box>
        {isHovered && (
          <Flex
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="rgba(0,0,0,0.7)"
            justifyContent="center"
            alignItems="center"
          >
            <Tooltip label="Play">
              <IconButton
                aria-label="Play"
                icon={ <DynamicIcon name="Play" color="black" size={16} />}
                size="lg"
                variant="ghost"
                colorScheme="white"
                onClick={handlePlayClick}
                mr={4}
              />
            </Tooltip>
          </Flex>
        )}
      </MotionBox>
      {detailContent && (
        <DetailModal isOpen={isOpen} onClose={onClose} content={detailContent} />
      )}
    </>
  );
};

export default RecommendationCard;