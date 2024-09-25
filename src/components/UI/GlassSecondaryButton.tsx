import React from 'react';
import { Button, Box, Text, keyframes } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(0, 255, 255, 0.3), 0 0 10px rgba(0, 255, 255, 0.2), 0 0 15px rgba(0, 255, 255, 0.1); }
  50% { box-shadow: 0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.3), 0 0 30px rgba(0, 255, 255, 0.2); }
  100% { box-shadow: 0 0 5px rgba(0, 255, 255, 0.3), 0 0 10px rgba(0, 255, 255, 0.2), 0 0 15px rgba(0, 255, 255, 0.1); }
`;

const MotionBox = motion(Box as any);

export const GlassSecondaryButton = ({ children, icon, ...props }) => {
  return (
    <Button
      as={MotionBox}
      leftIcon={icon}
      bg="rgba(255, 255, 255, 0.1)"
      color="white"
      backdropFilter="blur(8px)"
      border="2px solid rgba(255, 255, 255, 0.3)"
      borderRadius="full"
      py={6}
      px={8}
      fontSize="lg"
      fontWeight="bold"
      _hover={{
        bg: "rgba(255, 255, 255, 0.2)",
        borderColor: "rgba(255, 255, 255, 0.5)",
      }}
      _active={{
        bg: "rgba(255, 255, 255, 0.3)",
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
        top="0"
        left="0"
        right="0"
        bottom="0"
        opacity={0.5}
        style={{
          background: "linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)",
        }}
        animate={{
          background: [
            "linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)",
            "linear-gradient(225deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)",
            "linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)",
          ],
        }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
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