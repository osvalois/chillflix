// Tipos existentes
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
  
  // Nuevos tipos para la API v1
  export interface SubtitleAPIV1 {
    id: string;
    type: string;
    attributes: {
      subtitle_id: string;
      language: string;
      download_count: number;
      new_download_count: number;
      hearing_impaired: boolean;
      hd: boolean;
      fps: number;
      votes: number;
      points: number;
      ratings: number;
      from_trusted: boolean;
      foreign_parts_only: boolean;
      ai_translated: boolean;
      machine_translated: boolean;
      upload_date: string;
      release: string;
      comments: string;
      legacy_subtitle_id: number;
      uploader: {
        uploader_id: number;
        name: string;
        rank: string;
      };
      feature_details: {
        feature_id: number;
        feature_type: string;
        year: number;
        title: string;
        movie_name: string;
        imdb_id: number;
        tmdb_id: number;
      };
      url: string;
      files: Array<{
        file_id: number;
        cd_number: number;
        file_name: string;
      }>;
    };
  }
  
  export interface SearchResponseV1 {
    data: SubtitleAPIV1[];
    total_pages: number;
    total_count: number;
    page: number;
  }
  
  export interface DownloadRequestV1 {
    file_id: number;
    sub_format?: string;
    file_name?: string;
  }
  
  export interface DownloadResponseV1 {
    link: string;
    file_name: string;
    requests: number;
    remaining: number;
    message: string;
    reset_time: string;
    reset_time_utc: string;
  }