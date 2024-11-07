import React, { useState, useCallback } from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Avatar,
  Progress,
  Box,
  Text,
  Flex,
  useColorModeValue,
  useTheme,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { FaUser, FaHistory, FaBookmark, FaCog, FaSignOutAlt } from "react-icons/fa";
import { rgba } from "polished";

const MotionBox = motion(Box as any);
const MotionMenuItem = motion(MenuItem as any);

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();

  const bgColor = useColorModeValue("gray.100", "gray.800");
  const hoverBgColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.200");
  const borderColor = useColorModeValue("gray.300", "gray.600");

  const menuItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  const handleMenuOpen = useCallback(() => setIsOpen(true), []);
  const handleMenuClose = useCallback(() => setIsOpen(false), []);
  console.log(isOpen)
  return (
    <Menu onOpen={handleMenuOpen} onClose={handleMenuClose}>
      {({ isOpen }) => (
        <>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            variant="ghost"
            _hover={{ bg: hoverBgColor }}
            _active={{ bg: hoverBgColor }}
            transition="all 0.2s"
          >
            <Flex alignItems="center">
              <Avatar
                size="sm"
                name="Usuario"
                src="/avatar-placeholder.jpg"
                border="2px solid"
                borderColor={borderColor}
              />
              <Box ml={2} textAlign="left" display={{ base: "none", md: "block" }}>
                <Text fontWeight="bold" fontSize="sm">
                  Usuario
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Premium
                </Text>
              </Box>
            </Flex>
          </MenuButton>
          <MenuList
            bg={bgColor}
            borderColor={borderColor}
            boxShadow={`0 4px 6px ${rgba(theme.colors.black, 0.1)}`}
            borderRadius="md"
            p={2}
          >
            <AnimatePresence>
              {isOpen && (
                <>
                  <MotionBox
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Flex alignItems="center" p={2} borderBottom="1px solid" borderColor={borderColor}>
                      <Avatar
                        size="md"
                        name="Usuario"
                        src="/avatar-placeholder.jpg"
                        border="2px solid"
                        borderColor={borderColor}
                      />
                      <Box ml={3}>
                        <Text fontWeight="bold" fontSize="md" color={textColor}>
                          Usuario
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          usuario@email.com
                        </Text>
                      </Box>
                    </Flex>
                    <Box p={2} mb={2}>
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        Plan Premium
                      </Text>
                      <Progress value={80} size="sm" colorScheme="purple" borderRadius="full" />
                    </Box>
                  </MotionBox>
                  {[
                    { icon: FaUser, text: "Perfil", command: "⌘P" },
                    { icon: FaHistory, text: "Historial", command: "⌘H" },
                    { icon: FaBookmark, text: "Mi Lista", command: "⌘L" },
                    { icon: FaCog, text: "Configuración", command: "⌘S" },
                    { icon: FaSignOutAlt, text: "Cerrar sesión" },
                  ].map((item, index) => (
                    <MotionMenuItem
                      key={item.text}
                      icon={<item.icon />}
                      command={item.command}
                      color={textColor}
                      _hover={{ bg: hoverBgColor }}
                      variants={menuItemVariants}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      {item.text}
                    </MotionMenuItem>
                  ))}
                </>
              )}
            </AnimatePresence>
          </MenuList>
        </>
      )}
    </Menu>
  );
};

export default UserMenu;