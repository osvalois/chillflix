import React, { useState, useMemo } from 'react';
import { Select, useToast, Text } from "@chakra-ui/react";
import pako from 'pako';
import { Subtitle } from '../../types';

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

  // Agrupar y filtrar subtítulos con claves únicas
  const filteredSubtitles = useMemo(() => {
    if (!Array.isArray(subtitles)) {
      console.warn('Subtitles is not an array:', subtitles);
      return [];
    }

    // Primero filtramos los subtítulos válidos
    const validSubtitles = subtitles.filter(subtitle =>
      subtitle &&
      typeof subtitle === 'object' &&
      subtitle.SubDownloadLink &&
      typeof subtitle.SubDownloadLink === 'string' &&
      subtitle.SubDownloadLink.endsWith('.gz')
    );

    // Luego agrupamos por idioma y seleccionamos el mejor por cada idioma
    const groupedSubtitles = validSubtitles.reduce((acc, subtitle) => {
      const key = `${subtitle.ISO639}-${subtitle.SubFormat}-${subtitle.SubHash}`;
      
      if (!acc[subtitle.ISO639]) {
        acc[subtitle.ISO639] = {
          subtitle,
          key
        };
      } else if (subtitle.SubRating > acc[subtitle.ISO639].subtitle.SubRating) {
        acc[subtitle.ISO639] = {
          subtitle,
          key
        };
      }
      return acc;
    }, {} as Record<string, { subtitle: Subtitle; key: string }>);

    // Convertimos el objeto agrupado en un array y ordenamos por nombre de idioma
    return Object.values(groupedSubtitles)
      .map(({ subtitle }) => subtitle)
      .sort((a, b) => 
        (a.LanguageName && b.LanguageName) 
          ? a.LanguageName.localeCompare(b.LanguageName) 
          : 0
      );
  }, [subtitles]);

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

  const handleSubtitleChange = (value: string) => {
    if (value === "") {
      onSubtitleChange(null, null);
    } else {
      const selected = filteredSubtitles.find(s => `${s.ISO639}-${s.SubFormat}-${s.SubHash}` === value);
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
      value={selectedSubtitle ? `${selectedSubtitle.ISO639}-${selectedSubtitle.SubFormat}-${selectedSubtitle.SubHash}` : ''}
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
        <option 
          key={`${subtitle.ISO639}-${subtitle.SubFormat}-${subtitle.SubHash}`} 
          value={`${subtitle.ISO639}-${subtitle.SubFormat}-${subtitle.SubHash}`}
        >
          {subtitle.LanguageName}
        </option>
      ))}
    </Select>
  );
};

export default SubtitleSelector;