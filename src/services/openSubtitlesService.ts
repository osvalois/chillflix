
import axios, { AxiosInstance } from 'axios';
import pako from 'pako';
import { Subtitle } from '../types';

const API_URL = 'https://mprxy.fly.dev/?destination=https%3A%2F%2Frest.opensubtitles.org';
class OpenSubtitlesService {
    private axiosInstance: AxiosInstance;

    constructor() {
      this.axiosInstance = axios.create({
        headers: {
          'x-user-agent': 'VLSub 0.10.2'
        }
      });
    }
    
  async searchSubtitles(imdbId: string): Promise<Subtitle[]> {
    try {
        const response = await this.axiosInstance.get(`${API_URL}/search/imdbid-${imdbId}`);
        return response.data;  
    } catch (error) {
      console.error('Error searching for subtitles:', error);
      throw error;
    }
  }

  async downloadSubtitle(downloadLink: string): Promise<string> {
    try {
      const response = await axios.get(downloadLink, {
        responseType: 'arraybuffer'
      });
     
      // Descomprimir el contenido si es un archivo .gz
      let subtitleContent: string;
      if (downloadLink.endsWith('.gz')) {
        const decompressed = pako.inflate(new Uint8Array(response.data), { to: 'string' });
        subtitleContent = decompressed;
      } else {
        subtitleContent = new TextDecoder().decode(response.data);
      }

      // Convertir el contenido a formato VTT si es necesario
      if (!subtitleContent.startsWith('WEBVTT')) {
        subtitleContent = this.convertToVTT(subtitleContent);
      }
      // Crear un Blob con el contenido del subtítulo
      const subtitleBlob = new Blob([subtitleContent], { type: 'text/vtt' });
      return URL.createObjectURL(subtitleBlob);
    } catch (error) {
      console.error('Error downloading subtitle:', error);
      throw error;
    }
  }

  private convertToVTT(srtContent: string): string {
    // Convertir de SRT a VTT
    const vttContent = 'WEBVTT\n\n' + srtContent.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
    return vttContent;
  }
}

export default new OpenSubtitlesService();