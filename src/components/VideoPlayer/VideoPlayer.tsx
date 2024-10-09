import React, { useEffect, useRef, useCallback, useState } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import {
  Box,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import "video.js/dist/video-js.css";
import { PlayerOptions, VideoPlayerProps } from "./types";
import { useVideoPlayerState } from "./useVideoPlayerState";
import Controls from "./Controls";
import { LoadingOverlay } from "./LoadingOverlay";
import { ErrorOverlay } from "./ErrorOverlay";
import { QualityIndicator } from "./QualityIndicator";
import { useHotkeys } from "react-hotkeys-hook";
import { motion, AnimatePresence } from "framer-motion";
import OpenSubtitlesService, { Subtitle } from "../../services/OpenSubtitlesService";
import { SubtitlesDisplay } from "./SubtitlesDisplay";

const initialOptions: PlayerOptions = {
  controls: false,
  responsive: true,
  fluid: true,
  playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
  html5: {
    nativeAudioTracks: true,
    nativeVideoTracks: true,
    nativeTextTracks: true,
  },
  preload: "auto",
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

const VideoPlayer: React.FC<VideoPlayerProps> = React.memo(
  ({
    options,
    title,
    onQualityChange,
    onLanguageChange,
    availableQualities,
    availableLanguages,
    imdbId,
  }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const playerRef = useRef<Player | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [retryCount, setRetryCount] = useState(0);
    const bgColor = useColorModeValue("gray.100", "gray.900");
    const toast = useToast();
    const [lastClickTime, setLastClickTime] = useState(0);
    const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
    const [selectedSubtitle, setSelectedSubtitle] = useState<Subtitle | null>(null);

    const {
      isLoading,
      isPaused,
      isFullscreen,
      isMuted,
      currentTime,
      duration,
      volume,
      audioTracks,
      selectedAudioTrack,
      selectedQuality,
      selectedLanguage,
      controlsVisible,
      setIsLoading,
      setIsPaused,
      setIsFullscreen,
      setIsMuted,
      setCurrentTime,
      setDuration,
      setVolume,
      setAudioTracks,
      setSelectedAudioTrack,
      setSelectedQuality,
      setSelectedLanguage,
      setControlsVisible,
      loadSavedState,
      saveCurrentState,
    } = useVideoPlayerState();

    const handlePlayerReady = useCallback(
      (player: Player) => {
        playerRef.current = player;

        player.on("waiting", () => setIsLoading(true));
        player.on("canplay", () => setIsLoading(false));
        player.on("play", () => setIsPaused(false));
        player.on("pause", () => setIsPaused(true));
        player.on("fullscreenchange", () => setIsFullscreen(player.isFullscreen()));
        player.on("timeupdate", () => {
          setCurrentTime(player.currentTime());
          saveCurrentState(player.currentTime(), player.volume(), player.muted());
        });
        player.on("loadedmetadata", () => {
          setDuration(player.duration());
          checkAudioTracks(player);
        });

        player.on("error", () => {
          console.error("Video player error:", player.error());
          if (retryCount < MAX_RETRIES) {
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
              player.load();
              player.play().catch((e) => console.error("Retry error:", e));
            }, RETRY_DELAY);
          } else {
            console.error("Maximum retry attempts reached. Playback failed.");
            toast({
              title: "Playback Error",
              description: "We're having trouble playing this video. Please try again later.",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        });

        loadSavedState(player);
      },
      [retryCount, setIsLoading, setIsPaused, setIsFullscreen, setCurrentTime, setDuration, loadSavedState, saveCurrentState, toast]
    );

    const checkAudioTracks = useCallback(
      (player: Player) => {
        const tracks = player.audioTracks();
        const trackList: videojs.AudioTrack[] = [];

        if (tracks && tracks.length) {
          for (let i = 0; i < tracks.length; i++) {
            trackList.push(tracks[i]);
          }
        }

        setAudioTracks(trackList);

        if (trackList.length > 0) {
          const defaultTrack = trackList.find((track) => track.enabled) || trackList[0];
          setSelectedAudioTrack(defaultTrack.label);
          defaultTrack.enabled = true;
        }
      },
      [setAudioTracks, setSelectedAudioTrack]
    );

    useEffect(() => {
      if (!playerRef.current && videoRef.current) {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        const player = videojs(
          videoElement,
          {
            ...initialOptions,
            ...options,
          },
          () => {
            handlePlayerReady(player);
          }
        );

        player.src(options.sources || []);
      }
      return () => {
        if (playerRef.current) {
          playerRef.current.dispose();
          playerRef.current = null;
        }
      };
    }, [options, handlePlayerReady]);

    useEffect(() => {
      if (playerRef.current) {
        const currentTime = playerRef.current.currentTime();
        playerRef.current.src(options.sources || []);
        playerRef.current.currentTime(currentTime);
        if (!isPaused) {
          playerRef.current.play().catch((e) => console.error("Play error:", e));
        }
      }
    }, [selectedQuality, selectedLanguage, options.sources, isPaused]);

    useEffect(() => {
      let timeout: NodeJS.Timeout;
      const showControls = () => {
        setControlsVisible(true);
        clearTimeout(timeout);
        timeout = setTimeout(() => setControlsVisible(false), 3000);
      };

      const container = containerRef.current;
      if (container) {
        container.addEventListener("mousemove", showControls);
        container.addEventListener("mouseleave", () => setControlsVisible(false));
      }

      return () => {
        if (container) {
          container.removeEventListener("mousemove", showControls);
          container.removeEventListener("mouseleave", () => setControlsVisible(false));
        }
        clearTimeout(timeout);
      };
    }, [setControlsVisible]);

    useEffect(() => {
      const fetchSubtitles = async () => {
        if (imdbId) {
          try {
            const fetchedSubtitles = await OpenSubtitlesService.searchSubtitles(imdbId);
            setSubtitles(fetchedSubtitles);
          } catch (error) {
            console.error('Error fetching subtitles:', error);
          }
        }
      };

      fetchSubtitles();
    }, [imdbId]);

    const handleSubtitleChange = async (subtitle: Subtitle | null) => {
      setSelectedSubtitle(subtitle);

      if (playerRef.current) {
        const player = playerRef.current;
        
        // Remove existing text tracks
        const existingTracks = player.textTracks();
        for (let i = existingTracks.length - 1; i >= 0; i--) {
          player.removeRemoteTextTrack(existingTracks[i]);
        }
    
        if (subtitle) {
          try {
            const subtitleUrl = await OpenSubtitlesService.downloadSubtitle(subtitle.SubDownloadLink);
            console.log(subtitleUrl)
            console.log("subtitleUrl")
            // Create a new text track
            const track = player.addRemoteTextTrack({
              kind: 'subtitles',
              label: subtitle.LanguageName,
              srclang: subtitle.ISO639,
              src: subtitleUrl,
              default: true
            }, false);
    
            // Ensure the track is shown
            track.mode = 'showing';
          } catch (error) {
            console.error('Error downloading subtitle:', error);
            toast({
              title: "Subtitle Error",
              description: "Failed to load subtitles. Please try again.",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        }
      }
    };
    // Hotkeys
    useHotkeys("space", () => playerRef.current?.paused() ? playerRef.current.play() : playerRef.current?.pause(), []);
    useHotkeys("m", () => setIsMuted(!isMuted), [isMuted]);
    useHotkeys("f", () => playerRef.current?.isFullscreen() ? playerRef.current.exitFullscreen() : playerRef.current?.requestFullscreen(), []);
    useHotkeys("arrowleft", () => {
      if (playerRef.current) {
        playerRef.current.currentTime(Math.max(playerRef.current.currentTime() - 10, 0));
      }
    }, []);
    useHotkeys("arrowright", () => {
      if (playerRef.current) {
        playerRef.current.currentTime(Math.min(playerRef.current.currentTime() + 10, playerRef.current.duration()));
      }
    }, []);

    const handleVideoClick = useCallback((e: React.MouseEvent) => {
      const currentTime = new Date().getTime();
      const timeSinceLastClick = currentTime - lastClickTime;
      
      if (timeSinceLastClick < 300) {
        // Double click
        playerRef.current?.isFullscreen() ? playerRef.current.exitFullscreen() : playerRef.current?.requestFullscreen();
      } else {
        // Single click
        playerRef.current?.paused() ? playerRef.current.play() : playerRef.current?.pause();
      }
      
      setLastClickTime(currentTime);
      e.preventDefault();
    }, [lastClickTime]);

    return (
      <Box
      position="relative"
      ref={containerRef}
      borderRadius="xl"
      overflow="hidden"
      boxShadow="xl"
      bg={bgColor}
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backdropFilter: "blur(10px)",
        zIndex: -1,
        }}
      >
    <div data-vjs-player>
      <video 
        ref={videoRef} 
        className="video-js vjs-big-play-centered" 
        onClick={handleVideoClick}
      />
    </div>
    <SubtitlesDisplay player={playerRef.current} />
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LoadingOverlay />
            </motion.div>
          )}
        </AnimatePresence>
        <ErrorOverlay isVisible={retryCount >= MAX_RETRIES} />
        <QualityIndicator quality={selectedQuality} />
        <Controls
          player={playerRef.current}
          isLoading={isLoading}
          isPaused={isPaused}
          isFullscreen={isFullscreen}
          isMuted={isMuted}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          audioTracks={audioTracks}
          selectedAudioTrack={selectedAudioTrack}
          selectedQuality={selectedQuality}
          selectedLanguage={selectedLanguage}
          controlsVisible={controlsVisible}
          availableQualities={availableQualities}
          availableLanguages={availableLanguages}
          title={title}
          onQualityChange={onQualityChange}
          onLanguageChange={onLanguageChange}
          subtitles={subtitles}
          selectedSubtitle={selectedSubtitle}
          onSubtitleChange={handleSubtitleChange}
        />
      </Box>
    );
  }
);

export default VideoPlayer;