// MobileMenu.tsx
import React from "react";
import { IconButton, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure, VStack } from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import Navigation from "./Navigation";

const MobileMenu: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <IconButton
        display={{ base: "flex", md: "none" }}
        onClick={onOpen}
        icon={<HamburgerIcon />}
        aria-label="Abrir menú"
        variant="ghost"
        color="gray.400"
        _hover={{ bg: "whiteAlpha.200" }}
      />
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent bg="gray.900">
          <DrawerCloseButton color="white" />
          <DrawerHeader color="white">Menú</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <Navigation />
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default MobileMenu;