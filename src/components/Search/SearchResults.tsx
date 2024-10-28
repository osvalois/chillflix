import React, { useMemo } from 'react';
import {
  VStack,
  Text,
  Button,
  Spinner,
  useColorModeValue,
  Box,
  Grid,
  Container,
  Fade,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaSearch, FaExclamationCircle } from 'react-icons/fa';
import MovieCard from '../Movie/MovieCard';

// Tipos mejorados
interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  overview: string;
  media_type: 'movie' | 'tv';
  genres?: { id: number; name: string }[];
  runtime?: number;
  status?: string;
}

interface SearchResultsProps {
  content: Movie[];
  isLoading: boolean;
  isError: boolean | null;
  errorMessage?: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
  onSelectMovie: (movie: Movie) => void;
  onAddToFavorites: (movie: Movie) => void;
  favorites?: Set<number>;
}

const MotionBox = motion(Box as any);
const MotionGrid = motion(Grid as any);

const SearchResults: React.FC<SearchResultsProps> = React.memo(({
  content,
  isLoading,
  isError,
  errorMessage,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
  onSelectMovie,
  onAddToFavorites,
  favorites = new Set(),
}) => {
  // Referencias para el scroll infinito
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Colores del tema
  const colors = useMemo(() => ({
    bg: useColorModeValue('gray.50', 'gray.900'),
    text: useColorModeValue('gray.800', 'gray.100'),
    error: useColorModeValue('red.500', 'red.300'),
    card: useColorModeValue('white', 'gray.800'),
    border: useColorModeValue('gray.200', 'gray.700'),
  }), []);

  // Cargar más resultados automáticamente cuando el usuario llega al final
  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !isLoading) {
      onFetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, isLoading, onFetchNextPage]);

  // Renderizar error
  if (isError) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          bg={colors.card}
          borderRadius="lg"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Error al cargar los resultados
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            {errorMessage || 'Ha ocurrido un error. Por favor, intenta nuevamente.'}
          </AlertDescription>
          <Button
            mt={4}
            colorScheme="red"
            leftIcon={<FaExclamationCircle />}
            onClick={() => window.location.reload()}
          >
            Reintentar
          </Button>
        </Alert>
      </Container>
    );
  }

  // Renderizar estado vacío
  if (content.length === 0 && !isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack
          spacing={4}
          align="center"
          justify="center"
          minHeight="400px"
          bg={colors.card}
          borderRadius="lg"
          p={8}
          border="1px solid"
          borderColor={colors.border}
        >
          <Box
            as={FaSearch}
            size="64px"
            color={colors.text}
            opacity={0.3}
          />
          <Text
            color={colors.text}
            fontSize="xl"
            fontWeight="bold"
            textAlign="center"
          >
            No se encontraron resultados
          </Text>
          <Text
            color={colors.text}
            opacity={0.7}
            textAlign="center"
          >
            Intenta con otros términos de búsqueda
          </Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <AnimatePresence mode="wait">
        <MotionGrid
          templateColumns={[
            "repeat(1, 1fr)",
            "repeat(2, 1fr)",
            "repeat(3, 1fr)",
            "repeat(4, 1fr)",
            "repeat(5, 1fr)"
          ]}
          gap={6}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {content.map((movie, index) => (
            <MotionBox
              key={`${movie.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.05 // Efecto escalonado
              }}
            >
              <Fade in={true} delay={0.1 * index}>
                <Box
                  height="100%"
                  transition="all 0.2s"
                  _hover={{ transform: 'translateY(-4px)' }}
                >
                  <MovieCard
                    movie={movie}
                    onSelect={onSelectMovie}
                    onAddToFavorites={onAddToFavorites}
                    isFavorite={favorites.has(movie.id)}
                    isLoading={isLoading}
                  />
                </Box>
              </Fade>
            </MotionBox>
          ))}
        </MotionGrid>
      </AnimatePresence>

      {/* Loading states */}
      {isLoading && (
        <VStack spacing={4} mt={8}>
          <Spinner
            size="xl"
            color="blue.500"
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
          />
          <Text color={colors.text}>Cargando resultados...</Text>
        </VStack>
      )}

      {/* Infinite scroll trigger */}
      {hasNextPage && !isLoading && (
        <Box ref={loadMoreRef} py={8} textAlign="center">
          <Button
            onClick={onFetchNextPage}
            isLoading={isFetchingNextPage}
            loadingText="Cargando más resultados..."
            colorScheme="blue"
            variant="outline"
            size="lg"
            width={["100%", "auto"]}
            _hover={{
              transform: 'translateY(-2px)',
              shadow: 'md'
            }}
          >
            Cargar más resultados
          </Button>
        </Box>
      )}
    </Container>
  );
});

SearchResults.displayName = 'SearchResults';

export default SearchResults;