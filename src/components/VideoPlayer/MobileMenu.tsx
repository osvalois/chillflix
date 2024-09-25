
// MobileMenu.tsx
import React from 'react';
import { Menu, MenuButton, MenuList, MenuItem, IconButton, Tooltip } from "@chakra-ui/react";
import { FaEllipsisV } from "react-icons/fa";
import { QualitySelector } from './QualitySelector';
import { LanguageSelector } from './LanguageSelector';
import { AudioSettingsMenu } from './AudioSettingsMenu';
import { SubtitlesMenu } from './SubtitlesMenu';

interface MobileMenuProps {
  selectedQuality: string;
  availableQualities: string[];
  onQualityChange: (quality: string) => void;
  selectedLanguage: string;
  availableLanguages: string[];
  onLanguageChange: (language: string) => void;
  audioTracks: videojs.AudioTrack[];
  selectedAudioTrack: string;
  onAudioTrackChange: (track: videojs.AudioTrack) => void;
  subtitles: videojs.TextTrack[];
  selectedSubtitle: string | null;
  onSubtitleChange: (subtitle: videojs.TextTrack | null) => void;
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
}) => (
  <Menu>
    <Tooltip label="More options" placement="top" hasArrow>
      <MenuButton
        as={IconButton}
        aria-label="More options"
        icon={<FaEllipsisV />}
        size="sm"
        variant="ghost"
        color="white"
        _hover={{ bg: "whiteAlpha.300" }}
      />
    </Tooltip>
    <MenuList bg="rgba(0, 0, 0, 0.8)" borderColor="whiteAlpha.300">
      <MenuItem>
        <QualitySelector
          selectedQuality={selectedQuality}
          availableQualities={availableQualities}
          onQualityChange={onQualityChange}
        />
      </MenuItem>
      <MenuItem>
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          availableLanguages={availableLanguages}
          onLanguageChange={onLanguageChange}
        />
      </MenuItem>
      <MenuItem>
        <AudioSettingsMenu
          audioTracks={audioTracks}
          selectedAudioTrack={selectedAudioTrack}
          onAudioTrackChange={onAudioTrackChange}
        />
      </MenuItem>
      <MenuItem>
        <SubtitlesMenu
          subtitles={subtitles}
          selectedSubtitle={selectedSubtitle}
          onSubtitleChange={onSubtitleChange}
        />
      </MenuItem>
    </MenuList>
  </Menu>
);
