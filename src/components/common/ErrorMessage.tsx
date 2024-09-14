import React from 'react';
import { Box, Text, Button, VStack } from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <Box textAlign="center" py={10} px={6}>
      <WarningIcon boxSize={'50px'} color={'orange.300'} />
      <Text mt={4} mb={4} fontSize="lg">
        {message}
      </Text>
      {onRetry && (
        <Button
          colorScheme="brand"
          bgGradient="linear(to-r, brand.400, brand.500, brand.600)"
          color="white"
          variant="solid"
          onClick={onRetry}
        >
          Intentar de nuevo
        </Button>
      )}
    </Box>
  );
};

export default ErrorMessage;