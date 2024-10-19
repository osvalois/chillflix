import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Box, Flex, Image, Text, useColorModeValue, useTheme, useBreakpointValue } from '@chakra-ui/react';
import { motion, AnimatePresence, Variants, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { animated, useSpring, config } from 'react-spring';
import { useInView } from 'react-intersection-observer';
import { rgba, darken, lighten, mix, transparentize } from 'polished';

const MotionBox = motion(Box as any);
const MotionFlex = motion(Flex as any);
const AnimatedText = animated(Text);

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const theme = useTheme();
  const controls = useAnimation();
  const logoRef = useRef<HTMLDivElement>(null);

  const logoSize = useBreakpointValue({ base: "40px", sm: "45px", md: "50px", lg: "55px" });
  const fontSize = useBreakpointValue({ base: "lg", sm: "xl", md: "2xl", lg: "3xl" });
  const showText = useBreakpointValue({ base: false, md: true });

  const baseColor = useColorModeValue(theme.colors.blue[500], theme.colors.purple[400]);
  const accentColor = useColorModeValue(theme.colors.purple[500], theme.colors.pink[300]);
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  
  const glassBackground = useColorModeValue(
    `linear-gradient(135deg, ${rgba(baseColor, 0.05)} 0%, ${rgba(accentColor, 0.05)} 100%)`,
    `linear-gradient(135deg, ${rgba(darken(0.1, baseColor), 0.05)} 0%, ${rgba(lighten(0.1, accentColor), 0.05)} 100%)`
  );
  const glowColor = useColorModeValue(rgba(baseColor, 0.15), rgba(accentColor, 0.15));
  const borderColor = useColorModeValue(rgba(theme.colors.whiteAlpha[300], 0.1), rgba(theme.colors.whiteAlpha[100], 0.1));
  const textGradient = useColorModeValue(
    `linear(to-r, ${baseColor}, ${accentColor})`,
    `linear(to-r, ${lighten(0.1, baseColor)}, ${accentColor})`
  );

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-50, 50], [10, -10]);
  const rotateY = useTransform(x, [-50, 50], [-10, 10]);

  const handleHoverStart = useCallback(() => setIsHovered(true), []);
  const handleHoverEnd = useCallback(() => setIsHovered(false), []);
  const handlePressStart = useCallback(() => setIsPressed(true), []);
  const handlePressEnd = useCallback(() => setIsPressed(false), []);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (event.clientX - centerX) / (rect.width / 2);
    const distanceY = (event.clientY - centerY) / (rect.height / 2);
    
    x.set(distanceX * 50);
    y.set(distanceY * 50);
  }, [x, y]);

  const logoSpring = useSpring({
    scale: isPressed ? 0.95 : isHovered ? 1.05 : 1,
    rotateX: isHovered ? rotateX.get() : 0,
    rotateY: isHovered ? rotateY.get() : 0,
    config: { ...config.wobbly, tension: 300, friction: 10 },
  });

  const textSpring = useSpring({
    opacity: inView && showText ? 1 : 0,
    transform: inView && showText ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)',
    config: { ...config.molasses, duration: 800 },
  });

  const letterAnimation: Variants = {
    hidden: { opacity: 0, y: 10, rotate: -5 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: { delay: i * 0.03, type: 'spring', damping: 12, stiffness: 200 },
    }),
  };

  const particlesAnimation = useSpring({
    opacity: isHovered ? 0.8 : 0,
    scale: isHovered ? 1 : 0.5,
    config: { tension: 200, friction: 20 },
  });

  const glassMorphismStyle = useMemo(() => ({
    background: glassBackground,
    backdropFilter: 'blur(8px)',
    boxShadow: `0 4px 16px ${glowColor}, inset 0 0 16px ${rgba(glowColor, 0.3)}`,
    border: '1px solid',
    borderColor: borderColor,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease-in-out',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-50%',
      left: '-50%',
      right: '-50%',
      bottom: '-50%',
      background: `radial-gradient(circle, ${rgba(accentColor, 0.1)} 0%, transparent 70%)`,
      opacity: 0,
      transition: 'opacity 0.3s ease-in-out, transform 0.6s ease-in-out',
      transform: 'scale(0.5)',
    },
    '&:hover::before': {
      opacity: 1,
      transform: 'scale(1)',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(135deg, ${rgba(theme.colors.white, 0.1)} 0%, transparent 100%)`,
      opacity: 0.3,
      transition: 'opacity 0.3s ease-in-out',
    },
    '&:hover::after': {
      opacity: 0.5,
    },
  }), [glassBackground, glowColor, borderColor, accentColor, theme]);

  useEffect(() => {
    let frameId: number;
    const animate = () => {
      if (logoRef.current) {
        const rect = logoRef.current.getBoundingClientRect();
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const moveX = (centerX - rect.left - rect.width / 2) * 0.01;
        const moveY = (centerY - rect.top - rect.height / 2) * 0.01;
        logoRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }
      frameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frameId);
  }, []);

  const refractionEffect = useMemo(() => ({
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '10%',
      left: '10%',
      right: '10%',
      bottom: '10%',
      background: `linear-gradient(135deg, ${transparentize(0.9, baseColor)} 0%, ${transparentize(0.9, accentColor)} 100%)`,
      filter: 'blur(4px)',
      opacity: 0,
      transition: 'opacity 0.3s ease-in-out',
    },
    '&:hover::before': {
      opacity: 0.3,
    },
  }), [baseColor, accentColor]);

  const chromaticAberrationEffect = useCallback((color: string) => ({
    textShadow: `
      0.5px 0.5px 0 ${rgba(color, 0.2)},
      -0.5px -0.5px 0 ${rgba(color, 0.2)},
      0.5px -0.5px 0 ${rgba(color, 0.2)},
      -0.5px 0.5px 0 ${rgba(color, 0.2)}
    `,
  }), []);

  return (
    <MotionFlex
      ref={ref}
      className={className}
      direction="row"
      alignItems="center"
      justifyContent="flex-start"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      <AnimatePresence>
        <animated.div style={logoSpring as any}>
          <MotionBox
            ref={logoRef}
            position="relative"
            width={logoSize}
            height={logoSize}
            borderRadius="xl"
            sx={{ ...glassMorphismStyle, ...refractionEffect }}
            animate={controls}
            onHoverStart={handleHoverStart}
            onHoverEnd={handleHoverEnd}
            onTapStart={handlePressStart}
            onTap={handlePressEnd}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src="/chillflix.png"
              alt="Chillflix Logo"
              width="100%"
              height="100%"
              objectFit="cover"
              transition="transform 0.3s ease-in-out"
              transform={isHovered ? 'scale(1.05)' : 'scale(1)'}
            />
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bgGradient={textGradient}
              opacity="0.2"
              mixBlendMode="overlay"
            />
            <MotionBox
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bgGradient={`radial-gradient(circle, ${rgba(theme.colors.white, 0.2)} 0%, ${rgba(theme.colors.white, 0)} 70%)`}
              opacity={isHovered ? 0.6 : 0.3}
              transition={{ duration: 0.3 }}
              animate={{ rotate: isHovered ? 360 : 0 }}
            />
            <animated.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                ...particlesAnimation,
              }}
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <Box
                  key={i}
                  position="absolute"
                  top={`${Math.random() * 100}%`}
                  left={`${Math.random() * 100}%`}
                  width={`${0.5 + Math.random() * 1}px`}
                  height={`${0.5 + Math.random() * 1}px`}
                  borderRadius="full"
                  bg={mix(Math.random(), baseColor, accentColor)}
                  opacity={0.4}
                  animation={`float ${1 + Math.random() * 3}s infinite ease-in-out`}
                />
              ))}
            </animated.div>
          </MotionBox>
        </animated.div>
      </AnimatePresence>
      {showText && (
        <Flex
          direction="row"
          alignItems="center"
          justifyContent="flex-start"
          ml={{ base: 2, md: 3 }}
          height={logoSize}
        >
          <AnimatedText
            fontSize={fontSize}
            fontWeight="bold"
            letterSpacing="tight"
            style={textSpring}
            color={textColor}
            textShadow={`0 1px 5px ${rgba(baseColor, 0.2)}`}
          >
            {'Chillflix'.split('').map((letter, index) => (
              <motion.span
                key={index}
                variants={letterAnimation}
                initial="hidden"
                animate="visible"
                custom={index}
                style={{
                  display: 'inline-block',
                  marginRight: letter === ' ' ? '0.1em' : '0.01em',
                  ...chromaticAberrationEffect(mix(index / 8, baseColor, accentColor)),
                }}
              >
                {letter}
              </motion.span>
            ))}
          </AnimatedText>
        </Flex>
      )}
    </MotionFlex>
  );
};

export default Logo;