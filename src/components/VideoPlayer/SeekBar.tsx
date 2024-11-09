
// SeekBar.tsx
import React from 'react';
import { Slider, SliderTrack, SliderFilledTrack, SliderThumb } from "@chakra-ui/react";

interface SeekBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export const SeekBar: React.FC<SeekBarProps> = ({ currentTime, duration, onSeek }) => {
  return (
    <Slider
      aria-label="seek-slider"
      value={currentTime}
      min={0}
      max={duration}
      onChange={onSeek}
      mb={2}
      focusThumbOnChange={false}
    >
      <SliderTrack bg="#EEF0F7">
        <SliderFilledTrack bg="#8793c8" />
      </SliderTrack>
      <SliderThumb 
                boxSize={5} 
                bg="#5C669E"
                borderColor="#8793c8"
                borderWidth={2}
                _focus={{ boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)" }}
                transition="all 0.2s"
                _hover={{ transform: "scale(1.1)" }}
              />
    </Slider>
  );
};