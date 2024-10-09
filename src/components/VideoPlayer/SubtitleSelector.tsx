import React from 'react';
import { Select } from "@chakra-ui/react";
import { Subtitle } from '../../services/OpenSubtitlesService';

interface SubtitleSelectorProps {
  subtitles: Subtitle[] | undefined;
  selectedSubtitle: Subtitle | null;
  onSubtitleChange: (subtitle: Subtitle | null) => void;
}

export const SubtitleSelector: React.FC<SubtitleSelectorProps> = ({
  subtitles,
  selectedSubtitle,
  onSubtitleChange
}) => {
  // Ensure subtitles is always an array
  const subtitleOptions = Array.isArray(subtitles) ? subtitles : [];

  return (
    <Select
      value={selectedSubtitle?.ISO639 || ''}
      onChange={(e) => {
        const selected = subtitleOptions.find(s => s.ISO639 === e.target.value) || null;
        onSubtitleChange(selected);
      }}
      placeholder="Subtitles"
      bg="rgba(0, 0, 0, 0.5)"
      color="white"
      border="none"
      _hover={{ bg: "rgba(0, 0, 0, 0.7)" }}
    >
      <option value="">Off</option>
      {subtitleOptions.map((subtitle) => (
        <option key={subtitle.ISO639} value={subtitle.ISO639}>
          {subtitle.LanguageName}
        </option>
      ))}
    </Select>
  );
};