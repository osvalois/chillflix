import React, { useMemo } from 'react';
import { Box, Heading, Text, Button, Flex, Icon, Tag, Container, VStack, HStack, useBreakpointValue, keyframes } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaStar, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { Parallax } from 'react-scroll-parallax';
import { CombinedContent, Genre } from '../../types';
import { Link as RouterLink } from 'react-router-dom';
import { useSpring, animated, config } from 'react-spring';
import { useInView } from 'react-intersection-observer';
import { Blurhash } from "react-blurhash";

const MotionBox = motion(Box as any);

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulseAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
`;

interface FeaturedContentProps {
  content: CombinedContent;
  genres: Genre[];
}

const FeaturedContent: React.FC<FeaturedContentProps> = ({ content, genres }) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Responsive values using Chakra UI's useBreakpointValue
  const containerHeight = useBreakpointValue({ base: "80vh", md: "90vh" });
  const padding = useBreakpointValue({ base: 4, sm: 6, md: 8 });
  const contentPadding = useBreakpointValue({ base: 4, sm: 6, md: 8 });
  const headingSize = useBreakpointValue({ base: "xl", sm: "2xl", md: "3xl", lg: "4xl" });
  const overviewFontSize = useBreakpointValue({ base: "sm", md: "md", lg: "xl" });
  const tagSize = useBreakpointValue({ base: "sm", md: "md" });
  const buttonSize = useBreakpointValue({ base: "md", md: "lg" });
  const maxGenres = useBreakpointValue({ base: 2, sm: 3, md: 4 });
  const overviewMaxWidth = useBreakpointValue({ base: "100%", md: "600px" });
  const overviewMaxLength = useBreakpointValue({ base: 100, sm: 200, md: 500 });

  const getContentLink = useMemo(() => {
    const contentType = 'title' in content ? 'movie' : 'tv';
    return `/${contentType}/${content.id}`;
  }, [content]);

  const springProps = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(50px)',
    config: config.molasses,
  });

  const contentGenres = useMemo(() => {
    return content.genre_ids
      .slice(0, maxGenres)
      .map(genreId => genres.find(g => g.id === genreId))
      .filter(Boolean) as Genre[];
  }, [content.genre_ids, genres, maxGenres]);

  // Truncate overview text based on screen size
  const truncatedOverview = useMemo(() => {
    if (!content.overview) return '';
    if (overviewMaxLength && content.overview.length <= overviewMaxLength) return content.overview;
    return `${content.overview.slice(0, overviewMaxLength ?? 100)}...`;
  }, [content.overview, overviewMaxLength]);

  if (!content) {
    console.warn('No content provided to FeaturedContent');
    return null;
  }

  return (
    <Box position="relative" height={containerHeight} overflow="hidden" ref={ref}>
      <Parallax translateY={[-20, 20]} style={{ height: '100%', width: '100%' }}>
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
        >
          <Blurhash
            hash={content.backdrop_blurhash || "L6PZfSi_.AyE_3t7t7R**0o#DgR4"}
            width="100%"
            height="100%"
            resolutionX={32}
            resolutionY={32}
            punch={1}
          />
        </Box>
        {content.backdrop_path && (
          <Box
            backgroundImage={`url(https://image.tmdb.org/t/p/original${content.backdrop_path})`}
            backgroundSize="cover"
            backgroundPosition="center"
            width="100%"
            height="100%"
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            filter="blur(5px)"
            transform="scale(1.1)"
          />
        )}
      </Parallax>

      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient={`linear(to-t, ${content.primary_color || 'rgba(0,0,0,0.9)'}, rgba(0,0,0,0.5), transparent)`}
      />

      <Container maxW="container.xl" height="100%">
        <AnimatePresence>
          <MotionBox
            as={animated.div}
            style={springProps}
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            p={padding}
            color="white"
          >
            <Box
              bg="rgba(255, 255, 255, 0.1)"
              backdropFilter="blur(10px)"
              borderRadius={{ base: "xl", md: "2xl" }}
              p={contentPadding}
              boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
              border="1px solid rgba(255, 255, 255, 0.18)"
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                right: '-50%',
                bottom: '-50%',
                background: 'linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%)',
                transform: 'rotate(45deg)',
                transition: 'all 0.5s',
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
                <Heading
                  size={headingSize}
                  mb={{ base: 1, md: 2 }}
                  bgGradient="linear(to-r, #ff8a00, #e52e71)"
                  bgClip="text"
                  animation={`${gradientAnimation} 3s ease infinite`}
                  lineHeight={{ base: "shorter", md: "short" }}
                >
                  {content.title || content.name}
                </Heading>

                <HStack 
                  spacing={{ base: 2, md: 4 }} 
                  mb={{ base: 1, md: 2 }}
                  flexWrap="wrap"
                >
                  <Tag 
                    borderRadius="full"
                    size={tagSize}
                    bg="rgba(255, 255, 255, 0.2)"
                    color="white"
                    boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                  >
                    <Icon as={FaStar} mr={1} color="yellow.400" />
                    {content.vote_average.toFixed(1)}
                  </Tag>
                  <Tag
                    borderRadius="full"
                    size={tagSize}
                    bg="rgba(255, 255, 255, 0.2)"
                    color="white"
                    boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                  >
                    <Icon as={FaCalendarAlt} mr={1} color="blue.400" />
                    {content.release_date?.slice(0, 4) || content.first_air_date?.slice(0, 4)}
                  </Tag>
                  {content.runtime && (
                    <Tag
                      borderRadius="full"
                      size={tagSize}
                      bg="rgba(255, 255, 255, 0.2)"
                      color="white"
                      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                    >
                      <Icon as={FaClock} mr={1} color="green.400" />
                      {`${content.runtime} min`}
                    </Tag>
                  )}
                </HStack>

                <Flex mb={{ base: 2, md: 4 }} flexWrap="wrap" gap={2}>
                  {contentGenres.map((genre) => (
                    <Tag 
                      key={genre.id}
                      size={tagSize}
                      bg="rgba(255, 255, 255, 0.2)"
                      color="white"
                      borderRadius="full"
                      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                    >
                      {genre.name}
                    </Tag>
                  ))}
                </Flex>

                <Text
                  fontSize={overviewFontSize}
                  mb={{ base: 4, md: 6 }}
                  maxWidth={overviewMaxWidth}
                  textShadow="1px 1px 2px rgba(0,0,0,0.3)"
                  bgGradient="linear(to-r, white, #e0e0e0)"
                  bgClip="text"
                  lineHeight="tall"
                >
                  {truncatedOverview}
                </Text>

                <Flex>
                  <Button 
                    as={RouterLink}
                    to={getContentLink}
                    leftIcon={<FaPlay />} 
                    bg="rgba(255, 255, 255, 0.2)"
                    color="white" 
                    size={buttonSize}
                    mr={4}
                    _hover={{ 
                      bg: "rgba(255, 255, 255, 0.3)",
                      transform: "translateY(-2px)"
                    }}
                    _active={{
                      bg: "rgba(255, 255, 255, 0.4)",
                      transform: "translateY(0)"
                    }}
                    borderRadius="full"
                    boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                    transition="all 0.3s ease"
                    position="relative"
                    overflow="hidden"
                    _after={{
                      content: '""',
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      right: '-50%',
                      bottom: '-50%',
                      background: 'linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0) 100%)',
                      transform: 'rotate(45deg) translateX(-100%)',
                      transition: 'all 0.3s ease',
                    }}
                    animation={`${pulseAnimation} 2s infinite`}
                  >
                    Play
                  </Button>
                </Flex>
              </VStack>
            </Box>
          </MotionBox>
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default FeaturedContent;