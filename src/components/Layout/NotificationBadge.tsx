// components/Header/NotificationBadge.tsx
import React from 'react';
import { Box } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { NotificationBadgeProps } from '../../types';
const MotionBox = motion(Box as any);

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, color = "red.500" }) => (
  <MotionBox
    position="absolute"
    top="-2px"
    right="-2px"
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    exit={{ scale: 0 }}
  >
    <Box
      bg={color}
      borderRadius="full"
      w="18px"
      h="18px"
      display="flex"
      justifyContent="center"
      alignItems="center"
      fontSize="xs"
      fontWeight="bold"
      color="white"
      boxShadow="0 0 10px rgba(0,0,0,0.2)"
      border="2px solid"
      borderColor="white"
    >
      {count}
    </Box>
  </MotionBox>
);