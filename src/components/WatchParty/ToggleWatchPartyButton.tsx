import React from 'react';
import {
  Box,
  Button,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  useDisclosure,
  Tooltip,
  keyframes,
  chakra
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Users } from 'lucide-react';
import { useSound } from 'use-sound';
import { useMediaQuery } from 'react-responsive';
import { useSpring, animated } from 'react-spring';
import { rgba } from 'polished';

// Keyframes para el efecto de brillo
const glowKeyframes = keyframes`
  0% { box-shadow: 0 0 5px ${rgba('#4299E1', 0.5)}, 0 0 10px ${rgba('#4299E1', 0.3)}; }
  50% { box-shadow: 0 0 10px ${rgba('#9F7AEA', 0.5)}, 0 0 20px ${rgba('#9F7AEA', 0.3)}; }
  100% { box-shadow: 0 0 5px ${rgba('#4299E1', 0.5)}, 0 0 10px ${rgba('#4299E1', 0.3)}; }
`;

const MotionBox = motion(chakra.div as any);
const AnimatedBox = animated(Box);

interface ToggleWatchPartyButtonProps {
  isVisible: boolean;
  onToggle: () => void;
}

const ToggleWatchPartyButton: React.FC<ToggleWatchPartyButtonProps> = ({
  isVisible,
  onToggle
}) => {
  const { onToggle: onCollapseToggle } = useDisclosure();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  
  // Colores y efectos con tema
  const glassBackground = useColorModeValue(
    'rgba(255, 255, 255, 0.08)',
    'rgba(26, 32, 44, 0.08)'
  );
  const borderColor = useColorModeValue(
    'rgba(255, 255, 255, 0.15)',
    'rgba(255, 255, 255, 0.08)'
  );
  const buttonGlow = `${glowKeyframes} 3s infinite`;
  const textGradient = useColorModeValue(
    'linear(to-r, blue.400, purple.500)',
    'linear(to-r, blue.200, purple.300)'
  );

  // Efectos de sonido
  const [playToggleSound] = useSound('/path/to/toggle-sound.mp3', { volume: 0.3 });

  // Animaciones con react-spring
  const glassSpring = useSpring({
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 300, friction: 20 }
  });

  // Variantes para Framer Motion
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1, ease: "easeIn" }
    }
  };

  const handleClick = () => {
    onToggle();
    onCollapseToggle();
    playToggleSound();
  };

  return (
    <VStack spacing={6} w="full" position="relative">
      {/* Fondo decorativo animado */}
      <AnimatedBox
        position="absolute"
        top="-20px"
        left="50%"
        style={glassSpring}
        transform="translateX(-50%)"
        w="150%"
        h="150%"
        bgGradient="radial(circle at center, purple.500 0%, transparent 70%)"
        opacity={0.1}
        filter="blur(40px)"
        zIndex={-1}
      />

      <Tooltip
        label={isVisible ? "Hide watch party options" : "Show watch party options"}
        placement="top"
        hasArrow
        bg="gray.800"
        color="white"
        px={4}
        py={2}
        borderRadius="xl"
      >
        <MotionBox
          w="full"
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          <Button
            onClick={handleClick}
            w="full"
            h={20}
            position="relative"
            overflow="hidden"
            bg={glassBackground}
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor={borderColor}
            _hover={{ 
              transform: "translateY(-2px)",
              animation: isVisible ? "none" : buttonGlow
            }}
            _active={{ 
              transform: "translateY(1px)"
            }}
            transition="all 0.3s ease"
            borderRadius="2xl"
          >
            {/* Gradiente animado */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bgGradient="linear(to-r, purple.500 -20%, blue.500 60%, purple.500 140%)"
              opacity={0.1}
              transition="opacity 0.3s"
              _groupHover={{ opacity: 0.15 }}
            />

            {/* Efecto cristal */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="transparent"
              backdropFilter="blur(8px)"
              borderRadius="2xl"
            />

            <HStack spacing={6} justify="center" position="relative">
              {/* Icono animado */}
              <AnimatePresence mode="wait">
                <MotionBox
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Users
                    size={24}
                    color={useColorModeValue("#805AD5", "#B794F4")}
                  />
                </MotionBox>
              </AnimatePresence>

              {/* Texto del botón con gradiente */}
              <Text
                fontSize={isMobile ? "md" : "lg"}
                fontWeight="bold"
                letterSpacing="wider"
                bgGradient={textGradient}
                bgClip="text"
                transition="all 0.3s"
                _groupHover={{
                  letterSpacing: "widest"
                }}
              >
                {isVisible ? 'Hide Watch Party Options' : 'Show Watch Party Options'}
              </Text>

              {/* Chevron animado */}
              <MotionBox
                animate={{ 
                  rotate: isVisible ? 180 : 0,
                  scale: isVisible ? 1.2 : 1
                }}
                transition={{ 
                  duration: 0.4,
                  ease: "easeInOut"
                }}
              >
                <ChevronDown 
                  size={24}
                  color={useColorModeValue("#805AD5", "#B794F4")}
                />
              </MotionBox>
            </HStack>
          </Button>
        </MotionBox>
      </Tooltip>
      {/* Texto descriptivo con animación */}
      <AnimatePresence>
        {!isVisible && (
          <MotionBox
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Text
              fontSize="sm"
              bgGradient={textGradient}
              bgClip="text"
              textAlign="center"
              maxW="md"
              mx="auto"
              fontWeight="medium"
              letterSpacing="wide"
            >
              Join or create a watch party to enjoy movies together with friends
            </Text>
          </MotionBox>
        )}
      </AnimatePresence>
    </VStack>
  );
};

export default ToggleWatchPartyButton;