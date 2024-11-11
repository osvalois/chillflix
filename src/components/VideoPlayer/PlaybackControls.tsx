
// PlaybackControls.tsx
import React from 'react';
import { IconButton, Tooltip } from "@chakra-ui/react";
import { DynamicIcon } from '../Movie/Icons';


interface PlaybackControlsProps {
  isPaused: boolean;
  onPlayPause: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({ isPaused, onPlayPause }) => (
  <Tooltip label={isPaused ? "Play" : "Pause"} placement="top" hasArrow>
    <IconButton
      aria-label={isPaused ? "Play" : "Pause"}
      icon={isPaused ? <DynamicIcon name="Play" color="#FFFFFF" size={16} /> : <DynamicIcon name="Pause" color="#FFFFFF" size={16} />}
      onClick={onPlayPause}
      size="sm"
      variant="ghost"
      color="white"
      _hover={{ bg: "whiteAlpha.300" }}
    />
  </Tooltip>
);
