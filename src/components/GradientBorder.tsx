import React from 'react';
import { useColorModeValue } from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';

interface GradientBorderProps {
  isVisible: boolean;
}

export const GradientBorder: React.FC<GradientBorderProps> = ({ isVisible }) => {
  const gradientColors = useColorModeValue(
    'linear-gradient(90deg, #00C9FF 0%, #92FE9D 50%, #00C9FF 100%)',
    'linear-gradient(90deg, #FC466B 0%, #3F5EFB 50%, #FC466B 100%)'
  );

  const controls = useAnimation();

  React.useEffect(() => {
    if (isVisible) {
      controls.start({
        pathLength: 1,
        opacity: 1,
        transition: { duration: 0.8, ease: "easeInOut" }
      });
    } else {
      controls.start({
        pathLength: 0,
        opacity: 0,
        transition: { duration: 0.4, ease: "easeInOut" }
      });
    }
  }, [isVisible, controls]);

  return (
    <svg
      style={{
        position: 'absolute',
        top: -2,
        left: -2,
        width: 'calc(100% + 4px)',
        height: 'calc(100% + 4px)',
        pointerEvents: 'none',
      }}
    >
      <motion.rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        rx="16"
        ry="16"
        fill="none"
        stroke={gradientColors}
        strokeWidth="3"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={controls}
      />
    </svg>
  );
};