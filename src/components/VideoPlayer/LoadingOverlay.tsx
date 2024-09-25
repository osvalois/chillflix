import React from 'react';
import { Center, Spinner, Text, VStack } from "@chakra-ui/react";

export const LoadingOverlay: React.FC = () => {
  return (
    <Center
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.7)"
      zIndex={10}
    >
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
        <Text color="white" fontSize="lg" fontWeight="bold">
          Loading...
        </Text>
      </VStack>
    </Center>
  );
};