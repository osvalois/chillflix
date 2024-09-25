
// PlaybackControls.tsx
import React from 'react';
import { IconButton, Tooltip } from "@chakra-ui/react";
import { FaPlay, FaPause } from "react-icons/fa";

interface PlaybackControlsProps {
  isPaused: boolean;
  onPlayPause: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({ isPaused, onPlayPause }) => (
  <Tooltip label={isPaused ? "Play" : "Pause"} placement="top" hasArrow>
    <IconButton
      aria-label={isPaused ? "Play" : "Pause"}
      icon={isPaused ? <FaPlay /> : <FaPause />}
      onClick={onPlayPause}
      size="sm"
      variant="ghost"
      color="white"
      _hover={{ bg: "whiteAlpha.300" }}
    />
  </Tooltip>
);
