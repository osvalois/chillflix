import React from 'react';
import { Box, VStack, Button, Text, Select, Spinner } from "@chakra-ui/react";
import { Subtitle } from '../../services/OpenSubtitlesService';

interface SubtitlesSelectorProps {
  subtitles: Subtitle[];
  selectedSubtitle: string | null;
  onSubtitleChange: (subtitle: Subtitle | null) => void;
  isVisible: boolean;
  isLoading: boolean;
  error: string | null;
}

export const SubtitlesSelector: React.FC<SubtitlesSelectorProps> = ({
  subtitles,
  selectedSubtitle,
  onSubtitleChange,
  isVisible,
  isLoading,
  error
}) => {
  if (!isVisible) return null;

  if (isLoading) {
    return (
      <Box bg="rgba(0, 0, 0, 0.8)" borderRadius="md" p={4}>
        <Spinner color="white" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg="rgba(0, 0, 0, 0.8)" borderRadius="md" p={4}>
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  const groupedSubtitles = subtitles.reduce((acc, subtitle) => {
    if (!acc[subtitle.LanguageName]) {
      acc[subtitle.LanguageName] = [];
    }
    acc[subtitle.LanguageName].push(subtitle);
    return acc;
  }, {} as Record<string, Subtitle[]>);

  return (
    <Box
      bg="rgba(0, 0, 0, 0.8)"
      borderRadius="md"
      p={4}
      maxHeight="300px"
      overflowY="auto"
    >
      <VStack spacing={2} align="stretch">
        <Button
          onClick={() => onSubtitleChange(null)}
          variant="ghost"
          color="white"
          _hover={{ bg: "whiteAlpha.200" }}
          isActive={selectedSubtitle === null}
        >
          Off
        </Button>
        {Object.entries(groupedSubtitles).map(([language, subs]) => (
          <Box key={language}>
            <Text color="white" mb={1}>{language}</Text>
            <Select
              onChange={(e) => {
                const selected = subs.find(sub => sub.IDSubtitleFile === e.target.value);
                if (selected) onSubtitleChange(selected);
              }}
              value={subs.find(sub => sub.LanguageName === selectedSubtitle)?.IDSubtitleFile || ''}
              bg="whiteAlpha.200"
              color="white"
              borderColor="whiteAlpha.400"
              _hover={{ borderColor: "whiteAlpha.600" }}
            >
              <option value="">Select a subtitle</option>
              {subs.map(sub => (
                <option key={sub.IDSubtitleFile} value={sub.IDSubtitleFile}>
                  {sub.SubFileName}
                </option>
              ))}
            </Select>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};