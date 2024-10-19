import React, { useMemo } from 'react';
import { Box, useColorModeValue, BoxProps, useTheme } from '@chakra-ui/react';
import { motion, MotionProps, useMotionTemplate, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { rgba, darken, lighten } from 'polished';

interface GlassmorphicBoxProps extends BoxProps, MotionProps {
  isActive?: boolean;
  intensity?: number;
  gradientColors?: string[];
  hoverEffect?: 'lift' | 'glow' | 'tilt' | 'none';
  glareEffect?: boolean;
  pulseEffect?: boolean;
  borderGlow?: boolean;
}

export const GlassmorphicBox: React.FC<GlassmorphicBoxProps> = React.memo(({
  isActive = false,
  intensity = 0.5,
  gradientColors,
  hoverEffect = 'lift',
  glareEffect = true,
  pulseEffect = false,
  borderGlow = false,
  children,
  ...props
}) => {
  const theme = useTheme();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const defaultLightColors = [theme.colors.blue[300], theme.colors.purple[300]];
  const defaultDarkColors = [theme.colors.blue[700], theme.colors.purple[700]];

  const colors = useColorModeValue(
    gradientColors || defaultLightColors,
    gradientColors || defaultDarkColors
  );

  const baseColor = useColorModeValue('255, 255, 255', '26, 32, 44');

  const glassEffect = useMemo(() => {
    const activeIntensity = isActive ? intensity + 0.1 : intensity;
    
    return {
      background: `linear-gradient(135deg, ${rgba(colors[0], activeIntensity)} 0%, ${rgba(colors[1], activeIntensity)} 100%)`,
      boxShadow: isActive 
        ? `0 8px 32px 0 rgba(${baseColor}, 0.37), inset 0 0 0 1px rgba(${baseColor}, 0.1)`
        : `0 4px 16px 0 rgba(${baseColor}, 0.2), inset 0 0 0 1px rgba(${baseColor}, 0.05)`,
      backdropFilter: 'blur(20px)',
      border: isActive 
        ? `1px solid rgba(${baseColor}, 0.2)`
        : `1px solid rgba(${baseColor}, 0.1)`,
      borderRadius: 'xl',
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    };
  }, [colors, isActive, intensity, baseColor]);

  const glareAngle = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `${Math.round((Math.atan2(y, x) * 180) / Math.PI)}deg`
  );

  const glareOpacity = useTransform(
    [mouseX, mouseY],
    ([x, y]) => Math.min(Math.sqrt(x * x + y * y) / 500, 0.5)
  );

  const glareBackground = useMotionTemplate`
    radial-gradient(
      circle at ${mouseX}px ${mouseY}px,
      rgba(255, 255, 255, 0.15) 0%,
      rgba(255, 255, 255, 0) 80%
    )
  `;

  const hoverVariants = {
    lift: {
      y: -5,
      boxShadow: `0 20px 40px rgba(${baseColor}, 0.15)`,
    },
    glow: {
      boxShadow: `0 0 25px ${rgba(colors[0], 0.6)}`,
    },
    tilt: {
      rotateX: useTransform(mouseY, [0, 300], [5, -5]),
      rotateY: useTransform(mouseX, [0, 300], [-5, 5]),
      z: 0,
    },
    none: {},
  };

  const pulseAnimation = pulseEffect ? {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {};

  const borderGlowColor = useColorModeValue(
    lighten(0.1, colors[0]),
    darken(0.1, colors[1])
  );

  const borderGlowEffect = borderGlow ? {
    boxShadow: `0 0 10px ${rgba(borderGlowColor, 0.5)}`,
    transition: {
      boxShadow: {
        duration: 1,
        repeat: Infinity,
        repeatType: "reverse" as const,
      }
    }
  } : {};

  const springConfig = { stiffness: 300, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [0, 300], [5, -5]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 300], [-5, 5]), springConfig);

  return (
    <Box
      as={motion.div}
      {...glassEffect}
      {...props}
      whileHover={{
        ...hoverVariants[hoverEffect],
        ...borderGlowEffect,
      }}
      animate={pulseAnimation}
      style={{
        ...(hoverEffect === 'tilt' ? { rotateX, rotateY, z: 0 } : {}),
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }}
      position="relative"
      overflow="hidden"
    >
      {children}
      {glareEffect && (
        <Box
          as={motion.div}
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          borderRadius="inherit"
          style={{
            background: glareBackground,
            opacity: glareOpacity,
            transform: `rotate(${glareAngle})`,
          }}
          pointerEvents="none"
        />
      )}
    </Box>
  );
});

GlassmorphicBox.displayName = 'GlassmorphicBox';

export default GlassmorphicBox;