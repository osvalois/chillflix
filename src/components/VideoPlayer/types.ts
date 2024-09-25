
// types.ts
import Player from "video.js/dist/types/player";

export interface VideoPlayerProps {
  options: PlayerOptions;
  posterUrl: string;
  title: string;
  onQualityChange: (quality: string) => void;
  onLanguageChange: (language: string) => void;
  availableQualities: string[];
  availableLanguages: string[];
  imdbId: string;
}

export interface PlayerOptions extends videojs.PlayerOptions {
  sources?: { src: string; type: string }[];
}

export interface ControlsProps {
  player: Player | null;
  isLoading: boolean;
  isPaused: boolean;
  isFullscreen: boolean;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  audioTracks: videojs.AudioTrack[];
  selectedAudioTrack: string;
  subtitles: videojs.TextTrack[];
  selectedSubtitle: string | null;
  selectedQuality: string;
  selectedLanguage: string;
  controlsVisible: boolean;
  availableQualities: string[];
  availableLanguages: string[];
  title: string;
  onQualityChange: (quality: string) => void;
  onLanguageChange: (language: string) => void;
}