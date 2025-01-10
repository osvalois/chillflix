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
  VStack,
  useDisclosure,
  Tooltip,
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
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Center,
  Spinner,
} from '@chakra-ui/react';
import {
  Download,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  Share2,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Wifi,
  Globe,
  RefreshCcw,
  Loader,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mirror } from '../services/movieService';
interface MirrorTableProps {
  mirrors: Mirror[];
  onMirrorSelect: (mirror: Mirror) => void;
  selectedMirrorId?: string;
  movieTitle?: string;
  isLoading?: boolean;
  onSearchMore?: () => Promise<void>;
  isSearching?: boolean;
  handleBackupApiCall: () => Promise<void>;
  tmdbId?: string;
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return 'Unknown';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

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
      fontSize="xs"
      fontWeight="bold"
    >
      {quality}
    </Badge>
  );
};

const MotionTr = motion(Tr);
const MotionButton = motion(Button);

const MirrorTable: React.FC<MirrorTableProps> = ({
  mirrors,
  onMirrorSelect,
  selectedMirrorId,
  movieTitle = 'Movie',
  isLoading = false,
  onSearchMore,
  isSearching = false,
}) => {
  // Estados
  const [selectedMirror, setSelectedMirror] = useState<Mirror | null>(null);
  const [filteredMirrors, setFilteredMirrors] = useState(mirrors);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Mirror;
    direction: 'asc' | 'desc';
  }>({ key: 'seeds', direction: 'desc' });

  // Hooks
  const toast = useToast();
  const { isOpen: isFilterOpen, onToggle: onFilterToggle } = useDisclosure();
  const {
    isOpen: isDetailsOpen,
    onOpen: onDetailsOpen,
    onClose: onDetailsClose
  } = useDisclosure();

  // Theme values
  const bgColor = useColorModeValue('white', 'gray.800');
  const selectedBgColor = useColorModeValue('blue.50', 'blue.900');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  // Efectos
  useEffect(() => {
    let result = [...mirrors];

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      result = result.filter(mirror =>
        mirror.quality.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mirror.language.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar ordenamiento
    result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      const direction = sortConfig.direction === 'asc' ? 1 : -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * direction;
      }

      return String(aValue).localeCompare(String(bValue)) * direction;
    });

    setFilteredMirrors(result);
    setCurrentPage(1);
  }, [mirrors, searchTerm, sortConfig]);

  // Cálculos de paginación
  const totalPages = Math.ceil(filteredMirrors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredMirrors.length);
  const currentMirrors = filteredMirrors.slice(startIndex, endIndex);

  // Handlers
  const handleMirrorSelect = (mirror: Mirror) => {
    onMirrorSelect(mirror);
    setSelectedMirror(mirror);
  };

  const handleDetailsClick = (mirror: Mirror) => {
    setSelectedMirror(mirror);
    onDetailsOpen();
  };

  const handleSort = (key: keyof Mirror) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const copyToClipboard = async (text: string, type: string = 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: `Copied ${type} to clipboard`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleSearchMore = async () => {
    if (onSearchMore) {
      try {
        await onSearchMore();
        toast({
          title: "Search completed",
          description: "New sources have been added",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Search failed",
          description: "Could not find additional sources",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // Render helpers
  const renderSortIcon = (field: keyof Mirror) => {
    if (sortConfig.key !== field) return <SortAsc size={14} opacity={0.3} />;
    return sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />;
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
              {isLoading && <Spinner size="sm" />}
            </Heading>
            <HStack>
              {onSearchMore && (
                <MotionButton
                  size="sm"
                  leftIcon={isSearching ? <Loader size={16} /> : <RefreshCcw size={16} />}
                  onClick={handleSearchMore}
                  isLoading={isSearching}
                  loadingText="Searching..."
                  colorScheme="blue"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Find More Sources
                </MotionButton>
              )}
              <Tag colorScheme="blue" size="md">
                <TagLeftIcon as={Globe} />
                <TagLabel>{mirrors.length} sources</TagLabel>
              </Tag>
              <IconButton
                aria-label="Filter sources"
                icon={<Filter size={16} />}
                size="sm"
                variant="ghost"
                onClick={onFilterToggle}
              />
            </HStack>
          </HStack>

          <Collapse in={isFilterOpen} animateOpacity>
            <InputGroup size="sm">
              <InputLeftElement>
                <Search size={16} />
              </InputLeftElement>
              <Input
                placeholder="Search by quality, language..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                borderRadius="md"
              />
            </InputGroup>
          </Collapse>

          {filteredMirrors.length === 0 && !isLoading && (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <AlertTitle>No sources found</AlertTitle>
              <AlertDescription>
                Try adjusting your search or click "Find More Sources"
              </AlertDescription>
            </Alert>
          )}
        </Stack>
      </CardHeader>

      <CardBody>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                {renderHeaderCell("Quality", "quality")}
                {renderHeaderCell("Language", "language")}
                {renderHeaderCell("Seeds", "seeds")}
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <Tr key={i}>
                    {Array(5).fill(0).map((_, j) => (
                      <Td key={j}><Skeleton height="20px" /></Td>
                    ))}
                  </Tr>
                ))
              ) : (
                <AnimatePresence>
                  {currentMirrors.map((mirror) => (
                    <MotionTr
                      key={mirror.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        backgroundColor: selectedMirrorId === mirror.id ? selectedBgColor : 'transparent',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleMirrorSelect(mirror)}
                      whileHover={{ backgroundColor: hoverBg }}
                      _hover={{ bg: hoverBg }}
                    >
                      <Td><QualityBadge quality={mirror.quality} /></Td>
                      <Td>
                        <Badge colorScheme="blue" borderRadius="full">
                          {mirror.language.toUpperCase()}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack>
                          <Badge
                            colorScheme={mirror.seeds > 0 ? "green" : "red"}
                            borderRadius="full"
                          >
                            {mirror.seeds}
                          </Badge>
                          <Tooltip
                            label={`Connection: ${mirror.seeds > 10 ? 'Excellent' : mirror.seeds > 5 ? 'Good' : 'Poor'}`}
                          >
                            <Wifi
                              size={16}
                              color={mirror.seeds > 10 ? 'green' : mirror.seeds > 5 ? 'orange' : 'red'}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                      <Td>
                        <HStack justify="flex-end" spacing={2}>
                          <Tooltip label={selectedMirrorId === mirror.id ? 'Currently playing' : 'Play'}>
                            <IconButton
                              aria-label="Play"
                              icon={<PlayCircle size={16} />}
                              size="sm"
                              colorScheme={selectedMirrorId === mirror.id ? "blue" : "gray"}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMirrorSelect(mirror);
                              }}
                            />
                          </Tooltip>
                          <Tooltip label="Download info">
                            <IconButton
                              aria-label="Download info"
                              icon={<Info size={16} />}
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDetailsClick(mirror);
                              }}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </MotionTr>
                  ))}
                </AnimatePresence>
              )}
            </Tbody>
          </Table>

          {/* Paginación */}
          <Flex justify="space-between" align="center" mt={4} px={2}>
            <HStack spacing={4}>
              <Select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                size="sm"
                width="auto"
              >
                {[5, 10, 15, 20].map(num => (<option key={num} value={num}>
                  {num} per page
                </option>
                ))}
              </Select>
              <Text fontSize="sm" color="gray.500">
                Showing {startIndex + 1}-{endIndex} of {filteredMirrors.length}
              </Text>
            </HStack>

            <HStack spacing={2}>
              <MotionButton
                size="sm"
                onClick={() => setCurrentPage(prev => prev - 1)}
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
                    onClick={() => setCurrentPage(page)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {page}
                  </MotionButton>
                ))}
              </HStack>
              <MotionButton
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
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

        {/* Drawer de Detalles */}
        <Drawer
          isOpen={isDetailsOpen}
          placement="right"
          onClose={onDetailsClose}
          size="md"
        >
          <DrawerOverlay backdropFilter="blur(10px)" />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">
              <HStack>
                <Text>Source Details</Text>
              </HStack>
            </DrawerHeader>

            <DrawerBody>
              {selectedMirror && (
                <VStack spacing={6} align="stretch">
                  <Card>
                    <CardBody>
                      <Stack spacing={4}>
                        <Heading size="sm">{movieTitle}</Heading>
                        <Tag size="lg" colorScheme="blue">
                          <QualityBadge quality={selectedMirror.quality} />
                        </Tag>
                      </Stack>
                    </CardBody>
                  </Card>

                  <Stack spacing={4}>
                    <Stat>
                      <StatLabel>Size</StatLabel>
                      <StatNumber>{formatFileSize(selectedMirror.size)}</StatNumber>
                      <StatHelpText>
                        Format: {selectedMirror.fileType}
                      </StatHelpText>
                    </Stat>

                    <Stat>
                      <StatLabel>Connection</StatLabel>
                      <StatNumber>
                        <HStack>
                          <Badge
                            colorScheme={selectedMirror.seeds > 0 ? "green" : "red"}
                            fontSize="lg"
                          >
                            {selectedMirror.seeds} seeds
                          </Badge>
                          <Progress
                            value={selectedMirror.seeds > 10 ? 100 : (selectedMirror.seeds * 10)}
                            size="sm"
                            width="100px"
                            colorScheme={selectedMirror.seeds > 10 ? "green" : selectedMirror.seeds > 5 ? "yellow" : "red"}
                            borderRadius="full"
                          />
                        </HStack>
                      </StatNumber>
                      <StatHelpText>
                        {selectedMirror.seeds > 10 ? 'Excellent' : selectedMirror.seeds > 5 ? 'Good' : 'Poor'} connection quality
                      </StatHelpText>
                    </Stat>
                  </Stack>

                  <Card>
                    <CardBody>
                      <VStack align="stretch" spacing={4}>
                        <Heading size="sm">Download Information</Heading>

                        <VStack align="stretch" spacing={2}>
                          <Text fontWeight="bold">Magnet Link:</Text>
                          <HStack
                            p={2}
                            bg={useColorModeValue('gray.50', 'gray.700')}
                            borderRadius="md"
                          >
                            <Text fontSize="sm" fontFamily="monospace" noOfLines={1} flex={1}>
                              magnet:?xt=urn:btih:{selectedMirror.id}&dn={encodeURIComponent(movieTitle)}_{selectedMirror.quality}
                            </Text>
                            <IconButton
                              aria-label="Copy magnet link"
                              icon={<Share2 size={16} />}
                              size="xs"
                              variant="ghost"
                              onClick={() => copyToClipboard(`magnet:?xt=urn:btih:${selectedMirror.id}&dn=${encodeURIComponent(movieTitle)}_${selectedMirror.quality}`, 'Magnet link')}
                            />
                          </HStack>
                        </VStack>

                        <VStack align="stretch" spacing={2}>
                          <HStack justify="space-between">
                            <Text fontWeight="bold">Default Trackers</Text>
                            <Tag size="sm" variant="subtle">
                              Recommended
                            </Tag>
                          </HStack>
                          <Box
                            p={2}
                            bg={useColorModeValue('gray.50', 'gray.700')}
                            borderRadius="md"
                            fontSize="sm"
                            fontFamily="monospace"
                          >
                            <VStack align="stretch" spacing={2}>
                              <Text>udp://tracker.opentrackr.org:1337/announce</Text>
                              <Text>udp://open.tracker.cl:1337/announce</Text>
                              <Text>udp://9.rarbg.com:2810/announce</Text>
                            </VStack>
                          </Box>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Center>
                    <MotionButton
                      colorScheme="green"
                      leftIcon={<Download size={16} />}
                      onClick={() => {
                        copyToClipboard(
                          `magnet:?xt=urn:btih:${selectedMirror.id}&dn=${encodeURIComponent(movieTitle)}_${selectedMirror.quality}`,
                          'Magnet link'
                        );
                        onDetailsClose();
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Copy Magnet Link
                    </MotionButton>
                  </Center>
                </VStack>
              )}
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </CardBody>
    </Card>
  );
};

export default MirrorTable;