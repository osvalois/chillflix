// MobileMenu.tsx
import React from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
  Text,
  Box,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaEllipsisV, FaCog, FaClosedCaptioning, FaGlobe, FaVideo } from "react-icons/fa";
import { QualitySelector } from './QualitySelector';
import { LanguageSelector } from './LanguageSelector';
import { AudioSettingsMenu } from './AudioSettingsMenu';
import { SubtitleSelector } from './SubtitleSelector';
import { AudioTrack } from './types';
import { Subtitle } from '../../types';

interface MobileMenuProps {
  selectedQuality: string;
  availableQualities: string[];
  onQualityChange: (quality: string) => void;
  selectedLanguage: string;
  availableLanguages: string[];
  onLanguageChange: (language: string) => void;
  audioTracks: AudioTrack[];
  selectedAudioTrack: string;
  onAudioTrackChange: (track: AudioTrack) => void;
  subtitles: Subtitle[];
  selectedSubtitle: Subtitle | null;
  onSubtitleChange: (subtitle: Subtitle | null) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  selectedQuality,
  availableQualities,
  onQualityChange,
  selectedLanguage,
  availableLanguages,
  onLanguageChange,
  audioTracks,
  selectedAudioTrack,
  onAudioTrackChange,
  subtitles,
  selectedSubtitle,
  onSubtitleChange
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");

  return (
    <Menu closeOnSelect={false}>
      <Tooltip label="Settings" placement="top" hasArrow>
        <MenuButton
          as={IconButton}
          aria-label="Settings"
          icon={<FaCog />}
          size="sm"
          variant="ghost"
          color="white"
          _hover={{ bg: "whiteAlpha.300" }}
        />
      </Tooltip>
      <MenuList 
        bg={bgColor} 
        borderColor="whiteAlpha.300" 
        boxShadow="xl"
        borderRadius="md"
        p={2}
      >
        <Text fontSize="sm" fontWeight="bold" mb={2} color={textColor}>Settings</Text>
        <MenuItem closeOnSelect={false} icon={<FaVideo />} command="Q">
          <Box flex="1">
            <Text fontWeight="medium" mb={1}>Quality</Text>
            <QualitySelector
              selectedQuality={selectedQuality}
              availableQualities={availableQualities}
              onQualityChange={onQualityChange}
            />
          </Box>
        </MenuItem>
        <Divider my={2} />
        <MenuItem closeOnSelect={false} icon={<FaGlobe />} command="L">
          <Box flex="1">
            <Text fontWeight="medium" mb={1}>Language</Text>
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              availableLanguages={availableLanguages}
              onLanguageChange={onLanguageChange}
            />
          </Box>
        </MenuItem>
        <Divider my={2} />
        <MenuItem closeOnSelect={false} icon={<FaClosedCaptioning />} command="C">
          <Box flex="1">
            <Text fontWeight="medium" mb={1}>Subtitles</Text>
            <SubtitleSelector
              subtitles={subtitles}
              selectedSubtitle={selectedSubtitle}
              onSubtitleChange={onSubtitleChange}
            />
          </Box>
        </MenuItem>
        <Divider my={2} />
        <MenuItem closeOnSelect={false} icon={<FaEllipsisV />} command="A">
          <Box flex="1">
            <Text fontWeight="medium" mb={1}>Audio</Text>
            <AudioSettingsMenu
              audioTracks={audioTracks}
              selectedAudioTrack={selectedAudioTrack}
              onAudioTrackChange={onAudioTrackChange}
            />
          </Box>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};