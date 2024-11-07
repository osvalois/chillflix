import React, { useState } from 'react';
import { 
  Box, 
  Text, 
  VStack,
  HStack,
  useColorModeValue,
  Circle,
  Flex,
  useBreakpointValue
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilm, FaMusic, FaTv } from 'react-icons/fa';

// Types
interface Category {
  icon: React.ElementType;
  text: string;
  gradient: string;
  particleColor: string;
  shadowColor: string;
  accentColor: string;
}

// Constants
const CATEGORIES: Category[] = [
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
  }
];

const THEME_COLORS = {
  light: {
    primary: 'rgba(255,255,255,0.97)',
    secondary: 'rgba(255,255,255,0.8)',
    accent: 'rgba(255,255,255,0.95)',
    highlight: 'rgba(255,255,255,0.85)',
    subtle: 'rgba(255,255,255,0.75)',
    glow: 'rgba(255,255,255,0.4)'
  },
  dark: {
    primary: 'rgba(20,20,20,0.97)',
    secondary: 'rgba(20,20,20,0.8)',
    accent: 'rgba(25,25,25,0.95)',
    highlight: 'rgba(30,30,30,0.85)',
    subtle: 'rgba(15,15,15,0.75)',
    glow: 'rgba(0,0,0,0.4)'
  }
};

// Animations
const MotionBox = motion(Box as any);
const MotionCircle = motion(Circle as any);

// Components
const Particles = React.memo(({ color, density = 8 }: { color: string; density?: number }) => (
  <Box position="absolute" inset="0" overflow="hidden" pointerEvents="none">
    {Array.from({ length: density }).map((_, i) => (
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
));

Particles.displayName = 'Particles';

const BackgroundEffects = React.memo(() => (
  <>
    <Box 
      position="absolute"
      inset="0"
      bg="radial-gradient(circle, transparent 0%, rgba(0,0,0,0.15) 100%)"
      pointerEvents="none"
      style={{ backdropFilter: 'blur(40px)' }}
    />
    <MotionBox
      position="absolute"
      inset="0"
      opacity="0.1"
      pointerEvents="none"
      backgroundSize={{ base: '60px 60px', sm: '50px 50px', lg: '40px 40px' }}
      backgroundImage="url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0zMCAzMG0tMjggMGEyOCwyOCAwIDEsMSA1NiwwYTI4LDI4IDAgMSwxIC01NiwwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMC41IiBmaWxsPSJub25lIiBvcGFjaXR5PSIwLjIiLz4KPC9zdmc+')"
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
));

BackgroundEffects.displayName = 'BackgroundEffects';

const CategoryItem = React.memo(({ 
  category, 
  isActive, 
  isHovered,
  iconSize,
  onHoverStart,
  onHoverEnd 
}: {
  category: Category;
  isActive: boolean;
  isHovered: boolean;
  iconSize: string;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) => {
  const bgColor = useColorModeValue('whiteAlpha.700', 'blackAlpha.700');
  const borderColor = useColorModeValue('white', 'whiteAlpha.200');

  return (
    <MotionBox
      animate={{
        scale: isActive ? 1.2 : 0.9,
        opacity: isActive ? 1 : 0.6,
        y: isActive ? -12 : 0,
      }}
      transition={{ 
        duration: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      cursor="pointer"
      w={{ base: "30%", md: "auto" }}
      mb={{ base: 4, md: 0 }}
    >
      <VStack
        p={5}
        borderRadius="2xl"
        bg={bgColor}
        backdropFilter="blur(12px)"
        boxShadow={`0 8px 32px -4px ${category.shadowColor}`}
        border="1px solid"
        borderColor={borderColor}
        position="relative"
        overflow="hidden"
        transition="all 0.3s ease"
        transform={isHovered ? 'translateY(-4px)' : 'none'}
        _hover={{
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 36px -4px ${category.shadowColor}`,
          borderColor: category.accentColor
        }}
      >
        {isActive && <Particles color={category.particleColor} />}
        
        <Flex
          position="relative"
          justify="center"
          align="center"
          h={iconSize}
          w={iconSize}
        >
          <Box 
            as={category.icon} 
            size={iconSize}
            color="transparent"
            bgGradient={category.gradient}
            bgClip="text"
            filter="drop-shadow(0 2px 8px rgba(0,0,0,0.2))"
          />
        </Flex>
        
        <Text 
          fontSize={{ base: "xs", md: "sm" }}
          fontWeight="semibold"
          bgGradient={isActive ? category.gradient : 'none'}
          bgClip={isActive ? 'text' : 'none'}
          color={isActive ? 'transparent' : 'inherit'}
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
  );
});

CategoryItem.displayName = 'CategoryItem';

const LoadingMessage: React.FC = () => {
  const [currentCategory, setCurrentCategory] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hoverIndex, setHoverIndex] = useState(-1);
  
  const spacing = useBreakpointValue({ base: 4, md: 6, lg: 8 });
  const iconSize = useBreakpointValue({ base: "24px", md: "32px", lg: "40px" });
  const cardPadding = useBreakpointValue({ base: 6, md: 8, lg: 10 });

  // Effects
  React.useEffect(() => {
    const timer = setInterval(() => {
      setLoadingProgress(prev => {
        const increment = (100 - prev) * 0.05;
        return Math.min(prev + increment, 100);
      });
    }, 50);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCategory(prev => (prev + 1) % CATEGORIES.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Theme values
  const bgGradient = useColorModeValue(
    `radial-gradient(circle at 50% 50%, 
      ${THEME_COLORS.light.accent} 0%, 
      ${THEME_COLORS.light.primary} 25%,
      ${THEME_COLORS.light.highlight} 50%,
      ${THEME_COLORS.light.secondary} 75%,
      ${THEME_COLORS.light.subtle} 100%
    )`,
    `radial-gradient(circle at 50% 50%, 
      ${THEME_COLORS.dark.accent} 0%,
      ${THEME_COLORS.dark.primary} 25%,
      ${THEME_COLORS.dark.highlight} 50%,
      ${THEME_COLORS.dark.secondary} 75%,
      ${THEME_COLORS.dark.subtle} 100%
    )`
  );

  const cardBgGradient = useColorModeValue(
    `linear-gradient(165deg,
      ${THEME_COLORS.light.primary} 0%,
      ${THEME_COLORS.light.accent} 40%,
      ${THEME_COLORS.light.highlight} 60%,
      ${THEME_COLORS.light.secondary} 80%,
      ${THEME_COLORS.light.glow} 100%
    )`,
    `linear-gradient(165deg,
      ${THEME_COLORS.dark.primary} 0%,
      ${THEME_COLORS.dark.accent} 40%,
      ${THEME_COLORS.dark.highlight} 60%,
      ${THEME_COLORS.dark.secondary} 80%,
      ${THEME_COLORS.dark.glow} 100%
    )`
  );

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
        >
          <VStack spacing={spacing} position="relative">
            <HStack 
              spacing={spacing} 
              justify="center" 
              position="relative"
              flexWrap={{ base: "wrap", md: "nowrap" }}
            >
              {CATEGORIES.map((category, index) => (
                <CategoryItem
                  key={index}
                  category={category}
                  isActive={currentCategory === index}
                  isHovered={hoverIndex === index}
                  iconSize={iconSize ?? ''}
                  onHoverStart={() => setHoverIndex(index)}
                  onHoverEnd={() => setHoverIndex(-1)}
                />
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
                >
                  Preparing your personalized streaming experience
                </Text>
              </Flex>

              <AnimatePresence mode="wait">
                <MotionBox
                  key={Math.floor(loadingProgress / 30)}
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

              {/* Progress Indicator */}
              <Box
                w="full"
                h="2px"
                bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
                borderRadius="full"
                overflow="hidden"
                position="relative"
              >
                <MotionBox
                  position="absolute"
                  left="0"
                  top="0"
                  h="full"
                  bg={useColorModeValue('blue.500', 'blue.400')}
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: `${loadingProgress}%`,
                  }}
                  transition={{ 
                    duration: 0.5,
                    ease: "easeInOut"
                  }}
                />
              </Box>
            </VStack>
          </VStack>

          {/* Shimmer Effect */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            height="100%"
            pointerEvents="none"
            background="linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)"
            transform="translateX(-100%)"
            animation="shimmer 2s infinite"
          />
        </MotionBox>
      </MotionBox>
    </AnimatePresence>
  );
};

// Performance optimization
export default React.memo(LoadingMessage);