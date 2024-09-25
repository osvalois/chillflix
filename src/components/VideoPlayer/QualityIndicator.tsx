import React from 'react';
import { Box, Text } from "@chakra-ui/react";

interface QualityIndicatorProps {
  quality: string;
}

export const QualityIndicator: React.FC<QualityIndicatorProps> = ({ quality }) => {
  return (
    <Box
      position="absolute"
      top={4}
      right={4}
      bg="rgba(0, 0, 0, 0.6)"
      px={2}
      py={1}
      borderRadius="md"
      zIndex={2}
    >
      <Text color="white" fontSize="sm" fontWeight="bold">
        {quality}
      </Text>
    </Box>
  );
};