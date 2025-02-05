import React from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Stack,
  Badge,
  Box,
  IconButton,
  useColorModeValue,
  Button,
  Tooltip,
  Divider,
  Tag,
  TagLabel,
} from '@chakra-ui/react';
import { Share2, Download, Info, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Mirror {
  id: string;
  quality: string;
  size: number;
  fileType: string;
  seeds: number;
  peers?: number;
  uploadDate?: string;
  uploader?: string;
  language: string;
}

interface SourceDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMirror: Mirror | null;
  movieTitle: string;
  formatFileSize: (size: number) => string;
  copyToClipboard: (text: string, message: string) => void;
}

const MotionButton = motion(Button);
const MotionBox = motion(Box);

const SourceDetails: React.FC<SourceDetailsProps> = ({
  isOpen,
  onClose,
  selectedMirror,
  movieTitle,
  formatFileSize,
  copyToClipboard
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (!selectedMirror) return null;

  const magnetLink = `magnet:?xt=urn:btih:${selectedMirror.id}&dn=${encodeURIComponent(movieTitle)}_${selectedMirror.quality}`;

  const getConnectionStatus = (seeds: number) => {
    if (seeds > 10) return { color: 'green', text: 'Excellent', icon: CheckCircle };
    if (seeds > 5) return { color: 'yellow', text: 'Good', icon: Info };
    return { color: 'red', text: 'Poor', icon: Info };
  };

  const status = getConnectionStatus(selectedMirror.seeds);

  const handleCopy = (text: string, message: string) => {
    copyToClipboard(text, message);
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="md">
      <DrawerOverlay backdropFilter="blur(8px)" />
      <DrawerContent>
        <DrawerHeader 
          borderBottomWidth="1px" 
          bg={useColorModeValue('white', 'gray.800')}
          position="sticky"
          top={0}
          zIndex={10}
        >
          <DrawerCloseButton />
          <Text fontSize="lg">Download Details</Text>
        </DrawerHeader>

        <DrawerBody>
          <AnimatePresence>
            <VStack spacing={6} py={4}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                width="full"
              >
                <Card variant="outline">
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <Text fontSize="xl" fontWeight="bold" noOfLines={2}>
                        {movieTitle}
                      </Text>
                      
                      <HStack wrap="wrap" spacing={2}>
                        <Badge 
                          colorScheme="blue" 
                          fontSize="md"
                          px={3} 
                          py={1}
                          borderRadius="full"
                        >
                          {selectedMirror.quality}
                        </Badge>
                        <Badge
                          colorScheme="purple"
                          fontSize="md"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          {selectedMirror.language}
                        </Badge>
                        {selectedMirror.uploadDate && (
                          <Tag size="md" variant="subtle">
                            <Clock className="mr-1" size={14} />
                            <TagLabel>{selectedMirror.uploadDate}</TagLabel>
                          </Tag>
                        )}
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </MotionBox>

              <Stack spacing={6} width="full">
                <Card variant="outline">
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontSize="2xl" fontWeight="semibold">
                            {formatFileSize(selectedMirror.size)}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Format: {selectedMirror.fileType}
                          </Text>
                        </VStack>
                        <Badge 
                          colorScheme={status.color} 
                          p={2} 
                          borderRadius="md"
                        >
                          <HStack>
                            <status.icon size={14} />
                            <Text>{selectedMirror.seeds} seeds</Text>
                          </HStack>
                        </Badge>
                      </HStack>

                      <Divider />

                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Magnet Link</Text>
                          <Badge colorScheme="purple" variant="subtle">
                            Required
                          </Badge>
                        </HStack>

                        <Box
                          p={3}
                          bg={bgColor}
                          borderRadius="md"
                          borderWidth="1px"
                          borderColor={borderColor}
                        >
                          <HStack>
                            <Text 
                              fontSize="xs" 
                              fontFamily="monospace" 
                              noOfLines={1} 
                              flex={1}
                            >
                              {magnetLink}
                            </Text>
                            <Tooltip label="Copy magnet link">
                              <IconButton
                                aria-label="Copy magnet link"
                                icon={<Share2 size={16} />}
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCopy(magnetLink, 'Magnet link')}
                              />
                            </Tooltip>
                          </HStack>
                        </Box>

                        <Box 
                          p={3} 
                          bg={bgColor}
                          borderRadius="md"
                          borderWidth="1px"
                          borderColor={borderColor}
                        >
                          <VStack align="stretch" spacing={2}>
                            <HStack justify="space-between">
                              <Text fontSize="sm" fontWeight="medium">
                                Default Trackers
                              </Text>
                              <Badge colorScheme="green" variant="subtle">
                                Recommended
                              </Badge>
                            </HStack>
                            <VStack align="stretch" spacing={2}>
                              <Text fontSize="xs" fontFamily="monospace">
                                udp://tracker.opentrackr.org:1337/announce
                              </Text>
                              <Text fontSize="xs" fontFamily="monospace">
                                udp://open.tracker.cl:1337/announce
                              </Text>
                              <Text fontSize="xs" fontFamily="monospace">
                                udp://9.rarbg.com:2810/announce
                              </Text>
                            </VStack>
                          </VStack>
                        </Box>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>

                <MotionButton
                  colorScheme="green"
                  size="lg"
                  leftIcon={<Download size={16} />}
                  onClick={() => handleCopy(magnetLink, 'Magnet link')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                >
                  Copy Magnet Link
                </MotionButton>
              </Stack>
            </VStack>
          </AnimatePresence>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default SourceDetails;