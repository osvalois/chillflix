// components/Header/MobileMenu.tsx
import React from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Button,
} from '@chakra-ui/react';
import { useHeaderStyles } from '../../hooks/useHeaderStyles';
import { useLocation } from 'react-router-dom';
import Logo from '../UI/Logo';
import { NavItem } from '../../types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  handleNavigation: (path: string) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  navItems,
  handleNavigation,
}) => {
  const { isDark } = useHeaderStyles();
  const location = useLocation();

  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent bg={isDark ? 'gray.800' : 'white'} backdropFilter="blur(10px)">
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          <Logo />
        </DrawerHeader>
        <DrawerBody>
          <VStack spacing={4} align="stretch" mt={4}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                leftIcon={<item.icon size={20} />}
                variant="ghost"
                justifyContent="flex-start"
                w="full"
                onClick={() => handleNavigation(item.path)}
                bg={location.pathname === item.path ? (isDark ? 'whiteAlpha.100' : 'blackAlpha.50') : 'transparent'}
                _hover={{
                  bg: isDark ? 'whiteAlpha.200' : 'blackAlpha.100',
                }}
              >
                {item.label}
              </Button>
            ))}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};