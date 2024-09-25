import React, { useEffect, useRef, useCallback, useState } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import {
  Box,
  Center,
  useColorModeValue,
  Fade,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import "video.js/dist/video-js.css";
import { PlayerOptions, VideoPlayerProps } from "./types";
import { Subtitle } from "../../services/OpenSubtitlesService";
import { useVideoPlayerState } from "./useVideoPlayerState";
import { useSubtitles } from "./useSubtitles";
import Controls from "./Controls";
import { SubtitlesSelector } from "./SubtitlesSelector";
import { SubtitlesDisplay } from "./SubtitlesDisplay";
import { LoadingOverlay } from "./LoadingOverlay";
import { ErrorOverlay } from "./ErrorOverlay";
import { QualityIndicator } from "./QualityIndicator";
import { useHotkeys } from "react-hotkeys-hook";
import { motion, AnimatePresence } from "framer-motion";

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
    const { isOpen: subtitlesSelectorVisible, onToggle: toggleSubtitlesSelector } = useDisclosure();
    const bgColor = useColorModeValue("gray.100", "gray.900");
    const toast = useToast();
    const [lastClickTime, setLastClickTime] = useState(0);

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
      subtitles,
      selectedSubtitle,
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
      setSubtitles,
      setSelectedSubtitle,
      setSelectedQuality,
      setSelectedLanguage,
      setControlsVisible,
      loadSavedState,
      saveCurrentState,
    } = useVideoPlayerState();

    const { loadSubtitles, downloadedSubtitles, isLoadingSubtitles, subtitlesError } = useSubtitles(imdbId);

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
          checkSubtitles(player);
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

    const checkSubtitles = useCallback(
      (player: Player) => {
        const tracks = player.textTracks();
        const subtitleList: videojs.TextTrack[] = [];

        if (tracks && tracks.length) {
          for (let i = 0; i < tracks.length; i++) {
            if (tracks[i].kind === "subtitles" || tracks[i].kind === "captions") {
              subtitleList.push(tracks[i]);
            }
          }
        }

        setSubtitles(subtitleList);

        if (subtitleList.length > 0) {
          const defaultSubtitle = subtitleList.find((track) => track.mode === "showing") || subtitleList[0];
          setSelectedSubtitle(defaultSubtitle.label);
        }
      },
      [setSubtitles, setSelectedSubtitle]
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
      loadSubtitles();
    }, [loadSubtitles]);

    const handleSubtitleChange = useCallback(
      (subtitle: Subtitle | null) => {
        if (playerRef.current) {
          const textTracks = playerRef.current.textTracks();
          for (let i = 0; i < textTracks.length; i++) {
            const track = textTracks[i];
            if (subtitle && track.language === subtitle.ISO639) {
              track.mode = "showing";
            } else {
              track.mode = "disabled";
            }
          }
        }
        setSelectedSubtitle(subtitle ? subtitle.LanguageName : null);
        toggleSubtitlesSelector();
      },
      [setSelectedSubtitle, toggleSubtitlesSelector]
    );

    useEffect(() => {
      if (playerRef.current && downloadedSubtitles.length > 0) {
        playerRef.current.textTracks().tracks_.forEach((track) => {
          if (track.kind === "subtitles" || track.kind === "captions") {
            playerRef.current?.removeRemoteTextTrack(track);
          }
        });

        downloadedSubtitles.forEach((subtitle) => {
          playerRef.current?.addRemoteTextTrack(
            {
              kind: "subtitles",
              label: subtitle.LanguageName,
              srclang: subtitle.ISO639,
              src: subtitle.SubtitlesLink,
              language: subtitle.ISO639,
            },
            false
          );
        });

        if (selectedSubtitle) {
          const defaultSubtitle = downloadedSubtitles.find((sub) => sub.LanguageName === selectedSubtitle);
          if (defaultSubtitle) {
            handleSubtitleChange(defaultSubtitle);
          }
        }
      }
    }, [downloadedSubtitles, selectedSubtitle, handleSubtitleChange]);

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
        <SubtitlesDisplay player={playerRef.current} />
        <QualityIndicator quality={selectedQuality} />
        <AnimatePresence>
          {subtitlesSelectorVisible && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Center position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" zIndex="2">
                <SubtitlesSelector
                  subtitles={downloadedSubtitles}
                  selectedSubtitle={selectedSubtitle}
                  onSubtitleChange={handleSubtitleChange}
                  isVisible={subtitlesSelectorVisible}
                  isLoading={isLoadingSubtitles}
                  error={subtitlesError}
                />
              </Center>
            </motion.div>
          )}
        </AnimatePresence>
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
          selectedSubtitle={selectedSubtitle}
          selectedQuality={selectedQuality}
          selectedLanguage={selectedLanguage}
          controlsVisible={controlsVisible}
          availableQualities={availableQualities}
          availableLanguages={availableLanguages}
          title={title}
          onQualityChange={onQualityChange}
          onLanguageChange={onLanguageChange}
          subtitles={downloadedSubtitles}
          onToggleSubtitlesSelector={toggleSubtitlesSelector}
        />
      </Box>
    );
  }
);

export default VideoPlayer;