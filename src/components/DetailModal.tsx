import React, { useEffect, useState, useMemo, memo } from 'react';
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
import { CombinedContent, MovieCredits } from '../types';
import tmdbService from '../services/tmdbService';
import { DynamicIcon } from './Movie/Icons';
import RecommendationCard from './RecommendationCard';

// Types
interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: CombinedContent;
}

interface ActorCardProps {
  name: string;
  character: string;
  profilePath: string | null;
}

// Helper Components
const ActorCard = memo(({ name, character, profilePath }: ActorCardProps) => {
  const getImageUrl = (path: string | null): string => {
    return path 
      ? `https://image.tmdb.org/t/p/w200${path}`
      : 'https://via.placeholder.com/100x150';
  };

  return (
    <Box minW="100px" mr={4}>
      <Image
        src={getImageUrl(profilePath)}
        alt={name}
        borderRadius="md"
        fallbackSrc="https://via.placeholder.com/100x150"
      />
      <Text fontSize="sm" fontWeight="bold" mt={1} noOfLines={1}>
        {name}
      </Text>
      <Text fontSize="xs" color="gray.500" noOfLines={1}>
        {character}
      </Text>
    </Box>
  );
});

ActorCard.displayName = 'ActorCard';

const ContentHeader = memo(({ 
  type,
  releaseDate,
  voteAverage 
}: { 
  type: string;
  releaseDate?: string;
  voteAverage?: number;
}) => {
  const formatReleaseYear = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.getFullYear().toString();
  };

  return (
    <>
      <HStack>
        <Badge colorScheme="teal">
          {type === 'movie' ? 'Movie' : 'TV Series'}
        </Badge>
        <Text fontSize="sm">{formatReleaseYear(releaseDate)}</Text>
      </HStack>
      <HStack>
        <DynamicIcon name="Star" color="gold" size={16} />
        <Text>{voteAverage?.toFixed(1) || 'N/A'}/10</Text>
      </HStack>
    </>
  );
});

ContentHeader.displayName = 'ContentHeader';

const TrailerSection = memo(({ trailerKey }: { trailerKey?: string }) => {
  if (!trailerKey) return null;

  return (
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
  );
});

TrailerSection.displayName = 'TrailerSection';

// Main Component
const DetailModal: React.FC<DetailModalProps> = memo(({ isOpen, onClose, content }) => {
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
        setSimilarContent(similarData.slice(0, 4));
      } catch (error) {
        console.error('Error fetching additional data:', error);
      }
    };

    if (isOpen) {
      fetchAdditionalData();
    }
  }, [isOpen, content.id]);

  const trailerKey = useMemo(() => content.videos?.results.find(
    (video) => video.type === 'Trailer' && video.site === 'YouTube'
  )?.key, [content.videos]);

  const posterUrl = useMemo(() => {
    return content.poster_path 
      ? `https://image.tmdb.org/t/p/w500${content.poster_path}`
      : 'https://via.placeholder.com/500x750';
  }, [content.poster_path]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent bg={bgColor} color={textColor}>
        <ModalHeader>{content.title || content.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
            <Box flexShrink={0}>
              <Image
                src={posterUrl}
                alt={content.title || content.name}
                borderRadius="lg"
                maxW="200px"
                fallbackSrc="https://via.placeholder.com/200x300"
              />
            </Box>
            <VStack align="start" spacing={3}>
              <ContentHeader 
                type={content.type}
                releaseDate={content.release_date || content.first_air_date}
                voteAverage={content.vote_average}
              />
              <Text fontSize="sm">{content.overview || 'No description available.'}</Text>
            </VStack>
          </Flex>

          <TrailerSection trailerKey={trailerKey} />

          {credits?.cast && credits.cast.length > 0 && (
            <Box mt={6}>
              <Heading size="md" mb={2}>Cast</Heading>
              <Flex overflowX="auto" py={2}>
                {credits.cast.slice(0, 10).map((actor) => (
                  <ActorCard
                    key={actor.id}
                    name={actor.name}
                    character={actor.character}
                    profilePath={actor.profile_path}
                  />
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
          
          <Button 
            leftIcon={<DynamicIcon name="Play" size={16} />} 
            colorScheme="blue" 
            mr={3}
          >
            Watch Now
          </Button>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

DetailModal.displayName = 'DetailModal';

export default DetailModal;