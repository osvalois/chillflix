import React from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';

const Footer: React.FC = () => {
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');

  return (
    <Box as="footer" bg={bgColor} py={4} textAlign="center">
      <Text color={textColor}>
        © {new Date().getFullYear()} Chillflix. Todos los derechos reservados.
      </Text>
    </Box>
  );
};

export default Footer;