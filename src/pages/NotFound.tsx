import React from 'react';
import { Box, Heading, Text, Button, VStack, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const NotFound: React.FC = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.200');

  return (
    <Box textAlign="center" py={10} px={6} minHeight="100vh" bg={bgColor} color={textColor}>
      <VStack spacing={8} align="center" justify="center" height="full">
        <Heading
          display="inline-block"
          as="h2"
          size="4xl"
          bgGradient="linear(to-r, brand.400, brand.600)"
          backgroundClip="text"
        >
          404
        </Heading>
        <Text fontSize="18px" mt={3} mb={2}>
          Página no encontrada
        </Text>
        <Text color={'gray.500'} mb={6}>
          La página que estás buscando no parece existir
        </Text>

        <Button
          as={RouterLink}
          to="/"
          colorScheme="brand"
          bgGradient="linear(to-r, brand.400, brand.500, brand.600)"
          color="white"
          variant="solid"
        >
          Volver al inicio
        </Button>
      </VStack>
    </Box>
  );
};

export default NotFound;