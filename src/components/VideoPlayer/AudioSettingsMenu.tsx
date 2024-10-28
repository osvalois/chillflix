import { Menu, MenuList, MenuItem, Tooltip, useDisclosure, Button } from "@chakra-ui/react";
import { FaCog } from "react-icons/fa";

// Definición de la interfaz AudioTrack personalizada
export interface AudioTrackCustom {
  enabled: boolean;
  id: string;
  kind: string;
  label: string;
  language: string;
}

// Props del componente
interface AudioSettingsMenuProps {
  audioTracks: AudioTrackCustom[];
  selectedAudioTrack: string;
  onAudioTrackChange: (track: AudioTrackCustom) => void;
}

export const AudioSettingsMenu = ({ 
  audioTracks, 
  selectedAudioTrack, 
  onAudioTrackChange 
}: AudioSettingsMenuProps): JSX.Element | null => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Si no hay pistas de audio disponibles, no renderizar el menú
  if (!audioTracks || audioTracks.length === 0) {
    return null;
  }

  const handleAudioTrackChange = (track: AudioTrackCustom) => {
    onAudioTrackChange(track);
    onClose();
  };

  return (
    <Menu isOpen={isOpen} onClose={onClose}>
      <Tooltip label="Audio settings" placement="top" hasArrow>
        <Button
          as="div" 
          role="button"
          aria-label="Open audio settings"
          variant="unstyled"
          height="auto"
          minWidth="auto"
          padding="4px"
          display="inline-flex"
          alignItems="center"
          onClick={onOpen}
        >
          <FaCog
            aria-label="Audio settings"
            size="1em"
            color="white"
            style={{ 
              transition: 'all 0.2s ease',
              transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          />
        </Button>
      </Tooltip>

      <MenuList 
        bg="rgba(0, 0, 0, 0.8)" 
        borderColor="whiteAlpha.300"
        minW="150px"
        zIndex={1000}
      >
        {audioTracks.map((track) => (
          <MenuItem 
            key={track.id} 
            onClick={() => handleAudioTrackChange(track)}
            bg="transparent"
            color="white"
            _hover={{ bg: "whiteAlpha.200" }}
            fontSize="sm"
            py={2}
          >
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              width: '100%' 
            }}>
              {track.label}
              {selectedAudioTrack === track.label && (
                <span style={{ marginLeft: '8px' }}>✓</span>
              )}
            </span>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default AudioSettingsMenu;