import { useState, useEffect } from 'react';
import { 
  Box, 
  Text, 
  VStack,
  HStack,
  useColorModeValue
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { FaFilm, FaMusic, FaTv } from 'react-icons/fa';
import { rgba } from 'polished';

const MotionBox = motion(Box as any);


const LoadingMessage = () => {
  const [currentCategory, setCurrentCategory] = useState(0);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const categories = [
    { icon: FaFilm, text: 'Movies' },
    { icon: FaTv, text: 'TV Shows' },
    { icon: FaMusic, text: 'Music' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {

    }, 50);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const categoryTimer = setInterval(() => {
      setCurrentCategory((prevCategory) => (prevCategory + 1) % categories.length);
    }, 2000);
    return () => clearInterval(categoryTimer);
  }, []);

  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(0, 0, 0, 0.1)');
  const glassEffect = `
    backdrop-filter: blur(10px);
    background: ${bgColor};
    box-shadow: 0 8px 32px 0 ${rgba('#000', 0.1)};
    border: 1px solid ${rgba('#fff', 0.18)};
  `;
  const textColor = useColorModeValue('gray.800', 'gray.200');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  return (
    <AnimatePresence>
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(0, 0, 0, 0.8)')}
        backdropFilter="blur(10px)"
        zIndex={9999}
      >
        <MotionBox
          css={glassEffect}
          borderRadius="xl"
          p={8}
          maxWidth={isMobile ? "90%" : "480px"}
          width="100%"
          textAlign="center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <VStack spacing={6}>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              Loading Your Entertainment
            </Text>
            
            <HStack spacing={4} justify="center">
              {categories.map((category, index) => (
                <MotionBox
                  key={index}
                  animate={{
                    scale: currentCategory === index ? 1.2 : 1,
                    opacity: currentCategory === index ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <VStack>
                    <Box as={category.icon} size="24px" color={accentColor} />
                    <Text fontSize="xs" color={textColor}>
                      {category.text}
                    </Text>
                  </VStack>
                </MotionBox>
              ))}
            </HStack>
            
            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
              Preparing your personalized streaming experience...
            </Text>
          </VStack>
        </MotionBox>
      </MotionBox>
    </AnimatePresence>
  );
};

export default LoadingMessage;