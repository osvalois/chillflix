import axios, { AxiosInstance, AxiosError } from 'axios';
import { Console } from 'console';

export interface Mirror {
  InfoHash: any;
  id: string;
  title: string;
  year: number;
  magnet: string;
  tmdbId: number;
  imdbId: string;
  language: string;
  originalLanguage: string;
  quality: string;
  fileType: string;
  sha256Hash: string;
}

export interface MovieFile {
  ID: number;
  Name: string;
  Size: number;
  Progress: number;
}

export interface MovieInfo {
  PosterUrl: any;
  InfoHash: string;
  Name: string;
  Files: MovieFile[];
  CreatedAt: string;
  Quality?: string;
  Language?: string;
}

export type VideoQuality = '4K' | '1080p' | '720p' | '480p';

const API_BASE_URL = 'https://chillflix-indexer.fly.dev/api/v1';
const TORRENT_INFO_URL = 'https://tod-p2m.fly.dev/';

class MovieService {
  private apiInstance: AxiosInstance;
  private torrentInstance: AxiosInstance;
  private cache: Map<string, { data: any, timestamp: number }> = new Map();
  private CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

  constructor() {
    this.apiInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000, // 60 seconds
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.torrentInstance = axios.create({
      baseURL: TORRENT_INFO_URL,
      timeout: 60000, // 60 seconds
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.apiInstance.interceptors.request.use(this.logRequest, this.handleRequestError);
    this.apiInstance.interceptors.response.use(this.logResponse, this.handleResponseError);
    this.torrentInstance.interceptors.request.use(this.logRequest, this.handleRequestError);
    this.torrentInstance.interceptors.response.use(this.logResponse, this.handleResponseError);
  }

  private logRequest = (config: any) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  };

  private handleRequestError = (error: any) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  };

  private logResponse = (response: any) => {
    console.log(`API Response: ${response.status} ${response.statusText}`);
    return response;
  };

  private handleResponseError = (error: any) => {
    console.error('API Response Error:', error);
    return Promise.reject(error);
  };

  private handleApiError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        throw new Error(`API error: ${axiosError.response.status} - ${axiosError.response.statusText}`);
      } else if (axiosError.request) {
        throw new Error('No response received from the server. Please check your internet connection.');
      } else {
        throw new Error(`Error setting up the request: ${axiosError.message}`);
      }
    } else {
      throw new Error('An unexpected error occurred');
    }
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  extractInfoHash(magnetLink: string): string {
    const match = magnetLink.match(/xt=urn:btih:([a-zA-Z0-9]+)/i);
    if (match && match[1]) {
      return match[1].toLowerCase();
    }
    throw new Error('Invalid magnet link: InfoHash not found');
  }

  async searchMirrors(tmdbId: string, language: string = 'es-MX'): Promise<Mirror[]> {
    const cacheKey = `mirrors_${tmdbId}_${language}`;
    const cachedData = this.getCachedData<Mirror[]>(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await this.apiInstance.get<Mirror>(
        `/movies/tmdb`,
        { params: { tmdbId, language } }
      );
      const mirror: Mirror = response.data;
      
      // Extract InfoHash from magnet link
      const InfoHash = this.extractInfoHash(mirror.magnet);
      console.log(InfoHash)
      // Add InfoHash to the mirror object
      const mirrorWithInfoHash = { ...mirror, InfoHash };
      
      const mirrors = [mirrorWithInfoHash];
      this.setCachedData(cacheKey, mirrors);
      return mirrors;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async getMovieInfo(infoHash: string): Promise<MovieInfo> {
    const cacheKey = `movieInfo_${infoHash}`;
    const cachedData = this.getCachedData<MovieInfo>(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await this.torrentInstance.get<MovieInfo>(`torrent/${infoHash}`);
      this.setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  findVideoFile(movieInfo: MovieInfo): { index: number; fileName: string; quality: VideoQuality, infoHash: string } | null {
    console.log(movieInfo)
    console.log("movieInfo")
    const videoFormats = new Set(['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv']);
    const videoFiles = movieInfo.Files.filter(file => 
      videoFormats.has(file.Name.toLowerCase().slice(-4))
    );

    if (videoFiles.length === 0) return null;

    // Assuming the first (and possibly only) video file is the one we want
    const selectedFile = videoFiles[0];
    const quality = this.determineVideoQuality(selectedFile.Size);

    return {
      index: selectedFile.ID,
      fileName: selectedFile.Name,
      quality: quality,
      infoHash: movieInfo.InfoHash
    };
  }

  private determineVideoQuality(fileSize: number): VideoQuality {
    const sizeGB = fileSize / (1024 * 1024 * 1024);
    if (sizeGB > 20) return '4K';
    if (sizeGB > 8) return '1080p';
    if (sizeGB > 2) return '720p';
    return '480p';
  }

  getStreamUrl(infoHash: string, fileIndex: number): string {
    return `${TORRENT_INFO_URL}stream/${infoHash}/${fileIndex}`;
  }

  async getSubtitles(imdbId: string): Promise<string[]> {
    const cacheKey = `subtitles_${imdbId}`;
    const cachedData = this.getCachedData<string[]>(cacheKey);
    if (cachedData) return cachedData;

    // Implement subtitle fetching logic here
    // This is a placeholder implementation
    const subtitles = ['en', 'es', 'fr'];
    this.setCachedData(cacheKey, subtitles);
    return subtitles;
  }

  async reportPlaybackIssue(infoHash: string, issue: string): Promise<void> {
    try {
      await this.apiInstance.post('/report-issue', { infoHash, issue });
    } catch (error) {
      console.error('Error reporting playback issue:', error);
      // Don't throw here, as this is not critical for the user experience
    }
  }

  async prefetchMovieData(tmdbId: string, language: string = 'es-MX'): Promise<void> {
    try {
      const mirrors = await this.searchMirrors(tmdbId, language);
      if (mirrors.length > 0) {
        await this.getMovieInfo(mirrors[0].InfoHash);
      }
    } catch (error) {
      console.error('Error prefetching movie data:', error);
      // Don't throw here, as this is just a prefetch
    }
  }

  async getMovieInfoWithRetry(infoHash: string, maxRetries = 5, initialDelay = 5000): Promise<MovieInfo> {
    let retries = 0;
    let delay = initialDelay;

    while (retries < maxRetries) {
      try {
        return await this.getMovieInfo(infoHash);
      } catch (error) {
        console.error(`Error fetching movie info (attempt ${retries + 1}):`, error);
        retries++;
        if (retries >= maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }

    throw new Error('Failed to fetch movie info after multiple attempts');
  }

  async loadMirrorSequentially(mirrors: Mirror[]): Promise<MovieInfo | null> {
    for (const mirror of mirrors) {
      try {
        const movieInfo = await this.getMovieInfoWithRetry(mirror.InfoHash);
        return movieInfo;
      } catch (error) {
        console.error(`Failed to load mirror ${mirror.id}:`, error);
        // Continue to the next mirror
      }
    }
    return null;
  }
}

const movieService = new MovieService();
export default movieService;

// Exportaciones adicionales para cumplir con las importaciones proporcionadas
export const getMovieInfo = (infoHash: string) => movieService.getMovieInfo(infoHash);
export const getStreamUrl = (infoHash: string, fileIndex: number) => movieService.getStreamUrl(infoHash, fileIndex);
export const extractInfoHash = (magnetLink: string) => movieService.extractInfoHash(magnetLink);
export { MovieInfo };