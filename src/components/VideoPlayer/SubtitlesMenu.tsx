
// SubtitlesMenu.tsx
import React from 'react';
import { Menu, MenuButton, MenuList, MenuItem, IconButton, Tooltip } from "@chakra-ui/react";
import { FaClosedCaptioning } from "react-icons/fa";

interface SubtitlesMenuProps {
  subtitles: videojs.TextTrack[];
  selectedSubtitle: string | null;
  onSubtitleChange: (subtitle: videojs.TextTrack | null) => void;
}

export const SubtitlesMenu: React.FC<SubtitlesMenuProps> = ({ subtitles, selectedSubtitle, onSubtitleChange }) => (
  <Menu>
    <Tooltip label="Subtitles" placement="top" hasArrow>
      <MenuButton 
        as={IconButton} 
        aria-label="Subtitles" 
        icon={<FaClosedCaptioning />} 
        size="sm" 
        variant="ghost"
        color="white"
        _hover={{ bg: "whiteAlpha.300" }}
      />
    </Tooltip>
    <MenuList bg="rgba(0, 0, 0, 0.8)" borderColor="whiteAlpha.300">
      <MenuItem 
        onClick={() => onSubtitleChange(null)}
        bg="transparent"
        color="white"
        _hover={{ bg: "whiteAlpha.200" }}
      >
        Off {selectedSubtitle === null && " ✓"}
      </MenuItem>
      {subtitles.map((subtitle, index) => (
        <MenuItem 
          key={index} 
          onClick={() => onSubtitleChange(subtitle)}
          bg="transparent"
          color="white"
          _hover={{ bg: "whiteAlpha.200" }}
        >
          {subtitle.label}
          {selectedSubtitle === subtitle.label && " ✓"}
        </MenuItem>
      ))}
    </MenuList>
  </Menu>
);
