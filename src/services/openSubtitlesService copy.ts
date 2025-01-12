import axios, { AxiosInstance } from 'axios';
import pako from 'pako';
import { Subtitle, SearchResponseV1, DownloadRequestV1, DownloadResponseV1 } from './subtitle-types';
import { SubtitleAdapter } from './subtitle-adapter';

class OpenSubtitlesService {
  private axiosInstance: AxiosInstance;
  private apiKey: string;
  private token: string | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.axiosInstance = axios.create({
      baseURL: 'https://api.opensubtitles.com/api/v1',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': this.apiKey,
        'User-Agent': 'MyApp v1.0'
      }
    });
  }

  async login(username: string, password: string): Promise<void> {
    try {
      const response = await this.axiosInstance.post('/login', { username, password });
      this.token = response.data.token;
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async searchSubtitles(imdbId: string): Promise<Subtitle[]> {
    console.log(imdbId)
    console.log("searchSubtitles")
    try {
      const response = await this.axiosInstance.get<SearchResponseV1>('/subtitles', {
        params: {
          imdb_id: imdbId.replace('tt', ''),
          languages: 'all'
        }
      });

      // Convertir la respuesta de la API v1 al formato legacy
      return response.data.data.map(subtitle => SubtitleAdapter.toLegacySubtitle(subtitle));
    } catch (error) {
      console.error('Error searching for subtitles:', error);
      throw error;
    }
  }

  async downloadSubtitle(downloadLink: string): Promise<string> {
    try {
      let fileId: number;
      
      // Extraer file_id del downloadLink si es posible
      const match = downloadLink.match(/file_id=(\d+)/);
      if (match) {
        fileId = parseInt(match[1]);
      } else {
        // Si no podemos extraer el file_id, usar el endpoint legacy
        return this.downloadSubtitleLegacy(downloadLink);
      }

      // Obtener el link de descarga usando la nueva API
      const downloadRequest: DownloadRequestV1 = {
        file_id: fileId
      };

      const response = await this.axiosInstance.post<DownloadResponseV1>(
        '/download',
        downloadRequest
      );

      // Descargar el archivo de subtítulos
      return await this.processSubtitleFile(response.data.link);
    } catch (error) {
      console.error('Error downloading subtitle:', error);
      // Fallback al método legacy si hay error
      return this.downloadSubtitleLegacy(downloadLink);
    }
  }

  private async downloadSubtitleLegacy(downloadLink: string): Promise<string> {
    const response = await axios.get(downloadLink, {
      responseType: 'arraybuffer'
    });

    return await this.processSubtitleFile(downloadLink, response.data);
  }

  private async processSubtitleFile(url: string, data?: ArrayBuffer): Promise<string> {
    if (!data) {
      const response = await axios.get(url, {
        responseType: 'arraybuffer'
      });
      data = response.data;
    }

    let subtitleContent: string;
    if (url.endsWith('.gz')) {
      const decompressed = pako.inflate(new Uint8Array(data!), { to: 'string' });
      subtitleContent = decompressed;
    } else {
      subtitleContent = new TextDecoder().decode(data);
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

  logout(): void {
    this.token = null;
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }
}

// Exportar una instancia única del servicio
export default new OpenSubtitlesService(process.env.OPENSUBTITLES_API_KEY || '');