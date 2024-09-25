import { useColorModeValue } from '@chakra-ui/react';

export const useDynamicBackground = () => {
  const bgGradient = useColorModeValue(
    "linear(to-br, purple.400, pink.200)",
    "linear(to-br, purple.900, pink.700)"
  );
  const textColor = useColorModeValue("gray.800", "white");

  return { bgGradient, textColor };
};