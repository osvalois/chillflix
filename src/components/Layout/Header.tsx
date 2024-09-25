// Header.tsx
import React, {useEffect } from "react";
import { Box, Flex, HStack, useColorMode, useMediaQuery } from "@chakra-ui/react";
import { motion, useViewportScroll, useTransform } from 'framer-motion';
import { rgba } from 'polished';
import Logo from "../UI/Logo";
import Navigation from "./Navigation";
import NotificationIcon from "./NotificationIcon";
import UserMenu from "./UserMenu";
import MobileMenu from "./MobileMenu";
import SearchBar from "../Search/SearchBar";

const MotionBox = motion(Box as any);

const Header: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [isLargeScreen] = useMediaQuery("(min-width: 48em)");
  const { scrollY } = useViewportScroll();

  const backgroundColor = useTransform(
    scrollY,
    [0, 50],
    [
      rgba(colorMode === 'light' ? 255 : 20, colorMode === 'light' ? 255 : 20, colorMode === 'light' ? 255 : 20, 0.1),
      rgba(colorMode === 'light' ? 255 : 20, colorMode === 'light' ? 255 : 20, colorMode === 'light' ? 255 : 20, 0.8)
    ]
  );

  const boxShadow = useTransform(
    scrollY,
    [0, 50],
    ['none', '0 4px 30px rgba(0, 0, 0, 0.1)']
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (mediaQuery.matches) {
        toggleColorMode();
      }
    };
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [toggleColorMode]);

  return (
    <MotionBox
      as="nav"
      position="fixed"
      w="100%"
      zIndex={1000}
      px={4}
      py={2}
      style={{
        backgroundColor,
        boxShadow,
        backdropFilter: 'blur(10px)',
      }}
      transition="all 0.3s"
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <HStack spacing={8} alignItems="center">
          <Logo />
          
          {isLargeScreen && <Navigation />}
        </HStack>
        <HStack spacing={4}>
          <SearchBar />
          <NotificationIcon />
          <UserMenu />
          {!isLargeScreen && <MobileMenu />}
        </HStack>
      </Flex>
    </MotionBox>
  );
};

export default Header;