import React, { useState, useEffect } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Button,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Heading,
  useColorModeValue,
  HStack,
  Text,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  useDisclosure,
  Tooltip,
  Divider,
  IconButton,
  useToast,
  Flex,
  Progress,
  Tag,
  TagLabel,
  TagLeftIcon,
  Collapse,
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
  Portal,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Stack,
} from '@chakra-ui/react';
import { 
  Download, 
  PlayCircle, 
  ChevronLeft, 
  ChevronRight,
  Info,
  Link as LinkIcon,
  Film,
  Clock,
  Hash,
  HardDrive,
  Users,
  Share2,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Check,
  AlertCircle,
  Wifi,
  Globe,
  BookOpen,
  Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mirror } from '../services/movieService';

interface MirrorTableProps {
  mirrors: Mirror[];
  onMirrorSelect: (mirror: Mirror) => void;
  selectedMirrorId?: string;
  movieTitle?: string;
  isLoading?: boolean;
}

interface TorrentInfo {
  magnetLink: string;
  hash: string;
  uploadDate: string;
  trackers: string[];
  peers?: number;
  ratio?: number;
}
const MotionButton = motion(Button);

const formatFileSize = (bytes: number) => {
  if (!bytes) return 'Unknown';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20];

const QualityBadge: React.FC<{ quality: string }> = ({ quality }) => {
  const getQualityColor = () => {
    switch (quality.toLowerCase()) {
      case '4k': return 'purple';
      case '1080p': return 'blue';
      case '720p': return 'green';
      default: return 'gray';
    }
  };

  return (
    <Badge 
      colorScheme={getQualityColor()} 
      variant="subtle"
      px={3}
      py={1}
      borderRadius="full"
      textTransform="uppercase"
      fontSize="xs"
      fontWeight="bold"
    >
      {quality}
    </Badge>
  );
};

const MirrorTable: React.FC<MirrorTableProps> = ({ 
  mirrors, 
  onMirrorSelect,
  selectedMirrorId,
  movieTitle = 'Movie',
  isLoading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedMirror, setSelectedMirror] = useState<Mirror | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Mirror>('seeds');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filteredMirrors, setFilteredMirrors] = useState(mirrors);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isFilterOpen,
    onToggle: onFilterToggle,
  } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const selectedBgColor = useColorModeValue('gray.50', 'gray.700');
  const modalBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    let result = [...mirrors];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(mirror => 
        mirror.quality.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mirror.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mirror.fileType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });

    setFilteredMirrors(result);
    setCurrentPage(1);
  }, [mirrors, searchTerm, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredMirrors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMirrors = filteredMirrors.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSort = (field: keyof Mirror) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(event.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleDownloadClick = (mirror: Mirror) => {
    setSelectedMirror(mirror);
    onOpen();
  };

  const copyToClipboard = async (text: string, type: string = 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: `${type} copied to clipboard`,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
        icon: <Check size={16} />,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
        icon: <AlertCircle size={16} />,
      });
    }
  };

  const generateMockTorrentInfo = (mirror: Mirror): TorrentInfo => {
    return {
      magnetLink: `magnet:?xt=urn:btih:${mirror.id}&dn=${encodeURIComponent(movieTitle)}_${mirror.quality}`,
      hash: mirror.id,
      uploadDate: new Date().toISOString(),
      trackers: [
        'udp://tracker.opentrackr.org:1337/announce',
        'udp://open.tracker.cl:1337/announce',
        'udp://9.rarbg.com:2810/announce'
      ],
      peers: Math.floor(Math.random() * 100),
      ratio: Number((Math.random() * 2).toFixed(2))
    };
  };

  const renderSortIcon = (field: keyof Mirror) => {
    if (sortField !== field) return <SortAsc size={14} opacity={0.5} />;
    return sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />;
  };

  const renderHeaderCell = (label: string, field: keyof Mirror) => (
    <Th 
      cursor="pointer" 
      onClick={() => handleSort(field)}
      _hover={{ bg: hoverBg }}
      transition="all 0.2s"
    >
      <HStack spacing={1}>
        <Text>{label}</Text>
        {renderSortIcon(field)}
      </HStack>
    </Th>
  );

  return (
    <Card bg={bgColor} boxShadow="sm" borderRadius="lg">
      <CardHeader>
        <Stack spacing={4}>
          <HStack justify="space-between">
            <Heading size="md" display="flex" alignItems="center" gap={2}>
              Available Sources
            </Heading>
            <HStack>
              <Tag colorScheme="blue" size="md">
                <TagLeftIcon as={Globe} />
                <TagLabel>Total sources: {mirrors.length}</TagLabel>
              </Tag>
              <IconButton
                aria-label="Toggle filters"
                icon={<Filter size={16} />}
                size="sm"
                variant="ghost"
                onClick={onFilterToggle}
              />
            </HStack>
          </HStack>

          <Collapse in={isFilterOpen} animateOpacity>
            <HStack spacing={4}>
              <InputGroup size="sm">
                <InputLeftElement>
                  <Search size={16} />
                </InputLeftElement>
                <Input
                  placeholder="Search by quality, language, or file type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  borderRadius="md"
                />
              </InputGroup>
            </HStack>
          </Collapse>
        </Stack>
      </CardHeader>
      <CardBody>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                {renderHeaderCell("Quality", "quality")}
                {renderHeaderCell("Language", "language")}
                {renderHeaderCell("File Type", "fileType")}
                {renderHeaderCell("Seeds", "seeds")}
                {renderHeaderCell("Size", "size")}
                <Th isNumeric>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                Array.from({ length: itemsPerPage }).map((_, index) => (
                  <Tr key={index}>
                    {Array.from({ length: 6 }).map((_, cellIndex) => (
                      <Td key={cellIndex}>
                        <Skeleton height="20px" />
                      </Td>
                    ))}
                  </Tr>
                ))
              ) : (
                <AnimatePresence>
                  {currentMirrors.map((mirror) => (
                    <motion.tr
                      key={mirror.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        backgroundColor: selectedMirrorId === mirror.id ? selectedBgColor : 'transparent',
                      }}
                      whileHover={{ backgroundColor: hoverBg }}
                    >
                      <Td><QualityBadge quality={mirror.quality} /></Td>
                      <Td>
                        <Badge 
                          colorScheme="blue"
                          borderRadius="full"
                          px={3}
                          py={1}
                        >
                          {mirror.language.toUpperCase()}
                        </Badge>
                      </Td>
                      <Td>
                        <Tag size="sm" variant="subtle">
                          <TagLeftIcon as={BookOpen} />
                          <TagLabel>{mirror.fileType}</TagLabel>
                        </Tag>
                      </Td>
                      <Td>
                        <HStack>
                          <Badge 
                            colorScheme={mirror.seeds > 0 ? "green" : "red"}
                            borderRadius="full"
                            px={3}
                            py={1}
                          >
                            {mirror.seeds}
                          </Badge>
                          <Tooltip 
                            label={`Connection quality: ${mirror.seeds > 10 ? 'Excellent' : mirror.seeds > 5 ? 'Good' : 'Poor'}`}
                            placement="top"
                          >
                            <Box>
                              <Wifi 
                                size={16} 
                                color={mirror.seeds > 10 ? 'green' : mirror.seeds > 5 ? 'orange' : 'red'} 
                              />
                            </Box>
                          </Tooltip>
                        </HStack>
                      </Td>
                      <Td>{formatFileSize(mirror.size)}</Td>
                      <Td isNumeric>
                        <HStack justify="flex-end" spacing={2}>
                          <Tooltip label="Play">
                            <IconButton
                              aria-label="Play"
                              icon={<PlayCircle size={16} />}
                              size="sm"
                              colorScheme={selectedMirrorId === mirror.id ? "blue" : "gray"}
                              onClick={() => onMirrorSelect(mirror)}
                            />
                          </Tooltip>
                          
                          <Popover>
                            <PopoverTrigger>
                              <IconButton
                                aria-label="Download options"
                                icon={<Download size={16} />}
                                size="sm"
                                colorScheme="green"
                              />
                            </PopoverTrigger>
                            <Portal>
                              <PopoverContent>
                                <PopoverArrow />
                                <PopoverCloseButton />
                                <PopoverHeader>Download Options</PopoverHeader>
                                <PopoverBody>
                                  <VStack align="stretch" spacing={2}>
                                    <Button
                                      size="sm"
                                      leftIcon={<Download size={16} />}
                                      onClick={() => handleDownloadClick(mirror)}
                                    >
                                      Download Details
                                    </Button>
                                    <Button
                                      size="sm"
                                      leftIcon={<LinkIcon size={16} />}
                                      onClick={() => {
                                        if (mirror) {
                                          copyToClipboard(generateMockTorrentInfo(mirror).magnetLink, 'Magnet link');
                                        }
                                      }}
                                    >
                                      Copy Magnet Link
                                    </Button>
                                  </VStack>
                                </PopoverBody>
                              </PopoverContent>
                            </Portal>
                          </Popover>

                          <Tooltip label="Info">
                            <IconButton
                              aria-label="Info"
                              icon={<Info size={16} />}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownloadClick(mirror)}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </Tbody>
          </Table>

          {/* Pagination Controls */}
          <Flex 
            justify="space-between" 
            align="center" 
            mt={4}
            p={2}
            borderTop="1px"
            borderColor={borderColor}
          >
            <HStack spacing={4}>
              <HStack spacing={2}>
                <Text fontSize="sm">Items per page:</Text>
                <Select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  width="auto"
                  size="sm"
                  variant="filled"
                >
                  {ITEMS_PER_PAGE_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </HStack>
              <Text fontSize="sm" color="gray.500">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredMirrors.length)} of {filteredMirrors.length}
              </Text>
            </HStack>
            
            <HStack spacing={2}>
              <MotionButton
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                isDisabled={currentPage === 1}
                leftIcon={<ChevronLeft size={16} />}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Previous
              </MotionButton>
              <HStack spacing={1}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <MotionButton
                    key={page}
                    size="sm"
                    variant={currentPage === page ? "solid" : "outline"}
                    onClick={() => handlePageChange(page)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {page}
                  </MotionButton>
                ))}
              </HStack>
              <MotionButton
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                isDisabled={currentPage === totalPages}
                rightIcon={<ChevronRight size={16} />}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next
              </MotionButton>
            </HStack>
          </Flex>
        </Box>

        {/* Download Modal */}
        <Modal 
          isOpen={isOpen} 
          onClose={onClose} 
          size="lg"
          motionPreset="slideInBottom"
        >
          <ModalOverlay 
            bg="blackAlpha.300"
            backdropFilter="blur(10px)"
          />
          <ModalContent bg={modalBg}>
            <ModalHeader 
              borderBottom="1px" 
              borderColor={borderColor}
              py={4}
            >
              <HStack>
                <Download size={20} />
                <Text>Download Information</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={6}>
              {selectedMirror && (
                <VStack align="stretch" spacing={6}>
                  {/* Basic Information */}
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between">
                      <HStack>
                        <Film size={20} />
                        <Text fontWeight="bold">Title:</Text>
                      </HStack>
                      <Text>{movieTitle}</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <HStack>
                        <HardDrive size={20} />
                        <Text fontWeight="bold">Size:</Text>
                      </HStack>
                      <Text>{formatFileSize(selectedMirror.size)}</Text>
                    </HStack>

                    <HStack justify="space-between">
                      <HStack>
                        <Clock size={20} />
                        <Text fontWeight="bold">Upload Date:</Text>
                      </HStack>
                      <Text>{new Date().toLocaleDateString()}</Text>
                    </HStack>

                    <HStack justify="space-between">
                      <HStack>
                        <Users size={20} />
                        <Text fontWeight="bold">Connection:</Text>
                      </HStack>
                      <HStack spacing={4}>
                        <Tag 
                          size="sm" 
                          colorScheme={selectedMirror.seeds > 0 ? "green" : "red"}
                        >
                          <TagLeftIcon as={Users} />
                          <TagLabel>{selectedMirror.seeds} seeds</TagLabel>
                        </Tag>
                        <Progress 
                          value={selectedMirror.seeds > 10 ? 100 : (selectedMirror.seeds * 10)} 
                          size="sm"
                          width="100px"
                          colorScheme={selectedMirror.seeds > 10 ? "green" : selectedMirror.seeds > 5 ? "yellow" : "red"}
                          borderRadius="full"
                        />
                      </HStack>
                    </HStack>
                  </VStack>

                  <Divider />

                  {/* Technical Information */}
                  <VStack align="stretch" spacing={4}>
                    <VStack align="stretch" spacing={2}>
                      <Text fontWeight="bold">
                        <Hash size={16} style={{ display: 'inline', marginRight: '8px' }} />
                        Hash:
                      </Text>
                      <HStack 
                        p={2} 
                        bg={useColorModeValue('gray.50', 'gray.700')}
                        borderRadius="md"
                      >
                        <Text fontSize="sm" fontFamily="monospace" flex={1}>
                          {selectedMirror.id}
                        </Text>
                        <IconButton
                          aria-label="Copy hash"
                          icon={<Share2 size={16} />}
                          size="xs"
                          variant="ghost"
                          onClick={() => copyToClipboard(selectedMirror.id, 'Hash')}
                        />
                      </HStack>
                    </VStack>

                    <VStack align="stretch" spacing={2}>
                      <Text fontWeight="bold">
                        <LinkIcon size={16} style={{ display: 'inline', marginRight: '8px' }} />
                        Magnet Link:
                      </Text>
                      <HStack 
                        p={2} 
                        bg={useColorModeValue('gray.50', 'gray.700')}
                        borderRadius="md"
                      >
                        <Text fontSize="sm" fontFamily="monospace" noOfLines={1} flex={1}>
                          {generateMockTorrentInfo(selectedMirror).magnetLink}
                        </Text>
                        <IconButton
                          aria-label="Copy magnet link"
                          icon={<Share2 size={16} />}
                          size="xs"
                          variant="ghost"
                          onClick={() => copyToClipboard(generateMockTorrentInfo(selectedMirror).magnetLink, 'Magnet link')}
                        />
                      </HStack>
                    </VStack>

                    <VStack align="stretch" spacing={2}>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Trackers:</Text>
                        <IconButton
                          aria-label="Settings"
                          icon={<Settings size={14} />}
                          size="xs"
                          variant="ghost"
                        />
                      </HStack>
                      <Box 
                        p={2} 
                        bg={useColorModeValue('gray.50', 'gray.700')}
                        borderRadius="md"
                        maxH="100px"
                        overflowY="auto"
                      >
                        {generateMockTorrentInfo(selectedMirror).trackers.map((tracker, index) => (
                          <Text 
                            key={index} 
                            fontSize="sm" 
                            fontFamily="monospace"
                            py={1}
                          >
                            {tracker}
                          </Text>
                        ))}
                      </Box>
                    </VStack>
                  </VStack>
                </VStack>
              )}
            </ModalBody>

            <ModalFooter 
              borderTop="1px" 
              borderColor={borderColor}
              py={4}
            >
              <Button 
                variant="ghost" 
                mr={3} 
                onClick={onClose}
                leftIcon={<AlertCircle size={16} />}
              >
                Cancel
              </Button>
              <MotionButton
                colorScheme="green"
                leftIcon={<Download size={16} />}
                onClick={() => {
                  if (selectedMirror) {
                    copyToClipboard(generateMockTorrentInfo(selectedMirror).magnetLink, 'Magnet link');
                    onClose();
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Download Torrent
              </MotionButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </CardBody>
    </Card>
  );
};

export default MirrorTable;