import React, { useState, useMemo } from 'react';
import { Select, useToast, Text } from "@chakra-ui/react";
import { Subtitle } from '../../services/OpenSubtitlesService';
import pako from 'pako';

interface SubtitleSelectorProps {
  subtitles: Subtitle[] | undefined;
  selectedSubtitle: Subtitle | null;
  onSubtitleChange: (subtitle: Subtitle | null, parsedCues: any[] | null) => void;
}

export const SubtitleSelector: React.FC<SubtitleSelectorProps> = ({
  subtitles,
  selectedSubtitle,
  onSubtitleChange
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  
  const filteredSubtitles = useMemo(() => {
    if (!Array.isArray(subtitles)) {
      console.warn('Subtitles is not an array:', subtitles);
      return [];
    }
    return subtitles
      .filter(subtitle => 
        subtitle && 
        typeof subtitle === 'object' && 
        subtitle.SubDownloadLink && 
        typeof subtitle.SubDownloadLink === 'string' &&
        subtitle.SubDownloadLink.endsWith('.gz')
      )
      .sort((a, b) => 
        (a.LanguageName && b.LanguageName) 
          ? a.LanguageName.localeCompare(b.LanguageName) 
          : 0
      );
  }, [subtitles]);

  const fetchAndParseSubtitle = async (subtitle: Subtitle) => {
    setIsLoading(true);
    try {
      const response = await fetch(subtitle.SubDownloadLink);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const arrayBuffer = await response.arrayBuffer();
      const inflated = pako.inflate(new Uint8Array(arrayBuffer));
      const text = new TextDecoder().decode(inflated);

      let parsedCues;
      if (subtitle.SubFormat === 'srt') {
        parsedCues = parseSrtFormat(text);
      } else if (subtitle.SubFormat === 'sub') {
        parsedCues = parseSubFormat(text);
      } else {
        throw new Error('Unsupported subtitle format');
      }

      onSubtitleChange(subtitle, parsedCues);
      toast({
        title: "Subtitles loaded",
        description: `${subtitle.LanguageName} subtitles loaded successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error loading subtitle:", error);
      toast({
        title: "Error loading subtitles",
        description: "There was an error loading the subtitles. Please try another option.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      onSubtitleChange(null, null);
    } finally {
      setIsLoading(false);
    }
  };

  const parseSrtFormat = (content: string) => {
    const subtitles = [];
    const blocks = content.trim().split(/\r?\n\r?\n/);
    
    for (const block of blocks) {
      const lines = block.split(/\r?\n/);
      if (lines.length >= 3) {
        const [, timecodes, ...textLines] = lines;
        const [start, end] = timecodes.split(' --> ').map(timeToSeconds);
        subtitles.push({
          start,
          end,
          text: textLines.join(' ')
        });
      }
    }
    
    return subtitles;
  };

  const parseSubFormat = (content: string) => {
    const lines = content.split('\n');
    return lines.map(line => {
      const [timeCode, text] = line.split('}');
      const [startTime] = timeCode.slice(1).split(',');
      return {
        start: parseInt(startTime) / 1000,
        end: (parseInt(startTime) + 5000) / 1000, // Assuming 5 second duration
        text: text.trim()
      };
    });
  };

  const timeToSeconds = (timeString: string) => {
    const [hours, minutes, seconds] = timeString.split(':').map(parseFloat);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const handleSubtitleChange = (value: string) => {
    if (value === "") {
      onSubtitleChange(null, null);
    } else {
      const selected = filteredSubtitles.find(s => s.ISO639 === value);
      if (selected) {
        fetchAndParseSubtitle(selected);
      }
    }
  };

  if (!Array.isArray(subtitles) || filteredSubtitles.length === 0) {
    return <Text color="white"></Text>;
  }

  return (
    <Select
      value={selectedSubtitle?.ISO639 || ''}
      onChange={(e) => handleSubtitleChange(e.target.value)}
      placeholder="Subtitles"
      bg="rgba(0, 0, 0, 0.5)"
      color="white"
      border="none"
      _hover={{ bg: "rgba(0, 0, 0, 0.7)" }}
      isDisabled={isLoading}
    >
      <option value="">Off</option>
      {filteredSubtitles.map((subtitle) => (
        <option key={subtitle.ISO639} value={subtitle.ISO639}>
          {subtitle.LanguageName}
        </option>
      ))}
    </Select>
  );
};