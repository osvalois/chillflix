import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Box, HStack, useBreakpointValue, useTheme } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { NavItemEnhanced } from '../Nav/NavItem';
import { DesktopNavProps, NavItem } from '../../types';
import { INTERSECTION_OPTIONS, enhancedContainerVariants } from '../../constants';

// Definimos breakpoints más específicos para pantallas medianas
const BREAKPOINT_SIZES = {
  sm: '30em',    // 480px
  md: '48em',    // 768px
  lg: '62em',    // 992px
  xl: '80em'     // 1280px
};

const MAX_WIDTH = { 
  base: '95%',
  sm: '85%',
  md: '90%',
  lg: '1200px'
};

// Optimized motion component with proper typing
const MotionBox = motion(Box as any);

export const DesktopNav: React.FC<DesktopNavProps> = React.memo(({ 
  navItems, 
  handleNavigation 
}) => {
  const theme = useTheme();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [ref, inView] = useInView(INTERSECTION_OPTIONS);
  
  // Hooks mejorados para responsive
  const containerPadding = useBreakpointValue({
    base: '3',
    sm: '4',
    md: '5',
    lg: '6'
  }) ?? '4';

  const containerMargin = useBreakpointValue({
    base: '2',
    sm: '3',
    md: '4',
    lg: '5'
  }) ?? '3';

  const itemSpacing = useBreakpointValue({
    base: '2',
    sm: '3',
    md: '4',
    lg: '5'
  }) ?? '3';

  // Memoized hover handlers
  const createHoverStartHandler = useCallback((label: string) => {
    return () => {
      requestAnimationFrame(() => setHoveredItem(label));
    };
  }, []);

  const handleHoverEnd = useCallback(() => {
    requestAnimationFrame(() => setHoveredItem(null));
  }, []);

  // Memoized navigation handler
  const createClickHandler = useCallback((path: string) => {
    return () => {
      requestAnimationFrame(() => handleNavigation(path));
    };
  }, [handleNavigation]);

  // Memoized item check
  const isItemActive = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  // Memoized nav items rendering con ajustes responsive
  const renderedNavItems = useMemo(() => {
    return navItems.map((item: NavItem) => (
      <NavItemEnhanced
        key={item.label}
        item={item}
        showTooltip={false}
        isActive={isItemActive(item.path)}
        isHovered={hoveredItem === item.label}
        onClick={createClickHandler(item.path)}
        onHoverStart={createHoverStartHandler(item.label)}
        onHoverEnd={handleHoverEnd}
      />
    ));
  }, [navItems, hoveredItem, isItemActive, createClickHandler, createHoverStartHandler, handleHoverEnd]);

  return (
    <MotionBox
      ref={ref}
      variants={enhancedContainerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      borderRadius="full"
      p={containerPadding}
      mx={containerMargin}
      width="100%"
      maxWidth={MAX_WIDTH}
      role="navigation"
      aria-label="Desktop navigation"
    >
      <HStack 
        spacing={itemSpacing} 
        px={containerPadding}
        justifyContent="center"
        alignItems="center"
        flexWrap={{ base: 'wrap', md: 'nowrap' }}
        minHeight={{
          base: '48px',
          md: '56px',
          lg: '64px'
        }}
        style={{ 
          gap: `${theme.space[itemSpacing as unknown as number]}`,
          transition: `all ${theme.transition.duration.normal}`,
        }}
      >
        {renderedNavItems}
      </HStack>

      <style>
        {`
          @media (max-width: ${BREAKPOINT_SIZES.md}) {
            .chakra-stack {
              row-gap: ${theme.space[2]};
            }
          }
          
          @keyframes pulse {
            0%, 100% { 
              transform: scale(1); 
              opacity: 0.6; 
            }
            50% { 
              transform: scale(1.5); 
              opacity: 0; 
            }
          }
        `}
      </style>
    </MotionBox>
  );
});

DesktopNav.displayName = 'DesktopNav';

export default DesktopNav;