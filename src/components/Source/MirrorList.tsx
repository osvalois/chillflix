import React, { memo, useMemo } from 'react';
import { Table, Thead, Tbody, Tr, Th, Box, Text, useBreakpointValue, VStack } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingRows } from './LoadingRows';
import { Mirror } from '../../services/movieService';
import { MirrorRow } from './MirrorRow';

const MotionBox = motion(Box);

interface MirrorListProps {
  currentMirrors: Mirror[];
  isLoading: boolean;
  selectedMirrorId?: string;
  handleMirrorSelect: (mirror: Mirror) => void;
  handleDetailsClick: (mirror: Mirror) => void;
  renderHeaderCell: (label: string, field: keyof Mirror) => JSX.Element;
}

// Estilos base de la tabla con efecto de vidrio
const glassTableStyle = {
  background: 'rgba(255, 255, 255, 0.01)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)', // Para Safari
  MozBackdropFilter: 'blur(8px)', // Para Firefox
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.03)',
  boxShadow: '0 4px 24px -6px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  transform: 'translateZ(0)', // Forzar aceleración GPU
  willChange: 'transform', // Optimización de rendimiento
  transition: 'all 0.3s ease'
};

// Variantes de animación para aparición de la tabla
const tableVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
      mass: 0.5
    }
  }
};

export const MirrorList: React.FC<MirrorListProps> = memo(({ 
  currentMirrors,
  isLoading,
  selectedMirrorId,
  handleMirrorSelect,
  handleDetailsClick
}) => {
  // Controles responsivos para adaptar la tabla a diferentes tamaños
  const isMobile = useBreakpointValue({ base: true, md: false });
  const tableSize = useBreakpointValue({ base: "sm", md: "md", lg: "md" });
  const headerFontSize = useBreakpointValue({ base: "xs", md: "sm", lg: "md" });
  
  // Determinar si mostramos la vista móvil o de escritorio
  const showMobileView = useMemo(() => isMobile && !isLoading, [isMobile, isLoading]);

  // Vista para dispositivos móviles
  const renderMobileView = () => (
    <VStack spacing={3} align="stretch" width="100%">
      {currentMirrors.map((mirror, index) => (
        <Box 
          key={mirror.id}
          p={3}
          borderRadius="lg"
          bg="rgba(255, 255, 255, 0.03)"
          borderWidth="1px" 
          borderColor="rgba(255, 255, 255, 0.06)"
          boxShadow="sm"
          transition="all 0.2s"
          _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
          onClick={() => handleMirrorSelect(mirror)}
          position="relative"
          cursor="pointer"
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
        >
          <MirrorRow
            mirror={mirror}
            selectedMirrorId={selectedMirrorId}
            onSelect={handleMirrorSelect}
            onDetailsClick={handleDetailsClick}
            index={index}
            isMobile={true}
          />
        </Box>
      ))}
    </VStack>
  );

  // Vista para tablets y desktop
  const renderDesktopView = () => (
    <Box style={glassTableStyle}>
      <Table 
        variant="unstyled" 
        size={tableSize}
        style={{ 
          tableLayout: 'fixed', 
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: '0 4px'
        }}
      >
        <Thead>
          <Tr>
            <Th width="25%" fontSize={headerFontSize} textTransform="capitalize" fontWeight="600">
              <Text opacity={0.9}>Quality</Text>
            </Th>
            <Th width="25%" fontSize={headerFontSize} textTransform="capitalize" fontWeight="600">
              <Text opacity={0.9}>Language</Text>
            </Th>
            <Th width="25%" fontSize={headerFontSize} textTransform="capitalize" fontWeight="600">
              <Text opacity={0.9}>Connection</Text>
            </Th>
            <Th width="25%" fontSize={headerFontSize} textAlign="right" textTransform="capitalize" fontWeight="600">
              <Text opacity={0.9}>Actions</Text>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          <AnimatePresence mode="wait" presenceAffectsLayout={false}>
            {isLoading ? (
              <LoadingRows />
            ) : (
              currentMirrors.map((mirror, index) => (
                <MirrorRow
                  key={mirror.id}
                  mirror={mirror}
                  selectedMirrorId={selectedMirrorId}
                  onSelect={handleMirrorSelect}
                  onDetailsClick={handleDetailsClick}
                  index={index}
                  isMobile={false}
                />
              ))
            )}
          </AnimatePresence>
        </Tbody>
      </Table>
    </Box>
  );

  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      variants={tableVariants}
      style={{ 
        contain: 'content', // Mejora rendimiento de repintado
        width: '100%'
      }}
      role="table"
      aria-label="Available Sources"
      className="mirror-list-container"
    >
      {isLoading ? renderDesktopView() : (showMobileView ? renderMobileView() : renderDesktopView())}
    </MotionBox>
  );
});