// useVideoPlayerState.ts
import { useState, useCallback } from 'react';
import Player from "video.js/dist/types/player";

export const useVideoPlayerState = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [audioTracks, setAudioTracks] = useState<videojs.AudioTrack[]>([]);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState("");
  const [subtitles, setSubtitles] = useState<videojs.TextTrack[]>([]);
  const [selectedSubtitle, setSelectedSubtitle] = useState("");
  const [selectedQuality, setSelectedQuality] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [controlsVisible, setControlsVisible] = useState(true);

  const loadSavedState = useCallback((player: Player) => {
    const savedTime = localStorage.getItem('videoPlayerTime');
    const savedVolume = localStorage.getItem('videoPlayerVolume');
    const savedMuted = localStorage.getItem('videoPlayerMuted');

    if (savedTime) player.currentTime(parseFloat(savedTime));
    if (savedVolume) player.volume(parseFloat(savedVolume));
    if (savedMuted) player.muted(savedMuted === 'true');
  }, []);

  const saveCurrentState = useCallback((time: number, volume: number, muted: boolean) => {
    localStorage.setItem('videoPlayerTime', time.toString());
    localStorage.setItem('videoPlayerVolume', volume.toString());
    localStorage.setItem('videoPlayerMuted', muted.toString());
  }, []);

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
    saveCurrentState
  };
};
