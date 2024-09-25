import React, { useState } from 'react';
import { Grid, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpIcon, Delete } from 'lucide-react';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onClose: () => void;
}

const keys = [
  'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
  'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
  'SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE',
  '123', 'SPACE', 'ENTER'
];

const MotionFlex = motion(Flex as any);

const GlassmorphicBox = ({ children, ...props }) => {
  const bg = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(0, 0, 0, 0.1)');
  const borderColor = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)');

  return (
    <Flex
      bg={bg}
      backdropFilter="blur(10px)"
      borderRadius="xl"
      boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
      border="1px solid"
      borderColor={borderColor}
      {...props}
    >
      {children}
    </Flex>
  );
};

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ onKeyPress }) => {
  const [capsLock, setCapsLock] = useState(false);
  const keyColor = useColorModeValue('gray.800', 'white');
  const keyBg = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)');
  const keyHoverBg = useColorModeValue('rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.2)');

  const handleKeyPress = (key: string) => {
    switch (key) {
      case 'SHIFT':
        setCapsLock(!capsLock);
        break;
      case 'SPACE':
        onKeyPress(' ');
        break;
      case 'DELETE':
        onKeyPress('Backspace');
        break;
      case 'ENTER':
        onKeyPress('Enter');
        break;
      default:
        onKeyPress(capsLock ? key.toUpperCase() : key.toLowerCase());
    }
  };

  return (
    <AnimatePresence>
      <MotionFlex
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        direction="column"
      >
        <GlassmorphicBox p={4} width="100%">
          <Grid templateColumns="repeat(10, 1fr)" gap={2}>
            {keys.map((key, index) => (
              <GlassmorphicBox
                key={index}
                as={motion.button}
                bg={keyBg}
                color={keyColor}
                whileHover={{ scale: 1.05, backgroundColor: keyHoverBg }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleKeyPress(key)}
                p={2}
                textAlign="center"
                fontWeight="bold"
                gridColumn={key === 'SPACE' ? 'span 3' : key === 'ENTER' ? 'span 2' : 'auto'}
                transition="all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)"
              >
                {key === 'DELETE' ? <Delete size={18} /> :
                 key === 'SHIFT' ? <ArrowUpIcon size={18} color={capsLock ? "blue.500" : keyColor} /> :
                 key === 'SPACE' ? '␣' :
                 <Text fontSize="sm">{key}</Text>}
              </GlassmorphicBox>
            ))}
          </Grid>
        </GlassmorphicBox>
      </MotionFlex>
    </AnimatePresence>
  );
};

export default VirtualKeyboard;