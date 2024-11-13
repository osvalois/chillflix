import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  Text,
  Flex,
  Avatar,
  Button,
  Select,
  useColorModeValue,
  Spinner,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useBreakpointValue,
  Tag,
  IconButton,
} from '@chakra-ui/react';
import { useInView } from 'react-intersection-observer';
import { useSpring, animated, config } from 'react-spring';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { getMovieReviews } from '../../services/tmdbService';
import { Review } from '../../types';
import { DynamicIcon } from '../Movie/Icons';

interface ReviewSectionProps {
  movieId: string;
}

// Constantes para estilos glassmórficos y configuración
const GLASS_STYLES = {
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
};

const RESPONSIVE_CONFIG = {
  spacing: {
    base: 2,
    md: 4,
    lg: 6,
  },
  padding: {
    base: 3,
    md: 4,
    lg: 6,
  },
  fontSize: {
    title: { base: "xl", md: "2xl", lg: "3xl" },
    content: { base: "sm", md: "md" },
  },
  maxContentLength: {
    base: 150,
    sm: 200,
    md: 300,
    lg: 400,
  },
};

// Componente para el modal de review completo
const ReviewModal: React.FC<{ review: Review; isOpen: boolean; onClose: () => void }> = ({
  review,
  isOpen,
  onClose,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} size="xl" motionPreset="slideInBottom">
    <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.300" />
    <ModalContent {...GLASS_STYLES} mx={4}>
      <ModalHeader>
        <Flex alignItems="center" gap={3}>
          <Avatar 
            size="md"
            src={getAvatarSrc(review.author_details.avatar_path)} 
            name={review.author}
          />
          <Box>
            <Text fontSize="lg" fontWeight="bold">{review.author}</Text>
            <Text fontSize="sm" color="gray.500">
              {format(new Date(review.created_at), 'PPP')}
            </Text>
          </Box>
        </Flex>
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody pb={6}>
        <Text whiteSpace="pre-wrap">{review.content}</Text>
      </ModalBody>
    </ModalContent>
  </Modal>
);

// Helper para avatar
const getAvatarSrc = (avatarPath: string | null): string => {
  if (!avatarPath) return '';
  return avatarPath.startsWith('http') 
    ? avatarPath 
    : `https://image.tmdb.org/t/p/original${avatarPath}`;
};

// Componente principal
const ReviewSection: React.FC<ReviewSectionProps> = ({ movieId }) => {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'created_at' | 'rating'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue('whiteAlpha.200', 'blackAlpha.300');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const borderColor = useColorModeValue('whiteAlpha.300', 'whiteAlpha.100');

  const maxContentLength = useBreakpointValue(RESPONSIVE_CONFIG.maxContentLength) || RESPONSIVE_CONFIG.maxContentLength.base;
  
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const fadeIn = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(30px)',
    config: config.gentle,
  });

  const { data, isLoading, isError, error } = useQuery<{ results: Review[], total_pages: number }, Error>(
    ['reviews', movieId, page, sortBy, sortOrder],
    () => getMovieReviews(movieId, page),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
      retry: 2,
    }
  );

  useEffect(() => {
    setPage(1);
  }, [sortBy, sortOrder]);

  const handleSortChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSortBy, newSortOrder] = event.target.value.split('-') as ['created_at' | 'rating', 'asc' | 'desc'];
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);

  const handleReadMore = useCallback((review: Review) => {
    setSelectedReview(review);
    onOpen();
  }, [onOpen]);

  if (isError) {
    return (
      <Flex 
        justify="center" 
        align="center" 
        minH="200px"
        {...GLASS_STYLES}
        p={6}
      >
        <VStack spacing={4}>
          <DynamicIcon name="Error" size={40} style="error" />
          <Text fontSize="xl" fontWeight="medium" color="red.400">
            Error loading reviews: {error?.message}
          </Text>
          <Button 
            leftIcon={<DynamicIcon name="RefreshCcw" size={20} style="default" />}
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </VStack>
      </Flex>
    );
  }

  return (
    <animated.div ref={ref} style={fadeIn}>
      <Box 
        maxWidth={{ base: "100%", lg: "1000px" }} 
        width="100%" 
        mt={8}
        mx="auto"
        px={{ base: 4, md: 6 }}
      >
        <VStack spacing={RESPONSIVE_CONFIG.spacing} align="stretch">
          <Flex 
            justifyContent="space-between" 
            alignItems="center" 
            flexDir={{ base: "column", sm: "row" }}
            gap={4}
          >
            <Text 
              fontSize={RESPONSIVE_CONFIG.fontSize.title}
              fontWeight="bold" 
              bgGradient="linear(to-r, purple.400, pink.500)"
              bgClip="text"
            >
              Reviews
            </Text>
            
            <Select 
              onChange={handleSortChange} 
              width={{ base: "100%", sm: "auto" }}
              {...GLASS_STYLES}
              _hover={{ bg: "whiteAlpha.200" }}
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="rating-asc">Lowest Rated</option>
            </Select>
          </Flex>

          {isLoading ? (
            <Flex justify="center" align="center" height="200px">
              <Spinner size="xl" color="blue.500" thickness="4px" />
            </Flex>
          ) : (
            <AnimatePresence>
              <VStack spacing={4} align="stretch">
                {data?.results.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Box
                      p={RESPONSIVE_CONFIG.padding}
                      {...GLASS_STYLES}
                      _hover={{ 
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 30px rgba(0, 0, 0, 0.15)',
                      }}
                      transition="all 0.2s"
                    >
                      <Flex 
                        justifyContent="space-between" 
                        alignItems="flex-start"
                        flexDir={{ base: "column", sm: "row" }}
                        gap={4}
                      >
                        <Flex alignItems="center" gap={3}>
                          <Avatar 
                            size={{ base: "md", md: "lg" }}
                            src={getAvatarSrc(review.author_details.avatar_path)}
                            name={review.author}
                          />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }}>
                              {review.author}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              {format(new Date(review.created_at), 'PPP')}
                            </Text>
                          </VStack>
                        </Flex>

                        <Flex 
                          alignItems="center" 
                          gap={2}
                          ml={{ base: 0, sm: 'auto' }}
                        >
                          {review.author_details.rating && (
                            <Tag 
                              size="lg" 
                              colorScheme={review.author_details.rating >= 7 ? "green" : 
                                         review.author_details.rating >= 5 ? "yellow" : "red"}
                              {...GLASS_STYLES}
                            >
                              <DynamicIcon name="Star" size={16} style="default" />
                              <Text ml={1}>{review.author_details.rating}/10</Text>
                            </Tag>
                          )}
                          
                          <Tooltip label="Mark as helpful">
                            <IconButton
                              aria-label="Mark as helpful"
                              icon={<DynamicIcon name="ThumbsUp" size={18} style="default" />}
                              size="sm"
                              variant="ghost"
                              {...GLASS_STYLES}
                            />
                          </Tooltip>
                        </Flex>
                      </Flex>

                      <Box mt={4}>
                        <Text 
                          color={textColor}
                          fontSize={RESPONSIVE_CONFIG.fontSize.content}
                          noOfLines={4}
                        >
                          {review.content}
                        </Text>
                        {review.content.length > maxContentLength && (
                          <Button
                            variant="ghost"
                            size="sm"
                            mt={2}
                            onClick={() => handleReadMore(review)}
                            rightIcon={<DynamicIcon name="ChevronRight" size={16} style="default" />}
                            {...GLASS_STYLES}
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            Read More
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </VStack>
            </AnimatePresence>
          )}

          {data && data.total_pages > 1 && (
            <Flex 
              justifyContent="space-between" 
              mt={6}
              flexDir={{ base: "column", sm: "row" }}
              gap={4}
              align="center"
            >
              <Button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                isDisabled={page === 1}
                leftIcon={<DynamicIcon name="ChevronLeft" size={20} style="default" />}
                {...GLASS_STYLES}
                _hover={{ bg: "whiteAlpha.200" }}
              >
                Previous
              </Button>
              
              <Text fontSize={{ base: "sm", md: "md" }}>
                Page {page} of {data.total_pages}
              </Text>
              
              <Button
                onClick={() => setPage((prev) => Math.min(prev + 1, data.total_pages))}
                isDisabled={page === data.total_pages}
                rightIcon={<DynamicIcon name="ChevronRight" size={20} style="default" />}
                {...GLASS_STYLES}
                _hover={{ bg: "whiteAlpha.200" }}
              >
                Next
              </Button>
            </Flex>
          )}
        </VStack>
      </Box>

      {selectedReview && (
        <ReviewModal
          review={selectedReview}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
    </animated.div>
  );
};

export default React.memo(ReviewSection);