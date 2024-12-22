import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Box,
  Flex,
  HStack,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useMediaQuery,
  useDisclosure,
  useBreakpointValue,
  Text,
} from "@chakra-ui/react";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ParallaxProvider, Parallax } from 'react-scroll-parallax';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { analyticsService } from '../../config/firebase';

import Logo from "../UI/Logo";
import SearchBar from "../Search/SearchBar";
import { useNavigationItems } from "../Home/NavigationItems";
import { DesktopNav } from "./DesktopNav";
import { MobileMenu } from "./MobileMenu";
import { useHeaderStyles } from '../../hooks/useHeaderStyles';

// Tipos
interface HeaderProps {
  className?: string;
}

// Constantes
const SCROLL_THRESHOLD = 50;
const HEADER_HEIGHTS = {
  scrolled: {
    base: '60px',
    sm: '64px',
    md: '68px'
  },
  default: {
    base: '70px',
    sm: '76px',
    md: '84px'
  },
} as const;

const BLUR_VALUES = {
  scrolled: '16px',
  default: '8px',
} as const;

// Componentes Moción
const MotionBox = motion(Box as any);
const MotionFlex = motion(Flex as any);

// Hooks personalizados
const useSearchBarVisibility = () => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const toggleSearch = useCallback(() => {
    setIsSearchVisible(prev => !prev);
    // Log search visibility toggle
    analyticsService.logUserInteraction('search_toggle', 'search_bar', {
      visible: !isSearchVisible
    });
  }, [isSearchVisible]);
  return { isSearchVisible, toggleSearch };
};

const useScrollDetection = (threshold: number) => {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const newScrolled = window.scrollY > threshold;
      if (newScrolled !== isScrolled) {
        setIsScrolled(newScrolled);
        analyticsService.logUserInteraction('scroll', 'header', {
          scrolled: newScrolled,
          scrollPosition: window.scrollY
        });
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, isScrolled]);
  return isScrolled;
};

// Componente UserMenu
const UserMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    analyticsService.logUserInteraction('settings_click', 'user_menu');
    navigate('/settings');
  };

  const handleSignOut = async () => {
    analyticsService.logUserInteraction('sign_out', 'user_menu');
    await signOut();
  };

  if (!user) return null;

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="ghost"
        rounded="full"
        padding={2}
        display="flex"
        alignItems="center"
      >
        <Avatar
          size="sm"
          name={user.displayName || undefined}
          src={user.photoURL || undefined}
        />
      </MenuButton>
      <MenuList>
        <MenuItem icon={<User size={18} />}>
          <Text fontSize="sm">{user.displayName}</Text>
        </MenuItem>
        <MenuItem 
          icon={<Settings size={18} />}
          onClick={handleSettingsClick}
        >
          Configuración
        </MenuItem>
        <MenuItem 
          icon={<LogOut size={18} />}
          onClick={handleSignOut}
          color="red.500"
          _hover={{ bg: 'red.50' }}
        >
          Cerrar Sesión
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

// HeaderContent Component
const HeaderContent = React.memo(({ 
  isLargeScreen,
  handleNavigation,
  navItems,
  isSearchVisible,
  isScrolled,
}: {
  isLargeScreen: boolean;
  onMobileMenuOpen: () => void;
  handleNavigation: (path: string) => void;
  navItems: any[];
  isSearchVisible: boolean;
  toggleSearch: () => void;
  isScrolled: boolean;
}) => {
  const searchBarWidth = useBreakpointValue({
    base: "100%",
    sm: "200px",
    md: "250px",
    lg: "300px",
    xl: "400px"
  });

  return (
    <MotionFlex
      h="100%"
      alignItems="center"
      justifyContent="space-between"
      position="relative"
      flexDir={{ base: "column", sm: "row" }}
      gap={{ base: 2, sm: 0 }}
      initial={false}
      animate={{
        y: isScrolled ? 0 : 10,
        opacity: 1,
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut"
      }}
    >
      <HStack 
        spacing={{ base: 2, md: 6 }} 
        alignItems="center"
        w="100%"
        justifyContent="space-between"
      >
        <Flex alignItems="center" gap={{ base: 2, md: 6 }}>
          <Parallax translateX={[-5, 5]}>
            <MotionBox
              whileHover={{ scale: 1.05 }}
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
        </Flex>

        <Flex 
          alignItems="center" 
          gap={{ base: 2, md: 4 }}
          ml="auto"
        >
          <Box
            w={searchBarWidth}
            display={{
              base: isSearchVisible ? "block" : "none",
              md: "block"
            }}
          >
            <SearchBar />
          </Box>

          <UserMenu />
        </Flex>
      </HStack>
    </MotionFlex>
  );
});

HeaderContent.displayName = 'HeaderContent';

// Header Component
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
    // Log navigation event
    analyticsService.logUserInteraction('navigation', 'header', {
      destination: path,
      source: window.location.pathname
    });
    
    navigate(path);
    if (!isLargeScreen) {
      onMobileMenuClose();
    }
  }, [navigate, isLargeScreen, onMobileMenuClose]);

  // Log mobile menu interactions
  useEffect(() => {
    if (isMobileMenuOpen) {
      analyticsService.logUserInteraction('mobile_menu', 'header', {
        action: 'open'
      });
    }
  }, [isMobileMenuOpen]);

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
          px={{ base: 3, sm: 4, md: 6, lg: 8 }}
          py={{ base: 2, sm: 3 }}
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
            isScrolled={isScrolled}
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