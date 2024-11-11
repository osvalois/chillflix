import React, { useCallback, useState, useRef, useEffect, memo, useMemo } from 'react';
import { Input, IconButton, Box, Flex } from '@chakra-ui/react';
import { Search, X, Keyboard } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import dynamic from 'next/dynamic';

// Lazy load heavy components
const VirtualKeyboard = dynamic(() => import('./VirtualKeyboard'), {
  loading: () => <Box p={4}>Loading keyboard...</Box>,
  ssr: false
});


// Extract interfaces
interface SearchInputProps {
  onSearchChange: (term: string) => void;
  onClose: () => void;
  recentSearches: string[];
  onRecentSearchSelect: (term: string) => void;
  onHistoryDelete: (term: string) => void;
  onHistoryClear: () => void;
  isLoading: boolean;
}

// Extracted reusable styles
const glassStyles = {
  backdropFilter: 'blur(16px)',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  borderRadius: 'xl',
  bg: 'rgba(255, 255, 255, 0.1)',
} as const;

// Memoized button component
const SearchButton = memo(({ onClick, icon, label, isLoading }: any) => (
  <IconButton
    aria-label={label}
    icon={icon}
    onClick={onClick}
    isLoading={isLoading}
    size="md"
    variant="ghost"
    ml={2}
    sx={{
      transition: 'transform 0.2s',
      _hover: { transform: 'scale(1.05)' }
    }}
  />
));

// Main component with performance optimizations
const SearchInput: React.FC<SearchInputProps> = ({
  onSearchChange,
  onClose,
  isLoading,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Intersection observer for lazy loading
  const [ref, inView] = useInView({
    threshold: 0,
    triggerOnce: true
  });

  // Debounced search handler
  const debouncedSearch = useCallback((value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 300);
  }, [onSearchChange]);

  // Memoized handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    debouncedSearch(newValue);
  }, [debouncedSearch]);
  // Keyboard event optimization
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Memoized UI elements
  const searchButtons = useMemo(() => (
    <Flex>
      <SearchButton
        icon={<Search />}
        label="Search"
        onClick={() => onSearchChange(inputValue)}
        isLoading={isLoading}
      />
      <SearchButton
        icon={<Keyboard />}
        label="Virtual Keyboard"
        onClick={() => setIsKeyboardOpen(prev => !prev)}
      />
      <SearchButton
        icon={<X />}
        label="Close"
        onClick={onClose}
      />
    </Flex>
  ), [inputValue, isLoading, onClose, onSearchChange]);

  return (
    <Box ref={ref} width="100%">
      <Flex
        sx={glassStyles}
        p={4}
        position="relative"
        align="center"
      >
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Search..."
          variant="unstyled"
          px={4}
          sx={{
            transition: 'box-shadow 0.2s',
            _focus: { boxShadow: '0 0 0 2px blue.500' }
          }}
        />
        {searchButtons}
      </Flex>

      {isKeyboardOpen && inView && (
        <VirtualKeyboard
          onKeyPress={(key) => setInputValue(prev => prev + key)}
          onClose={() => setIsKeyboardOpen(false)}
        />
      )}

    </Box>
  );
};

// Export memoized component
export default memo(SearchInput);