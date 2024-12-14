import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Box,
  Flex,
  HStack,
  useMediaQuery,
  useDisclosure,
  useBreakpointValue,
} from "@chakra-ui/react";
import { motion } from 'framer-motion';
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
  scrolled: {
    base: '56px',
    sm: '60px',
    md: '64px'
  },
  default: {
    base: '64px',
    sm: '72px',
    md: '80px'
  },
} as const;

const BLUR_VALUES = {
  scrolled: '16px',
  default: '8px',
} as const;

// Componentes Moción
const MotionBox = motion(Box as any);
// Hook personalizado para manejo del searchbar móvil
const useSearchBarVisibility = () => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const toggleSearch = useCallback(() => {
    setIsSearchVisible(prev => !prev);
  }, []);

  return { isSearchVisible, toggleSearch };
};

// Memorización de componentes puros
const HeaderContent = React.memo(({ 
  isLargeScreen,
  handleNavigation,
  navItems,
  isSearchVisible,
}: {
  isLargeScreen: boolean;
  onMobileMenuOpen: () => void;
  handleNavigation: (path: string) => void;
  navItems: any[];
  isSearchVisible: boolean;
  toggleSearch: () => void;
}) => {
  const searchBarWidth = useBreakpointValue({
    base: "100%",
    sm: "200px",
    md: "250px",
    lg: "300px",
    xl: "400px"
  });

  return (
    <Flex
      h="100%"
      alignItems="center"
      justifyContent="space-between"
      position="relative"
      flexDir={{ base: "column", sm: "row" }}
      gap={{ base: 2, sm: 0 }}
    >
      <HStack 
        spacing={{ base: 2, md: 8 }} 
        alignItems="center"
        w={{ base: "100%", sm: "auto" }}
        justifyContent={{ base: "space-between", sm: "flex-start" }}
      >

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

        <DesktopNav
            navItems={navItems}
            handleNavigation={handleNavigation}
          />

        {!isLargeScreen && (
          <SearchBar/>
        )}
      </HStack>

      <Box
        w={{ base: "100%", sm: searchBarWidth }}
        display={{
          base: isSearchVisible ? "block" : "none",
          sm: "block"
        }}
        transition="all 0.3s ease"
        position={{ base: "absolute", sm: "relative" }}
        top={{ base: "100%", sm: "auto" }}
        left="0"
        px={{ base: 4, sm: 0 }}
        pb={{ base: 2, sm: 0 }}
        bg={{ base: "rgba(255, 255, 255, 0.9)", sm: "transparent" }}
        backdropFilter={{ base: "blur(8px)", sm: "none" }}
        zIndex={1}
      >
        <SearchBar />
      </Box>
    </Flex>
  );
});

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
  
  const { isSearchVisible, toggleSearch } = useSearchBarVisibility();
  const headerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const navItems = useNavigationItems();
  const { gradients, themeColors } = useHeaderStyles();
  const isScrolled = useScrollDetection(SCROLL_THRESHOLD);

  const currentHeight = useBreakpointValue(
    isScrolled ? HEADER_HEIGHTS.scrolled : HEADER_HEIGHTS.default
  );

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
          px={{ base: 2, sm: 4, md: 6 }}
          py={{ base: 2, sm: 3, md: 4 }}
          style={{
            background: gradients.glass,
            backdropFilter: `blur(${isScrolled ? BLUR_VALUES.scrolled : BLUR_VALUES.default})`,
            borderBottom: '1px solid',
            borderColor: themeColors.border,
          }}
          initial={false}
          animate={{
            height: currentHeight,
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
            isSearchVisible={isSearchVisible}
            toggleSearch={toggleSearch}
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