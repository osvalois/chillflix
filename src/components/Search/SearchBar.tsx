import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from 'react-query';
import debounce from 'lodash/debounce';
import {
  IconButton,
  useColorModeValue,
  useDisclosure,
  Tooltip,
  Portal,
  useToast,
  Button,
  Icon,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { FaKeyboard } from 'react-icons/fa';
import tmdbService from '../../services/tmdbService';
import SearchModal from './SearchModal';
import { CombinedContent, ContentType } from '../../types';

const KeyboardShortcutButton: React.FC = () => {
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');

  return (
    <Tooltip label="Atajo de teclado: Ctrl + /" placement="bottom">
      <Button
        leftIcon={<Icon as={FaKeyboard} />}
        size="sm"
        variant="ghost"
        display={{ base: 'none', md: 'flex' }}
        alignItems="center"
        color={textColor}
        _hover={{ bg: bgColor }}
      >
        Ctrl + /
      </Button>
    </Tooltip>
  );
};

const SearchBar: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const hoverBgColor = useColorModeValue('gray.100', 'gray.700');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery(
    ['searchMovies', searchTerm],
    ({ pageParam = 1 }) => tmdbService.searchTMDBContent(searchTerm, pageParam),
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.length === 0) return undefined;
        return pages.length + 1;
      },
      enabled: searchTerm.length >= 2 && isOpen,
      retry: 3,
      onError: () => {
        toast({
          title: "Error de búsqueda",
          description: "No se pudieron cargar los resultados. Por favor, intenta de nuevo.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  const allContent: CombinedContent[] = useMemo(() => 
    data
      ? data.pages.flatMap(page =>
          page.map(content => ({
            ...content,
            primary_color: '#000000', // Default primary color
            genre_ids: content.genre_ids || [],
            type: content.media_type === 'movie' ? ContentType.Movie : ContentType.TVSeries,
            year: content.release_date 
              ? new Date(content.release_date).getFullYear()
              : content.first_air_date
                ? new Date(content.first_air_date).getFullYear()
                : 0,
            backdrop_blurhash: undefined,
            videos: content.videos || { results: [] },
            genres: content.genres || [],
            original_language: content.original_language || 'en',
            vote_count: content.vote_count || 0,
            homepage: content.homepage || '',
            popularity: content.popularity || 0,
          }))
        )
      : [],
    [data]
  );

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
      if (term.length >= 2) {
        refetch();
      }
    }, 300),
    [refetch]
  );

  const handleSearchChange = useCallback((term: string) => {
    debouncedSearch(term);
  }, [debouncedSearch]);

  const handleContentSelect = useCallback((content: CombinedContent) => {
    const contentType = content.media_type === 'movie' ? 'movie' : 'tv';
    navigate(`/${contentType}/${content.id}`);
    onClose();
    updateSearchHistory(searchTerm);
  }, [navigate, onClose, searchTerm]);

  const updateSearchHistory = useCallback((term: string) => {
    if (term && !searchHistory.includes(term)) {
      const newHistory = [term, ...searchHistory].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  }, [searchHistory]);

  const handleHistorySelect = useCallback((term: string) => {
    setSearchTerm(term);
    if (inputRef.current) {
      inputRef.current.value = term;
    }
    debouncedSearch(term);
  }, [debouncedSearch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const modalProps = {
    isOpen,
    onClose,
    inputRef,
    searchTerm,
    searchHistory,
    content: allContent,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    onSearchChange: handleSearchChange,
    onContentSelect: handleContentSelect,
    onHistorySelect: handleHistorySelect,
    onFetchNextPage: fetchNextPage,
  };

  return (
    <>
      <Tooltip label="Buscar (Ctrl + /)" placement="bottom">
        <IconButton
          aria-label="Search"
          icon={<SearchIcon />}
          onClick={onOpen}
          variant="ghost"
          borderRadius="full"
          _hover={{ bg: hoverBgColor, transform: 'scale(1.05)' }}
          transition="all 0.2s"
        />
      </Tooltip>
      <AnimatePresence>
        {isOpen && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SearchModal {...modalProps} />
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
      <KeyboardShortcutButton />
    </>
  );
};

export default React.memo(SearchBar);