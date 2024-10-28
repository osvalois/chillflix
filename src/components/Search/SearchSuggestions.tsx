import React, { useMemo } from 'react';
import {
  VStack,
  Text,
  HStack,
  useColorModeValue,
  Box,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';
import { SearchResult } from '../../types';

interface SearchSuggestionsProps {
  suggestions: SearchResult[];
  onSuggestionClick: (suggestion: SearchResult) => void;
}

const MotionVStack = motion(VStack as any);

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ suggestions, onSuggestionClick }) => {
  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.7)', 'rgba(26, 32, 44, 0.7)');
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverBgColor = useColorModeValue('rgba(0, 0, 0, 0.05)', 'rgba(255, 255, 255, 0.05)');

  const glassStyle = useMemo(() => ({
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: 'lg',
  }), []);

  if (suggestions.length === 0) return null;

  return (
    <MotionVStack
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      spacing={1}
      width="100%"
      maxHeight="300px"
      overflowY="auto"
      {...glassStyle}
      bg={bgColor}
      p={2}
      mt={2}  // Add margin top for spacing
    >
      {suggestions.map((suggestion) => (
        <HStack
          key={suggestion.id}
          width="100%"
          p={2}
          borderRadius="md"
          _hover={{ bg: hoverBgColor }}
          cursor="pointer"
          onClick={() => onSuggestionClick(suggestion)}
          transition="background-color 0.2s"
        >
          <Box color={textColor} mr={2}>
            <Tag size={16} />
          </Box>
          <VStack align="start" spacing={0} flex={1}>
            <Text fontWeight="semibold" color={textColor} fontSize="sm">
              {suggestion.title}
            </Text>
            <Text fontSize="xs" color={textColor} opacity={0.8}>
              { suggestion.release_date } • {suggestion.vote_average.toFixed(1)}⭐
            </Text>
          </VStack>
        </HStack>
      ))}
    </MotionVStack>
  );
};

export default React.memo(SearchSuggestions);