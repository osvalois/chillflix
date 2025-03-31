import React, { memo, useMemo } from 'react';
import { HStack, Tooltip, IconButton, Text, Flex } from '@chakra-ui/react';
import { PlayCircle, Info, Wifi, Star, Crown, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Mirror } from '../../services/movieService';

const MotionTr = motion.tr;

interface MirrorRowProps {
  mirror: Mirror;
  selectedMirrorId?: string;
  onSelect: (mirror: Mirror) => void;
  onDetailsClick: (mirror: Mirror) => void;
  index: number;
  isMobile?: boolean;
}

const microMotion = {
  type: "spring",
  stiffness: 300,
  damping: 25,
  restDelta: 0.001 // Optimización para finalizar animación
};

const glassEffect = {
  background: 'rgba(255, 255, 255, 0.02)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)', // Para Safari
  MozBackdropFilter: 'blur(8px)', // Para Firefox
  border: '1px solid rgba(255, 255, 255, 0.04)',
  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
  transform: 'translateZ(0)', // Forzar aceleración GPU
  willChange: 'transform, opacity' // Optimización de rendimiento
};

// Componentes memorizados para evitar re-renders innecesarios
const Badge = memo(({ icon: Icon, text, gradient }: { icon: any; text: string; gradient: string }) => (
  <Flex
    align="center"
    gap="8px"
    style={{
      ...glassEffect,
      padding: "8px 14px",
      borderRadius: "8px",
      background: gradient
    }}
  >
    <Icon size={14} strokeWidth={2.5} />
    <Text fontSize="sm" fontWeight="600" letterSpacing="0.01em">
      {text}
    </Text>
  </Flex>
));

const ActionButton = memo(({ icon: Icon, label, onClick, isActive = false, gradient, color }: any) => (
  <Tooltip label={label} hasArrow placement="top" openDelay={200} gutter={8}>
    <IconButton
      aria-label={label}
      icon={<Icon size={18} strokeWidth={2} />}
      onClick={onClick}
      style={{
        ...glassEffect,
        background: isActive ? gradient : 'rgba(255, 255, 255, 0.01)',
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        color: isActive ? color : 'currentColor'
      }}
    />
  </Tooltip>
));

// Precalcular estilos para diferentes calidades
const qualityStyles = {
  '4k': {
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(124, 58, 237, 0.02))'
  },
  '1080p': {
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(37, 99, 235, 0.02))'
  },
  '720p': {
    color: '#10B981',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.02))'
  }
};

// Precalcular estados de conexión para diferentes valores de seeds
const connectionStatuses = {
  premium: {
    text: 'Premium',
    color: '#10B981',
    icon: Crown,
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.02))'
  },
  high: {
    text: 'High Quality',
    color: '#F59E0B',
    icon: Shield,
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.02))'
  },
  standard: {
    text: 'Standard',
    color: '#6B7280',
    icon: Wifi,
    gradient: 'linear-gradient(135deg, rgba(107, 114, 128, 0.12), rgba(75, 85, 99, 0.02))'
  }
};

const getConnectionStatus = (seeds: number) => {
  if (seeds > 10) return connectionStatuses.premium;
  if (seeds > 5) return connectionStatuses.high;
  return connectionStatuses.standard;
};

export const MirrorRow = memo(({ 
  mirror,
  selectedMirrorId,
  onSelect,
  onDetailsClick,
  index,
  isMobile = false
}: MirrorRowProps) => {
  // Memoizar cálculos para evitar recálculos innecesarios
  const status = useMemo(() => getConnectionStatus(mirror.seeds), [mirror.seeds]);
  const quality = mirror.quality.toLowerCase() as keyof typeof qualityStyles;
  const style = useMemo(() => qualityStyles[quality] || qualityStyles['1080p'], [quality]);
  
  // Memoizar handlers de eventos
  const handleRowClick = () => onSelect(mirror);
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(mirror);
  };
  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDetailsClick(mirror);
  };

  // Variantes de animación optimizadas basadas en el dispositivo
  const rowVariants = {
    hidden: { opacity: 0, y: 3 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: Math.min(index * (isMobile ? 0.01 : 0.02), isMobile ? 0.1 : 0.2), 
        ...microMotion 
      }
    },
    hover: { 
      y: -1,
      scale: isMobile ? 1.01 : 1,
      boxShadow: isMobile ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
      transition: { duration: 0.1 }
    }
  };

  // Renderizado específico para móviles
  if (isMobile) {
    return (
      <Flex 
        direction="column" 
        gap={3} 
        initial="hidden"
        animate="visible"
        whileHover="hover"
        variants={rowVariants}
        as={motion.div}
        style={{
          position: 'relative',
          contain: 'content paint',
          willChange: 'transform',
        }}
      >
        <Flex justify="space-between" align="center">
          <Badge icon={Star} text={mirror.quality} gradient={style.gradient} />
          <Badge icon={status.icon} text={mirror.language} gradient={status.gradient} />
        </Flex>
        
        <Flex justify="space-between" align="center">
          <Badge icon={status.icon} text={status.text} gradient={status.gradient} />
          
          <HStack spacing={2}>
            <ActionButton
              icon={PlayCircle}
              label={selectedMirrorId === mirror.id ? 'Playing' : 'Play'}
              onClick={handlePlayClick}
              isActive={selectedMirrorId === mirror.id}
              gradient={status.gradient}
              color={status.color}
            />
            <ActionButton
              icon={Info}
              label="Details"
              onClick={handleDetailsClick}
              gradient={status.gradient}
              color={status.color}
            />
          </HStack>
        </Flex>
      </Flex>
    );
  }

  // Renderizado para desktop
  return (
    <MotionTr
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={rowVariants}
      style={{
        position: 'relative',
        cursor: 'pointer',
        padding: '12px',
        marginBottom: '8px',
        background: selectedMirrorId === mirror.id ? status.gradient : 'transparent',
        borderRadius: '12px',
        contain: 'layout style paint', // Mejora rendimiento de repintado
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden', 
        willChange: 'transform, opacity'
      }}
      onClick={handleRowClick}
      layout={false} // Evita cálculos de layout innecesarios
    >
      <td style={{ padding: '0 12px' }}>
        <Badge icon={Star} text={mirror.quality} gradient={style.gradient} />
      </td>
      <td style={{ padding: '0 12px' }}>
        <Badge icon={status.icon} text={mirror.language} gradient={status.gradient} />
      </td>
      <td style={{ padding: '0 12px' }}>
        <Badge icon={status.icon} text={status.text} gradient={status.gradient} />
      </td>
      <td style={{ textAlign: 'right' }}>
        <HStack spacing={3} justify="flex-end">
          <ActionButton
            icon={PlayCircle}
            label={selectedMirrorId === mirror.id ? 'Playing' : 'Play'}
            onClick={handlePlayClick}
            isActive={selectedMirrorId === mirror.id}
            gradient={status.gradient}
            color={status.color}
          />
          <ActionButton
            icon={Info}
            label="Details"
            onClick={handleDetailsClick}
            gradient={status.gradient}
            color={status.color}
          />
        </HStack>
      </td>
    </MotionTr>
  );
});