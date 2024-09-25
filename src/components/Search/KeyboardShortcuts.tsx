import React from 'react';
import { HStack, Text, Kbd, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionHStack = motion(HStack as any);

const KeyboardShortcuts: React.FC = () => {
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <MotionHStack
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      spacing={4}
      justify="center"
      mt={4}
    >
      <HStack>
        <Kbd>Enter</Kbd>
        <Text fontSize="xs" color={textColor}>search</Text>
      </HStack>
      <HStack>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
        <Text fontSize="xs" color={textColor}>focus</Text>
      </HStack>
      <HStack>
        <Kbd>↑</Kbd>
        <Kbd>↓</Kbd>
        <Text fontSize="xs" color={textColor}>navigate</Text>
      </HStack>
    </MotionHStack>
  );
};

export default KeyboardShortcuts;