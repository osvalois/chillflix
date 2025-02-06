import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform, useSpring as useFramerSpring } from 'framer-motion';
import { 
  Box, 
  HStack,
  Text,
  Portal,
  useColorModeValue,
  useBreakpointValue,
  useTheme,
  useDisclosure,
  Tooltip,
  chakra,
  useMergeRefs
} from '@chakra-ui/react';
import { rgba, lighten, darken, transparentize } from 'polished';
import { useInView } from 'react-intersection-observer';
import { useSpring, animated } from 'react-spring';
import { useMediaQuery } from 'react-responsive';
import { useHotkeys } from 'react-hotkeys-hook';
import { useGesture } from '@use-gesture/react';
import { useParallax } from 'react-scroll-parallax';
import { useMeasure } from 'react-use';
import type { NavItem } from '../../types';
import { ANIMATION_PRESETS, ANIMATION_VARIANTS, VISUAL_EFFECTS } from '../../constants';
import MemoizedParticleEffect from '../common/MemoizedParticleEffect';

// Enhanced motion components with proper typing and performance optimizations
const MotionBox = chakra(motion(Box as any));
const MotionText = chakra(motion(Text as any));
const AnimatedBox = chakra(animated(Box));

// Enhanced responsive configuration with refined measurements
const ENHANCED_RESPONSIVE_CONFIG = {
  container: {
    base: { width: '44px', padding: '6px', maxW: '44px', minH: '40px' },
    sm: { width: '48px', padding: '8px', maxW: '48px', minH: '44px' },
    md: { width: 'auto', padding: '12px', maxW: '200px', minH: '48px' },
    lg: { width: 'auto', padding: '16px', maxW: '240px', minH: '52px' }
  },
  icon: {
    base: { size: 20, strokeWidth: 2 },
    sm: { size: 24, strokeWidth: 2 },
    md: { size: 26, strokeWidth: 1.75 },
    lg: { size: 28, strokeWidth: 1.5 }
  },
  text: {
    base: { size: 'xs', spacing: '0.2px', weight: 'medium' },
    sm: { size: 'sm', spacing: '0.3px', weight: 'medium' },
    md: { size: 'md', spacing: '0.4px', weight: 'semibold' },
    lg: { size: 'lg', spacing: '0.5px', weight: 'semibold' }
  },
  spacing: {
    base: { normal: 1.5, hover: 0.5, active: 2 },
    sm: { normal: 2, hover: 1, active: 2.5 },
    md: { normal: 3, hover: 1.5, active: 3.5 },
    lg: { normal: 4, hover: 2, active: 4.5 }
  },
  animation: {
    base: { 
      scale: 1.005, // Reducido significativamente de 1.02
      duration: 0.2, // Reducido para una respuesta más rápida
      springConfig: {
        mass: 0.3, // Reducido para menos inercia
        tension: 380, // Aumentado para más respuesta
        friction: 26 // Ajustado para un movimiento más suave
      }
    },
    sm: { 
      scale: 1.004, // Reducido de 1.015
      duration: 0.2,
      springConfig: {
        mass: 0.3,
        tension: 380,
        friction: 26
      }
    },
    md: { 
      scale: 1.003, // Reducido de 1.01
      duration: 0.2,
      springConfig: {
        mass: 0.3,
        tension: 380,
        friction: 26
      }
    },
    lg: { 
      scale: 1.002, // Reducido de 1.008
      duration: 0.2,
      springConfig: {
        mass: 0.3,
        tension: 380,
        friction: 26
      }
    }
  }
};

interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
  index?: number;
  showTooltip?: boolean;
  isHovered?: boolean;
  soundEnabled?: boolean;
  animationPreset?: keyof typeof ANIMATION_PRESETS;
  disableParallax?: boolean;
  className?: string;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

export const NavItemEnhanced = React.memo(({ 
  item, 
  isActive, 
  onClick, 
  index = 0,
  showTooltip = true,
  disableParallax = false,
  className
}: NavItemProps) => {
  // Enhanced hooks with better performance optimization
  const theme = useTheme();
  const controls = useAnimation();
  const [ref] = useMeasure<HTMLDivElement>();
  const itemRef = useRef<HTMLDivElement>(null);
  const { onOpen, onClose } = useDisclosure();
  const [isHovered, setIsHovered] = useState(false);
  const isReducedMotion = useMediaQuery({ query: '(prefers-reduced-motion: reduce)' });

  // Enhanced responsive values with refined breakpoints
  const showText = useBreakpointValue({ base: false, sm: false, md: true });
  const containerConfig = useBreakpointValue(ENHANCED_RESPONSIVE_CONFIG.container);
  const iconConfig = useBreakpointValue(ENHANCED_RESPONSIVE_CONFIG.icon);
  const textConfig = useBreakpointValue(ENHANCED_RESPONSIVE_CONFIG.text);
  const animationConfig = useBreakpointValue(ENHANCED_RESPONSIVE_CONFIG.animation);

  // Enhanced parallax effect with smoother animation
  const parallax = useParallax<HTMLDivElement>({
    disabled: disableParallax || isReducedMotion,
    speed: -3,
    translateY: [-5, 5],
    easing: 'easeInOutQuad'
  });

  // Enhanced intersection observer with dynamic threshold
  const [inViewRef, inView] = useInView({
    threshold: Array.from({ length: 20 }, (_, i) => i / 20),
    triggerOnce: true,
    delay: 50 * index,
    rootMargin: '50px'
  });

  // Enhanced theme values with refined color transitions
  const textColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const activeTextColor = useColorModeValue(
    darken(0.15, item.pulseColor),
    lighten(0.15, item.pulseColor)
  );
  const bgColor = useColorModeValue('whiteAlpha.900', 'blackAlpha.400');
  const activeBgColor = useColorModeValue(
    transparentize(0.9, item.pulseColor),
    transparentize(0.8, item.pulseColor)
  );

  // Enhanced motion values for smoother interactions
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-30, 30], [0.05, -0.05]); // Reducido de 0.1
  const rotateY = useTransform(mouseX, [-30, 30], [-0.05, 0.05]); // Reducido de 0.1
  const brightness = useTransform(
    mouseY,
    [-30, 0, 30],
    [1.002, 1, 0.998] // Reducido de [1.005, 1, 0.995]
  );
  // Enhanced spring animations with better performance
  const [spring, setSpring] = useSpring(() => ({
    scale: 1,
    rotate: 0,
    config: {
      mass: 0.3,
      tension: 400,
      friction: 26,
      clamp: false,
      velocity: 0
    }
  }));
  // Enhanced smooth motion values with better transitions
  const smoothRotateX = useFramerSpring(rotateX, {
    stiffness: 400, // Aumentado para más respuesta
    damping: 40, // Aumentado para menos oscilación
    mass: 0.2 // Reducido para menos inercia
  });
  
  const smoothRotateY = useFramerSpring(rotateY, {
    stiffness: 400,
    damping: 40,
    mass: 0.2
  });

  // Enhanced gesture handling with better response
  const bind = useGesture({
    onHover: ({ active }) => {
      setIsHovered(active);
      if (active) {
        handleHoverStart();
      } else {
        handleHoverEnd();
      }
    },
    onMove: ({ xy: [x, y] }) => {
      if (itemRef.current) {
        const rect = itemRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculamos la distancia desde el centro
        const deltaX = (x - centerX) * 0.5;
        const deltaY = (y - centerY) * 0.5;
        
        mouseX.set(deltaX);
        mouseY.set(deltaY);
      }
    }
  });


  // Enhanced interaction handlers with smoother animations
  const handleHoverStart = useCallback(() => {
    if (!isReducedMotion) {
      const config = animationConfig?.springConfig || {
        mass: 0.3,
        tension: 400,
        friction: 26
      };
      
      setSpring({ 
        scale: animationConfig?.scale || 1.003, // Reducido significativamente
        rotate: 0.02, // Reducido de 0.05
        config: {
          ...config,
          velocity: 0.05 // Reducido de 0.1
        }
      });
    }
    onOpen();
  }, [setSpring, onOpen, isReducedMotion, animationConfig]);


  const handleHoverEnd = useCallback(() => {
    if (!isReducedMotion) {
      setSpring({ 
        scale: 1,
        rotate: 0,
        config: {
          mass: 0.2,
          tension: 380,
          friction: 18
        }
      });
    }
    onClose();
  }, [setSpring, onClose, isReducedMotion]);

  const spacingConfig = useBreakpointValue(ENHANCED_RESPONSIVE_CONFIG.spacing);
  
  const currentSpacing = useMemo(() => {
    if (isActive) {
      return spacingConfig?.active;
    }
    return isHovered ? spacingConfig?.hover : spacingConfig?.normal;
  }, [isHovered, isActive, spacingConfig]);

  // Enhanced click handler with refined feedback
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      controls.start({
        opacity: [0, 0.6, 0],
        scale: [0.8, 1.2, 0],
        x: x,
        y: y,
        transition: { 
          duration: animationConfig?.duration || 0.3,
          ease: [0.32, 0.72, 0, 1]
        }
      });
    }
    
    onClick();
  }, [onClick, controls, animationConfig]);

  // Keyboard navigation
  useHotkeys(item.shortcut || '', onClick, [onClick]);

  // Animation on scroll into view
  useEffect(() => {
    if (inView) {
      controls.start('animate');
    }
  }, [controls, inView]);

  // Memoized styles with enhanced visual effects
  const containerStyle = useMemo(() => ({
    position: 'relative' as const,
    borderRadius: 'full',
    cursor: 'pointer',
    width: containerConfig?.width || 'auto',
    minHeight: containerConfig?.minH || '40px',
    padding: containerConfig?.padding || '8px',
    transition: `all ${theme.transition.duration.normal}`,
    transform: isActive ? 'translateY(-2px)' : 'none',
    backgroundColor: isActive ? activeBgColor : bgColor,
    ...VISUAL_EFFECTS.glassmorphism(item.pulseColor, isActive ? 0.8 : 0.5, isHovered)
  }), [isActive, isHovered, item.pulseColor, theme.transition.duration.normal, containerConfig, activeBgColor, bgColor]);

  return (
    <Tooltip
      isDisabled={!showTooltip || isHovered || showText}
      label={`${item.label} ${item.shortcut ? `(${item.shortcut})` : ''}`}
      placement="right"
      hasArrow
      openDelay={300}
      closeDelay={100}
      gutter={12}
      bg={transparentize(0.1, item.pulseColor)}
    >
      <MotionBox
        ref={useMergeRefs(itemRef, ref, inViewRef, parallax.ref)}
        custom={index}
        variants={ANIMATION_VARIANTS}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover="hover"
        whileTap="tap"
        style={{
          ...containerStyle,
          rotateX: smoothRotateX,
          rotateY: smoothRotateY,
          filter: `brightness(${brightness})`
        }}
        {...bind()}
        onClick={handleClick}
        className={className}
        role="button"
        aria-pressed={isActive}
        tabIndex={0}
      >
        <HStack 
       spacing={currentSpacing}
       align="center" 
       justify="center"
       position="relative"
       zIndex={1}
       width="100%"
       transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <AnimatedBox 
            style={spring}
            {...VISUAL_EFFECTS.item.glow(item.pulseColor)}
          >
            <Box
              color={isActive ? activeTextColor : textColor}
              transition="color 0.2s ease"
            >
              <item.icon 
                {...iconConfig}
                aria-hidden="true"
              />
            </Box>
          </AnimatedBox>

          <AnimatePresence>
            {isHovered && !isReducedMotion && (
              <MemoizedParticleEffect
              color={item.pulseColor}
              direction="horizontal"
              count={3}
              size={3}
              speed={0.4} 
              shapes={['circle']}
              blendMode="screen"
              interaction={true}
              enabled={true}
              spread={60}
              gravity={0.2}
              turbulence={0.8}
              fadeDistance={0.85}
              />
            )}
          </AnimatePresence>

          {showText && (
            <MotionText
              fontSize={textConfig?.size}
              letterSpacing={textConfig?.spacing}
              fontWeight={textConfig?.weight}
              color={isActive ? activeTextColor : textColor}
              maxW={containerConfig?.maxW}
              isTruncated
              style={{
                ...VISUAL_EFFECTS.text.glow(item.pulseColor, 2)
              }}
              animate={{
                scale: isActive ? 1.05 : 1,
                transition: ANIMATION_PRESETS.gentle
              }}
            >
              {item.label}
            </MotionText>
          )}
        </HStack>

        <AnimatePresence>
          {isActive && (
            <MotionBox
              position="absolute"
              bottom="-4px"
              left="50%"
              height="2px"
              initial={{ width: 0, x: '-50%', opacity: 0 }}
              animate={{ 
                width: '40%', 
                x: '-50%',
                opacity: 1,
                transition: {
                  type: 'spring',
                  stiffness: 400,
                  damping: 40
                }
              }}
              exit={{ 
                width: 0, 
                x: '-50%', 
                opacity: 0,
                transition: {
                  duration: 0.2,
                  ease: 'easeInOut'
                }
              }}
              style={{
                background: `linear-gradient(
                  to right,
                  ${rgba(item.pulseColor, 0.8)},
                  ${rgba(item.pulseColor, 0.4)}
                )`,
                borderRadius: 'full',
                boxShadow: `
                  0 0 8px ${rgba(item.pulseColor, 0.4)},
                  0 0 16px ${rgba(item.pulseColor, 0.2)}
                `
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isHovered && (
            <MotionBox
              position="absolute"
              inset={-2}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 0.12, 
                scale: 1,
                transition: {
                  duration: 0.3,
                  ease: 'easeOut'
                }
              }}
              exit={{ 
                opacity: 0, 
                scale: 1.2,
                transition: {
                  duration: 0.2,
                  ease: 'easeIn'
                }
              }}
              style={{
                background: `radial-gradient(
                  circle,
                  ${rgba(item.pulseColor, 0.5)} 0%,
                  transparent 70%
                )`,
                borderRadius: 'full',
                pointerEvents: 'none'
              }}
            />
          )}
        </AnimatePresence>

        <Portal>
          <MotionBox
            position="absolute"
            inset={0}
            borderRadius="full"
            animate={controls}
            style={{
              background: `radial-gradient(
                circle,
                ${rgba(item.pulseColor, 0.15)} 0%,
                transparent 50%
              )`,
              pointerEvents: 'none',
              zIndex: 0
            }}
          />
        </Portal>
      </MotionBox>
    </Tooltip>
  );
});

NavItemEnhanced.displayName = 'NavItemEnhanced';

export default NavItemEnhanced;