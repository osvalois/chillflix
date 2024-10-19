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
import { useVideoPlayerState } from "../../hooks/useVideoPlayerState";
import Controls from "./Controls";
import { LoadingOverlay } from "./LoadingOverlay";
import { ErrorOverlay } from "./ErrorOverlay";
import { QualityIndicator } from "./QualityIndicator";
import { useHotkeys } from "react-hotkeys-hook";
import { motion, AnimatePresence } from "framer-motion";
import OpenSubtitlesService, { Subtitle } from "../../services/OpenSubtitlesService";
import { SubtitlesDisplay } from "./SubtitlesDisplay";
import { NetworkInfoOverlay } from "./NetworkInfoOverlay";
import { BufferingOverlay } from "./BufferingOverlay";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useNetworkQuality } from "../../hooks/useNetworkQuality";

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

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;
const BUFFER_THRESHOLD = 500; // milliseconds

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
    const [isMouseMoving, setIsMouseMoving] = useState(false);
    const mouseMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isBuffering, setIsBuffering] = useState(false);
    const bufferingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { trackEvent } = useAnalytics();
    const { networkQuality, updateNetworkQuality } = useNetworkQuality();

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

        player.on("waiting", () => {
          setIsLoading(true);
          setIsBuffering(true);
          if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
          bufferingTimeoutRef.current = setTimeout(() => {
            if (isBuffering) {
              trackEvent('long_buffering', { duration: Date.now() - (bufferingTimeoutRef.current || 0) });
            }
          }, BUFFER_THRESHOLD);
        });

        player.on("canplay", () => {
          setIsLoading(false);
          setIsBuffering(false);
          if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
        });

        player.on("play", () => {
          setIsPaused(false);
          trackEvent('video_play', { title, currentTime: player.currentTime() });
        });

        player.on("pause", () => {
          setIsPaused(true);
          trackEvent('video_pause', { title, currentTime: player.currentTime() });
        });

        player.on("fullscreenchange", () => {
          const isFullscreen = player.isFullscreen();
          setIsFullscreen(isFullscreen);
          setControlsVisible(true);
          setIsMouseMoving(true);
          
          if (isFullscreen) {
            if (controlsTimeoutRef.current) {
              clearTimeout(controlsTimeoutRef.current);
            }
            controlsTimeoutRef.current = setTimeout(() => {
              if (!player.paused()) {
                setControlsVisible(false);
                setIsMouseMoving(false);
              }
            }, 3000);
          }

          trackEvent('fullscreen_change', { isFullscreen });
        });

        player.on("timeupdate", () => {
          setCurrentTime(player.currentTime());
          saveCurrentState(player.currentTime(), player.volume(), player.muted());
        });

        player.on("loadedmetadata", () => {
          setDuration(player.duration());
          checkAudioTracks(player);
          trackEvent('video_loaded', { title, duration: player.duration() });
        });

        player.on("ended", () => {
          trackEvent('video_ended', { title, duration: player.duration() });
        });

        player.on("error", (e) => {
          console.error("Video player error:", player.error());
          trackEvent('video_error', { error: player.error().code, message: player.error().message });

          if (retryCount < MAX_RETRIES) {
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
              player.load();
              player.play().catch((e) => {
                console.error("Retry error:", e);
                trackEvent('retry_error', { error: e.message, retryCount });
              });
            }, RETRY_DELAY);
          } else {
            console.error("Maximum retry attempts reached. Playback failed.");
            toast({
              title: "Playback Error",
              description: "We're having trouble playing this video. Please check your connection and try again later.",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        });

        player.on("progress", () => {
          const buffered = player.buffered();
          if (buffered.length > 0) {
            const bufferedEnd = buffered.end(buffered.length - 1);
            const duration = player.duration();
            updateNetworkQuality(bufferedEnd / duration);
          }
        });

        loadSavedState(player);
      },
      [retryCount, setIsLoading, setIsPaused, setIsFullscreen, setCurrentTime, setDuration, loadSavedState, saveCurrentState, toast, setControlsVisible, trackEvent, title, updateNetworkQuality]
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
          playerRef.current.play().catch((e) => {
            console.error("Play error:", e);
            trackEvent('play_error', { error: e.message });
          });
        }
      }
    }, [selectedQuality, selectedLanguage, options.sources, isPaused, trackEvent]);

    useEffect(() => {
      const showControls = () => {
        setControlsVisible(true);
        setIsMouseMoving(true);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        if (isFullscreen && !isPaused) {
          controlsTimeoutRef.current = setTimeout(() => {
            setControlsVisible(false);
            setIsMouseMoving(false);
          }, 3000);
        }
      };

      const container = containerRef.current;
      if (container) {
        container.addEventListener("mousemove", showControls);
        container.addEventListener("mouseleave", () => {
          if (!isFullscreen) {
            setControlsVisible(false);
            setIsMouseMoving(false);
          }
        });
      }

      return () => {
        if (container) {
          container.removeEventListener("mousemove", showControls);
          container.removeEventListener("mouseleave", () => {
            setControlsVisible(false);
            setIsMouseMoving(false);
          });
        }
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      };
    }, [setControlsVisible, isPaused, isFullscreen]);

    useEffect(() => {
      const fetchSubtitles = async () => {
        if (imdbId) {
          try {
            const fetchedSubtitles = await OpenSubtitlesService.searchSubtitles(imdbId);
            setSubtitles(fetchedSubtitles);
          } catch (error) {
            console.error('Error fetching subtitles:', error);
            trackEvent('subtitle_fetch_error', { imdbId, error: (error as Error).message });
          }
        }
      };

      fetchSubtitles();
    }, [imdbId, trackEvent]);

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
            trackEvent('subtitle_changed', { language: subtitle.LanguageName });
          } catch (error) {
            console.error('Error downloading subtitle:', error);
            trackEvent('subtitle_download_error', { error: (error as Error).message });
            toast({
              title: "Subtitle Error",
              description: "Failed to load subtitles. Please try again.",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        } else {
          trackEvent('subtitles_disabled');
        }
      }
    };

    const handleVideoClick = useCallback((e: React.MouseEvent) => {
      const currentTime = new Date().getTime();
      const timeSinceLastClick = currentTime - lastClickTime;
      
      if (timeSinceLastClick < 300) {
        // Double click
        if (playerRef.current?.isFullscreen()) {
          playerRef.current.exitFullscreen();
        } else {
          playerRef.current?.requestFullscreen();
        }
        trackEvent('double_click_fullscreen_toggle');
      } else {
        // Single click
        if (isFullscreen) {
          setControlsVisible(!controlsVisible);
          setIsMouseMoving(true);
          if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
          }
          if (!controlsVisible && !isPaused) {
            controlsTimeoutRef.current = setTimeout(() => {
              setControlsVisible(false);
              setIsMouseMoving(false);
            }, 3000);
          }
        } else {
          if (playerRef.current?.paused()) {
            playerRef.current.play();
          } else {
            playerRef.current?.pause();
          }
        }
        trackEvent('single_click_play_pause_toggle');
      }
      
      setLastClickTime(currentTime);
      e.preventDefault();
    }, [lastClickTime, isFullscreen, controlsVisible, isPaused, setControlsVisible, trackEvent]);

    // Hotkeys
    useHotkeys("space", () => {
      playerRef.current?.paused() ? playerRef.current.play() : playerRef.current?.pause();
      trackEvent('hotkey_play_pause');
    }, [trackEvent]);
    useHotkeys("m", () => {
      setIsMuted(!isMuted);
      trackEvent('hotkey_mute_toggle');
    }, [isMuted, trackEvent]);
    useHotkeys("f", () => {
      playerRef.current?.isFullscreen() ? playerRef.current.exitFullscreen() : playerRef.current?.requestFullscreen();
      trackEvent('hotkey_fullscreen_toggle');
    }, [trackEvent]);
    useHotkeys("arrowleft", () => {
      if (playerRef.current) {
        const newTime = Math.max(playerRef.current.currentTime() - 10, 0);
        playerRef.current.currentTime(newTime);
        trackEvent('hotkey_rewind', { amount: 10 });
      }
    }, [trackEvent]);
    useHotkeys("arrowright", () => {
      if (playerRef.current) {
        const newTime = Math.min(playerRef.current.currentTime() + 10, playerRef.current.duration());
        playerRef.current.currentTime(newTime);
        trackEvent('hotkey_fast_forward', { amount: 10 });
      }
    }, [trackEvent]);

    const handleVolumeChange = useCallback((newVolume: number) => {
      if (playerRef.current) {
        playerRef.current.volume(newVolume);
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
        saveCurrentState(playerRef.current.currentTime(), newVolume, newVolume === 0);
        trackEvent('volume_change', { newVolume });
      }
    }, [setVolume, setIsMuted, saveCurrentState, trackEvent]);

    const handleQualityChange = useCallback((newQuality: string) => {
      setSelectedQuality(newQuality);
      onQualityChange(newQuality);
      trackEvent('quality_change', { newQuality });
    }, [setSelectedQuality, onQualityChange, trackEvent]);

    const handleLanguageChange = useCallback((newLanguage: string) => {
      setSelectedLanguage(newLanguage);
      onLanguageChange(newLanguage);
      trackEvent('language_change', { newLanguage });
    }, [setSelectedLanguage, onLanguageChange, trackEvent]);

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
        sx={{
          '&:fullscreen, &:-webkit-full-screen, &:-moz-full-screen, &:-ms-fullscreen': {
            width: '100vw',
            height: '100vh',
            borderRadius: 0,
          },
          cursor: isFullscreen && !isMouseMoving ? 'none' : 'auto',
        }}
      >
        <div data-vjs-player>
          <video 
            ref={videoRef} 
            className="video-js vjs-big-play-centered" 
            onClick={handleVideoClick}
            onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu
          />
        </div>
        <SubtitlesDisplay player={playerRef.current} />
        <ErrorOverlay isVisible={retryCount >= MAX_RETRIES} />
        <QualityIndicator quality={selectedQuality} />
        <BufferingOverlay isVisible={isBuffering} />
        <NetworkInfoOverlay quality={networkQuality} />
        <AnimatePresence>
          {controlsVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Controls
                movieId={imdbId}
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
                onQualityChange={handleQualityChange}
                onLanguageChange={handleLanguageChange}
                onVolumeChange={handleVolumeChange}
                subtitles={subtitles}
                selectedSubtitle={selectedSubtitle}
                onSubtitleChange={handleSubtitleChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    );
  }
);

export default VideoPlayer;