import React, { useMemo } from 'react';
import { Box, BoxProps, useColorModeValue, useTheme } from '@chakra-ui/react';
import { motion, MotionProps } from 'framer-motion';

export interface GlassmorphicBoxProps extends BoxProps {
  intensity?: number;
  tint?: string;
  blurAmount?: number;
  borderWidth?: number;
  isInteractive?: boolean;
  motionProps?: MotionProps;
}

const MotionBox = motion(Box);

export const GlassmorphicBox: React.FC<GlassmorphicBoxProps> = ({
  intensity = 0.5,
  tint,
  blurAmount = 10,
  borderWidth = 1,
  isInteractive = false,
  motionProps,
  children,
  ...rest
}) => {
  const theme = useTheme();

  const bgColor = useColorModeValue(
    `rgba(255, 255, 255, ${intensity})`,
    `rgba(0, 0, 0, ${intensity})`
  );

  const borderColor = useColorModeValue(
    'rgba(255, 255, 255, 0.3)',
    'rgba(255, 255, 255, 0.1)'
  );

  const customTint = tint 
    ? useColorModeValue(
        `${tint}${Math.round(intensity * 20).toString(16)}`,
        `${tint}${Math.round(intensity * 10).toString(16)}`
      )
    : undefined;

  const hoverStyles = useMemo(() => {
    if (!isInteractive) return {};
    return {
      _hover: {
        transform: 'scale(1.02)',
        boxShadow: 'xl',
        transition: 'all 0.2s ease-in-out',
      },
      _active: {
        transform: 'scale(0.98)',
      },
    };
  }, [isInteractive]);

  const boxStyles = useMemo(() => ({
    background: customTint || bgColor,
    backdropFilter: `blur(${blurAmount}px)`,
    borderRadius: 'xl',
    boxShadow: 'lg',
    border: `${borderWidth}px solid`,
    borderColor: borderColor,
    transition: 'all 0.3s ease-in-out',
    ...hoverStyles,
  }), [bgColor, customTint, blurAmount, borderWidth, borderColor, hoverStyles]);

  if (isInteractive) {
    return (
      <MotionBox
        {...boxStyles}
        {...rest}
        whileHover={{ scale: 1.02, boxShadow: theme.shadows.xl }}
        whileTap={{ scale: 0.98 }}
        {...motionProps}
      >
        {children}
      </MotionBox>
    );
  }

  return (
    <Box {...boxStyles} {...rest}>
      {children}
    </Box>
  );
};

export default GlassmorphicBox;