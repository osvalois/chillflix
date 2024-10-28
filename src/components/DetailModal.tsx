import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Image,
  Box,
  Flex,
  Badge,
  VStack,
  HStack,
  Heading,
  AspectRatio,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaStar, FaPlay } from 'react-icons/fa';
import { CombinedContent, MovieCredits } from '../types';
import tmdbService from '../services/tmdbService';
import RecommendationCard from './RecommendationCard';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: CombinedContent;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, content }) => {
  const [credits, setCredits] = useState<MovieCredits | null>(null);
  const [similarContent, setSimilarContent] = useState<CombinedContent[]>([]);
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        const [creditsData, similarData] = await Promise.all([
          tmdbService.getMovieCredits(content.id),
          tmdbService.getSimilarMovies(content.id),
        ]);
        setCredits(creditsData);
        setSimilarContent(similarData.slice(0, 4)); // Limit to 4 similar items
      } catch (error) {
        console.error('Error fetching additional data:', error);
      }
    };

    if (isOpen) {
      fetchAdditionalData();
    }
  }, [isOpen, content.id]);

  const trailerKey = content.videos?.results.find(
    (video) => video.type === 'Trailer' && video.site === 'YouTube'
  )?.key;

  // Función auxiliar para formatear la fecha
  const formatReleaseYear = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.getFullYear().toString();
  };

  // Función auxiliar para obtener la URL de la imagen con fallback
  const getImageUrl = (path: string | undefined, size: string = 'w500'): string => {
    return path 
      ? `https://image.tmdb.org/t/p/${size}${path}`
      : 'https://via.placeholder.com/500x750';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor} color={textColor}>
        <ModalHeader>{content.title || content.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
            <Box flexShrink={0}>
              <Image
                src={getImageUrl(content.poster_path ?? '')}
                alt={content.title || content.name}
                borderRadius="lg"
                maxW="200px"
                fallbackSrc="https://via.placeholder.com/200x300"
              />
            </Box>
            <VStack align="start" spacing={3}>
              <HStack>
                <Badge colorScheme="teal">
                  {content.type === 'movie' ? 'Movie' : 'TV Series'}
                </Badge>
                <Text fontSize="sm">
                  {formatReleaseYear(content.release_date || content.first_air_date)}
                </Text>
              </HStack>
              <HStack>
                <FaStar color="gold" />
                <Text>{content.vote_average?.toFixed(1) || 'N/A'}/10</Text>
              </HStack>
              <Text fontSize="sm">{content.overview || 'No description available.'}</Text>
            </VStack>
          </Flex>

          {trailerKey && (
            <Box mt={6}>
              <Heading size="md" mb={2}>Trailer</Heading>
              <AspectRatio ratio={16 / 9}>
                <iframe
                  title="Trailer"
                  src={`https://www.youtube.com/embed/${trailerKey}`}
                  allowFullScreen
                />
              </AspectRatio>
            </Box>
          )}

          {credits && credits.cast && credits.cast.length > 0 && (
            <Box mt={6}>
              <Heading size="md" mb={2}>Cast</Heading>
              <Flex overflowX="auto" py={2}>
                {credits.cast.slice(0, 10).map((actor) => (
                  <Box key={actor.id} minW="100px" mr={4}>
                    <Image
                      src={getImageUrl(actor.profile_path ?? '', 'w200')}
                      alt={actor.name}
                      borderRadius="md"
                      fallbackSrc="https://via.placeholder.com/100x150"
                    />
                    <Text fontSize="sm" fontWeight="bold" mt={1} noOfLines={1}>
                      {actor.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                      {actor.character}
                    </Text>
                  </Box>
                ))}
              </Flex>
            </Box>
          )}

          {similarContent.length > 0 && (
            <Box mt={6}>
              <Heading size="md" mb={2}>You might also like</Heading>
              <Flex overflowX="auto" py={2}>
                {similarContent.map((item) => (
                  <Box key={item.id} minW="200px" mr={4}>
                    <RecommendationCard movie={item} />
                  </Box>
                ))}
              </Flex>
            </Box>
          )}
        </ModalBody>

        <ModalFooter>
          <Button leftIcon={<FaPlay />} colorScheme="blue" mr={3}>
            Watch Now
          </Button>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DetailModal;