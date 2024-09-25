import React from 'react';
import {
  VStack,
  Text,
  Button,
  Spinner,
  useColorModeValue,
  Box,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import ContentCard from './ContentCard';
import { CombinedContent, SearchResultsProps } from '../../types';
import MovieCard from '../Movie/MovieCard';

const MotionBox = motion(Box as any);

const SearchResults: React.FC<SearchResultsProps> = ({
  content,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  onContentSelect,
  onFetchNextPage,
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const errorColor = useColorModeValue('red.500', 'red.300');

  if (isError) {
    return (
      <Text color={errorColor} fontSize="lg" textAlign="center">
        Ha ocurrido un error. Por favor, intenta nuevamente.
      </Text>
    );
  }

  return (
    <VStack spacing={4} align="stretch" bg={bgColor} p={4} borderRadius="md">
      <AnimatePresence>
        {content.map((item: CombinedContent) => (
          <MotionBox
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <MovieCard movie={item} />
          </MotionBox>
        ))}
      </AnimatePresence>

      {content.length === 0 && !isLoading && (
        <Text color={textColor} fontSize="lg" textAlign="center">
          No se encontraron resultados. Intenta con otra búsqueda.
        </Text>
      )}

      {isLoading && (
        <Box textAlign="center" py={4}>
          <Spinner size="xl" color="blue.500" />
        </Box>
      )}

      {hasNextPage && (
        <Button
          onClick={onFetchNextPage}
          isLoading={isFetchingNextPage}
          loadingText="Cargando más..."
          colorScheme="blue"
          variant="outline"
          width="100%"
        >
          Cargar más resultados
        </Button>
      )}
    </VStack>
  );
};

export default React.memo(SearchResults);