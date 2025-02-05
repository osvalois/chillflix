import React from 'react';
import { HStack, Tooltip, IconButton, Text, Flex } from '@chakra-ui/react';
import { PlayCircle, Info, Wifi, Star, Crown, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mirror } from '../../services/movieService';

const MotionTr = motion.tr;

interface MirrorRowProps {
  mirror: Mirror;
  selectedMirrorId?: string;
  onSelect: (mirror: Mirror) => void;
  onDetailsClick: (mirror: Mirror) => void;
  index: number;
}

const microMotion = {
  type: "spring",
  stiffness: 300,
  damping: 25
};

const glassEffect = {
  background: 'rgba(255, 255, 255, 0.02)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.04)',
  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
};

export const MirrorRow: React.FC<MirrorRowProps> = ({
  mirror,
  selectedMirrorId,
  onSelect,
  onDetailsClick,
  index
}) => {
  const getConnectionStatus = (seeds: number) => ({
    text: seeds > 10 ? 'Premium' : seeds > 5 ? 'High Quality' : 'Standard',
    color: seeds > 10 ? '#10B981' : seeds > 5 ? '#F59E0B' : '#6B7280',
    icon: seeds > 10 ? Crown : seeds > 5 ? Shield : Wifi,
    gradient: seeds > 10 
      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.02))'
      : seeds > 5
        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.02))'
        : 'linear-gradient(135deg, rgba(107, 114, 128, 0.12), rgba(75, 85, 99, 0.02))'
  });

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

  const status = getConnectionStatus(mirror.seeds);

  const Badge = ({ icon: Icon, text, gradient }: { icon: any; text: string; gradient: string }) => (
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
  );

  const ActionButton = ({ icon: Icon, label, onClick, isActive = false }: any) => (
    <Tooltip label={label} hasArrow placement="top" openDelay={200}>
      <IconButton
        aria-label={label}
        icon={<Icon size={18} strokeWidth={2} />}
        onClick={onClick}
        style={{
          ...glassEffect,
          background: isActive ? status.gradient : 'rgba(255, 255, 255, 0.01)',
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          color: isActive ? status.color : 'currentColor'
        }}
      />
    </Tooltip>
  );

  const quality = mirror.quality.toLowerCase() as keyof typeof qualityStyles;
  const style = qualityStyles[quality] || qualityStyles['1080p'];

  return (
    <AnimatePresence>
      <MotionTr
        initial={{ opacity: 0, y: 3 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: { delay: index * 0.03, ...microMotion }
        }}
        whileHover={{ 
          y: -1,
          transition: { duration: 0.1 }
        }}
        style={{
          position: 'relative',
          cursor: 'pointer',
          padding: '12px',
          marginBottom: '8px',
          background: selectedMirrorId === mirror.id ? status.gradient : 'transparent',
          borderRadius: '12px'
        }}
        onClick={() => onSelect(mirror)}
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
        <td>
          <HStack spacing={3} justify="flex-end">
            <ActionButton
              icon={PlayCircle}
              label={selectedMirrorId === mirror.id ? 'Playing' : 'Play'}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onSelect(mirror);
              }}
              isActive={selectedMirrorId === mirror.id}
            />
            <ActionButton
              icon={Info}
              label="Details"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onDetailsClick(mirror);
              }}
            />
          </HStack>
        </td>
      </MotionTr>
    </AnimatePresence>
  );
};