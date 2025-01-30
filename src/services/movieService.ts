import axios, { AxiosInstance, AxiosError } from 'axios';

export interface Mirror {
  index: number;
  size: any;
  seeds: any;
  infoHash: string;
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
  id: number;
  Name: string;
  size: number;
  progress: number;
}

export interface MovieInfo {
  posterUrl: string | null;
  InfoHash: string;
  name: string;
  Files: MovieFile[];
  createdAt: string;
  quality?: string;
  language?: string;
}

export type VideoQuality = '4K' | '1080p' | '720p' | '480p';

const API_BASE_URL = 'https://chillflix-indexer-production.up.railway.app/api/v1';
const TORRENT_INFO_URL = 'https://p2media.fly.dev/';
//const TORRENT_INFO_URL = 'http://localhost:8080/';

class MovieService {
  private apiInstance: AxiosInstance;
  private torrentInstance: AxiosInstance;
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

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

  private setupInterceptors(): void {
    this.apiInstance.interceptors.request.use(this.logRequest, this.handleRequestError);
    this.apiInstance.interceptors.response.use(this.logResponse, this.handleResponseError);
    this.torrentInstance.interceptors.request.use(this.logRequest, this.handleRequestError);
    this.torrentInstance.interceptors.response.use(this.logResponse, this.handleResponseError);
  }

  private logRequest = (config: any): any => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  };

  private handleRequestError = (error: any): Promise<never> => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  };

  private logResponse = (response: any): any => {
    console.log(`API Response: ${response.status} ${response.statusText}`);
    return response;
  };

  private handleResponseError = (error: any): Promise<never> => {
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

  public extractInfoHash(magnetLink: string): string {
    const match = magnetLink.match(/xt=urn:btih:([a-zA-Z0-9]+)/i);
    if (match && match[1]) {
      return match[1].toLowerCase();
    }
    throw new Error('Invalid magnet link: InfoHash not found');
  }

  public async searchMirrors(tmdbId: string): Promise<Mirror[]> {
    const cacheKey = `mirrors_${tmdbId}`;
    const cachedData = this.getCachedData<Mirror[]>(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await this.apiInstance.get<Mirror[]>(`/movies/tmdb/${tmdbId}`);
      const mirrors = response.data.map(mirror => ({
        ...mirror,
        infoHash: this.extractInfoHash(mirror.magnet),
      }));
      
      this.setCachedData(cacheKey, mirrors);
      return mirrors;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  public async getMovieInfo(infoHash: string): Promise<MovieInfo> {
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

  public findVideoFile(movieInfo: MovieInfo): { index: number; fileName: string; quality: VideoQuality; infoHash: string } | null {
    const videoFormats = new Set(['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv']);
    let selectedFile: MovieFile | null = null;
    let selectedIndex = -1;
  
    for (let i = 0; i < movieInfo.Files.length; i++) {
      const file = movieInfo.Files[i];
      const extension = file.Name.toLowerCase().slice(-4);
      
      if (videoFormats.has(extension)) {
        // If we haven't selected a file yet, or if this file is larger (assuming larger means better quality)
        if (!selectedFile || file.size > selectedFile.size) {
          selectedFile = file;
          selectedIndex = i;
        }
      }
    }
  
    if (!selectedFile) return null;
  
    const quality = this.determineVideoQuality(selectedFile.size);
  
    return {
      index: selectedIndex,
      fileName: selectedFile.Name,
      quality,
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

  public getStreamUrl(infoHash: string, fileIndex: number): string {
    return `${TORRENT_INFO_URL}stream/${infoHash}/${fileIndex}`;
  }

  public async getSubtitles(imdbId: string): Promise<string[]> {
    const cacheKey = `subtitles_${imdbId}`;
    const cachedData = this.getCachedData<string[]>(cacheKey);
    if (cachedData) return cachedData;

    // Implement subtitle fetching logic here
    // This is a placeholder implementation
    const subtitles = ['en', 'es', 'fr'];
    this.setCachedData(cacheKey, subtitles);
    return subtitles;
  }

  public async reportPlaybackIssue(infoHash: string, issue: string): Promise<void> {
    try {
      await this.apiInstance.post('/report-issue', { infoHash, issue });
    } catch (error) {
      console.error('Error reporting playback issue:', error);
      // Don't throw here, as this is not critical for the user experience
    }
  }

  public async prefetchMovieData(tmdbId: string): Promise<void> {
    try {
      const mirrors = await this.searchMirrors(tmdbId);
      if (mirrors.length > 0) {
        await this.getMovieInfo(mirrors[0].infoHash);
      }
    } catch (error) {
      console.error('Error prefetching movie data:', error);
      // Don't throw here, as this is just a prefetch
    }
  }
}

const movieService = new MovieService();
export default movieService;