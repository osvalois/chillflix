
// AudioSettingsMenu.tsx
import React from 'react';
import { Menu, MenuButton, MenuList, MenuItem, IconButton, Tooltip } from "@chakra-ui/react";
import { FaCog } from "react-icons/fa";

interface AudioSettingsMenuProps {
  audioTracks: videojs.AudioTrack[];
  selectedAudioTrack: string;
  onAudioTrackChange: (track: videojs.AudioTrack) => void;
}

export const AudioSettingsMenu: React.FC<AudioSettingsMenuProps> = ({ audioTracks, selectedAudioTrack, onAudioTrackChange }) => (
  <Menu>
    <Tooltip label="Audio settings" placement="top" hasArrow>
      <MenuButton 
        as={IconButton} 
        aria-label="Audio settings" 
        icon={<FaCog />} 
        size="sm" 
        variant="ghost"
        color="white"
        _hover={{ bg: "whiteAlpha.300" }}
      />
    </Tooltip>
    <MenuList bg="rgba(0, 0, 0, 0.8)" borderColor="whiteAlpha.300">
      {audioTracks.map((track, index) => (
        <MenuItem 
          key={index} 
          onClick={() => onAudioTrackChange(track)}
          bg="transparent"
          color="white"
          _hover={{ bg: "whiteAlpha.200" }}
        >
          {track.label}
          {selectedAudioTrack === track.label && " ✓"}
        </MenuItem>))}
    </MenuList>
  </Menu>
);
