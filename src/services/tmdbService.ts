import axios from 'axios';
import { UserPreferences, RecommendationParams, Genre, ContentType, CombinedContent, SearchResult, MovieCredits, MovieReviewsResponse, Review, TMDBMovie, TMDBTVSeries } from '../types';

const TMDB_API_KEY = '466fcb69c820905983bdd53d3a80a842';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const ENABLE_CONTENT_FILTERING = true;

export type TMDBContent = TMDBMovie | TMDBTVSeries;

const axiosInstance = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

const filterContent = (content: string | undefined | null): string => {
  if (!ENABLE_CONTENT_FILTERING || !content) return content || '';
  const wordsToFilter = ['violence', 'gore', 'explicit'];
  return content.split(' ').map(word => 
    wordsToFilter.includes(word.toLowerCase()) ? '****' : word
  ).join(' ');
};

const calculateSimilarity = (str1: string, str2: string): number => {
  const set1 = new Set(str1.toLowerCase().split(' '));
  const set2 = new Set(str2.toLowerCase().split(' '));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  return intersection.size / Math.max(set1.size, set2.size);
};

const mapToSearchResult = (item: TMDBContent): SearchResult => ({
  id: item.id,
  title: 'title' in item ? item.title : item.name,
  overview: filterContent(item.overview),
  poster_path: item.poster_path ?? null,
  backdrop_path: item.backdrop_path ?? null,
  vote_average: item.vote_average ?? 0,
  vote_count: item.vote_count ?? 0,
  popularity: item.popularity ?? 0,
  release_date: 'release_date' in item ? item.release_date : item.first_air_date,
  original_language: item.original_language ?? "en",
  genre_ids: Array.isArray(item.genre_ids) ? item.genre_ids : [],
  type: 'title' in item ? ContentType.Movie : ContentType.TVSeries,
  media_type: 'title' in item ? 'movie' : 'tv',
  homepage: '', // Add a default value for homepage
  genres: [], // Add a default value for genres
  videos: { results: [] }, // Add a default value for videos
  primary_color: ''
});

  /**
   * Mapea un objeto TMDBContent a un objeto CombinedContent.
   * 
   * Añade propiedades adicionales:
   * - overview: el overview pasado por la función filterContent.
   * - type: el tipo de contenido (ContentType.Movie o ContentType.TVSeries).
   * - year: el año de lanzamiento del contenido.
   * - title: el título del contenido.
   * - primary_color: un color generado aleatoriamente.
   * - media_type: el tipo de contenido (movie o tv).
   * 
   * @param {TMDBContent} item objeto TMDBContent a mapear.
   * @returns {CombinedContent} objeto CombinedContent resultante.
   */
const mapToCombinedContent = (item: TMDBContent): CombinedContent => {
  const releaseDate = 'release_date' in item ? item.release_date : item.first_air_date;
  const title = 'title' in item ? item.title : item.name;
  
  return {
    adult: '',
    ...item,
    overview: filterContent(item.overview),
    type: 'title' in item ? ContentType.Movie : ContentType.TVSeries,
    year: new Date(releaseDate).getFullYear(),
    title: title,
    primary_color: generatePrimaryColor(), // Función auxiliar para generar un color
    media_type: 'title' in item ? 'movie' : 'tv',
    genre_ids: item.genre_ids || [], // Add a default value of an empty array
  };
};
const generatePrimaryColor = (): string => {
  const colors = ['#1a237e', '#311b92', '#4a148c', '#006064', '#004d40'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const handleAxiosError = (error: any): never => {
  if (axios.isAxiosError(error)) {
    console.error('Axios error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.status_message || 'An error occurred while fetching data');
  }
  console.error('Unexpected error:', error);
  throw error;
};

export const getMovieReviews = async (movieId: string, page: number = 1): Promise<MovieReviewsResponse> => {
  try {
    const response = await axiosInstance.get<MovieReviewsResponse>(`/movie/${movieId}/reviews`, {
      params: { page },
    });

    const enhancedResults: Review[] = response.data.results.map(review => ({
      ...review,
      content: filterContent(review.content),
      likes: Math.floor(Math.random() * 100),
      dislikes: Math.floor(Math.random() * 50),
    }));

    return {
      ...response.data,
      results: enhancedResults,
    };
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const searchTMDBMovies = async (query: string, page: number = 1): Promise<SearchResult[]> => {
  try {
    const response = await axiosInstance.get('/search/movie', {
      params: { query, page },
    });
    return response.data.results.map(mapToSearchResult);
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const searchTMDBTVSeries = async (query: string, page: number = 1): Promise<SearchResult[]> => {
  try {
    const response = await axiosInstance.get('/search/tv', {
      params: { query, page },
    });
    return response.data.results.map(mapToSearchResult);
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const searchTMDBContent = async (
  query: string, 
  page: number = 1, 
  contentType: ContentType | 'both' = 'both'
): Promise<SearchResult[]> => {
  try {
    let results: SearchResult[] = [];

    if (contentType === 'both' || contentType === ContentType.Movie) {
      const movieResults = await searchTMDBMovies(query, page);
      results = [...results, ...movieResults];
    }

    if (contentType === 'both' || contentType === ContentType.TVSeries) {
      const tvResults = await searchTMDBTVSeries(query, page);
      results = [...results, ...tvResults];
    }

    return results;
  } catch (error) {
    return handleAxiosError(error);
  }
};

const searchCache: { [key: string]: { timestamp: number; results: SearchResult[] } } = {};

export const fetchSearchSuggestions = async (inputValue: string): Promise<SearchResult[]> => {
  if (inputValue.length < 2) {
    return [];
  }

  const cacheKey = inputValue.toLowerCase();
  const cachedResult = searchCache[cacheKey];
  if (cachedResult && Date.now() - cachedResult.timestamp < 5 * 60 * 1000) {
    return cachedResult.results;
  }

  try {
    const results = await searchTMDBContent(inputValue, 1, 'both');
    
    const sortedResults = results.sort((a, b) => {
      if (a.title.toLowerCase() === inputValue.toLowerCase()) return -1;
      if (b.title.toLowerCase() === inputValue.toLowerCase()) return 1;
      if (a.title.toLowerCase().startsWith(inputValue.toLowerCase())) return -1;
      if (b.title.toLowerCase().startsWith(inputValue.toLowerCase())) return 1;
      const aPopularity = (a.vote_average * a.vote_count) || 0;
      const bPopularity = (b.vote_average * b.vote_count) || 0;
      return bPopularity - aPopularity;
    });

    const diverseResults = [];
    const movieResults = sortedResults.filter(item => item.type === ContentType.Movie);
    const tvResults = sortedResults.filter(item => item.type === ContentType.TVSeries);

    for (let i = 0; i < 5; i++) {
      if (i % 2 === 0 && movieResults.length > 0) {
        diverseResults.push(movieResults.shift()!);
      } else if (tvResults.length > 0) {
        diverseResults.push(tvResults.shift()!);
      } else if (movieResults.length > 0) {
        diverseResults.push(movieResults.shift()!);
      } else if (tvResults.length > 0) {
        diverseResults.push(tvResults.shift()!);
      }
    }

    searchCache[cacheKey] = { timestamp: Date.now(), results: diverseResults };

    return diverseResults;
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return [];
  }
};

export const clearOldCacheEntries = () => {
  const now = Date.now();
  Object.keys(searchCache).forEach(key => {
    if (now - searchCache[key].timestamp > 30 * 60 * 1000) {
      delete searchCache[key];
    }
  });
};

setInterval(clearOldCacheEntries, 5 * 60 * 1000);

export const getTrendingContent = async (): Promise<CombinedContent[]> => {
  try {
    const response = await axiosInstance.get('/trending/all/week');
    if (!response.data || !Array.isArray(response.data.results)) {
      console.error('Unexpected response format from getTrendingContent:', response.data);
      return [];
    }
    return response.data.results.map(mapToCombinedContent);
  } catch (error) {
    console.error('Error in getTrendingContent:', error);
    return handleAxiosError(error);
  }
};
export const searchAllContent = async (query: string, page: number = 1): Promise<CombinedContent[]> => {
  try {
    const response = await axiosInstance.get('/search/multi', {
      params: { query, page },
    });
    return response.data.results
      .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
      .map(mapToCombinedContent);
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getGenres = async (): Promise<Genre[]> => {
  try {
    const response = await axiosInstance.get('/genre/movie/list');
    return response.data.genres.filter((genre: Genre) => genre && genre.id && genre.name);
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getTopRated = async (page: number = 1): Promise<CombinedContent[]> => {
  try {
    const response = await axiosInstance.get('/movie/top_rated', {
      params: { page },
    });
    return response.data.results.map(mapToCombinedContent);
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getUpcoming = async (page: number = 1): Promise<CombinedContent[]> => {
  try {
    const response = await axiosInstance.get('/movie/upcoming', {
      params: { page },
    });
    return response.data.results.map(mapToCombinedContent);
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getUserPreferences = async (): Promise<UserPreferences> => {
  // Mock data for now
  return {
    favoriteGenres: [28, 12, 16],
    favoriteActors: [500, 287, 1245],
    watchHistory: [550, 238, 680],
    ratings: { 550: 5, 238: 4, 680: 3 },
  };
};

export const getRecommendationsMovies = async (): Promise<CombinedContent[]> => {
  try {
    const response = await axiosInstance.get('/movie/popular');
    return response.data.results.map(mapToCombinedContent);
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getRecommendations = async (params: RecommendationParams): Promise<CombinedContent[]> => {
  try {
    const response = await axiosInstance.get('/movie/popular');
    const popularMovies = response.data.results.map(mapToCombinedContent);
    const recommendations = popularMovies.filter((movie: CombinedContent) => 
      movie.genre_ids && movie.genre_ids.some((genreId: number) => params.preferences.favoriteGenres.includes(genreId))
    );
    return recommendations.slice(0, params.limit || 10);
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getTMDBMovieDetails = async (tmdbId: number): Promise<CombinedContent> => {
  try {
    const response = await axiosInstance.get(`/movie/${tmdbId}`, {
      params: { append_to_response: 'videos' },
    });
    return mapToCombinedContent({ ...response.data, media_type: 'movie' });
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getTMDBTVSeriesDetails = async (tmdbId: number): Promise<CombinedContent> => {
  try {
    const response = await axiosInstance.get(`/tv/${tmdbId}`, {
      params: { append_to_response: 'videos' },
    });
    return mapToCombinedContent({ ...response.data, media_type: 'tv' });
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getMovieCredits = async (tmdbId: number): Promise<MovieCredits> => {
  try {
    const response = await axiosInstance.get(`/movie/${tmdbId}/credits`);
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getSimilarMovies = async (tmdbId: number): Promise<CombinedContent[]> => {
  try {
    const movieDetails = await getTMDBMovieDetails(tmdbId);
    const response = await axiosInstance.get(`/movie/${tmdbId}/recommendations`, {
      params: { language: 'en-US' },
    });
    
    const similarMovies = response.data.results.map(mapToCombinedContent);
    
    return similarMovies.sort((a: { overview: string; }, b: { overview: string; }) => {
      const similarityA = calculateSimilarity(movieDetails.overview ?? '', a.overview);
      const similarityB = calculateSimilarity(movieDetails.overview ?? '', b.overview);
      return similarityB - similarityA;
    });
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getMoviesByGenre = async (genreId: number, page: number = 1): Promise<CombinedContent[]> => {
  try {
    const response = await axiosInstance.get('/discover/movie', {
      params: { with_genres: genreId, page },
    });
    return response.data.results.map(mapToCombinedContent);
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getPopularActors = async (page: number = 1): Promise<any[]> => {
  try {
    const response = await axiosInstance.get('/person/popular', {
      params: { page },
    });
    return response.data.results;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getActorDetails = async (actorId: number): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/person/${actorId}`, {
      params: { append_to_response: 'movie_credits,tv_credits' },
    });
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};
export const getPersonalizedRecommendations = async (userId: string): Promise<CombinedContent[]> => {
  try {
    const userPreferences = await getUserPreferences();
    const recommendationParams: RecommendationParams = {
      preferences: userPreferences,
      limit: 20,
      userId: userId
    };
    const recommendations = await getRecommendations(recommendationParams);
    
    return recommendations.filter(movie => 
      !userPreferences.watchHistory.includes(movie.id)
    );
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    return [];
  }
};

const tmdbService = {
  searchTMDBMovies,
  searchTMDBTVSeries,
  getTMDBMovieDetails,
  getTMDBTVSeriesDetails,
  searchTMDBContent,
  fetchSearchSuggestions,
  getTrendingContent,
  searchAllContent,
  getGenres,
  getTopRated,
  getUpcoming,
  getUserPreferences,
  getRecommendations,
  getMovieCredits,
  getSimilarMovies,
  getMovieReviews,
  getRecommendationsMovies,
  getMoviesByGenre,
  getPopularActors,
  getActorDetails,
  getPersonalizedRecommendations,
};

export default tmdbService;