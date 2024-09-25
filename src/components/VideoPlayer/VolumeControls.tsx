
// VolumeControls.tsx
import React from 'react';
import { Flex, IconButton, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Tooltip } from "@chakra-ui/react";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";

interface VolumeControlsProps {
  isMuted: boolean;
  volume: number;
  onMute: () => void;
  onVolumeChange: (volume: number) => void;
  isLargerThan768: boolean;
}

export const VolumeControls: React.FC<VolumeControlsProps> = ({ isMuted, volume, onMute, onVolumeChange, isLargerThan768 }) => (
  <Flex alignItems="center">
    <Tooltip label={isMuted ? "Unmute" : "Mute"} placement="top" hasArrow>
      <IconButton
        aria-label={isMuted ? "Unmute" : "Mute"}
        icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        onClick={onMute}
        size="sm"
        variant="ghost"
        color="white"
        _hover={{ bg: "whiteAlpha.300" }}
      />
    </Tooltip>
    {isLargerThan768 && (
      <Slider 
        aria-label="volume-slider" 
        value={volume} 
        min={0} 
        max={1} 
        step={0.1} 
        onChange={onVolumeChange}
        w="60px"
        ml={2}
        focusThumbOnChange={false}
      >
        <SliderTrack bg="whiteAlpha.200">
          <SliderFilledTrack bg="blue.500" />
        </SliderTrack>
        <Tooltip label={`Volume: ${Math.round(volume * 100)}%`} placement="top" hasArrow>
          <SliderThumb boxSize={2} />
        </Tooltip>
      </Slider>
    )}
  </Flex>
);
