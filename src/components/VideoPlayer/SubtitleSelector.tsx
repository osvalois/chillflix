import React, { useState, useMemo, useCallback } from 'react';
import { useMediaQuery } from 'react-responsive';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from 'react-query';
import { atom, useAtom } from 'jotai';
import { useHotkeys } from 'react-hotkeys-hook';
import { useDebounce } from 'use-debounce';
import pako from 'pako';
import { format } from 'date-fns';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Text,
  Flex,
  useToast,
  Spinner,
  useColorModeValue,
  Portal,
  Tooltip,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { Virtuoso } from 'react-virtuoso';
import { Subtitle } from '../../services/subtitle-types';
import { Subtitles, Languages, Search, X } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';

// Types
interface SubtitlePreferences {
  language: string;
  autoLoad: boolean;
  fontSize: number;
}

interface ParsedCue {
  start: number;
  end: number;
  text: string;
}

interface SubtitleSelectorProps {
  subtitles: Subtitle[] | undefined;
  selectedSubtitle: Subtitle | null;
  onSubtitleChange: (subtitle: Subtitle | null, parsedCues: ParsedCue[] | null) => void;
  initialLanguage?: string;
}

// Atoms for global state
const subtitlePreferencesAtom = atom<SubtitlePreferences>({
  language: 'en',
  autoLoad: false,
  fontSize: 16
});

// Animations
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", duration: 0.5 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 10,
    transition: { duration: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  hover: { scale: 1.02, x: 5 }
};

// SubtitleItem Component
interface SubtitleItemProps {
  subtitle: Subtitle;
  isSelected: boolean;
  isLoading: boolean;
  onSelect: (subtitle: Subtitle) => void;
}

const SubtitleItem: React.FC<SubtitleItemProps> = React.memo(({
  subtitle,
  isSelected,
  isLoading,
  onSelect
}) => {
  const hoverBg = useColorModeValue('whiteAlpha.100', 'whiteAlpha.200');

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      layout
    >
      <Button
        width="100%"
        height="auto"
        py={3}
        px={4}
        variant="ghost"
        justifyContent="space-between"
        backgroundColor={isSelected ? hoverBg : 'transparent'}
        _hover={{ bg: hoverBg }}
        onClick={() => onSelect(subtitle)}
        isDisabled={isLoading}
        position="relative"
        transition="all 0.2s"
      >
        <Flex align="center" gap={3}>
          <Box>
            <Text fontWeight="600">{subtitle.LanguageName}</Text>
            <Text fontSize="xs" color="whiteAlpha.700">
              {`${Number(subtitle.SubRating).toFixed(1)} ★ • ${
                format(new Date(subtitle.SubAddDate), 'MMM d, yyyy')
              }`}
            </Text>
          </Box>
        </Flex>

        {isSelected && !isLoading && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <Box color="green.400">
              <Languages size={20} />
            </Box>
          </motion.div>
        )}

        {isLoading && (
          <Spinner size="sm" color="blue.400" />
        )}
      </Button>
    </motion.div>
  );
});

export const SubtitleSelector: React.FC<SubtitleSelectorProps> = ({
  subtitles = [],
  selectedSubtitle,
  onSubtitleChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [preferences] = useAtom(subtitlePreferencesAtom);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const queryClient = useQueryClient();
  const toast = useToast();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Theme
  const bgColor = useColorModeValue('rgba(0, 0, 0, 0.95)', 'rgba(0, 0, 0, 0.98)');
  const borderColor = useColorModeValue('whiteAlpha.200', 'whiteAlpha.100');

  // Keyboard shortcuts
  useHotkeys('ctrl+shift+s', () => setIsOpen(true), []);
  useHotkeys('esc', () => setIsOpen(false), [isOpen]);

  // Optimized subtitle processing
  const filteredSubtitles = useMemo(() => {
    if (!Array.isArray(subtitles)) return [];

    return subtitles
      .filter(subtitle => (
        subtitle &&
        typeof subtitle === 'object' &&
        subtitle.SubDownloadLink &&
        subtitle.LanguageName
      ))
      .filter(subtitle => {
        if (!debouncedQuery) return true;
        return subtitle.LanguageName.toLowerCase()
          .includes(debouncedQuery.toLowerCase());
      })
      .sort((a, b) => {
        if (a.ISO639 === preferences.language) return -1;
        if (b.ISO639 === preferences.language) return 1;
        return (a.LanguageName || '').localeCompare(b.LanguageName || '');
      });
  }, [subtitles, debouncedQuery, preferences.language]);

  // Subtitle parsing & processing
  const parseSubtitleContent = useCallback((content: string, format: string): ParsedCue[] => {
    try {
      if (format === 'srt') {
        return content.trim()
          .split(/\r?\n\r?\n/)
          .map(block => {
            const lines = block.split(/\r?\n/);
            if (lines.length < 3) return null;
            
            const [, timecodes, ...textLines] = lines;
            const [start, end] = timecodes.split(' --> ')
              .map(tc => {
                const [h, m, s] = tc.split(':').map(parseFloat);
                return h * 3600 + m * 60 + s;
              });

            return { start, end, text: textLines.join(' ') };
          })
          .filter((cue): cue is ParsedCue => cue !== null);
      }
      
      throw new Error(`Unsupported subtitle format: ${format}`);
    } catch (error) {
      console.error('Error parsing subtitles:', error);
      throw error;
    }
  }, []);

  const handleSubtitleSelect = async (subtitle: Subtitle | null) => {
    try {
      setLoadingId(subtitle?.IDSubtitle || null);

      if (!subtitle) {
        onSubtitleChange(null, null);
        toast({
          title: "Subtitles disabled",
          status: "info",
          duration: 3000,
          position: "top-right",
        });
        return;
      }

      const response = await fetch(subtitle.SubDownloadLink);
      if (!response.ok) throw new Error('Failed to fetch subtitles');

      const arrayBuffer = await response.arrayBuffer();
      let content: string;

      if (subtitle.SubDownloadLink.endsWith('.gz')) {
        const decompressed = pako.inflate(new Uint8Array(arrayBuffer));
        content = new TextDecoder().decode(decompressed);
      } else {
        content = new TextDecoder().decode(arrayBuffer);
      }

      const parsedCues = parseSubtitleContent(content, subtitle.SubFormat);
      onSubtitleChange(subtitle, parsedCues);

      queryClient.setQueryData(
        ['subtitles', subtitle.IDSubtitle],
        { subtitle, parsedCues }
      );

      toast({
        title: "Subtitles enabled",
        description: `${subtitle.LanguageName} subtitles loaded successfully`,
        status: "success",
        duration: 3000,
        position: "top-right",
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Error loading subtitles:', error);
      toast({
        title: "Error loading subtitles",
        description: "Please try another option or check your connection",
        status: "error",
        duration: 5000,
        position: "top-right",
      });
    } finally {
      setLoadingId(null);
    }
  };

  if (!filteredSubtitles.length) return null;

  return (
    <>
      <Tooltip
        label="Select subtitles (Ctrl+Shift+S)"
        placement="top"
        openDelay={500}
      >
        <IconButton
          aria-label="Open subtitles selector"
          icon={<Subtitles size={20} />}
          onClick={() => setIsOpen(true)}
          variant="ghost"
          size="md"
          color="white"
          _hover={{ bg: 'whiteAlpha.200' }}
        />
      </Tooltip>

      <AnimatePresence>
        {isOpen && (
          <Portal>
            <Modal
              isOpen={true}
              onClose={() => setIsOpen(false)}
              size={isMobile ? "full" : "md"}
              motionPreset="scale"
            >
              <ModalOverlay bg="blackAlpha.900" backdropFilter="blur(10px)" />
              
              <ModalContent
                bg={bgColor}
                borderColor={borderColor}
                borderWidth="1px"
                borderRadius="xl"
                overflow="hidden"
                as={motion.div}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <ModalHeader>
                  <Flex justify="space-between" align="center" mb={4}>
                    <Text fontSize="lg" fontWeight="semibold">Select Subtitles</Text>
                    <ModalCloseButton position="static" />
                  </Flex>
                  <InputGroup>
                    <InputLeftElement>
                      <Search size={20} />
                    </InputLeftElement>
                    <Input
                      placeholder="Search subtitles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
                </ModalHeader>

                <ModalBody p={0}>
                  <ErrorBoundary
                    fallback={
                      <Box p={4} textAlign="center">
                        <Text>Error loading subtitles. Please try again.</Text>
                      </Box>
                    }
                  >
                    <Virtuoso
                      style={{ height: '400px' }}
                      data={filteredSubtitles}
                      itemContent={(_, subtitle: Subtitle) => (
                        <SubtitleItem
                          key={subtitle.IDSubtitle}
                          subtitle={subtitle}
                          isSelected={selectedSubtitle?.IDSubtitle === subtitle.IDSubtitle}
                          isLoading={loadingId === subtitle.IDSubtitle}
                          onSelect={handleSubtitleSelect}
                        />
                      )}
                      components={{
                        Header: () => (
                          <Button
                            width="100%"
                            height="auto"
                            py={3}
                            px={4}
                            variant="ghost"
                            onClick={() => handleSubtitleSelect(null)}
                            mb={2}
                          >
                            <Flex align="center" gap={3}>
                              <X size={18} />
                              <Text>Disable Subtitles</Text>
                            </Flex>
                          </Button>
                        )
                      }}
                    />
                  </ErrorBoundary>
                </ModalBody>
              </ModalContent>
            </Modal>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
};

export default React.memo(SubtitleSelector);