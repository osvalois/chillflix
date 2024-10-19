// Base types from TMDB service
import { TMDBMovie, TMDBTVSeries } from "./services/tmdbService";

export interface Movie {
  id: string;
  title: string;
  year: number;
  magnet: string;
  tmdbId: number | null;
  imdbId: string | null;
  language: string;
  originalLanguage: string | null;
  quality: string | null;
  fileType: string | null;
  sha256Hash: string | null;
}

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
  Files: { ID: number; Name: string; Size: number; Progress: number }[];
}

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  original_language: string;
  popularity: number;
  genres: { id: number; name: string }[];
  media_type: 'movie';
  imdb_id?: string;
  homepage?: string;
  videos?: {
    results: {
      key: string;
      site: string;
      type: string;
    }[];
  };
}

export interface TMDBTVSeries {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genres: { id: number; name: string }[];
  media_type: 'tv';
  homepage?: string;
  videos?: {
    results: {
      key: string;
      site: string;
      type: string;
    }[];
  };
}

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
}

export interface MovieReviewsResponse {
  id: number;
  page: number;
  results: Review[];
  total_pages: number;
  total_results: number;
}

// Enums
export enum ContentType {
  Movie = 'movie',
  TVSeries = 'tv'
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface MovieCredits {
  id: number;
  cast: CastMember[];
}

// Interfaces
export interface Genre {
  id: number;
  name: string;
}

// Combined content type
export interface CombinedContent {
  id: number;
  title: string;
  name?: string; // For TV series
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  release_date?: string;
  first_air_date?: string; // For TV series
  original_language: string;
  genre_ids: number[];
  genres: { id: number; name: string }[];
  type: ContentType;
  media_type: 'movie' | 'tv';
  year: number;
  imdb_id?: string;
  homepage?: string;
  videos?: {
    results: {
      key: string;
      site: string;
      type: string;
    }[];
  };
}

// Component Props
export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchHistory: string[];
  onContentSelect: (content: CombinedContent) => void;
  onHistorySelect: (term: string) => void;
}

export interface SearchResultsProps {
  content: CombinedContent[];
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onContentSelect: (content: CombinedContent) => void;
  onFetchNextPage: () => void;
}

export interface ContentCardProps {
  content: CombinedContent;
  onSelect: (content: CombinedContent) => void;
}

export interface SearchInputProps {
  onSearchChange: (term: string, contentType: ContentType) => void;
  onClose: () => void;
  placeholderColor: string;
}

export interface SearchHistoryProps {
  searchHistory: string[];
  onHistorySelect: (term: string) => void;
  textColor: string;
  placeholderColor: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

// TMDB Service types
export type SearchTMDBFunction = (query: string, page?: number) => Promise<CombinedContent[]>;

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
}

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

// User preferences
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