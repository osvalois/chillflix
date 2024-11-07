import React, { useEffect, useRef, useCallback, useState, useMemo } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import {
  Box,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import "video.js/dist/video-js.css";
import { AudioTrack, VideoPlayerProps } from "./types";
import Controls from "./Controls";
import { ErrorOverlay } from "./ErrorOverlay";
import { QualityIndicator } from "./QualityIndicator";
import { useHotkeys } from "react-hotkeys-hook";
import { motion, AnimatePresence } from "framer-motion";
import { SubtitlesDisplay } from "./SubtitlesDisplay";
import { useAnalytics } from "../../hooks/useAnalytics";
import { PlayerOptions, Subtitle } from "../../types";
import OpenSubtitlesService from "../../services/openSubtitlesService";
import { useVideoPlayerState } from "../../hooks/useVideoPlayerState";
import { AudioTrackCustom } from "./AudioSettingsMenu";
import { debounce } from 'lodash';

// Constants
const CONSTANTS = {
  MAX_RETRIES: 5,
  RETRY_DELAY: 5000,
  BUFFER_THRESHOLD: 500,
  CONTROLS_HIDE_DELAY: 3000,
  DOUBLE_CLICK_THRESHOLD: 300,
  SEEK_SECONDS: 10,
  ERROR_TOAST_DURATION: 5000,
  MIN_VOLUME: 0,
  MAX_VOLUME: 1,
} as const;

const initialOptions: PlayerOptions = {
  responsive: true,
  fluid: true,
  playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
  html5: {
    nativeAudioTracks: true,
    nativeVideoTracks: true,
    nativeTextTracks: true,
    vhs: {
      overrideNative: true,
      cacheEncryptionKeys: true,
    }
  },
  preload: "auto",
  sources: [],
};

// Custom hook for managing timeouts
const useTimeout = () => {
  const timeoutRefs = useRef<{ [key: string]: NodeJS.Timeout | null }>({});

  const setCustomTimeout = useCallback((key: string, callback: () => void, delay: number) => {
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]!);
    }
    timeoutRefs.current[key] = setTimeout(callback, delay);
  }, []);

  const clearCustomTimeout = useCallback((key: string) => {
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]!);
      timeoutRefs.current[key] = null;
    }
  }, []);

  const clearAllTimeouts = useCallback(() => {
    Object.keys(timeoutRefs.current).forEach(key => {
      if (timeoutRefs.current[key]) {
        clearTimeout(timeoutRefs.current[key]!);
        timeoutRefs.current[key] = null;
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  return { setCustomTimeout, clearCustomTimeout, clearAllTimeouts };
};

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
    // Refs
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const playerRef = useRef<Player | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const previousSourceRef = useRef<string | null>(null);

    // State
    const [retryCount, setRetryCount] = useState(0);
    const [isBuffering, setIsBuffering] = useState(false);
    const [isMouseMoving, setIsMouseMoving] = useState(false);
    const [lastClickTime, setLastClickTime] = useState(0);
    const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
    const [selectedSubtitle, setSelectedSubtitle] = useState<Subtitle | null>(null);
    const [isSourceChanging, setIsSourceChanging] = useState(false);

    // Hooks
    const bgColor = useColorModeValue("gray.100", "gray.900");
    const toast = useToast();
    const { trackEvent } = useAnalytics();
    const { setCustomTimeout, clearCustomTimeout, clearAllTimeouts } = useTimeout();

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
    } = useVideoPlayerState('USER-ID');

    // Memoized error handler
    const handleError = useCallback((player: any, error: any) => {
      console.error("Video player error:", error);
      trackEvent('video_error', { 
        code: error?.code,
        message: error?.message,
        type: error?.type,
        retryCount
      });

      if (retryCount < CONSTANTS.MAX_RETRIES) {
        setCustomTimeout('retry', () => {
          setRetryCount(prev => prev + 1);
          if (player && !isSourceChanging) {
            player.load();
            player.play()?.catch((e: { message: any; }) => {
              console.error("Play error after retry:", e);
              trackEvent('play_error_after_retry', { error: e.message });
            });
          }
        }, CONSTANTS.RETRY_DELAY);
      } else {
        console.error("Maximum retry attempts reached. Playback failed.");
        toast({
          title: "Playback Error",
          description: "We're having trouble playing this video. Please check your connection and try again later.",
          status: "error",
          duration: CONSTANTS.ERROR_TOAST_DURATION,
          isClosable: true,
        });
      }
    }, [retryCount, isSourceChanging, setCustomTimeout, toast, trackEvent]);

    // Audio tracks handler
    const checkAudioTracks = useCallback((player: any) => {
      try {
        const tracks = player.audioTracks();
        const trackList: AudioTrack[] = [];

        if (tracks?.length) {
          for (let i = 0; i < tracks.length; i++) {
            trackList.push(tracks[i]);
          }
          setAudioTracks(trackList);

          const defaultTrack = trackList.find(track => track.enabled) || trackList[0];
          if (defaultTrack) {
            setSelectedAudioTrack((defaultTrack as unknown as AudioTrackCustom).label);
            defaultTrack.enabled = true;
          }
        }
      } catch (error) {
        console.error('Error handling audio tracks:', error);
        trackEvent('audio_tracks_error', { error: (error as Error).message });
      }
    }, [setAudioTracks, setSelectedAudioTrack, trackEvent]);

    // Player event handlers
    const handlePlayerReady = useCallback((player: Player) => {
      playerRef.current = player;

      const eventHandlers = {
        waiting: () => {
          setIsLoading(true);
          setIsBuffering(true);
          setCustomTimeout('buffer', () => {
            if (isBuffering) {
              trackEvent('long_buffering', { 
                duration: CONSTANTS.BUFFER_THRESHOLD,
                currentTime: player.currentTime()
              });
            }
          }, CONSTANTS.BUFFER_THRESHOLD);
        },
        canplay: () => {
          setIsLoading(false);
          setIsBuffering(false);
          clearCustomTimeout('buffer');
        },
        play: () => {
          setIsPaused(false);
          trackEvent('video_play', { 
            title, 
            currentTime: player.currentTime(),
            quality: selectedQuality,
            language: selectedLanguage
          });
        },
        pause: () => {
          setIsPaused(true);
          trackEvent('video_pause', { 
            title, 
            currentTime: player.currentTime() 
          });
        },
        error: () => handleError(player, player.error()),
        timeupdate: () => {
          const time = player.currentTime();
          if (typeof time === 'number') {
            setCurrentTime(time);
            saveCurrentState(player);
          }
        },
        loadedmetadata: () => {
          const dur = player.duration();
          if (typeof dur === 'number') {
            setDuration(dur);
            checkAudioTracks(player);
            trackEvent('video_loaded', { 
              title, 
              duration: dur,
              quality: selectedQuality,
              language: selectedLanguage
            });
          }
        },
        ended: () => {
          trackEvent('video_ended', { 
            title, 
            duration: player.duration() 
          });
        },
        volumechange: () => {
          const newVolume = player.volume();
          if (typeof newVolume === 'number') {
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
            saveCurrentState(player);
          }
        },
        fullscreenchange: () => {
          const isFullscreen = player.isFullscreen();
          setIsFullscreen(isFullscreen ?? false);
          setControlsVisible(true);
          setIsMouseMoving(true);

          if (isFullscreen && !player.paused()) {
            setCustomTimeout('controls', () => {
              setControlsVisible(false);
              setIsMouseMoving(false);
            }, CONSTANTS.CONTROLS_HIDE_DELAY);
          }
        }
      };

      // Attach event listeners
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        player.on(event, handler);
      });

      // Load saved state
      loadSavedState(player);

      return () => {
        // Remove event listeners
        Object.entries(eventHandlers).forEach(([event, handler]) => {
          player.off(event, handler);
        });
      };
    }, [
      setIsLoading, setIsBuffering, setIsPaused, setCurrentTime, 
      setDuration, setVolume, setIsMuted, setIsFullscreen, 
      setControlsVisible, loadSavedState, saveCurrentState, 
      handleError, checkAudioTracks, trackEvent, title, 
      selectedQuality, selectedLanguage, setCustomTimeout, 
      clearCustomTimeout
    ]);

    // Initialize player
    useEffect(() => {
      if (!playerRef.current && videoRef.current) {
        const videoElement = videoRef.current;

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

        // Set initial source
        if (options.sources?.length) {
          player.src(options.sources);
          previousSourceRef.current = options.sources[0]?.src || null;
        }

        return () => {
          clearAllTimeouts();
          if (playerRef.current) {
            playerRef.current.dispose();
            playerRef.current = null;
          }
        };
      }
    }, [options, handlePlayerReady, clearAllTimeouts]);

    // Handle source changes
    useEffect(() => {
      if (playerRef.current && options.sources?.length) {
        const newSource = options.sources[0]?.src;
        if (newSource !== previousSourceRef.current) {
          setIsSourceChanging(true);
          const currentTime = playerRef.current.currentTime();
          const wasPlaying = !playerRef.current.paused();

          playerRef.current.src(options.sources);
          if (typeof currentTime === 'number') {
            playerRef.current.currentTime(currentTime);
          }

          if (wasPlaying) {
            //playerRef.current!.play().catch(e => {
            //  console.error("Play error after source change:", e);
            //  trackEvent('play_error_source_change', { error: e.message });
            // });
          }

          previousSourceRef.current = newSource;
          setIsSourceChanging(false);
        }
      }
    }, [selectedQuality, selectedLanguage, options.sources, trackEvent]);

    // Mouse movement handler for controls
    useEffect(() => {
      const debouncedShowControls = debounce(() => {
        setControlsVisible(true);
        setIsMouseMoving(true);
        
        if (isFullscreen && !isPaused) {
          setCustomTimeout('controls', () => {
            setControlsVisible(false);
            setIsMouseMoving(false);
          }, CONSTANTS.CONTROLS_HIDE_DELAY);
        }
      }, 150);

      const handleMouseLeave = () => {
        if (!isFullscreen) {
          setControlsVisible(false);
          setIsMouseMoving(false);
        }
      };

      const container = containerRef.current;
      if (container) {
        container.addEventListener("mousemove", debouncedShowControls);
        container.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          container.removeEventListener("mousemove", debouncedShowControls);
          container.removeEventListener("mouseleave", handleMouseLeave);
          debouncedShowControls.cancel();
        };
      }
    }, [isFullscreen, isPaused, setControlsVisible, setCustomTimeout]);

    // Subtitles loading
    useEffect(() => {
      const loadSubtitles = async () => {
        if (imdbId) {
          try {
            const fetchedSubtitles = await OpenSubtitlesService.searchSubtitles(imdbId);
            setSubtitles(fetchedSubtitles);
          } catch (error) {
            console.error('Error fetching subtitles:', error);
            trackEvent('subtitle_fetch_error', { 
              imdbId, 
              error: (error as Error).message 
            });
          }
        }
      };

      loadSubtitles();
    }, [imdbId, trackEvent]);

    // Handlers
    const handleVideoClick = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      const currentTime = Date.now();
      const timeSinceLastClick = currentTime - lastClickTime;
      
      if (timeSinceLastClick < CONSTANTS.DOUBLE_CLICK_THRESHOLD) {
        // Double click - toggle fullscreen
        if (playerRef.current?.isFullscreen()) {
          playerRef.current.exitFullscreen();
        } else {
          playerRef.current?.requestFullscreen();
        }
        trackEvent('double_click_fullscreen_toggle');
      } else {
        // Single click - toggle play/pause or controls
        if (isFullscreen) {
          setControlsVisible(!controlsVisible);
          setIsMouseMoving(true);
          if (!controlsVisible && !isPaused) {
            setCustomTimeout('controls', () => {
              setControlsVisible(false);
              setIsMouseMoving(false);
            }, CONSTANTS.CONTROLS_HIDE_DELAY);
          }
        } else if (playerRef.current) {
          if (playerRef.current.paused()) {
            //playerRef.current.play().catch(e => {
            //  console.error("Play error on click:", e);
            //  trackEvent('play_error_click', { error: e.message });
            //});
          } else {
            playerRef.current.pause();
          }
        }
        trackEvent('single_click_interaction', { 
          action: isFullscreen ? 'toggle_controls' : 'toggle_playback',
          currentTime: playerRef.current?.currentTime()
        });
      }
      
      setLastClickTime(currentTime);
    }, [lastClickTime, isFullscreen, controlsVisible, isPaused, setControlsVisible, setCustomTimeout, trackEvent]);

    const handleSubtitleChange = useCallback(async (subtitle: Subtitle | null) => {
      setSelectedSubtitle(subtitle);

      if (playerRef.current) {
        const player = playerRef.current;
        
        try {
          // Remove existing text tracks
          const existingTracks = (player as any).textTracks();

          for (let i = existingTracks.length - 1; i >= 0; i--) {
            player.removeRemoteTextTrack(existingTracks[i]);
          }
      
          if (subtitle) {
            const subtitleUrl = await OpenSubtitlesService.downloadSubtitle(subtitle.SubDownloadLink);
            const track = player.addRemoteTextTrack({
              kind: 'subtitles',
              label: subtitle.LanguageName,
              srclang: subtitle.ISO639,
              src: subtitleUrl,
              default: true
            }, false) as unknown as TextTrack;
            
            if (track) {
              track.mode = 'showing';
              trackEvent('subtitle_changed', { 
                language: subtitle.LanguageName,
                currentTime: player.currentTime()
              });
            }
          } else {
            trackEvent('subtitles_disabled', {
              currentTime: player.currentTime()
            });
          }
        } catch (error) {
          console.error('Error handling subtitles:', error);
          trackEvent('subtitle_error', { error: (error as Error).message });
          toast({
            title: "Subtitle Error",
            description: "Failed to load subtitles. Please try again.",
            status: "error",
            duration: CONSTANTS.ERROR_TOAST_DURATION,
            isClosable: true,
          });
        }
      }
    }, [trackEvent, toast]);

    const handleVolumeChange = useCallback((newVolume: number) => {
      if (playerRef.current) {
        const clampedVolume = Math.max(CONSTANTS.MIN_VOLUME, Math.min(CONSTANTS.MAX_VOLUME, newVolume));
        playerRef.current.volume(clampedVolume);
        setVolume(clampedVolume);
        setIsMuted(clampedVolume === 0);
        saveCurrentState(playerRef.current);
        trackEvent('volume_change', { 
          newVolume: clampedVolume,
          isMuted: clampedVolume === 0
        });
      }
    }, [setVolume, setIsMuted, saveCurrentState, trackEvent]);

    const handleQualityChange = useCallback((newQuality: string) => {
      setSelectedQuality(newQuality);
      onQualityChange(newQuality);
      trackEvent('quality_change', { 
        newQuality,
        previousQuality: selectedQuality,
        currentTime: playerRef.current?.currentTime()
      });
    }, [setSelectedQuality, onQualityChange, selectedQuality, trackEvent]);

    const handleLanguageChange = useCallback((newLanguage: string) => {
      setSelectedLanguage(newLanguage);
      onLanguageChange(newLanguage);
      trackEvent('language_change', { 
        newLanguage,
        previousLanguage: selectedLanguage,
        currentTime: playerRef.current?.currentTime()
      });
    }, [setSelectedLanguage, onLanguageChange, selectedLanguage, trackEvent]);

    // Hotkeys setup
    useHotkeys("space", (e) => {
      e.preventDefault();
      if (playerRef.current) {
        playerRef.current.paused() ? 
        (playerRef.current as any).play().catch((err: any) => console.error(err)) : 
          playerRef.current.pause();
        trackEvent('hotkey_play_pause');
      }
    }, [trackEvent]);

    useHotkeys("m", () => {
      setIsMuted(!isMuted);
      if (playerRef.current) {
        playerRef.current.muted(!playerRef.current.muted());
      }
      trackEvent('hotkey_mute_toggle', { newState: !isMuted });
    }, [isMuted, trackEvent]);

    useHotkeys("f", () => {
      if (playerRef.current) {
        playerRef.current.isFullscreen() ? 
          playerRef.current.exitFullscreen() : 
          playerRef.current.requestFullscreen();
        trackEvent('hotkey_fullscreen_toggle');
      }
    }, [trackEvent]);

    useHotkeys("arrowleft", () => {
      if (playerRef.current) {
        const currentTime = playerRef.current.currentTime() || 0;
        const newTime = Math.max(0, currentTime - CONSTANTS.SEEK_SECONDS);
        playerRef.current.currentTime(newTime);
        trackEvent('hotkey_rewind', { 
          amount: CONSTANTS.SEEK_SECONDS,
          fromTime: currentTime,
          toTime: newTime
        });
      }
    }, [trackEvent]);

    useHotkeys("arrowright", () => {
      if (playerRef.current) {
        const currentTime = playerRef.current.currentTime() || 0;
        const duration = playerRef.current.duration() || 0;
        const newTime = Math.min(duration, currentTime + CONSTANTS.SEEK_SECONDS);
        playerRef.current.currentTime(newTime);
        trackEvent('hotkey_fast_forward', { 
          amount: CONSTANTS.SEEK_SECONDS,
          fromTime: currentTime,
          toTime: newTime
        });
      }
    }, [trackEvent]);

    // Memoized styles
    const containerStyles = useMemo(() => ({
      '&:fullscreen, &:-webkit-full-screen, &:-moz-full-screen, &:-ms-fullscreen': {
        width: '100vw',
        height: '100vh',
        borderRadius: 0,
      },
      cursor: isFullscreen && !isMouseMoving ? 'none' : 'auto',
      '.video-js': {
        width: '100%',
        height: '100%',
        minHeight: { base: '300px', md: '360px' },
        maxHeight: { base: '70vh', md: '80vh' },
        '@media (orientation: landscape) and (max-width: 768px)': {
          minHeight: '85vh',
        }
      },
      '.video-js video': {
        objectFit: 'contain',
        width: '100%',
        height: '100%'
      },
      '.vjs-control-bar': {
        display: 'none'
      },
      '.vjs-big-play-button': {
        display: 'none'
      }
    }), [isFullscreen, isMouseMoving]);

    return (
      <Box
        position="relative"
        ref={containerRef}
        borderRadius={{ base: "none", md: "xl" }}
        overflow="hidden"
        boxShadow="xl"
        bg={bgColor}
        width="100%"
        height="100%"
        minHeight={{ base: "calc(55vh)", md: "auto" }}
        maxHeight={{ base: "calc(65vh)", md: "80vh" }}
        margin={{ base: 0, md: "auto" }}
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
        sx={containerStyles}
      >
        <div data-vjs-player>
          <video 
            ref={videoRef}
            className="video-js vjs-big-play-centered"
            playsInline
            onClick={handleVideoClick}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>

        <SubtitlesDisplay 
          player={playerRef.current} 
          parsedCues={null} 
        />

        <ErrorOverlay 
          isVisible={retryCount >= CONSTANTS.MAX_RETRIES} 
        />

        <QualityIndicator 
          quality={selectedQuality} 
        />

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
                selectedSubtitle={selectedSubtitle ? selectedSubtitle.toString() : null}
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