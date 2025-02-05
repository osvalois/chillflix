// LoadingRows.tsx
import React from 'react';
import { Tr, Td, Skeleton } from '@chakra-ui/react';

export const LoadingRows: React.FC = () => {
  return (
    <>
      {Array(5).fill(0).map((_, rowIndex) => (
        <Tr key={`loading-row-${rowIndex}`}>
          {Array(4).fill(0).map((_, cellIndex) => (
            <Td key={`loading-cell-${rowIndex}-${cellIndex}`}>
              <Skeleton 
                height="20px"
                startColor="gray.100"
                endColor="gray.300"
                borderRadius="md"
              />
            </Td>
          ))}
        </Tr>
      ))}
    </>
  );
};