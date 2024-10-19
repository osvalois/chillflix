import React, { useState, useEffect } from 'react';
import { Box, Text, Progress, Tooltip } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';

interface NetworkInfoOverlayProps {
  quality: number; // A value between 0 and 1
  showDuration?: number; // Duration in milliseconds to show the overlay
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const getQualityColor = (quality: number): string => {
  if (quality >= 0.8) return 'green.500';
  if (quality >= 0.5) return 'yellow.500';
  return 'red.500';
};

const getQualityText = (quality: number): string => {
  if (quality >= 0.8) return 'Excellent';
  if (quality >= 0.5) return 'Good';
  if (quality >= 0.3) return 'Fair';
  return 'Poor';
};

export const NetworkInfoOverlay: React.FC<NetworkInfoOverlayProps> = ({
  quality,
  showDuration = 3000,
  position = 'top-right',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [lastQuality, setLastQuality] = useState(quality);

  useEffect(() => {
    if (Math.abs(quality - lastQuality) > 0.1) {
      setIsVisible(true);
      setLastQuality(quality);

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, showDuration);

      return () => clearTimeout(timer);
    }
  }, [quality, lastQuality, showDuration]);

  const positionStyles = {
    'top-left': { top: 4, left: 4 },
    'top-right': { top: 4, right: 4 },
    'bottom-left': { bottom: 4, left: 4 },
    'bottom-right': { bottom: 4, right: 4 },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            position="absolute"
            {...positionStyles[position]}
            bg="rgba(0, 0, 0, 0.7)"
            borderRadius="md"
            p={3}
            color="white"
            maxWidth="200px"
          >
            <Tooltip label="Network Quality" placement="bottom">
              <Box display="flex" alignItems="center" mb={2}>
                {quality > 0 ? (
                  <Wifi color={getQualityColor(quality)} size={24} />
                ) : (
                  <WifiOff color="red.500" size={24} />
                )}
                <Text ml={2} fontWeight="bold">
                  Network Quality
                </Text>
              </Box>
            </Tooltip>
            <Text fontSize="sm" mb={1}>
              {getQualityText(quality)}
            </Text>
            <Progress
              value={quality * 100}
              colorScheme={getQualityColor(quality).split('.')[0]}
              size="sm"
              borderRadius="full"
            />
            <Text fontSize="xs" mt={1}>
              {Math.round(quality * 100)}% stable
            </Text>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};