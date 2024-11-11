
// FullscreenButton.tsx
import React from 'react';
import { IconButton } from "@chakra-ui/react";
import { DynamicIcon } from '../Movie/Icons';


interface FullscreenButtonProps {
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
}

export const FullscreenButton: React.FC<FullscreenButtonProps> = ({ isFullscreen, onFullscreenToggle }) => (
    <IconButton
      aria-label="Fullscreen"
      icon={isFullscreen ? <DynamicIcon name="Compress" color="#FFFFFF" size={16} /> : <DynamicIcon name="Expand" color="#FFFFFF" size={16} />}
      onClick={onFullscreenToggle}
      size="sm"
      variant="ghost"
      color="white"
      _hover={{ bg: "whiteAlpha.300" }}
    />
);