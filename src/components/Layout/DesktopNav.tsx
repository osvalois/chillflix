import React, { useState, useCallback, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { Box, HStack, useBreakpointValue, useTheme } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { useNavStyles } from '../../hooks/useNavStyles';
import { NavItemEnhanced } from '../Nav/NavItem';
import { DesktopNavProps, NavItem } from '../../types';

// Constants for better performance and maintainability
const VIEWPORT_SIZES = {
  base: '90vw',
  sm: '85vw',
  md: '80vw',
  lg: '75vw',
  xl: '70vw'
} as const;

const RESPONSIVE_SPACING = {
  padding: {
    base: 1,
    sm: 1.5,
    md: 2,
    lg: 2.5,
    xl: 3
  },
  margin: {
    base: 2,
    sm: 3,
    md: 4,
    lg: 5,
    xl: 6
  },
  itemSpacing: {
    base: 0.5,
    sm: 1,
    md: 1.5,
    lg: 2,
    xl: 2.5
  }
} as const;

const INTERSECTION_OPTIONS = {
  threshold: 0.2,
  triggerOnce: true
} as const;

const MAX_WIDTH = '1200px';

// Optimized motion component with proper typing
const MotionBox = motion(Box as any);

// Enhanced animation variants
const enhancedContainerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
      staggerChildren: 0.1
    }
  }
};

export const DesktopNav: React.FC<DesktopNavProps> = React.memo(({ 
  navItems, 
  handleNavigation 
}) => {
  const theme = useTheme();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [ref, inView] = useInView(INTERSECTION_OPTIONS);
  
  // Hooks at the top level
  const containerStyle = useNavStyles();
  const containerPadding = useBreakpointValue(RESPONSIVE_SPACING.padding) ?? RESPONSIVE_SPACING.padding.base;
  const containerMargin = useBreakpointValue(RESPONSIVE_SPACING.margin) ?? RESPONSIVE_SPACING.margin.base;
  const itemSpacing = useBreakpointValue(RESPONSIVE_SPACING.itemSpacing) ?? RESPONSIVE_SPACING.itemSpacing.base;

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

  // Memoized nav items rendering
  const renderedNavItems = useMemo(() => {
    return navItems.map((item: NavItem) => (
      <NavItemEnhanced
        key={item.label}
        item={item}
        isActive={isItemActive(item.path)}
        isHovered={hoveredItem === item.label}
        onClick={createClickHandler(item.path)}
        onHoverStart={createHoverStartHandler(item.label)}
        onHoverEnd={handleHoverEnd}
      />
    ));
  }, [navItems, hoveredItem, isItemActive, createClickHandler, createHoverStartHandler, handleHoverEnd]);

  // Memoized styles
  const containerStyles = useMemo(() => ({
    ...containerStyle,
    willChange: 'transform, opacity'
  }), [containerStyle]);

  return (
    <MotionBox
      ref={ref}
      variants={enhancedContainerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      style={containerStyles}
      borderRadius="full"
      p={containerPadding}
      mx={containerMargin}
      width={VIEWPORT_SIZES}
      maxWidth={MAX_WIDTH}
      role="navigation"
      aria-label="Desktop navigation"
    >
      <HStack 
        spacing={itemSpacing} 
        px={containerPadding}
        justifyContent="center"
        flexWrap={{ base: 'wrap', md: 'nowrap' }}
        style={{ 
          gap: `${theme.space[itemSpacing as number]}`,
          transition: `gap ${theme.transition.duration.normal}`
        }}
      >
        {renderedNavItems}
      </HStack>

      <style>
        {`
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