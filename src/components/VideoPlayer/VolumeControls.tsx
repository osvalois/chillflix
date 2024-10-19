import React, { useState, useEffect, useCallback } from 'react';
import { Box, Flex, IconButton, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Tooltip, keyframes } from "@chakra-ui/react";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";

const pulseAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(66, 153, 225, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(66, 153, 225, 0); }
  100% { box-shadow: 0 0 0 0 rgba(66, 153, 225, 0); }
`;

interface VolumeControlsProps {
  isMuted: boolean;
  volume: number;
  onMute: () => void;
  onVolumeChange: (volume: number) => void;
  isLargerThan768: boolean;
}

export const VolumeControls: React.FC<VolumeControlsProps> = ({ isMuted, volume, onMute, onVolumeChange, isLargerThan768 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [localVolume, setLocalVolume] = useState(volume);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setLocalVolume(newVolume);
    onVolumeChange(newVolume);
  }, [onVolumeChange]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        handleVolumeChange(Math.min(localVolume + 0.1, 1));
      } else if (event.key === 'ArrowDown') {
        handleVolumeChange(Math.max(localVolume - 0.1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [localVolume, handleVolumeChange]);

  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  return (
    <Box
      bg="rgba(255, 255, 255, 0.05)"
      backdropFilter="blur(20px)"
      borderRadius="full"
      p={3}
      boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.2)"
      border="1px solid rgba(255, 255, 255, 0.1)"
      transition="all 0.3s"
      _hover={{
        bg: "rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.3)",
      }}
    >
      <Flex alignItems="center">
        <Tooltip label={isMuted ? "Unmute" : "Mute"} placement="top" hasArrow>
          <IconButton
            aria-label={isMuted ? "Unmute" : "Mute"}
            icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            onClick={onMute}
            size="sm"
            variant="unstyled"
            color="white"
            _hover={{ color: "blue.300" }}
            transition="all 0.3s"
            animation={`${pulseAnimation} 2s infinite`}
          />
        </Tooltip>
        {isLargerThan768 && (
          <Slider 
            aria-label="volume-slider" 
            value={localVolume} 
            min={0} 
            max={1} 
            step={0.01} 
            onChange={handleVolumeChange}
            w="100px"
            ml={3}
            focusThumbOnChange={false}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <SliderTrack 
              bg="rgba(255, 255, 255, 0.1)"
              h="6px"
              borderRadius="full"
            >
              <SliderFilledTrack bg="linear-gradient(90deg, #4299E1 0%, #63B3ED 100%)" />
            </SliderTrack>
            <Tooltip label={`Volume: ${Math.round(localVolume * 100)}%`} placement="top" hasArrow isOpen={isHovered}>
              <SliderThumb 
                boxSize={5} 
                bg="white" 
                borderColor="blue.500"
                borderWidth={2}
                _focus={{ boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)" }}
                transition="all 0.2s"
                _hover={{ transform: "scale(1.1)" }}
              />
            </Tooltip>
          </Slider>
        )}
      </Flex>
    </Box>
  );
};