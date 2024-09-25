import React, { useEffect, useState } from 'react';
import { Box, Text } from "@chakra-ui/react";

interface SubtitlesDisplayProps {
  player: videojs.Player | null;
}

export const SubtitlesDisplay: React.FC<SubtitlesDisplayProps> = ({ player }) => {
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');

  useEffect(() => {
    if (!player) return;

    const updateSubtitle = () => {
      const activeTracks = player.textTracks().tracks_.filter((track: any) => track.mode === 'showing');
      const activeTrack = activeTracks[activeTracks.length - 1];
      if (activeTrack && activeTrack.activeCues && activeTrack.activeCues.length > 0) {
        setCurrentSubtitle(activeTrack.activeCues[0].text);
      } else {
        setCurrentSubtitle('');
      }
    };

    player.textTracks().addEventListener('cuechange', updateSubtitle);

    return () => {
      player.textTracks().removeEventListener('cuechange', updateSubtitle);
    };
  }, [player]);

  if (!currentSubtitle) return null;

  return (
    <Box
      position="absolute"
      bottom="70px"
      left="0"
      width="100%"
      textAlign="center"
      zIndex="1"
    >
      <Text
        color="white"
        fontSize="xl"
        fontWeight="bold"
        textShadow="0 0 3px black"
        bg="rgba(0, 0, 0, 0.5)"
        px={2}
        py={1}
        borderRadius="md"
        display="inline-block"
        maxWidth="80%"
        margin="0 auto"
      >
        {currentSubtitle}
      </Text>
    </Box>
  );
};