import React, { useState } from 'react';
import { 
  Box, 
  Heading, 
  Flex, 
  Text, 
  Image, 
  Icon, 
  Button, 
  useColorModeValue, 
  Spinner, 
  VStack,
  HStack,
  Tooltip,
  useBreakpointValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import tmdbService from '../services/tmdbService';
import { CombinedContent } from './Home/ContentCarousel';

const MotionBox = motion(Box as any);

interface RecommendationListProps {
  tmdbId: string | undefined;
}

const RecommendationList: React.FC<RecommendationListProps> = ({ tmdbId }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = useBreakpointValue({ base: 2, md: 4, lg: 5 }) ?? 4;
  const navigate = useNavigate();

  const { data: recommendations, isLoading, error } = useQuery<CombinedContent[], Error>(
    ['recommendations', tmdbId],
    () => tmdbService.getRecommendationsMovies(),
    {
      enabled: !!tmdbId,
      initialData: [] as CombinedContent[],
    }
  );

  const bgColor = useColorModeValue("gray.50", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const cardBg = useColorModeValue("white", "gray.700");

  if (isLoading) return <Spinner size="xl" />;
  if (error) return <Text color="red.500">Error loading recommendations</Text>;
  if (!recommendations || recommendations.length === 0) return null;

  const totalPages = Math.ceil(recommendations.length / itemsPerPage);
  const currentMovies = recommendations.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
  };

  const handleMovieClick = (movieId: string) => {
    navigate(`/movie/${movieId}`);
  };

  return (
    <Box bg={bgColor} py={8} px={4}>
      <VStack spacing={6} align="stretch">
        <Heading as="h2" size="xl" textAlign="center" color={textColor}>
          Recommended Movies
        </Heading>
        <Flex justifyContent="space-between" alignItems="center">
          <Button
            leftIcon={<FaChevronLeft />}
            onClick={handlePrevPage}
            isDisabled={currentPage === 0}
            variant="ghost"
          >
            Previous
          </Button>
          <Text color={textColor}>
            Page {currentPage + 1} of {totalPages}
          </Text>
          <Button
            rightIcon={<FaChevronRight />}
            onClick={handleNextPage}
            isDisabled={currentPage === totalPages - 1}
            variant="ghost"
          >
            Next
          </Button>
        </Flex>
        <Flex justifyContent="space-between" overflow="hidden">
          {currentMovies.map((movie: CombinedContent) => (
            <MotionBox
              key={movie.id}
              bg={cardBg}
              borderRadius="lg"
              overflow="hidden"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              cursor="pointer"
              onClick={() => handleMovieClick(movie.title ?? '')}
              maxW={`${100 / itemsPerPage}%`}
              m={2}
              boxShadow="md"
            >
              <Image
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                objectFit="cover"
                w="100%"
                h="300px"
              />
              <Box p={4}>
                <Tooltip label={movie.title} placement="top">
                  <Heading as="h3" size="md" noOfLines={1} mb={2} color={textColor}>
                    {movie.title}
                  </Heading>
                </Tooltip>
                <HStack justifyContent="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.500">
                    {movie.release_date}
                  </Text>
                  <Flex align="center">
                    <Icon as={FaStar} color="yellow.400" mr={1} />
                    <Text fontSize="sm" fontWeight="bold" color={textColor}>
                      {movie.vote_average}
                    </Text>
                  </Flex>
                </HStack>
                <Text fontSize="sm" noOfLines={3} color={textColor}>
                  {movie.overview}
                </Text>
              </Box>
            </MotionBox>
          ))}
        </Flex>
      </VStack>
    </Box>
  );
};

export default RecommendationList;