import React from 'react';
import { 
  Menu, 
  MenuList, 
  MenuItem, 
  Tooltip, 
  useDisclosure, 
  Button,
  Icon,
  Text,
  HStack
} from "@chakra-ui/react";
import { Icons } from '../Movie/Icons';

export interface AudioTrackCustom {
  enabled: boolean;
  id: string;
  kind: string;
  label: string;
  language: string;
}

interface AudioSettingsMenuProps {
  audioTracks: AudioTrackCustom[];
  selectedAudioTrack: string;
  onAudioTrackChange: (track: AudioTrackCustom) => void;
}

export const AudioSettingsMenu: React.FC<AudioSettingsMenuProps> = ({ 
  audioTracks, 
  selectedAudioTrack, 
  onAudioTrackChange 
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (!audioTracks?.length) {
    return null;
  }

  const handleAudioTrackChange = (track: AudioTrackCustom) => {
    onAudioTrackChange(track);
    onClose();
  };

  return (
    <Menu isOpen={isOpen} onClose={onClose} placement="top">
      <Tooltip 
        label="Audio tracks" 
        placement="top" 
        hasArrow
        bg="gray.900"
        color="white"
      >
        <Button
          as={HStack}
          spacing={2}
          bg="rgba(0, 0, 0, 0.6)"
          backdropFilter="blur(8px)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          rounded="full"
          px={3}
          py={1}
          height="auto"
          onClick={onOpen}
          _hover={{
            bg: "rgba(255, 255, 255, 0.1)",
            borderColor: "whiteAlpha.400"
          }}
          transition="all 0.2s"
        >
          <Icon 
            as={Icons.Music} 
            color="white" 
            boxSize="14px"
          />
          <Text 
            color="white" 
            fontSize="xs" 
            fontWeight="medium"
          >
            {audioTracks.find(track => track.label === selectedAudioTrack)?.language || 'Audio'}
          </Text>
          <Icon
            as={Icons.ChevronDown}
            color="white"
            boxSize="12px"
            transform={isOpen ? 'rotate(180deg)' : undefined}
            transition="transform 0.2s"
          />
        </Button>
      </Tooltip>

      <MenuList
        bg="rgba(0, 0, 0, 0.9)"
        backdropFilter="blur(16px)"
        borderColor="whiteAlpha.200"
        boxShadow="lg"
        p={2}
        minW="180px"
        border="1px solid"
        borderRadius="lg"
      >
        {audioTracks.map((track) => (
          <MenuItem
            key={track.id}
            onClick={() => handleAudioTrackChange(track)}
            bg="transparent"
            color="white"
            fontSize="sm"
            py={2}
            px={3}
            borderRadius="md"
            role="menuitem"
            position="relative"
            transition="all 0.2s"
            _hover={{
              bg: "whiteAlpha.100"
            }}
            _focus={{
              bg: "whiteAlpha.100"
            }}
          >
            <HStack spacing={3} width="100%" justify="space-between">
              <HStack spacing={2}>
                <Icon 
                  as={Icons.Music}
                  color="white"
                  boxSize="12px"
                  opacity={0.7}
                />
                <Text>{track.label}</Text>
              </HStack>
              {selectedAudioTrack === track.label && (
                <Icon
                  as={Icons.Success}
                  color="green.400"
                  boxSize="12px"
                />
              )}
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default React.memo(AudioSettingsMenu);