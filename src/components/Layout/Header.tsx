import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Box,
  Flex,
  HStack,
  useMediaQuery,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { motion } from 'framer-motion';
import { Menu as MenuIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ParallaxProvider, Parallax } from 'react-scroll-parallax';

import Logo from "../UI/Logo";
import SearchBar from "../Search/SearchBar";
import { useNavigationItems } from "../Home/NavigationItems";
import { DesktopNav } from "./DesktopNav";
import { MobileMenu } from "./MobileMenu";
import { useHeaderStyles } from '../../hooks/useHeaderStyles';

// Definición de tipos
interface HeaderProps {
  className?: string;
}

// Constantes
const SCROLL_THRESHOLD = 50;
const HEADER_HEIGHTS = {
  scrolled: '64px',
  default: '80px',
} as const;

const BLUR_VALUES = {
  scrolled: '16px',
  default: '8px',
} as const;

// Componentes Moción
const MotionBox = motion(Box as any);

// Memorización de componentes puros
const HeaderContent = React.memo(({ 
  isLargeScreen,
  onMobileMenuOpen,
  handleNavigation,
  navItems
}: {
  isLargeScreen: boolean;
  onMobileMenuOpen: () => void;
  handleNavigation: (path: string) => void;
  navItems: any[]; // Tipo específico según NavigationItems
}) => (
  <Flex
    h="100%"
    alignItems="center"
    justifyContent="space-between"
    position="relative"
  >
    <HStack spacing={8} alignItems="center">
      {!isLargeScreen && (
        <IconButton
          aria-label="Open menu"
          icon={<MenuIcon size={24} />}
          variant="ghost"
          onClick={onMobileMenuOpen}
        />
      )}

      <Parallax translateX={[-5, 5]}>
        <MotionBox
          whileHover={{
            scale: 1.05,
            filter: 'brightness(1.2)',
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNavigation('/')}
          cursor="pointer"
        >
          <Logo />
        </MotionBox>
      </Parallax>

      {isLargeScreen && (
        <DesktopNav
          navItems={navItems}
          handleNavigation={handleNavigation}
        />
      )}
    </HStack>

    <SearchBar />
  </Flex>
));

HeaderContent.displayName = 'HeaderContent';

// Hook personalizado para manejar el scroll
const useScrollDetection = (threshold: number) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
};

const Header: React.FC<HeaderProps> = ({ className }) => {
  const [isLargeScreen] = useMediaQuery("(min-width: 48em)");
  const { 
    isOpen: isMobileMenuOpen, 
    onOpen: onMobileMenuOpen, 
    onClose: onMobileMenuClose 
  } = useDisclosure();
  
  const headerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const navItems = useNavigationItems();
  const { gradients, themeColors } = useHeaderStyles();
  const isScrolled = useScrollDetection(SCROLL_THRESHOLD);

  const handleNavigation = useCallback((path: string) => {
    navigate(path);
    if (!isLargeScreen) {
      onMobileMenuClose();
    }
  }, [navigate, isLargeScreen, onMobileMenuClose]);

  return (
    <ParallaxProvider>
      <Box
        as="header"
        position="fixed"
        w="100%"
        zIndex={1000}
        ref={headerRef}
        className={className}
      >
        <MotionBox
          px={6}
          py={4}
          style={{
            background: gradients.glass,
            backdropFilter: `blur(${isScrolled ? BLUR_VALUES.scrolled : BLUR_VALUES.default})`,
            borderBottom: '1px solid',
            borderColor: themeColors.border,
          }}
          initial={false}
          animate={{
            height: isScrolled ? HEADER_HEIGHTS.scrolled : HEADER_HEIGHTS.default,
          }}
          transition={{
            duration: 0.3,
            ease: 'easeInOut',
          }}
        >
          <HeaderContent
            isLargeScreen={isLargeScreen}
            onMobileMenuOpen={onMobileMenuOpen}
            handleNavigation={handleNavigation}
            navItems={navItems}
          />
        </MotionBox>

        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={onMobileMenuClose}
          navItems={navItems}
          handleNavigation={handleNavigation}
        />
      </Box>
    </ParallaxProvider>
  );
};

export default React.memo(Header);