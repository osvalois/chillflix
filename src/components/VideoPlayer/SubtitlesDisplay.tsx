// SubtitlesDisplay.tsx
import React, { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import Player from 'video.js/dist/types/player';

interface SubtitlesDisplayProps {
  player: Player | null;
}

export const SubtitlesDisplay: React.FC<SubtitlesDisplayProps> = ({ player }) => {
  const [subtitleText, setSubtitleText] = useState('');
  useEffect(() => {
    if (player) {
      const updateSubtitles = () => {
        const activeCues = player.textTracks()[0]?.activeCues;
        if (activeCues && activeCues.length > 0) {
          setSubtitleText(activeCues[0].text);
        } else {
          setSubtitleText('');
        }
      };

      player.textTracks().addEventListener('cuechange', updateSubtitles);

      return () => {
        player.textTracks().removeEventListener('cuechange', updateSubtitles);
      };
    }
  }, [player]);

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
    >
      {subtitleText}
    </Box>
  );
};