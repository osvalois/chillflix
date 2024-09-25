
// LoadingSpinner.tsx
import React from 'react';
import { Flex, Spinner } from "@chakra-ui/react";

interface LoadingSpinnerProps {
  isLoading: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ isLoading }) => (
  isLoading ? (
    <Flex 
      position="absolute" 
      top="0" 
      left="0" 
      width="100%" 
      height="100%" 
      alignItems="center"
      justifyContent="center"
      bg="rgba(0, 0, 0, 0.5)"
      color="white"
      fontSize="2xl"
    >
      <Spinner size="xl" color="white" />
    </Flex>
  ) : null
);
