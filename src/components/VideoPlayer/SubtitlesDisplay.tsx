import React, { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import Player from 'video.js/dist/types/player';

interface Cue {
  start: number;
  end: number;
  text: string;
}

interface SubtitlesDisplayProps {
  player: Player | null;
  parsedCues: Cue[] | null;
}

export const SubtitlesDisplay: React.FC<SubtitlesDisplayProps> = ({ player, parsedCues }) => {
  const [subtitleText, setSubtitleText] = useState('');

  useEffect(() => {
    if (player && parsedCues) {
      const updateSubtitles = () => {
        const currentTime = player?.currentTime();
        
        // Solo proceder si currentTime es un número válido
        if (typeof currentTime === 'number') {
          const activeCues = parsedCues.filter(
            cue => currentTime >= cue.start && currentTime <= cue.end
          );

          if (activeCues.length > 0) {
            const combinedText = activeCues.map(cue => cue.text).join('\n');
            setSubtitleText(combinedText);
          } else {
            setSubtitleText('');
          }
        }
      };

      // Update subtitles on timeupdate event
      player.on('timeupdate', updateSubtitles);

      return () => {
        player.off('timeupdate', updateSubtitles);
      };
    }
  }, [player, parsedCues]);

  return (
    <Box
      position="absolute"
      bottom="60px"
      left="0"
      right="0"
      textAlign="center"
      color="white"
      fontSize="1.2em"
      textShadow="0 0 3px black"
      padding="10px"
      zIndex={1000}
      maxWidth="80%"
      margin="0 auto"
      whiteSpace="pre-wrap"
      wordBreak="break-word"
    >
      {subtitleText}
    </Box>
  );
};