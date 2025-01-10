import { CombinedContent } from "../components/Home/ContentCarousel";
import { useMovieData } from "../hooks/useMovieData";
import { MovieCredits } from "../types";

// Tipos de exportación para el hook
export type UseMovieDataReturn = ReturnType<typeof useMovieData>;

export interface VideoProps {
isVideoLoading: boolean;
streamUrl: string | null;
videoJsOptions: any;
movie: CombinedContent;
qualities: string[];
languages: string[];
handleQualityChange: (quality: string) => void;
handleLanguageChange: (language: string) => void;
posterUrl: string;
hasTriedBackupApi: boolean;
isBackupApiLoading: boolean;
handleBackupApiCall: () => Promise<void>;
}

export interface WatchPartyProps {
isVisible: boolean;
watchPartyId: string | null;
hasJoined: boolean;
movie: CombinedContent;
onToggleVisibility: () => void;
onWatchPartyCreated: (partyId: string) => void;
onJoinParty: () => void;
}

export interface MovieDetailsProps {
movie: CombinedContent;
credits: MovieCredits | undefined;
similarMovies: CombinedContent[] | undefined;
isCreditsLoading: boolean;
isSimilarMoviesLoading: boolean;
headerProps: {
  onTrailerPlay: () => void;
  isMobile: boolean;
  isLoading: boolean;
  onChangeMirror: () => void;
  isChangingMirror: boolean;
  currentMirrorIndex: number;
  totalMirrors: number;
  onOpenQualitySelector: () => void;
  isPlaying: boolean;
  currentQuality: string;
};
}