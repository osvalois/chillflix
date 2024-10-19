import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box, Flex, HStack, VStack, useColorMode, useMediaQuery, IconButton, Text, Tooltip, VisuallyHidden,
  Avatar, Menu, MenuButton, MenuList, MenuItem, useDisclosure, Drawer, DrawerBody, DrawerHeader,
  DrawerOverlay, DrawerContent, DrawerCloseButton, useToast, Popover, PopoverTrigger, PopoverContent,
  PopoverHeader, PopoverBody, PopoverFooter, Button, Kbd, Switch, FormControl, FormLabel
} from "@chakra-ui/react";
import { motion, useViewportScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { rgba, darken, lighten } from 'polished';
import {
  Bell, Search, Home, Film, Tv, Star, Menu as MenuIcon, X, Settings, ChevronRight, Sun, Moon
} from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from "../UI/Logo";
import SearchBar from "../Search/SearchBar";
import { useNotifications, markNotificationAsRead, Notification } from '../mocks/notifications';

const MotionBox = motion(Box as any);
const MotionFlex = motion(Flex as any);
const MotionIconButton = motion(IconButton as any);

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const Header: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [isLargeScreen] = useMediaQuery("(min-width: 48em)");
  const { isOpen: isMenuOpen, onToggle: toggleMenu, onClose: closeMenu } = useDisclosure();
  const { isOpen: isSearchOpen, onToggle: toggleSearch, onClose: closeSearch } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState("");
  const { scrollY } = useViewportScroll();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const primaryColor = colorMode === 'dark' ? "#3182CE" : "#2B6CB0";
  const secondaryColor = colorMode === 'dark' ? "#9F7AEA" : "#805AD5";

  const gradientStart = colorMode === 'dark' ? '#000000' : '#ffffff';
  const gradientEnd = colorMode === 'dark' ? '#141414' : '#f0f0f0';

  const glassBackground = useTransform(
    scrollY,
    [0, 100],
    [
      `linear-gradient(135deg, ${rgba(gradientStart, 0.2)} 0%, ${rgba(gradientEnd, 0.3)} 100%)`,
      `linear-gradient(135deg, ${rgba(gradientStart, 0.3)} 0%, ${rgba(gradientEnd, 0.4)} 100%)`
    ]
  );

  const glassBoxShadow = useTransform(
    scrollY,
    [0, 100],
    [
      `0 4px 30px ${rgba('#000000', 0.1)}`,
      `0 8px 32px ${rgba('#000000', 0.2)}`
    ]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const { clientX, clientY } = event;
      const { left, top } = event.currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    },
    [mouseX, mouseY]
  );

  const springConfig = { stiffness: 300, damping: 30 };
  const scaleX = useSpring(1, springConfig);
  const scaleY = useSpring(1, springConfig);

  const handleHoverStart = () => {
    scaleX.set(1.05);
    scaleY.set(1.05);
  };

  const handleHoverEnd = () => {
    scaleX.set(1);
    scaleY.set(1);
  };

  const navItems: NavItem[] = useMemo(() => [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Film, label: 'Movies', path: '/movies' },
    { icon: Tv, label: 'TV Shows', path: '/tv-shows' },
    { icon: Star, label: 'My List', path: '/my-list' },
  ], []);

  const { data: notifications, isLoading: isLoadingNotifications, error: notificationsError } = useNotifications();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (notifications) {
      setUnreadCount(notifications.filter(n => !n.read).length);
    }
  }, [notifications]);

  const handleMarkAsRead = useCallback(async (id: string) => {
    await markNotificationAsRead(id);
    setUnreadCount(prev => prev - 1);
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    closeSearch();
  };

  useHotkeys('ctrl+k', (event) => {
    event.preventDefault();
    toggleSearch();
  }, [toggleSearch]);

  useHotkeys('esc', () => {
    if (isSearchOpen) {
      closeSearch();
    }
  }, [isSearchOpen, closeSearch]);

  const handleNavigation = (path: string) => {
    navigate(path);
    if (!isLargeScreen) {
      closeMenu();
    }
  };

  const handleColorModeToggle = () => {
    toggleColorMode();
    toast({
      title: `${colorMode === 'light' ? 'Dark' : 'Light'} mode activated`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const glassStyles = {
    background: glassBackground,
    boxShadow: glassBoxShadow,
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid',
    borderColor: rgba(colorMode === 'dark' ? '#ffffff' : '#000000', 0.1),
  };

  return (
    <MotionBox
      as="header"
      position="fixed"
      w="100%"
      zIndex={1000}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseMove={handleMouseMove}
    >
      <MotionBox
        px={6}
        py={4}
        style={glassStyles}
        transition={{ duration: 0.3 }}
      >
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <HStack spacing={8} alignItems="center">
            <MotionBox
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Logo />
            </MotionBox>
            {isLargeScreen && (
              <HStack spacing={6}>
                {navItems.map((item) => (
                  <Tooltip key={item.label} label={item.label} placement="bottom">
                    <MotionIconButton
                      aria-label={item.label}
                      icon={<item.icon size={20} />}
                      variant="ghost"
                      color={colorMode === 'dark' ? "whiteAlpha.900" : "gray.800"}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleNavigation(item.path)}
                      _hover={{
                        bg: rgba(colorMode === 'dark' ? '#ffffff' : '#000000', 0.1),
                      }}
                      isActive={location.pathname === item.path}
                      _active={{
                        bg: rgba(primaryColor, 0.2),
                        color: primaryColor,
                      }}
                    >
                      <VisuallyHidden>{item.label}</VisuallyHidden>
                    </MotionIconButton>
                  </Tooltip>
                ))}
              </HStack>
            )}
          </HStack>
          <HStack spacing={6}>
            <SearchBar
              isOpen={isSearchOpen}
              onClose={closeSearch}
              onToggle={toggleSearch}
              searchQuery={searchQuery}
              handleSearchChange={handleSearchChange}
              handleSearchSubmit={handleSearchSubmit}
            />
            
            <Popover>
              <PopoverTrigger>
                <MotionIconButton
                  aria-label="Notifications"
                  variant="ghost"
                  icon={
                    <Box position="relative">
                      <Bell size={20} />
                      <AnimatePresence>
                        {unreadCount > 0 && (
                          <MotionBox
                            position="absolute"
                            top="-5px"
                            right="-5px"
                            bg="red.500"
                            borderRadius="full"
                            w="14px"
                            h="14px"
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Text fontSize="xs" fontWeight="bold" color="white">
                              {unreadCount}
                            </Text>
                          </MotionBox>
                        )}
                      </AnimatePresence>
                    </Box>
                  }
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  color={colorMode === 'dark' ? "whiteAlpha.900" : "gray.800"}
                  _hover={{
                    bg: rgba(colorMode === 'dark' ? '#ffffff' : '#000000', 0.1),
                  }}
                />
              </PopoverTrigger>
              <PopoverContent
                bg={rgba(gradientEnd, 0.8)}
                borderColor={rgba('#ffffff', 0.16)}
                backdropFilter="blur(10px)"
              >
                <PopoverHeader borderBottomWidth="1px" fontWeight="bold" color={colorMode === 'dark' ? "whiteAlpha.900" : "gray.800"}>
                  Notifications
                </PopoverHeader>
                <PopoverBody>
                  {isLoadingNotifications ? (
                    <Text color={colorMode === 'dark' ? "whiteAlpha.700" : "gray.600"}>Loading notifications...</Text>
                  ) : notificationsError ? (
                    <Text color="red.300">Error loading notifications</Text>
                  ) : notifications && notifications.length > 0 ? (
                    <VStack spacing={2} align="stretch">
                      {notifications.map((notification: Notification) => (
                        <MotionBox
                          key={notification.id}
                          p={2}
                          bg={notification.read ? 'transparent' : rgba(colorMode === 'dark' ? '#ffffff' : '#000000', 0.05)}
                          borderRadius="md"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Text color={colorMode === 'dark' ? "whiteAlpha.900" : "gray.800"} fontWeight="bold">{notification.title}</Text>
                          <Text color={colorMode === 'dark' ? "whiteAlpha.700" : "gray.600"} fontSize="sm">{notification.message}</Text>
                          <Text color={colorMode === 'dark' ? "whiteAlpha.600" : "gray.500"} fontSize="xs">
                            {new Date(notification.timestamp).toLocaleString()}
                          </Text>
                          {!notification.read && (
                            <Button
                              size="xs"
                              mt={1}
                              onClick={() => handleMarkAsRead(notification.id)}
                              colorScheme="blue"
                            >
                              Mark as Read
                            </Button>
                          )}
                        </MotionBox>
                      ))}
                    </VStack>
                  ) : (
                    <Text color={colorMode === 'dark' ? "whiteAlpha.700" : "gray.600"}>No new notifications</Text>
                  )}
                </PopoverBody>
                <PopoverFooter>
                  <Button size="sm" width="100%" colorScheme="blue">View All Notifications</Button>
                </PopoverFooter>
              </PopoverContent>
            </Popover>
            <Menu>
              <MenuButton
                as={MotionIconButton}
                aria-label="User menu"
                variant="ghost"
                icon={<Avatar size="sm"/>}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                _hover={{
                  bg: rgba(colorMode === 'dark' ? '#ffffff' : '#000000', 0.1),
                }}
              />
              <MenuList bg={rgba(gradientEnd, 0.8)} backdropFilter="blur(10px)">
                <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
                <MenuItem onClick={() => navigate('/account')}>Account</MenuItem>
                <MenuItem>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="dark-mode-toggle" mb="0">
                      Dark Mode
                    </FormLabel>
                    <Switch
                      id="dark-mode-toggle"
                      isChecked={colorMode === 'dark'}
                      onChange={handleColorModeToggle}
                    />
                  </FormControl>
                </MenuItem>
                <MenuItem onClick={() => {
                  toast({
                    title: "Signed out",
                    description: "You have been successfully signed out.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                  });
                }}>Sign Out</MenuItem>
              </MenuList>
            </Menu>
            <MotionIconButton
              aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
              icon={colorMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              variant="ghost"
              onClick={handleColorModeToggle}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              color={colorMode === 'dark' ? "whiteAlpha.900" : "gray.800"}
              _hover={{
                bg: rgba(colorMode === 'dark' ? '#ffffff' : '#000000', 0.1),
              }}
            />
            {!isLargeScreen && (
              <MotionIconButton
                aria-label="Open menu"
                variant="ghost"
                icon={isMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
                onClick={toggleMenu}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                color={colorMode === 'dark' ? "whiteAlpha.900" : "gray.800"}
                _hover={{
                  bg: rgba(colorMode === 'dark' ? '#ffffff' : '#000000', 0.1),
                }}
              />
            )}
          </HStack>
        </Flex>
      </MotionBox>
      <Drawer isOpen={!isLargeScreen && isMenuOpen} placement="left" onClose={closeMenu}>
        <DrawerOverlay />
        <DrawerContent
          bg={rgba(gradientEnd, 0.8)}
          backdropFilter="blur(20px)"
        >
          <DrawerCloseButton color={colorMode === 'dark' ? "whiteAlpha.900" : "gray.800"} />
          <DrawerHeader color={colorMode === 'dark' ? "whiteAlpha.900" : "gray.800"}>Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {navItems.map((item) => (
                <MotionFlex
                  key={item.label}
                  align="center"
                  py={3}
                  px={4}
                  cursor="pointer"
                  onClick={() => handleNavigation(item.path)}
                  _hover={{ bg: rgba(colorMode === 'dark' ? '#ffffff' : '#000000', 0.05) }}
                  borderRadius="md"
                  transition={{ duration: 0.2 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  whileHover={{ x: 5 }}
                >
                  <item.icon size={20} style={{ marginRight: '12px' }} color={colorMode === 'dark' ? "whiteAlpha.900" : "gray.800"} />
                  <Text color={colorMode === 'dark' ? "whiteAlpha.900" : "gray.800"}>{item.label}</Text>
                  <Box flex={1} />
                  <ChevronRight size={16} color={colorMode === 'dark' ? "whiteAlpha.400" : "gray.400"} />
                </MotionFlex>
              ))}
              <MotionFlex
                align="center"
                py={3}
                px={4}
                cursor="pointer"
                onClick={handleColorModeToggle}
                _hover={{ bg: rgba(colorMode === 'dark' ? '#ffffff' : '#000000', 0.05) }}
                borderRadius="md"
                transition={{ duration: 0.2 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ x: 5 }}
              >
                {colorMode === 'light' ? <Moon size={20} style={{ marginRight: '12px' }} /> : <Sun size={20} style={{ marginRight: '12px' }} />}
                <Text color={colorMode === 'dark' ? "whiteAlpha.900" : "gray.800"}>
                  {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
                </Text>
                <Box flex={1} />
                <Switch isChecked={colorMode === 'dark'} onChange={handleColorModeToggle} />
              </MotionFlex>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <AnimatePresence>
        {isSearchOpen && (
          <MotionBox
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg={rgba(gradientStart, 0.8)}
            backdropFilter="blur(20px)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            zIndex={2000}
          >
            <Flex height="100%" alignItems="center" justifyContent="center">
              <Box width="80%" maxWidth="600px">
                <form onSubmit={handleSearchSubmit}>
                  <SearchBar
                    isOpen={isSearchOpen}
                    onClose={closeSearch}
                    onToggle={toggleSearch}
                    searchQuery={searchQuery}
                    handleSearchChange={handleSearchChange}
                    handleSearchSubmit={handleSearchSubmit}
                  />
                </form>
                <Text mt={2} fontSize="sm" color={colorMode === 'dark' ? "whiteAlpha.600" : "gray.500"}>
                  Press <Kbd>Enter</Kbd> to search or <Kbd>Esc</Kbd> to close
                </Text>
              </Box>
            </Flex>
          </MotionBox>
        )}
      </AnimatePresence>
    </MotionBox>
  );
};

export default Header;