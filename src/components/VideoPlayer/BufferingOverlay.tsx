import React from 'react';
import { Box, Spinner, Text } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

interface BufferingOverlayProps {
  isVisible: boolean;
}

export const BufferingOverlay: React.FC<BufferingOverlayProps> = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }}
        >
          <Box textAlign="center">
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
            <Text color="white" mt={4} fontSize="lg" fontWeight="bold">
              Buffering...
            </Text>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};