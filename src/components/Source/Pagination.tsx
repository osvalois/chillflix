import React, { memo, useMemo, useCallback } from 'react';
import { Flex, HStack, Select, Text, Button, Box, useMediaQuery, useBreakpointValue } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { rgba } from 'polished';

const MotionButton = motion(Button);
const MotionBox = motion(Box);

interface PaginationProps {
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
  currentPage: number;
  setCurrentPage: (value: number) => void;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

// Optimizaciones para efectos visuales con soporte mejorado para Safari
const glassEffect = {
  background: rgba(0, 0, 0, 0.25), // Fondo más oscuro para mejor contraste en Safari
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)', // Para Safari
  MozBackdropFilter: 'blur(10px)', // Para Firefox
  border: `1px solid ${rgba(255, 255, 255, 0.08)}`,
  boxShadow: `0 4px 12px ${rgba(0, 0, 0, 0.15)}, inset 0 1px 0 ${rgba(255, 255, 255, 0.06)}`,
  transform: 'translateZ(0)', // Forzar aceleración GPU
  willChange: 'transform, opacity', // Optimización de rendimiento
  WebkitAppearance: 'none' // Asegura que Safari no use estilos nativos
};

// Definir las variantes de animación fuera del componente
const buttonVariants = {
  initial: { y: 0, opacity: 0.95 },
  hover: { 
    y: -2,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
      restDelta: 0.001 // Optimización para finalizar animación
    }
  },
  tap: { 
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
      restDelta: 0.001 // Optimización para finalizar animación
    }
  }
};

const containerVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      restDelta: 0.001 // Optimización para finalizar animación
    }
  }
};

// Componente de botón de página memoizado
const PageButton = memo(({ 
  pageNumber, 
  currentPage, 
  onClick,  
}: { 
  pageNumber: number; 
  currentPage: number; 
  onClick: () => void; 
  glassEffect: any; 
}) => {
  const isActive = currentPage === pageNumber;
  
  // Estilos más sólidos y opacos para compatibilidad con Safari
  return (
    <MotionButton
      key={pageNumber}
      size="md"
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      bg={isActive ? 
        'rgba(59, 130, 246, 0.5)' : // Azul más opaco y sólido
        'rgba(50, 50, 50, 0.8)'     // Fondo oscuro sólido
      }
      _hover={{
        bg: isActive ?
          'rgba(59, 130, 246, 0.6)' :
          'rgba(70, 70, 70, 0.85)'
      }}
      _active={{
        bg: isActive ?
          'rgba(59, 130, 246, 0.7)' :
          'rgba(80, 80, 80, 0.9)'
      }}
      border="1px solid"
      borderColor={isActive ?
        'rgba(96, 165, 250, 0.7)' :
        'rgba(100, 100, 100, 0.5)'
      }
      color="white"
      fontWeight="medium"
      minW="36px"
      h="36px"
      borderRadius="md"
      boxShadow={isActive ?
        "0 2px 8px rgba(30, 58, 138, 0.5)" :
        "0 1px 3px rgba(0, 0, 0, 0.3)"
      }
      // Evitar características visuales que causan problemas en Safari
      style={{
        WebkitAppearance: "none",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden"
      }}
      className={`page-button ${isActive ? 'page-button-active' : ''}`}
      aria-current={isActive ? "page" : undefined}
      aria-label={`Page ${pageNumber}`}
    >
      {pageNumber}
    </MotionButton>
  );
});

export const Pagination = memo(({ 
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  setCurrentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems
}: PaginationProps) => {
  // Detectar tamaño de pantalla para elementos responsivos
  const [isMobile] = useMediaQuery("(max-width: 48em)");
  const [isTablet] = useMediaQuery("(max-width: 62em)");
  
  // Memoizar cálculos
  const pageNumbers = useMemo(() => {
    // En móviles, mostrar menos números de página
    const maxVisiblePages = isMobile ? 3 : isTablet ? 4 : 5;
    
    return Array.from({ length: Math.min(totalPages, maxVisiblePages) }, (_, i) => {
      // Mostrar máximo N números de página para optimizar
      if (totalPages <= maxVisiblePages) return i + 1;
      
      // Manejo adaptativo de páginas visibles
      const halfVisible = Math.floor(maxVisiblePages / 2);
      
      if (currentPage <= halfVisible + 1) {
        // Estamos cerca del inicio
        return i + 1;
      } else if (currentPage >= totalPages - halfVisible) {
        // Estamos cerca del final
        return totalPages - (maxVisiblePages - 1) + i;
      } else {
        // Estamos en medio
        return currentPage - halfVisible + i;
      }
    });
  }, [currentPage, totalPages, isMobile, isTablet]);
  
  // Memoizar handlers para mejor rendimiento
  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  }, [currentPage, setCurrentPage]);
  
  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  }, [currentPage, totalPages, setCurrentPage]);
  
  const handleItemsPerPageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
  }, [setItemsPerPage]);

  // Opciones responsivas para diferentes dispositivos
  const buttonSize = useBreakpointValue({ base: "sm", md: "md" });
  const showButtonText = useBreakpointValue({ base: false, md: true });
  const showingText = useBreakpointValue({ 
    base: `${startIndex + 1}-${endIndex}/${totalItems}`, 
    md: `Showing ${startIndex + 1}-${endIndex} of ${totalItems}`
  });

  // Si no hay páginas o hay una sola, no mostrar el paginador
  if (totalPages <= 1) {
    return null;
  }

  return (
    <MotionBox
      initial="initial"
      animate="animate"
      variants={containerVariants}
      style={{ 
        contain: 'content',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }}
      aria-label="Pagination navigation"
      role="navigation"
      className="pagination-container"
    >
      <Flex
        justify="space-between"
        align="center"
        direction={isMobile ? "column" : "row"}
        mt={5}
        px={isMobile ? 3 : 5}
        py={isMobile ? 4 : 5}
        flexWrap="wrap"
        gap={isMobile ? 3 : 5}
        sx={glassEffect}
        borderRadius={isMobile ? "xl" : "2xl"}
        transition="all 0.3s ease"
        backgroundColor="rgba(30, 30, 30, 0.8)" // Fondo más opaco para evitar problemas en Safari
        color="white"
      >
        <Flex 
          direction={isMobile ? "column" : "row"}
          align={isMobile ? "flex-start" : "center"}
          gap={isMobile ? 2 : 5}
          width={isMobile ? "100%" : "auto"}
        >
          <Box position="relative">
            <Select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              size={buttonSize}
              width={isMobile ? "100%" : "auto"}
              pl={4}
              pr={10}
              py={2}
              bg="rgba(50, 50, 50, 0.8)" // Color de fondo más oscuro para Safari
              border="1px solid"
              borderColor="rgba(80, 80, 80, 0.5)"
              _hover={{ borderColor: "rgba(100, 100, 100, 0.8)" }}
              _focus={{ 
                borderColor: "blue.300",
                boxShadow: `0 0 0 1px blue.300`
              }}
              borderRadius="xl"
              color="white"
              fontWeight="medium"
              fontSize={isMobile ? "xs" : "sm"}
              aria-label="Items per page selector"
              icon={<ChevronRight size={14} />}
              iconColor="blue.200"
              iconSize="sm"
              sx={{
                // Fix para Safari
                WebkitAppearance: "none",
                MozAppearance: "none",
                appearance: "none",
                '& option': {
                  bg: 'gray.800',
                  color: 'white'
                }
              }}
            >
              {/* Opciones limitadas para reducir clutter */}
              {[5, 10, 20].map(num => (
                <option key={num} value={num}>{num} per page</option>
              ))}
            </Select>
          </Box>
          <Text 
            fontSize={isMobile ? "xs" : "sm"} 
            color="whiteAlpha.900"
            fontWeight="medium"
            letterSpacing="0.2px"
            style={{ userSelect: 'none' }} // Evitar selección accidental
            aria-live="polite"
          >
            {showingText}
          </Text>
        </Flex>

        <Flex 
          width={isMobile ? "100%" : "auto"}
          justifyContent={isMobile ? "space-between" : "flex-end"}
          align="center"
          gap={2}
        >
          <MotionButton
            size={buttonSize}
            onClick={handlePrevPage}
            isDisabled={currentPage === 1}
            leftIcon={<ChevronLeft size={isMobile ? 16 : 18} />}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            bg="rgba(60, 60, 60, 0.8)"
            _hover={{ bg: "rgba(80, 80, 80, 0.9)" }}
            _active={{ bg: "rgba(90, 90, 90, 0.95)" }}
            border="1px solid"
            borderColor="rgba(100, 100, 100, 0.5)"
            color="white"
            fontWeight="medium"
            px={showButtonText ? 4 : 2}
            borderRadius="xl"
            aria-label="Previous page"
            _disabled={{
              opacity: 0.4,
              cursor: "not-allowed",
              _hover: { bg: "rgba(60, 60, 60, 0.8)" }
            }}
          >
            {showButtonText ? 'Previous' : ''}
          </MotionButton>

          {/* En tablets y desktop, mostrar números de página */}
          {!isMobile && pageNumbers.length > 0 && (
            <HStack spacing={2}>
              {pageNumbers.map((pageNumber) => (
                <PageButton 
                  key={`page-${pageNumber}`} // Key más específica para evitar duplicados
                  pageNumber={pageNumber}
                  currentPage={currentPage}
                  onClick={() => setCurrentPage(pageNumber)}
                  glassEffect={glassEffect}
                />
              ))}
            </HStack>
          )}

          <MotionButton
            size={buttonSize}
            onClick={handleNextPage}
            isDisabled={currentPage === totalPages}
            rightIcon={<ChevronRight size={isMobile ? 16 : 18} />}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            bg="rgba(60, 60, 60, 0.8)"
            _hover={{ bg: "rgba(80, 80, 80, 0.9)" }}
            _active={{ bg: "rgba(90, 90, 90, 0.95)" }}
            border="1px solid"
            borderColor="rgba(100, 100, 100, 0.5)"
            color="white"
            fontWeight="medium"
            px={showButtonText ? 4 : 2}
            borderRadius="xl"
            aria-label="Next page"
            _disabled={{
              opacity: 0.4,
              cursor: "not-allowed",
              _hover: { bg: "rgba(60, 60, 60, 0.8)" }
            }}
          >
            {showButtonText ? 'Next' : ''}
          </MotionButton>
        </Flex>
        
        {/* Mostrar indicador de página actual en móviles */}
        {isMobile && (
          <Text 
            fontSize="xs" 
            fontWeight="medium" 
            color="white"
            textAlign="center"
            width="100%"
            px={2}
            py={1}
            borderRadius="md"
            bg="rgba(70, 70, 70, 0.7)"
          >
            Page {currentPage} of {totalPages}
          </Text>
        )}
      </Flex>
    </MotionBox>
  );
});