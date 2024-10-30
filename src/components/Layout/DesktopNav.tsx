import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Box, HStack, useBreakpointValue, useTheme } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { useNavStyles } from '../../hooks/useNavStyles';
import { NavItemEnhanced } from '../Nav/NavItem';
import { DesktopNavProps, NavItem } from '../../types';
import { INTERSECTION_OPTIONS, RESPONSIVE_SPACING, VIEWPORT_SIZES, enhancedContainerVariants } from '../../constants';

const MAX_WIDTH = '1200px';

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
        showTooltip={false}
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