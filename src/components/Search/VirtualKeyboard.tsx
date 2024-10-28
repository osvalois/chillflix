import React, { useState } from 'react';
import { Grid, Flex, Text, useColorModeValue, FlexProps } from '@chakra-ui/react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { ArrowUpIcon, Delete } from 'lucide-react';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onClose: () => void;
}

type GlassmorphicBoxProps = FlexProps & HTMLMotionProps<"div"> & {
  children: React.ReactNode;
};

const keys = [
  'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
  'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
  'SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE',
  '123', 'SPACE', 'ENTER'
] as const;

const MotionFlex = motion(Flex as any);

const GlassmorphicBox = motion(React.forwardRef<HTMLDivElement, GlassmorphicBoxProps>(
  ({ children, ...props }, ref) => {
    const bg = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(0, 0, 0, 0.1)');
    const borderColor = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)');

    return (
      <Flex
        ref={ref}
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
  }
));

GlassmorphicBox.displayName = 'GlassmorphicBox';

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
                as="button"
                bg={keyBg}
                color={keyColor}
                whileHover={{ scale: 1.05, backgroundColor: keyHoverBg }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleKeyPress(key)}
                p={2}
                textAlign="center"
                fontWeight="bold"
                gridColumn={key === 'SPACE' ? 'span 3' : key === 'ENTER' ? 'span 2' : 'auto'}
                transition={{ duration: 0.2 }}
              >
                {key === 'DELETE' ? <Delete size={18} /> :
                 key === 'SHIFT' ? <ArrowUpIcon style={{ color: capsLock ? "blue" : keyColor }} /> :
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