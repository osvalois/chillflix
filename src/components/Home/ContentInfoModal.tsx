import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  AspectRatio,
  Image,
  Heading,
  Text,
  Grid,
  Box,
  Tag,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { FaStar } from 'react-icons/fa';
import { CombinedContent, Genre } from '../../types';

interface ContentInfoModalProps {
  content: CombinedContent;
  genres: Genre[];
  isOpen: boolean;
  onClose: () => void;
}

const ContentInfoModal: React.FC<ContentInfoModalProps> = ({ content, genres, isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent
        bg="rgba(0, 0, 0, 0.8)"
        color="white"
      >
        <ModalBody p={6}>
          <AspectRatio ratio={16 / 9} mb={4}>
            <Image
              src={`https://image.tmdb.org/t/p/w1280${content.backdrop_path}`}
              alt={content.title || content.name}
              objectFit="cover"
              borderRadius="md"
            />
          </AspectRatio>
          <Heading size="xl" mb={2}>
            {content.title || content.name}
          </Heading>
          <Text fontSize="md" mb={4}>
            {content.overview}
          </Text>
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <Box>
              <Text fontWeight="bold">Release Date:</Text>
              <Text>{content.release_date || content.first_air_date}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Rating:</Text>
              <Flex align="center">
                <Icon as={FaStar} color="yellow.400" mr={1} />
                <Text>{content.vote_average.toFixed(1)} / 10</Text>
              </Flex>
            </Box>
            <Box>
              <Text fontWeight="bold">Genres:</Text>
              <Flex flexWrap="wrap" gap={2}>
                {content.genre_ids.map((genreId) => {
                  const genre = genres.find(g => g.id === genreId);
                  return genre ? (
                    <Tag key={genre.id} size="sm">
                      {genre.name}
                    </Tag>
                  ) : null;
                })}
              </Flex>
            </Box>
            <Box>
              <Text fontWeight="bold">Popularity:</Text>
              <Text>{content.popularity.toFixed(0)}</Text>
            </Box>
          </Grid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ContentInfoModal;