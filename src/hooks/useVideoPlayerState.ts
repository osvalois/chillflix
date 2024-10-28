// useVideoPlayerState.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import Player from "video.js/dist/types/player";
import { AudioTrack } from '../components/VideoPlayer/types';

interface VideoState {
  time: number;
  volume: number;
  muted: boolean;
  quality: string;
  language: string;
  audioTrack: string;
  subtitle: string;
  playbackRate: number;
}

export const useVideoPlayerState = (movieId: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState("");
  const [subtitles, setSubtitles] = useState<TextTrack[]>([]);
  const [selectedSubtitle, setSelectedSubtitle] = useState("");
  const [selectedQuality, setSelectedQuality] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [controlsVisible, setControlsVisible] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [buffered, setBuffered] = useState<TimeRanges | null>(null);

  const playerRef = useRef<Player | null>(null);

  const loadSavedState = useCallback((player: Player) => {
    const savedState = localStorage.getItem(`videoState_${movieId}`);
    if (savedState) {
      const state: VideoState = JSON.parse(savedState);
      player.currentTime(state.time);
      player.volume(state.volume);
      player.muted(state.muted);
      setSelectedQuality(state.quality);
      setSelectedLanguage(state.language);
      setSelectedAudioTrack(state.audioTrack);
      setSelectedSubtitle(state.subtitle);
      player.playbackRate(state.playbackRate);
      setPlaybackRate(state.playbackRate);
      setIsMuted(state.muted);
      setVolume(state.volume);
    }
  }, [movieId]);

  const saveCurrentState = useCallback((player: Player) => {
    const state: VideoState = {
      time: player.currentTime() ?? 0,
      volume: player.volume() ?? 0,
      muted: player.muted() ?? false,
      quality: selectedQuality,
      language: selectedLanguage,
      audioTrack: selectedAudioTrack,
      subtitle: selectedSubtitle,
      playbackRate: player.playbackRate() ?? 0
    };
    localStorage.setItem(`videoState_${movieId}`, JSON.stringify(state));
  }, [movieId, selectedQuality, selectedLanguage, selectedAudioTrack, selectedSubtitle]);

  const handleTimeUpdate = useCallback((player: Player) => {
    setCurrentTime(player.currentTime() ?? 0);
    saveCurrentState(player);
  }, [saveCurrentState]);

  const handleVolumeChange = useCallback((player: Player) => {
    setVolume(player.volume() ?? 0);
    setIsMuted(player.muted() ?? false);
    saveCurrentState(player);
  }, [saveCurrentState]);

  const handlePlaybackRateChange = useCallback((player: Player) => {
    setPlaybackRate(player.playbackRate() ?? 0);
    saveCurrentState(player);
  }, [saveCurrentState]);

  const handleBufferUpdate = useCallback((player: Player) => {
    setBuffered(player.buffered());
  }, []);

  const handleQualityChange = useCallback((quality: string) => {
    setSelectedQuality(quality);
    if (playerRef.current) {
      saveCurrentState(playerRef.current);
    }
  }, [saveCurrentState]);

  const handleLanguageChange = useCallback((language: string) => {
    setSelectedLanguage(language);
    if (playerRef.current) {
      saveCurrentState(playerRef.current);
    }
  }, [saveCurrentState]);

  const handleAudioTrackChange = useCallback((track: string) => {
    setSelectedAudioTrack(track);
    if (playerRef.current) {
      saveCurrentState(playerRef.current);
    }
  }, [saveCurrentState]);

  const handleSubtitleChange = useCallback((subtitle: string) => {
    setSelectedSubtitle(subtitle);
    if (playerRef.current) {
      saveCurrentState(playerRef.current);
    }
  }, [saveCurrentState]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        saveCurrentState(playerRef.current);
      }
    }, 5000); // Save state every 5 seconds

    return () => clearInterval(interval);
  }, [saveCurrentState]);

  return {
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
    playbackRate,
    buffered,
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
    setPlaybackRate,
    loadSavedState,
    saveCurrentState,
    handleTimeUpdate,
    handleVolumeChange,
    handlePlaybackRateChange,
    handleBufferUpdate,
    handleQualityChange,
    handleLanguageChange,
    handleAudioTrackChange,
    handleSubtitleChange,
    playerRef
  };
};