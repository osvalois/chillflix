import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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
  useTheme,
  chakra,
  SimpleGrid,
  Spinner,
  useDisclosure,
  Fade,
  useColorMode,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { animated } from 'react-spring';
import { useInView } from 'react-intersection-observer';
import { Film, Tv, Moon, Sun, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import SearchInput from './SearchInput';
import tmdbService from '../../services/tmdbService';
import { CombinedContent, SearchModalProps } from '../../types';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const AnimatedBox = chakra(animated(Box));
const MotionBox = motion(Box as any);

const ITEMS_PER_PAGE = 20;
const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  searchHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [results, setResults] = useState<CombinedContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [trendingContent, setTrendingContent] = useState<CombinedContent[]>([]);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  // Theme-aware styles
  const theme = useTheme();
  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(26, 32, 44, 0.1)');
  const textColor = useColorModeValue('gray.800', 'white');
  const cardBgColor = useColorModeValue('rgba(255, 255, 255, 0.7)', 'rgba(26, 32, 44, 0.7)');
  const accentColor = theme.colors.blue[500];
  
  const glassEffect = useMemo(() => ({
    backdropFilter: 'blur(16px)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: 'xl',
    background: `linear-gradient(135deg, ${bgColor}, rgba(255, 255, 255, 0.05))`,
  }), [bgColor]);

  // Infinite scroll setup
  const [ref, inView] = useInView({
    threshold: 0.1,
    rootMargin: '100px',
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
    if (term.trim() === '') {
      setResults([]);
      hideResults();
      return;
    }
  }, [hideResults]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedSearchTerm.trim()) return;

      setIsLoading(true);
      setIsError(false);
      setPage(1);

      try {
        const newResults = await tmdbService.searchAllContent(debouncedSearchTerm, 1);
        setResults(newResults);
        setHasNextPage(newResults.length === ITEMS_PER_PAGE);
        showResults();
      } catch (error) {
        console.error('Error fetching search results:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearchTerm, showResults]);

  const handleFetchNextPage = useCallback(async () => {
    if (hasNextPage && !isLoading && debouncedSearchTerm) {
      setIsLoading(true);
      try {
        const nextPage = page + 1;
        const newResults = await tmdbService.searchAllContent(debouncedSearchTerm, nextPage);
        setResults(prev => [...prev, ...newResults]);
        setHasNextPage(newResults.length === ITEMS_PER_PAGE);
        setPage(nextPage);
      } catch (error) {
        console.error('Error fetching next page:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [hasNextPage, isLoading, page, debouncedSearchTerm]);

  useEffect(() => {
    if (inView && !isLoading) {
      handleFetchNextPage();
    }
  }, [inView, handleFetchNextPage, isLoading]);

  const handleContentSelect = useCallback((content: CombinedContent) => {
    navigate(`/${content.media_type}/${content.id}`);
    onClose();
  }, [navigate, onClose]);

  const ContentCard: React.FC<{ content: CombinedContent }> = useCallback(({ content }) => (
    <MotionBox
      whileHover={{ scale: 1.05, zIndex: 1 }}
      whileTap={{ scale: 0.95 }}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Box
        overflow="hidden"
        cursor="pointer"
        onClick={() => handleContentSelect(content)}
        bg={cardBgColor}
        transition="all 0.3s"
        position="relative"
        {...glassEffect}
      >
        <Box position="relative">
          <LazyLoadImage
            src={`https://image.tmdb.org/t/p/w500${content.poster_path}`}
            alt={content.title || content.name}
            effect="blur"
            width="100%"
            height="auto"
            style={{ objectFit: 'cover' }}
            placeholder={
              <Box bg="gray.200" width="100%" paddingBottom="150%" />
            }
          />
          <Tooltip label={content.media_type === 'movie' ? 'Movie' : 'TV Series'}>
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
          </Tooltip>
        </Box>
        <Box p={3}>
          <Text fontSize="sm" fontWeight="bold" isTruncated>
            {content.title || content.name || "Untitled"}
          </Text>
          <Text fontSize="xs" color={textColor} opacity={0.8}>
            {content.release_date || content.first_air_date} • {content.vote_average.toFixed(1)}⭐
          </Text>
        </Box>
      </Box>
    </MotionBox>
  ), [cardBgColor, glassEffect, handleContentSelect, textColor]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal 
          isOpen={isOpen} 
          onClose={onClose} 
          size="full" 
          motionPreset="scale"
          scrollBehavior="inside"
        >
          <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(10px)" />
          <ModalContent
            as={AnimatedBox}
            
            {...glassEffect}
            maxWidth="100%"
            height="100vh"
            m={0}
          >
            <ModalBody p={0}>
              <Flex direction="column" height="100%">
                <Box 
                  p={4} 
                  {...glassEffect} 
                  position="sticky" 
                  top={0} 
                  zIndex={1}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <SearchInput
                    onSearchChange={handleSearchChange}
                    onClose={onClose}
                    recentSearches={searchHistory}
                    onRecentSearchSelect={handleSearchChange}
                    isLoading={isLoading}
                    onHistoryDelete={() => {}}
                    onHistoryClear={() => {}}
                  />
                  <IconButton
                    aria-label="Toggle color mode"
                    icon={colorMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    onClick={toggleColorMode}
                    variant="ghost"
                    ml={2}
                  />
                </Box>
                
                <Box 
                  flex={1} 
                  overflowY="auto" 
                  p={4} 
                  ref={scrollContainerRef}
                >
                  <Fade in={isResultsVisible}>
                    <VStack spacing={4} align="stretch">
                      {searchTerm && (
                        <Text fontSize="2xl" fontWeight="bold">
                          Search Results
                        </Text>
                      )}
                      
                      {!searchTerm && trendingContent.length > 0 && (
                        <>
                          <Text fontSize="2xl" fontWeight="bold">
                            Trending Now
                          </Text>
                          <SimpleGrid 
                            columns={{ base: 2, md: 3, lg: 4, xl: 5 }} 
                            spacing={4}
                          >
                            {trendingContent.map((item, index) => (
                              <ContentCard key={`trending-${item.id}-${index}`} content={item} />
                            ))}
                          </SimpleGrid>
                        </>
                      )}

                      {searchTerm && (
                        <SimpleGrid 
                          columns={{ base: 2, md: 3, lg: 4, xl: 5 }} 
                          spacing={4} 
                          ref={ref}
                        >
                          <AnimatePresence>
                            {results.map((item, index) => (
                              <ContentCard key={`${item.id}-${index}`} content={item} />
                            ))}
                          </AnimatePresence>
                        </SimpleGrid>
                      )}

                      {isLoading && (
                        <Flex justify="center" py={4}>
                          <Spinner size="xl" color={accentColor} />
                        </Flex>
                      )}

                      {isError && (
                        <Flex 
                          justify="center" 
                          align="center" 
                          py={4} 
                          color="red.500"
                        >
                          <AlertCircle size={24} />
                          <Text ml={2}>
                            Error fetching results. Please try again.
                          </Text>
                        </Flex>
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