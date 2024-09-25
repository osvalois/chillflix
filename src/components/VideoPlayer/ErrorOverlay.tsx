import React from 'react';
import { Center, Text, VStack, Icon, Button } from "@chakra-ui/react";
import { WarningIcon } from '@chakra-ui/icons';

interface ErrorOverlayProps {
  isVisible: boolean;
  onRetry?: () => void;
}

export const ErrorOverlay: React.FC<ErrorOverlayProps> = ({ isVisible, onRetry }) => {
  if (!isVisible) return null;

  return (
    <Center
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.8)"
      zIndex={10}
    >
      <VStack spacing={4}>
        <Icon as={WarningIcon} w={10} h={10} color="red.500" />
        <Text color="white" fontSize="xl" fontWeight="bold" textAlign="center">
          An error occurred while playing the video
        </Text>
        <Text color="gray.300" fontSize="md" textAlign="center">
          Please check your internet connection and try again
        </Text>
        {onRetry && (
          <Button
            colorScheme="blue"
            onClick={onRetry}
            mt={4}
          >
            Retry
          </Button>
        )}
      </VStack>
    </Center>
  );
};