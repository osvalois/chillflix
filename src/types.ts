import type VideoJS from 'video.js';
import React from 'react';
import { AudioTrackCustom } from './components/VideoPlayer/AudioSettingsMenu';
import { ANIMATION_PRESETS } from './constants';

// Corregido: Definición correcta del tipo Player
type Player = typeof VideoJS.players;

// Enums
export enum ContentType {
  Movie = 'movie',
  TVSeries = 'tv'
}

export enum VideoQuality {
  SD = 'sd',
  HD = 'hd',
  FHD = 'fhd',
  UHD = '4k'
}
// types/header.types.ts
export interface GlassEffect {
  background: string;
  backdropFilter: string;
  border: string;
}

export interface NavItemBadge {
  show: boolean;
  content?: string | number;
  color?: string;
}

export interface NavItemAnimation {
  hoverScale?: number;
  transition?: string;
  pulseEffect?: boolean;
}

export interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  gradient: string;
  pulseColor: string;
  isActive?: boolean;
  glassEffect?: GlassEffect;
  badge?: NavItemBadge;
  animation?: NavItemAnimation;
  submenu?: NavItem[];
  onClick?: () => void;
  permission?: string[];
  shortcut: string;
}

export interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
  index?: number;
  showTooltip?: boolean;
  isHovered?: boolean;
  soundEnabled?: boolean;
  animationPreset?: keyof typeof ANIMATION_PRESETS;
  disableParallax?: boolean;
  className?: string;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

// Valores por defecto para las propiedades de glassmorfismo
export const DEFAULT_GLASS_EFFECT: GlassEffect = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.18)'
};

// Valores por defecto para las animaciones
export const DEFAULT_ANIMATION: NavItemAnimation = {
  hoverScale: 1.05,
  transition: 'all 0.3s ease',
  pulseEffect: true
};
export interface NotificationBadgeProps {
  count: number;
  color?: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
}

export interface HeaderGradients {
  primary: string;
  accent: string;
  glass: string;
}


export interface MobileBottomNavProps {
  navItems: NavItem[];
  handleNavigation: (path: string) => void;
  soundEnabled?: boolean;
}

export interface DesktopNavProps {
  navItems: NavItem[];
  handleNavigation: (path: string) => void;
}

// Content base interfaces
export interface ContentBase {
  release_date: string | number | Date;
  id: number;
  title: string;
  overview: string;
  poster_path: string | undefined;
  backdrop_path: string | undefined;
  vote_average: number;
  popularity: number;
  media_type: 'movie' | 'tv';
}

export interface BaseContent {
  id: number;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  original_language: string;
  genres: Genre[];
  homepage?: string;
  videos?: {
    results: VideoResult[];
  };
}

export interface VideoResult {
  key: string;
  site: string;
  type: string;
}

// Search related interfaces
export interface SearchResult {
  primary_color: string;
  homepage: string;
  genres: never[];
  videos: { results: never[]; };
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  release_date?: string;
  first_air_date?: string;
  original_language: string;
  genre_ids: number[];
  type: ContentType;
  media_type: 'movie' | 'tv';
}

// Movie specific interfaces
export interface Movie {
  id: string;
  title: string;
  overview: string;
  year: number;
  magnet: string;
  tmdbId: number | null;
  imdbId: string | null;
  language: string;
  originalLanguage: string | null;
  quality: string | null;
  fileType: string | null;
  sha256Hash: string | null;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
}

export interface TMDBMovie extends BaseContent {
  title: string;
  release_date: string;
  media_type: 'movie';
  imdb_id?: string;
  budget: number;
  runtime: number;
  genre_ids?: number[];
}

// TV Series specific interfaces
export interface TMDBTVSeries extends BaseContent {
  name: string;
  first_air_date: string;
  media_type: 'tv';
  number_of_seasons: number;
  number_of_episodes: number;
  genre_ids?: number[];
}

// Response interfaces
export interface MovieSearchResponse {
  content: Movie[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface MovieInfo {
  Name: string;
  InfoHash: string;
  Files: MovieFile[];
}

export interface MovieFile {
  ID: number;
  Name: string;
  Size: number;
  Progress: number;
}

// Review interfaces
export interface ReviewAuthorDetails {
  name: string;
  username: string;
  avatar_path: string | null;
  rating: number | null;
}

export interface Review {
  id: string;
  author: string;
  author_details: ReviewAuthorDetails;
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
  likes: number;
  dislikes: number;
  upvotes: number;
}

export interface MovieReviewsResponse {
  id: number;
  page: number;
  results: Review[];
  total_pages: number;
  total_results: number;
}

// Cast and Credits interfaces
export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order?: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface MovieCredits {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}

// Genre interface
export interface Genre {
  id: number;
  name: string;
}

// Combined content interface
export interface CombinedContent extends BaseContent {
  primary_color: string;
  title: string;
  name?: string;
  backdrop_blurhash?: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  type: ContentType;
  media_type: 'movie' | 'tv';
  year: number;
  imdb_id?: string;
  budget?: number;
  runtime?: number;
}

// Component Props interfaces
export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchHistory: string[];
  onContentSelect: (content: CombinedContent) => void;
  onHistorySelect: (term: string) => void;
}


export interface SearchResultsProps {
  content: Movie[];
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
  onSelectMovie: (movie: Movie) => void;
  onAddToFavorites: (movie: Movie) => void;
  favoriteMovies?: Set<number>; // Para tracking de favoritos
}

export interface ContentCardProps {
  content: CombinedContent;
  onSelect: (content: CombinedContent) => void;
}

export interface SearchInputProps {
  onSearchChange: (term: string, contentType: ContentType) => void;
  onClose: () => void;
  placeholderColor: string;
  onHistoryDelete: (term: string) => void;
  onHistoryClear: () => void;
}

export interface SearchHistoryProps {
  searchHistory: string[];
  onHistorySelect: (term: string) => void;
  onHistoryDelete: (term: string) => void;
  onHistoryClear: () => void;
  textColor: string;
  placeholderColor: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

// VideoPlayer interfaces
export interface Subtitle {
  MatchedBy: string;
  IDSubMovieFile: string;
  MovieHash: string;
  MovieByteSize: string;
  MovieTimeMS: string;
  IDSubtitleFile: string;
  SubFileName: string;
  SubActualCD: string;
  SubSize: string;
  SubHash: string;
  SubLastTS: string;
  SubTSGroup: string | null;
  InfoReleaseGroup: string | null;
  InfoFormat: string | null;
  InfoOther: string | null;
  IDSubtitle: string;
  UserID: string;
  SubLanguageID: string;
  SubFormat: string;
  SubSumCD: string;
  SubAuthorComment: string;
  SubAddDate: string;
  SubBad: string;
  SubRating: string;
  SubSumVotes: string;
  SubDownloadsCnt: string;
  MovieReleaseName: string;
  MovieFPS: string;
  IDMovie: string;
  IDMovieImdb: string;
  MovieName: string;
  MovieNameEng: string | null;
  MovieYear: string;
  MovieImdbRating: string;
  SubFeatured: string;
  UserNickName: string | null;
  SubTranslator: string;
  ISO639: string;
  LanguageName: string;
  SubComments: string;
  SubHearingImpaired: string;
  UserRank: string | null;
  SeriesSeason: string;
  SeriesEpisode: string;
  MovieKind: string;
  SubHD: string;
  SeriesIMDBParent: string;
  SubEncoding: string;
  SubAutoTranslation: string;
  SubForeignPartsOnly: string;
  SubFromTrusted: string;
  QueryCached: number;
  SubTSGroupHash: string | null;
  SubDownloadLink: string;
  ZipDownloadLink: string;
  SubtitlesLink: string;
  Score: number;
}

export interface PlayerOptions {
  sources: {
    src: string;
    type: string;
  }[];
  fluid?: boolean;
  controls?: boolean;
  autoplay?: boolean;
  preload?: string;
  width?: number;
  height?: number;
  poster?: string;
  responsive?: boolean;
  playbackRates?: any;
  html5?: any;
}

export interface VideoPlayerProps {
  options: PlayerOptions;
  title: string;
  onQualityChange: (newQuality: VideoQuality) => void;
  onLanguageChange: (newLanguage: string) => void;
  availableQualities: VideoQuality[];
  availableLanguages: string[];
  imdbId: string;
  posterUrl: string;
}

export interface ControlsProps {
  movieId: string;
  player: Player | null;
  isLoading: boolean;
  isPaused: boolean;
  isFullscreen: boolean;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  audioTracks: AudioTrackCustom[];
  selectedAudioTrack: string;
  subtitles: Subtitle[];
  selectedSubtitle: string | null;
  selectedQuality: string;
  selectedLanguage: string;
  controlsVisible: boolean;
  availableQualities: string[];
  availableLanguages: string[];
  title: string;
  onQualityChange: (quality: string) => void;
  onLanguageChange: (language: string) => void;
  onSubtitleChange: (subtitle: Subtitle | null) => void;
  onVolumeChange: (volume: number) => void;
}

// Service interfaces
export interface TMDBService {
  searchTMDBMovies: SearchTMDBFunction;
  searchTMDBTVSeries: SearchTMDBFunction;
  searchTMDBContent: (query: string, page?: number, contentType?: ContentType | 'both') => Promise<CombinedContent[]>;
  getTMDBMovieDetails: (tmdbId: number) => Promise<CombinedContent>;
  getTMDBTVSeriesDetails: (tmdbId: number) => Promise<CombinedContent>;
  getTrendingContent: () => Promise<CombinedContent[]>;
  getTopRated: () => Promise<CombinedContent[]>;
  getUpcoming: () => Promise<CombinedContent[]>;
  getGenres: () => Promise<Genre[]>;
  getMoviesByGenre: (genreId: number) => Promise<CombinedContent[]>;
  getMovieCredits: (tmdbId: number) => Promise<MovieCredits>;
  getSimilarMovies: (tmdbId: number) => Promise<CombinedContent[]>;
  getMovieReviews: (tmdbId: string, page?: number) => Promise<MovieReviewsResponse>;
  getPersonalizedRecommendations: (userId: string) => Promise<CombinedContent[]>;
}

// Actor interfaces
export interface ActorDetails {
  id: number;
  name: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  biography: string;
  profile_path: string | null;
  imdb_id: string | null;
  instagram_id: string | null;
  twitter_id: string | null;
  facebook_id: string | null;
}

export interface MovieCredit {
  id: number;
  title?: string;
  name?: string;
  character: string;
  poster_path: string | null;
  vote_average: number;
  media_type: 'movie' | 'tv';
  overview: string;
  release_date?: string;
  first_air_date?: string;
  popularity: number;
}

export interface ActorDetailsContentProps {
  actorDetails: ActorDetails | null;
  actorCredits: MovieCredit[];
}

export interface CastSectionProps {
  cast: CastMember[];
  isLoading: boolean;
}

export interface FilmographyTimelineProps {
  credits: MovieCredit[];
}

export interface CastCardProps {
  member: CastMember;
}

export type SearchTMDBFunction = (query: string, page?: number) => Promise<CombinedContent[]>;

// Search state and actions
export interface SearchState {
  searchTerm: string;
  searchResults: CombinedContent[];
  isLoading: boolean;
  isError: boolean;
  page: number;
  hasNextPage: boolean;
  activeContentType: ContentType;
  totalResults?: number;
  totalPages?: number;
}

export type SearchAction =
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_SEARCH_RESULTS'; payload: CombinedContent[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: boolean }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_HAS_NEXT_PAGE'; payload: boolean }
  | { type: 'SET_ACTIVE_CONTENT_TYPE'; payload: ContentType }
  | { type: 'SET_TOTAL_RESULTS'; payload: number }
  | { type: 'SET_TOTAL_PAGES'; payload: number }
  | { type: 'CLEAR_SEARCH' };

export interface SearchContextType {
  state: SearchState;
  dispatch: React.Dispatch<SearchAction>;
}

// User preferences and recommendations
export interface UserPreferences {
  favoriteGenres: number[];
  favoriteActors: number[];
  watchHistory: number[];
  ratings: { [contentId: number]: number };
}

export interface RecommendationParams {
  userId: string;
  preferences: UserPreferences;
  limit?: number;
}

export interface MovieHeaderProps {
  movie: CombinedContent;
  onTrailerPlay: () => void;
  isMobile: boolean;
  isLoading: boolean;
  isChangingMirror: boolean;
  currentMirrorIndex: number;
  totalMirrors: number;
  onOpenQualitySelector: () => void;
  isPlaying: boolean;
  currentQuality: VideoQuality;
}