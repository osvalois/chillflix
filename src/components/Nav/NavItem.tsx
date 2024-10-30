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
import { useSpring, animated, config } from 'react-spring';
import { useMediaQuery } from 'react-responsive';
import { useHotkeys } from 'react-hotkeys-hook';
import { useGesture } from '@use-gesture/react';
import { useParallax } from 'react-scroll-parallax';
import { useMeasure } from 'react-use';
import type { NavItem } from '../../types';
import { ANIMATION_PRESETS, ANIMATION_VARIANTS, RESPONSIVE_CONFIG, VISUAL_EFFECTS } from '../../constants';
import MemoizedParticleEffect from '../common/MemoizedParticleEffect';

// Enhanced motion components with proper typing and performance optimizations
const MotionBox = chakra(motion(Box as any));
const MotionText = chakra(motion(Text as any));
const AnimatedBox = chakra(animated(Box));

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
  // Enhanced hooks
  const theme = useTheme();
  const controls = useAnimation();
  const [ref] = useMeasure<HTMLDivElement>();
  const itemRef = useRef<HTMLDivElement>(null);
  const { onOpen, onClose } = useDisclosure();
  const [isHovered, setIsHovered] = useState(false);
  const isReducedMotion = useMediaQuery({ query: '(prefers-reduced-motion: reduce)' });

  // Responsive values
  const showText = useBreakpointValue({ base: false, md: true });
  const containerWidth = useBreakpointValue({ 
    base: '40px',  // Más compacto en móvil
    md: 'auto'     // Auto en desktop
  });
  const containerPadding = useBreakpointValue({
    base: '8px',   // Padding más pequeño en móvil
    md: '16px'     // Padding normal en desktop
  });
  const stackSpacing = useBreakpointValue({
    base: 2,  // Menor espacio en móvil
    md: 3     // Espacio normal en desktop
  });

  const parallax = useParallax<HTMLDivElement>({
    disabled: disableParallax || isReducedMotion,
    speed: -5,
    translateY: [-10, 10]
  });

  // Intersection observer with threshold array for smoother animations
  const [inViewRef, inView] = useInView({
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    triggerOnce: true,
    delay: 100 * index
  });

  // Enhanced theme values
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const activeTextColor = useColorModeValue(
    darken(0.1, item.pulseColor),
    lighten(0.1, item.pulseColor)
  );
  const iconConfig = useBreakpointValue(RESPONSIVE_CONFIG.icon) ?? RESPONSIVE_CONFIG.icon.base;
  const containerConfig = useBreakpointValue(RESPONSIVE_CONFIG.container) ?? RESPONSIVE_CONFIG.container.base;
  const textConfig = useBreakpointValue(RESPONSIVE_CONFIG.text) ?? RESPONSIVE_CONFIG.text.base;
  const animationConfig = useBreakpointValue(RESPONSIVE_CONFIG.animation) ?? RESPONSIVE_CONFIG.animation.base;

  // Motion values for advanced interactions
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-100, 100], [10, -10]);
  const rotateY = useTransform(mouseX, [-100, 100], [-10, 10]);
  const brightness = useTransform(
    mouseY,
    [-100, 0, 100],
    [1.2, 1, 0.8]
  );

  // Spring animations for smooth interactions
  const [spring, setSpring] = useSpring(() => ({
    scale: 1,
    rotate: 0,
    config: isReducedMotion ? config.gentle : config.wobbly
  }));

  // Smooth motion values
  const smoothRotateX = useFramerSpring(rotateX, {
    stiffness: 300,
    damping: 30
  });
  const smoothRotateY = useFramerSpring(rotateY, {
    stiffness: 300,
    damping: 30
  });

  // Enhanced gesture handling
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
        mouseX.set(x - rect.left - rect.width / 2);
        mouseY.set(y - rect.top - rect.height / 2);
      }
    }
  });

  // Enhanced interaction handlers
  const handleHoverStart = useCallback(() => {
    if (!isReducedMotion) {
      setSpring({ 
        scale: animationConfig.scale,
        rotate: 5,
        config: {
          mass: 1,
          tension: 200,
          friction: 20
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
          mass: 1,
          tension: 200,
          friction: 20
        }
      });
    }
    onClose();
  }, [setSpring, onClose, isReducedMotion]);

  // Enhanced click handler with rich feedback
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      controls.start({
        opacity: [0, 0.8, 0],
        scale: [0.8, 1.4, 0],
        x: x,
        y: y,
        transition: { 
          duration: 0.6,
          ease: [0.32, 0.72, 0, 1]
        }
      });
    }
    
    onClick();
  }, [onClick, controls]);

  // Keyboard navigation
  useHotkeys(item.shortcut || '', onClick, [onClick]);

  // Animation on scroll into view
  useEffect(() => {
    if (inView) {
      controls.start('animate');
    }
  }, [controls, inView]);

  // Memoized styles with enhanced visual effects and responsive width
  const containerStyle = useMemo(() => ({
    position: 'relative' as const,
    borderRadius: 'full',
    cursor: 'pointer',
    width: containerWidth,
    padding: containerPadding,
    transition: `all ${theme.transition.duration.normal}`,
    transform: isActive ? 'translateY(-2px)' : 'none',
    ...VISUAL_EFFECTS.glassmorphism(item.pulseColor, isActive ? 1 : 0.5, isHovered)
  }), [isActive, isHovered, item.pulseColor, theme.transition.duration.normal, containerWidth, containerPadding]);

  return (
    <Tooltip
      isDisabled={!showTooltip || isHovered || showText}
      label={`${item.label} ${item.shortcut ? `(${item.shortcut})` : ''}`}
      placement="right"
      hasArrow
      openDelay={400}
      closeDelay={200}
      gutter={16}
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
          spacing={stackSpacing}
          align="center" 
          justify="center"
          position="relative"
          zIndex={1}
          width="100%"
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
                size={useBreakpointValue({ base: 20, md: 24 })}
                aria-hidden="true"
              />
            </Box>
          </AnimatedBox>

          {/* Particle effects on hover */}
          <AnimatePresence>
            {isHovered && !isReducedMotion && (
              <MemoizedParticleEffect
                color={item.pulseColor}
                direction="horizontal"
                count={6}
                size={6}
                speed={0.8} 
                shapes={['circle']}
                blendMode="screen"
                interaction={true}
                enabled={true}
                onComplete={() => console.log('Animation cycle completed')}
                className="w-64 h-64"    
                spread={100}
                gravity={0.5}
                turbulence={1.5}
                fadeDistance={0.8}
              />
            )}
          </AnimatePresence>

          {/* Responsive text */}
          {showText && (
            <MotionText
              fontSize={textConfig.size}
              letterSpacing={textConfig.spacing}
              fontWeight="semibold"
              color={isActive ? activeTextColor : textColor}
              maxW={containerConfig.maxW}
              isTruncated
              style={{
                ...VISUAL_EFFECTS.text.glow(item.pulseColor, 3)
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

        {/* Active indicator with enhanced animation */}
        <AnimatePresence>
          {isActive && (
            <MotionBox
              position="absolute"
              bottom="-7px"
              left="50%"
              height="2px"
              initial={{ width: 0, x: '-50%', opacity: 0 }}
              animate={{ 
                width: '50%', 
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
                  ${rgba(item.pulseColor, 1)},
                  ${rgba(item.pulseColor, 0.5)}
                )`,
                borderRadius: 'full',
                boxShadow: `
                  0 0 10px ${rgba(item.pulseColor, 0.5)},
                  0 0 20px ${rgba(item.pulseColor, 0.3)}
                `
              }}
            />
          )}
        </AnimatePresence>

        {/* Hover glow effect */}
        <AnimatePresence>
          {isHovered && (
            <MotionBox
              position="absolute"
              inset={-2}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 0.15, 
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
                  ${rgba(item.pulseColor, 0.6)} 0%,
                  transparent 70%
                )`,
                borderRadius: 'full',
                pointerEvents: 'none'
              }}
            />
          )}
        </AnimatePresence>

        {/* Click ripple effect */}
        <Portal>
          <MotionBox
            position="absolute"
            inset={0}
            borderRadius="full"
            animate={controls}
            style={{
              background: `radial-gradient(
                circle,
                ${rgba(item.pulseColor, 0.2)} 0%,
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