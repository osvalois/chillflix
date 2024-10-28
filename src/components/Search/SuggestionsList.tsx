import React from 'react';
import { List, ListItem, HStack, VStack, Text, useColorModeValue } from '@chakra-ui/react';
import { FaFilm, FaTv } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { ContentType, SearchResult } from '../../types';
import GlassmorphicBox from '../UI/GlassmorphicBox';

interface SuggestionsListProps {
  suggestions: SearchResult[];
  getMenuProps: () => any;
  getItemProps: (options: any) => any;
  highlightedIndex: number;
}

export const SuggestionsList: React.FC<SuggestionsListProps> = ({
  suggestions,
  getMenuProps,
  getItemProps,
  highlightedIndex,
}) => {
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{ width: '100%' }}
    >
      <GlassmorphicBox>
        <List
          {...getMenuProps()}
          spacing={2}
          p={2}
        >
          {suggestions.map((item, index) => (
            <ListItem
              key={`${item.id}${index}`}
              {...getItemProps({ item, index })}
            >
              <GlassmorphicBox
                isActive={highlightedIndex === index}
              >
                <HStack>
                  {item.media_type === ContentType.Movie ? <FaFilm /> : <FaTv />}
                  <VStack align="start" spacing={0}>
                    <Text color={textColor} fontWeight="medium">{item.title || item.name}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {item.media_type === ContentType.Movie ? 'Movie' : 'TV Series'}
                      {item.release_date && ` • ${new Date(item.release_date).getFullYear()}`}
                    </Text>
                  </VStack>
                </HStack>
              </GlassmorphicBox>
            </ListItem>
          ))}
        </List>
      </GlassmorphicBox>
    </motion.div>
  );
};