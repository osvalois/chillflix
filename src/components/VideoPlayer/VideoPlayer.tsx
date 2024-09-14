import React, { useEffect, useRef } from 'react';
import { Box, AspectRatio, Text } from '@chakra-ui/react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@videojs/themes/dist/forest/index.css';

interface VideoPlayerProps {
  options: {
    autoplay: boolean;
    controls: boolean;
    responsive: boolean;
    fluid: boolean;
    sources: { src: string; type: string }[];
  };
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ options }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      playerRef.current = videojs(videoElement, {
        ...options,
        html5: {
          hls: {
            overrideNative: true
          },
          nativeVideoTracks: false,
          nativeAudioTracks: false,
          nativeTextTracks: false
        },
        controlBar: {
          children: [
            'playToggle',
            'volumePanel',
            'currentTimeDisplay',
            'timeDivider',
            'durationDisplay',
            'progressControl',
            'liveDisplay',
            'remainingTimeDisplay',
            'customControlSpacer',
            'playbackRateMenuButton',
            'chaptersButton',
            'descriptionsButton',
            'subsCapsButton',
            'audioTrackButton',
            'fullscreenToggle'
          ]
        }
      }, () => {
        console.log('Player is ready');
        playerRef.current.on('error', (error: any) => {
          console.error('Video.js error:', error);
        });
      });

      playerRef.current.addClass('vjs-theme-forest');
    } else {
      // Update player options if they change
      const player = playerRef.current;
      player.src(options.sources);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [options]);

  return (
    <AspectRatio ratio={16 / 9}>
      <Box
        as="div"
        data-vjs-player
        sx={{
          '& .video-js': {
            width: '100%',
            height: '100%',
          },
          '& .vjs-big-play-button': {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          },
        }}
      >
        <video ref={videoRef} className="video-js vjs-big-play-centered vjs-theme-forest">
          <Text>Tu navegador no soporta el elemento de video.</Text>
        </video>
      </Box>
    </AspectRatio>
  );
};

export default VideoPlayer;