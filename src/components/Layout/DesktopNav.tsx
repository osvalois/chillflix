import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Box, HStack } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { useMediaQuery } from 'react-responsive';
import { useNavStyles } from '../../hooks/useNavStyles';
import { NavItemEnhanced } from '../Nav/NavItem';
import { containerVariants } from '../../theme/animations';
import { DesktopNavProps } from '../../types';

const MotionBox = motion(Box as any);

export const DesktopNav: React.FC<DesktopNavProps> = ({ navItems, handleNavigation }) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [ref, inView] = useInView({ threshold: 0.2 });
  const isLargeScreen = useMediaQuery({ query: '(min-width: 1024px)' });
  const containerStyle = useNavStyles();

  return (
    <MotionBox
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      style={containerStyle}
      borderRadius="full"
      p={2}
      mx={4}
    >
      <HStack spacing={isLargeScreen ? 2 : 1} px={2}>
        {navItems.map((item) => (
          <NavItemEnhanced
            key={item.label}
            item={item}
            isActive={location.pathname === item.path}
            isHovered={hoveredItem === item.label}
            onClick={() => {
              handleNavigation(item.path);
            }}
            onHoverStart={() => {
              setHoveredItem(item.label);
            }}
            onHoverEnd={() => setHoveredItem(null)}
          />
        ))}
      </HStack>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.5); opacity: 0; }
          }
        `}
      </style>
    </MotionBox>
  );
};

export default React.memo(DesktopNav);

