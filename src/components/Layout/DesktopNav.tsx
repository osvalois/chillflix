// DesktopNav.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Box, HStack, useBreakpointValue } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { useNavStyles } from '../../hooks/useNavStyles';
import { NavItemEnhanced } from '../Nav/NavItem';
import { containerVariants } from '../../theme/animations';
import { DesktopNavProps } from '../../types';

const MotionBox = motion(Box as any);

export const DesktopNav: React.FC<DesktopNavProps> = ({ navItems, handleNavigation }) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [ref, inView] = useInView({ threshold: 0.2 });
  const containerStyle = useNavStyles();

  // Enhanced responsive spacing
  const containerPadding = useBreakpointValue({ 
    base: 1,
    sm: 1.5,
    md: 2,
    lg: 2.5,
    xl: 3
  });

  const containerMargin = useBreakpointValue({ 
    base: 2,
    sm: 3,
    md: 4,
    lg: 5,
    xl: 6
  });

  const itemSpacing = useBreakpointValue({ 
    base: 0.5,
    sm: 1,
    md: 1.5,
    lg: 2,
    xl: 2.5
  });

  return (
    <MotionBox
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      style={containerStyle}
      borderRadius="full"
      p={containerPadding}
      mx={containerMargin}
      width={{
        base: '90vw',
        sm: '85vw',
        md: '80vw',
        lg: '75vw',
        xl: '70vw'
      }}
      maxWidth="1200px"
    >
      <HStack 
        spacing={itemSpacing} 
        px={containerPadding}
        justifyContent="center"
        flexWrap={{ base: 'wrap', md: 'nowrap' }}
      >
        {navItems.map((item) => (
          <NavItemEnhanced
            key={item.label}
            item={item}
            isActive={location.pathname === item.path}
            isHovered={hoveredItem === item.label}
            onClick={() => handleNavigation(item.path)}
            onHoverStart={() => setHoveredItem(item.label)}
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