import React from 'react';
import { Table, Thead, Tbody, Tr, Th, Box } from '@chakra-ui/react';
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

const glassTableStyle = {
  background: 'rgba(255, 255, 255, 0.01)',
  backdropFilter: 'blur(8px)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.03)',
  boxShadow: '0 4px 24px -6px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden'
};

export const MirrorList: React.FC<MirrorListProps> = ({
  currentMirrors,
  isLoading,
  selectedMirrorId,
  handleMirrorSelect,
  handleDetailsClick
}) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: {
          type: 'spring',
          stiffness: 400,
          damping: 30,
          mass: 0.5
        }
      }}
    >
      <Box style={glassTableStyle}>
        <Table variant="unstyled" size="sm">
          <Thead>
            <Tr>
              <Th>Quality</Th>
              <Th>Language</Th>
              <Th>Seeds</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            <AnimatePresence mode="wait">
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
                  />
                ))
              )}
            </AnimatePresence>
          </Tbody>
        </Table>
      </Box>
    </MotionBox>
  );
};