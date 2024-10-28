import React, { useState, useMemo, memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Container, VStack, HStack, Heading, Text, Button, Icon, Tag } from '@chakra-ui/react';
import { FaPlay, FaStar, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { Blurhash } from "react-blurhash";
import useWindowSize from '../../hooks/useWindowSize'; // Asumiendo que existe este hook

// Types
interface Genre {
  id: number;
  name: string;
}

interface CombinedContent {
  id: number;
  title?: string;
  name?: string;
  backdrop_path: string;
  backdrop_blurhash?: string;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  genre_ids: number[];
  primary_color?: string;
}

interface FeaturedContentProps {
  content: CombinedContent;
  genres: Genre[];
}

// Memoized Components
const BackdropImage = memo(({ 
  backdropPath, 
  blurhash 
}: { 
  backdropPath: string; 
  blurhash: string; 
}) => (
  <Box position="relative" width="100%" height="100%">
    <Blurhash
      hash={blurhash || "L6PZfSi_.AyE_3t7t7R**0o#DgR4"}
      width="100%"
      height="100%"
      resolutionX={32}
      resolutionY={32}
      punch={1}
    />
    <Box
      position="absolute"
      inset="0"
      backgroundImage={`url(https://image.tmdb.org/t/p/original${backdropPath})`}
      backgroundSize="cover"
      backgroundPosition="center"
      filter="blur(5px)"
      transform="scale(1.1)"
      transition="opacity 0.3s ease"
    />
  </Box>
));

const MetaTag = memo(({ 
  icon, 
  value, 
  color = "yellow.400" 
}: { 
  icon: React.ComponentType; 
  value: string | number; 
  color?: string;
}) => (
  <Tag
    borderRadius="full"
    size={{ base: "sm", md: "md" }}
    bg="rgba(255, 255, 255, 0.2)"
    color="white"
    boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
  >
    <Icon as={icon} mr={1} color={color} />
    {value}
  </Tag>
));

const GenreTag = memo(({ name }: { name: string }) => (
  <Tag
    borderRadius="full"
    size={{ base: "sm", md: "md" }}
    bg="rgba(255, 255, 255, 0.2)"
    color="white"
    boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
  >
    {name}
  </Tag>
));

// Main Component
const FeaturedContent: React.FC<FeaturedContentProps> = memo(({ content, genres }) => {
  const { width } = useWindowSize();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Responsive calculations based on window width
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // Memoized values
  const contentType = useMemo(() => 
    'title' in content ? 'movie' : 'tv'
  , [content]);

  const contentGenres = useMemo(() => {
    const maxGenres = isMobile ? 2 : isTablet ? 3 : 4;
    return content.genre_ids
      .slice(0, maxGenres)
      .map(id => genres.find(g => g.id === id))
      .filter(Boolean) as Genre[];
  }, [content.genre_ids, genres, isMobile, isTablet]);

  const truncatedOverview = useMemo(() => {
    const maxLength = isMobile ? 100 : isTablet ? 200 : 500;
    if (!content.overview) return '';
    return content.overview.length > maxLength
      ? `${content.overview.slice(0, maxLength)}...`
      : content.overview;
  }, [content.overview, isMobile, isTablet]);

  // Image preloading
  useEffect(() => {
    if (content.backdrop_path) {
      const img = new Image();
      img.src = `https://image.tmdb.org/t/p/original${content.backdrop_path}`;
      img.onload = () => setIsImageLoaded(true);
    }
  }, [content.backdrop_path]);

  // Animation variants
  const contentVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  if (!content) return null;

  return (
    <Box 
      ref={ref}
      position="relative" 
      height={{ base: "90vh", md: "100vh" }}
      overflow="hidden"
    >
      {/* Backdrop */}
      <AnimatePresence>
        {content.backdrop_path && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isImageLoaded ? 1 : 0 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <BackdropImage
              backdropPath={content.backdrop_path}
              blurhash={content.backdrop_blurhash || ""}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient Overlay */}
      <Box
        position="absolute"
        inset={0}
        bgGradient={`linear(to-t, ${
          content.primary_color || 'rgba(0,0,0,0.9)'
        }, rgba(0,0,0,0.5), transparent)`}
      />

      {/* Content */}
      <Container maxW="container.xl" height="100%">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={contentVariants}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: isMobile ? '1rem' : '2rem',
          }}
        >
          <Box
            bg="rgba(255, 255, 255, 0.1)"
            backdropFilter="blur(10px)"
            borderRadius={{ base: "xl", md: "2xl" }}
            p={{ base: 4, md: 8 }}
            boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
            border="1px solid rgba(255, 255, 255, 0.18)"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              inset: '-50%',
              background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent)',
              transform: 'rotate(45deg)',
              transition: 'transform 0.5s ease',
            }}
            _hover={{
              _before: {
                transform: 'rotate(45deg) translate(100%, 100%)',
              }
            }}
          >
            <VStack
              align="flex-start"
              spacing={{ base: 2, md: 4 }}
              position="relative"
              zIndex={1}
            >
              {/* Title */}
              <Heading
                size={{ base: "xl", sm: "2xl", md: "3xl", lg: "4xl" }}
                bgGradient="linear(to-r, #ff8a00, #e52e71)"
                bgClip="text"
                lineHeight={{ base: "shorter", md: "short" }}
              >
                {content.title || content.name}
              </Heading>

              {/* Meta Tags */}
              <HStack spacing={4} flexWrap="wrap">
                <MetaTag
                  icon={FaStar}
                  value={content.vote_average.toFixed(1)}
                  color="yellow.400"
                />
                <MetaTag
                  icon={FaCalendarAlt}
                  value={content.release_date?.split('-')[0] ?? ''}
                  color="blue.400"
                />
                {content.runtime && (
                  <MetaTag
                    icon={FaClock}
                    value={`${content.runtime} min`}
                    color="green.400"
                  />
                )}
              </HStack>

              {/* Genres */}
              <HStack spacing={2} flexWrap="wrap">
                {contentGenres.map(genre => (
                  <GenreTag key={genre.id} name={genre.name} />
                ))}
              </HStack>

              {/* Overview */}
              <Text
                fontSize={{ base: "sm", md: "md", lg: "lg" }}
                maxWidth={{ base: "100%", md: "600px" }}
                color="whiteAlpha.900"
                textShadow="1px 1px 2px rgba(0,0,0,0.3)"
                lineHeight="tall"
              >
                {truncatedOverview}
              </Text>

              {/* Action Button */}
              <Button
                as={RouterLink}
                to={`/${contentType}/${content.id}`}
                leftIcon={<FaPlay />}
                bg="rgba(255, 255, 255, 0.2)"
                color="white"
                size={{ base: "md", md: "lg" }}
                _hover={{
                  bg: "rgba(255, 255, 255, 0.3)",
                  transform: "translateY(-2px)"
                }}
                _active={{
                  bg: "rgba(255, 255, 255, 0.4)",
                  transform: "translateY(0)"
                }}
                borderRadius="full"
                transition="all 0.3s ease"
                sx={{
                  "@keyframes pulse": {
                    "0%": { boxShadow: "0 0 0 0 rgba(255, 255, 255, 0.4)" },
                    "70%": { boxShadow: "0 0 0 10px rgba(255, 255, 255, 0)" },
                    "100%": { boxShadow: "0 0 0 0 rgba(255, 255, 255, 0)" }
                  },
                  animation: "pulse 2s infinite"
                }}
              >
                Play
              </Button>
            </VStack>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
});

FeaturedContent.displayName = 'FeaturedContent';

export default FeaturedContent;