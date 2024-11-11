import React, { useState, useCallback } from 'react';
import {
  HStack,
  Text,
  Box,
  Tooltip,
  useColorModeValue,
  VStack,
  IconButton,
  useTheme,
  useBreakpointValue,
  Flex,
  Collapse,
  ScaleFade,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamicIcon } from '../Movie/Icons';
interface SearchHistoryProps {
  searchHistory: string[];
  onHistorySelect: (term: string) => void;
  onHistoryDelete: (term: string) => void;
  onClearAllHistory: () => void;
}

const MotionBox = motion(Box as any);
const MotionFlex = motion(Flex as any);

const SearchHistory: React.FC<SearchHistoryProps> = ({
  searchHistory,
  onHistorySelect,
  onHistoryDelete,
  onClearAllHistory,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const theme = useTheme();
  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(26, 32, 44, 0.1)');
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverBgColor = useColorModeValue('rgba(66, 153, 225, 0.1)', 'rgba(66, 153, 225, 0.2)');
  const borderColor = useColorModeValue('rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)');

  const isMobile = useBreakpointValue({ base: true, md: false });

  const glassStyle = {
    backdropFilter: 'blur(16px)',
    backgroundColor: bgColor,
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    border: `1px solid ${borderColor}`,
    borderRadius: 'xl',
  };

  const handleMouseEnter = useCallback((index: number) => {
    setHoveredIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  if (searchHistory.length === 0) return null;

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <VStack align="stretch" spacing={4} {...glassStyle} p={6} mt={4} position="relative">
      <Flex justifyContent="space-between" alignItems="center">
        <Text fontSize="lg" fontWeight="bold" color={textColor}>
          Recent Searches
        </Text>
        <HStack>
          <Tooltip label={isExpanded ? "Collapse" : "Expand"} placement="top">
            <IconButton
              aria-label={isExpanded ? "Collapse search history" : "Expand search history"}
              icon={isExpanded ? <DynamicIcon name="Search" color="black" size={16} />:<DynamicIcon name="History" color="black" size={16} />}
              onClick={toggleExpand}
              variant="ghost"
              colorScheme="blue"
              size="sm"
            />
          </Tooltip>
          <Tooltip label="Clear all history" placement="top">
            <IconButton
              aria-label="Clear all search history"
              icon={<DynamicIcon name="Trash" color="black" size={16} />}
              onClick={onClearAllHistory}
              variant="ghost"
              colorScheme="red"
              size="sm"
            />
          </Tooltip>
        </HStack>
      </Flex>
      <Collapse in={isExpanded} animateOpacity>
        <MotionFlex
          layout
          direction={isMobile ? "column" : "row"}
          flexWrap="wrap"
          justifyContent="flex-start"
          alignItems="flex-start"
          overflowY="auto"
          maxHeight="300px"
          py={2}
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.colors.gray[300],
              borderRadius: '24px',
            },
          }}
        >
          <AnimatePresence>
            {searchHistory.map((term, index) => (
              <MotionBox
                key={term}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                mr={2}
                mb={2}
              >
                <Tooltip label={`Search for "${term}"`} placement="top">
                  <Box
                    position="relative"
                    px={4}
                    py={2}
                    borderRadius="full"
                    bg={hoveredIndex === index ? hoverBgColor : 'transparent'}
                    color={textColor}
                    fontSize="sm"
                    fontWeight="medium"
                    cursor="pointer"
                    onClick={() => onHistorySelect(term)}
                    transition="all 0.3s"
                    boxShadow={hoveredIndex === index ? `0 0 0 1px ${theme.colors.blue[300]}` : 'none'}
                  >
                    <HStack spacing={2}>
                    <DynamicIcon name="History" color="black" size={16} />
                      <Text>{term}</Text>
                    </HStack>
                    <ScaleFade in={hoveredIndex === index}>
                      <IconButton
                        aria-label="Delete search term"
                        icon={<DynamicIcon name="Times" color="black" size={16} />}
                        size="xs"
                        position="absolute"
                        right={-2}
                        top={-2}
                        colorScheme="red"
                        rounded="full"
                        onClick={(e) => {
                          e.stopPropagation();
                          onHistoryDelete(term);
                        }}
                      />
                    </ScaleFade>
                  </Box>
                </Tooltip>
              </MotionBox>
            ))}
          </AnimatePresence>
        </MotionFlex>
      </Collapse>
    </VStack>
  );
};

export default SearchHistory;