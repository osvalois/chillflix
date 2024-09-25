import axios, { AxiosInstance } from 'axios';

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
          responseType: 'blob'
        });
        return URL.createObjectURL(response.data);
      } catch (error) {
        console.error('Error downloading subtitle:', error);
        throw error;
      }
    }
  }
  
  export default new OpenSubtitlesService();