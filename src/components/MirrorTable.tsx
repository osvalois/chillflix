import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import useWindowSize from '../hooks/useWindowSize';
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
  Flex,
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
}

// Mover funciones fuera del componente para evitar recálculos
const formatFileSize = (bytes: number) => {
  if (!bytes) return 'Unknown';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

// Optimización de componentes con motion
const MotionButton = motion(Button);
const MotionHeading = motion(Heading);

// Componente memoizado de encabezado
const TableHeading = memo(({ title, isLoading }: { title: string; isLoading: boolean }) => (
  <MotionHeading 
    size="md" 
    display="flex" 
    alignItems="center" 
    gap={2}
    initial={{ opacity: 0.9 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.2 }}
  >
    {title}
    {isLoading && <Spinner size="sm" />}
  </MotionHeading>
));

// Componente memoizado para acciones de búsqueda
const SearchActions = memo(({ 
  onSearchMore, 
  isSearching, 
  mirrorsLength, 
  onFilterToggle 
}: { 
  onSearchMore?: () => Promise<void>; 
  isSearching: boolean; 
  mirrorsLength: number; 
  onFilterToggle: () => void; 
}) => (
  <HStack>
    {onSearchMore && (
      <MotionButton
        size="sm"
        leftIcon={isSearching ? <Loader size={16} /> : <RefreshCcw size={16} />}
        onClick={onSearchMore}
        isLoading={isSearching}
        loadingText="Searching..."
        colorScheme="blue"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      >
        Find More Sources
      </MotionButton>
    )}
    <Tag colorScheme="blue" size="md">
      <TagLeftIcon as={Globe} />
      <TagLabel>{mirrorsLength} sources</TagLabel>
    </Tag>
    <IconButton
      aria-label="Filter sources"
      icon={<Filter size={16} />}
      size="sm"
      variant="ghost"
      onClick={onFilterToggle}
    />
  </HStack>
));

// Estilo para la tarjeta principal con optimizaciones CSS
const cardStyle = {
  transform: 'translateZ(0)', // Forzar aceleración GPU
  willChange: 'transform, opacity', // Optimización de rendimiento
  contain: 'content', // Reducir repintados
  overflowX: 'clip' as const,
  overscrollBehavior: 'none' as const,
  maxWidth: '100%',
  width: '100%',
  transition: 'all 0.2s ease-in-out',
  position: 'relative' as const,
};

// Hoja de estilos para responsive design
const responsiveStyles = {
  card: {
    sm: { padding: '16px 12px', borderRadius: '12px' },
    md: { padding: '20px 16px', borderRadius: '16px' },
    lg: { padding: '24px 20px', borderRadius: '20px' }
  },
  heading: {
    sm: { fontSize: '16px', marginBottom: '12px' },
    md: { fontSize: '18px', marginBottom: '16px' },
    lg: { fontSize: '20px', marginBottom: '20px' }
  },
  badge: {
    sm: { fontSize: '12px', padding: '4px 8px' },
    md: { fontSize: '14px', padding: '6px 10px' },
    lg: { fontSize: '16px', padding: '8px 12px' }
  }
};

const MirrorTable: React.FC<MirrorTableProps> = memo(({ 
  mirrors,
  onMirrorSelect,
  selectedMirrorId,
  movieTitle = 'Movie',
  isLoading = false,
  onSearchMore,
  isSearching = false,
}) => {

  // Estados esenciales con inicialización optimizada
  const [selectedMirror, setSelectedMirror] = useState<Mirror | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Mirror;
    direction: 'asc' | 'desc';
  }>({ key: 'seeds', direction: 'desc' });

  // Hooks de Chakra
  const toast = useToast();
  const { isOpen: isFilterOpen, onToggle: onFilterToggle } = useDisclosure();
  const {
    isOpen: isDetailsOpen,
    onOpen: onDetailsOpen,
    onClose: onDetailsClose,
  } = useDisclosure();

  // Valores de tema
  const bgColor = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  // Resetear a la primera página cuando cambia significativamente el dataset
  useEffect(() => {
    setCurrentPage(1);
  }, [mirrors.length]);

  // Filtrado y ordenamiento optimizados con useMemo
  const filteredMirrors = useMemo(() => {
    let result = mirrors;
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      // Algoritmo de filtrado optimizado
      result = result.filter(mirror => {
        const qualityMatch = mirror.quality?.toLowerCase().includes(lowerTerm);
        const languageMatch = mirror.language?.toLowerCase().includes(lowerTerm);
        return qualityMatch || languageMatch;
      });
    }

    // Ordenamiento optimizado
    return [...result].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      
      // Optimización para comparación numérica
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * direction;
      }
      
      // Optimización para comparación de strings
      const aString = String(aValue || '');
      const bString = String(bValue || '');
      return aString.localeCompare(bString) * direction;
    });
  }, [mirrors, searchTerm, sortConfig]);

  // Cálculos de paginación optimizados con useMemo
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredMirrors.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredMirrors.length);
    const currentMirrors = filteredMirrors.slice(startIndex, endIndex);
    
    return { totalPages, startIndex, endIndex, currentMirrors };
  }, [filteredMirrors, currentPage, itemsPerPage]);

  const { totalPages, startIndex, endIndex, currentMirrors } = paginationData;

  // Handlers memorizados para evitar re-renderizados
  const handleMirrorSelect = useCallback((mirror: Mirror) => {
    onMirrorSelect(mirror);
    setSelectedMirror(mirror);
  }, [onMirrorSelect]);

  const handleDetailsClick = useCallback((mirror: Mirror) => {
    setSelectedMirror(mirror);
    onDetailsOpen();
  }, [onDetailsOpen]);

  const handleSort = useCallback((key: keyof Mirror) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  }, []);

  const handleSearchTermChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reinicia la página al filtrar
  }, []);

  const copyToClipboard = useCallback(async (text: string, type: string = 'link') => {
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
  }, [toast]);

  const handleSearchMore = useCallback(async () => {
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
  }, [onSearchMore, toast]);

  // Render helpers optimizados con useCallback
  const renderSortIcon = useCallback((field: keyof Mirror) => {
    if (sortConfig.key !== field) return <SortAsc size={14} opacity={0.3} />;
    return sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />;
  }, [sortConfig]);

  const renderHeaderCell = useCallback((label: string, field: keyof Mirror) => (
    <Th
      cursor="pointer"
      onClick={() => handleSort(field)}
      _hover={{ bg: hoverBg }}
      transition="all 0.2s"
      px={4}
      py={3}
    >
      <HStack spacing={1}>
        <Text fontWeight="semibold">{label}</Text>
        {renderSortIcon(field)}
      </HStack>
    </Th>
  ), [handleSort, hoverBg, renderSortIcon]);

  // Determinar tamaño de pantalla para estilos responsivos
  const { width } = useWindowSize();
  const screenSize = useMemo(() => {
    if (width < 768) return 'sm';
    if (width < 1200) return 'md';
    return 'lg';
  }, [width]);
  
  // Aplicar estilos responsivos
  const currentStyles = responsiveStyles.card[screenSize as keyof typeof responsiveStyles.card];
  
  return (
    <Card 
      bg={bgColor} 
      boxShadow="sm" 
      borderRadius={currentStyles.borderRadius}
      style={{
        ...cardStyle,
        padding: currentStyles.padding
      }}
      height="auto"
      data-testid="mirror-table"
      role="region"
      aria-label="Available Sources"
      transition="all 0.3s ease"
    >
      <CardHeader px={['2', '3', '4']} py={['3', '4', '5']}>
        <Stack spacing={[3, 4]} width="100%">
          <Flex 
            justify="space-between" 
            align="center" 
            flexDirection={['column', 'column', 'row']}
            gap={[3, 4]}
            width="100%"
          >
            <TableHeading title="Available Sources" isLoading={isLoading} />
            <Box width={['100%', '100%', 'auto']}>
              <SearchActions 
                onSearchMore={onSearchMore ? handleSearchMore : undefined} 
                isSearching={isSearching} 
                mirrorsLength={mirrors.length} 
                onFilterToggle={onFilterToggle} 
              />
            </Box>
          </Flex>

          <Collapse in={isFilterOpen} animateOpacity>
            <InputGroup size={['sm', 'md']}>
              <InputLeftElement pointerEvents="none">
                <Search size={16} />
              </InputLeftElement>
              <Input
                placeholder="Search by quality, language..."
                value={searchTerm}
                onChange={handleSearchTermChange}
                borderRadius="md"
                aria-label="Search sources"
                spellCheck="false"
                autoComplete="off"
                _focus={{
                  boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)",
                  borderColor: "blue.300"
                }}
                fontSize={['sm', 'md']}
              />
            </InputGroup>
          </Collapse>

          {filteredMirrors.length === 0 && !isLoading && (
            <Alert 
              status="info" 
              borderRadius="md" 
              variant="left-accent"
              flexDirection={['column', 'row']}
              alignItems={['flex-start', 'center']}
              py={[3, 4]}
              pl={[3, 4]}
              pr={[3, 5]}
            >
              <AlertIcon />
              <Box flex="1">
                <AlertTitle fontSize={['sm', 'md']} mb={[1, 0]}>No sources found</AlertTitle>
                <AlertDescription fontSize={['xs', 'sm']}>
                  Try adjusting your search or click "Find More Sources"
                </AlertDescription>
              </Box>
            </Alert>
          )}
        </Stack>
      </CardHeader>

      <CardBody px={['2', '3', '4']} py={['3', '4', '5']}>
        <Box 
          overflowX="auto" 
          overflowY="hidden"
          style={{ WebkitOverflowScrolling: 'touch' }} // Mejora el desplazamiento en iOS
          sx={{ 
            scrollbarWidth: 'thin',
            scrollSnapType: 'x mandatory', // Ayuda con el desplazamiento en dispositivos táctiles
            '&::-webkit-scrollbar': {
              width: '6px',
              height: '6px',
              borderRadius: '8px',
              backgroundColor: `rgba(0, 0, 0, 0.05)`
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: `rgba(0, 0, 0, 0.1)`,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: `rgba(0, 0, 0, 0.2)`
              }
            }
          }}
          borderRadius="md"
          className="source-table-container"
        >
          <MirrorList
            currentMirrors={currentMirrors}
            isLoading={isLoading}
            selectedMirrorId={selectedMirrorId}
            handleMirrorSelect={handleMirrorSelect}
            handleDetailsClick={handleDetailsClick}
            renderHeaderCell={renderHeaderCell}
          />

          {/* Solo mostrar paginador si hay más de una página */}
          {totalPages > 1 && filteredMirrors.length > 0 && (
            <Pagination
              setItemsPerPage={setItemsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={filteredMirrors.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </Box>

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
});

export default MirrorTable;
