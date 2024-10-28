import { PlayerOptions } from "../../types";

// types.ts
export interface AudioTrack {
  enabled: boolean;
  id: string;
  kind: string;
  label: string;
  language: string;
}

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