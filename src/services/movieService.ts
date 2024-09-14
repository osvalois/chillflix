
// src/services/movieService.ts
import axios, { AxiosInstance } from 'axios';

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
  Files: { Path: string; Size: number }[];
}

const API_BASE_URL = 'https://chillflix-indexer.fly.dev/api/v1';
const TORRENT_INFO_URL = 'https://tod-p2m.fly.dev/torrent';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

export const searchMovies = async (query: string, page: number = 0, size: number = 20): Promise<Movie[]> => {
  try {
    const response = await api.get<Movie[]>('/movies/advanced-search', {
      params: {
        title: query,
        page,
        size,
        sort: 'title,asc',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

export const getMovieInfo = async (infoHash: string): Promise<MovieInfo> => {
  try {
    const response = await axios.get<MovieInfo>(`${TORRENT_INFO_URL}/${infoHash}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching movie info:', error);
    throw error;
  }
};

export const getStreamUrl = (infoHash: string): string => {
  return `https://tod-p2m.fly.dev/stream/${infoHash}/0`;
};

export const extractInfoHash = (magnetUri: string): string => {
  const match = magnetUri.match(/xt=urn:btih:([^&]+)/);
  if (match && match[1]) {
    return match[1];
  }
  throw new Error('Invalid magnet URI');
};

const movieService = {
  searchMovies,
  getMovieInfo,
  getStreamUrl,
  extractInfoHash,
};

export default movieService;