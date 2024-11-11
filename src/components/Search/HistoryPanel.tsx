import React, { memo, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  VStack,
  useColorModeValue,
  Heading,
  Divider,
  Tooltip,
  HStack,
} from '@chakra-ui/react';
import { X, Trash, Clock } from 'lucide-react';
import { useVirtual } from 'react-virtual';

interface HistoryPanelProps {
  searches: string[];
  onSelect: (term: string) => void;
  onDelete: (term: string) => void;
  onClear: () => void;
}

// Extracted reusable styles
const glassStyles = {
  backdropFilter: 'blur(16px)',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  borderRadius: 'xl',
  bg: 'rgba(255, 255, 255, 0.1)',
} as const;

// Memoized history item component
const HistoryItem = memo(({ 
  term, 
  onSelect, 
  onDelete 
}: { 
  term: string; 
  onSelect: (term: string) => void; 
  onDelete: (term: string) => void; 
}) => {
  const bgColor = useColorModeValue('rgba(0, 0, 0, 0.05)', 'rgba(255, 255, 255, 0.05)');
  const hoverBg = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)');
  
  return (
    <Box
      position="relative"
      px={4}
      py={2}
      borderRadius="full"
      bg={bgColor}
      cursor="pointer"
      onClick={() => onSelect(term)}
      role="button"
      tabIndex={0}
      _hover={{
        bg: hoverBg,
        transform: 'translateY(-1px)',
        boxShadow: 'sm',
      }}
      transition="all 0.2s"
    >
      <HStack spacing={2}>
        <Clock size={14} />
        <Text fontSize="sm" noOfLines={1}>
          {term}
        </Text>
        <IconButton
          aria-label="Delete search term"
          icon={<X size={12} />}
          size="xs"
          position="absolute"
          right={-2}
          top={-2}
          colorScheme="red"
          rounded="full"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(term);
          }}
          opacity={0}
          _groupHover={{ opacity: 1 }}
          transition="opacity 0.2s"
        />
      </HStack>
    </Box>
  );
});

const ITEM_SIZE = 40; // Height of each history item

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  searches,
  onSelect,
  onDelete,
  onClear,
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null);
  
  // Virtual list implementation for performance
  const rowVirtualizer = useVirtual({
    size: searches.length,
    parentRef,
    estimateSize: React.useCallback(() => ITEM_SIZE, []),
    overscan: 5,
  });

  const textColor = useColorModeValue('gray.800', 'white');
  
  // Memoized header component
  const headerSection = useMemo(() => (
    <>
      <Flex justifyContent="space-between" alignItems="center">
        <Heading size="md" color={textColor} fontWeight="bold">
          Recent Searches
        </Heading>
        <Tooltip label="Clear history" hasArrow>
          <IconButton
            aria-label="Clear search history"
            icon={<Trash />}
            size="sm"
            colorScheme="red"
            variant="ghost"
            onClick={onClear}
          />
        </Tooltip>
      </Flex>
      <Divider my={2} />
    </>
  ), [textColor, onClear]);

  // Early return if no searches
  if (searches.length === 0) {
    return (
      <Box {...glassStyles} p={6}>
        {headerSection}
        <Text color={textColor} textAlign="center" py={4}>
          No recent searches
        </Text>
      </Box>
    );
  }

  return (
    <Box {...glassStyles} p={6}>
      {headerSection}
      
      <VStack
        ref={parentRef}
        align="stretch"
        spacing={2}
        maxH="300px"
        overflowY="auto"
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(155, 155, 155, 0.5)',
            borderRadius: '4px',
          },
        }}
      >
        <Box
          style={{
            height: `${rowVirtualizer.totalSize}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.virtualItems.map((virtualRow) => (
            <Box
              key={virtualRow.index}
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height={`${virtualRow.size}px`}
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <HistoryItem
                term={searches[virtualRow.index]}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            </Box>
          ))}
        </Box>
      </VStack>
    </Box>
  );
};

// Performance optimization - only re-render if props change
export default memo(HistoryPanel);