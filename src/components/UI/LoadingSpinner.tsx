import { useEffect } from 'react';
import { Box, useColorModeValue, keyframes } from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import { rgba } from 'polished';

const spinKeyframes = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulseKeyframes = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const LoadingSpinner = () => {
  const controls = useAnimation();
  const bgColor = useColorModeValue('whiteAlpha.700', 'blackAlpha.700');
  const spinnerColor = useColorModeValue('purple.500', 'purple.200');
  const glowColor = useColorModeValue('purple.300', 'purple.600');

  useEffect(() => {
    controls.start({
      scale: [1, 1.2, 1],
      rotate: [0, 360],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    });
  }, [controls]);

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={`linear-gradient(135deg, ${rgba('#6B46C1', 0.6)} 0%, ${rgba('#D53F8C', 0.6)} 100%)`}
      backdropFilter="blur(10px)"
      zIndex="9999"
    >
      <motion.div animate={controls}>
        <Box
          width="100px"
          height="100px"
          position="relative"
          animation={`${pulseKeyframes} 2s ease-in-out infinite`}
        >
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            borderRadius="50%"
            border="4px solid"
            borderColor={spinnerColor}
            animation={`${spinKeyframes} 1.5s linear infinite`}
          />
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width="80%"
            height="80%"
            transform="translate(-50%, -50%)"
            borderRadius="50%"
            bg={bgColor}
            backdropFilter="blur(5px)"
            boxShadow={`0 0 20px ${glowColor}`}
          />
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width="60%"
            height="60%"
            transform="translate(-50%, -50%)"
            borderRadius="50%"
            border="4px solid"
            borderColor={spinnerColor}
            borderTopColor="transparent"
            animation={`${spinKeyframes} 1s linear infinite reverse`}
          />
        </Box>
      </motion.div>
    </Box>
  );
};

export default LoadingSpinner;