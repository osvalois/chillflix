import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  useColorMode,
  useColorModeValue,
  Image,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { motion } from 'framer-motion';
import GlassmorphicBox from "../UI/GlassmorphicBox";

const MotionBox = motion(Box as any);

const Header: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(26, 32, 44, 0.8)");

  return (
    <GlassmorphicBox
      as="nav"
      position="fixed"
      w="100%"
      zIndex="sticky"
      borderRadius="0"
      px={4}
      backgroundColor={bgColor} // Asegúrate de aplicar bgColor aquí
    >
      <Flex h={20} alignItems="center" justifyContent="space-between">
        <HStack spacing={8} alignItems="center">
          <MotionBox whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Image src="/api/placeholder/40/40" alt="Chillflix" h="40px" />
          </MotionBox>
          <HStack as="nav" spacing={4} display={{ base: "none", md: "flex" }}>
            {["Inicio", "Películas", "Series"].map((item) => (
              <Link
                key={item}
                as={RouterLink}
                to={item === "Inicio" ? "/" : `/${item.toLowerCase()}`}
                px={3}
                py={2}
                rounded="md"
                _hover={{ textDecoration: "none", bg: useColorModeValue("purple.100", "purple.700") }}
                fontWeight="medium"
              >
                {item}
              </Link>
            ))}
          </HStack>
        </HStack>
        <IconButton
          aria-label="Cambiar tema"
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          variant="ghost"
          size="lg"
          _hover={{ bg: useColorModeValue("purple.100", "purple.700") }}
        />
      </Flex>
    </GlassmorphicBox>
  );
};

export default Header;
