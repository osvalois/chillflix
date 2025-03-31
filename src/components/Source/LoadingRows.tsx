import React, { memo } from 'react';
import { Tr, Td, Skeleton, Box } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionSkeleton = motion(Skeleton);

// Optimizar el componente de carga con memoización
export const LoadingRows: React.FC = memo(() => {
  // Predefinir variantes de animación
  const skeletonVariants = {
    initial: { opacity: 0.4 },
    animate: (i: number) => ({
      opacity: [0.4, 0.7, 0.4],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        delay: i * 0.1,
        ease: "easeInOut"
      }
    })
  };

  return (
    <>
      {Array(5).fill(0).map((_, rowIndex) => (
        <Tr key={`loading-row-${rowIndex}`} style={{ height: '66px' }}>
          {Array(4).fill(0).map((_, cellIndex) => (
            <Td key={`loading-cell-${rowIndex}-${cellIndex}`}>
              <Box overflow="hidden" borderRadius="md">
                <MotionSkeleton 
                  height="42px"
                  width="100%"
                  startColor="gray.100"
                  endColor="gray.300"
                  borderRadius="md"
                  variants={skeletonVariants}
                  initial="initial"
                  animate="animate"
                  custom={rowIndex + cellIndex}
                  style={{ 
                    transform: 'translateZ(0)', // Forzar aceleración GPU
                    willChange: 'opacity' // Optimización de rendimiento
                  }}
                />
              </Box>
            </Td>
          ))}
        </Tr>
      ))}
    </>
  );
});