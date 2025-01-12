import axios, { AxiosInstance } from 'axios';
import pako from 'pako';
import { Subtitle, SearchResponseV1, DownloadRequestV1, DownloadResponseV1 } from './subtitle-types';
import { SubtitleAdapter } from './subtitle-adapter';

class OpenSubtitlesService {
  private axiosInstance: AxiosInstance;
  private apiKey: string;
  private token: string | null = null;
  private subtitleCache: Map<string, Subtitle[]> = new Map();
  private downloadCache: Map<string, string> = new Map();
  private pendingRequests: Map<string, Promise<Subtitle[]>> = new Map();
  private lastRequestTime: number = 0;
  private readonly REQUEST_DELAY = 1000; // 1 segundo entre solicitudes

  constructor() {
    this.apiKey = 'CebeEIzDp2oKu8PhYhR1K8J2ZRAWEtQq';
    this.axiosInstance = axios.create({
      baseURL: 'https://api.opensubtitles.com/api/v1',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': this.apiKey,
        'User-Agent': 'TemporaryUserAgent v1.0'
      }
    });
  }

  private async throttleRequest(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.REQUEST_DELAY) {
      await new Promise(resolve => 
        setTimeout(resolve, this.REQUEST_DELAY - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();
  }

  async searchSubtitles(imdbId: string): Promise<Subtitle[]> {
    // Verificar caché primero
    const cachedSubtitles = this.subtitleCache.get(imdbId);
    if (cachedSubtitles) {
      return cachedSubtitles;
    }

    // Verificar si hay una solicitud pendiente
    const pendingRequest = this.pendingRequests.get(imdbId);
    if (pendingRequest) {
      return pendingRequest;
    }

    // Crear nueva solicitud
    const request = this.fetchSubtitles(imdbId);
    this.pendingRequests.set(imdbId, request);

    try {
      const subtitles = await request;
      this.subtitleCache.set(imdbId, subtitles);
      return subtitles;
    } finally {
      this.pendingRequests.delete(imdbId);
    }
  }

  private async fetchSubtitles(imdbId: string): Promise<Subtitle[]> {
    try {
      await this.throttleRequest();
      
      const cleanImdbId = imdbId.replace('tt', '');
      const response = await this.axiosInstance.get<SearchResponseV1>('/subtitles', {
        params: {
          imdb_id: cleanImdbId,
          languages: 'en,es'
        }
      });

      const subtitles = response.data.data.map(subtitle => 
        SubtitleAdapter.toLegacySubtitle(subtitle)
      );

      return subtitles;
    } catch (error) {
      console.error('Error searching for subtitles:', error);
      return [];
    }
  }

  async downloadSubtitle(url: string): Promise<string> {
    // Verificar caché de descargas
    const cachedDownload = this.downloadCache.get(url);
    if (cachedDownload) {
      return cachedDownload;
    }

    try {
      await this.throttleRequest();
      
      let subtitleUrl: string;
      
      if (url.startsWith('file_')) {
        const fileId = url.replace('file_', '');
        const downloadRequest: DownloadRequestV1 = {
          file_id: parseInt(fileId),
        };

        if (this.token) {
          const response = await this.axiosInstance.post<DownloadResponseV1>(
            '/download',
            downloadRequest
          );
          subtitleUrl = response.data.link;
        } else {
          throw new Error('Token not available for download');
        }
      } else {
        subtitleUrl = url;
      }

      const subtitleContent = await this.downloadAndProcessSubtitle(subtitleUrl);
      this.downloadCache.set(url, subtitleContent);
      
      return subtitleContent;
    } catch (error) {
      console.error('Error downloading subtitle:', error);
      throw error;
    }
  }

  private async downloadAndProcessSubtitle(url: string): Promise<string> {
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });

    let subtitleContent: string;
    if (url.endsWith('.gz')) {
      const decompressed = pako.inflate(new Uint8Array(response.data), { to: 'string' });
      subtitleContent = decompressed;
    } else {
      subtitleContent = new TextDecoder().decode(response.data);
    }

    if (!subtitleContent.startsWith('WEBVTT')) {
      subtitleContent = this.convertToVTT(subtitleContent);
    }

    const subtitleBlob = new Blob([subtitleContent], { type: 'text/vtt' });
    return URL.createObjectURL(subtitleBlob);
  }

  private convertToVTT(srtContent: string): string {
    return 'WEBVTT\n\n' + 
      srtContent
        .replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, '$1:$2:$3.$4')
        .replace(/^\d+\s*$/gm, '');
  }

  // Método para limpiar la caché si es necesario
  clearCache(): void {
    this.subtitleCache.clear();
    this.downloadCache.clear();
  }
}

export default new OpenSubtitlesService();