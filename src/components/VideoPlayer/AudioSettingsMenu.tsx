import React from 'react';
import { Menu, MenuList, MenuItem, Tooltip, useDisclosure } from "@chakra-ui/react";
import { FaCog } from "react-icons/fa";

interface AudioSettingsMenuProps {
  audioTracks: videojs.AudioTrack[];
  selectedAudioTrack: string;
  onAudioTrackChange: (track: videojs.AudioTrack) => void;
}

export const AudioSettingsMenu: React.FC<AudioSettingsMenuProps> = ({ audioTracks, selectedAudioTrack, onAudioTrackChange }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Menu isOpen={isOpen} onClose={onClose}>
      <Tooltip label="Audio settings" placement="top" hasArrow>
        <span onClick={onOpen} style={{ cursor: 'pointer' }}>
          <FaCog
            aria-label="Audio settings"
            size="1em"
            color="white"
            style={{ transition: 'opacity 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          />
        </span>
      </Tooltip>
      <MenuList bg="rgba(0, 0, 0, 0.8)" borderColor="whiteAlpha.300">
        {audioTracks.map((track, index) => (
          <MenuItem 
            key={index} 
            onClick={() => {
              onAudioTrackChange(track);
              onClose();
            }}
            bg="transparent"
            color="white"
            _hover={{ bg: "whiteAlpha.200" }}
          >
            {track.label}
            {selectedAudioTrack === track.label && " ✓"}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};