import { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Text, 
  VStack,
  HStack,
  useColorModeValue,
  keyframes,
  Circle,
  Flex,
  useBreakpointValue
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { FaFilm, FaMusic, FaTv } from 'react-icons/fa';

const MotionBox = motion(Box as any);
const MotionCircle = motion(Circle as any);

// Animaciones mejoradas
const float = keyframes`
  0% { 
    transform: translateY(0px) rotate(0deg);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  20% { 
    transform: translateY(-3px) rotate(0.5deg);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  40% { 
    transform: translateY(-7px) rotate(1.5deg);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  50% { 
    transform: translateY(-10px) rotate(2deg);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  60% { 
    transform: translateY(-7px) rotate(1.5deg);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  80% { 
    transform: translateY(-3px) rotate(0.5deg);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  100% { 
    transform: translateY(0px) rotate(0deg);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const shimmer = keyframes`
  0% { 
    background-position: -200% 0;
    opacity: 0.4;
    filter: saturate(0.8) brightness(0.9);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  20% {
    opacity: 0.5;
    filter: saturate(0.9) brightness(0.95);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  40% {
    opacity: 0.7;
    filter: saturate(1) brightness(1);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  50% { 
    opacity: 0.8;
    filter: saturate(1.1) brightness(1.05);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  60% {
    opacity: 0.7;
    filter: saturate(1) brightness(1);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  80% {
    opacity: 0.5;
    filter: saturate(0.9) brightness(0.95);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  100% { 
    background-position: 200% 0;
    opacity: 0.4;
    filter: saturate(0.8) brightness(0.9);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const glow = keyframes`
  0% { 
    filter: drop-shadow(0 0 8px rgba(82, 178, 255, 0.4)) brightness(1) contrast(1);
    transform: scale(1) rotate(0deg) translateZ(0);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  20% {
    filter: drop-shadow(0 0 10px rgba(82, 178, 255, 0.45)) brightness(1.05) contrast(1.02);
    transform: scale(1.02) rotate(0.75deg) translateZ(0);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  40% {
    filter: drop-shadow(0 0 14px rgba(82, 178, 255, 0.55)) brightness(1.15) contrast(1.04);
    transform: scale(1.07) rotate(2deg) translateZ(0);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  50% { 
    filter: drop-shadow(0 0 16px rgba(82, 178, 255, 0.6)) brightness(1.2) contrast(1.05);
    transform: scale(1.1) rotate(3deg) translateZ(0);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  60% {
    filter: drop-shadow(0 0 14px rgba(82, 178, 255, 0.55)) brightness(1.15) contrast(1.04);
    transform: scale(1.07) rotate(2deg) translateZ(0);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  80% {
    filter: drop-shadow(0 0 10px rgba(82, 178, 255, 0.45)) brightness(1.05) contrast(1.02);
    transform: scale(1.02) rotate(0.75deg) translateZ(0);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  100% { 
    filter: drop-shadow(0 0 8px rgba(82, 178, 255, 0.4)) brightness(1) contrast(1);
    transform: scale(1) rotate(0deg) translateZ(0);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
`;
const lightColors = {
  primary: 'rgba(255,255,255,0.97)',
  secondary: 'rgba(255,255,255,0.8)',
  accent: 'rgba(255,255,255,0.95)',
  highlight: 'rgba(255,255,255,0.85)',
  subtle: 'rgba(255,255,255,0.75)',
  glow: 'rgba(255,255,255,0.4)'
};

const darkColors = {
  primary: 'rgba(20,20,20,0.97)',
  secondary: 'rgba(20,20,20,0.8)',
  accent: 'rgba(25,25,25,0.95)',
  highlight: 'rgba(30,30,30,0.85)',
  subtle: 'rgba(15,15,15,0.75)',
  glow: 'rgba(0,0,0,0.4)'
};
const rotateGradient = keyframes`
  0% { 
    transform: rotate(0deg) scale(1) translateZ(0);
    filter: hue-rotate(0deg);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  20% {
    transform: rotate(72deg) scale(1.02) translateZ(0);
    filter: hue-rotate(20deg);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  40% {
    transform: rotate(144deg) scale(1.07) translateZ(0);
    filter: hue-rotate(40deg);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  50% { 
    transform: rotate(180deg) scale(1.1) translateZ(0);
    filter: hue-rotate(50deg);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  60% {
    transform: rotate(216deg) scale(1.07) translateZ(0);
    filter: hue-rotate(40deg);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  80% {
    transform: rotate(288deg) scale(1.02) translateZ(0);
    filter: hue-rotate(20deg);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  100% { 
    transform: rotate(360deg) scale(1) translateZ(0);
    filter: hue-rotate(0deg);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const LoadingMessage = () => {
  const [currentCategory, setCurrentCategory] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hoverIndex, setHoverIndex] = useState(-1);
  
  // Breakpoints responsivos mejorados
  const isMobile = useMediaQuery({ maxWidth: 480 });

  const spacing = useBreakpointValue({ base: 4, md: 6, lg: 8 });
  const iconSize = useBreakpointValue({ base: "24px", md: "32px", lg: "40px" });
  const cardPadding = useBreakpointValue({ base: 6, md: 8, lg: 10 });

  const categories = useMemo(() => [
    { 
      icon: FaFilm, 
      text: 'Movies',
      gradient: 'linear(to-r, pink.400, purple.500)',
      particleColor: 'pink.400',
      shadowColor: 'rgba(255, 102, 178, 0.3)',
      accentColor: 'pink.200'
    },
    { 
      icon: FaTv, 
      text: 'Shows',
      gradient: 'linear(to-r, purple.400, blue.500)',
      particleColor: 'purple.400',
      shadowColor: 'rgba(147, 112, 219, 0.3)',
      accentColor: 'purple.200'
    },
    { 
      icon: FaMusic, 
      text: 'Music',
      gradient: 'linear(to-r, blue.400, cyan.500)',
      particleColor: 'blue.400',
      shadowColor: 'rgba(82, 178, 255, 0.3)',
      accentColor: 'blue.200'
    },
  ], []);

  // Efectos de carga mejorados
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingProgress(prev => {
        const increment = (100 - prev) * 0.05;
        return Math.min(prev + increment, 100);
      });
    }, 50);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const categoryTimer = setInterval(() => {
      setCurrentCategory(prev => (prev + 1) % categories.length);
    }, 2500);
    return () => clearInterval(categoryTimer);
  }, [categories.length]);

  // Gradientes y efectos de fondo mejorados
 // Gradientes de fondo principales refinados
const bgGradient = useColorModeValue(
  `radial-gradient(circle at 50% 50%, 
    ${lightColors.accent} 0%, 
    ${lightColors.primary} 25%,
    ${lightColors.highlight} 50%,
    ${lightColors.secondary} 75%,
    ${lightColors.subtle} 100%
  )`,
  `radial-gradient(circle at 50% 50%, 
    ${darkColors.accent} 0%,
    ${darkColors.primary} 25%,
    ${darkColors.highlight} 50%,
    ${darkColors.secondary} 75%,
    ${darkColors.subtle} 100%
  )`
);


const cardBgGradient = useColorModeValue(
  `linear-gradient(165deg,
    ${lightColors.primary} 0%,
    ${lightColors.accent} 20%,
    ${lightColors.highlight} 40%,
    ${lightColors.secondary} 60%,
    ${lightColors.subtle} 80%,
    ${lightColors.glow} 100%
  )`,
  `linear-gradient(165deg,
    ${darkColors.primary} 0%,
    ${darkColors.accent} 20%,
    ${darkColors.highlight} 40%,
    ${darkColors.secondary} 60%,
    ${darkColors.subtle} 80%,
    ${darkColors.glow} 100%
  )`
);

  // Sistema de partículas mejorado
  const Particles = ({ color, density = 8 }: { color: string; density?: number }) => (
    <Box position="absolute" inset="0" overflow="hidden" pointerEvents="none">
      {[...Array(density)].map((_, i) => (
        <MotionCircle
          key={i}
          position="absolute"
          size={`${Math.random() * 6 + 2}px`}
          bg={color}
          filter={`blur(${Math.random() * 2}px)`}
          initial={{ 
            x: Math.random() * 100 - 50,
            y: Math.random() * 100 - 50,
            opacity: 0,
            scale: 0
          }}
          animate={{ 
            x: Math.random() * 200 - 100,
            y: Math.random() * 200 - 100,
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0.5]
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2
          }}
        />
      ))}
    </Box>
  );

  // Efectos de fondo mejorados
  const BackgroundEffects = () => {
    return (
      <>
        {/* Radial gradient overlay */}
        <div 
          className="absolute inset-0 bg-gradient-radial from-transparent to-black/15 pointer-events-none blur-[40px]"
        />
        
        {/* Animated pattern overlay */}
        <motion.div
          className="absolute inset-0 opacity-10 pointer-events-none bg-[length:60px_60px] sm:bg-[length:50px_50px] lg:bg-[length:40px_40px]"
          style={{
            backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0zMCAzMG0tMjggMGEyOCwyOCAwIDEsMSA1NiwwYTI4LDI4IDAgMSwxIC01NiwwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMC41IiBmaWxsPSJub25lIiBvcGFjaXR5PSIwLjIiLz4KPC9zdmc+')`
          }}
          animate={{
            backgroundPosition: ["0px 0px", "60px 60px"],
            opacity: [0.05, 0.1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </>
    );
  };
  return (
    <AnimatePresence>
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        position="fixed"
        inset="0"
        display="flex"
        alignItems="center"
        justifyContent="center"
        background={bgGradient}
        backdropFilter="blur(20px)"
        zIndex="overlay"
      >
        <BackgroundEffects />
        
        <MotionBox
          bgGradient={cardBgGradient}
          borderRadius={{ base: "2xl", md: "3xl" }}
          p={cardPadding}
          maxW={{ base: "90%", md: "520px", lg: "580px" }}
          w="full"
          textAlign="center"
          boxShadow="2xl"
          border="1px solid"
          borderColor={useColorModeValue('white', 'whiteAlpha.200')}
          backdropFilter="blur(16px)"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: 'absolute',
            inset: '-2px',
            background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent)',
            animation: `${shimmer} 3s infinite linear`,
            backgroundSize: '200% 100%'
          }}
          _after={{
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1), transparent 70%)',
            animation: `${rotateGradient} 8s infinite linear`
          }}
        >
          <VStack spacing={spacing} position="relative">
            <HStack 
              spacing={spacing} 
              justify="center" 
              position="relative"
              flexWrap={{ base: "wrap", md: "nowrap" }}
            >
              <Box
                position="absolute"
                inset="0"
                background="radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1), transparent 70%)"
                filter="blur(20px)"
                transform="scale(1.2)"
              />
              
              {categories.map((category, index) => (
                <MotionBox
                  key={index}
                  animate={{
                    scale: currentCategory === index ? 1.2 : 0.9,
                    opacity: currentCategory === index ? 1 : 0.6,
                    y: currentCategory === index ? -12 : 0,
                  }}
                  transition={{ 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  onHoverStart={() => setHoverIndex(index)}
                  onHoverEnd={() => setHoverIndex(-1)}
                  cursor="pointer"
                  w={{ base: "30%", md: "auto" }}
                  mb={{ base: 4, md: 0 }}
                >
                  <VStack
                    p={5}
                    borderRadius="2xl"
                    bg={useColorModeValue('whiteAlpha.700', 'blackAlpha.700')}
                    backdropFilter="blur(12px)"
                    boxShadow={`0 8px 32px -4px ${category.shadowColor}`}
                    border="1px solid"
                    borderColor={useColorModeValue('white', 'whiteAlpha.200')}
                    position="relative"
                    overflow="hidden"
                    transition="all 0.3s ease"
                    transform={hoverIndex === index ? 'translateY(-4px)' : 'none'}
                    _hover={{
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 36px -4px ${category.shadowColor}`,
                      borderColor: category.accentColor
                    }}
                  >
                    {currentCategory === index && <Particles color={category.particleColor} density={isMobile ? 6 : 8} />}
                    
                    <Flex
                      position="relative"
                      justify="center"
                      align="center"
                      h={iconSize}
                      w={iconSize}
                      animation={currentCategory === index ? `${float} 3s infinite ease-in-out` : 'none'}
                    >
                      <Box 
                        as={category.icon} 
                        size={iconSize}
                        color="transparent"
                        bgGradient={category.gradient}
                        bgClip="text"
                        filter="drop-shadow(0 2px 8px rgba(0,0,0,0.2))"
                        animation={currentCategory === index ? `${glow} 2s infinite ease-in-out` : 'none'}
                      />
                    </Flex>
                    
                    <Text 
                      fontSize={{ base: "xs", md: "sm" }}
                      fontWeight="semibold"
                      bgGradient={currentCategory === index ? category.gradient : 'none'}
                      bgClip={currentCategory === index ? 'text' : 'none'}
                      color={currentCategory === index ? 'transparent' : 'inherit'}
                      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
                      textAlign="center"
                      whiteSpace="nowrap"
                      transition="all 0.3s ease"
                      _hover={{
                        transform: 'scale(1.05)',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                      }}
                    >
                      {category.text}
                    </Text>
                  </VStack>
                </MotionBox>
              ))}
            </HStack>
            
            <VStack spacing={4} w="full" position="relative">

              <Flex 
                justify="space-between" 
                align="center" 
                w="full"
                px={2}
              >
                <Text 
                  fontSize={{ base: "xs", md: "sm" }}
                  color={useColorModeValue('gray.600', 'gray.400')}
                  fontWeight="medium"
                  textShadow="0 1px 2px rgba(0,0,0,0.1)"
                  letterSpacing="wide"
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
           
                  Preparing your personalized streaming experience
                </Text>
              </Flex>

              {/* Mensajes de estado */}
              <AnimatePresence mode="wait">
                <MotionBox
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Text
                    fontSize="xs"
                    color={useColorModeValue('gray.500', 'gray.500')}
                    fontStyle="italic"
                    opacity={0.8}
                  >
                    {loadingProgress < 30 ? 'Gathering content...' :
                     loadingProgress < 60 ? 'Personalizing your experience...' :
                     loadingProgress < 90 ? 'Almost there...' :
                     'Finishing up...'}
                  </Text>
                </MotionBox>
              </AnimatePresence>
            </VStack>
          </VStack>
        </MotionBox>
      </MotionBox>
    </AnimatePresence>
  );
};

export default LoadingMessage;