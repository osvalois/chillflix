
// SeekBar.tsx
import React from 'react';
import { Slider, SliderTrack, SliderFilledTrack, SliderThumb, Tooltip } from "@chakra-ui/react";

interface SeekBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export const SeekBar: React.FC<SeekBarProps> = ({ currentTime, duration, onSeek }) => {
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

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
      <SliderTrack bg="whiteAlpha.200">
        <SliderFilledTrack bg="blue.500" />
      </SliderTrack>
      <Tooltip label={formatTime(currentTime)} placement="top" hasArrow>
        <SliderThumb boxSize={3} />
      </Tooltip>
    </Slider>
  );
};