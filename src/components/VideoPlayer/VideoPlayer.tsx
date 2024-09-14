import React, { useEffect, useRef, useState } from 'react';
import { Box, AspectRatio, Text, Spinner } from '@chakra-ui/react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import '@videojs/themes/dist/forest/index.css';

interface VideoPlayerProps {
  options: videojs.PlayerOptions;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ options }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const videoElement = document.createElement('video-js');
    videoElement.classList.add('vjs-big-play-centered', 'vjs-theme-forest');
    containerRef.current.appendChild(videoElement);

    const player = videojs(videoElement, {
      ...options,
      autoplay: options.autoplay,
      controls: true,
      responsive: true,
      fluid: true,
      html5: {
        vhs: {
          overrideNative: true
        },
        nativeVideoTracks: false,
        nativeAudioTracks: false,
        nativeTextTracks: false
      }
    }, () => {
      console.log('Player is ready');
      setIsReady(true);
    });

    player.on('error', (e) => {
      console.error('Video.js error:', player.error());
      setError(`Error: ${player.error().message}`);
    });

    playerRef.current = player;

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [options]);

  useEffect(() => {
    const player = playerRef.current;

    if (player && options.sources) {
      player.src(options.sources);
    }
  }, [options.sources]);

  if (error) {
    return (
      <Box textAlign="center" p={4}>
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  return (
    <AspectRatio ratio={16 / 9}>
      <Box
        ref={containerRef}
        position="relative"
        overflow="hidden"
        borderRadius="md"
        boxShadow="xl"
      >
        {!isReady && (
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="rgba(0, 0, 0, 0.7)"
          >
            <Spinner size="xl" color="white" />
          </Box>
        )}
      </Box>
    </AspectRatio>
  );
};

export default VideoPlayer;