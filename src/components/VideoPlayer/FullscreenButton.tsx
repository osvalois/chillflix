
// FullscreenButton.tsx
import React from 'react';
import { IconButton } from "@chakra-ui/react";
import { FaExpand, FaCompress } from "react-icons/fa";

interface FullscreenButtonProps {
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
}

export const FullscreenButton: React.FC<FullscreenButtonProps> = ({ isFullscreen, onFullscreenToggle }) => (
    <IconButton
      aria-label="Fullscreen"
      icon={isFullscreen ? <FaCompress /> : <FaExpand />}
      onClick={onFullscreenToggle}
      size="sm"
      variant="ghost"
      color="white"
      _hover={{ bg: "whiteAlpha.300" }}
    />
);