import React from 'react';
import { Button, Box, Text, keyframes } from '@chakra-ui/react';
import { motion } from 'framer-motion';
const MotionBox = motion(Box);

export const GlassPrimaryButton = ({ children, icon, ...props }) => {
  return (
    <Button
      as={MotionBox}
      leftIcon={icon}
      bg="rgba(0, 200, 255, 0.2)"
      color="white"
      backdropFilter="blur(10px)"
      border="1px solid rgba(255, 255, 255, 0.2)"
      borderRadius="full"
      py={6}
      px={8}
      fontSize="lg"
      fontWeight="bold"
      _hover={{
        bg: "rgba(0, 220, 255, 0.3)",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      }}
      _active={{
        bg: "rgba(0, 180, 255, 0.4)",
        transform: "scale(0.98)",
      }}
      transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      overflow="hidden"
      position="relative"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <MotionBox
        position="absolute"
        top="50%"
        left="50%"
        width="120%"
        height="120%"
        style={{
          background: "linear-gradient(225deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%)",
          transform: "translate(-50%, -50%) rotate(25deg)",
          pointerEvents: "none",
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      />
      <Text
        as="span"
        position="relative"
        zIndex={2}
        textShadow="0 2px 10px rgba(0, 0, 0, 0.3)"
      >
        {children}
      </Text>
    </Button>
  );
};
