import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Box, HStack, useBreakpointValue, useTheme } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { NavItemEnhanced } from '../Nav/NavItem';
import { DesktopNavProps, NavItem } from '../../types';
import { INTERSECTION_OPTIONS, enhancedContainerVariants } from '../../constants';

// Componente MotionBox optimizado con tipado adecuado
const MotionBox = motion(Box);

export const DesktopNav: React.FC<DesktopNavProps> = React.memo(({ navItems, handleNavigation }) => {
  const theme = useTheme();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [ref, inView] = useInView(INTERSECTION_OPTIONS);

  // Valores responsivos mejorados, incluyendo breakpoint xl
  const containerPadding = useBreakpointValue({
    base: '3',
    sm: '4',
    md: '5',
    lg: '6',
    xl: '7'
  }) ?? '4';

  const containerMargin = useBreakpointValue({
    base: '2',
    sm: '3',
    md: '4',
    lg: '5',
    xl: '6'
  }) ?? '3';

  const itemSpacing = useBreakpointValue({
    base: '2',
    sm: '3',
    md: '4',
    lg: '5',
    xl: '6'
  }) ?? '3';

  // maxWidth y minHeight responsivos para distintos tamaños de pantalla
  const maxWidth = useBreakpointValue({
    base: '95%',
    sm: '85%',
    md: '90%',
    lg: '1200px',
    xl: '1400px'
  }) ?? '95%';

  const minHeight = useBreakpointValue({
    base: '48px',
    md: '56px',
    lg: '64px',
    xl: '72px'
  }) ?? '48px';

  // Handlers memorizados para hover y navegación
  const handleHoverStart = useCallback((label: string) => () => {
    requestAnimationFrame(() => setHoveredItem(label));
  }, []);

  const handleHoverEnd = useCallback(() => {
    requestAnimationFrame(() => setHoveredItem(null));
  }, []);

  const handleClick = useCallback((path: string) => () => {
    requestAnimationFrame(() => handleNavigation(path));
  }, [handleNavigation]);

  const isItemActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  // Renderizado memorizado de los items con ajustes responsivos
  const renderedNavItems = useMemo(() => {
    return navItems.map((item: NavItem) => (
      <NavItemEnhanced
        key={item.label}
        item={item}
        showTooltip={false}
        isActive={isItemActive(item.path)}
        isHovered={hoveredItem === item.label}
        onClick={handleClick(item.path)}
        onHoverStart={handleHoverStart(item.label)}
        onHoverEnd={handleHoverEnd}
      />
    ));
  }, [navItems, hoveredItem, isItemActive, handleClick, handleHoverStart, handleHoverEnd]);

  return (
    <MotionBox
      ref={ref}
      variants={enhancedContainerVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      borderRadius="full"
      p={containerPadding}
      mx={containerMargin}
      width="100%"
      maxWidth={maxWidth}
      role="navigation"
      aria-label="Desktop navigation"
    >
      <HStack
        spacing={itemSpacing}
        px={containerPadding}
        justifyContent="center"
        alignItems="center"
        flexWrap={{ base: 'wrap', md: 'nowrap' }}
        minHeight={minHeight}
        sx={{
          transition: `all ${theme.transition.duration.normal}`,
        }}
      >
        {renderedNavItems}
      </HStack>

      {/* Se define la animación "pulse" y ajustes de row-gap para pantallas menores a md */}
      <style>{`
        @media (max-width: 768px) {
          .chakra-stack {
            row-gap: ${theme.space['2']};
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
      `}</style>
    </MotionBox>
  );
});

DesktopNav.displayName = 'DesktopNav';

export default DesktopNav;
