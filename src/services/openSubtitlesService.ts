
import axios, { AxiosInstance } from 'axios';
import pako from 'pako';

const API_URL = 'https://mprxy.fly.dev/?destination=https%3A%2F%2Frest.opensubtitles.org';

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
      console.log(URL.createObjectURL(subtitleBlob))
      console.log("URL.createObjectURL(subtitleBlob)")
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