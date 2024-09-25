import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  Input,
  IconButton,
  Tooltip,
  useColorModeValue,
  VStack,
  useDisclosure,
  Box,
  Flex,
  Collapse,
  useBreakpointValue,
  Text,
  Portal,
  useTheme,
  usePrefersReducedMotion,
  Heading,
  Divider,
  HStack,
  ScaleFade,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Keyboard, Clock, Sliders, Trash, RotateCcw } from 'lucide-react';
import { FaHistory } from 'react-icons/fa';
import VoiceSearch from './VoiceSearch';
import VirtualKeyboard from './VirtualKeyboard';
import { useInView } from 'react-intersection-observer';

interface SearchInputProps {
  onSearchChange: (term: string) => void;
  onClose: () => void;
  recentSearches: string[];
  onRecentSearchSelect: (term: string) => void;
  onHistoryDelete: (term: string) => void;
  onHistoryClear: () => void;
  isLoading: boolean;
}

const MotionBox = motion(Box as any);
const MotionFlex = motion(Flex as any);

const SearchInput: React.FC<SearchInputProps> = ({
  onSearchChange,
  onClose,
  recentSearches,
  onRecentSearchSelect,
  onHistoryDelete,
  onHistoryClear,
  isLoading,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);

  const { isOpen: isKeyboardOpen, onToggle: toggleKeyboard, onClose: closeKeyboard } = useDisclosure();
  const { isOpen: isHistoryOpen, onToggle: toggleHistory, onClose: closeHistory } = useDisclosure();
  const { isOpen: isFilterOpen, onToggle: toggleFilter } = useDisclosure();
  const { isOpen: isUndoVisible, onOpen: showUndo, onClose: hideUndo } = useDisclosure();

  const theme = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();

  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(26, 32, 44, 0.1)');
  const textColor = useColorModeValue('gray.800', 'white');
  const placeholderColor = useColorModeValue('gray.500', 'gray.400');
  const accentColor = theme.colors.blue[500];

  const glassMorphism = {
    backdropFilter: 'blur(16px)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: 'xl',
    background: `linear-gradient(135deg, ${bgColor}, rgba(255, 255, 255, 0.05))`,
  };

  const isMobile = useBreakpointValue({ base: true, md: false });
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const inputFontSize = useBreakpointValue({ base: 'md', md: 'lg' });

  const inputRef = useRef<HTMLInputElement>(null);
  const [deletedTerms, setDeletedTerms] = useState<string[]>([]);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  useEffect(() => {
    if (isListening && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isListening]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onSearchChange(newValue);
  }, [onSearchChange]);

  const handleHistorySelect = useCallback((term: string) => {
    setInputValue(term);
    onSearchChange(term);
    onRecentSearchSelect(term);
    closeHistory();
  }, [onSearchChange, onRecentSearchSelect, closeHistory]);

  const handleKeyPress = useCallback((key: string) => {
    if (key === 'Enter') {
      onSearchChange(inputValue);
    } else {
      const newValue = inputValue + key;
      setInputValue(newValue);
      onSearchChange(newValue);
    }
  }, [inputValue, onSearchChange]);

  const handleDelete = useCallback((term: string) => {
    setDeletedTerms(prev => [...prev, term]);
    onHistoryDelete(term);
    showUndo();

    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    undoTimeoutRef.current = setTimeout(() => {
      hideUndo();
      setDeletedTerms([]);
    }, 5000);
  }, [onHistoryDelete, showUndo, hideUndo]);

  const handleUndo = useCallback(() => {
    if (deletedTerms.length > 0) {
      const lastDeletedTerm = deletedTerms[deletedTerms.length - 1];
      handleHistorySelect(lastDeletedTerm);
      setDeletedTerms(prev => prev.slice(0, -1));
      if (deletedTerms.length === 1) {
        hideUndo();
      }
    }
  }, [deletedTerms, handleHistorySelect, hideUndo]);

  const handleVoiceSearch = useCallback((transcript: string) => {
    setInputValue(transcript);
    onSearchChange(transcript);
    setIsListening(false);
  }, [onSearchChange]);

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <VStack spacing={4} width="100%">
      <Flex
        width="100%"
        direction={isMobile ? 'column' : 'row'}
        alignItems="center"
        {...glassMorphism}
        p={4}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="-50%"
          left="-50%"
          width="200%"
          height="200%"
          background="radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)"
          pointerEvents="none"
          opacity={0.5}
          animation={prefersReducedMotion ? undefined : "pulse 15s infinite"}
        />
        <Flex flex={1} alignItems="center" position="relative">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Search for movies, TV shows, and more..."
            size={isMobile ? 'md' : 'lg'}
            variant="unstyled"
            color={textColor}
            _placeholder={{ color: placeholderColor }}
            fontSize={inputFontSize}
            px={4}
            mr={2}
            transition="all 0.3s ease-in-out"
            _focus={{
              boxShadow: `0 0 0 2px ${accentColor}`,
              borderRadius: 'md',
            }}
            aria-label="Search input"
          />
        </Flex>
        <Flex mt={isMobile ? 4 : 0} justifyContent="flex-end" alignItems="center">
          <VoiceSearch
            isListening={isListening}
            onVoiceSearch={handleVoiceSearch}
            size={buttonSize}
          />
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Tooltip label="Search" hasArrow>
              <IconButton
                aria-label="Search"
                icon={<Search />}
                onClick={() => onSearchChange(inputValue)}
                isLoading={isLoading}
                size={buttonSize}
                variant="ghost"
                ml={2}
                _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
                transition="all 0.3s ease-in-out"
              />
            </Tooltip>
          </motion.div>
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Tooltip label={isKeyboardOpen ? "Close Keyboard" : "Virtual Keyboard"} hasArrow>
              <IconButton
                aria-label="Virtual Keyboard"
                icon={<Keyboard />}
                onClick={toggleKeyboard}
                color={isKeyboardOpen ? accentColor : undefined}
                size={buttonSize}
                variant="ghost"
                ml={2}
                _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
                transition="all 0.3s ease-in-out"
              />
            </Tooltip>
          </motion.div>
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Tooltip label="Search History" hasArrow>
              <IconButton
                aria-label="Search History"
                icon={<Clock />}
                onClick={toggleHistory}
                color={isHistoryOpen ? accentColor : undefined}
                size={buttonSize}
                variant="ghost"
                ml={2}
                _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
                transition="all 0.3s ease-in-out"
              />
            </Tooltip>
          </motion.div>
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Tooltip label="Filters" hasArrow>
              <IconButton
                aria-label="Filters"
                icon={<Sliders />}
                onClick={toggleFilter}
                color={isFilterOpen ? accentColor : undefined}
                size={buttonSize}
                variant="ghost"
                ml={2}
                _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
                transition="all 0.3s ease-in-out"
              />
            </Tooltip>
          </motion.div>
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Tooltip label="Close" hasArrow>
              <IconButton
                aria-label="Close search"
                icon={<X />}
                onClick={onClose}
                size={buttonSize}
                variant="ghost"
                ml={2}
                _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
                transition="all 0.3s ease-in-out"
              />
            </Tooltip>
          </motion.div>
        </Flex>
      </Flex>

      <Collapse in={isFilterOpen} animateOpacity>
        <Box width="100%" p={4} {...glassMorphism}>
          {/* Add filter options here */}
          Filter options (to be implemented)
        </Box>
      </Collapse>

      <Collapse in={isKeyboardOpen} animateOpacity>
        <Box width="100%">
          <VirtualKeyboard onKeyPress={handleKeyPress} onClose={closeKeyboard} />
        </Box>
      </Collapse>

      <Collapse in={isHistoryOpen} animateOpacity>
        <VStack ref={ref} align="stretch" spacing={4} {...glassMorphism} p={6} position="relative" overflow="hidden">
          <Box
            position="absolute"
            top="-50%"
            left="-50%"
            width="200%"
            height="200%"
            background="radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)"
            pointerEvents="none"
            opacity={0.5}
            animation={prefersReducedMotion ? undefined : "pulse 15s infinite"}
          />
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
                onClick={onHistoryClear}
              />
            </Tooltip>
          </Flex>
          <Divider />
          <AnimatePresence>
            {inView && (
              <MotionFlex
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                flexWrap="wrap"
                gap={3}
              >
                {recentSearches.map((term) => (
                  <MotionBox
                    key={term}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    layout
                  >
                    <Tooltip label={`Search "${term}"`}>
                      <Box
                        position="relative"
                        px={4}
                        py={2}
                        borderRadius="full"
                        bg={useColorModeValue('rgba(0, 0, 0, 0.05)', 'rgba(255, 255, 255, 0.05)')}
                        color={textColor}
                        fontSize="sm"
                        cursor="pointer"
                        onClick={() => handleHistorySelect(term)}
                        _hover={{ bg: 'rgba(255, 255, 255, 0.1)', boxShadow: `0 0 0 2px ${accentColor}` }}
                        transition="all 0.2s"
                      >
                        <HStack spacing={2}>
                          <FaHistory />
                          <Text>{term}</Text>
                        </HStack>
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
                            handleDelete(term);
                          }}
                          opacity={0}
                          _groupHover={{ opacity: 1 }}
                          transition="opacity 0.2s"
                        />
                      </Box>
                    </Tooltip>
                  </MotionBox>
                ))}
              </MotionFlex>
            )}
          </AnimatePresence>
        </VStack>
      </Collapse>

      <Portal>
        <ScaleFade in={isUndoVisible} unmountOnExit>
          <Box
            position="fixed"
            bottom={4}
            left="50%"
            transform="translateX(-50%)"
            {...glassMorphism}
            p={4}
            zIndex={9999}
          >
            <HStack spacing={4}>
              <Text color={textColor}>Term deleted</Text>
              <IconButton
                aria-label="Undo delete"
                icon={<RotateCcw />}
                size="sm"
                colorScheme="blue"
                onClick={handleUndo}
              />
            </HStack>
          </Box>
        </ScaleFade>
      </Portal>
    </VStack>
  );
};

export default SearchInput;