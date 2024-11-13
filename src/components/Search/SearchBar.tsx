import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from 'react-query';
import debounce from 'lodash/debounce';
import {
  Box,
  useColorModeValue,
  useDisclosure,
  Tooltip,
  Portal,
  useToast,
  Button,
  chakra,
} from '@chakra-ui/react';
import tmdbService from '../../services/tmdbService';
import SearchModal from './SearchModal';
import { CombinedContent, ContentType } from '../../types';
import { DynamicIcon } from '../Movie/Icons';

// Componente optimizado para el botón de atajo de teclado
const KeyboardShortcutButton = React.memo(() => {
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');

  return (
    <Tooltip label="Atajo de teclado: Ctrl + /" placement="bottom">
      <Button
        leftIcon={<DynamicIcon name="Keyboard" size={20} style="default" />}
        size="sm"
        variant="ghost"
        display={{ base: 'none', md: 'flex' }}
        alignItems="center"
        color={textColor}
        _hover={{ bg: bgColor }}
        aria-label="Keyboard shortcut"
      >
        Ctrl + /
      </Button>
    </Tooltip>
  );
});

KeyboardShortcutButton.displayName = 'KeyboardShortcutButton';

// Componente para el botón de búsqueda
const SearchButton = React.memo(({ onClick, hoverBgColor }: { 
  onClick: () => void;
  hoverBgColor: string;
}) => (
  <Tooltip label="Buscar (Ctrl + /)" placement="bottom">
    <chakra.button
      aria-label="Search"
      onClick={onClick}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={2}
      borderRadius="full"
      bg="transparent"
      transition="all 0.2s"
      _hover={{ bg: hoverBgColor, transform: 'scale(1.05)' }}
    >
      <DynamicIcon name="Search" size={20} style="default" />
    </chakra.button>
  </Tooltip>
));

SearchButton.displayName = 'SearchButton';

// Hook personalizado para el historial de búsqueda
const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  const updateSearchHistory = useCallback((term: string) => {
    if (term && !searchHistory.includes(term)) {
      const newHistory = [term, ...searchHistory].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  }, [searchHistory]);

  return { searchHistory, updateSearchHistory };
};

// Hook personalizado para la búsqueda
const useSearch = (isOpen: boolean, onError: () => void) => {
  const [searchTerm, setSearchTerm] = useState('');

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
      onError,
    }
  );

  const allContent: CombinedContent[] = useMemo(() => 
    data
      ? data.pages.flatMap(page =>
          page.map(content => ({
            ...content,
            primary_color: '#000000',
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

  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      setSearchTerm(term);
      if (term.length >= 2) {
        refetch();
      }
    }, 300),
    [refetch]
  );

  return {
    searchTerm,
    allContent,
    debouncedSearch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  };
};

// Componente principal SearchBar
const SearchBar: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const hoverBgColor = useColorModeValue('gray.100', 'gray.700');

  const { searchHistory, updateSearchHistory } = useSearchHistory();

  const handleError = useCallback(() => {
    toast({
      title: "Error de búsqueda",
      description: "No se pudieron cargar los resultados. Por favor, intenta de nuevo.",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  }, [toast]);

  const {
    searchTerm,
    allContent,
    debouncedSearch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useSearch(isOpen, handleError);

  const handleSearchChange = useCallback((term: string) => {
    debouncedSearch(term);
  }, [debouncedSearch]);

  const handleContentSelect = useCallback((content: CombinedContent) => {
    const contentType = content.media_type === 'movie' ? 'movie' : 'tv';
    navigate(`/${contentType}/${content.id}`);
    onClose();
    updateSearchHistory(searchTerm);
  }, [navigate, onClose, searchTerm, updateSearchHistory]);

  const handleHistorySelect = useCallback((term: string) => {
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
    <Box display="flex" alignItems="center" gap={2}>
      <SearchButton onClick={onOpen} hoverBgColor={hoverBgColor} />
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
    </Box>
  );
};

export default React.memo(SearchBar);