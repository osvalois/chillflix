import axios, { AxiosInstance } from 'axios';
import pako from 'pako';
import { Subtitle, SearchResponseV1, DownloadRequestV1, DownloadResponseV1 } from './subtitle-types';
import { SubtitleAdapter } from './subtitle-adapter';

class OpenSubtitlesService {
  private axiosInstance: AxiosInstance;
  private apiKey: string;
  private subtitleCache: Map<string, Subtitle[]> = new Map();
  private downloadCache: Map<string, string> = new Map();
  private pendingRequests: Map<string, Promise<Subtitle[]>> = new Map();
  private lastRequestTime: number = 0;
  private readonly REQUEST_DELAY = 1000;

  constructor() {
    this.apiKey = 'cnDJOg4tBN1Ir7VDsPmGFLSLkGVk4P8z';
    this.axiosInstance = axios.create({
      baseURL: 'https://chillflix-subtitles-service-production.up.railway.app/api/v1',
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
    const cachedSubtitles = this.subtitleCache.get(imdbId);
    if (cachedSubtitles) {
      return cachedSubtitles;
    }

    const pendingRequest = this.pendingRequests.get(imdbId);
    if (pendingRequest) {
      return pendingRequest;
    }

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

      return response.data.data.map(subtitle => 
        SubtitleAdapter.toLegacySubtitle(subtitle)
      );
    } catch (error) {
      console.error('Error searching for subtitles:', error);
      return [];
    }
  }

  async downloadSubtitle(fileId: string): Promise<string> {
    const cachedDownload = this.downloadCache.get(fileId);
    if (cachedDownload) {
      return cachedDownload;
    }

    try {
      await this.throttleRequest();
      
      // Extraer el ID numérico del fileId (eliminar el prefijo 'file_')
      const numericFileId = parseInt(fileId.replace('file_', ''));
      
      // Preparar la solicitud de descarga
      const downloadRequest: DownloadRequestV1 = {
        file_id: numericFileId,
        sub_format: 'srt'
      };

      // Obtener el enlace de descarga
      const downloadResponse = await this.axiosInstance.post<DownloadResponseV1>(
        '/subtitles/download',
        downloadRequest
      );

      // Descargar y procesar el subtítulo
      const subtitleContent = await this.downloadAndProcessSubtitle(downloadResponse.data.link);
      this.downloadCache.set(fileId, subtitleContent);
      
      return subtitleContent;
    } catch (error) {
      console.error('Error downloading subtitle:', error);
      throw error;
    }
  }

  private async downloadAndProcessSubtitle(url: string): Promise<string> {
    try {
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
    } catch (error) {
      console.error('Error processing subtitle:', error);
      throw new Error('Failed to process subtitle file');
    }
  }

  private convertToVTT(srtContent: string): string {
    return 'WEBVTT\n\n' + 
      srtContent
        .replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, '$1:$2:$3.$4')
        .replace(/^\d+\s*$/gm, '');
  }

  clearCache(): void {
    this.subtitleCache.clear();
    this.downloadCache.clear();
  }
}

export default new OpenSubtitlesService();