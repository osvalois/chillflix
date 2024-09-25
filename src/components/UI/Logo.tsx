import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Flex, Image, Text, useColorModeValue, useTheme, useBreakpointValue } from '@chakra-ui/react';
import { motion, AnimatePresence, Variants, useAnimation } from 'framer-motion';
import { useSpring, animated, config, SpringValue } from 'react-spring';
import { useInView } from 'react-intersection-observer';
import { rgba } from 'polished';
import { useWindowSize } from 'react-use';

const MotionBox = motion(Box as any);
const MotionFlex = motion(Flex as any);
const AnimatedText = animated(Text);

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const theme = useTheme();
  const { width } = useWindowSize();
  const controls = useAnimation();

  const logoSize = useBreakpointValue({ base: "50px", sm: "60px", md: "70px", lg: "80px" });
  const fontSize = useBreakpointValue({ base: "lg", sm: "xl", md: "2xl", lg: "3xl" });
  const containerDirection = useBreakpointValue({ base: "row", md: "row" }) as "row" | "column";

  useEffect(() => {
    if (inView) {
      setIsLoaded(true);
      controls.start("visible");
    }
  }, [inView, controls]);

  useEffect(() => {
    controls.start({
      scale: width > 768 ? 1.05 : 1,
      transition: { duration: 0.5 }
    });
  }, [width, controls]);

  const handleHoverStart = useCallback(() => setIsHovered(true), []);
  const handleHoverEnd = useCallback(() => setIsHovered(false), []);

  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(0, 0, 0, 0.2)');
  const textGradient = useColorModeValue(
    'linear(to-r, #6A11CB, #2575FC)',
    'linear(to-r, #FC466B, #3F5EFB)'
  );
  const glowColor = useColorModeValue(
    rgba(theme.colors.purple[500], 0.4),
    rgba(theme.colors.blue[500], 0.4)
  );

  const logoSpring = useSpring({
    transform: isHovered
      ? 'scale(1.05) rotate(2deg) translateY(-5px)'
      : 'scale(1) rotate(0deg) translateY(0px)',
    config: { ...config.wobbly, tension: 300, friction: 10 },
  });

  const textSpring = useSpring({
    opacity: isLoaded ? 1 : 0,
    transform: isLoaded ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
    config: { ...config.molasses, duration: 1000 },
  });

  const letterAnimation: Variants = {
    hidden: { opacity: 0, y: 20, rotate: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: {
        delay: i * 0.05,
        type: 'spring',
        damping: 12,
        stiffness: 200,
      },
    }),
  };

  const glassMorphismStyle = useMemo(() => ({
    background: `linear-gradient(135deg, ${rgba(theme.colors.purple[500], 0.2)} 0%, ${rgba(theme.colors.blue[500], 0.2)} 100%)`,
    backdropFilter: 'blur(10px)',
    boxShadow: `0 8px 32px ${glowColor}, 0 4px 8px rgba(0, 0, 0, 0.1)`,
    border: '1px solid',
    borderColor: useColorModeValue(
      rgba(theme.colors.whiteAlpha[200], 0.18),
      rgba(theme.colors.whiteAlpha[50], 0.18)
    ),
  }), [theme.colors, glowColor, useColorModeValue]);

  const logoVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <MotionFlex
      ref={ref}
      className={className}
      direction={containerDirection}
      alignItems="center"
      justifyContent="flex-start"
      initial="hidden"
      animate={controls}
      variants={logoVariants}
    >
      <AnimatePresence>
        <animated.div style={logoSpring as any}>
          <MotionBox
            position="relative"
            width={logoSize}
            height={logoSize}
            borderRadius="2xl"
            overflow="hidden"
            {...glassMorphismStyle}
            animate={controls}
            onHoverStart={handleHoverStart}
            onHoverEnd={handleHoverEnd}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src="/chillflix.png"
              alt="Chillflix Logo"
              width="100%"
              height="100%"
              objectFit="cover"
              transition="transform 0.3s ease-in-out"
              transform={isHovered ? 'scale(1.1)' : 'scale(1)'}
            />
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bgGradient={textGradient}
              opacity="0.3"
              mixBlendMode="overlay"
            />
            <MotionBox
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bgGradient={`radial-gradient(circle, ${rgba(theme.colors.white, 0.3)} 0%, ${rgba(theme.colors.white, 0)} 70%)`}
              opacity={isHovered ? 0.8 : 0.4}
              transition={{ duration: 0.3 }}
              animate={{ rotate: isHovered ? 360 : 0 }}
            />
          </MotionBox>
        </animated.div>
      </AnimatePresence>
      <Flex
        direction="row"
        alignItems="center"
        justifyContent="flex-start"
        ml={containerDirection === "row" ? { base: 2, md: 4 } : 0}
        mt={containerDirection === "column" ? 2 : 0}
      >
        <AnimatedText
          fontSize={fontSize}
          fontWeight="bold"
          letterSpacing="tight"
          style={textSpring as SpringValue<any>}
          bgGradient={textGradient}
          bgClip="text"
          textAlign="left"
          filter={`drop-shadow(0 2px 4px ${rgba(theme.colors.black, 0.3)})`}
          fontFamily="'Montserrat', sans-serif"
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
                marginRight: letter === ' ' ? '0.2em' : '0.02em',
                textShadow: `0 0 10px ${rgba(theme.colors.purple[500], 0.5)}`,
              }}
            >
              {letter}
            </motion.span>
          ))}
        </AnimatedText>
      </Flex>
    </MotionFlex>
  );
};

export default Logo;