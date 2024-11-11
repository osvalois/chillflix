import React, { useState, useEffect } from 'react';
import { Box, VStack, Text, Flex, Avatar, Button, Select, useColorModeValue, Spinner, Tooltip } from '@chakra-ui/react';

import { useInView } from 'react-intersection-observer';
import { useSpring, animated } from 'react-spring';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { getMovieReviews } from '../../services/tmdbService';
import { Review } from '../../types';
import { DynamicIcon } from '../Movie/Icons';

interface ReviewSectionProps {
  movieId: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ movieId }) => {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'created_at' | 'rating'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  const { data, isLoading, isError, error } = useQuery<{ results: Review[], total_pages: number }, Error>(
    ['reviews', movieId, page, sortBy, sortOrder],
    () => getMovieReviews(movieId, page),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const fadeIn = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(50px)',
    config: { tension: 300, friction: 10 },
  });

  useEffect(() => {
    setPage(1);
  }, [sortBy, sortOrder]);

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSortBy, newSortOrder] = event.target.value.split('-') as ['created_at' | 'rating', 'asc' | 'desc'];
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleVote = (reviewId: string, voteType: 'up' | 'down') => {
    // Implement voting logic here
    console.log(`Voted ${voteType} for review ${reviewId}`);
  };

  // Helper function to get avatar src
  const getAvatarSrc = (avatarPath: string | null): string | undefined => {
    if (!avatarPath) return undefined;
    // If the path is a full URL (starts with http)
    if (avatarPath.startsWith('http')) return avatarPath;
    // If it's a relative path from TMDB (starts with /)
    if (avatarPath.startsWith('/')) {
      return `https://image.tmdb.org/t/p/original${avatarPath}`;
    }
    return undefined;
  };

  if (isError) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="xl" fontWeight="bold" color="red.500">
          Error loading reviews: {error?.message}
        </Text>
      </Box>
    );
  }

  return (
    <animated.div ref={ref} style={fadeIn}>
      <Box maxWidth="1000px" width="100%" mt={8}>
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
          <Text fontSize="2xl" fontWeight="bold" bgGradient="linear(to-r, purple.400, pink.500)" bgClip="text">
            Reviews
          </Text>
          <Select onChange={handleSortChange} width="auto">
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="rating-desc">Highest Rated</option>
            <option value="rating-asc">Lowest Rated</option>
          </Select>
        </Flex>
        {isLoading ? (
          <Flex justify="center" align="center" height="200px">
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : (
          <VStack spacing={4} align="stretch">
            {data?.results.map((review) => (
              <Box key={review.id} p={4} borderRadius="md" bg={bgColor} boxShadow="md">
                <Flex justifyContent="space-between" alignItems="flex-start">
                  <Flex alignItems="center">
                    <Avatar 
                      src={getAvatarSrc(review.author_details.avatar_path)}
                      name={review.author}
                      mr={2}
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">{review.author}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {format(new Date(review.created_at), 'MMMM d, yyyy')}
                      </Text>
                    </VStack>
                  </Flex>
                  <Flex alignItems="center">
                    {review.author_details.rating && (
                      <Tooltip label={`Rating: ${review.author_details.rating}/10`}>
                        <Flex alignItems="center" mr={2}>
                        <DynamicIcon name="Star" size={20} style="default" />
                          <Text fontWeight="bold">{review.author_details.rating}</Text>
                        </Flex>
                      </Tooltip>
                    )}
                    <Tooltip label="Helpful">
                      <Button
                        size="sm"
                        leftIcon={<DynamicIcon name="ThumbsUp" size={20} style="default" />}
                        onClick={() => handleVote(review.id, 'up')}
                        mr={2}
                      >
                        {review.upvotes || 0}
                      </Button>
                    </Tooltip>
                  </Flex>
                </Flex>
                <Text mt={4} color={textColor}>
                  {review.content.length > 300
                    ? `${review.content.slice(0, 300)}...`
                    : review.content}
                </Text>
                {review.content.length > 300 && (
                  <Button
                    variant="link"
                    colorScheme="blue"
                    mt={2}
                    onClick={() => {
                      // Implement "Read More" functionality
                      console.log(`Show full review for ${review.id}`);
                    }}
                  >
                    Read More
                  </Button>
                )}
              </Box>
            ))}
          </VStack>
        )}
        {data && data.total_pages > 1 && (
          <Flex justifyContent="space-between" mt={4}>
            <Button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              isDisabled={page === 1}
              leftIcon={<DynamicIcon name="Sort" size={20} style="default" />}
            >
              Previous
            </Button>
            <Text alignSelf="center">
              Page {page} of {data.total_pages}
            </Text>
            <Button
              onClick={() => setPage((prev) => Math.min(prev + 1, data.total_pages))}
              isDisabled={page === data.total_pages}
              rightIcon={<DynamicIcon name="Sort" size={20} style="default" />}
            >
              Next
            </Button>
          </Flex>
        )}
      </Box>
    </animated.div>
  );
};

export default ReviewSection;