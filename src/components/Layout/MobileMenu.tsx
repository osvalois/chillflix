import React, { useCallback, useMemo } from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  VStack,
  Box,
  Flex,
  Text,
  IconButton,
  Portal,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { rgba } from 'polished';
import Logo from '../UI/Logo';
import { NavItem } from '../../types';
import { useHeaderStyles } from '../../hooks/useHeaderStyles';

// Types
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  handleNavigation: (path: string) => void;
}

// Motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionDrawerContent = motion(DrawerContent);

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  navItems,
  handleNavigation,
}) => {
  const { isDark, themeColors } = useHeaderStyles();
  const location = useLocation();

  // Theme colors
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('blackAlpha.50', 'whiteAlpha.100');
  const activeBgColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');

  // Glassmorphism styles
  const glassStyles = useMemo(() => ({
    background: `linear-gradient(135deg, 
      ${rgba(isDark ? '#1A202C' : '#FFFFFF', 0.85)} 0%, 
      ${rgba(isDark ? '#2D3748' : '#F7FAFC', 0.9)} 100%)`,
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid',
    borderColor: rgba(isDark ? '#FFFFFF' : '#000000', 0.1),
    boxShadow: `0 8px 32px 0 ${rgba(isDark ? '#000000' : '#FFFFFF', 0.1)}`,
  }), [isDark]);

  // Animation variants
  const menuVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      x: '-100%',
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    }),
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: 'easeInOut',
      },
    },
    tap: { scale: 0.98 },
  };

  // Handlers
  const handleItemClick = useCallback((path: string) => {
    handleNavigation(path);
    onClose();
  }, [handleNavigation, onClose]);

  return (
    <Portal>
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        size={{ base: "full", sm: "xs" }}
      >
        <DrawerOverlay 
          bg={rgba(isDark ? '#000' : '#fff', 0.3)}
          backdropFilter="blur(10px)"
        />
        
        <MotionDrawerContent
          variants={menuVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          sx={glassStyles}
        >
          {/* Custom Close Button */}
          <Box position="absolute" right={4} top={4} zIndex={2}>
            <IconButton
              aria-label="Close menu"
              icon={<X />}
              variant="ghost"
              size="md"
              color={textColor}
              bg={isDark ? 'whiteAlpha.100' : 'blackAlpha.50'}
              _hover={{
                bg: isDark ? 'whiteAlpha.200' : 'blackAlpha.100',
                transform: 'scale(1.1) rotate(90deg)',
              }}
              onClick={onClose}
              transition="all 0.3s"
              borderRadius="full"
            />
          </Box>

          {/* Header with Logo */}
          <DrawerHeader
            borderBottomWidth="1px"
            borderColor={borderColor}
            p={6}
            mt={2}
          >
            <Logo />
          </DrawerHeader>

          {/* Navigation Items */}
          <DrawerBody px={4} py={6}>
            <AnimatePresence>
              <VStack spacing={3} align="stretch">
                {navItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <MotionFlex
                      key={item.label}
                      custom={index}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => handleItemClick(item.path)}
                      align="center"
                      px={4}
                      py={3}
                      borderRadius="xl"
                      cursor="pointer"
                      position="relative"
                      bg={isActive ? activeBgColor : 'transparent'}
                      color={textColor}
                      role="group"
                    >
                      {/* Hover Background Effect */}
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        borderRadius="xl"
                        bg={hoverBgColor}
                        opacity={0}
                        transition="opacity 0.3s"
                        _groupHover={{ opacity: 1 }}
                      />

                      {/* Icon */}
                      <Box
                        color={isActive ? themeColors.primary : 'inherit'}
                        transition="all 0.3s"
                        _groupHover={{ color: themeColors.primary }}
                      >
                        <item.icon 
                          size={24}
                          style={{
                            strokeWidth: isActive ? 2.5 : 2,
                          }}
                        />
                      </Box>

                      {/* Label */}
                      <Text
                        ml={4}
                        fontWeight={isActive ? '600' : '500'}
                        fontSize="lg"
                        color={isActive ? themeColors.primary : 'inherit'}
                        transition="all 0.3s"
                        _groupHover={{ color: themeColors.primary }}
                      >
                        {item.label}
                      </Text>

                      {/* Active Indicator */}
                      {isActive && (
                        <MotionBox
                          position="absolute"
                          left={0}
                          width="3px"
                          height="60%"
                          layoutId="activeIndicator"
                          bg={`linear-gradient(to bottom, ${themeColors.primary}, ${themeColors.secondary})`}
                          borderRadius="full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}

                      {/* Gradient Overlay for Active Items */}
                      {isActive && (
                        <Box
                          position="absolute"
                          inset={0}
                          borderRadius="xl"
                          bg={`linear-gradient(135deg, 
                            ${rgba(themeColors.primary, 0.1)} 0%, 
                            ${rgba(themeColors.secondary, 0.1)} 100%
                          )`}
                          pointerEvents="none"
                        />
                      )}
                    </MotionFlex>
                  );
                })}
              </VStack>
            </AnimatePresence>
          </DrawerBody>
        </MotionDrawerContent>
      </Drawer>
    </Portal>
  );
};

export default React.memo(MobileMenu);