import React from 'react';
import { Box, Heading, Text, Button, Flex, Icon, Tag, useDisclosure } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaPlay, FaInfoCircle, FaStar } from 'react-icons/fa';
import { Parallax } from 'react-scroll-parallax';
import { CombinedContent, Genre } from '../../types';
import ContentInfoModal from './ContentInfoModal';

const MotionBox = motion(Box);

interface FeaturedContentProps {
  content: CombinedContent;
  genres: Genre[];
}

const FeaturedContent: React.FC<FeaturedContentProps> = ({ content, genres }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box position="relative" height="80vh" overflow="hidden">
      <Parallax y={[-20, 20]}>
        <Box
          backgroundImage={`url(https://image.tmdb.org/t/p/original${content.backdrop_path})`}
          backgroundSize="cover"
          backgroundPosition="center"
          width="100%"
          height="100%"
          position="absolute"
        />
      </Parallax>
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient={`linear(to-t, ${content.primary_color || 'blackAlpha.900'}, transparent)`}
      />
      <MotionBox
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        p={8}
        color="white"
      >
        <Heading size="3xl" mb={4} textShadow="2px 2px 4px rgba(0,0,0,0.5)">
          {content.title || content.name}
        </Heading>
        <Text fontSize="xl" mb={6} maxWidth="600px" textShadow="1px 1px 2px rgba(0,0,0,0.5)">
          {content.overview}
        </Text>
        <Flex mb={6}>
          {content.genre_ids.slice(0, 3).map((genreId) => {
            const genre = genres.find(g => g.id === genreId);
            return genre ? (
              <Tag key={genre.id} mr={2} colorScheme="whiteAlpha">
                {genre.name}
              </Tag>
            ) : null;
          })}
          <Tag colorScheme="yellow">
            <Icon as={FaStar} mr={1} />
            {content.vote_average.toFixed(1)}
          </Tag>
        </Flex>
        <Flex>
          <Button leftIcon={<FaPlay />} colorScheme="red" size="lg" mr={4}>
            Play
          </Button>
          <Button leftIcon={<FaInfoCircle />} colorScheme="whiteAlpha" size="lg" onClick={onOpen}>
            More Info
          </Button>
        </Flex>
      </MotionBox>
      <ContentInfoModal content={content} genres={genres} isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default FeaturedContent;