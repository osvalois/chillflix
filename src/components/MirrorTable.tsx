import React, { useState, useEffect } from 'react';
import {
  Th,
  Box,
  Button,
  Card,
  CardHeader,
  CardBody,
  Heading,
  useColorModeValue,
  HStack,
  Text,
  useDisclosure,
  IconButton,
  useToast,
  Tag,
  TagLabel,
  TagLeftIcon,
  Collapse,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
} from '@chakra-ui/react';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Globe,
  RefreshCcw,
  Loader,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Mirror } from '../services/movieService';
import SourceDetails from './Source/SourceDetails';
import { MirrorList } from './Source/MirrorList';
import { Pagination } from './Source/Pagination';
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
          <MirrorList
            currentMirrors={currentMirrors}
            isLoading={isLoading}
            selectedMirrorId={selectedMirrorId}
            handleMirrorSelect={handleMirrorSelect}
            handleDetailsClick={handleDetailsClick}
            renderHeaderCell={renderHeaderCell}
          />

          <Pagination
            setItemsPerPage={setItemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredMirrors.length} itemsPerPage={0} />
        </Box>
        {/* Drawer de Detalles */}
        <SourceDetails
          isOpen={isDetailsOpen}
          onClose={onDetailsClose}
          selectedMirror={selectedMirror}
          movieTitle={movieTitle}
          formatFileSize={formatFileSize}
          copyToClipboard={copyToClipboard}
        />
      </CardBody>
    </Card>
  );
};

export default MirrorTable;