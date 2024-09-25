import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useColorModeValue,
  VStack,
  Box,
  Flex,
  Text,
  useBreakpointValue,
  useTheme,
  chakra,
  SimpleGrid,
  Spinner,
  useDisclosure,
  Fade,
} from '@chakra-ui/react';
import { useSpring, animated, config } from 'react-spring';
import { useInView } from 'react-intersection-observer';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';
import { Film, Tv, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchInput from './SearchInput';
import tmdbService from '../../services/tmdbService';
import { CombinedContent, SearchModalProps } from '../../types';

const AnimatedBox = chakra(animated(Box));
const MotionBox = motion(Box);

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  searchHistory,
  onHistorySelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<CombinedContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [trendingContent, setTrendingContent] = useState<CombinedContent[]>([]);

  const navigate = useNavigate();

  const theme = useTheme();
  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(26, 32, 44, 0.1)');
  const textColor = useColorModeValue('gray.800', 'white');
  const cardBgColor = useColorModeValue('rgba(255, 255, 255, 0.7)', 'rgba(26, 32, 44, 0.7)');
  const accentColor = theme.colors.blue[500];

  const isMobile = useBreakpointValue({ base: true, md: false });

  const glassEffect = useMemo(() => ({
    backdropFilter: 'blur(16px)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: 'xl',
    background: `linear-gradient(135deg, ${bgColor}, rgba(255, 255, 255, 0.05))`,
  }), [bgColor]);

  const modalAnimation = useSpring({
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'scale(1)' : 'scale(0.9)',
    config: config.gentle,
  });

  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const { isOpen: isResultsVisible, onOpen: showResults, onClose: hideResults } = useDisclosure();

  const fetchTrendingContent = useCallback(async () => {
    try {
      const trending = await tmdbService.getTrendingContent();
      setTrendingContent(trending);
    } catch (error) {
      console.error('Error fetching trending content:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchTrendingContent();
    }
  }, [isOpen, fetchTrendingContent]);

  const handleSearchChange = useCallback(async (term: string) => {
    setSearchTerm(term);
    setPage(1);
    onHistorySelect(term);

    if (term.trim() === '') {
      setResults([]);
      hideResults();
      return;
    }

    setIsLoading(true);
    setIsError(false);

    try {
      const newResults = await tmdbService.searchAllContent(term, 1);
      setResults(newResults);
      setHasNextPage(newResults.length === 20);
      showResults();
    } catch (error) {
      console.error('Error fetching search results:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [onHistorySelect, hideResults, showResults]);

  const handleFetchNextPage = useCallback(async () => {
    if (hasNextPage && !isLoading) {
      setIsLoading(true);
      try {
        const nextPage = page + 1;
        const newResults = await tmdbService.searchAllContent(searchTerm, nextPage);
        setResults(prevResults => [...prevResults, ...newResults]);
        setHasNextPage(newResults.length === 20);
        setPage(nextPage);
      } catch (error) {
        console.error('Error fetching next page:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [hasNextPage, isLoading, page, searchTerm]);

  useEffect(() => {
    if (inView) {
      handleFetchNextPage();
    }
  }, [inView, handleFetchNextPage]);

  const handleContentSelect = useCallback((content: CombinedContent) => {
    if (content.media_type === 'movie') {
      navigate(`/movie/${content.id}`);
    } else if (content.media_type === 'tv') {
      navigate(`/tv/${content.id}`);
    }
    onClose();
  }, [navigate, onClose]);

  const ContentCard: React.FC<{ content: CombinedContent }> = useCallback(({ content }) => (
    <MotionBox
      whileHover={{ scale: 1.05, zIndex: 1 }}
      whileTap={{ scale: 0.95 }}
      layout
    >
      <Box
        borderRadius="lg"
        overflow="hidden"
        cursor="pointer"
        onClick={() => handleContentSelect(content)}
        bg={cardBgColor}
        transition="all 0.3s"
        boxShadow="lg"
        position="relative"
        {...glassEffect}
      >
        <Box position="relative">
          <img
            src={`https://image.tmdb.org/t/p/w500${content.poster_path}`}
            alt={content.title || content.name}
            style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
            loading="lazy"
          />
          <Box
            position="absolute"
            top={2}
            right={2}
            bg="rgba(0,0,0,0.7)"
            color="white"
            borderRadius="full"
            p={1}
          >
            {content.media_type === 'movie' ? <Film size={16} /> : <Tv size={16} />}
          </Box>
        </Box>
        <Box p={3}>
          <Text fontSize="sm" fontWeight="bold" isTruncated>
            {content.title || content.name}
          </Text>
          <Text fontSize="xs" color={textColor} opacity={0.8}>
            {new Date(content.release_date || content.first_air_date).getFullYear()} • {content.vote_average.toFixed(1)}⭐
          </Text>
        </Box>
      </Box>
    </MotionBox>
  ), [cardBgColor, glassEffect, handleContentSelect, textColor]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose} size="full" motionPreset="scale">
          <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(10px)" />
          <ModalContent
            as={AnimatedBox}
            style={modalAnimation}
            {...glassEffect}
            maxWidth="100%"
            height="100vh"
            m={0}
          >
            <ModalBody p={0}>
              <Flex direction="column" height="100%">
                <Box p={4} {...glassEffect} position="sticky" top={0} zIndex={1}>
                  <SearchInput
                    onSearchChange={handleSearchChange}
                    onClose={onClose}
                    recentSearches={searchHistory}
                    onRecentSearchSelect={handleSearchChange}
                    isLoading={isLoading}
                  />
                </Box>
                
                <Box flex={1} overflowY="auto" p={4}>
                  <Fade in={isResultsVisible}>
                    <VStack spacing={4} align="stretch">
                      {searchTerm && <Text fontSize="2xl" fontWeight="bold">Search Results</Text>}
                      <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 5 }} spacing={4} ref={ref}>
                        <AnimatePresence>
                          {results.map((item, index) => (
                            <ContentCard key={`${item.id}-${index}`} content={item} />
                          ))}
                        </AnimatePresence>
                      </SimpleGrid>
                      {isLoading && (
                        <Flex justify="center" py={4}>
                          <Spinner size="xl" color={accentColor} />
                        </Flex>
                      )}
                      {isError && (
                        <Text textAlign="center" color="red.500">
                          Error fetching results. Please try again.
                        </Text>
                      )}
                    </VStack>
                  </Fade>
                </Box>
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default React.memo(SearchModal);